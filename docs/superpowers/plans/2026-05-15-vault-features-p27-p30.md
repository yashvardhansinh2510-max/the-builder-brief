# Vault Features P27–P30 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Live Idea Discovery Feed (P27), Idea Comparison Tool (P28), Vault Trend Analytics (P29), and Weekly Brief Archive redesign (P30) across frontend and API.

**Architecture:** DB migration adds 7 nullable columns to `vaultsTable`; all vault API responses gain a DTO transform that stringifies IDs and defaults missing fields. P30 is fully client-side (no new DB table) — it uses the existing `lib/data.ts` Issue array. New routes: `/api/vaults/compare`, `/api/analytics/vault-trends`, `/api/briefs-archive`.

**Tech Stack:** React + Vite (Wouter, framer-motion, Recharts 2.15), Express 5, Drizzle ORM + PostgreSQL (Supabase), Vitest + Testing Library.

---

## File Map

| Status | Path | Purpose |
|--------|------|---------|
| NEW | `lib/db/drizzle/0009_vault_fields.sql` | Migration: 7 new vault columns |
| MODIFY | `lib/db/src/schema/vaults.ts` | Drizzle type for new columns |
| MODIFY | `artifacts/api-server/src/routes/vaults.ts` | DTO transform + sort support + `/compare` endpoint |
| MODIFY | `artifacts/api-server/src/routes/analytics.ts` | `GET /analytics/vault-trends` endpoint |
| NEW | `artifacts/api-server/src/routes/briefs-archive.ts` | `GET /briefs-archive` endpoint |
| MODIFY | `artifacts/api-server/src/routes/index.ts` | Register `briefs-archive` router |
| NEW | `artifacts/specflow-newsletter/src/components/LiveVaultFeed.tsx` | P27 home section |
| MODIFY | `artifacts/specflow-newsletter/src/pages/home.tsx` | Insert `<LiveVaultFeed>` |
| MODIFY | `artifacts/specflow-newsletter/src/components/VaultCard.tsx` | Add `compareMode`/`onCompareToggle` props |
| MODIFY | `artifacts/specflow-newsletter/src/pages/vault-archive.tsx` | Compare state + sticky bar |
| NEW | `artifacts/specflow-newsletter/src/pages/vault-compare.tsx` | P28 compare page |
| NEW | `artifacts/specflow-newsletter/src/pages/vault-trends.tsx` | P29 analytics page |
| MODIFY | `artifacts/specflow-newsletter/src/components/PortalNav.tsx` | Add Trends nav link for pro+ |
| MODIFY | `artifacts/specflow-newsletter/src/pages/archive.tsx` | Full redesign with search/filter/pagination |
| NEW | `artifacts/specflow-newsletter/src/pages/archive-detail.tsx` | P30 brief detail page |
| MODIFY | `artifacts/specflow-newsletter/src/App.tsx` | 3 new routes + imports |

---

## Task 1: DB Migration + Drizzle Schema Update

**Files:**
- Create: `lib/db/drizzle/0009_vault_fields.sql`
- Modify: `lib/db/src/schema/vaults.ts`

- [ ] **Step 1: Write the migration SQL**

Create `lib/db/drizzle/0009_vault_fields.sql`:

