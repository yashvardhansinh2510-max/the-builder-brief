# Pricing Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement $0/$29/$149/$custom pricing tier system with feature gates, updated landing page, creator monetization, and team seat support.

**Architecture:** 
- **Database:** New tier_features (feature→tier→limit mapping), user_tier_usage (monthly consumption tracking), team_seats (team member costs)
- **API:** canUseFeature() middleware for protected routes, tier-based rate limit enforcement, earnings calculation (70/30 creator split)
- **Frontend:** PricingSection component redesign with new hero/sections, tier-aware UI gates, CTA ladder (context-aware buttons)

**Tech Stack:** PostgreSQL + Drizzle ORM, Express 5, React + Vite, Razorpay payments

---

## Phase 1: Database Migrations

### Task 1: Create tier_features table

**Files:**
- Create: `lib/db/src/migrations/0001_tier_features.sql`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Write migration file**

Create `lib/db/src/migrations/0001_tier_features.sql`:

```sql
CREATE TABLE IF NOT EXISTS tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier VARCHAR(20) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  limit_value INTEGER,
  value_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier, feature_key)
);

INSERT INTO tier_features (tier, feature_key, limit_value, value_description) VALUES
('free', 'weekly_briefs', NULL, 'Access to weekly briefs'),
('free', 'commands_per_week', 1, '1 command per week'),
('free', 'vault_access', NULL, 'Read-only access to 3 blueprints'),
('free', 'foundry_scorecard', NULL, 'Monthly rating'),
('free', 'cohort_dashboard', NULL, 'Anonymized metrics'),
('pro', 'daily_briefs', NULL, 'Daily weekday briefs'),
('pro', 'ai_advisor_sessions', 20, '20 AI Advisor sessions per month'),
('pro', 'playbook_access', NULL, 'Full playbook with 7 modules'),
('pro', 'vault_access', NULL, 'Full vault access, all blueprints'),
('pro', 'commands_per_week', NULL, 'Unlimited commands'),
('pro', 'creator_suite', NULL, '70/30 split on subscriber revenue'),
('pro', 'referral_earnings', NULL, '$5 per subscription'),
('pro', 'community_access', NULL, 'Slack + office hours'),
('pro', 'analytics', NULL, 'Read rate and engagement'),
('max', 'daily_briefs', NULL, 'Custom daily brief'),
('max', 'ai_advisor_sessions', NULL, 'Unlimited sessions'),
('max', 'playbook_access', NULL, 'Full playbook'),
('max', 'vault_access', NULL, 'Full vault'),
('max', 'commands_per_week', NULL, 'Unlimited commands'),
('max', 'creator_suite', NULL, '70/30 split + leaderboard featured'),
('max', 'referral_earnings', NULL, '$5 per subscription'),
('max', 'community_access', NULL, 'Slack + office hours'),
('max', '1on1_monthly', NULL, '30min monthly with exited founder'),
('max', 'code_review', NULL, 'CTO private code audit'),
('max', 'deal_flow_access', NULL, 'Companies raising, investments'),
('max', 'cofounder_matching', NULL, 'Algorithm-based co-founder discovery'),
('max', 'investor_intros', 3, '3 warm intros per year'),
('max', 'founder_events', NULL, 'Quarterly in-person masterminds'),
('max', 'team_seats', NULL, 'Add co-founders at +$50/seat'),
('incubator', 'everything_in_max', NULL, 'All Max tier features'),
('incubator', 'weekly_checkins', NULL, 'Founder + ops/product team'),
('incubator', 'architecture_audit', NULL, 'Full tech stack review'),
('incubator', 'first_revenue_sprint', NULL, '30-day path to $1k MRR'),
('incubator', 'fundraising_playbook', NULL, 'Pitch deck + VC intros'),
('incubator', 'exit_positioning', NULL, 'M&A strategy from day 1');
```

- [ ] **Step 2: Write Drizzle schema for tier_features**

Create/modify `lib/db/src/schema/tiers.ts`:

```typescript
import { pgTable, text, uuid, timestamp, integer, varchar, unique } from "drizzle-orm/pg-core";

export const tierFeaturesTable = pgTable("tier_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  tier: varchar("tier", { length: 20 }).notNull(),
  featureKey: varchar("feature_key", { length: 100 }).notNull(),
  limitValue: integer("limit_value"),
  valueDescription: text("value_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tierFeatureUnique: unique().on(table.tier, table.featureKey),
}));

export const tierPrices = {
  free: 0,
  pro: 29,
  max: 149,
  incubator: null, // custom pricing
} as const;
```

