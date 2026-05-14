# Vault System Overhaul — Design Spec
Date: 2026-05-15

## Overview

Full rebuild of the vault system across DB, API, and frontend. Goal: ideabrowser.com-grade discovery surface with Bloomberg terminal-level detail pages, real bookmarking, and a weekly digest in the user portal.

Five prompts delivered as one coordinated overhaul:
- P11: VaultCard redesign
- P12: VaultArchive discovery surface
- P13: VaultDetail deep-dive page
- P14: Bookmarking system (backend + frontend)
- P15: Weekly digest in VaultTab

---

## Architectural Decision: DB Schema Expansion

**Problem:** `vaultsTable` currently has only `title, description, content, isPublished, publishedAt`. The frontend `vault-types.ts` rich interface (scores, momentum, tier, signals, tags) is aspirational — the API passes raw rows through unchanged. Sorting by momentum/score and filtering by tier require real DB columns.

**Decision:** Expand `vaultsTable` with typed columns for all rich fields. Add `vaultBookmarksTable` for bookmarking. Write a migration script alongside schema changes.

---

## Layer 1 — DB Schema

### `lib/db/src/schema/vaults.ts` — new columns added to `vaultsTable`

| Column | Type | Notes |
|---|---|---|
| `tagline` | varchar(500) | One-line hook |
| `problemStatement` | text | Problem callout |
| `tier` | varchar(10) | 'free' / 'pro' / 'max' |
| `momentum` | integer | 0–100, signal growth rate |
| `daysActive` | integer | Days since first signal |
| `signalsCount` | integer | Total signal count |
| `marketSize` | varchar(255) | e.g. "$4.2B" |
| `tam` | varchar(255) | Total addressable market |
| `unitEconomics` | text | Prose narrative |
| `keywordsTrending` | text[] | Pill badges |
| `tags` | text[] | Category tags for filter pills |
| `scoresJson` | jsonb | `{ opportunity, problem, feasibility, whyNow, overall }` each 0–100 |
| `signalsJson` | jsonb | `{ reddit[], youtube[], hn[], ph[], linkedin[], twitter[] }` + `sourceAttribution[]` |
| `verificationJson` | jsonb | `{ marketSizeVerified, tamVerified, unitEconomicsVerified, confidenceScore, issues[] }` |

All new columns nullable with sensible defaults (0 for numerics, '[]'::jsonb for arrays).

### `lib/db/src/schema/vault-bookmarks.ts` — new table

```
vaultBookmarks (
  id          serial PRIMARY KEY,
  userId      text NOT NULL,          -- Clerk userId
  vaultId     integer NOT NULL FK → vaults.id ON DELETE CASCADE,
  createdAt   timestamp with tz DEFAULT now()
  UNIQUE (userId, vaultId)
)
```

### `lib/db/src/schema/index.ts`

Export `vaultBookmarksTable` alongside existing exports.

### Migration

Script at `lib/db/scripts/manual-migrate-vault-overhaul.ts`:
- ALTER TABLE vaults ADD COLUMN for each new column
- CREATE TABLE vault_bookmarks
- Run via `npx tsx lib/db/scripts/manual-migrate-vault-overhaul.ts`

---

## Layer 2 — API (`artifacts/api-server/src/routes/vaults.ts`)

### Auth helpers

Add `requireAuth` inline function (mirrors `optionalAuth` but returns 401 if no userId).

### `GET /vaults` — updated

New query params handled:
- `sort` — `score | momentum | recent | signals` (maps to DB columns)
- `order` — `asc | desc`
- `tier` — `free | pro | max` (exact match filter; tier-gated: free users can only see free)
- `minScore` — integer filter on `scoresJson->>'overall'` cast to int
- `dateFrom` — ISO string, filter `publishedAt >= dateFrom`
- `q` — full-text search on `title || tagline || problemStatement`

Response shape adds `bookmarkCount` per vault (LEFT JOIN count from `vaultBookmarks`).

Tier gating — partial preview mode: free users receive full data for `tier = 'free'` vaults. For higher-tier vaults, the API returns a preview stub: `{ id, title, tagline, tier, isLocked: true }` with all score/signal fields null. This lets the archive show blurred teaser cards without leaking gated data.

### `GET /vaults/tags` — new, public

Returns `string[]` of all unique tag values across published vaults. Used to populate category filter pills in the archive. No pagination needed.

### `GET /vaults/bookmarks` — new, requires auth

Returns full vault objects for all vaults the user has bookmarked. Uses `requireAuth`.

### `GET /vaults/:id` — updated

Returns full vault shaped to `Vault` interface (maps jsonb columns to typed fields). Adds `isBookmarked: boolean` if user is authenticated.

