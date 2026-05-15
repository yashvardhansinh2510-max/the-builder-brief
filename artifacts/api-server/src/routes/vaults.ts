import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db, vaultsTable, vaultBookmarksTable, subscribersTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, or, sql, gte, count } from "drizzle-orm";
import { isAdmin } from "../middleware/auth";
import { getAuth, createClerkClient } from "@clerk/express";

const numericId = z.coerce.number().int().positive();
const router = Router();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 3 };

function canAccessTier(userTier: string, vaultTier: string): boolean {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[vaultTier ?? "free"] ?? 0);
}

function toVaultShape(row: any, bookmarkCount = 0, isBookmarked = false) {
  return {
    id: String(row.id),
    title: row.title,
    tagline: row.tagline ?? "",
    problemStatement: row.problemStatement ?? row.problem_statement ?? "",
    description: row.description ?? undefined,
    marketSize: row.marketSize ?? row.market_size ?? undefined,
    tam: row.tam ?? undefined,
    unitEconomics: row.unitEconomics ?? row.unit_economics ?? undefined,
    keywordsTrending: row.keywordsTrending ?? row.keywords_trending ?? [],
    tags: row.tags ?? [],
    scores: (row.scoresJson ?? row.scores_json) ?? { opportunity: 0, problem: 0, feasibility: 0, whyNow: 0, overall: 0 },
    signalsCount: row.signalsCount ?? row.signals_count ?? 0,
    signalsSummary: ((row.signalsJson ?? row.signals_json) as any)?.summary ?? { reddit: [], youtube: [], hn: [], ph: [], linkedin: [], twitter: [] },
    sourceAttribution: ((row.signalsJson ?? row.signals_json) as any)?.sourceAttribution ?? [],
    daysActive: row.daysActive ?? row.days_active ?? 0,
    momentum: row.momentum ?? 0,
    publishedAt: row.publishedAt ?? row.published_at ?? undefined,
    verificationData: (row.verificationJson ?? row.verification_json) ?? undefined,
    tier: (row.tier ?? "free") as "free" | "pro" | "max",
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
    bookmarkCount,
    isBookmarked,
  };
}

function toPreviewStub(row: any) {
  return {
    id: String(row.id),
    title: row.title,
    tagline: row.tagline ?? "",
    tier: row.tier ?? "free",
    isLocked: true,
    scores: null,
    signalsCount: 0,
    signalsSummary: null,
    momentum: 0,
    daysActive: 0,
    publishedAt: row.publishedAt ?? row.published_at ?? undefined,
  };
}

async function resolveUser(req: Request): Promise<{ id: string; email: string; tier: string } | null> {
  const { userId } = getAuth(req);
  if (!userId) return null;
  try {
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const [sub] = await db
      .select({ tier: subscribersTable.tier })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);
    return { id: userId, email, tier: sub?.tier ?? "free" };
  } catch {
    return null;
  }
}

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.user = { id: user.id, email: user.email };
  (req as any).userTier = user.tier;
  next();
}

