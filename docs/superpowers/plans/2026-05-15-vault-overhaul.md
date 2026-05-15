# Vault System Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the vault system from a minimal DB + stub API into a full ideabrowser-grade discovery product — rich DB schema, tier-gated API with bookmarks, redesigned VaultCard/Archive/Detail, and a weekly digest portal tab.

**Architecture:** Expand `vaultsTable` with all rich fields (scores, momentum, tier, signals as JSONB), add `vaultBookmarksTable`, update the Express API to sort/filter/preview-gate, then rebuild all four frontend surfaces (VaultCard, VaultArchive, VaultDetail, VaultTab) against the real data model.

**Tech Stack:** PostgreSQL + Drizzle ORM, Express 5, React + Vite, Tailwind CSS variables, framer-motion, wouter, lucide-react, Clerk (via `@clerk/express` on API, `@clerk/react` + custom `useAuth` on frontend).

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `lib/db/src/schema/vaults.ts` | Add 14 new columns to vaultsTable |
| Create | `lib/db/src/schema/vault-bookmarks.ts` | New vaultBookmarksTable |
| Modify | `lib/db/src/schema/index.ts` | Export vault-bookmarks |
| Create | `lib/db/scripts/manual-migrate-vault-overhaul.ts` | Raw SQL migration |
| Modify | `artifacts/api-server/src/routes/vaults.ts` | Full API rewrite |
| Modify | `artifacts/specflow-newsletter/src/lib/vault-types.ts` | Add isBookmarked, bookmarkCount fields |
| Modify | `artifacts/specflow-newsletter/src/hooks/useVaults.ts` | Add bookmarkVault, fetchBookmarkedVaults |
| Modify | `artifacts/specflow-newsletter/src/components/VaultCard.tsx` | Full redesign |
| Modify | `artifacts/specflow-newsletter/src/components/portal/VaultTab.tsx` | Weekly digest |
| Modify | `artifacts/specflow-newsletter/src/pages/vault-archive.tsx` | Full redesign |
| Modify | `artifacts/specflow-newsletter/src/pages/vault-detail.tsx` | Full redesign |

---

## Task 1: Expand vaultsTable schema

**Files:**
- Modify: `lib/db/src/schema/vaults.ts`

- [ ] **Step 1: Replace the file content**

```typescript
import { pgTable, text, serial, timestamp, date, integer, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaultsTable = pgTable("vaults", {
  id: serial("id").primaryKey(),
  vaultWeek: date("vault_week").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }),
  problemStatement: text("problem_statement"),
  description: text("description"),
  content: text("content").notNull(),
  tier: varchar("tier", { length: 10 }).default("free"),
  momentum: integer("momentum").default(0),
  daysActive: integer("days_active").default(0),
  signalsCount: integer("signals_count").default(0),
  marketSize: varchar("market_size", { length: 255 }),
  tam: varchar("tam", { length: 255 }),
  unitEconomics: text("unit_economics"),
  keywordsTrending: text("keywords_trending").array(),
  tags: text("tags").array(),
  scoresJson: jsonb("scores_json"),
  signalsJson: jsonb("signals_json"),
  verificationJson: jsonb("verification_json"),
  sourceArticleIds: integer("source_article_ids").array(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVaultSchema = createInsertSchema(vaultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type VaultRow = typeof vaultsTable.$inferSelect;
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/src/schema/vaults.ts
git commit -m "feat(db): expand vaultsTable with rich vault fields"
```

---

## Task 2: Create vaultBookmarksTable

**Files:**
- Create: `lib/db/src/schema/vault-bookmarks.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create the schema file**

```typescript
// lib/db/src/schema/vault-bookmarks.ts
import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { vaultsTable } from "./vaults";

export const vaultBookmarksTable = pgTable("vault_bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  vaultId: integer("vault_id").notNull().references(() => vaultsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userVaultUnique: unique().on(table.userId, table.vaultId),
}));
```

- [ ] **Step 2: Add export to schema index**

Add this line to `lib/db/src/schema/index.ts` after the `vaults` export:

```typescript
export * from "./vault-bookmarks";
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/src/schema/vault-bookmarks.ts lib/db/src/schema/index.ts
git commit -m "feat(db): add vaultBookmarksTable schema"
```

---

## Task 3: Migration script

**Files:**
- Create: `lib/db/scripts/manual-migrate-vault-overhaul.ts`

- [ ] **Step 1: Create the migration script**

```typescript
// lib/db/scripts/manual-migrate-vault-overhaul.ts
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const { Client } = pg;

