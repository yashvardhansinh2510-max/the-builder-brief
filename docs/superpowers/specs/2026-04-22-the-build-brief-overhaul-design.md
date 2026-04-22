# The Build Brief — Platform Overhaul Design
**Date:** 2026-04-22  
**Scope:** Bug fixes, brand pivot, tier experience differentiation, Claude AI Advisor  
**Payments:** Excluded — handled separately  
**Approach:** Surgical fixes + additive features (no rewrites)

---

## 1. Context

The Build Brief is being repositioned from a newsletter into a **startup incubator platform**. Founders join free to get the weekly market signal, upgrade to Pro for daily briefings and the full build platform, and join Max for deep advisory access and the exit network.

Three tiers: **Free**, **Pro ($9.99/mo)**, **Max ($49/mo)**.

Stack: React + TypeScript + Vite + Tailwind + Framer Motion + Wouter + Supabase Auth + Drizzle ORM + Express API + Resend email + Anthropic SDK (new).

---

## 2. Bug Fixes

### 2.1 Navigation Flash — Root Cause

**Problem:** Two bugs combine to make page switching feel broken.

**Bug A — Duplicate routes.** `App.tsx` registers both `/dashboard` and `/user-portal` pointing to `UserPortalPage`. `PortalNav` links to `/dashboard`. When a user is on `/user-portal` and navigates away and back, Wouter re-mounts the component → auth re-check → blank flash.

**Fix:** Remove the `/user-portal` route entirely. Single canonical path: `/dashboard`. All `Link`, `href`, `setLocation` references to `/user-portal` updated to `/dashboard` across the entire codebase.

**Bug B — `loading` returns `null`.** Gated route wrappers (`UserPortalPage`, `ArchiveGated`, `ProPortalGated`, `MaxPortalGated`, `IssuePageGated`) all return `null` while `loading === true`. On every navigation this produces a 100–300ms blank screen that looks like a sign-in redirect to the user.

**Fix:** Create a shared `<PortalSkeleton />` component. It renders the PortalNav shell (sticky header + secondary nav) with pulsing placeholder blocks for the page body. All gated routes render `<PortalSkeleton />` instead of `null` while loading. The skeleton uses `bg-card/40 animate-pulse rounded-[2rem]` blocks to match the card design language.

### 2.2 Auth Tier Flash

**Problem:** `AuthContext.resolveTier()` is called inside `onAuthStateChange` which fires on every `TOKEN_REFRESHED` event (silently, every hour). Each refresh triggers a new `fetch("/api/subscribers/me")` call. During the in-flight fetch, `tier` sits at whatever it was last set to — but because `setTier` is only called on success, this is actually fine. However, there is no `tierLoading` guard, so components that depend on `tier` may render with stale `"free"` state during auth re-initialization.

**Fix:**
- Add `tierLoading: boolean` to `AuthContextType`, initially `true`, set to `false` after first `resolveTier` completes
- In gated routes, block render until both `!loading && !tierLoading`
- Only call `resolveTier` on events `SIGNED_IN` and `INITIAL_SESSION`, not on `TOKEN_REFRESHED` or `USER_UPDATED`

### 2.3 Tier Gating Inside Portals

**Problem:** `ProPortalGated` and `MaxPortalGated` only check `session !== null`. A free user who types `/pro-portal` in the URL bar gets full Pro content. A Pro user who types `/max-portal` gets full Max content.

**Fix in `App.tsx`:**

```tsx
function ProPortalGated() {
  const { session, loading, tierLoading, tier } = useAuth();
  if (loading || tierLoading) return <PortalSkeleton />;
  if (!session) return <Redirect to="/sign-in" />;
  if (tier === "free") return <Redirect to="/dashboard" />;  // + toast
  return <ProPortal />;
}

function MaxPortalGated() {
  const { session, loading, tierLoading, tier } = useAuth();
  if (loading || tierLoading) return <PortalSkeleton />;
  if (!session) return <Redirect to="/sign-in" />;
  if (tier !== "max" && tier !== "incubator") return <Redirect to="/dashboard" />;  // + toast
  return <MaxPortal />;
}
```

