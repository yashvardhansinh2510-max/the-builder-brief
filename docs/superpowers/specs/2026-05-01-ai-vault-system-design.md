---
title: AI-Automated Weekly Vault System Design
date: 2026-05-01
status: approved
scope: Data model, AI research agent, publishing pipeline, UI/UX for archive and vault detail pages
---

# AI-Automated Weekly Vault System

## Overview

Build an autonomous research system that discovers, validates, and publishes one high-quality startup idea every Friday. The system continuously monitors real-time signals (Reddit, YouTube, Google Trends, LinkedIn, HN, Product Hunt, Crunchbase), clusters emerging opportunities by market, auto-scores candidates, then performs verification before publishing.

**Target:** Replicate ideabrowser.com's depth and rigor with zero human labor. Publish every Friday with confidence-gated verification (80%+ auto-publish, 20% require 30-min founder review).

---

## 1. Data Model: Vault Schema

### Core Idea
- `title` — Compelling founder-voice title
- `tagline` — 1-sentence hook
- `product_description` — 200-300 word narrative walkthrough
- `core_workflow` — Real example with specific outcomes (e.g., "PT clinic queues next day's patients → AI dials insurers overnight → 7am results ready")

### Problem Articulation
- `pain_points` — Array of 3-5 specific problems (quotes from community signals)
- `market_size_usd` — Verified annual market size (number)
- `urgency_indicator` — "high" / "medium" / "low"

### Scoring System (1-10 scale, visual bars)
- `opportunity_score` — Market size potential + growth velocity + investment trends
- `problem_severity_score` — Frequency + intensity of pain in signals
- `feasibility_score` — Technical difficulty + capital required + regulatory burden
- `why_now_score` — Regulatory shifts + enabling tech maturity + trend velocity
- `overall_score` — Weighted average: (opportunity × 0.3) + (problem × 0.3) + (feasibility × 0.2) + (why_now × 0.2)

### Market & Business Data
- `market_size_usd` — Annual market size
- `tam_annual_growth_percent` — 3-year CAGR
- `arpu` — Annual revenue per unit
- `payback_months` — Months to recover setup cost
- `revenue_potential_tier` — "$" ($1-10M ARR) / "$$" ($10-100M) / "$$$" ($100M+)
- `go_to_market_difficulty` — 1-10 scale
- `pricing_strategy` — How to monetize (e.g., "$1,500/month per clinic")
- `unit_economics_narrative` — 2-3 sentences explaining the math

### Competitive Landscape
- `named_competitors` — Array of direct/adjacent competitors
- `market_gap_description` — What's unsolved or inefficiently solved
- `differentiation` — Why this wins vs. alternatives

### Community Signals (Real Data)
- `reddit_communities` — { count, links, trend: "growing"/"stable"/"declining" }
- `youtube_channels` — { count, trend_direction, sample_titles }
- `trending_keywords` — Array of { keyword, search_volume, competition_level, growth_velocity_percent }
- `linkedin_mentions_weekly` — Count + trend
- `hacker_news_posts` — Total count, points from last 6 months
- `product_hunt_similar` — Count of similar launches, avg upvotes

### Business Model
- `value_ladder` — 3-stage offer: { lead_magnet, pilot, core_product } with descriptions
- `gtm_channels` — Where to acquire customers (array)
- `trend_category` — "AI" / "Healthcare" / "FinTech" / "Consumer" / "EdTech" / "Real Estate"

### Verification & Metadata
- `confidence_score` — 0-1 scale (how certain is the AI in this research?)
- `verification_status` — "verified" / "unconfirmed" (per metric)
- `source_attribution` — Array of APIs/sources used (e.g., ["Crunchbase", "SimilarWeb", "Google Trends", "Reddit"])
- `data_freshness` — Timestamp of last refresh
- `published_at` — When vault went live
- `is_published` — Boolean (draft vs. published)

---

## 2. AI Research Agent: Daily Monitoring + Auto-Pick

### Signal Sources (Ranked by Quality)

1. **Reddit** (50+ startup/industry subreddits)
   - Filter: 50+ upvotes, 10+ comments minimum
   - Extract: Problem statements, user complaints, founder discussions

2. **YouTube** (Trending business/tech)
   - Filter: 10k+ views, published in last 7 days
   - Extract: Founder interviews, problem validation, market commentary

3. **Google Trends** (Top 10 rising keywords)
   - Filter: Growth velocity >100% week-over-week
   - Extract: Emerging problems, tech enablers

4. **Hacker News** ("Show HN" + trending)
   - Filter: 100+ points, founder-heavy discussion
   - Extract: Technical feasibility, market interest

