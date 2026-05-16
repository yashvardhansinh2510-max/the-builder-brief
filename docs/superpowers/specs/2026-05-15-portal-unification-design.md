# Portal Unification + UX Overhaul — Design Spec

**Date:** 2026-05-15  
**Scope:** Prompts 16–19 — unify three portal pages into one tier-aware dashboard, redesign PortalNav, WelcomeHero, and IntelligenceFeed.

---

## Prompt 16 — Portal Unification

### Goal
Collapse `pro-portal.tsx`, `max-portal.tsx`, and `user-portal.tsx` into a single tier-aware dashboard at `/dashboard`.

### Route changes (App.tsx)
- Remove imports: `ProPortal`, `MaxPortal`, `ProtectedProPortal`, `ProtectedMaxPortal`
- Replace `/pro-portal` route with `<Redirect to="/dashboard" />`
- Replace `/max-portal` route with `<Redirect to="/dashboard" />`
- Keep `/dashboard` and `/user-portal` pointing to `UserPortal`

### Files deleted
- `artifacts/specflow-newsletter/src/pages/pro-portal.tsx`
- `artifacts/specflow-newsletter/src/pages/max-portal.tsx`

### Tab system (user-portal.tsx)
Exactly 6 tabs, replacing legacy `performance | terminal | engine | growth | strategy` variants:

| Tab | Route key | Tier gate | Default for |
|---|---|---|---|
| Intel | `intel` | all | all tiers |
| Vault | `vault` | all (depth varies) | — |
| Playbook | `playbook` | pro/max/incubator | pro+ |
| Arsenal | `arsenal` | pro/max/incubator | — |
| Path | `path` | all | — |
| Alliance | `alliance` | max/incubator | — |

Default tab: `intel` for free, `intel` for pro/max (previously `playbook`).

### Content migration

**Intel tab** (was IntelligenceFeed sidebar):
- New full-width IntelligenceFeed component (see Prompt 19)
- Below feed: DailyBriefUI + PersonalizationUI (gated: `isPremium`)

**Playbook tab** (existing `PlaybookTab`):
- Existing content unchanged
- Max-only section at bottom: burn rate calculator, defensibility score, exit payout calculator (migrated from max-portal)
- Locked wall for free tier

**Arsenal tab** (existing `ArsenalTab`):
- Existing content unchanged
- Append at bottom (gated: `isPremium`): CompetitorScanner, CoFounderMatcher, Command Field tools (4 tools from pro-portal)
- Locked wall for free tier

**Alliance tab** (existing `AllianceTab`):
- Existing content unchanged
- Append FounderSocialLayer (from pro-portal, was section 4.75)

**Vault tab** (`VaultTab`) — no change.

**Path tab** (`PathTab`) — no change.

### State cleanup
- Remove `isBonusUnlocked`, `showLoginBonus`, `selectedLesson` if they were only used by deleted tab variants
- Remove ticker state (moved from pro-portal — no longer needed as separate page)
- Keep `activeTab` typed as `"intel" | "vault" | "playbook" | "arsenal" | "path" | "alliance"`
- Remove old tab values from URL param handler

---

## Prompt 17 — PortalNav Redesign

### Goal
Single fixed 60px bar replacing the current two-bar nav. Tab navigation lives inside the nav (for the 6 portal tabs). Framer Motion sliding underline indicator.

### Structure

```
[Logo 32px] [The Builder Brief serif]  |  [Intel][Vault][Playbook][Arsenal][Path][Alliance]  |  [FREE/PRO/MAX pill] [🔥 N] [<UserButton>] [Upgrade btn]
```

### Props
```ts
interface PortalNavProps {
  activeTab: "intel" | "vault" | "playbook" | "arsenal" | "path" | "alliance";
  onTabChange: (tab: PortalNavProps["activeTab"]) => void;
  streak: number;
}
```

### Tab locking rules
- Playbook, Arsenal: locked if `!isPremium` (free tier)
- Alliance: locked if `tier !== "max" && tier !== "incubator"`
- Intel, Vault, Path: always unlocked

### Scroll behavior
- `useEffect` with `scroll` event listener
- `scrollY > 100` → `solid: true` state → add `bg-background border-b border-border/40`, remove `bg-background/80`

### Active indicator
- `<motion.div layoutId="portal-tab-indicator">` absolutely positioned underline (2px, primary color)
- Sits inside each tab button's container; only renders on the active tab

### Clerk avatar
- `<UserButton />` from `@clerk/react` — built-in dropdown with Profile + Sign Out
- Replace manual sign-out button

### Upgrade button
- Visible when `tier === "free" || tier === "pro"`
- Routes to `/pricing`

### Mobile
- `< lg`: show hamburger (`Menu` icon from lucide)
- `<Sheet>` from `@/components/ui/sheet` — slide-out from left
- Sheet content: logo header + stacked tab list (same lock logic) + tier badge + Upgrade CTA

### PortalNav replaces the `activePage` prop
- Old: `activePage: "dashboard" | "pro" | "max" | ...`
- New: `activeTab` + `onTabChange` (portal-internal) plus the secondary nav links (Build/Ground Game/Library) move to a slim sub-bar below, or are removed (deferred — not in this spec)

---

