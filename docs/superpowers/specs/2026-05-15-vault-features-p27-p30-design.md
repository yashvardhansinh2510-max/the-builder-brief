# Vault Features P27–P30 Design Spec
_Date: 2026-05-15_

## Scope

Four features shipped together as one implementation cycle:

- **P27** — Live Idea Discovery Feed (home page section)
- **P28** — Idea Comparison Tool (vault-archive + compare page)
- **P29** — Vault Trend Analytics page
- **P30** — Weekly Brief Archive redesign

---

## Architecture Decision: Hybrid Approach

**Problem:** `vaultsTable` in Postgres is missing `tier`, `tagline`, `scores`, `sourceAttribution`, `momentum`, `signalsCount`, `tags`. All 4 features depend on these.

**Decision:** Minimal DB migration (7 columns added to vaultsTable as jsonb/nullable) + serve existing `lib/data.ts` Issue array from API for briefs. No full signal infrastructure this sprint.

**What we are NOT building:** real-time signal ingestion, AI opportunity gap generation, sparkline signal history (stubbed).

---

## DB Migration

Add to `vaultsTable` (all nullable, backward-compatible):

```sql
ALTER TABLE vaults
  ADD COLUMN tier         VARCHAR(10)  DEFAULT 'free',   -- 'free' | 'pro' | 'max'
  ADD COLUMN tagline      TEXT,
  ADD COLUMN scores       JSONB,       -- { opportunity, problem, feasibility, whyNow, overall }
  ADD COLUMN source_attribution JSONB, -- [{ source, url, metric, value }]
  ADD COLUMN momentum     INTEGER DEFAULT 0,
  ADD COLUMN signals_count INTEGER DEFAULT 0,
  ADD COLUMN tags         TEXT[];
```

Update `vaultsTable` Drizzle schema to match. No data migration required — existing rows get NULLs; seed script populates sample data for dev.

---

## P27 — Live from the Vault (Home Page Section)

### Position
Between `<HeroSection>` and `<FeaturesSection>` in `home.tsx`.

### Component: `LiveVaultFeed`
New file: `artifacts/specflow-newsletter/src/components/LiveVaultFeed.tsx`

### Data
- `GET /api/vaults?sort=recent&pageSize=6` — no tier filter; returns all tiers
- No auth header sent (public endpoint, unauthenticated visitors)
- Auto-refresh: `setInterval` every 60s, swaps cards via `AnimatePresence` (framer-motion)

### Card rendering
- Use `VaultCard` with `layout="compact"`
- Each card shows: number badge, title, tagline, score badge, first 2 source platform icons (from `sourceAttribution[0..1].source`), "Published X days ago" (relative from `publishedAt`)
- `tier === 'pro'` or `tier === 'max'`: render card with `blur-sm` filter + overlay div "Unlock with Pro/Max →" linking to `/pricing`
- Free tier cards: fully visible, link to `/vault/${id}`

### CTA
Below grid: `"Explore All 200+ Ideas →"` → `/vault-archive`

### Auth
None required. No Clerk auth check in this component.

---

## P28 — Idea Comparison Tool

### Frontend changes

**1. VaultCard — compare mode**
Add optional prop `compareMode?: boolean` and `onCompareToggle?: (id: string, checked: boolean) => void`.
When `compareMode=true`: show checkbox in top-right corner of card.
Non-free vaults selected by free user → block with upgrade prompt (handled in parent).

**2. vault-archive.tsx**
- Add local compare state: `useState<string[]>([])` of selected vault ID strings (max 3)
- Pass `compareMode={true}` and `onCompareToggle` to each VaultCard
- Sticky bottom bar: `AnimatePresence` — appears when 1+ selected
  - Shows: "Comparing N ideas — [Compare →]" button
  - [Compare →] navigates to `/vault-compare?ids=1,2,3`
  - [×] clears selection
- Free user + non-free vault selected → show toast: "Upgrade to Pro to compare this idea"