const sql = `
ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(500),
  ADD COLUMN IF NOT EXISTS problem_statement TEXT,
  ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS momentum INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_active INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signals_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS market_size VARCHAR(255),
  ADD COLUMN IF NOT EXISTS tam VARCHAR(255),
  ADD COLUMN IF NOT EXISTS unit_economics TEXT,
  ADD COLUMN IF NOT EXISTS keywords_trending TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS scores_json JSONB,
  ADD COLUMN IF NOT EXISTS signals_json JSONB,
  ADD COLUMN IF NOT EXISTS verification_json JSONB;

CREATE TABLE IF NOT EXISTS vault_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  vault_id INTEGER NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, vault_id)
);
`;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ vault overhaul migration complete");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the migration**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
DATABASE_URL="<your-db-url>" npx tsx lib/db/scripts/manual-migrate-vault-overhaul.ts
```

Expected output: `✓ vault overhaul migration complete`

- [ ] **Step 3: Commit**

```bash
git add lib/db/scripts/manual-migrate-vault-overhaul.ts
git commit -m "feat(db): migration script for vault overhaul schema"
```

---

## Task 4: Rewrite the vaults API

**Files:**
- Modify: `artifacts/api-server/src/routes/vaults.ts`

This is a full replacement. The route order matters: `/tags` and `/bookmarks` must come before `/:id`.

- [ ] **Step 1: Replace the entire file**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief/artifacts/api-server"
npx tsc --noEmit
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/vaults.ts
git commit -m "feat(api): rewrite vaults routes — tier-gating, bookmarks, sort/filter"
```

---

## Task 5: Update frontend vault types

**Files:**
- Modify: `artifacts/specflow-newsletter/src/lib/vault-types.ts`

- [ ] **Step 1: Add new fields to Vault interface and VaultFilter**

Add `isLocked`, `isBookmarked`, `bookmarkCount` to `Vault`, and `category` + `pageSizeOverride` to `VaultFilter`. Replace the existing content:

```typescript
export interface VaultScore {
  opportunity: number;
  problem: number;
  feasibility: number;
  whyNow: number;
  overall: number;
}

export interface SignalsSummary {
  reddit: string[];
  youtube: string[];
  hn: string[];
  ph: string[];
  linkedin: string[];
  twitter: string[];
}

export interface SourceAttribution {
  source: 'reddit' | 'youtube' | 'hn' | 'ph' | 'linkedin' | 'twitter' | 'trends';
  url?: string;
  metric?: string;
  value?: string | number;
}

export interface VerificationStatus {
  marketSizeVerified: 'verified' | 'unconfirmed' | 'contradicted';
  tamVerified: 'verified' | 'unconfirmed' | 'contradicted';
  unitEconomicsVerified: 'verified' | 'unconfirmed' | 'contradicted';
  confidenceScore: number;
  issues: string[];
}

export interface Vault {
  id: string;
  title: string;
  tagline: string;
  problemStatement: string;
  description?: string;
  marketSize?: string;
  tam?: string;
  unitEconomics?: string;
  keywordsTrending?: string[];
  scores: VaultScore;
  signalsCount: number;
  signalsSummary: SignalsSummary;
  sourceAttribution: SourceAttribution[];
  daysActive: number;
  momentum: number;
  publishedAt?: Date;
  verificationData?: VerificationStatus;
  tier: 'free' | 'pro' | 'max';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  isLocked?: boolean;
}

export interface VaultFilter {
  tier?: 'free' | 'pro' | 'max';
  minScore?: number;
  maxScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  signalsMinCount?: number;
  searchQuery?: string;
  sortBy?: 'score' | 'momentum' | 'recent' | 'signals';
  sortOrder?: 'asc' | 'desc';
  category?: string;
  pageSizeOverride?: number;
}

export interface VaultListResponse {
  vaults: Vault[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface VaultDetailResponse {
  vault: Vault;
  relatedVaults: Vault[];
  userFeedback?: {
    liked: boolean;
    shared: boolean;
    saved: boolean;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/specflow-newsletter/src/lib/vault-types.ts
git commit -m "feat(types): add isLocked, isBookmarked, bookmarkCount, category filter"
```

---

## Task 6: Update useVaults hook

**Files:**
- Modify: `artifacts/specflow-newsletter/src/hooks/useVaults.ts`

- [ ] **Step 1: Replace the file**

