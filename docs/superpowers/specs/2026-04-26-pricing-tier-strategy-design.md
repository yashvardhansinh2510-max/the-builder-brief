# Pricing Tier Strategy Design: Founder OS

**Date:** 2026-04-26  
**Scope:** Redesign pricing tiers ($0/$29/$149) + feature gates + landing page overhaul + messaging for 0.1% founders  
**Goals:** Maximize LTV + build network effects + $5k-$10M value per tier

---

## Tier Structure

### FREE — "Signal Station" ($0/mo)
- Weekly briefs (Fri)
- Foundry Scorecard (monthly rating)
- Cohort Dashboard (anonymized metrics)
- 1 command/week (market-scan, roast, sprint)
- Vault access (read-only, 3 blueprints)
- **Value:** $5-10k (validates direction)

### PRO — "Builder's OS" ($29/mo)
- Daily briefs (weekday)
- AI Advisor (20 sessions/month)
- Full Playbook (7 modules, 28 lessons)
- Full Vault (all blueprints, downloadable)
- Unlimited commands (persisted in dashboard)
- Creator Suite (70/30 split on subscriber revenue)
- Referral earnings ($5/subscription)
- Builder Community (Slack, office hours)
- Analytics (read rate, engagement)
- **Value:** $120k+ (execution engine)

### MAX — "Founder Network" ($149/mo)
- Everything in Pro +
- 1-on-1 monthly (30min with exited founder)
- Private code review (CTO audit)
- Pre-built templates (growth playbooks, 70% time savings)
- Deal flow access (companies raising, investments)
- Co-founder matching (algorithm matches complementary skills)
- Investor intros (3 warm intros/year)
- Founder events (quarterly in-person masterminds)
- Exit network (DMs with exited founders)
- Team seats (+$50/seat for co-founders)
- Custom brief (personalized daily)
- Leaderboard featured (top creators showcased)
- **Value:** $1M-10M+ (network + exits)

### INCUBATOR — "Co-founder on Demand" (Custom, Application-Only)
- Everything in Max +
- Weekly check-ins (founder + ops/product team)
- Architecture audit (full tech stack review)
- First revenue sprint (30-day path to $1k MRR)
- Fundraising playbook (pitch deck, due diligence, VC intros)
- Exit positioning (acquisition/IPO strategy from day 1)
- Custom network access (acquirers, late-stage investors, M&A attorneys)
- **Price:** $5k-50k/mo or equity stake
- **Target:** Max users with $500k+ TAM, serious about exit

---

## Data Model

### New Tables

**tier_features**
- id, tier, feature_key, limit, value, createdAt
- Maps: free="1_command_per_week", pro="unlimited_commands", max="unlimited_commands"

**user_tier_usage**
- id, userId, feature_key, month, usage_count, limit, reset_date
- Tracks: how many commands/sessions used this month

**creator_earnings** (extend existing)
- Add: subscriber_fees, creator_revenue, referral_earnings, total_payout

**creator_subscriptions** (extend existing)
- Add: creatorSplit (70/30 default)

**team_seats** (new)
- id, teamId, tier_owner, team_members[], seats_used, cost_per_seat

---

## Feature Gates Architecture

**Three Layers:**

1. **API Middleware** — `canUseFeature(userId, feature)` on protected routes
   - `/api/commands/*` → checks "commands_per_week"
   - `/api/vault/*` → checks "vault_access"
   - `/api/ai-advisor/*` → checks "ai_advisor_sessions"

2. **Frontend** — tier-aware UI
   - Pro/Max features show gate modal if free user accesses
   - Max-only features (investors, co-founder match) hidden from Pro

3. **Database** — query filters by tier
   - `getFeaturesForTier(tier)` returns accessible features
   - Briefs query filtered: free=weekly, pro=daily
   - Creator suite: only pro+ can create subscriptions

**Error Handling:**
- If user exceeds limit: show "Upgrade to Pro" CTA
- If tier lookup fails: default to "free" (safe fallback)
- Rate limiting: 20 AI sessions/month tracked with `reset_date`

---

## Landing Page Overhaul

### Hero Rewrite
```
Headline: "Founder Intelligence Network"
Subheading: "Every decision compounds. The ones that don't cost you $2M in invisible losses. 
We show you the signal — then give you the system to act on it."
CTA: "Start Free"
```

### New Sections

**Trust via Traction**
- "15,000+ founders"
- Real success story (0→$50k MRR using Brief)
- ARR milestone (if applicable)
- Logo wall (YC, Series A, exits)

**Founder Progression**
- Free: "Get the signal"
- Pro: "Get the system"
- Max: "Get the network"
- Incubator: "Get a co-founder"

**Value Math by Tier**
```
Free ($0)        → $5-10k value → Validates direction (saves 6 months wrong bets)
Pro ($348/yr)    → $120k+ value → AI advisor + playbook + community + creator revenue
Max ($1,788/yr)  → $1M-10M+ value → 1-on-1 saves $2-5M, templates save $500k-2M, investor intros = capital
Incubator        → $10M-100M+ value → Co-build partnership, exit positioning
```

**Creator Economy Section**
```
"Earn While You Build"
100 Pro subscribers @ $29/mo = $2,030/mo revenue
Your cut (70%): $1,421/mo
Referral bonus: $5/sub = $500/mo from 100 referrals
Total: $1,921/mo passive income
```

**Network Effects Explainer**
```
"The Brief gets better as more founders join.
Free users find co-founders on Max tier.
Pro users earn from followers.
Max users access deal flow curated by everyone.
You're not buying a subscription — you're joining the network."
```

**CTA Ladder** (context-aware)
- Not logged in: "Start Free"
- Free: "Upgrade to Pro"
- Pro: "Join Max"
- Max: "Apply for Incubator"

### Pricing Page Layout
```
[Free] [Pro — MOST POPULAR] [Max]
[Comparison Table]
[Incubator Banner: "The 0.1% Path"]
```

---

## Implementation Sequence

1. **Schema migrations** — add tier_features, user_tier_usage, team_seats tables
2. **API gates** — implement `canUseFeature()` middleware on all feature routes
3. **Frontend gates** — update components to show/hide by tier
4. **Landing page** — rewrite hero, new sections, pricing card redesign
5. **Creator suite** — enable Pro/Max users to set subscriber prices
6. **Team seats** — allow Max users to add co-founders (+$50/mo each)
7. **Founder matching** — algorithm for co-founder discovery (Max only)
8. **Deal flow** — curate deals/investments for Max tier (weekly email)

---

## Testing

**Unit:**
- `canUseFeature(userId, "commands")` returns correct limit per tier
- Tier upgrade triggers feature access change
- Creator earnings calculation: 70/30 split correct

**Integration:**
- Free user hits command limit → sees upgrade modal
- Pro user triggers "unlimited_commands" → no limit enforced
- Max user sees co-founder matches, deal flow
- Team seat add: cost updates to $1,788 + $50 = $1,838/mo

**E2E:**
- Free signup → sees weekly briefs + 1 command limit
- Upgrade to Pro → next day gets daily briefs + unlimited commands
- Creator sets price → followers can subscribe
- Co-founder match shows relevant prospects

---

## Notes

- Tier progression is intentional: Free → Pro (serious builders) → Max (exits/network) → Incubator (white-glove)
- Free tier gets real value ($5-10k) but incomplete (no execution tools) — drives Pro conversion
- Pro locks in LTV: AI advisor, playbook, creator revenue, community are sticky
- Max is the network tier: investor intros, co-founder matching, deal flow create moat
- Incubator is proof of concept: success stories feed back into free tier marketing
