# Idea Browser 2.0: Complete SaaS Expansion Strategy

**Status:** Strategic Plan v1  
**Target Launch:** Phase 1 (MVP) 30 days, Full 2.0 180 days  
**Audience:** Founders, operators, VCs, accelerators  

---

## I. Problem & Opportunity

### Current State Issues
- **No real data pipeline**: Using hardcoded issues instead of dynamic vault system
- **Missing core features**: No idea validation tools, no revenue modeling, no exit roadmaps
- **Weak monetization**: No clear Free/Pro/Max value differentiation
- **Static content**: Not competitive vs. IdeaBrowser.com or other startup resources
- **Incomplete UX**: Archive/blueprints error, no guided onboarding, no data-driven recommendations

### Market Opportunity
- **TAM**: $2.5B+ (startup tools, accelerator software, founder education)
- **Competition**: IdeaBrowser.com (weak on execution tools), Y Combinator resources (closed), Indie Hackers (community-only)
- **Gap**: No single platform combining idea discovery + execution templates + revenue modeling + investor readiness
- **Timing**: Post-startup wave, founder burnout on scattered tools

---

## II. Product Vision: "Idea Browser 2.0"

**One-sentence vision:**  
The world's most comprehensive startup blueprint & execution platform—500+ validated ideas with end-to-end playbooks, revenue models, exit roadmaps, and co-founder/investor matching.

### Core Value Props

| Tier | Value | Target User |
|------|-------|-------------|
| **Free** | 50 public blueprints + basic idea search | Explorer/learner |
| **Pro ($29/mo)** | 200 full blueprints + revenue models + sales scripts + 1:1 advisor access | Early-stage founder |
| **Max ($99/mo)** | 500 blueprints + investor matching + cap table template + exit playbooks + founder community | Growth-stage founder/operator |

---

## III. Feature Backlog & Prioritization

### Phase 1: MVP (Weeks 1-4) — Fix + Foundation
**Goal:** Functional vault, working tiers, basic monetization path

- ✅ Fix blueprint/archive page bugs
- 🔧 Connect vault API to real data (migrate from hardcoded `/lib/data`)
- 🔧 Build basic tier paywall (Free vs. Pro content gates)
- 🔧 Add idea detail page with: TAM, revenue potential, tech stack, risks
- 🔧 Create simple onboarding flow (email signup → tier selection)
- 🔧 Add Stripe/Razorpay integration for Pro plan ($29/mo)
- 🔧 Build 100-idea seed vault (sourced from YC, TechCrunch, Crunchbase)

### Phase 2: Pro Tier (Weeks 5-12) — Execution Tools
**Goal:** Pro subscribers see ROI in real playbooks + models

- 🔧 Revenue modeling tool (CAC, LTV, payback period calculator)
- 🔧 Sales scripts library (cold email, cold call, pitch deck templates)
- 🔧 Founder checklist templates (pre-launch, first hire, Series A)
- 🔧 PDF export for ideas (playbook as one-pager)
- 🔧 Saved vault (bookmark/organize favorites)
- 🔧 Email digests (weekly idea + playbook drop)

### Phase 3: Max Tier + Community (Weeks 13-26) — Differentiation
**Goal:** Premium value separates Max from Pro

- 🔧 Exit roadmaps (how to raise, bootstrap to $100M+, M&A playbook)
- 🔧 Investor matching (500+ VC profiles, fund criteria, check size)
- 🔧 Cap table + equity template + SAFE generator
- 🔧 Co-founder marketplace (sign up, take founder assessment, match)
- 🔧 Private Slack community for Max users
- 🔧 Monthly live Q&A with successful founders/operators
- 🔧 Cap table calculator (dilution, liquidation preferences)
- 🔧 Pitch deck builder powered by idea blueprint

### Phase 4: Scaling (Weeks 27-52) — Growth & Network
**Goal:** 10K paid subscribers, viral loops, founder network effects