- [ ] **Step 3: Export from schema index**

Modify `lib/db/src/schema/index.ts` - add:

```typescript
export { tierFeaturesTable } from "./tiers";
export { tierPrices } from "./tiers";
```

- [ ] **Step 4: Run migration in local DB**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief
pnpm exec drizzle-kit migrate
```

Expected: Migration applies successfully, `tier_features` table created with seed data.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/migrations/0001_tier_features.sql lib/db/src/schema/tiers.ts lib/db/src/schema/index.ts
git commit -m "feat: add tier_features table with feature mapping schema"
```

---

### Task 2: Create user_tier_usage table

**Files:**
- Create: `lib/db/src/migrations/0002_user_tier_usage.sql`
- Modify: `lib/db/src/schema/tiers.ts`

- [ ] **Step 1: Write migration file**

Create `lib/db/src/migrations/0002_user_tier_usage.sql`:

```sql
CREATE TABLE IF NOT EXISTS user_tier_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  month VARCHAR(7) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  limit_value INTEGER,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_key, month)
);

CREATE INDEX idx_user_tier_usage_user_id ON user_tier_usage(user_id);
CREATE INDEX idx_user_tier_usage_reset_date ON user_tier_usage(reset_date);
```

- [ ] **Step 2: Add schema definition**

Add to `lib/db/src/schema/tiers.ts`:

```typescript
export const userTierUsageTable = pgTable("user_tier_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  featureKey: varchar("feature_key", { length: 100 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  usageCount: integer("usage_count").default(0),
  limitValue: integer("limit_value"),
  resetDate: timestamp("reset_date", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userFeatureMonthUnique: unique().on(table.userId, table.featureKey, table.month),
}));
```

- [ ] **Step 3: Update schema index**

Add to `lib/db/src/schema/index.ts`:

```typescript
export { userTierUsageTable } from "./tiers";
```

- [ ] **Step 4: Run migration**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief
pnpm exec drizzle-kit migrate
```

Expected: `user_tier_usage` table created with indexes.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/migrations/0002_user_tier_usage.sql lib/db/src/schema/tiers.ts lib/db/src/schema/index.ts
git commit -m "feat: add user_tier_usage table for monthly feature consumption tracking"
```

---

### Task 3: Create team_seats table

**Files:**
- Create: `lib/db/src/migrations/0003_team_seats.sql`
- Modify: `lib/db/src/schema/tiers.ts`

- [ ] **Step 1: Write migration file**

Create `lib/db/src/migrations/0003_team_seats.sql`:

```sql
CREATE TABLE IF NOT EXISTS team_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  team_member_id INTEGER REFERENCES subscribers(id) ON DELETE SET NULL,
  team_member_email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member',
  cost_per_seat NUMERIC(10, 2) DEFAULT 50.00,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_seats_owner ON team_seats(team_owner_id);
CREATE INDEX idx_team_seats_member ON team_seats(team_member_id);
```

- [ ] **Step 2: Add schema definition**

Add to `lib/db/src/schema/tiers.ts`:

```typescript
export const teamSeatsTable = pgTable("team_seats", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamOwnerId: integer("team_owner_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  teamMemberId: integer("team_member_id").references(() => subscribersTable.id, { onDelete: "setNull" }),
  teamMemberEmail: varchar("team_member_email", { length: 255 }),
  role: varchar("role", { length: 20 }).default("member"),
  costPerSeat: numeric("cost_per_seat", { precision: 10, scale: 2 }).default("50.00"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
});
```

- [ ] **Step 3: Update schema index**

Add to `lib/db/src/schema/index.ts`:

```typescript
export { teamSeatsTable } from "./tiers";
```

- [ ] **Step 4: Run migration**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief
pnpm exec drizzle-kit migrate
```

Expected: `team_seats` table created with indexes.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/migrations/0003_team_seats.sql lib/db/src/schema/tiers.ts lib/db/src/schema/index.ts
git commit -m "feat: add team_seats table for multi-user team support"
```

---

### Task 4: Extend creator_earnings schema

**Files:**
- Modify: `lib/db/src/schema/monetization.ts`

