import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db, vaultsTable, vaultBookmarksTable, subscribersTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, or, sql, gte, count, inArray } from "drizzle-orm";
import { isAdmin } from "../middleware/auth";
import { getAuth, createClerkClient } from "@clerk/express";

const numericId = z.coerce.number().int().positive();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const router = Router();

async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) return next();
  try {
    const clerkUser = await clerk.users.getUser(userId);
    req.user = {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    };
  } catch {
    // ignore auth errors for optional middleware
  }
  next();
}

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const clerkUser = await clerk.users.getUser(userId);
    req.user = {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    };
    next();
  } catch {
    res.status(401).json({ error: "Authentication required" });
  }
}

function toVaultDTO(v: typeof vaultsTable.$inferSelect) {
  const scores = (v.scores as any) ?? (v.scoresJson as any) ?? { opportunity: 0, problem: 0, feasibility: 0, whyNow: 0, overall: 0 };
  return {
    ...v,
    id: String(v.id),
    daysActive: v.daysActive ?? (v.publishedAt
      ? Math.floor((Date.now() - new Date(v.publishedAt).getTime()) / 86_400_000)
      : 0),
    scores,
    sourceAttribution: (v.sourceAttribution as any[]) ?? [],
    signalsSummary: (v.signalsJson as any) ?? { reddit: [], youtube: [], hn: [], ph: [], linkedin: [], twitter: [] },
    signalsCount: v.signalsCount ?? 0,
    momentum: v.momentum ?? 0,
    tags: v.tags ?? [],
    tagline: v.tagline ?? "",
    tier: v.tier ?? "free",
    problemStatement: v.problemStatement ?? v.description ?? "",
    marketSize: v.marketSize ?? "",
    tam: v.tam ?? "",
  };
}

async function getUserTier(email: string): Promise<string> {
  const [subscriber] = await db
    .select({ tier: subscribersTable.tier })
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);
  return subscriber?.tier ?? "free";
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
    return res.json({ vaults: rows.map((r) => toVaultDTO(r.vault)) });
  } catch {
    return res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// GET /vaults/compare — MUST be before /:id
router.get("/compare", optionalAuth, async (req, res) => {
  try {
    const rawIds = ((req.query.ids as string) || "").split(",").filter(Boolean).slice(0, 3);
    const ids = rawIds.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n) && n > 0);
    if (ids.length === 0) return res.status(400).json({ error: "ids query param required (comma-separated integers)" });

    let userTier = "free";
    if (req.user?.email) userTier = await getUserTier(req.user.email);

    const vaults = await db
      .select()
      .from(vaultsTable)
      .where(and(eq(vaultsTable.isPublished, true), inArray(vaultsTable.id, ids)));

    const result = vaults.map((v) => {
      const isLocked = (v.tier === "pro" || v.tier === "max") && userTier === "free";
      if (isLocked) {
        return { id: String(v.id), title: v.title, tier: v.tier, locked: true };
      }
      return { ...toVaultDTO(v), locked: false };
    });

    return res.json({ vaults: result, userTier });
  } catch (error) {
    console.error("DB Error in /api/vaults/compare:", error);
    return res.status(500).json({ error: "Failed to compare vaults" });
  }
});

// GET /vaults — paginated list with filters
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 12));
    const q = req.query.q as string | undefined;
    const tierFilter = req.query.tier as string | undefined;
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string) : undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const order = (req.query.order as string) === "asc" ? "asc" : "desc";
    const sortBy = req.query.sort as string | undefined;
    const categoryFilter = req.query.category as string | undefined;

    const conditions: any[] = [eq(vaultsTable.isPublished, true)];

    if (q) {
      conditions.push(
        or(
          ilike(vaultsTable.title, `%${q}%`),
          ilike(vaultsTable.description as any, `%${q}%`)
        ) as any
      );
    }

    if (tierFilter && tierFilter !== "all") {
      conditions.push(eq(vaultsTable.tier as any, tierFilter));
    }

    if (minScore !== undefined && !isNaN(minScore)) {
      conditions.push(sql`(${vaultsTable.scores}->>'overall')::int >= ${minScore}`);
    }

    if (dateFrom) {
      conditions.push(gte(vaultsTable.publishedAt as any, new Date(dateFrom)));
    }

    if (categoryFilter) {
      conditions.push(sql`${categoryFilter} = ANY(${vaultsTable.tags})`);
    }

    const where = and(...conditions);
    const offset = (page - 1) * pageSize;

    let orderExpr: any;
    if (sortBy === "score") {
      orderExpr = order === "asc"
        ? asc(sql`(${vaultsTable.scores}->>'overall')::int`)
        : desc(sql`(${vaultsTable.scores}->>'overall')::int`);
    } else if (sortBy === "momentum") {
      orderExpr = order === "asc" ? asc(vaultsTable.momentum) : desc(vaultsTable.momentum);
    } else if (sortBy === "signals") {
      orderExpr = order === "asc" ? asc(vaultsTable.signalsCount) : desc(vaultsTable.signalsCount);
    } else {
      orderExpr = order === "asc" ? asc(vaultsTable.publishedAt) : desc(vaultsTable.publishedAt);
    }

    const [allVaults, countRows] = await Promise.all([
      db.select().from(vaultsTable).where(where).orderBy(orderExpr).limit(pageSize).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(vaultsTable).where(where),
    ]);

    const total = countRows[0]?.total ?? 0;
    const hasMore = offset + allVaults.length < total;

    return res.json({ vaults: allVaults.map(toVaultDTO), total, page, pageSize, hasMore });
  } catch (error) {
    console.error("DB Error in /api/vaults:", error);
    return res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

// GET /vaults/:id — full vault detail
router.get("/:id", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });

  const { userId } = getAuth(req);

  try {
    const [vault] = await db.select().from(vaultsTable).where(eq(vaultsTable.id, parsed.data)).limit(1);
    if (!vault) return res.status(404).json({ error: "Vault not found" });

    let isBookmarked = false;
    let bookmarkCountVal = 0;

    if (userId) {
      const [bm] = await db
        .select()
        .from(vaultBookmarksTable)
        .where(and(eq(vaultBookmarksTable.userId, userId), eq(vaultBookmarksTable.vaultId, parsed.data)))
        .limit(1);
      isBookmarked = !!bm;
    }

    const [bookmarkCountRow] = await db
      .select({ c: count() })
      .from(vaultBookmarksTable)
      .where(eq(vaultBookmarksTable.vaultId, parsed.data));
    bookmarkCountVal = bookmarkCountRow?.c ?? 0;

    const related = await db
      .select()
      .from(vaultsTable)
      .where(and(eq(vaultsTable.isPublished, true), sql`${vaultsTable.id} != ${parsed.data}`))
      .orderBy(desc(vaultsTable.publishedAt))
      .limit(3);

    return res.json({
      vault: { ...toVaultDTO(vault), bookmarkCount: bookmarkCountVal, isBookmarked },
      relatedVaults: related.map(toVaultDTO),
      userFeedback: userId ? { liked: false, shared: false, saved: isBookmarked } : undefined,
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

// POST /vaults/:id/feedback — record like/save/share
router.post("/:id/feedback", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  const { action, value } = req.body as { action: string; value: boolean };
  if (!["like", "save", "share"].includes(action)) return res.status(400).json({ error: "Invalid action" });
  return res.json({ ok: true, action, value });
});

// POST /vaults/:id/publish — admin only
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
    return res.json(toVaultDTO(updated));
  } catch (error) {
    return res.status(500).json({ error: "Failed to publish vault" });
  }
});

export default router;