## Prompt 18 — WelcomeHero Redesign

### Goal
Single JSX render replacing three tier-conditional blocks. Mission control layout.

### Props (unchanged)
```ts
interface WelcomeHeroProps {
  tier: string;
  firstName: string;
  streak: number;
  chatUsageThisMonth: number;
  eligibleReward: Reward | null;
  nextReward: Reward | null;
  onClaimReward: (reward: Reward) => void;
}
```

### Layout
Desktop: `flex flex-row gap-8` — left 60%, right 40%.  
Mobile: `flex flex-col`.

### Left panel
- **Date line:** computed — `"FRIDAY, MAY 15 — WEEK 20"` format, `font-mono uppercase text-[10px] tracking-[0.4em] text-muted-foreground/60`
- **Greeting:** `"Good to have you back, {firstName}."` — `font-serif text-5xl md:text-7xl`
- **Subtitle:** tier-switch:
  - `free` → `"Next drop lands Friday."`
  - `pro` → `"Vault is live. Signals are in."`
  - `max | incubator` → `"Your advisor is standing by."`
- **Action links (2–3):** tier-switch:
  - `free` → "Open the Vault →" (→ sets activeTab vault), "See Blueprints →" (→ /blueprints)
  - `pro` → "Open Briefing →" (→ intel tab), "Full Vault →" (→ vault tab)
  - `max` → "Book AI Session →" (→ #ai-advisor), "Inner Circle →" (→ alliance tab)

### Right panel — stats card
Dark card: `bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white`

Stats grid (2×2):
- **Streak:** `{streak}` large + flame icon
- **Vault:** `"LIVE"` (pro/max) or `"LOCKED"` (free)
- **Next Drop:** computed days until next Friday
- **AI Advisor** (max/incubator only): `"{20 - chatUsageThisMonth} sessions"`; empty slot for other tiers

### Reward overlay
If `eligibleReward !== null`: position `absolute inset-0` over stats card with claim UI (existing design, ported from free-tier hero).

### Animation
Single `<motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>` wrapper — no per-tier motion variants.

---

## Prompt 19 — IntelligenceFeed Redesign

### Goal
Bloomberg-style market signal feed. Replaces the sidebar telemetry/daily-edge widget. Becomes full-width content for the Intel tab.

### New props (simplified)
```ts
interface IntelligenceFeedProps {
  tier: string;
  isPro: boolean;
  startupCtx: StartupContext | null;
  chatUsageThisMonth: number;
  onChatUsageUpdate: (next: number) => void;
  onShowContextModal: () => void;
  onUpgradeClick: () => void;
}
```
Props removed (no longer needed from parent): `telemetryLogs`, `dailyEdge`, `personalizedBrief`, `roadmapSteps`, `completedSteps`, `onCopyHack`, `onToggleStep`.

### Signal type
```ts
type Platform = "reddit" | "youtube" | "hn" | "ph" | "linkedin";

interface Signal {
  id: string;
  platform: Platform;
  headline: string;
  url: string;
  publishedAt: string; // ISO
  topic?: string;
  relevanceScore?: number; // 0–1
}
```

### Internal state
- `signals: Signal[]`
- `filter: "all" | Platform`
- `loading: boolean`
- `lastUpdated: Date | null`

### Data fetching
- `GET /api/engine/signals` on mount
- If response not ok or network error → use `MOCK_SIGNALS` (8–10 static items covering all platforms)
- `setInterval(fetchSignals, 5 * 60 * 1000)` — clean up on unmount

### Trend detection (client-side)
- Group filtered signals by `topic`
- Topics with ≥3 signals where `publishedAt` is within last 24h → `trendTopics: string[]`
- Render amber "TREND DETECTED" card at top of feed for each trend topic (max 2 shown)

### Feed layout
1. **Header row:** "Market Intelligence" title + `lastUpdated` timestamp + source filter pills (All / Reddit / YouTube / HN / Product Hunt / LinkedIn)
2. **Trend cards** (if any): amber `bg-amber-500/10 border-amber-500/30` card per trend topic
3. **Feed list** (filtered signals, newest first):
   - Platform icon (colored: Reddit=orange, YT=red, HN=orange, PH=orange/cat, LinkedIn=blue)
   - Headline (2-line clamp, `font-serif`)
   - Source chip (URL domain, clickable)
   - Relative time (`"2h ago"`)
   - Relevance badge if `relevanceScore >= 0.7 && startupCtx !== null`
4. **Empty state:** shown when `!loading && signals.length === 0`
5. **DailyBriefUI + PersonalizationUI** (appended below feed, gated `isPro`)

### API endpoint (api-server)
- `GET /api/engine/signals` — new route in `artifacts/api-server/src/routes/`
- Returns `{ signals: Signal[] }` or falls back to empty array
- Stub implementation returning mock data is sufficient for initial ship

---

## Implementation order

1. Add `/api/engine/signals` stub endpoint
2. Redesign `IntelligenceFeed.tsx`
3. Redesign `WelcomeHero.tsx`
4. Redesign `PortalNav.tsx`
5. Unify portals in `user-portal.tsx` (tab rename, content migration)
6. Update `App.tsx` (remove routes, add redirects)
7. Delete `pro-portal.tsx`, `max-portal.tsx`