5. **Product Hunt** (Daily launches + discussion)
   - Filter: 100+ upvotes, founder commentary present
   - Extract: Competitive landscape, pricing, GTM strategies

6. **LinkedIn** (Trending founder posts)
   - Filter: 1k+ likes, 50+ comments from known investors/founders
   - Extract: Market trends, pain points, funding signals

7. **Crunchbase API** (Funding + hiring trends)
   - Filter: Series A+ announcements
   - Extract: Competitor funding, market heating

8. **Twitter/X API** (Trending discussions)
   - Filter: 100+ retweets from accounts with 10k+ followers
   - Extract: Emerging narratives, hot problems

### Daily Processing (2am UTC, Mon-Fri)

1. **Ingest** — Collect all signals from sources above
2. **Cluster** — Group signals into 8-10 opportunity buckets by theme/market
3. **Score** — For each cluster, calculate:
   - `opportunity_score = (market_size × growth_velocity × funding_trends) / 100`
   - `problem_score = (signal_frequency × pain_intensity × time_spent_discussing) / 100`
   - `feasibility_score = 100 - (technical_complexity × required_capital × regulatory_burden)`
   - `why_now_score = (trend_velocity × enabling_tech_maturity × regulatory_shifts) / 100`
4. **Store** — Save top 5 candidates to `vault_candidates` table
5. **Momentum** — If candidate appears 3+ consecutive days, multiply score by 1.3

### Friday Auto-Pick + Deep Research (11am UTC)

1. **Select** — Pick highest-scoring candidate
2. **Verify Metrics** — Cross-check market size, TAM, unit economics against 2+ verified sources:
   - Market Size: Crunchbase, SimilarWeb, industry reports
   - TAM Growth: LinkedIn hiring trends, funding velocity, Google Trends
   - Unit Economics: Model against comparable products

3. **Confidence Scoring:**
   - 0.90+: All 3 sources agree ±15%
   - 0.80-0.89: 2 sources align, 1 outlier
   - 0.70-0.79: Only 1-2 sources available
   - <0.70: Conflicting data or insufficient signals

4. **Deep Research** — Claude agent compiles:
   - Comprehensive problem articulation
   - Product walkthrough with real example
   - Competitive landscape
   - Business model
   - Community proof (quotes from signals)

5. **Store** — Insert to `vaults` table with `is_published=false`

---

## 3. Publishing Pipeline: Verification Gates + Auto-Publish

### Friday 11am UTC Publishing Gate

```
if confidence >= 0.85 AND signals_count >= 20:
  → Auto-publish immediately
  → Email subscribers
  → Update archive page
  
elif 0.70 <= confidence < 0.85 AND signals_count >= 15:
  → Auto-draft vault
  → Slack founder: "Vault ready for 30-min review"
  → Founder reviews metrics, approves/rejects
  → If approved → publish
  → If rejected → system re-researches candidate #2
  
else:
  → Hold vault
  → Alert: "Rerunning Monday with fresh signals"
```

### Safety Checks Before Any Publish

- **Dedup:** Don't republish similar ideas within 90 days
- **Sanity check:** Reject ideas with unrealistic TAM (e.g., $1T for niche market)
- **Community validation:** If 0 signals found, hold (likely fake opportunity)

### Publish & Broadcast

- Insert to `vaults` table with `is_published=true`, `published_at=NOW()`
- Trigger email to subscribers: "New vault: [Title] | [Tagline]"
- Update archive page in real-time
- Log all verification details (source agreement, confidence, freshness)

---

## 4. UI Design: Archive + Detail Pages

### Design System

- **Theme:** Light mode only (no dark mode toggle)
- **Typography:** Sans-serif titles (founder voice), serif body (credibility)
- **Color by category:** AI=cyan, Healthcare=green, FinTech=blue, Consumer=orange, EdTech=purple, Real Estate=brown
- **Animations:** Framer Motion for stagger lists, Recharts for graphs, animated counters
- **Responsive:** Desktop (3-column grid), tablet (2-column), mobile (1-column stack)

### Archive Page (Vault List)

**Hero**
- Headline: "Every Friday. New startup ideas researched by AI."
- Subheading: "Market data. Competition. Why now. Community signals."

**Search + Filter**
- Search box (keyword, title, tagline)
- Filter pills: Category, Opportunity score (9+, 8+, 7+), Market size tier ($, $$, $$$)
- Sort dropdown: Newest, Highest opportunity, Largest market, Most trending

**Vault Cards (Grid: 3-col desktop, 1-col mobile)**
- Card design:
  - Title + tagline (2 lines)
  - 4-axis scorecard (tiny bars: Opportunity, Problem, Feasibility, Why Now)
  - Market size highlight ("$2.5B market")
  - Trend badge ("Trending" if published this week)
  - CTA: "Read research →"