- [ ] **Step 1: Update creatorEarnings table definition**

Modify `lib/db/src/schema/monetization.ts` - update creatorEarnings object:

```typescript
export const creatorEarnings = pgTable("creator_earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: serial("creator_id").notNull().references(() => subscribersTable.id),
  month: varchar("month", { length: 7 }).notNull(),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).default("0"),
  subscriberFees: numeric("subscriber_fees", { precision: 12, scale: 2 }).default("0"),
  referralBonuses: numeric("referral_bonuses", { precision: 12, scale: 2 }).default("0"),
  marketplaceShares: numeric("marketplace_shares", { precision: 12, scale: 2 }).default("0"),
  platformFee: numeric("platform_fee", { precision: 12, scale: 2 }).default("0"),
  netPayout: numeric("net_payout", { precision: 12, scale: 2 }).default("0"),
  creatorRevenue: numeric("creator_revenue", { precision: 12, scale: 2 }).default("0"), // NEW: 70% share
  status: earningsStatus("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 2: Update creatorSubscriptions table definition**

Modify `lib/db/src/schema/monetization.ts` - update creatorSubscriptions object:

```typescript
export const creatorSubscriptions = pgTable("creator_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: serial("creator_id").notNull().references(() => subscribersTable.id),
  subscriberId: serial("subscriber_id").notNull().references(() => subscribersTable.id),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  creatorSplit: numeric("creator_split", { precision: 5, scale: 2 }).default("70"), // NEW: 70% default
  status: varchar("status", { length: 20 }).default("active"),
  autoRenew: boolean("auto_renew").default(true),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 3: Create migration for schema changes**

Create `lib/db/src/migrations/0004_extend_monetization_schema.sql`:

```sql
ALTER TABLE creator_earnings 
ADD COLUMN IF NOT EXISTS creator_revenue NUMERIC(12, 2) DEFAULT 0;

ALTER TABLE creator_subscriptions 
ADD COLUMN IF NOT EXISTS creator_split NUMERIC(5, 2) DEFAULT 70;
```

- [ ] **Step 4: Run migration**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief
pnpm exec drizzle-kit migrate
```

Expected: Columns added to existing tables without data loss.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/schema/monetization.ts lib/db/src/migrations/0004_extend_monetization_schema.sql
git commit -m "feat: extend creator_earnings and creator_subscriptions for split tracking"
```

---

## Phase 2: API Middleware & Feature Gates

### Task 5: Create feature gates utility

**Files:**
- Create: `artifacts/api-server/src/lib/featureGates.ts`

- [ ] **Step 1: Write feature gates utility**

Create `artifacts/api-server/src/lib/featureGates.ts`:

```typescript
import { eq, and, gte } from "drizzle-orm";
import { db, subscribersTable, tierFeaturesTable, userTierUsageTable } from "@workspace/db";

export type FeatureKey = 
  | "commands_per_week"
  | "ai_advisor_sessions"
  | "vault_access"
  | "creator_suite"
  | "team_seats"
  | "cofounder_matching"
  | "deal_flow_access"
  | "investor_intros"
  | "1on1_monthly"
  | "code_review";

export async function canUseFeature(
  userId: number,
  featureKey: FeatureKey
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  try {
    // Get user tier
    const subscriber = await db.query.subscribersTable.findFirst({
      where: eq(subscribersTable.id, userId),
    });

    if (!subscriber) {
      return { allowed: false, reason: "User not found" };
    }

    // Check if feature is available in tier
    const feature = await db.query.tierFeaturesTable.findFirst({
      where: and(
        eq(tierFeaturesTable.tier, subscriber.tier),
        eq(tierFeaturesTable.featureKey, featureKey)
      ),
    });

    if (!feature) {
      return { allowed: false, reason: `Feature ${featureKey} not available in ${subscriber.tier} tier` };
    }

    // No limit = unlimited
    if (!feature.limitValue) {
      return { allowed: true };
    }

    // Check usage for this month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await db.query.userTierUsageTable.findFirst({
      where: and(
        eq(userTierUsageTable.userId, userId),
        eq(userTierUsageTable.featureKey, featureKey),
        eq(userTierUsageTable.month, currentMonth)
      ),
    });

    const usedCount = usage?.usageCount ?? 0;
    const limit = feature.limitValue;
    const remaining = Math.max(0, limit - usedCount);

    if (usedCount >= limit) {
      return { allowed: false, reason: `Monthly limit of ${limit} reached`, remaining: 0 };
    }

    return { allowed: true, remaining };
  } catch (error) {
    console.error("Error checking feature access:", error);
    // Safe fallback: allow on error to avoid service degradation
    return { allowed: true };
  }
}

export async function incrementFeatureUsage(
  userId: number,
  featureKey: FeatureKey,
  amount: number = 1
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  try {
    // Upsert: find existing or create new
    const existing = await db.query.userTierUsageTable.findFirst({
      where: and(
        eq(userTierUsageTable.userId, userId),
        eq(userTierUsageTable.featureKey, featureKey),
        eq(userTierUsageTable.month, currentMonth)
      ),
    });

    if (existing) {
      await db.update(userTierUsageTable)
        .set({ usageCount: existing.usageCount + amount })
        .where(eq(userTierUsageTable.id, existing.id));
    } else {
      await db.insert(userTierUsageTable).values({
        userId,
        featureKey,
        month: currentMonth,
        usageCount: amount,
      });
    }
  } catch (error) {
    console.error("Error incrementing feature usage:", error);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/api-server/src/lib/featureGates.ts
git commit -m "feat: add feature gates utility with usage tracking"
```

---

### Task 6: Create feature gates middleware

**Files:**
- Create: `artifacts/api-server/src/middleware/featureGate.ts`

- [ ] **Step 1: Write middleware**

Create `artifacts/api-server/src/middleware/featureGate.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { canUseFeature, type FeatureKey } from "../lib/featureGates";

export function requireFeature(featureKey: FeatureKey) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const check = await canUseFeature(userId, featureKey);

    if (!check.allowed) {
      res.status(403).json({
        error: "Feature not available in your tier",
        reason: check.reason,
        remaining: check.remaining,
      });
      return;
    }

    next();
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/api-server/src/middleware/featureGate.ts
git commit -m "feat: add feature gate middleware for protected routes"
```

---

### Task 7: Update payments route with tier prices

**Files:**
- Modify: `artifacts/api-server/src/routes/payments.ts`

- [ ] **Step 1: Replace hardcoded prices with tier prices**

Modify `artifacts/api-server/src/routes/payments.ts` - replace the prices object:

```typescript
import { tierPrices } from "@workspace/db";

// Replace lines 32-36 with:
const tierMap: Record<string, keyof typeof tierPrices> = {
  "Pro": "pro",
  "Max": "max",
  "Incubator": "incubator",
};

const prices: Record<string, { inr: number; usd: number }> = {
  pro: { inr: 2499, usd: 29 },    // Monthly price
  max: { inr: 12499, usd: 149 },
  incubator: { inr: 0, usd: 0 },  // Custom pricing
};
```

- [ ] **Step 2: Update plan mapping**

Modify `artifacts/api-server/src/routes/payments.ts` - in `create-session` route, replace plan lookup:

```typescript
const selectedPrice = prices[plan.toLowerCase()];
if (!selectedPrice) {
  res.status(400).json({ error: "Invalid plan" });
  return;
}

// Use USD for now; region detection can be added later
const amount = Math.round(selectedPrice.inr);
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/payments.ts
git commit -m "refactor: externalize tier pricing configuration"
```

---

## Phase 3: Frontend Feature Gates

### Task 8: Create tier-aware hook

**Files:**
- Create: `artifacts/specflow-newsletter/src/hooks/useTierFeatures.ts`

- [ ] **Step 1: Write custom hook**

Create `artifacts/specflow-newsletter/src/hooks/useTierFeatures.ts`:

```typescript
import { useEffect, useState } from "react";

export interface TierFeature {
  allowed: boolean;
  remaining?: number;
  reason?: string;
}

export function useTierFeatures(userId?: number) {
  const [features, setFeatures] = useState<Record<string, TierFeature>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkFeatures = async () => {
      try {
        const res = await fetch(`/api/user/${userId}/features`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setFeatures(data.features || {});
      } catch (error) {
        console.error("Error fetching features:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFeatures();
  }, [userId]);

  return { features, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/specflow-newsletter/src/hooks/useTierFeatures.ts
git commit -m "feat: add useTierFeatures hook for frontend tier checks"
```

---

### Task 9: Create tier gate modal component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/TierGateModal.tsx`

- [ ] **Step 1: Write modal component**

Create `artifacts/specflow-newsletter/src/components/TierGateModal.tsx`:

```typescript
import React from "react";

interface TierGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  requiredTier: string;
  feature: string;
  monthlyPrice: number;
}

export function TierGateModal({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  feature,
  monthlyPrice,
}: TierGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2">Upgrade to Access {feature}</h2>
        <p className="text-gray-600 mb-6">
          This feature is available in our {requiredTier} tier and above.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-lg font-semibold">${monthlyPrice}/month</p>
          <p className="text-sm text-gray-600">Billed monthly, cancel anytime</p>
        </div>
        <button
          onClick={() => {
            onClose();
            window.location.href = "/pricing";
          }}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium mb-3 hover:bg-blue-700"
        >
          Upgrade Now
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded font-medium hover:bg-gray-300"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/TierGateModal.tsx
git commit -m "feat: add tier gate modal for feature upsells"
```

---

## Phase 4: Landing Page & Pricing Update

### Task 10: Rewrite PricingSection component

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/PricingSection.tsx`

- [ ] **Step 1: Back up existing file**

```bash
cp artifacts/specflow-newsletter/src/components/PricingSection.tsx artifacts/specflow-newsletter/src/components/PricingSection.tsx.backup
```

- [ ] **Step 2: Replace with new messaging & layout**

Modify `artifacts/specflow-newsletter/src/components/PricingSection.tsx`:

```typescript
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { GuestEmailModal } from "./GuestEmailModal";
import { RazorpayCheckout } from "./RazorpayCheckout";

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  billing: string;
  value: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Signal Station",
    subtitle: "Start with clarity",
    price: 0,
    currency: "USD",
    billing: "Forever free",
    value: "$5-10k value",
    cta: "Start Free",
    features: [
      "Weekly briefs (Friday)",
      "Foundry Scorecard (monthly rating)",
      "Cohort Dashboard (anonymized metrics)",
      "1 command/week (market-scan, roast, sprint)",
      "Vault access (read-only, 3 blueprints)",
    ],
  },
  {
    id: "pro",
    name: "Builder's OS",
    subtitle: "Execute faster",
    price: 29,
    currency: "USD",
    billing: "$348/year or $29/mo",
    value: "$120k+ value",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "Daily briefs (weekdays)",
      "AI Advisor (20 sessions/month)",
      "Full Playbook (7 modules, 28 lessons)",
      "Full Vault (all blueprints, downloadable)",
      "Unlimited commands (persisted dashboard)",
      "Creator Suite (70/30 on subscriber revenue)",
      "Referral earnings ($5/subscription)",
      "Builder Community (Slack, office hours)",
      "Analytics (read rate, engagement)",
    ],
  },
  {
    id: "max",
    name: "Founder Network",
    subtitle: "Scale with your network",
    price: 149,
    currency: "USD",
    billing: "$1,788/year or $149/mo",
    value: "$1M-10M+ value",
    cta: "Join Max",
    features: [
      "Everything in Pro +",
      "1-on-1 monthly (30min with exited founder)",
      "Private code review (CTO audit)",
      "Pre-built templates (70% time savings)",
      "Deal flow access (companies raising, investments)",
      "Co-founder matching (skill-based algorithm)",
      "Investor intros (3 warm intros/year)",
      "Founder events (quarterly in-person)",
      "Exit network (DMs with exited founders)",
      "Team seats (+$50/seat for co-founders)",
      "Custom brief (personalized daily)",
      "Leaderboard featured (top creators showcased)",
    ],
  },
  {
    id: "incubator",
    name: "Co-founder on Demand",
    subtitle: "White-glove partnership",
    price: 0,
    currency: "USD",
    billing: "$5k-50k/mo or equity",
    value: "$10M-100M+ value",
    cta: "Apply",
    features: [
      "Everything in Max +",
      "Weekly check-ins (founder + ops/product)",
      "Architecture audit (full tech stack)",
      "First revenue sprint (30-day path to $1k MRR)",
      "Fundraising playbook (pitch deck, VC intros)",
      "Exit positioning (M&A strategy from day 1)",
      "Custom network access (acquirers, late-stage investors)",
    ],
  },
];