```typescript
import { useState, useCallback } from 'react';
import { Vault, VaultFilter, VaultListResponse, VaultDetailResponse } from '@/lib/vault-types';
import { useAuth } from '@/lib/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UseVaultsResult {
  vaults: Vault[];
  vault: Vault | null;
  relatedVaults: Vault[];
  bookmarkedVaults: Vault[];
  userFeedback: { liked: boolean; shared: boolean; saved: boolean } | undefined;
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  fetchVaults: (filters?: VaultFilter, pageNum?: number) => Promise<void>;
  fetchVaultDetail: (vaultId: string) => Promise<void>;
  fetchBookmarkedVaults: () => Promise<void>;
  bookmarkVault: (vaultId: string) => Promise<{ bookmarked: boolean }>;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export const useVaults = (): UseVaultsResult => {
  const { getToken } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vault, setVault] = useState<Vault | null>(null);
  const [relatedVaults, setRelatedVaults] = useState<Vault[]>([]);
  const [bookmarkedVaults, setBookmarkedVaults] = useState<Vault[]>([]);
  const [userFeedback, setUserFeedback] = useState<{ liked: boolean; shared: boolean; saved: boolean } | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [pageState, setPageState] = useState(1);
  const [pageSize] = useState(12);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<VaultFilter | undefined>();

  const fetchVaults = useCallback(async (filters?: VaultFilter, pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.tier) params.append('tier', filters.tier);
      if (filters?.minScore !== undefined) params.append('minScore', filters.minScore.toString());
      if (filters?.maxScore !== undefined) params.append('maxScore', filters.maxScore.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.signalsMinCount !== undefined) params.append('signalsMinCount', filters.signalsMinCount.toString());
      if (filters?.searchQuery) params.append('q', filters.searchQuery);
      if (filters?.sortBy) params.append('sort', filters.sortBy);
      if (filters?.sortOrder) params.append('order', filters.sortOrder);
      if (filters?.category) params.append('category', filters.category);
      params.append('page', pageNum.toString());
      params.append('pageSize', (filters?.pageSizeOverride ?? pageSize).toString());

      const response = await fetch(`${API_BASE}/vaults?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch vaults: ${response.statusText}`);
      const data: VaultListResponse = await response.json();
      setVaults(data.vaults);
      setTotal(data.total);
      setPageState(data.page);
      setHasMore(data.hasMore);
      setCurrentFilter(filters);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const fetchVaultDetail = useCallback(async (vaultId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE}/vaults/${vaultId}`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch vault: ${response.statusText}`);
      const data: VaultDetailResponse = await response.json();
      setVault(data.vault);
      setRelatedVaults(data.relatedVaults ?? []);
      setUserFeedback(data.userFeedback);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchBookmarkedVaults = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${API_BASE}/vaults/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      const data = await response.json();
      setBookmarkedVaults(data.vaults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const bookmarkVault = useCallback(async (vaultId: string): Promise<{ bookmarked: boolean }> => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE}/vaults/${vaultId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to toggle bookmark');
    return response.json();
  }, [getToken]);

  const setPage = useCallback((newPage: number) => {
    fetchVaults(currentFilter, newPage);
  }, [fetchVaults, currentFilter]);

  const refresh = useCallback(async () => {
    await fetchVaults(currentFilter, pageState);
  }, [fetchVaults, currentFilter, pageState]);

  return {
    vaults, vault, relatedVaults, bookmarkedVaults, userFeedback,
    loading, error, total, page: pageState, pageSize, hasMore,
    fetchVaults, fetchVaultDetail, fetchBookmarkedVaults, bookmarkVault,
    setPage, refresh,
  };
};

export default useVaults;
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/specflow-newsletter/src/hooks/useVaults.ts
git commit -m "feat(hooks): add bookmarkVault, fetchBookmarkedVaults, category filter to useVaults"
```

---

## Task 7: Redesign VaultCard

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/VaultCard.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Vault } from '@/lib/vault-types';

interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
  displayIndex?: number;
  isBookmarked?: boolean;
}

