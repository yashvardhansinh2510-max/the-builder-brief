# Section 4 UX Overhaul — Design Spec

**Date:** 2026-05-15
**Scope:** Prompts 20–25 — six page redesigns across the specflow-newsletter frontend and api-server

---

## P20 — Home Hero Redesign

**File:** `artifacts/specflow-newsletter/src/pages/home.tsx`
**Target:** `HeroSection` component (lines 62–210)

### Changes

**Headline**
- Text: `"Every week, one startup idea. Researched. Scored. Ready to build."`
- Font: serif, 72px desktop / 40px mobile
- No animated word-by-word reveal (keep motion entrance, drop per-word stagger)

**Live Preview Card (new)**
- Fetches `GET /api/vaults?pageSize=1&order=desc` on mount (unauthenticated, public endpoint)
- While loading: skeleton card (title shimmer, 4 score badge shimmers)
- Loaded state shows:
  - Idea title (bold, serif)
  - Tagline (muted, one line)
  - Four score badges: Opportunity / Problem / Feasibility / Why Now — sourced from `vault.scores`
  - CTA: `"Subscribe to unlock this →"` (links to the subscribe form below, not a new page)
- Card uses same visual language as `VaultCard` (border, rounded-2xl, bg-card)

**Subscribe Form**
- Moved below the preview card
- Placeholder: `"Your founder email"`
- Submit button: `"Get Friday's Idea"`
- Existing `useSubscribe("hero")` hook and `onSuccess` callback — unchanged

**Social Proof Bar**
- Inline text below form: `"Join 15,000+ founders • 500+ companies shipped • Free forever"`
- No separate `StatsBar` section removed — just the inline stat text in the hero changes format

**Removals**
- Delete the `contents` array and any render of it inside `HeroSection`
- The `contents` data belongs in `FeaturesSection` (already there — just remove from hero)

---

## P21 — Auth Page + Onboarding Quiz

### Part 1 — Auth Page

**File:** `artifacts/specflow-newsletter/src/pages/auth.tsx`

**Left panel (40% desktop, hidden mobile):**
- Replace animated streaks + brand copy with a vault teaser card
- Fetches same endpoint: `GET /api/vaults?pageSize=1&order=desc`
- Card shows: idea title, tagline, score badge (overall score only) — score blurred with `blur-sm` CSS
- Label below score: `"Sign in to see the full breakdown"`
- Background: keep existing gradient/glow, place card centered over it

**Right panel (60% desktop, 100% mobile):**
- Clerk component unchanged
- Mobile layout: logo above Clerk, no left panel

**Shared vault teaser card:**
- Extract as `VaultTeaserCard` component in `src/components/VaultTeaserCard.tsx`
- Props: `{ blur?: boolean }` — home hero uses `blur=false`, auth page uses `blur=true` on score
- Reuses the same fetch logic (either a shared hook or inline fetch with `useEffect`)

### Part 2 — Onboarding Quiz

**File:** `artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx`
**Full rewrite**

**Questions (3 only — replaces existing 5):**
1. `"What stage are you at?"` — options: Idea / Building / Launched / Scaling
2. `"What's your primary goal with The Builder Brief?"` — options: Find an idea / Validate my idea / Grow my startup / Get investors
3. `"What's your biggest constraint right now?"` — options: Time / Money / Technical skills / Finding customers

**Data contract:**
- Submit via `PATCH /api/subscribers/me` with body `{ stage, goal, constraint }`
- New endpoint (see API section below)
- Field mapping to existing DB columns:
  - `stage` → `startupStage` (already exists)
  - `goal` → stored in `portalState.goal` (jsonb, already exists — no migration)
  - `constraint` → `biggestChallenge` (already exists)

**UX:**
- Full-screen, centered, dark background
- One question visible at a time
- Animated slide transition between questions (framer-motion `AnimatePresence`, x-axis slide)
- Progress: dots at top (3 dots, filled = answered), not a bar
- Selecting an option auto-advances (no "Next" button needed for select questions)
- Final question → submit button `"Let's go →"` → on success redirect to `/dashboard`

**API — new endpoint:**
`PATCH /api/subscribers/me` in `artifacts/api-server/src/routes/subscribers.ts`
- Auth: `verifyUser` middleware
- Body: `{ stage?: string, goal?: string, constraint?: string }`
- Updates matching subscriber row by email
- Returns `200 { ok: true }` or `404` if subscriber not found

---

## P22 — Blueprints Page Redesign

**File:** `artifacts/specflow-newsletter/src/pages/blueprints.tsx`
**Full rewrite**

### File Rename (do first)
- `TractioinProofSection.tsx` → `TractionProofSection.tsx`
- Update imports in: `blueprints.tsx` and `issue.tsx` (confirmed both import it)

### Layout

**Header**
- Title: `"Execution Blueprints"`
- Subtitle: `"Not theory. Not inspiration. Execution-ready playbooks for specific startup stages."`
- Stage filter pills: Validate / Build / Scale / Exit
  - Active pill: `bg-primary text-primary-foreground`
  - Filtering controls which blueprint cards are visible (client-side, no API call)