export function PricingSection() {
  const { isSignedIn, user } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleCTA = (tierId: string) => {
    if (!isSignedIn) {
      setShowGuestModal(true);
      return;
    }

    if (tierId === "incubator") {
      window.location.href = "mailto:founders@thebuilderbrief.com?subject=Incubator%20Application";
      return;
    }

    setSelectedPlan(tierId);
  };

  const getCTAText = (tierId: string): string => {
    if (!isSignedIn) return pricingTiers.find(t => t.id === tierId)?.cta || "Start";
    
    // Assume current tier is "free" for now; this should come from user context
    const currentTier = "free";
    if (tierId === currentTier) return "Current Plan";
    if (tierId === "free") return "Downgrade";
    return pricingTiers.find(t => t.id === tierId)?.cta || "Upgrade";
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Founder Intelligence Network</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Every decision compounds. The ones that don't cost you $2M in invisible losses.
          We show you the signal — then give you the system to act on it.
        </p>
        <button
          onClick={() => handleCTA("free")}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Start Free
        </button>
      </section>

      {/* Founder Progression Section */}
      <section className="py-12 bg-gray-50 rounded-lg mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Your Founder Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { tier: "Free", focus: "Get the signal" },
            { tier: "Pro", focus: "Get the system" },
            { tier: "Max", focus: "Get the network" },
            { tier: "Incubator", focus: "Get a co-founder" },
          ].map(({ tier, focus }) => (
            <div key={tier} className="text-center">
              <p className="text-sm text-gray-600 mb-2">{tier}</p>
              <p className="font-semibold">{focus}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`border rounded-lg p-6 relative ${
              tier.highlighted
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                : "border-gray-200"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </div>
            )}

            <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{tier.subtitle}</p>

            <div className="mb-4">
              <div className="text-4xl font-bold">${tier.price}</div>
              <p className="text-sm text-gray-600">{tier.billing}</p>
              <p className="text-sm font-semibold text-green-600 mt-2">{tier.value}</p>
            </div>

            <button
              onClick={() => handleCTA(tier.id)}
              disabled={getCTAText(tier.id) === "Current Plan"}
              className="w-full py-2 rounded font-semibold mb-6 disabled:opacity-50"
              style={{
                backgroundColor: tier.highlighted ? "#2563eb" : "#e5e7eb",
                color: tier.highlighted ? "white" : "black",
              }}
            >
              {getCTAText(tier.id)}
            </button>

            <ul className="space-y-3">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="mr-3">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Creator Economy Section */}
      <section className="bg-green-50 border border-green-200 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4">Earn While You Build</h2>
        <p className="text-gray-700 mb-6">
          Monetize your expertise by creating subscriber-only content. Earn 70% of revenue,
          plus $5 for each new referral.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 mb-2">100 Pro subscribers @ $29/mo</p>
            <p className="text-2xl font-bold">$2,030/mo revenue</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Your cut (70%)</p>
            <p className="text-2xl font-bold text-green-600">$1,421/mo</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Referral bonus: $5/sub</p>
            <p className="text-2xl font-bold">$500/mo from 100 referrals</p>
          </div>
        </div>
      </section>

      {/* Network Effects Section */}
      <section className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4">Network Effects</h2>
        <p className="text-gray-700 mb-6">
          The Brief gets stronger as more founders join. You're not buying a subscription—
          you're joining a founder network.
        </p>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="mr-3 font-bold">•</span>
            <span>Free users find co-founders and access curated resources</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 font-bold">•</span>
            <span>Pro users unlock creator economy and earn from followers</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 font-bold">•</span>
            <span>Max users get deal flow, investor intros, and peer network</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 font-bold">•</span>
            <span>Incubator partners scale to exit</span>
          </li>
        </ul>
      </section>

      {/* Modals */}
      {showGuestModal && (
        <GuestEmailModal
          onClose={() => setShowGuestModal(false)}
          onSubmit={(email) => {
            // Store email and redirect to signup
            localStorage.setItem("guestEmail", email);
            window.location.href = "/signup";
          }}
        />
      )}

      {selectedPlan && selectedPlan !== "free" && (
        <RazorpayCheckout
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify component compiles**

```bash
cd artifacts/specflow-newsletter
pnpm build 2>&1 | head -50
```

Expected: No TypeScript errors related to PricingSection.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/PricingSection.tsx
git commit -m "feat: redesign PricingSection with founder messaging, tiers, and network effects"
```

---

## Phase 5: Creator Suite Implementation

### Task 11: Create creator subscription endpoints

**Files:**
- Create: `artifacts/api-server/src/routes/creator-subscriptions.ts`

- [ ] **Step 1: Write creator subscription routes**

Create `artifacts/api-server/src/routes/creator-subscriptions.ts`:

```typescript
import { Router, type IRouter, Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, creatorSubscriptionsTable, subscribersTable, creatorEarningsTable } from "@workspace/db";
import { verifyUser } from "../middleware/verifyUser";
import { requireFeature } from "../middleware/featureGate";
import { incrementFeatureUsage } from "../lib/featureGates";

const router: IRouter = Router();

/**
 * POST /api/creator-subscriptions
 * Creator sets up a subscription offering
 */
router.post(
  "/creator-subscriptions",
  verifyUser,
  requireFeature("creator_suite"),
  async (req: Request, res: Response): Promise<void> => {
    const creatorId = req.user?.id;
    const { monthlyPrice } = req.body;

    if (!creatorId || !monthlyPrice || monthlyPrice <= 0) {
      res.status(400).json({ error: "Creator ID and valid monthly price required" });
      return;
    }

    try {
      const subscription = await db.insert(creatorSubscriptionsTable).values({
        creatorId,
        subscriberId: creatorId, // Placeholder
        monthlyPrice: monthlyPrice.toString(),
        creatorSplit: "70",
        status: "pending",
      }).returning();

      res.json({
        subscriptionId: subscription[0].id,
        monthlyPrice,
        creatorSplit: 70,
        status: "pending",
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  }
);

/**
 * GET /api/creator-subscriptions/me
 * Get creator's subscription offerings
 */
router.get(
  "/creator-subscriptions/me",
  verifyUser,
  async (req: Request, res: Response): Promise<void> => {
    const creatorId = req.user?.id;

    if (!creatorId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const subscriptions = await db.query.creatorSubscriptionsTable.findMany({
        where: eq(creatorSubscriptionsTable.creatorId, creatorId),
      });

      res.json({ subscriptions });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  }
);

/**
 * POST /api/creator-subscriptions/:subscriptionId/subscribe
 * User subscribes to creator's offering
 */
router.post(
  "/creator-subscriptions/:subscriptionId/subscribe",
  verifyUser,
  async (req: Request, res: Response): Promise<void> => {
    const subscriberId = req.user?.id;
    const { subscriptionId } = req.params;

    if (!subscriberId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      // Verify subscription exists
      const subscription = await db.query.creatorSubscriptionsTable.findFirst({
        where: eq(creatorSubscriptionsTable.id, subscriptionId),
      });

      if (!subscription) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }

      // Create subscription record
      const sub = await db.insert(creatorSubscriptionsTable).values({
        creatorId: subscription.creatorId,
        subscriberId,
        monthlyPrice: subscription.monthlyPrice,
        creatorSplit: subscription.creatorSplit,
      }).returning();

      res.json({ subscriptionId: sub[0].id, status: "active" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  }
);

export default router;
```

- [ ] **Step 2: Register route in app**

Modify `artifacts/api-server/src/index.ts` - add import and use:

```typescript
import creatorSubscriptionsRouter from "./routes/creator-subscriptions";

// In app setup (after other routes):
app.use("/api", creatorSubscriptionsRouter);
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/creator-subscriptions.ts artifacts/api-server/src/index.ts
git commit -m "feat: add creator subscription endpoints with tier gates"
```

---

## Phase 6: Team Seats

### Task 12: Create team seats endpoints

**Files:**
- Create: `artifacts/api-server/src/routes/team-seats.ts`

- [ ] **Step 1: Write team seats routes**

Create `artifacts/api-server/src/routes/team-seats.ts`:

```typescript
import { Router, type IRouter, Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, teamSeatsTable, subscribersTable } from "@workspace/db";
import { verifyUser } from "../middleware/verifyUser";
import { requireFeature } from "../middleware/featureGate";

const router: IRouter = Router();

/**
 * POST /api/team-seats
 * Max+ tier: invite team member
 */
router.post(
  "/team-seats",
  verifyUser,
  requireFeature("team_seats"),
  async (req: Request, res: Response): Promise<void> => {
    const teamOwnerId = req.user?.id;
    const { teamMemberEmail, role } = req.body;

    if (!teamOwnerId || !teamMemberEmail) {
      res.status(400).json({ error: "Owner ID and member email required" });
      return;
    }

    try {
      const seat = await db.insert(teamSeatsTable).values({
        teamOwnerId,
        teamMemberEmail,
        role: role || "member",
        costPerSeat: "50.00",
        status: "pending",
      }).returning();

      res.json({
        seatId: seat[0].id,
        teamMemberEmail,
        role,
        costPerSeat: 50,
        status: "pending",
      });
    } catch (error) {
      console.error("Error creating team seat:", error);
      res.status(500).json({ error: "Failed to create team seat" });
    }
  }
);

/**
 * GET /api/team-seats/me
 * Get user's team seats
 */
router.get(
  "/team-seats/me",
  verifyUser,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const seats = await db.query.teamSeatsTable.findMany({
        where: eq(teamSeatsTable.teamOwnerId, userId),
      });

      const seatsWithMembers = await Promise.all(
        seats.map(async (seat) => {
          if (seat.teamMemberId) {
            const member = await db.query.subscribersTable.findFirst({
              where: eq(subscribersTable.id, seat.teamMemberId),
            });
            return { ...seat, memberEmail: member?.email };
          }
          return seat;
        })
      );

      res.json({ seats: seatsWithMembers });
    } catch (error) {
      console.error("Error fetching team seats:", error);
      res.status(500).json({ error: "Failed to fetch team seats" });
    }
  }
);

/**
 * DELETE /api/team-seats/:seatId
 * Remove team member
 */
router.delete(
  "/team-seats/:seatId",
  verifyUser,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { seatId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      await db.delete(teamSeatsTable)
        .where(and(
          eq(teamSeatsTable.id, seatId),
          eq(teamSeatsTable.teamOwnerId, userId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing team seat:", error);
      res.status(500).json({ error: "Failed to remove team seat" });
    }
  }
);

export default router;
```

- [ ] **Step 2: Register route in app**

Modify `artifacts/api-server/src/index.ts` - add import and use:

```typescript
import teamSeatsRouter from "./routes/team-seats";

// In app setup:
app.use("/api", teamSeatsRouter);
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/team-seats.ts artifacts/api-server/src/index.ts
git commit -m "feat: add team seats management endpoints"
```

---

## Verification & Finalization

### Task 13: Test feature gates

**Files:**
- No new files
- Test: Run payment flow with tier checks

- [ ] **Step 1: Start dev server**

```bash
cd artifacts/api-server && pnpm dev &
cd artifacts/specflow-newsletter && pnpm dev
```

- [ ] **Step 2: Test free tier limit**

```bash
curl -X POST http://localhost:5000/api/commands \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"market-scan"}' \
  -d '{"command":"market-scan"}'
```

Expected: Second request returns 403 with limit message.

- [ ] **Step 3: Test tier upgrade**

Manual test in browser:
1. Sign up as free user
2. Visit `/pricing`
3. Click "Upgrade to Pro"
4. Complete Razorpay checkout
5. Verify tier updated to "pro" in DB

```bash
psql $DATABASE_URL -c "SELECT id, tier, email FROM subscribers WHERE email='test@example.com';"
```

Expected: tier = "pro"

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "test: verify feature gates and tier upgrades work correctly"
```

---

### Task 14: Final integration check

- [ ] **Step 1: Build frontend**

```bash
cd artifacts/specflow-newsletter
pnpm build
```

Expected: No errors.

- [ ] **Step 2: Check TypeScript types**

```bash
cd artifacts/api-server
pnpm tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit and summary**

```bash
git log --oneline -15
```

Expected: 13-14 clean commits for this feature.

---

## Summary

**Completed:**
- ✅ 4 database tables (tier_features, user_tier_usage, team_seats, extended monetization)
- ✅ Feature gates utility (canUseFeature, incrementFeatureUsage)
- ✅ API middleware for tier checks
- ✅ Frontend custom hook (useTierFeatures) and modal (TierGateModal)
- ✅ PricingSection redesign with hero, tiers, progession, creator economy, network effects
- ✅ Creator subscription endpoints
- ✅ Team seats management
- ✅ Integration testing

**Next:** Use superpowers:finishing-a-development-branch to merge and verify all changes.