const tierStyles: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  max: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 52 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const stroke = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-muted/30" />
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground" style={{ fontSize: size < 52 ? '9px' : '11px' }}>
        {score}
      </span>
    </div>
  );
};

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const SourceIcon: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${active ? 'text-primary bg-primary/10' : 'text-muted-foreground/30'}`}>
    {label}
  </span>
);

export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  showSignals = true,
  onSelect,
  layout = 'compact',
  displayIndex = 0,
  isBookmarked,
}) => {
  const overall = vault.scores?.overall ?? 0;
  const hasMomentum = (vault.momentum ?? 0) > 70;
  const signals = vault.signalsSummary ?? { reddit: [], youtube: [], hn: [], ph: [] };
  const tierLabel = (vault.tier ?? 'free').toUpperCase();
  const tierStyle = tierStyles[vault.tier ?? 'free'] ?? tierStyles.free;

  const cardContent = (
    <motion.div
      className="group relative rounded-2xl bg-gradient-to-br from-border/60 via-border/20 to-border/60 p-[1px] transition-all duration-300 hover:from-primary/40 hover:via-primary/10 hover:to-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: displayIndex * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect?.(vault.id)}
    >
      <div className={`bg-card rounded-[calc(1rem-1px)] ${layout === 'expanded' ? 'p-5' : 'p-4'} h-full flex flex-col gap-3`}>

        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle}`}>
            {tierLabel}
          </span>
          {hasMomentum && <span className="text-sm">🔥</span>}
          {showSignals && (
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {vault.signalsCount} signals
            </span>
          )}
        </div>

        {/* Title + score ring */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-serif font-bold text-foreground leading-tight line-clamp-2 ${layout === 'expanded' ? 'text-xl' : 'text-base'}`}>
            {vault.title}
          </h3>
          <div className="relative shrink-0">
            <ScoreRing score={overall} size={layout === 'expanded' ? 56 : 48} />
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {vault.tagline}
        </p>

        {/* Score bars — expanded only */}
        {layout === 'expanded' && vault.scores && (
          <div className="space-y-2 pt-1">
            <ScoreBar label="Opportunity" value={vault.scores.opportunity} />
            <ScoreBar label="Problem" value={vault.scores.problem} />
            <ScoreBar label="Feasibility" value={vault.scores.feasibility} />
            <ScoreBar label="Why Now" value={vault.scores.whyNow} />
          </div>
        )}

        {/* Source icons */}
        <div className="flex items-center gap-1 mt-auto pt-2">
          <SourceIcon label="r/" active={(signals.reddit?.length ?? 0) > 0} />
          <SourceIcon label="▶" active={(signals.youtube?.length ?? 0) > 0} />
          <SourceIcon label="Y" active={(signals.hn?.length ?? 0) > 0} />
          <SourceIcon label="PH" active={(signals.ph?.length ?? 0) > 0} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <span>{vault.daysActive}d active</span>
          {vault.publishedAt && (
            <span>{new Date(vault.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          )}
          {layout === 'expanded' && (
            <span className="text-primary font-semibold">View Idea →</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Link href={`/vault/${vault.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default VaultCard;
```

- [ ] **Step 2: Start dev server and verify card renders**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief/artifacts/specflow-newsletter"
pnpm dev
```

Open `http://localhost:5173/vault-archive` and confirm: gradient border visible, score ring animates on load, tier badge shows, layout toggle works.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/VaultCard.tsx
git commit -m "feat(ui): redesign VaultCard — score ring, gradient border, tier badge, framer-motion"
```

---

## Task 8: Rebuild VaultTab as weekly digest

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/portal/VaultTab.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useVaults } from "@/hooks/useVaults";

interface VaultTabProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function VaultTab({ isPro: _isPro, onUpgradeClick: _onUpgradeClick }: VaultTabProps) {
  const { vaults, loading, fetchVaults } = useVaults();

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    fetchVaults(
      { sortBy: 'momentum', sortOrder: 'desc', dateFrom: sevenDaysAgo, pageSizeOverride: 3 },
      1,
    );
  }, [fetchVaults]);

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const isNew = (publishedAt?: Date) => {
    if (!publishedAt) return false;
    return new Date(publishedAt) >= fortyEightHoursAgo;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-card border border-border rounded-2xl animate-pulse min-h-[96px]">
            <div className="h-4 bg-muted rounded mb-3 w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <p className="text-2xl mb-2">📅</p>
          <p className="font-semibold text-foreground">Next drop lands Friday.</p>
          <p className="text-sm text-muted-foreground mt-1">Come back then.</p>
        </div>
        <div className="flex justify-end">
          <Link href="/vault-archive" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            View Full Vault Archive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">This Week's Top Ideas</p>

      <div className="space-y-4">
        {vaults.map((vault, i) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/vault/${vault.id}`} className="block">
              <div className="group p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isNew(vault.publishedAt) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">NEW</span>
                      )}
                      {(vault.momentum ?? 0) > 70 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    </div>
                    <h4 className="font-serif font-bold text-foreground text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {vault.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{vault.tagline}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (vault.momentum ?? 0) >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : (vault.momentum ?? 0) >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {vault.momentum ?? 0} momentum
                    </div>
                    <span className="text-[10px] text-muted-foreground">{vault.signalsCount} signals</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Dive In →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Link href="/vault-archive" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          View Full Vault Archive <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in user portal — open Vault tab**

Navigate to `http://localhost:5173` → user portal → Vault tab. Confirm: horizontal cards with momentum badge, "Dive In →" on hover, "View Full Vault Archive" link.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/portal/VaultTab.tsx
git commit -m "feat(ui): replace VaultTab with weekly momentum digest"
```

---

## Task 9: Redesign VaultArchive

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/vault-archive.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Lock, LayoutGrid, List, Columns3 } from 'lucide-react';
import { Link } from 'wouter';
import { useMode } from "@/lib/ModeContext";
import { useAuth } from "@/lib/AuthContext";
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { VaultFilter } from '@/lib/vault-types';
import { usePageTracking } from '@/hooks/useAnalytics';

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 3 };

const VERIFICATION_TOOLTIPS: Record<string, string> = {
  verified: 'Confirmed by multiple independent sources',
  unconfirmed: 'Data found but not cross-verified',
  contradicted: 'Conflicting data found across sources',
};

function EmptyState() {
  return (
    <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
      <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mb-4 text-muted-foreground/40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="28" cy="28" r="18" />
        <line x1="41" y1="41" x2="56" y2="56" strokeLinecap="round" />
        <line x1="22" y1="28" x2="34" y2="28" />
        <line x1="28" y1="22" x2="28" y2="34" />
      </svg>
      <p className="font-serif text-2xl text-foreground mb-2">No ideas match your filters.</p>
      <p className="text-sm text-muted-foreground">Try widening the search.</p>
    </div>
  );
}

export default function VaultArchive() {
  usePageTracking('/vault-archive');
  const { mode } = useMode();
  const { tier: userTier } = useAuth();
  const { vaults: rawVaults, loading, error, total, page, hasMore, fetchVaults, setPage } = useVaults();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'recent' | 'signals'>('score');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState<'grid' | 'list' | 'compact'>('grid');
  const [allTags, setAllTags] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Fetch all unique tags once
  useEffect(() => {
    fetch(`${API_BASE}/vaults/tags`)
      .then(r => r.ok ? r.json() : [])
      .then((tags: string[]) => setAllTags(tags))
      .catch(() => {});
  }, [API_BASE]);

  // Mode filter
  const vaults = useMemo(() => {
    if (mode !== "offline") return rawVaults;
    return rawVaults.filter(v =>
      v.tags?.some(t => t.toLowerCase() === "offline" || t.toLowerCase() === "hybrid")
    );
  }, [rawVaults, mode]);

  const handleFilterChange = useCallback(async () => {
    const filter: VaultFilter = {
      searchQuery: searchQuery || undefined,
      tier: (selectedTier !== 'all' ? selectedTier : undefined) as any,
      minScore: minScore > 0 ? minScore : undefined,
      sortBy,
      sortOrder,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    };
    await fetchVaults(filter, 1);
  }, [searchQuery, selectedTier, minScore, sortBy, sortOrder, selectedCategory, fetchVaults]);

  useEffect(() => {
    const t = setTimeout(handleFilterChange, 500);
    return () => clearTimeout(t);
  }, [handleFilterChange]);

  // Scroll-collapsing header
  const { scrollY } = useScroll();
  const headerPaddingY = useTransform(scrollY, [0, 120], [48, 16]);
  const subtitleOpacity = useTransform(scrollY, [60, 110], [1, 0]);

  // Stats
  const avgScore = vaults.length
    ? Math.round(vaults.reduce((s, v) => s + (v.scores?.overall ?? 0), 0) / vaults.length)
    : 0;
  const topVault = [...vaults].sort((a, b) => (b.momentum ?? 0) - (a.momentum ?? 0))[0];
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = vaults.filter(v => v.publishedAt && new Date(v.publishedAt) >= sevenDaysAgo).length;

  // Trending tag counts for sidebar
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vaults.forEach(v => v.tags?.forEach(t => { counts[t] = (counts[t] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [vaults]);
  const maxTagCount = tagCounts[0]?.[1] ?? 1;

  const tiers = ['all', 'free', 'pro', 'max'];

  const gridCols = {
    grid: 'grid-cols-1 md:grid-cols-2',
    compact: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    list: 'grid-cols-1',
  }[layout];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav activePage="archive" />

      {/* Hero Header */}
      <motion.header
        className="border-b border-border bg-background/95 backdrop-blur-sm"
        style={{ paddingTop: headerPaddingY, paddingBottom: headerPaddingY }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">The Idea Vault</h1>
              <motion.p style={{ opacity: subtitleOpacity }} className="text-muted-foreground mt-1 max-w-xl">
                Every startup idea our AI has surfaced. Scored. Verified. Yours to build.
              </motion.p>
            </div>
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {total} ideas
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                Avg score: {avgScore}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                +{recentCount} this week
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 space-y-3">
          {/* Row 1: search + layout */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none"
            >
              <option value="score">Confidence Score</option>
              <option value="momentum">Momentum</option>
              <option value="recent">Recently Added</option>
              <option value="signals">Most Signals</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              {([['grid', LayoutGrid], ['compact', Columns3], ['list', List]] as const).map(([k, Icon]) => (
                <button
                  key={k}
                  onClick={() => setLayout(k)}
                  className={`p-1.5 rounded ${layout === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: category pills + tier tabs + score slider */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
              {['All', ...allTags].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedCategory(tag)}
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedCategory === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Tier tabs */}
            <div className="flex items-center gap-1 shrink-0">
              {tiers.map(t => {
                const isLocked = t !== 'all' && t !== 'free' && (TIER_RANK[userTier] ?? 0) < (TIER_RANK[t] ?? 0);
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTier === t
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isLocked && <Lock className="w-2.5 h-2.5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Score slider */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">Min score:</span>
              <input
                type="range" min="0" max="100" step="5"
                value={minScore}
                onChange={e => setMinScore(parseInt(e.target.value))}
                className="w-20 h-1.5 accent-primary"
              />
              <span className="text-xs font-semibold text-foreground w-6">{minScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-28">
        <div className="flex gap-8">

          {/* Results area */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className={`grid ${gridCols} gap-5`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
                <p className="font-semibold mb-1">Error loading vaults</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            {!loading && vaults.length === 0 && <EmptyState />}

            {!loading && vaults.length > 0 && (
              <>
                <div className={`grid ${gridCols} gap-5`}>
                  {vaults.map((vault, idx) => {
                    const isLocked = vault.isLocked || !!(
                      vault.tier &&
                      (TIER_RANK[userTier] ?? 0) < (TIER_RANK[vault.tier] ?? 0)
                    );

                    if (isLocked) {
                      return (
                        <div key={vault.id} className="relative">
                          <div className="pointer-events-none select-none blur-sm opacity-60">
                            <VaultCard vault={vault as any} layout={layout === 'compact' ? 'compact' : layout === 'list' ? 'compact' : 'expanded'} displayIndex={idx} />
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 rounded-2xl cursor-pointer">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground capitalize">
                              {vault.tier} tier required
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={vault.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: (idx % 6) * 0.05 }}
                      >
                        <VaultCard
                          vault={vault}
                          layout={layout === 'list' ? 'compact' : layout === 'compact' ? 'compact' : 'expanded'}
                          displayIndex={idx}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col gap-6 w-72 shrink-0">
            {/* Top pick */}
            {topVault && !topVault.isLocked && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">This Week's Top Pick</p>
                <h4 className="font-serif font-bold text-foreground mb-1 leading-snug">{topVault.title}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{topVault.tagline}</p>
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="font-semibold text-foreground">Score: {topVault.scores?.overall ?? 0}</span>
                  <span className="text-muted-foreground">{topVault.momentum ?? 0} momentum</span>
                </div>
                <Link href={`/vault/${topVault.id}`} className="block text-xs font-semibold text-primary hover:underline">
                  View Idea →
                </Link>
              </div>
            )}

            {/* Trending categories */}
            {tagCounts.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Trending Categories</p>
                <div className="space-y-2">
                  {tagCounts.map(([tag, ct]) => (
                    <div key={tag}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-foreground">{tag}</span>
                        <span className="text-muted-foreground">{ct}</span>
                      </div>
                      <div className="h-1 bg-muted/40 rounded-full">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${(ct / maxTagCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {(TIER_RANK[userTier] ?? 0) < TIER_RANK.max && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Unlock Max Tier</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 mb-3">
                  Get every idea, including pro & max vaults, execution playbooks, and first 10 customers strategy.
                </p>
                <Link href="/pricing" className="block text-center text-xs font-bold px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Upgrade Now
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/vault-archive`. Check:
- Header collapses on scroll
- Filter bar stays sticky
- Category pills load from `/vaults/tags`
- Tier tabs show lock icons for gated tiers
- Layout toggle switches between grid/list/compact
- Sidebar visible on wide screens with top pick + trending categories

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/vault-archive.tsx
git commit -m "feat(ui): redesign VaultArchive — hero header, sticky filters, sidebar, locked overlays"
```

---

## Task 10: Redesign VaultDetail

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/vault-detail.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, Heart, Copy, Lock, CheckCircle2 } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultSignals from '@/components/VaultSignals';
import VaultMarketChart from '@/components/VaultMarketChart';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { useAuth } from '@/lib/AuthContext';
import { usePageTracking } from '@/hooks/useAnalytics';
import { VerificationStatus } from '@/lib/vault-types';

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 3 };

const VERIFICATION_TOOLTIPS: Record<string, string> = {
  verified: 'Confirmed by multiple independent sources',
  unconfirmed: 'Data found but not cross-verified',
  contradicted: 'Conflicting data found across sources',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const arc = Math.PI * radius;
  const offset = arc - (score / 100) * arc;
  const stroke = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 70 70 0 0 1 170 90" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" strokeLinecap="round" />
        <motion.path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={arc}
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground block">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function VaultDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { vault, relatedVaults, userFeedback, loading, error, fetchVaultDetail, bookmarkVault } = useVaults();
  const { tier: userTier } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  usePageTracking(`/vault-detail/${id}`);

  useEffect(() => {
    if (id) fetchVaultDetail(id);
  }, [id, fetchVaultDetail]);

  useEffect(() => {
    if (userFeedback) {
      setLiked(userFeedback.liked);
      setSaved(userFeedback.saved);
    }
  }, [userFeedback]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const postFeedback = (action: string, value: boolean) => {
    if (!id) return;
    fetch(`${API_BASE}/vaults/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    }).catch(() => {});
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    postFeedback('like', next);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const result = await bookmarkVault(id);
      setSaved(result.bookmarked);
    } catch {
      const next = !saved;
      setSaved(next);
      postFeedback('save', next);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: vault?.title, url });
        postFeedback('share', true);
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    postFeedback('share', true);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const canAccessExecution = (TIER_RANK[userTier] ?? 0) >= 1;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Vault not found</p>
          <button onClick={() => setLocation('/vault-archive')} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90">
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNav activePage="archive" />
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
          <button onClick={() => setLocation('/vault-archive')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to archive
          </button>
          <div className="text-center py-24">
            <p className="font-serif text-2xl font-semibold text-foreground mb-2">Vault not found</p>
            {error && <p className="text-muted-foreground">{error.message}</p>}
          </div>
        </main>
      </div>
    );
  }

  const vData = vault.verificationData as VerificationStatus | undefined;
  const tierStyles: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    max: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };

  const executionSteps = [
    { n: 1, label: 'Validate the problem', detail: 'Interview 10 potential customers. Confirm they feel the pain described above.' },
    { n: 2, label: 'Define your ICP', detail: vault.tags?.length ? `Focus on: ${vault.tags.slice(0, 3).join(', ')} segment.` : 'Identify the specific customer who loses sleep over this problem.' },
    { n: 3, label: 'Build MVP', detail: vault.scores?.feasibility >= 70 ? 'High feasibility score — a no-code MVP in 2 weeks is viable.' : 'Keep scope minimal. Validate before building the real thing.' },
    { n: 4, label: 'Price it', detail: vault.unitEconomics ? vault.unitEconomics.slice(0, 120) + '...' : 'Start at the top of your range. Founders almost always underprice.' },
    { n: 5, label: 'Find your first 10 customers', detail: vault.marketSize ? `Target the ${vault.marketSize} market. Go direct — cold email, communities, Twitter DMs.` : 'Manual outreach only. No ads until you have 10 paying customers.' },
    { n: 6, label: 'Ship and iterate', detail: 'Weekly releases. Talk to every customer. Kill features that don\'t retain.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-28">

        {/* Back */}
        <motion.button
          initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => setLocation('/vault-archive')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to archive
        </motion.button>

        {/* 1. Header Strip */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tierStyles[vault.tier ?? 'free'] ?? tierStyles.free}`}>
              {(vault.tier ?? 'free').toUpperCase()}
            </span>
            {(vault.momentum ?? 0) > 70 && <span className="text-sm">🔥</span>}
            <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
              {vault.daysActive} days active
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-4 leading-tight">
            {vault.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{vault.tagline}</p>

          {vault.problemStatement && (
            <div className="border-l-4 border-primary pl-4 mb-6">
              <p className="text-muted-foreground leading-relaxed">{vault.problemStatement}</p>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 relative flex-wrap">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                liked ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                saved ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save'}
              {(vault.bookmarkCount ?? 0) > 0 && (
                <span className="text-xs opacity-60">{vault.bookmarkCount}</span>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            {shareToast && (
              <span className="absolute -bottom-8 left-0 text-xs bg-card border border-border px-3 py-1 rounded-lg shadow-sm whitespace-nowrap text-muted-foreground">
                Link copied!
              </span>
            )}
          </div>
        </motion.div>

        {/* 2. Scorecard Hero */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mb-10 bg-card border border-border rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Overall Score</p>
              <ScoreGauge score={vault.scores?.overall ?? 0} />
              {vData && (
                <span className={`mt-3 text-xs font-bold px-3 py-1 rounded-full ${
                  vData.confidenceScore >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : vData.confidenceScore >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  Data Quality: {vData.confidenceScore}%
                </span>
              )}
            </div>
            {vault.scores && (
              <div className="flex-1 space-y-4 w-full">
                <ScoreBar label="Opportunity" value={vault.scores.opportunity} />
                <ScoreBar label="Problem Severity" value={vault.scores.problem} />
                <ScoreBar label="Feasibility" value={vault.scores.feasibility} />
                <ScoreBar label="Why Now" value={vault.scores.whyNow} />
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Three-column layout */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Left — Market Intelligence */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Market Intelligence</h3>
            {(vault.marketSize || vault.tam) && (
              <div className="space-y-2">
                {vault.marketSize && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Market Size</p>
                    <p className="text-2xl font-bold text-foreground">{vault.marketSize}</p>
                  </div>
                )}
                {vault.tam && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">TAM</p>
                    <p className="text-xl font-semibold text-foreground">{vault.tam}</p>
                  </div>
                )}
              </div>
            )}
            {vault.marketSize && (
              <VaultMarketChart title="" marketSize={vault.marketSize} tam={vault.tam} keywords={vault.keywordsTrending} height={160} />
            )}
            {vault.keywordsTrending && vault.keywordsTrending.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {vault.keywordsTrending.map(kw => (
                  <span key={kw} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Center — The Thesis */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">The Thesis</h3>
            {vault.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{vault.description}</p>
            )}
            {vault.problemStatement && (
              <div className="border-l-4 border-primary pl-3">
                <p className="text-xs font-semibold text-primary mb-1">The Problem</p>
                <p className="text-sm text-muted-foreground">{vault.problemStatement}</p>
              </div>
            )}
            {vault.unitEconomics && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Unit Economics</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{vault.unitEconomics}</p>
              </div>
            )}
          </div>

          {/* Right — Signal Dashboard */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Signal Dashboard</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">{vault.signalsCount}</span>
              <span className="text-xs text-muted-foreground">total community signals</span>
            </div>
            {vault.signalsSummary && (
              <VaultSignals signals={vault.signalsSummary} totalCount={vault.signalsCount} layout="vertical" />
            )}
          </div>
        </motion.div>

        {/* 4. Verification */}
        {vData && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-10 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Verification Status</h3>
              <span className="text-xs text-muted-foreground">
                Last verified: {new Date(vault.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {([
                { label: 'Market Size', status: vData.marketSizeVerified },
                { label: 'TAM', status: vData.tamVerified },
                { label: 'Unit Economics', status: vData.unitEconomicsVerified },
                { label: 'Confidence', status: `${vData.confidenceScore}%` as any },
              ] as { label: string; status: VerificationStatus['marketSizeVerified'] | string }[]).map(({ label, status }) => {
                const isStatus = status === 'verified' || status === 'unconfirmed' || status === 'contradicted';
                const bg = status === 'verified' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                         : status === 'contradicted' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                         : 'bg-muted/50 border-border';
                const textColor = status === 'verified' ? 'text-green-700 dark:text-green-400'
                                : status === 'contradicted' ? 'text-red-700 dark:text-red-400'
                                : 'text-foreground';
                return (
                  <div key={label} className={`p-4 rounded-xl border ${bg}`} title={isStatus ? VERIFICATION_TOOLTIPS[status as string] : ''}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <p className={`text-sm font-semibold capitalize ${textColor}`}>{String(status)}</p>
                  </div>
                );
              })}
            </div>
            {vData.issues.length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-xs font-semibold text-destructive mb-2">Issues Found:</p>
                <ul className="space-y-1 text-sm text-destructive/80">
                  {vData.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* 5. Execution Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mb-10 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Build This</h3>
            <p className="text-xs text-muted-foreground mt-0.5">6-step execution playbook</p>
          </div>

          {canAccessExecution ? (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {executionSteps.map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {vault.unitEconomics && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary mb-1">First Revenue Path</p>
                  <p className="text-sm text-foreground">{vault.unitEconomics}</p>
                </div>
              )}
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-bold text-foreground mb-1">First 10 Customers</p>
                <p className="text-sm text-muted-foreground">
                  {vault.marketSize
                    ? `In a ${vault.marketSize} market, your first 10 customers are reachable through direct outreach in niche communities, founder networks, and cold email to the ICP list you built in Step 2.`
                    : 'Manual outreach to your ICP. No ads, no growth hacks — just conversations. Aim for 10 paying customers before writing a single line of marketing copy.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative p-6 overflow-hidden">
              <div className="blur-sm select-none pointer-events-none space-y-4 opacity-60">
                {executionSteps.slice(0, 3).map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-xs font-bold flex items-center justify-center shrink-0">{step.n}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Pro & Max access required</p>
                <Link href="/pricing" className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Upgrade to unlock execution playbook
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* 6. Related Ideas */}
        {relatedVaults.length > 0 && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mb-10">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-5">Similar Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedVaults.map((rv, idx) => (
                <VaultCard key={rv.id} vault={rv} layout="compact" displayIndex={idx} />
              ))}
            </div>
          </motion.div>
        )}

        {/* 7. Bottom CTA */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={fadeUp} className="bg-card border border-border rounded-2xl p-10 text-center">
          {canAccessExecution ? (
            <>
              <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">Ready to build this?</h2>
              <p className="mb-6 max-w-md mx-auto text-muted-foreground">Add it to your build list and start executing the playbook above.</p>
              <Link href="/blueprints" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Add to Build List →
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">Want the full playbook?</h2>
              <p className="mb-6 max-w-md mx-auto text-muted-foreground">Upgrade to Pro or Max to unlock the 6-step execution checklist, first revenue path, and first 10 customers strategy for every idea.</p>
              <Link href="/pricing" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Upgrade Now →
              </Link>
            </>
          )}
        </motion.div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/vault/1` (or any valid vault ID). Check:
- Header strip shows tier badge + momentum + days active
- Semicircle gauge animates on load
- 3-col layout renders correctly on desktop
- Execution section shows blur/lock for free tier, full content for pro/max
- Save button calls bookmark endpoint
- Related vaults render as compact VaultCards

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/vault-detail.tsx
git commit -m "feat(ui): redesign VaultDetail — scorecard gauge, 3-col layout, execution section, bookmarking"
```

---

## Self-Review Checklist

Run after completing all tasks:

- [ ] All 5 prompts covered: VaultCard ✓ | VaultArchive ✓ | VaultDetail ✓ | Bookmarks ✓ | Weekly digest ✓
- [ ] Migration ran cleanly against real DB
- [ ] API compiles with `tsc --noEmit`
- [ ] Score ring animates, gradient border glows on hover
- [ ] Tier gating: free users see free vaults fully, higher tiers as blurred stubs
- [ ] Bookmark toggle persists across page reload (via `/bookmark` endpoint)
- [ ] VaultTab shows "Next drop lands Friday" when no recent vaults
- [ ] VaultDetail execution section gated correctly (blur for free, visible for pro/max)
- [ ] All wouter `Link` used — no `<a href>` for internal navigation
- [ ] No TypeScript errors in either app