- 🔧 Referral program (invite founder, both get 1 month free)
- 🔧 Idea submission (users can add blueprints, earn royalties on upgrades)
- 🔧 Benchmarking tool (compare your idea to YC batches, time to $100M)
- 🔧 API access (Max tier can pull data via API for reporting)
- 🔧 White-label for accelerators (run Idea Browser inside a Fund's portal)

---

## IV. Data Model: The Idea Vault

### Core Schema (PostgreSQL)
```sql
-- Vaults (ideas/blueprints)
CREATE TABLE vaults (
  id SERIAL PRIMARY KEY,
  slug VARCHAR UNIQUE,
  title VARCHAR,
  tagline VARCHAR,
  category VARCHAR,  -- B2B SaaS, Fintech, Climate, AI, etc.
  tar_market BIGINT, -- $5B, $20B, etc.
  revenue_in VARCHAR, -- First revenue target
  is_published BOOLEAN,
  published_at TIMESTAMP,
  tier_required VARCHAR, -- free, pro, max
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vault Details (full playbooks)
CREATE TABLE vault_details (
  id SERIAL PRIMARY KEY,
  vault_id INT REFERENCES vaults(id),
  problem_statement TEXT,
  target_customer VARCHAR,
  initial_unit_economics JSON, -- {CAC: 500, LTV: 5000, payback: 8}
  first_hire_role VARCHAR,
  tech_stack JSONB,
  risks JSONB,
  exit_paths JSON, -- [bootstrap, Series A, M&A]
  cac_strategy TEXT, -- Cold email, PPC, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales Scripts (Pro+)
CREATE TABLE scripts (
  id SERIAL PRIMARY KEY,
  vault_id INT REFERENCES vaults(id),
  type VARCHAR, -- cold_email, cold_call, pitch
  title VARCHAR,
  content TEXT,
  tier_required VARCHAR
);

-- Founder Assessments (Max only)
CREATE TABLE founder_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR UNIQUE (from Clerk),
  skills JSONB, -- {engineering: 9, sales: 6, operations: 4}
  industries_interested JSONB,
  commitment_level VARCHAR, -- full_time, part_time
  preferred_cofounders JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Investor Profiles (Max only)
CREATE TABLE investor_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  fund_name VARCHAR,
  check_size_min BIGINT,
  check_size_max BIGINT,
  focus_areas JSONB,
  url VARCHAR,
  tier_required VARCHAR DEFAULT 'max'
);
```

---

## V. Pricing & Monetization

### Tier Structure

**Free**
- 50 most popular ideas (public)
- Search by category/TAM
- Read-only access (no playbooks)
- Limited analytics
- Free forever

**Pro ($29/month)**
- 200 full blueprints with execution playbooks
- Revenue modeling calculator
- Cold email + sales scripts (copy-paste)
- Founder checklist templates
- PDF export
- Email weekly digest
- Target: 40% of paid users

**Max ($99/month)**
- 500+ ideas with all details
- Exit roadmaps (bootstrap → IPO/M&A playbooks)
- Investor database + matching
- Cap table + SAFE templates + equity calculator
- Co-founder marketplace + assessment
- Private Slack community
- Monthly live Q&As with successful founders
- Advanced analytics (idea trend reports)
- API access for data export
- Target: 10% of paid users

### Revenue Model
- **Year 1 target**: 1K free + 200 Pro + 20 Max = $70K MRR
- **Year 2 target**: 5K free + 1K Pro + 100 Max = $350K MRR
- **Year 3 target**: 20K free + 3K Pro + 500 Max = $1.2M MRR

**Secondary revenue (future):**
- White-label for accelerators (+$5-10K per accelerator)
- API licensing for data providers
- Sponsored ideas (VC firms highlight their portfolio thesis)

---

## VI. Go-to-Market Strategy

### Week 1-4: Seeding
- **Target**: 500 signups, 50 Pro conversions
- **Channels:**
  - Founder Twitter (Patio11, Naval, Paul Graham faves)
  - LinkedIn (target CTO/founder profiles)
  - Hacker News + Indie Hackers
  - Reddit (r/startups, r/entrepreneur)
  - Warm outreach to 100 founders from YC, Techstars, 500 Startups

### Week 5-12: Early Adopter
- **Target**: 2K signups, 200 Pro + 10 Max
- **Channels:**
  - Product Hunt launch
  - Accelerator partnerships (pitch at 5 accelerator cohorts)
  - Founder newsletter sponsorships (1729, The Generalist)
  - Cold email campaign (1M founder emails from Apollo.io)
  - Referral incentive (free month for both)

### Week 13+: Scaling
- **Target**: 10K+ signups, 1K+ Pro, 100+ Max
- **Channels:**
  - White-label pilot with 3 accelerators
  - Affiliate program for founder educators
  - Content (podcast guest on 20Vc, Lenny's Podcast, etc.)
  - Community building (founder Slack, weekly Twitter spaces)

### Messaging
- **Free**: "Browse 500 billion-dollar startup blueprints"
- **Pro**: "Turn ideas into revenue in 30 days"
- **Max**: "The founder's command center—from idea to exit"

---

## VII. KPIs & Analytics

### Acquisition
- **Signups per week**: Target 500/wk by month 2
- **CAC**: <$20 (organic + referral heavy)
- **Free-to-Pro conversion**: 5-10% by month 3
- **ARPU**: $8/month (weighted avg across tiers)

### Retention
- **Day-30 retention**: >40% for Pro, >60% for Max
- **Churn**: <8% monthly for Pro, <3% for Max
- **Expansion**: 2% of users upgrade Free→Pro, 10% of Pro→Max

### Revenue
- **MRR**: $5K by month 3, $50K by month 12
- **CAC payback**: <3 months (Pro avg lifetime = 12 months)
- **LTV**: $350 (Pro), $1,200 (Max)

### Product
- **Vault size**: 100 by week 4, 500 by month 6
- **Idea views per user**: >5 per session
- **Download/export rate**: >30% of Pro users
- **Community engagement**: >20% Max members active in Slack/QA

---

## VIII. Architecture Decisions

### Tech Stack (Validate Current)
- **Frontend**: React + Vite (✅ current)
- **Backend**: Express 5 (✅ current)
- **Database**: PostgreSQL + Drizzle ORM (✅ current)
- **Auth**: Clerk (✅ current)
- **Payments**: Stripe (new, Razorpay fallback for India)
- **Email**: Resend (✅ current)
- **Hosting**: Vercel (✅ current)
- **Sync**: Trigger.dev for async jobs (email digests, user matches)

### Key Decisions
1. **Vault is single source of truth**: Dynamic, not static. Every page pulls from `/api/vaults`
2. **Tier paywall at component level**: Gate entire sections with tier check
3. **User data immutable until Day 30**: Allow users to change ideas easily early
4. **Founder match async**: Run weekly cron, email matches on Fridays
5. **Investor data licensed (future)**: Partner with Crunchbase, not scrape

---

## IX. Implementation Roadmap

### Week 1 (Fix + Vault Connection)
- [ ] Fix blueprint/archive page bugs (done ✅)
- [ ] Create `/lib/vaults/seedData.ts` with 100 ideas
- [ ] Migrate hardcoded `issues` to DB
- [ ] Update `useVaultData` hook to fetch from API
- [ ] Add tier check middleware to routes

### Week 2-3 (Paywall + Pro Tier)
- [ ] Build Stripe integration
- [ ] Create tier paywall component
- [ ] Add revenue model calculator page
- [ ] Create cold email script library
- [ ] Build founder checklist templates

### Week 4 (Launch MVP)
- [ ] Onboarding flow (signup → tier selection)
- [ ] Email digest system (Resend)
- [ ] Basic analytics (pageviews, conversion)
- [ ] Social proof (testimonials, YC/Techstars badges)
- [ ] Help docs (notion page linked in footer)

### Week 5-12 (Pro Features)
- [ ] PDF export for blueprints
- [ ] Save/bookmark favorites
- [ ] Advanced filtering (by revenue stage, team size, tech stack)
- [ ] Early user interviews (50 founders)
- [ ] Iterate based on feedback

### Week 13-26 (Max Tier Launch)
- [ ] Investor database (initial 500)
- [ ] Co-founder marketplace
- [ ] Cap table template
- [ ] Exit roadmap playbooks
- [ ] Private Slack community setup

### Week 27-52 (Growth)
- [ ] Referral program
- [ ] Accelerator white-label
- [ ] Idea submission (user-generated)
- [ ] Content push (podcast, blog)
- [ ] API for Max tier

---

## X. Success Criteria & Milestones

### Day 30 (MVP Launch)
- ✅ Zero errors on blueprint/archive pages
- ✅ 500+ signups
- ✅ 100 Pro trials activated
- ✅ $0 churn (all paying users still active)
- ✅ >3 avg vault views per user

### Day 90 (Product-Market Fit Signal)
- ✅ 2K+ signups
- ✅ 200 Pro + 10 Max
- ✅ >5% Free→Pro conversion
- ✅ >40% Day-30 retention (Pro)
- ✅ >$5K MRR

### Day 180 (Scale Phase)
- ✅ 10K+ signups
- ✅ 1K Pro + 100 Max
- ✅ 500+ vaults published
- ✅ $50K+ MRR
- ✅ 3+ accelerator white-label pilots

---

## XI. Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Founder churn** (low engagement) | HIGH | Onboarding tutorials, email drip, in-app guidance, NPS tracking |
| **Idea quality varies** | HIGH | Editor review, founder feedback ratings, quality score per vault |
| **Competitor copies** | MEDIUM | Data moat (1000s of proprietary playbooks), community network effect |
| **Payment processing fails** | HIGH | Stripe + Razorpay dual setup, manual billing fallback |
| **Investor data is stale** | MEDIUM | Partner with Crunchbase API, auto-refresh weekly |
| **Low investor participation** (Max) | MEDIUM | Invite-only pilot, co-marketing with VCs, revenue-sharing model |
| **Scaling database** | LOW | Pagination from day 1, index on popular queries, DuckDB for analytics layer |

---

## XII. Immediate Next Steps (This Week)

1. **Validate bugs are fixed** → Test blueprints, archive pages locally
2. **Plan seed vault** → Decide on first 100 ideas (YC-inspired, realistic)
3. **Design tier paywall** → Sketch which features live behind Pro/Max
4. **Setup Stripe test mode** → Get first test transaction working
5. **Plan onboarding flow** → What happens after signup?

---

## XIII. Success Looks Like (12 Months)

**The outcome**: Idea Browser 2.0 is **the** reference platform for founder idea validation and execution playbooks.

- **5K+ monthly active users** (Founders using it weekly)
- **50K+ MRR** ($600K ARR)
- **1,000+ blueprints** with real founder feedback
- **500+ Max subscribers** paying $99/mo
- **Featured in**: TechCrunch, YC's Founder Manual, Forbes 30U30
- **Founder testimonials**: "Saved me 6 months of research"
- **Network effect**: Co-founder matches, investor intros creating defensibility

---

**Owner**: Product + Founding team  
**Last Updated**: 2026-05-04  
**Next Review**: After 30-day MVP launch