### `POST /vaults/:id/bookmark` — new, requires auth

Toggle: if row exists in `vaultBookmarks(userId, vaultId)`, delete it; else insert. Returns `{ bookmarked: boolean }`.

### `POST /vaults/:id/feedback` — unchanged (already exists)

---

## Layer 3 — Frontend Types

### `vault-types.ts` additions

```ts
// Added to Vault interface
bookmarkCount?: number;
isBookmarked?: boolean;

// Added to VaultFilter
category?: string;   // matches tags[]
dateFrom?: Date;     // already exists, confirm used for weekly digest
```

### `useVaults.ts` additions

```ts
bookmarkVault(vaultId: string): Promise<{ bookmarked: boolean }>
fetchBookmarkedVaults(): Promise<void>
bookmarkedVaults: Vault[]
```

Auth token passed via `Authorization: Bearer <clerkToken>` header using `useAuth().getToken()` from Clerk.

---

## Layer 4 — VaultCard (P11)

**File:** `artifacts/specflow-newsletter/src/components/VaultCard.tsx`

Full redesign. Accepts `isBookmarked?: boolean` prop in addition to existing props.

### Visual structure (both layouts share these atoms)

**Gradient border:** `border border-transparent bg-gradient-to-br from-border via-border/30 to-border` with `hover:from-primary/40 hover:via-primary/20 hover:to-border` — implemented via CSS `background-clip: padding-box` + pseudo-element overlay or Tailwind ring trick.

**Tier badge pill:**
- FREE: `bg-slate-100 text-slate-600` (dark: `bg-slate-800 text-slate-300`)
- PRO: `bg-violet-100 text-violet-700` (dark: `bg-violet-900/40 text-violet-300`)
- MAX: `bg-amber-100 text-amber-700` (dark: `bg-amber-900/40 text-amber-300`)

**Score ring:** SVG `<circle>` with `strokeDasharray` / `strokeDashoffset` computed from `score/100`. Colors: ≥75 `stroke-green-500`, ≥50 `stroke-amber-500`, <50 `stroke-red-500`. Ring animates on mount via framer-motion `animate={{ strokeDashoffset }}`.

**Score bars:** 4 horizontal `<div>` bars (Opportunity / Problem / Feasibility / Why Now). Width = `score%`. Color same threshold as ring.

**Source icons:** Text-based — `r/` reddit, `▶` youtube, `Y` HN, `PH` ProductHunt. Colored (primary) if source array is non-empty, muted otherwise.

**Momentum badge:** `🔥` shown if `momentum > 70`.

### Compact layout

Top row: tier badge | momentum badge | signals count pill
Title (serif, `text-xl font-bold`) | score ring (48px)
Tagline (2 lines, muted)
Source icons row
Footer: days active + published date

### Expanded layout

All compact content, plus:
- 4 score bars beneath ring
- "View Idea →" Link button (wouter)

### Animation

`motion.div` with `initial={{ opacity: 0, y: 16 }}` `animate={{ opacity: 1, y: 0 }}` `transition={{ delay: displayIndex * 0.05 }}`.
Hover: `whileHover={{ y: -4, boxShadow: '...' }}`. Score ring: `scale(1.05)` on card hover via CSS group-hover.

---

## Layer 5 — VaultArchive (P12)

**File:** `artifacts/specflow-newsletter/src/pages/vault-archive.tsx`

Full redesign. Keeps `ModeContext` offline filter.

### Layout

```
<PortalNav>
<HeroHeader>         sticky-ish, collapses 60px on scroll (useScrollY)
<FilterBar>          sticky top-[nav-height], z-20
<main grid>
  <ResultsArea>      flex-1
  <Sidebar>          w-72, hidden below lg breakpoint, sticky
<Footer>
```

### HeroHeader

Serif headline "The Idea Vault". Subtitle. Live counter badge (from `total`). Three stat pills: avg overall score | most-signaled tag | count of vaults with `publishedAt >= 7 days ago`.

Collapses: on scroll past 120px, header shrinks to 64px showing only headline + counter. `useScrollY` from framer-motion.

### FilterBar

- Search: full-width mobile, 360px desktop, 500ms debounce (existing pattern)
- Category pills: horizontal scroll. "All" + unique tag values from `GET /vaults/tags` (fetched once on mount, returns `string[]`). Active pill has `bg-primary text-primary-foreground`.
- Sort dropdown: Confidence Score | Momentum | Recently Added | Most Signals
- Score slider: 0–100 minimum confidence
- Tier tabs: All | Free | Pro | Max. Pro/Max tabs show lock icon if user is free tier (visual only — server already gates data)
- Layout toggle: Grid (2-col) | List | Compact (3-col, compact VaultCard)