**Inside MaxPortal:** A Pro user who gets redirected sees a toast: "Max is a different room. You're on Pro — upgrade when you're ready." Never a crash, never a blank page.

### 2.4 PortalNav Tier Label Fix

**Problem:** `incubator` tier users get routed to `/max-portal` but the nav label shows "Max Portal" — mismatch with what they paid for.

**Fix:** Map `incubator` → label `"Inner Circle"`, path `/max-portal`. The `premiumPortalLabel` logic in `PortalNav.tsx` becomes:

```ts
const premiumPortalLabel =
  tier === "pro" ? "Pro Portal" :
  tier === "max" ? "Inner Circle" :
  tier === "incubator" ? "Inner Circle" : "Dashboard";
```

---

## 3. Copywriting Overhaul

**Rule:** Every user-facing string must sound like a serial founder with exits — specific numbers, contrarian framing, no corporate jargon. The following banned phrases are present in the codebase and must be replaced:

| Location | Banned phrase | Replacement |
|----------|--------------|-------------|
| `user-portal.tsx` telemetry logs | "Initializing industrial-grade telemetry..." | "Market signal: EU SaaS CAC dropped 18% this quarter." |
| `user-portal.tsx` telemetry logs | "Connecting to Foundry Alliance nodes..." | "3 founders hit $10k MRR this week using Blueprint #4." |
| `user-portal.tsx` telemetry logs | "Optimizing distribution rails v4.2..." | "Cold email open rates: 34% average across the community." |
| `user-portal.tsx` telemetry logs | "Authenticating member authority delta..." | "Next cohort applications close in 6 days." |
| `user-portal.tsx` telemetry logs | "Analyzing EU SaaS Arbitrage flow..." | "Scanning B2B SaaS hiring boards for unmet workflow gaps..." |
| `user-portal.tsx` telemetry logs | "Detecting hyper-growth patterns in FinTech..." | "Friday drop: 94% read rate. Best performing issue yet." |
| `user-portal.tsx` bento grid | "Weekly Industrial Drops" | "The Weekly Signal" |
| `user-portal.tsx` bento grid | "Every Friday, we deconstruct a $5M+ TAM sector arbitrage opportunity. You get the raw technical blueprint, the GTM distribution rails..." | "Every Friday we pick apart one real market gap. You get the blueprint, the prompts, and a first-customer strategy — not a think-piece." |
| `user-portal.tsx` | "industrial-grade audit // OK" | "Peer-reviewed. Founder-tested." |
| `user-portal.tsx` | "INDUSTRIAL_GRADE" badge | Remove |
| `user-portal.tsx` toast | "This is industrial-level leverage." | "Check your email. This one's worth the read." |
| `pro-portal.tsx` hero | "This command center provides the exact files, code, and algorithmic frameworks required to scale aggressively to your first $1M ARR." | "You stopped browsing. Good. Everything in here is built for founders who are already moving." |
| `pro-portal.tsx` ticker | "Establishing secure connection to Pro Database..." | "Signal loaded. 3 new market gaps flagged since your last session." |
| `pro-portal.tsx` ticker | "Syncing market signals..." | "Blueprint #4 deployed by 12 founders this month." |
| `max-portal.tsx` hero quote | "Where architects become titans, and operational leverage replaces human effort." | "Most founders read. A few build. You're in the room where the builders compare notes." |
| `max-portal.tsx` | "Private Equity Relations" | "The Exit Network" |
| `max-portal.tsx` | "The institutional capital ready to acquire Max tier assets." | "Founders who've taken chips off the table and stayed in the room." |
| `max-portal.tsx` | "Spec Flow Protocol" section header | "White-Glove Concierge" |
| `max-portal.tsx` footer | "Aramis Protocol • Active" | "The Build Brief Max • Active" |
| Archive page | "All issues." | "The Signal Archive" |
| Archive page | "Every idea we've blueprinted..." | "Every market gap we've deconstructed. Every one still open." |
| `home.tsx` (all instances) | "newsletter" | "startup incubator platform" / "weekly signal" / "platform" depending on context |
| Free subscribe CTA | Any "newsletter" wording | "Get the weekly signal — free, always." |
| Upgrade modal Pro description | "For founders who are done reading and ready to build." | Keep — this is good |
| Upgrade modal Max description | "When you need someone who has done it before to sit across the table from you." | Keep — this is good |