**Blueprint Card Grid**
- 2-col desktop / 1-col mobile
- Each card data (hardcoded, not from API):

| Title | Stage | Description | Time |
|---|---|---|---|
| Architecture Diagram | Build | System design for your MVP | 2h |
| Compliance Timeline | Build | Legal and compliance milestones | 3h |
| Exit Dashboard | Scale | Metrics and readiness for exit | 4h |
| Global Arbitrage Map | Validate | Geographic market opportunity | 1h |
| Hiring Roadmap | Scale | First 10 hires, sequenced | 2h |
| PLG Sequence | Build | Product-led growth motion | 3h |
| Traction Proof | Validate | Evidence framework for investors | 2h |
| Unit Economics Calculator | Validate | LTV/CAC/payback period model | 1h |

- Card elements: stage badge (pill), serif title, one-line description, `"Time to complete: X hours"`, `"Open Blueprint →"` CTA
- CTA scrolls to the matching detail section (anchor link `#blueprint-{slug}`)

**Blueprint Detail Sections**
- Rendered below the grid, one `<section id="blueprint-{slug}">` per blueprint
- Each section: title, description paragraph, the interactive component, `"Next Blueprint →"` button
- Tier gate: `<TierGate requiredTier="pro">` wraps each detail section
  - Free users see: blurred component preview + `"Upgrade to Pro to unlock"` overlay

**Components rendered (after rename):**
```
ArchitectureDiagram, ComplianceTimeline, ExitDashboard,
GlobalArbitrageMap, HiringRoadmap, PLGSequence,
TractionProofSection, UnitEconomicsCalculator
```

---

## P23 — Pricing Page Redesign

**File:** `artifacts/specflow-newsletter/src/pages/pricing.tsx`
**Full rewrite**

### Structure

**Headline**
- `"Stop paying for ideas you'll never build. Start with one."`

**Comparison Table**
- 3 columns: `"What others charge"` / `"What you need"` / `"What we deliver"`
- Rows (example content):
  - Business books ($30) / One actionable idea / Weekly researched idea + blueprint
  - Consultants ($500/hr) / Execution plan / Step-by-step build guide
  - Other newsletters ($0) / Real market intelligence / Scored opportunity analysis

**Tier Cards (3)**

| | Free | Pro | Max |
|---|---|---|---|
| Label | Tester | Builder | Operator |
| Price | $0 | $29/mo | $99/mo |
| Badge | — | Most Popular | — |
| What you get | 1 free idea/month, basic vault, newsletter | Full vault, blueprints, AI templates, weekly briefs | Everything in Pro + investor matching, co-founder network, monthly strategy call, private community |
| Value anchor | — | "Less than a business book. More than a co-founder." | "Your first investor intro pays for 3 years of Max." |
| CTA | Start Free | Start Building | Go Max |
| CTA style | outline | primary (filled) | secondary |

- Existing `usePayments` hook and `handleTierClick` logic — preserved

**Guarantee Strip**
- Full-width band below cards
- `"30-day no-questions refund. If you don't find one idea worth building, we'll give you your money back."`

**FAQ (5 questions, accordion)**
1. Is the newsletter actually free?
2. What's the difference between Pro and Max?
3. Can I cancel anytime?
4. How often do new ideas drop?
5. What if I already have an idea?

---

## P24 — Ground Game Redesign

**Files:**
- `artifacts/specflow-newsletter/src/pages/ground-game.tsx`
- `artifacts/specflow-newsletter/src/components/ground-game/CountrySelector.tsx`
- `artifacts/specflow-newsletter/src/components/ground-game/CategoryFilterBar.tsx`
- `artifacts/specflow-newsletter/src/components/ground-game/GroundGameCard.tsx`
- `artifacts/specflow-newsletter/src/components/ground-game/GroundGameDrawer.tsx`

### Changes

**Header**
- Title: `"Ground Game"`
- Subtitle: `"The unglamorous, works-in-real-life playbook for getting your first 100 customers."`

**CountrySelector.tsx**
- Primary UI: SVG world map with clickable country pins (use a minimal inline SVG with `<circle>` pins at lat/lng positions for supported countries)
- Fallback: `<select>` dropdown (same options as today, shown if SVG not supported or on narrow screens)
- Active country: pin turns `text-primary`, grows slightly on hover

**CategoryFilterBar.tsx**
- Restyle as horizontal pill tabs
- Active: `bg-primary/10 text-primary border-primary/30`
- Inactive: `border-border text-muted-foreground`

**GroundGameCard.tsx**
- Tactic name (`idea.title`): bold
- Effort badge: mapped from `idea.difficulty` — "Founder-Friendly"=green / "Requires Local Network"=yellow / "Capital Intensive"=red pill
- Expected result: `idea.hook` (the one-liner hook field)
- Founder quote / why-now: `idea.whyNow` in italic, muted, clamped to 1 line
- `"Expand"` button → opens `GroundGameDrawer`