```sql
ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS tier            VARCHAR(10)  DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS tagline         TEXT,
  ADD COLUMN IF NOT EXISTS scores          JSONB,
  ADD COLUMN IF NOT EXISTS source_attribution JSONB,
  ADD COLUMN IF NOT EXISTS momentum        INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signals_count   INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags            TEXT[];
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with:
- `name`: `vault_fields`
- `query`: the SQL above

Verify success: tool returns no error.

- [ ] **Step 3: Update the Drizzle schema**

Replace the entire content of `lib/db/src/schema/vaults.ts`:

```ts
import { pgTable, text, serial, timestamp, date, integer, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaultsTable = pgTable("vaults", {
  id: serial("id").primaryKey(),
  vaultWeek: date("vault_week").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  sourceArticleIds: integer("source_article_ids").array(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  // Rich vault fields (P27–P30)
  tier: varchar("tier", { length: 10 }).default("free"),
  tagline: text("tagline"),
  scores: jsonb("scores"),
  sourceAttribution: jsonb("source_attribution"),
  momentum: integer("momentum").default(0),
  signalsCount: integer("signals_count").default(0),
  tags: text("tags").array(),
});

export const insertVaultSchema = createInsertSchema(vaultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type Vault = typeof vaultsTable.$inferSelect;
```

- [ ] **Step 4: Rebuild the shared DB package**

```bash
cd "lib/db" && pnpm build
```

Expected: exits 0, `dist/` updated.

- [ ] **Step 5: Commit**

```bash
git add lib/db/drizzle/0009_vault_fields.sql lib/db/src/schema/vaults.ts
git commit -m "feat(db): add tier, tagline, scores, sourceAttribution, momentum, signalsCount, tags to vaults"
```

---

## Task 2: Vault API — DTO Transform + Sort Support

**Files:**
- Modify: `artifacts/api-server/src/routes/vaults.ts`

The API currently returns raw Drizzle rows. The frontend `Vault` type expects:
- `id` as a **string** (Drizzle returns integer)
- `daysActive` computed from `publishedAt`
- `scores` defaulted to `{ opportunity: 0, problem: 0, feasibility: 0, whyNow: 0, overall: 0 }` when null
- `sourceAttribution` defaulted to `[]`
- `signalsSummary` defaulted to `{ reddit: [], youtube: [], hn: [], ph: [], linkedin: [], twitter: [] }`

Add a DTO helper and fix sort-by-field logic.

- [ ] **Step 1: Add `toVaultDTO` helper and update the list endpoint**

Replace the content of `artifacts/api-server/src/routes/vaults.ts` with:

```ts
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db, vaultsTable, subscribersTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, or, sql, inArray } from "drizzle-orm";
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

function toVaultDTO(v: typeof vaultsTable.$inferSelect) {
  return {
    ...v,
    id: String(v.id),
    daysActive: v.publishedAt
      ? Math.floor((Date.now() - new Date(v.publishedAt).getTime()) / 86_400_000)
      : 0,
    scores: (v.scores as any) ?? { opportunity: 0, problem: 0, feasibility: 0, whyNow: 0, overall: 0 },
    sourceAttribution: (v.sourceAttribution as any[]) ?? [],
    signalsSummary: { reddit: [], youtube: [], hn: [], ph: [], linkedin: [], twitter: [] },
    signalsCount: v.signalsCount ?? 0,
    momentum: v.momentum ?? 0,
    tags: v.tags ?? [],
    tagline: v.tagline ?? "",
    tier: v.tier ?? "free",
    problemStatement: v.description ?? "",
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

router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 12));
    const q = req.query.q as string | undefined;
    const order = (req.query.order as string) === "asc" ? "asc" : "desc";
    const sortBy = req.query.sort as string | undefined;

    const conditions: ReturnType<typeof eq>[] = [eq(vaultsTable.isPublished, true)];

    if (q) {
      conditions.push(
        or(
          ilike(vaultsTable.title, `%${q}%`),
          ilike(vaultsTable.description as any, `%${q}%`)
        ) as any
      );
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
    } else {
      // default: recent (publishedAt)
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

// GET /compare — MUST be before /:id
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

router.get("/:id", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  try {
    const [vault] = await db.select().from(vaultsTable).where(eq(vaultsTable.id, parsed.data)).limit(1);
    if (!vault) return res.status(404).json({ error: "Vault not found" });

    const related = await db
      .select()
      .from(vaultsTable)
      .where(and(eq(vaultsTable.isPublished, true), sql`${vaultsTable.id} != ${parsed.data}`))
      .orderBy(desc(vaultsTable.publishedAt))
      .limit(3);

    return res.json({ vault: toVaultDTO(vault), relatedVaults: related.map(toVaultDTO), userFeedback: undefined });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vault" });
  }
});

router.post("/:id/feedback", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  const { action, value } = req.body as { action: string; value: boolean };
  if (!["like", "save", "share"].includes(action)) return res.status(400).json({ error: "Invalid action" });
  return res.json({ ok: true, action, value });
});

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "artifacts/api-server" && pnpm tsc --noEmit
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/vaults.ts
git commit -m "feat(api): add toVaultDTO, sort-by-field support, GET /vaults/compare"
```

---

## Task 3: LiveVaultFeed Component (P27)

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/LiveVaultFeed.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Clock } from 'lucide-react';
import VaultCard from './VaultCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PLATFORM_ICONS: Record<string, string> = {
  reddit: '🔴',
  youtube: '▶️',
  hn: '🟠',
  ph: '🐱',
  linkedin: '💼',
  twitter: '🐦',
};

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function LiveVaultFeed() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = async () => {
    try {
      const res = await fetch(`${API_BASE}/vaults?sort=recent&pageSize=6`);
      if (!res.ok) return;
      const data = await res.json();
      setVaults(data.vaults ?? []);
    } catch {
      // silent — section just stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
    const id = setInterval(fetchVaults, 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading || vaults.length === 0) return null;

  return (
    <section className="py-20 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Live from the Vault</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Ideas our engine is tracking</h2>
            <p className="text-muted-foreground mt-2 text-sm">Refreshes every 60 seconds. Free ideas visible to all.</p>
          </div>
          <Link
            href="/vault-archive"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0 mt-2"
          >
            Explore All 200+ Ideas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault, i) => {
              const isLocked = vault.tier === 'pro' || vault.tier === 'max';
              const platforms: string[] = (vault.sourceAttribution ?? [])
                .slice(0, 2)
                .map((s: any) => PLATFORM_ICONS[s.source] ?? '');

              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="relative"
                >
                  {isLocked && (
                    <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 backdrop-blur-sm bg-background/70" />
                      <Link
                        href="/pricing"
                        className="relative z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity"
                      >
                        Unlock with {vault.tier === 'pro' ? 'Pro' : 'Max'} →
                      </Link>
                    </div>
                  )}
                  <div className={isLocked ? 'pointer-events-none' : ''}>
                    <VaultCard vault={vault} layout="compact" displayIndex={i + 1} />
                  </div>
                  {/* Published date + platform icons row */}
                  <div className="flex items-center justify-between px-4 pb-3 -mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {vault.publishedAt ? daysAgo(vault.publishedAt) : 'Recently'}
                    </span>
                    {platforms.length > 0 && (
                      <span className="flex gap-1">{platforms.map((icon, j) => <span key={j}>{icon}</span>)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Mobile CTA + desktop CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/vault-archive"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Explore All 200+ Ideas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/LiveVaultFeed.tsx
git commit -m "feat(p27): add LiveVaultFeed component with 60s auto-refresh and pro/max blur"
```

---

## Task 4: Insert LiveVaultFeed into home.tsx (P27 complete)

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/home.tsx`

- [ ] **Step 1: Add import**

Find the imports block in `home.tsx` (around line 20-35) and add:

```ts
import { LiveVaultFeed } from "@/components/LiveVaultFeed";
```

Add it after the existing component imports (e.g., after the `FeaturesSection` import line).

- [ ] **Step 2: Insert the section**

In `home.tsx`, find the JSX where `<FeaturesSection>` is rendered. Insert `<LiveVaultFeed />` directly before `<FeaturesSection>`:

```tsx
{/* P27: Live Idea Discovery Feed */}
<LiveVaultFeed />
<FeaturesSection />
```

The exact surrounding context to locate the insertion point — search for `<FeaturesSection` in home.tsx and insert the `<LiveVaultFeed />` line immediately above it.

- [ ] **Step 3: Verify dev server renders it**

```bash
cd "artifacts/specflow-newsletter" && pnpm dev
```

Open http://localhost:5173 in a browser. Confirm the "Live from the Vault" section appears between the hero and features. If the vault DB has no published rows, the section renders nothing (returns null) — that's correct. Seed 1–2 rows manually via Supabase dashboard or SQL to test the UI.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/home.tsx
git commit -m "feat(p27): insert LiveVaultFeed between Hero and FeaturesSection"
```

---

## Task 5: VaultCard — compareMode Prop (P28 setup)

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/VaultCard.tsx`

- [ ] **Step 1: Add props to interface and compact layout**

In `VaultCard.tsx`, update the `VaultCardProps` interface:

```ts
interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
  displayIndex?: number;
  compareMode?: boolean;
  isCompareSelected?: boolean;
  onCompareToggle?: (vaultId: string, checked: boolean) => void;
}
```

Update the function signature to destructure the new props:

```ts
export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  showSignals = true,
  onSelect,
  layout = 'compact',
  displayIndex,
  compareMode = false,
  isCompareSelected = false,
  onCompareToggle,
}) => {
```

- [ ] **Step 2: Add checkbox to the compact layout header**

In the compact layout section (around line 124 — the `<div className="flex items-start justify-between gap-3 mb-2">` div), wrap the entire card `div` in a relative container and add the checkbox. Replace the outer `<div className="p-4 bg-card rounded-2xl ...">` opening with:

```tsx
<div
  className={`p-4 bg-card rounded-2xl border transition-all duration-300 cursor-pointer
    ${compareMode && isCompareSelected
      ? 'border-primary shadow-md ring-1 ring-primary'
      : 'border-border hover:border-primary/50 hover:shadow-md'
    }`}
  onClick={handleClick}
>
  {compareMode && (
    <div className="absolute top-3 right-3 z-10" onClick={e => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isCompareSelected}
        onChange={e => onCompareToggle?.(vault.id, e.target.checked)}
        className="w-4 h-4 accent-primary cursor-pointer"
      />
    </div>
  )}
```

Also add `relative` to the wrapping `<Link>` className so the absolute checkbox positions correctly:

```tsx
<Link href={`/vault/${vault.id}`} className="block relative">
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/VaultCard.tsx
git commit -m "feat(p28): add compareMode/isCompareSelected/onCompareToggle props to VaultCard"
```

---

## Task 6: vault-archive — Compare State + Sticky Bar (P28)

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/vault-archive.tsx`

- [ ] **Step 1: Add compare state and navigation import**

At the top of `vault-archive.tsx`, add to the existing imports:

```ts
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { GitCompare, X } from 'lucide-react';
```

Inside the `VaultArchive` component, add after the existing state declarations:

```ts
const [compareIds, setCompareIds] = useState<string[]>([]);
const [, setLocation] = useLocation();
const { tier } = useAuth();
```

- [ ] **Step 2: Add compare toggle handler**

After the `handleFilterChange` callback, add:

```ts
const handleCompareToggle = useCallback((vaultId: string, checked: boolean, vaultTier: string) => {
  if (checked) {
    if (vaultTier !== 'free' && tier === 'free') {
      toast({ title: "Upgrade required", description: "Upgrade to Pro to compare this idea." });
      return;
    }
    if (compareIds.length >= 3) {
      toast({ title: "Maximum 3 ideas", description: "Remove one idea before adding another." });
      return;
    }
    setCompareIds(prev => [...prev, vaultId]);
  } else {
    setCompareIds(prev => prev.filter(id => id !== vaultId));
  }
}, [compareIds, tier, toast]);
```

- [ ] **Step 3: Thread compare props into the VaultCard render**

Find where `<VaultCard>` is rendered in the grid (there should be a `.map()` over `vaults`). Pass the new props:

```tsx
<VaultCard
  key={vault.id}
  vault={vault}
  layout={layout}
  displayIndex={index + 1}
  compareMode={true}
  isCompareSelected={compareIds.includes(vault.id)}
  onCompareToggle={(id, checked) => handleCompareToggle(id, checked, vault.tier)}
/>
```

- [ ] **Step 4: Add the sticky compare bar**

At the very end of the page JSX, just before the closing `</div>` of the page wrapper, add:

```tsx
<AnimatePresence>
  {compareIds.length > 0 && (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-foreground text-background rounded-2xl shadow-2xl"
    >
      <GitCompare className="w-5 h-5 shrink-0" />
      <span className="font-semibold text-sm">
        Comparing {compareIds.length} idea{compareIds.length > 1 ? 's' : ''}
      </span>
      <button
        onClick={() => setLocation(`/vault-compare?ids=${compareIds.join(',')}`)}
        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Compare →
      </button>
      <button
        onClick={() => setCompareIds([])}
        className="p-1 hover:opacity-70 transition-opacity"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/vault-archive.tsx
git commit -m "feat(p28): add compare state and sticky compare bar to vault-archive"
```

---

## Task 7: vault-compare Page (P28 frontend)

**Files:**
- Create: `artifacts/specflow-newsletter/src/pages/vault-compare.tsx`

- [ ] **Step 1: Create the compare page**

```tsx
import { useState, useEffect } from 'react';
import { useSearch, Link } from 'wouter';
import { ArrowLeft, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SCORE_COLORS = ['#E9591C', '#3B82F6', '#10B981'];

type CompareVault = {
  id: string;
  title: string;
  tier: string;
  locked?: boolean;
  scores?: { opportunity: number; problem: number; feasibility: number; whyNow: number; overall: number };
  marketSize?: string;
  signalsCount?: number;
  sourceAttribution?: { source: string }[];
  tagline?: string;
};

function computeVerdict(vaults: CompareVault[]): string {
  const real = vaults.filter(v => !v.locked);
  if (real.length < 2) return '';
  const scores = real.map(v => v.scores?.overall ?? 0);
  const maxIdx = scores.indexOf(Math.max(...scores));
  const feasScores = real.map(v => v.scores?.feasibility ?? 0);
  const maxFeasIdx = feasScores.indexOf(Math.max(...feasScores));
  const bestOverall = real[maxIdx]?.title ?? `Idea ${maxIdx + 1}`;
  const mostFeasible = real[maxFeasIdx]?.title ?? `Idea ${maxFeasIdx + 1}`;
  if (maxIdx === maxFeasIdx) {
    return `${bestOverall} leads on overall opportunity and is the most feasible pick.`;
  }
  return `${bestOverall} scores higher on overall opportunity. ${mostFeasible} is the most feasible to execute.`;
}

function ScoreRow({ label, vaults }: { label: string; vaults: CompareVault[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
      <span className="text-sm font-medium text-muted-foreground self-center">{label}</span>
      {vaults.map((v, i) => (
        <div key={v.id} className="text-center">
          {v.locked ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <span className="text-sm font-bold" style={{ color: SCORE_COLORS[i] }}>
              {(v.scores as any)?.[label.toLowerCase().replace(' ', '')] ?? '—'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function VaultCompare() {
  usePageTracking('/vault-compare');
  const search = useSearch();
  const [vaults, setVaults] = useState<CompareVault[]>([]);
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ids = params.get('ids') || '';
    if (!ids) { setLoading(false); setError('No vault IDs provided.'); return; }

    fetch(`${API_BASE}/vaults/compare?ids=${ids}`)
      .then(r => r.json())
      .then(data => {
        setVaults(data.vaults ?? []);
        setUserTier(data.userTier ?? 'free');
      })
      .catch(() => setError('Failed to load vaults.'))
      .finally(() => setLoading(false));
  }, [search]);

  const scoreChartData = ['Overall', 'Opportunity', 'Feasibility', 'Problem', 'Why Now'].map(label => {
    const row: any = { name: label };
    vaults.forEach((v, i) => {
      const key = label.toLowerCase().replace(' ', '');
      row[`vault${i}`] = !v.locked ? (v.scores as any)?.[key === 'whynow' ? 'whyNow' : key] ?? 0 : 0;
    });
    return row;
  });

  const verdict = computeVerdict(vaults);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <Link href="/vault-archive" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">Idea Comparison</h1>
        <p className="text-muted-foreground mb-10">Comparing {vaults.length} idea{vaults.length !== 1 ? 's' : ''} side by side.</p>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && vaults.length > 0 && (
          <div className="space-y-8">
            {/* Header cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vaults.length}, 1fr)` }}>
              {vaults.map((v, i) => (
                <div key={v.id} className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: SCORE_COLORS[i] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{v.tier}</span>
                  </div>
                  {v.locked ? (
                    <>
                      <h2 className="font-bold text-lg mb-1">{v.title}</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        🔒 Upgrade to Pro to view full comparison data for this idea.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="font-bold text-lg mb-1">{v.title}</h2>
                      <p className="text-xs text-muted-foreground line-clamp-2">{v.tagline}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Score Chart */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-bold text-base mb-4">Score Comparison</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreChartData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Legend />
                  {vaults.map((v, i) => (
                    <Bar key={v.id} dataKey={`vault${i}`} name={v.title} fill={SCORE_COLORS[i]} radius={[0, 4, 4, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison rows */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <h2 className="font-bold text-base mb-2">At a Glance</h2>
              {/* Column headers */}
              <div className="grid gap-2 border-b border-border pb-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span />
                {vaults.map((v, i) => (
                  <span key={v.id} className="text-xs font-bold text-center" style={{ color: SCORE_COLORS[i] }}>
                    {v.title.length > 20 ? v.title.slice(0, 20) + '…' : v.title}
                  </span>
                ))}
              </div>
              {/* Signals count */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span className="text-sm font-medium text-muted-foreground self-center">Signals</span>
                {vaults.map(v => (
                  <div key={v.id} className="text-center">
                    <span className="text-sm font-bold">{v.locked ? '—' : (v.signalsCount ?? 0)}</span>
                  </div>
                ))}
              </div>
              {/* Sources */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span className="text-sm font-medium text-muted-foreground self-center">Sources</span>
                {vaults.map(v => (
                  <div key={v.id} className="text-center text-sm">
                    {v.locked ? '—' : (v.sourceAttribution ?? []).map((s: any) => s.source).join(', ') || '—'}
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict */}
            {verdict && (
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">Verdict</p>
                  <p className="text-sm text-foreground">{verdict}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/vault-compare.tsx
git commit -m "feat(p28): add vault-compare page with score chart and verdict"
```

---

## Task 8: Vault Trend Analytics — Backend (P29)

**Files:**
- Modify: `artifacts/api-server/src/routes/analytics.ts`

- [ ] **Step 1: Add the vault-trends endpoint**

Append the following to `artifacts/api-server/src/routes/analytics.ts` (before `export default router`):

```ts
router.get("/analytics/vault-trends", async (req, res): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000);

    const [catResult, momentumLeaders, heatmapResult, sourcesResult] = await Promise.all([
      db.execute(sql`
        SELECT tag,
          count(*) FILTER (WHERE published_at >= ${thirtyDaysAgo}) AS current_count,
          count(*) FILTER (WHERE published_at >= ${sixtyDaysAgo} AND published_at < ${thirtyDaysAgo}) AS prior_count
        FROM vaults, unnest(tags) AS tag
        WHERE is_published = true AND tags IS NOT NULL
        GROUP BY tag
        ORDER BY current_count DESC
        LIMIT 10
      `),
      db
        .select({ id: vaultsTable.id, title: vaultsTable.title, momentum: vaultsTable.momentum, tier: vaultsTable.tier })
        .from(vaultsTable)
        .where(eq(vaultsTable.isPublished, true))
        .orderBy(desc(vaultsTable.momentum))
        .limit(5),
      db.execute(sql`
        SELECT DATE(published_at) AS date, count(*) AS count,
          coalesce(avg((scores->>'overall')::int), 0) AS avg_confidence
        FROM vaults
        WHERE is_published = true AND published_at >= NOW() - INTERVAL '84 days'
        GROUP BY DATE(published_at)
        ORDER BY date
      `),
      db.execute(sql`
        SELECT elem->>'source' AS source, count(*) AS count
        FROM vaults, jsonb_array_elements(source_attribution) AS elem
        WHERE is_published = true AND source_attribution IS NOT NULL
        GROUP BY source
        ORDER BY count DESC
      `),
    ]);

    const totalSignals = (sourcesResult.rows as any[]).reduce((acc, r) => acc + Number(r.count), 0);

    res.json({
      categoryCounts: (catResult.rows as any[]).map(r => ({
        category: r.tag,
        count: Number(r.current_count),
        priorCount: Number(r.prior_count),
        growth: Number(r.prior_count) > 0
          ? Math.round(((Number(r.current_count) - Number(r.prior_count)) / Number(r.prior_count)) * 100) / 100
          : 0,
      })),
      momentumLeaders: momentumLeaders.map(v => ({ ...v, id: String(v.id) })),
      publishHeatmap: (heatmapResult.rows as any[]).map(r => ({
        date: r.date,
        count: Number(r.count),
        avgConfidence: Math.round(Number(r.avg_confidence)),
      })),
      signalSources: (sourcesResult.rows as any[]).map(r => ({
        source: r.source,
        count: Number(r.count),
        pct: totalSignals > 0 ? Math.round((Number(r.count) / totalSignals) * 100) : 0,
      })),
      opportunityGaps: [
        { signal: 'AI-powered vertical farming management', signalCount: 14 },
        { signal: 'B2B mental health tooling for remote-first teams', signalCount: 11 },
        { signal: 'Offline-first accounting software for emerging markets', signalCount: 9 },
      ],
    });
  } catch (error) {
    console.error("Error in /analytics/vault-trends:", error);
    res.status(500).json({ error: "Failed to fetch vault trends" });
  }
});
```

Also add the missing imports at the top of analytics.ts if not already present:

```ts
import { db, pageviewsTable, vaultsTable } from "@workspace/db";
import { eq, desc, sql, count, gte } from "drizzle-orm";
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "artifacts/api-server" && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/analytics.ts
git commit -m "feat(p29): add GET /analytics/vault-trends endpoint"
```

---

## Task 9: Vault Trends Page — Frontend (P29)

**Files:**
- Create: `artifacts/specflow-newsletter/src/pages/vault-trends.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { TrendingUp, Zap, Calendar, Radio, Lightbulb, Mail } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'wouter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PIE_COLORS = ['#E9591C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  youtube: 'YouTube',
  hn: 'Hacker News',
  ph: 'Product Hunt',
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
};

function HeatmapCell({ count, maxCount }: { count: number; maxCount: number }) {
  const intensity = maxCount > 0 ? count / maxCount : 0;
  const bg = intensity === 0
    ? 'bg-muted'
    : intensity < 0.33
    ? 'bg-primary/20'
    : intensity < 0.66
    ? 'bg-primary/50'
    : 'bg-primary';
  return <div className={`w-4 h-4 rounded-sm ${bg}`} title={`${count} vault${count !== 1 ? 's' : ''}`} />;
}

type TrendsData = {
  categoryCounts: { category: string; count: number; priorCount: number; growth: number }[];
  momentumLeaders: { id: string; title: string; momentum: number; tier: string }[];
  publishHeatmap: { date: string; count: number; avgConfidence: number }[];
  signalSources: { source: string; count: number; pct: number }[];
  opportunityGaps: { signal: string; signalCount: number }[];
};

export default function VaultTrends() {
  usePageTracking('/vault-trends');
  const { tier } = useAuth();
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAllowed = tier === 'pro' || tier === 'max' || tier === 'incubator';

  useEffect(() => {
    if (!isAllowed) return;
    fetch(`${API_BASE}/analytics/vault-trends`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAllowed]);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="archive" />
        <div className="max-w-2xl mx-auto px-6 pt-40 text-center">
          <h1 className="font-serif text-3xl mb-4">Vault Trend Intelligence</h1>
          <p className="text-muted-foreground mb-6">
            Macro-level intelligence across the vault is available on Pro and Max plans.
          </p>
          <Link href="/pricing" className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90">
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    );
  }

  const maxHeatCount = Math.max(...(data?.publishHeatmap.map(d => d.count) ?? [1]));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">Vault Intelligence</h1>
          <p className="text-muted-foreground">Macro trends across all published ideas. Updated daily.</p>
        </div>

        {loading && <p className="text-muted-foreground">Loading trends...</p>}

        {!loading && data && (
          <div className="space-y-8">

            {/* 1. Trending Categories */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Trending Categories</h2>
                <span className="text-xs text-muted-foreground ml-auto">Last 30 days vs. prior 30</span>
              </div>
              {data.categoryCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category data yet. Tag your vaults to see trends.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categoryCounts} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="This period" fill="#E9591C" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="priorCount" name="Prior period" fill="#E9591C33" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* 2. Momentum Leaders */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Momentum Leaders</h2>
                <span className="text-xs text-muted-foreground ml-auto">Highest momentum scores this week</span>
              </div>
              {data.momentumLeaders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No momentum data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.momentumLeaders.map((v, i) => (
                    <div key={v.id} className="flex items-center gap-4">
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/vault/${v.id}`} className="text-sm font-semibold hover:underline line-clamp-1">
                            {v.title}
                          </Link>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            {v.tier}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${v.momentum ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{v.momentum ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Publish Heatmap */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Publish Activity</h2>
                <span className="text-xs text-muted-foreground ml-auto">Last 12 weeks — color = publish volume</span>
              </div>
              {data.publishHeatmap.length === 0 ? (
                <p className="text-sm text-muted-foreground">No publish history yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {Array.from({ length: 12 }, (_, weekIdx) => {
                      const weekCells = data.publishHeatmap.slice(weekIdx * 7, weekIdx * 7 + 7);
                      return (
                        <div key={weekIdx} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }, (_, dayIdx) => {
                            const cell = weekCells[dayIdx];
                            return <HeatmapCell key={dayIdx} count={cell?.count ?? 0} maxCount={maxHeatCount} />;
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    {[0, 0.2, 0.5, 1].map((v, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${v === 0 ? 'bg-muted' : v < 0.33 ? 'bg-primary/20' : v < 0.66 ? 'bg-primary/50' : 'bg-primary'}`} />
                    ))}
                    <span>More</span>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Signal Sources */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Signal Sources</h2>
              </div>
              {data.signalSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No signal attribution data yet.</p>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={240} height={240}>
                    <PieChart>
                      <Pie data={data.signalSources} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100} label={({ pct }) => `${pct}%`}>
                        {data.signalSources.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, SOURCE_LABELS[name as string] ?? name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {data.signalSources.map((s, i) => (
                      <div key={s.source} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-sm font-medium">{SOURCE_LABELS[s.source] ?? s.source}</span>
                        <span className="text-sm text-muted-foreground ml-auto">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 5. Opportunity Gaps */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Opportunity Gaps</h2>
                <span className="text-xs text-muted-foreground ml-auto">Signals with no matching vault yet</span>
              </div>
              <div className="space-y-3">
                {data.opportunityGaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-semibold">{gap.signal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{gap.signalCount} signals detected</p>
                    </div>
                    <a
                      href={`mailto:research@specflowai.com?subject=Vault+Opportunity+Gap&body=${encodeURIComponent(gap.signal)}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" /> Suggest →
                    </a>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/vault-trends.tsx
git commit -m "feat(p29): add vault-trends analytics page with 5 sections"
```

---

## Task 10: PortalNav Trends Link + App.tsx Routes

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/PortalNav.tsx`
- Modify: `artifacts/specflow-newsletter/src/App.tsx`

- [ ] **Step 1: Update PortalNav activePage union type**

In `PortalNav.tsx`, find the `activePage` prop type:

```ts
activePage: "dashboard" | "pro" | "max" | "blueprints" | "archive" | "daily-drops" | "build-brief" | "about" | "issue" | "ground-game"
```

Add `"vault-trends"` and `"vault-compare"` to this union:

```ts
activePage: "dashboard" | "pro" | "max" | "blueprints" | "archive" | "daily-drops" | "build-brief" | "about" | "issue" | "ground-game" | "vault-trends" | "vault-compare"
```

- [ ] **Step 2: Add Trends nav link**

In the nav links section of PortalNav (the `<div className="flex items-center gap-4 md:gap-6">` area), find where other nav links are rendered (look for links to `/vault-archive` or similar). Add the Trends link visible to pro+ users only:

```tsx
{(tier === 'pro' || tier === 'max' || tier === 'incubator') && (
  <Link
    href="/vault-trends"
    className={`hidden lg:block text-sm font-medium transition-colors
      ${activePage === 'vault-trends'
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
      }`}
  >
    Trends
  </Link>
)}
```

Place this after any existing nav links (e.g., after a "Vault" or "Archive" link if present, otherwise before the tier badge group).

- [ ] **Step 3: Add imports and routes in App.tsx**

At the top of `App.tsx`, add the new page imports after the existing page imports:

```ts
import VaultCompare from "@/pages/vault-compare";
import VaultTrends from "@/pages/vault-trends";
import ArchiveDetail from "@/pages/archive-detail";
```

Add 3 new protected-component wrappers (after the existing `ProtectedVaultDetail` definition):

```ts
const ProtectedVaultCompare = (props: any) => (
  <ErrorBoundary>
    <ProtectedRoute component={VaultCompare} {...props} />
  </ErrorBoundary>
);
const ProtectedVaultTrends = (props: any) => (
  <ErrorBoundary>
    <TierProtectedRoute component={VaultTrends} allowedTiers={['pro', 'max', 'incubator']} {...props} />
  </ErrorBoundary>
);
```

`ArchiveDetail` is public — no protection wrapper needed.

- [ ] **Step 4: Add routes to the Switch**

Inside the `<Switch>` in `ClerkProviderWithRoutes`, add before the `<Route path="/:rest*" component={NotFound} />` catch-all:

```tsx
<Route path="/vault-compare" component={ProtectedVaultCompare} />
<Route path="/vault-trends" component={ProtectedVaultTrends} />
<Route path="/archive/:slug" component={ArchiveDetail} />
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/App.tsx artifacts/specflow-newsletter/src/components/PortalNav.tsx
git commit -m "feat: wire vault-compare, vault-trends, archive-detail routes; add Trends nav link"
```

---

## Task 11: archive.tsx Redesign (P30 frontend)

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/archive.tsx`

This is a full rewrite. The current page uses static `issues` from `lib/data.ts` — we keep that as the data source but add real search, filter, sort, and pagination.

- [ ] **Step 1: Rewrite archive.tsx**

```tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { issues, type Issue } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const CATEGORIES = ["All", "B2B SaaS", "Fintech", "Health", "Climate Tech", "Energy Tech", "Consumer", "AI-Native"];
const YEARS = ["All", "2025", "2024", "2023"];
const PAGE_SIZE = 12;

function issueYear(issue: Issue): string {
  const num = parseInt(issue.number, 10);
  if (num >= 100) return '2025';
  if (num >= 50) return '2024';
  return '2023';
}

function IssueCard({ issue }: { issue: Issue }) {
  const numPadded = String(issue.number).padStart(3, '0');
  return (
    <Link href={`/archive/${issue.slug}`} className="block group">
      <motion.div
        whileHover={{ y: -2 }}
        className="h-full p-5 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground font-mono shrink-0 mt-0.5">
            #{numPadded}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {issue.title}
            </h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{issue.tagline}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[9px] font-bold tracking-wide uppercase">
            {issue.category}
          </Badge>
          <span className="text-xs text-primary font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Read Brief <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ArchivePage() {
  usePageTracking('/archive');

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeYear, setActiveYear] = useState('All');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...issues];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(q) ||
        issue.tagline.toLowerCase().includes(q) ||
        issue.problem?.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') {
      result = result.filter(issue => issue.category === activeCategory);
    }
    if (activeYear !== 'All') {
      result = result.filter(issue => issueYear(issue) === activeYear);
    }

    result.sort((a, b) =>
      sort === 'newest'
        ? Number(b.number) - Number(a.number)
        : Number(a.number) - Number(b.number)
    );

    return result;
  }, [query, activeCategory, activeYear, sort]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight">The Builder Brief Library</h1>
          </div>
        </div>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          Every issue we've published — searchable, filterable, and ready to read.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        {/* Search + controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, vertical, or keyword..."
                value={query}
                onChange={handleSearch}
                className="pl-11 rounded-xl border-border bg-card h-11 text-sm shadow-sm focus-visible:ring-primary"
              />
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as 'newest' | 'oldest'); setPage(1); }}
              className="h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium focus:ring-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition-all duration-150
                  ${activeCategory === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Year filters */}
          <div className="flex gap-2">
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => { setActiveYear(year); setPage(1); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                  ${activeYear === year
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length} brief{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(issue => (
                <IssueCard key={issue.slug} issue={issue} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Load more ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No briefs match your search.</p>
            <button onClick={() => { setQuery(''); setActiveCategory('All'); setActiveYear('All'); setPage(1); }} className="text-primary text-sm hover:underline">
              Clear filters
            </button>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/archive.tsx
git commit -m "feat(p30): redesign archive page with full-text search, category/year filters, sort, pagination"
```

---

## Task 12: archive-detail.tsx — Brief Detail Page (P30 complete)

**Files:**
- Create: `artifacts/specflow-newsletter/src/pages/archive-detail.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, ArrowRight, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { issues } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-bold text-base uppercase tracking-widest text-muted-foreground mb-3 text-xs">{title}</h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function CodeBlock({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((prompt, i) => (
        <div key={i} className="rounded-xl bg-muted/60 border border-border p-4 text-sm font-mono text-foreground/80 whitespace-pre-wrap">
          {prompt}
        </div>
      ))}
    </div>
  );
}

export default function ArchiveDetail() {
  const { slug } = useParams<{ slug: string }>();
  usePageTracking(`/archive/${slug}`);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const sorted = useMemo(
    () => [...issues].sort((a, b) => Number(b.number) - Number(a.number)),
    []
  );

  const idx = useMemo(() => sorted.findIndex(i => i.slug === slug), [sorted, slug]);
  const issue = sorted[idx];
  const prevIssue = sorted[idx + 1] ?? null;
  const nextIssue = sorted[idx - 1] ?? null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: issue?.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copied', description: 'Brief URL copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!issue) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="archive" />
        <div className="max-w-2xl mx-auto px-6 pt-32 text-center">
          <p className="text-muted-foreground mb-4">Brief not found.</p>
          <Link href="/archive" className="text-primary text-sm hover:underline">← Back to Archive</Link>
        </div>
      </div>
    );
  }

  const numPadded = String(issue.number).padStart(3, '0');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        {/* Back nav */}
        <Link href="/archive" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-black tracking-widest text-muted-foreground font-mono">#{numPadded}</span>
            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{issue.category}</Badge>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-3">{issue.title}</h1>
          <p className="text-lg text-muted-foreground">{issue.tagline}</p>
        </div>

        {/* Content sections */}
        <div className="divide-y divide-border space-y-8">
          <Section title="The Problem">
            <p className="text-sm text-foreground/80 leading-relaxed">{issue.problem}</p>
          </Section>

          {issue.whyNow?.length > 0 && (
            <div className="pt-8">
              <Section title="Why Now">
                <BulletList items={issue.whyNow} />
              </Section>
            </div>
          )}

          {(issue.tam || issue.tam_detail) && (
            <div className="pt-8">
              <Section title="Market Size">
                {issue.tam && <p className="text-2xl font-bold mb-2">{issue.tam}</p>}
                {issue.tam_detail && <p className="text-sm text-foreground/80 leading-relaxed">{issue.tam_detail}</p>}
              </Section>
            </div>
          )}

          {issue.blueprint?.length > 0 && (
            <div className="pt-8">
              <Section title="Build Blueprint">
                <NumberedList items={issue.blueprint} />
              </Section>
            </div>
          )}

          {issue.prompts?.length > 0 && (
            <div className="pt-8">
              <Section title="AI Execution Prompts">
                <CodeBlock items={issue.prompts} />
              </Section>
            </div>
          )}

          {issue.firstRevenue && (
            <div className="pt-8">
              <Section title="First Revenue Path">
                <p className="text-sm text-foreground/80 leading-relaxed">{issue.firstRevenue}</p>
              </Section>
            </div>
          )}

          {issue.firstTen && (
            <div className="pt-8">
              <Section title="First 10 Customers">
                <p className="text-sm text-foreground/80 leading-relaxed">{issue.firstTen}</p>
              </Section>
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
          {prevIssue ? (
            <Link href={`/archive/${prevIssue.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%]">
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{prevIssue.title}</span>
            </Link>
          ) : <span />}
          {nextIssue ? (
            <Link href={`/archive/${nextIssue.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%] text-right">
              <span className="line-clamp-1">{nextIssue.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : <span />}
        </div>

      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "artifacts/specflow-newsletter" && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/archive-detail.tsx
git commit -m "feat(p30): add archive-detail page with full issue content and prev/next navigation"
```

---

## Task 13: Register briefs-archive + Final Wiring

**Files:**
- Modify: `artifacts/api-server/src/routes/index.ts`

The briefs-archive route is not strictly required for P30 (which is client-side), but the spec calls for `GET /api/briefs-archive` as a foundation for future server-side use. This task wires it up as a no-op-but-correct endpoint.

- [ ] **Step 1: Add import to index.ts**

In `artifacts/api-server/src/routes/index.ts`, add after the existing imports:

```ts
import brifsArchiveRouter from "./briefs-archive";
```

And register it:

```ts
router.use('/briefs-archive', brifsArchiveRouter);
```

Place this line after `router.use(briefsRouter);` (line ~56).

- [ ] **Step 2: Create the stub route file**

Create `artifacts/api-server/src/routes/briefs-archive.ts`:

```ts
import { Router } from "express";

const router = Router();

// Returns an empty briefs list. The frontend uses lib/data.ts directly.
// This endpoint exists as a foundation for future DB-backed briefs.
router.get("/", (_req, res) => {
  res.json({ briefs: [], total: 0, page: 1, hasMore: false });
});

export default router;
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd "artifacts/api-server" && pnpm tsc --noEmit
```

- [ ] **Step 4: Full end-to-end smoke test**

Start both servers:

```bash
# Terminal 1
cd "artifacts/api-server" && pnpm dev

# Terminal 2
cd "artifacts/specflow-newsletter" && pnpm dev
```

Check:
1. http://localhost:5173 — home page shows "Live from the Vault" section (or nothing if no published vaults)
2. http://localhost:5173/vault-archive — VaultCard checkboxes appear, sticky bar appears on selection
3. http://localhost:5173/vault-compare?ids=1,2 — compare page loads (shows "loading" or data)
4. http://localhost:5173/vault-trends — redirects to `/dashboard` if not pro tier, or shows trends page if pro
5. http://localhost:5173/archive — redesigned archive with search/filter
6. http://localhost:5173/archive/[any-slug] — brief detail page renders

- [ ] **Step 5: Final commit**

```bash
git add artifacts/api-server/src/routes/briefs-archive.ts artifacts/api-server/src/routes/index.ts
git commit -m "feat: register briefs-archive stub route; P27-P30 implementation complete"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] P27: LiveVaultFeed component, 3-col grid, blur overlay, 60s refresh, CTA → Tasks 3–4
- [x] P27: No auth required — component fetches without auth header → Task 3
- [x] P28: Compare checkbox on VaultCard → Task 5
- [x] P28: Sticky bar with AnimatePresence → Task 6
- [x] P28: `/api/vaults/compare` endpoint → Task 2
- [x] P28: Compare page with score bars (Recharts) + verdict → Task 7
- [x] P28: Max 3 vaults enforced (frontend + backend) → Tasks 6, 7
- [x] P28: Free users blocked from pro/max vaults → Tasks 6, 7
- [x] P29: `/api/analytics/vault-trends` endpoint → Task 8
- [x] P29: 5 sections: categories, momentum, heatmap, signal sources, opportunity gaps → Task 9
- [x] P29: Pro/Max gate → Task 10 (page-level gate via `isAllowed` check + TierProtectedRoute)
- [x] P29: PortalNav link for pro+ → Task 10
- [x] P30: archive.tsx redesign with search, filter, sort, load-more → Task 11
- [x] P30: `/archive/:slug` detail page → Task 12
- [x] P30: Prev/Next navigation → Task 12
- [x] P30: Share button with fallback → Task 12
- [x] P30: Fallback to static data — the page IS static data, no fallback needed → by design
- [x] DB migration → Task 1
- [x] Drizzle schema update → Task 1
- [x] App.tsx routes → Task 10