**Homepage hero (major rewrite):**
- Remove all "newsletter" framing from `home.tsx` hero section
- New positioning: "The startup incubator for founders who are serious about building."
- Subheading: "Free members get the weekly signal. Pro and Max members get the platform, the AI advisor, and the community."
- CTA: "Get the weekly signal — free." (not "subscribe")

**Pricing section reframe:**
- Free: "The Weekly Signal" — one market gap per week, deconstructed
- Pro: "Daily Operator Briefings + Build Platform + AI Advisor (5 sessions/mo)"
- Max: "Everything in Pro + Monthly 1-on-1 + Exit Network + AI Advisor (20 sessions/mo)"

---

## 4. Max Portal Theme Fix

**Problem:** `max-portal.tsx` uses hardcoded hex values throughout — incompatible with the CSS variable theme system, broken in dark mode.

**Complete replacement map:**

| Hardcoded value | CSS variable replacement |
|----------------|-------------------------|
| `bg-[#FDFBF7]` | `bg-background` |
| `text-[#2A2A2A]` | `text-foreground` |
| `text-[#2A2A2A]/60` | `text-muted-foreground` |
| `text-[#2A2A2A]/40` | `text-muted-foreground/60` |
| `bg-white` | `bg-card` |
| `bg-[#1A1A1A]` | `bg-foreground` |
| `text-white` | `text-background` |
| `text-white/60` | `text-background/60` |
| `border-[#2A2A2A]/5` | `border-border/20` |
| `border-[#2A2A2A]/10` | `border-border/30` |
| `bg-[#2A2A2A]/10` | `bg-muted/40` |

---

## 5. Tier Experience Differentiation

### 5.1 Free Tier
Standard animations. `fadeUp` at 0.5s delay. No entrance effects. Clean but flat. The baseline experience.

### 5.2 Pro Tier — First Load Cinematic Entrance
On first Pro Portal load, check `sessionStorage.getItem("firstProVisit")`. If not set:
1. Set the flag
2. Stagger all page sections with `initial={{ opacity: 0, y: 30 }}` and sequential `delay: i * 0.15`
3. The PortalNav premium badge pulses amber for 2s then settles
4. Play a subtle chime (same audio system as SubscribeSuccessOverlay)
5. The terminal ticker fires line-by-line with 800ms intervals instead of instant render

Scroll animations on every Pro Portal section: use `useInView` with `{ once: true, margin: "-100px" }` — sections animate in as you scroll. The free/dashboard portal does not have this.

### 5.3 Max Portal — Silk Entrance + Breathing Background
The existing `filter: blur(10px)` → `blur(0px)` on the hero already exists. Extend this to wrap the entire `<main>` with the same animation at 1.5s duration.

Add a breathing radial gradient overlay to `max-portal.tsx`'s root div:
```tsx
<motion.div
  className="pointer-events-none fixed inset-0 z-0"
  animate={{ opacity: [0.03, 0.06, 0.03] }}
  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  style={{ background: "radial-gradient(circle at 60% 40%, var(--primary), transparent 70%)" }}
/>
```

All interactive elements (buttons, cards) use `whileHover={{ scale: 1.02 }}` with `type: "spring", stiffness: 300, damping: 20` — spring physics throughout.