**GroundGameDrawer.tsx**
- Header: `idea.title` + `idea.category` badge + country flag emoji
- Body: numbered steps from `idea.gtmSteps` array
- AI Angle block: `idea.aiAngle` in code-block style (shows tactical scripts/templates)
- Revenue model: `idea.revenueModel` as a callout
- CTA: `"Try this tactic"` — copies `idea.gtmSteps[0]` to clipboard, button label flips to `"Copied!"` for 2s

**Offline mode toggle**
- Reuse `ModeContext` (already imported in page)
- When `mode === "offline"`: filter `filteredIdeas` to only show tactics where `idea.mode === "OFFLINE"`
- Toggle UI: small pill switch in the header, same pattern as existing mode toggle elsewhere

---

## P25 — Idea Agent Page Redesign

**Files:**
- `artifacts/specflow-newsletter/src/pages/idea-agent.tsx` — full rewrite
- `artifacts/api-server/src/routes/idea-agent.ts` — full implementation

### Frontend

**Layout**
- `"Idea Agent"` header + `"Drop your idea. Get a brutally honest analysis in 60 seconds."` subtitle
- Input panel:
  - Large `<textarea>` — `"Describe your startup idea in 2-3 sentences"`
  - Collapsible context section (Collapsible from shadcn/ui): Stage dropdown, Target market text, Budget range select
  - Submit button: `"Analyze This Idea →"` — full-width on mobile
  - Below: `"Or pick a random idea from the vault →"` — links to `/vault-archive`
- Usage meter: shown above submit button. Free: `"X of 2 analyses left this month"`. Pro: `"X of 20 left"`. Max: `"Unlimited"`.

**Analysis output (animated in after submit)**
- Seven labeled sections rendered as they stream in:
  1. SCORECARD — 4-dimension score display (Opportunity / Problem / Feasibility / Why Now), numeric 0–100
  2. MARKET SIZE — TAM estimate + reasoning paragraph
  3. COMPETITOR GAPS — bullet list
  4. WHY NOW — 3 bullets
  5. FIRST 10 CUSTOMERS — specific strategy paragraph
  6. FIRST REVENUE PATH — pricing model + timeline
  7. RISK FLAGS — 2–3 specific risks

- Each section header appears first, content streams in below it
- Sections animate in with `motion.div` fade-up as their first token arrives

**Export bar (appears after analysis completes)**
- `"Copy as Markdown"` — assembles all sections into markdown string, copies to clipboard
- `"Save to Vault"` — Pro/Max only; `POST /api/idea-agent/save` with the analysis JSON
- `"Share Analysis"` — `POST /api/idea-agent/share` → returns a UUID public link

### Backend — `idea-agent.ts`

**`POST /api/idea-agent/analyze`**
- Auth: `verifyUser`
- Usage check: read `ideaAgentUsageCount` and `ideaAgentUsageMonth` from subscriber record. If month rolled over, reset count. Free ≥ 2 or Pro ≥ 20 → `429 { error: "Usage limit reached" }`. Max → unlimited.
- Increments usage count before streaming
- Sets `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- Calls OpenAI `chat.completions.create` with `stream: true`, model `gpt-4o`
- System prompt: structured to produce sections in order with `## SECTION_NAME` headers so the frontend can parse section boundaries from the stream
- Pipes token chunks as `data: {"token": "..."}` SSE events
- On stream end: `data: [DONE]`

**`POST /api/idea-agent/save`**
- Auth: `verifyUser`, tier check (pro/max only)
- Saves analysis to a `personalVaultsTable` (or existing mechanism — adapt to what exists)

**`POST /api/idea-agent/share`**
- Auth: `verifyUser`
- Saves analysis to a `sharedAnalysesTable` with UUID key
- Returns `{ url: "/shared-analysis/{uuid}" }` — read-only public page (out of scope for this spec, stub the route)

**Dependencies**
- `openai ^6.34.0` already present in api-server — no package change needed
- `OPENAI_API_KEY` env var — document in `.env.example` if not already there

---

## Database Changes

**No migration needed.** All required fields already exist or can use `portalState` jsonb:
- `startupStage` — existing column for stage
- `biggestChallenge` — existing column for constraint
- `portalState` — existing jsonb column stores `{ goal, ideaAgentUsageCount, ideaAgentUsageMonth }`

The `PATCH /api/subscribers/me` endpoint will merge into `portalState` for new fields.

---

## Execution Order

1. Rename `TractioinProofSection.tsx` → `TractionProofSection.tsx` (prerequisite for P22)
2. DB migration (prerequisite for P21 PATCH and P25 usage tracking)
3. `PATCH /api/subscribers/me` endpoint (prerequisite for P21 Part 2)
4. P20 Home Hero (standalone)
5. P21 Auth page + `VaultTeaserCard` shared component
6. P21 OnboardingQuiz rewrite
7. P22 Blueprints rewrite
8. P23 Pricing rewrite
9. P24 Ground Game redesign
10. P25 Idea Agent backend (OpenAI + SSE)
11. P25 Idea Agent frontend