**3. New page: `vault-compare.tsx`**
Route: `/vault-compare`
Data: reads `ids` from URL query params → `GET /api/vaults/compare?ids=1,2,3`

Layout (side-by-side, up to 3 columns):
- Header row: vault title + tier badge per column
- **Score bars**: `<GroupedBarChart>` (Recharts BarChart) — categories on Y-axis, colored bars per vault
- **Market size**: text comparison row
- **Signals count**: number comparison row
- **Source breakdown**: list of platform icons per vault
- **Feasibility vs Opportunity**: text cells
- **Verdict**: computed client-side — find highest scores per dimension, generate sentence like "Idea A scores higher on opportunity. Idea B is more feasible."
- "← Back to Archive" link

Max 3 ideas enforced: if URL has >3 ids, use first 3.

**4. App.tsx**
Add `<Route path="/vault-compare"><VaultCompare /></Route>`

### Backend

**New endpoint: `GET /api/vaults/compare?ids=1,2,3`**
File: `artifacts/api-server/src/routes/vaults.ts`
- Parse comma-separated integer IDs (max 3)
- Query `WHERE id IN (...)` and `isPublished = true`
- Auth check: if user is free tier, filter out pro/max vaults from results (return them with `locked: true` flag instead of full data)
- Returns: `{ vaults: Vault[], userTier: string }`

---

## P29 — Vault Trend Analytics Page

### Route
`/vault-trends` — added to `App.tsx`

### Gate
Pro/Max only. Render `<TierGate requiredTier="pro">` wrapping page content.

### PortalNav
Add "Trends" link visible only when user tier is pro or max.

### Backend: `GET /api/analytics/vault-trends`
New handler in `artifacts/api-server/src/routes/analytics.ts`

Returns:
```json
{
  "categoryCounts": [{ "category": "AI/ML", "count": 12, "priorCount": 8, "growth": 0.5 }],
  "momentumLeaders": [{ "id": 1, "title": "...", "momentum": 85, "tier": "pro" }],
  "publishHeatmap": [{ "date": "2025-01-01", "count": 2, "avgConfidence": 72 }],
  "signalSources": [{ "source": "reddit", "count": 45, "pct": 35 }],
  "opportunityGaps": [{ "signal": "AI in vertical agriculture", "signalCount": 12 }]
}
```

Queries:
- `categoryCounts`: `unnest(tags)` grouped + count, comparing last 30 days vs prior 30
- `momentumLeaders`: `ORDER BY momentum DESC LIMIT 5`
- `publishHeatmap`: `SELECT DATE(published_at), count(*), avg((scores->>'overall')::int) GROUP BY DATE(published_at)`
- `signalSources`: aggregate from `source_attribution` jsonb array (use `jsonb_array_elements`)
- `opportunityGaps`: static stub array for now (3 example entries)

### Frontend: `vault-trends.tsx`

Five sections, each a card:

1. **Trending Categories** — `<BarChart layout="vertical">` from Recharts. Two bars per category: current vs prior period. Growth rate badge.
2. **Momentum Leaders** — ranked list, each row: rank, title, tier badge, momentum score bar (simple `<div>` progress bar, no chart library needed).
3. **Publish Heatmap** — simplified: 12-week grid (7×12 squares), each cell colored by publish count. Custom SVG/div grid, no third-party lib needed.
4. **Signal Sources** — `<PieChart>` / `<RadialBarChart>` from Recharts. Platform icons next to labels.
5. **Opportunity Gaps** — static stub: 3 cards with signal label, count badge, "Suggest to research team →" button (`mailto:research@specflowai.com?subject=Vault+Opportunity+Gap`).

New file: `artifacts/specflow-newsletter/src/pages/vault-trends.tsx`

---

## P30 — Weekly Brief Archive Redesign

### Routes
- `/archive` — redesigned archive page (existing file rewritten)
- `/archive/:slug` — new brief detail page

Add detail route to `App.tsx`.

### Backend: `GET /api/briefs`
New handler (or new file `artifacts/api-server/src/routes/briefs-archive.ts`, registered in index.ts):