Max PortalNav badge: replace rounded pill with sharp rectangular chip:
```tsx
// Instead of rounded-full, use:
className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border border-primary/40 text-primary bg-primary/10"
// No border-radius — sharp corners signal a different tier
```

---

## 6. Brand Pivot — Incubator Platform + Email Cadence

### 6.1 Positioning
"The Build Brief" stays as the name. All copy shifts from newsletter → incubator platform. The free weekly email is the *entry signal* — a teaser for the full platform. Pro and Max members get daily briefings.

### 6.2 Email Cadence

| Tier | Frequency | Content |
|------|-----------|---------|
| Free | Weekly (Friday) | One market gap, deconstructed — the full blueprint |
| Pro | Daily (Mon–Fri) | Daily operator briefing — one tactic, one signal, one resource |
| Max | Daily (Mon–Fri) | Same as Pro + a weekly "Inner Circle" note from the founding team |

### 6.3 New Email Functions (`api-server/src/lib/email.ts`)

Add two functions alongside `sendWelcomeEmail`:

**`sendWeeklySignal()`** — queries all non-unsubscribed subscribers regardless of tier, sends the Friday blueprint email.

**`sendDailyBriefing()`** — queries subscribers where `tier IN ('pro', 'max', 'incubator')`, sends the daily operator email.

### 6.4 New Trigger Routes (`api-server/src/routes/engine.ts`)

```
POST /api/engine/send-weekly   — triggers sendWeeklySignal()
POST /api/engine/send-daily    — triggers sendDailyBriefing()
```

Both routes protected by `x-api-key: process.env.INTERNAL_API_KEY` header check. Returns `{ success: true, sent: N }`. Intended to be called by an external cron.

**How to trigger emails (for now):** Call these endpoints manually with any HTTP client:
```bash
# Send the Friday weekly signal
curl -X POST https://your-api-url/api/engine/send-weekly \
  -H "x-api-key: your_INTERNAL_API_KEY"

# Send the daily briefing (Mon–Thu)
curl -X POST https://your-api-url/api/engine/send-daily \
  -H "x-api-key: your_INTERNAL_API_KEY"
```

For automated sending, use one of these free options:
- **Vercel Cron** (if deployed on Vercel): add `vercel.json` with cron config pointing to these routes
- **cron-job.org** (free external cron): set up two jobs pointing to the URLs above with the API key header
- **GitHub Actions schedule**: `.github/workflows/send-emails.yml` with a `schedule: cron` trigger

No scheduler is built into the app — the routes are stateless triggers that can be called from anywhere.

---

## 7. Claude AI Advisor

### 7.1 Overview
A chat interface at the bottom of both Pro Portal and Max Portal. Founders type their problem, Claude responds with founder-voice analysis grounded in The Build Brief's content and playbooks.

### 7.2 Backend — `POST /api/engine/chat`

**Request body:**
```ts
{
  email: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tier: "pro" | "max" | "incubator";
}
```

**Flow:**
1. Validate `email` and `messages` present
2. Query DB for subscriber — verify tier matches, reject if free
3. Check usage: `portalState.chatUsage["2026-04"]` count
   - Pro limit: **5 messages/month**
   - Max/Incubator limit: **20 messages/month** (confirmed)
   - If exceeded: `res.status(429).json({ limitReached: true, resetDate: "2026-05-01" })`