### ResultsArea

Grid of VaultCard (rebuilt). Load More button (existing pattern).

Empty state: SVG illustration (inline, simple magnifying glass) + "No ideas match your filters. Try widening the search."

Locked card overlay: For cards where `vault.tier` is above user tier (detected client-side from auth context), render VaultCard with `pointer-events-none opacity-60 blur-sm` wrapper + absolute lock icon + "Upgrade to Pro/Max" pill. Clicking triggers upgrade modal (reuse existing upgrade flow).

### Sidebar (desktop only, `lg:block hidden`)

**"This Week's Top Pick":** The highest-momentum vault from current result set. Shows title, scores, tagline, "View Idea →" link.

**Trending categories:** Bar chart — count ideas per tag. Rendered as simple relative-width divs (no chart library needed).

**Upgrade CTA:** Shown if user is free or pro. "Unlock Max Tier" with pricing teaser.

---

## Layer 6 — VaultDetail (P13)

**File:** `artifacts/specflow-newsletter/src/pages/vault-detail.tsx`

Full redesign.

### 1. Header Strip

Tier badge + momentum badge + `{daysActive} days active` pill.
Title: `font-serif text-5xl md:text-7xl font-bold`.
Tagline + problem statement callout box.
Action bar: Like (heart, filled if liked) | Save (bookmark, filled if saved — wired to `/bookmark` endpoint) | Share (navigator.share + clipboard fallback) | Copy Link.
Share toast stays as-is.

### 2. Scorecard Hero

Full-width card. Large SVG gauge (semicircle, 0–100) for overall score — needle position computed from score. Below gauge: 4 sub-score bars. Data Quality badge showing `verificationData.confidenceScore`.

### 3. Three-Column Layout

**Left — Market Intelligence:**
- Market size text + TAM
- `VaultMarketChart` (existing component)
- Trending keywords as pill badges

**Center — The Thesis:**
- `vault.description` in prose
- Problem statement in a `border-l-4 border-primary pl-4` callout
- Unit economics formatted breakdown

**Right — Signal Dashboard:**
- `VaultSignals` (existing component)
- Total signal count with platform breakdown
- Source attribution list (platform icon + link)

### 4. Verification Section

Keep existing grid. Add tooltip (title attribute) per status cell explaining verified/unconfirmed/contradicted. Add "Last verified" = `vault.updatedAt` formatted.

### 5. Execution Section (Pro/Max gate)

If user tier is free: blur + lock overlay + "Upgrade to Pro to unlock execution playbook" CTA.

If pro/max:
- "Build This" heading
- 6-step checklist derived from vault data:
  1. Validate the problem (link to vault's top signal)
  2. Define your ICP (from tags/market data)
  3. Build MVP (from feasibility score context)
  4. Price it (from unit economics)
  5. Find first 10 customers (static template per tier)
  6. Ship and iterate
- First Revenue Path: pricing/timeline callout box (from `unitEconomics` field)
- First 10 Customers: short paragraph (template-derived)

### 6. Related Ideas

3 compact VaultCards from `relatedVaults`. Rendered in 3-col grid.

### 7. Bottom CTA

Free users: upgrade prompt. Pro/Max: "Add to your build list" → link to `/blueprints`.

---

## Layer 7 — VaultTab Weekly Digest (P15)

**File:** `artifacts/specflow-newsletter/src/components/portal/VaultTab.tsx`

Replace current grid of vaults with:

1. Section title "This Week's Top Ideas"
2. Fetch via `fetchVaults({ sortBy: 'momentum', sortOrder: 'desc', dateFrom: 7daysAgo }, pageSize=3)`
3. Three horizontal cards (full-width, not grid): title + tagline + momentum score pill + signal count + "Dive In →" Link
4. "New" badge: if `publishedAt >= 48h ago`
5. Empty state: "Next drop lands Friday. Come back then."
6. Below cards: "View Full Vault Archive →" link in primary color

Visibility: all tiers. Server already gates tier appropriately so free users see free vaults, pro/max see theirs.

`isPro` prop still accepted but no longer used for gating (free users see their vaults too). `onUpgradeClick` prop retained for the upgrade modal trigger in the archive.

---

## Implementation Order

1. DB schema + migration script
2. API updates (vaults.ts)
3. vault-types.ts + useVaults.ts
4. VaultCard
5. VaultTab (portal)
6. VaultArchive
7. VaultDetail

Each step is independently testable. DB and API first so frontend has real data to render against.

---

## Out of Scope

- AI-generated execution checklists (using template derivation instead)
- Chart library (using CSS bar widths)
- Virtualized infinite scroll (Load More is sufficient)
- Sidebar trending bar chart (CSS relative-width divs, not recharts)