- **Source**: `lib/data.ts` is frontend-only. API gets its own copy as a new file `artifacts/api-server/src/data/issues.ts` — a direct copy of the issues array typed as a plain object array. No DB involved.
- Supports: `?page`, `?limit` (default 10), `?q` (full-text across title+tagline+problem), `?category`, `?year`, `?sort` (newest|oldest)
- Returns: `{ briefs: Brief[], total, page, hasMore }`

`Brief` shape (subset of Issue):
```ts
{ number, slug, title, category, tagline, problem, publishedAt, content: Issue }
```

`publishedAt` is inferred from issue number (week offset from launch date, or hardcoded per issue).

### Frontend: archive.tsx (rewrite)

**Search bar**: full-text debounced search hitting API
**Filters**: year tabs + category pill filters (same categories as current)
**Sort**: dropdown — Newest first / Oldest first
**Card**: issue number badge, title, category tag, relative date, 1-line excerpt (tagline), "Read Brief →" CTA
**Pagination**: "Load more" button (not pages)
**Fallback**: if API returns empty, fall back to `import { issues } from '@/lib/data'` rendered client-side

### Frontend: archive-detail.tsx (new page)

Route: `/archive/:slug`

Renders one Issue:
- Header: issue number, title, category badge, date, share button
- Sections rendered from structured Issue fields:
  - Problem statement
  - Why Now (bullet list)
  - Market Size + TAM
  - Build Blueprint (numbered steps)
  - AI Execution Prompts (code blocks)
  - First Revenue Path
  - First 10 Customers
- **Related vault**: if `vaultId` field present, show `<VaultCard>` (most won't have this yet — hide section)
- **Navigation**: "← Previous Issue" / "Next Issue →" (previous/next by issue number)
- **Share button**: `navigator.share({ title, url: window.location.href })` fallback to `navigator.clipboard.writeText(url)` + toast "Link copied"

---

## File Inventory

### New files
| File | Purpose |
|------|---------|
| `src/components/LiveVaultFeed.tsx` | P27 home section |
| `src/pages/vault-compare.tsx` | P28 compare page |
| `src/pages/vault-trends.tsx` | P29 analytics page |
| `src/pages/archive-detail.tsx` | P30 brief detail page |
| `lib/db/src/migrations/XXXX_vault_fields.sql` | DB migration |

### Modified files
| File | Change |
|------|--------|
| `src/pages/home.tsx` | Insert LiveVaultFeed between Hero + Features |
| `src/components/VaultCard.tsx` | Add compareMode prop + checkbox |
| `src/pages/vault-archive.tsx` | Add compare state + sticky bar |
| `src/pages/archive.tsx` | Full redesign (search/filter/API) |
| `src/components/PortalNav.tsx` | Add Trends link for pro+ |
| `src/App.tsx` | Add 3 new routes |
| `artifacts/api-server/src/routes/vaults.ts` | Add /compare endpoint |
| `artifacts/api-server/src/routes/analytics.ts` | Add /vault-trends endpoint |
| `artifacts/api-server/src/routes/index.ts` | Register briefs-archive route |
| `lib/db/src/schema/vaults.ts` | Add 7 new columns |

---

## Build Sequence

1. DB migration + Drizzle schema update
2. P27: LiveVaultFeed component + home.tsx insertion
3. P28: VaultCard compare prop → vault-archive sticky bar → compare page → compare API endpoint
4. P29: vault-trends page + analytics endpoint + PortalNav link + App.tsx route
5. P30: briefs API endpoint → archive.tsx redesign → archive-detail.tsx + App.tsx route

Each step is independently shippable.

---

## Non-goals (this sprint)
- Real-time signal ingestion
- AI-generated opportunity gaps (stubbed with static data)
- Sparkline signal history charts (momentum score shown as number only)
- Vault-to-brief linking (vaultId on briefs)
- New `newsletter_briefs` DB table (serve static data from API)