4. Call Anthropic SDK using `.stream()` method (not `.messages.create()`) with system prompt (see §7.3) + conversation history. Set `res.setHeader('Content-Type', 'text/event-stream')` before streaming begins.
5. Pipe each streamed text delta as `data: {"delta": "..."}` SSE events to the client
6. On stream completion: increment `portalState.chatUsage[monthKey]` in DB (where `monthKey = new Date().toISOString().slice(0,7)` e.g. `"2026-04"`), append exchange to `portalState.chatHistory` (last 10 exchanges only — don't grow unbounded)
7. Send final SSE event `data: {"done": true, "remaining": N}` then close the stream

**Dependencies:**
- `@anthropic-ai/sdk` added to `artifacts/api-server/package.json`
- `process.env.ANTHROPIC_API_KEY` in `artifacts/api-server/.env`
- Model: `claude-sonnet-4-6` — better reasoning quality for founder advice. At 5 messages/month Pro × 100 users × avg 1200 tokens = ~$0.36/month total. Acceptable cost for quality output.

### 7.3 System Prompt (with prompt caching)

The system prompt is marked with `cache_control: { type: "ephemeral" }` so it's cached within a 5-minute session window, reducing input token costs by ~90% for multi-turn conversations.

```
You are the AI Advisor inside The Build Brief — a startup incubator platform 
for founders who are serious about building real companies.

Voice rules (non-negotiable):
- You are a serial founder with multiple exits. Not a consultant. Not a coach.
- You use specific numbers, not adjectives. "$18k MRR in 67 days" not "fast growth."
- You do not hedge. You do not say "it depends" without immediately picking a side.
- You do not use: leverage rails, foundry distribution, industrial-grade, authority delta, 
  hyper-growth, or any phrase that sounds like a McKinsey deck.
- Contrarian framing beats safe framing. Say the uncomfortable thing.

What you know deeply:
- GTM for early-stage B2B SaaS (cold email, LinkedIn, community-led)
- Pricing architecture (value-based, usage-based, land-and-expand)
- Technical scaffolding for lean teams (Supabase, Vercel, Stripe, Resend, Drizzle)
- Cap table defense and equity structuring
- The Build Brief's published blueprint sectors: B2B SaaS, Fintech, Health, AI-Native, 
  Education, Real Estate, Consumer, Developer Infrastructure

When a founder describes their situation:
1. Identify the actual problem — usually different from what they stated.
2. Give the most contrarian-but-correct take in 2-3 sentences.
3. Give 3 specific numbered actions they can take THIS WEEK.
4. End with one question that forces them to confront their real blocker.

[MAX TIER ONLY — append this if tier === "max" | "incubator"]
For Max members, also assess:
- Defensibility: is their moat real or imaginary?
- Burn posture: are they default alive or default dead?
- Exit readiness: is their data room and cap table acquisition-ready?
```

**Tier differentiation in the system prompt:** The backend appends the Max-tier paragraph only when `tier === "max" || tier === "incubator"`. Pro users get GTM + execution analysis. Max users get that plus the financial/exit layer.

### 7.4 Frontend — `<FounderChat />` Component

**File:** `artifacts/specflow-newsletter/src/components/FounderChat.tsx`

**Visual design:**
- Full-width section, dark terminal aesthetic: `bg-foreground text-background rounded-[3rem] p-8 md:p-12`
- Header: "AI Advisor" (Pro) or "AI Advisor — Inner Circle" (Max) with a usage counter badge
- Message area: scrollable, `max-h-[500px]`, messages stagger in with Framer Motion
- Input: single textarea with `Cmd+Enter` / `Ctrl+Enter` to send
- Streaming: tokens appear one by one via SSE — not a block paste
- Usage badge: "3 / 5 sessions this month" (Pro) or "8 / 20" (Max). Month key computed client-side as `new Date().toISOString().slice(0,7)` to match the backend key.
- When limit hit: input disabled, message "Your advisor sessions reset on May 1st." — clean, not an error

**First-message placeholder:** `"Describe your current blocker. Be specific — what's not working and exactly why?"`

**Chat history:** Loaded from `portalState.chatHistory` on mount — returning users see their last session. Limited to last 10 exchanges on the backend.

**Placement:**
- Pro Portal: added as the final section before the footer, after the "Launch Sequence" CTA
- Max Portal: added as the section before "The Concierge Booking", after the Exit Architecture Modeler

---

## 8. Additional Hardcoded Values & Bugs (Found in Audit)

### 8.1 Missing `logoPath` Import — Runtime Bug
`pro-portal.tsx` and `max-portal.tsx` both use `logoPath` in their footer (`<img src={logoPath} ...>`) but neither file imports it. This causes a runtime error — the image renders as `undefined`.

**Fix:** Add `import logoPath from "@assets/logo.jpg";` to the top of both files.

### 8.2 Hardcoded Subscriber Counts — `home.tsx`
The hero badge says `"Issue #009 drops this Friday"` (hardcoded). The stats bar shows `"15,000+ founders & PMs"`, `"8 complete blueprints"`, `"< 48h time to first revenue"`, `"100% free, always"` — all hardcoded static arrays.

**Fix:**
- Remove the hardcoded issue number badge entirely — replace with a live "Friday drop" indicator based on the current day of week: if today is Thu/Fri, show "This Friday's drop is live →", otherwise show "Next drop: Friday"
- The total subscriber count (`"15,000+"`) should be fetched from `GET /api/subscribers/stats` on mount and displayed dynamically as `data.total.toLocaleString() + "+"`. Use a Suspense-friendly `useEffect` + local state pattern — if the fetch fails, fall back to the static string `"15,000+"`
- The other stats (`"8 complete blueprints"`, `"< 48h"`, `"100% free"`) stay static — they're not database-driven

### 8.3 Hardcoded Subscriber Count — `user-portal.tsx`
Line: `"Join 12,400+ Founders"` in the bento grid.

**Fix:** Same pattern as home.tsx — fetch from `/api/subscribers/stats` and display `data.total`. Reuse a shared `useSubscriberCount()` hook so both home and portal share the same logic.

### 8.4 Hardcoded Fake Telemetry Stats — `pro-portal.tsx`
The system telemetry section shows three stat cards with completely fake values:
- `"1,204"` Pro Members Active
- `"84,392"` Vault Assets Deployed  
- `"99.99%"` System Uptime

These look credible enough to be mistaken for real data but are pure fabrication.

**Fix:** Replace the entire "System Telemetry" section with a real stats fetch from `/api/subscribers/stats`. Show:
- `data.total` — Total Platform Members
- `data.weekSignups` — New Members This Week
- `"99.9%"` — System Uptime (this one can stay static/cosmetic — it's a UI element, not a claim)

The spark chart arrays stay hardcoded — they're decorative.

### 8.5 Hardcoded External Audio URL — `user-portal.tsx`
Line 132: `new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")`

This is a dependency on an external CDN that can disappear or be rate-limited. The audio plays silently on error (`.catch(e => console.log(...))`) so it's not a crash, but it's fragile.

**Fix:** The `SubscribeSuccessOverlay` already handles audio. Use the same local audio asset pattern. If no local chime asset exists, remove this audio call entirely — the `showLoginBonus` modal is visual enough without it.

### 8.6 `PricingSection.tsx` — Stale Feature Lists + Missing AI Advisor
The pricing cards show features that conflict with the new positioning:
- Free plan: `"Blueprint drops every Monday and Friday"` — contradicts the new weekly-only cadence
- Pro plan: no mention of AI Advisor
- Max plan: no mention of AI Advisor
- Comparison table: no AI Advisor row

**Fix:**
- Free: `"Weekly blueprint drop every Friday"` (singular, Friday only)
- Pro features: add `"AI Advisor — 5 sessions per month"`
- Max features: add `"AI Advisor — 20 sessions per month (Inner Circle depth)"`
- Comparison table: add row `"AI Advisor Sessions"` with `false` / `"5/mo"` / `"20/mo"`

### 8.7 `PricingSection.tsx` — Plan Name `"Max"` vs Backend `"Pro Max"`
`payments.ts` prices object has key `"Pro Max"` but `PricingSection.tsx` calls `handleCheckout("Max")`. The backend rejects `"Max"` as invalid plan because it's not in the prices object.

**Fix:** In `payments.ts` prices object, rename `"Pro Max"` to `"Max"` to match what the UI sends. (Payments are excluded from scope but this is a data integrity fix, not a payment flow change — it prevents a 400 error before checkout even starts.)

---

## 9. Files Changed

### Frontend (`artifacts/specflow-newsletter/src/`)
| File | Change |
|------|--------|
| `App.tsx` | Remove `/user-portal` route; fix `ProPortalGated`, `MaxPortalGated` with tier checks; add `tierLoading` guard |
| `lib/AuthContext.tsx` | Add `tierLoading` state; restrict `resolveTier` to `SIGNED_IN` + `INITIAL_SESSION` events only |
| `components/PortalNav.tsx` | Fix `premiumPortalLabel` for incubator; fix link target references |
| `components/PortalSkeleton.tsx` | **New** — loading state for all gated routes |
| `components/FounderChat.tsx` | **New** — Claude AI Advisor chat UI |
| `hooks/useSubscriberCount.ts` | **New** — shared hook for live subscriber count from `/api/subscribers/stats` |
| `pages/user-portal.tsx` | Fix all banned copy; fix telemetry logs; remove newsletter framing; fix missing logoPath import; use live subscriber count |
| `pages/pro-portal.tsx` | Fix copy; add logoPath import; replace fake telemetry stats with real data; add first-load cinematic entrance; add scroll animations; add `<FounderChat />` |
| `pages/max-portal.tsx` | Fix all hardcoded colors; add logoPath import; fix copy; add breathing gradient; add spring physics; add `<FounderChat />` |
| `pages/archive.tsx` | Rename to "Signal Archive"; fix copy |
| `pages/home.tsx` | Major copy rewrite — newsletter → incubator platform; dynamic subscriber count; dynamic Friday drop indicator |
| `components/PricingSection.tsx` | Update tier descriptions, email cadence, add AI Advisor to features and comparison table |

### Backend (`artifacts/api-server/src/`)
| File | Change |
|------|--------|
| `routes/engine.ts` | Add `POST /api/engine/chat` (Claude AI Advisor); add `POST /api/engine/send-weekly`; add `POST /api/engine/send-daily` |
| `lib/email.ts` | Add `sendWeeklySignal()`; add `sendDailyBriefing()` |
| `routes/payments.ts` | Rename `"Pro Max"` key to `"Max"` in prices object (data integrity fix) |
| `package.json` | Add `@anthropic-ai/sdk` |
| `.env` | Add `ANTHROPIC_API_KEY`, `INTERNAL_API_KEY` |

---

## 10. Out of Scope
- Payment gateway changes (Stripe/Razorpay subscription mode) — handled separately
- New issue/blueprint content
- Incubator dashboard page changes
- Mobile responsive audit

---

## 11. Success Criteria
- Navigating between Dashboard → Archive → Pro Portal → Max Portal → Dashboard produces no blank flash, no "Sign up" glitch, no tier reset
- A free user who types `/pro-portal` in the URL gets redirected to `/dashboard` with a toast
- A Pro user who types `/max-portal` gets redirected to `/dashboard` with a toast
- Zero instances of banned copy phrases in any user-facing string
- Max Portal renders correctly in both light and dark mode (no hardcoded hex values)
- `pro-portal.tsx` and `max-portal.tsx` have `logoPath` imported — footer logos render correctly
- Home page and user portal show live subscriber count from the API
- Pro Portal telemetry stats show real data from `/api/subscribers/stats`
- Pricing cards show correct email cadence and AI Advisor sessions per tier
- Plan name `"Max"` routes correctly to checkout — no 400 error
- Pro users can send 5 AI Advisor messages per month; hitting the limit shows a clean UI state
- Max users can send 20 messages per month
- `sendWeeklySignal` and `sendDailyBriefing` routes return `{ success: true, sent: N }` when called with the correct API key header