- Hover: Border glows primary color, shadow increases

**Pagination:** 12 vaults per page

---

### Vault Detail Page (Deep Dive)

**Sticky Header (on scroll)**
- 4 scores as mini bars (animated)
- Market size + revenue tier
- Payback months
- Confidence score (hover → tooltip showing verified metrics)

**Section 1: Hero**
- Large title + tagline
- Breadcrumb: "Vault > [Category]"
- Published date + data freshness ("Research updated 2 days ago")

**Section 2: Problem**
- Headline: "The Problem"
- Pain points as animated list (stagger 0.2s)
- Real community quotes (embedded Reddit posts / Twitter screenshots)
- "Why it matters" callout (urgency explanation)

**Section 3: Product**
- Headline: "The Product"
- Real-world workflow example (expandable)
- Pricing model + payback timeline (animated counter)

**Section 4: Market**
- Market size chart: Animated bar chart (5-year TAM projection)
- Revenue potential tier explanation
- Trending keywords: Bar chart with search volume + growth velocity
- Hover keyword → shows Google Trends curve

**Section 5: Competition**
- Named competitors (list)
- Market gap explanation
- Differentiation callout

**Section 6: Signals**
- "Why Now?" explanation
- Animated numbers: "📱 6 Reddit communities | 🎥 38 YouTube channels | 📈 Top keywords"
- Expandable: Show actual community signal samples (embedded posts/threads)

**Section 7: Business Model**
- Pricing strategy (text)
- Value ladder (3-step visual funnel)
- GTM channels (text list or cards)

**Section 8: Data Transparency Footer**
- "Confidence: 87%" (color: green ≥85, yellow 70-84, red <70)
- "Verified metrics: ✓ Market size ✓ TAM ✓ Unit economics"
- "Data sources: Crunchbase, SimilarWeb, Google Trends, Reddit"
- "Last updated: 2 days ago"

---

## Implementation Phases

### Phase 1: Core Infrastructure
- Set up `vault_candidates` and `vaults` tables with schema above
- Build signal ingestion pipeline (Reddit, YouTube, Google Trends, HN, PH, LinkedIn, Crunchbase, Twitter)
- Implement clustering + scoring logic (Claude agent)
- Build verification pipeline (cross-source metric validation)

### Phase 2: Publishing & Automation
- Implement publishing gate logic (confidence thresholds)
- Build Slack notification system (founder review alerts)
- Implement email broadcast on publish
- Build admin approval/rejection UI for founder review

### Phase 3: UI/UX
- Archive page (grid, search, filters, pagination)
- Vault detail page (all 8 sections with animations)
- Integrate Recharts for market/keyword graphs
- Framer Motion for list animations + animated counters

### Phase 4: Polish & Launch
- End-to-end testing (research quality, verification accuracy, publishing cadence)
- First 4 weeks of manual review (even if confidence >0.85, have founder review to catch edge cases)
- Gather metrics (vault quality, subscriber engagement, idea build-out rate)
- Transition to fully automated (0% human review) if metrics healthy

---

## Success Metrics

- **Research Quality:** No repeated ideas within 90 days, confidence score distribution (target: 70% at 0.85+)
- **Publication Cadence:** Every Friday at 11am UTC (zero missed weeks)
- **Community Engagement:** Click-through rate on vault cards, time spent on detail page
- **Founder Outcomes:** Track if ideas get built, funded, or mentioned by community
- **Confidence Accuracy:** Compare AI confidence score to actual idea quality (engagement metrics)

---

## Open Questions for Implementation

1. **Verification data access:** How to securely connect to Crunchbase, SimilarWeb APIs? (API keys, rate limits)
2. **LinkedIn scraping:** Use unofficial scraper or wait for official API access?
3. **Founder review flow:** Slack alerts + click-to-approve? Email with embedded approve button?
4. **Email broadcast:** Use Resend (existing) or add another provider for vault emails?
5. **Cold start:** Pre-seed `vault_candidates` with manual research for first month to validate system?

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| AI hallucinations | Confidence gates + multi-source validation before publish |
| Stale signals | Friday republish with fresh data collection Mon-Fri |
| Low-quality publishes | Minimum signals (20+), minimum confidence (0.85 auto, <0.70 hold) |
| Duplicate ideas | 90-day dedup check + similar-title detection |
| API rate limits | Queue system with retry logic, fallback to cached data |
| Founder review bottleneck | Structured 30-min review (just metric validation, not research) |

---

## Notes

- All timestamps in UTC
- Light mode only (no dark mode)
- Founder voice throughout (avoid corporate jargon)
- Each vault is a complete story, not a stub