// GET /vaults/tags — unique tag values across all published vaults
router.get("/tags", async (_req, res) => {
  try {
    const rows = await db.execute(
      sql`SELECT DISTINCT unnest(tags) AS tag FROM vaults WHERE is_published = true AND tags IS NOT NULL ORDER BY tag`
    );
    return res.json((rows.rows as any[]).map((r) => r.tag).filter(Boolean));
  } catch {
    return res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// GET /vaults/bookmarks — all bookmarked vaults for authenticated user
router.get("/bookmarks", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  try {
    const rows = await db
      .select({ vault: vaultsTable })
      .from(vaultBookmarksTable)
      .innerJoin(vaultsTable, eq(vaultBookmarksTable.vaultId, vaultsTable.id))
      .where(eq(vaultBookmarksTable.userId, userId));
    return res.json({ vaults: rows.map((r) => toVaultShape(r.vault)) });
  } catch {
    return res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// GET /vaults — paginated list with filters
router.get("/", async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userTier = user?.tier ?? "free";

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 12));
    const q = req.query.q as string | undefined;
    const tierFilter = req.query.tier as string | undefined;
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string) : undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const sortParam = (req.query.sort as string) || "recent";
    const order = (req.query.order as string) === "asc" ? "asc" : "desc";
    const categoryFilter = req.query.category as string | undefined;

    const conditions: any[] = [eq(vaultsTable.isPublished, true)];

    if (q) {
      conditions.push(
        or(
          ilike(vaultsTable.title, `%${q}%`),
          ilike(vaultsTable.tagline as any, `%${q}%`),
          ilike(vaultsTable.problemStatement as any, `%${q}%`),
        ) as any,
      );
    }

    if (tierFilter && tierFilter !== "all") {
      conditions.push(eq(vaultsTable.tier as any, tierFilter));
    }

    if (minScore !== undefined && !isNaN(minScore)) {
      conditions.push(sql`(${vaultsTable.scoresJson}->>'overall')::int >= ${minScore}`);
    }

    if (dateFrom) {
      conditions.push(gte(vaultsTable.publishedAt as any, new Date(dateFrom)));
    }

    if (categoryFilter) {
      conditions.push(sql`${categoryFilter} = ANY(${vaultsTable.tags})`);
    }

    const sortMap: Record<string, any> = {
      score: sql`(${vaultsTable.scoresJson}->>'overall')::int`,
      momentum: vaultsTable.momentum,
      recent: vaultsTable.publishedAt,
      signals: vaultsTable.signalsCount,
    };
    const sortCol = sortMap[sortParam] ?? vaultsTable.publishedAt;
    const orderFn = order === "asc" ? asc : desc;
    const offset = (page - 1) * pageSize;
    const where = and(...conditions);

    const [allVaults, countRows] = await Promise.all([
      db.select().from(vaultsTable).where(where).orderBy(orderFn(sortCol)).limit(pageSize).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(vaultsTable).where(where),
    ]);

    const total = countRows[0]?.total ?? 0;
    const hasMore = offset + allVaults.length < total;

    const vaults = allVaults.map((row) => {
      if (canAccessTier(userTier, row.tier ?? "free")) {
        return toVaultShape(row);
      }
      return toPreviewStub(row);
    });

    return res.json({ vaults, total, page, pageSize, hasMore });
  } catch (error) {
    console.error("DB Error in GET /api/vaults:", error);
    return res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

// GET /vaults/:id — full vault detail
router.get("/:id", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });

  const user = await resolveUser(req);

  try {
    const [row] = await db
      .select()
      .from(vaultsTable)
      .where(eq(vaultsTable.id, parsed.data))
      .limit(1);

    if (!row) return res.status(404).json({ error: "Vault not found" });

    let isBookmarked = false;
    if (user) {
      const [bm] = await db
        .select()
        .from(vaultBookmarksTable)
        .where(and(eq(vaultBookmarksTable.userId, user.id), eq(vaultBookmarksTable.vaultId, parsed.data)))
        .limit(1);
      isBookmarked = !!bm;
    }

    const [bookmarkCountRow] = await db
      .select({ c: count() })
      .from(vaultBookmarksTable)
      .where(eq(vaultBookmarksTable.vaultId, parsed.data));

    const related = await db
      .select()
      .from(vaultsTable)
      .where(and(eq(vaultsTable.isPublished, true), sql`${vaultsTable.id} != ${parsed.data}`))
      .orderBy(desc(vaultsTable.publishedAt))
      .limit(3);

    return res.json({
      vault: toVaultShape(row, bookmarkCountRow?.c ?? 0, isBookmarked),
      relatedVaults: related.map((r) => toVaultShape(r)),
      userFeedback: user ? { liked: false, shared: false, saved: isBookmarked } : undefined,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vault" });
  }
});

// POST /vaults/:id/bookmark — toggle bookmark (auth required)
router.post("/:id/bookmark", requireAuth, async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  const userId = req.user!.id;
  const vaultId = parsed.data;

  try {
    const [existing] = await db
      .select()
      .from(vaultBookmarksTable)
      .where(and(eq(vaultBookmarksTable.userId, userId), eq(vaultBookmarksTable.vaultId, vaultId)))
      .limit(1);

    if (existing) {
      await db
        .delete(vaultBookmarksTable)
        .where(and(eq(vaultBookmarksTable.userId, userId), eq(vaultBookmarksTable.vaultId, vaultId)));
      return res.json({ bookmarked: false });
    }

    await db.insert(vaultBookmarksTable).values({ userId, vaultId });
    return res.json({ bookmarked: true });
  } catch {
    return res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// POST /vaults/:id/feedback — record like/save/share (unchanged)
router.post("/:id/feedback", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  const { action, value } = req.body as { action: string; value: boolean };
  if (!["like", "save", "share"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }
  return res.json({ ok: true, action, value });
});

// POST /vaults/:id/publish — admin only (unchanged)
router.post("/:id/publish", isAdmin, async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  try {
    const [updated] = await db
      .update(vaultsTable)
      .set({ isPublished: true, publishedAt: new Date() })
      .where(eq(vaultsTable.id, parsed.data))
      .returning();
    if (!updated) return res.status(404).json({ error: "Vault not found" });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Failed to publish vault" });
  }
});

export default router;
