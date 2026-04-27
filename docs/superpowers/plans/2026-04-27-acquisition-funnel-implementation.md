# Customer Acquisition Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Free→Pro→Max→Incubator funnel with upgrade triggers, milestone tracking, advisor matching, and hyper-personalization to maximize conversion and minimize churn.

**Architecture:** Outcome-based funnel tied to founder stage progression. Each tier upgrade is triggered by specific events (milestone hits, scout identification). Backend tracks upgrade eligibility, milestones, advisor assignments, and founder signals. Frontend shows contextual CTAs. Email sequences drive conversions at key moments. Personalization framework ensures all recommendations match founder's specific traction level + market + stage.

**Tech Stack:** Drizzle ORM, Express 5, React, Resend (email), Clerk (auth), Stripe/Razorpay (payments).

---

## File Structure

**Database Schema:**
- Create: `lib/db/src/schema/funnel.ts` — Tables for milestones, advisor assignments, upgrade offers, scout candidates, founder signals

**Backend API & Logic:**
- Create: `artifacts/api-server/src/routes/funnel.ts` — Endpoints for upgrade checks, milestone tracking, advisor matching, scout identification
- Create: `artifacts/api-server/src/lib/funnel/eligibility.ts` — Free→Pro, Pro→Max, Max→Incubator upgrade eligibility logic
- Create: `artifacts/api-server/src/lib/funnel/milestones.ts` — Pro milestone tracking and checking
- Create: `artifacts/api-server/src/lib/funnel/advisors.ts` — Advisor matching by stage/market
- Create: `artifacts/api-server/src/lib/funnel/scouts.ts` — Scout scoring and identification logic
- Create: `artifacts/api-server/src/lib/funnel/personalization.ts` — Hyper-personalization framework
- Create: `artifacts/api-server/src/config/playbook-segments.ts` — Playbook content by stage/market
- Create: `artifacts/api-server/src/config/advisors.ts` — Advisor roster (mock)

**Frontend Components:**
- Create: `artifacts/specflow-newsletter/src/components/UpgradePrompt.tsx` — Free→Pro upgrade CTA
- Create: `artifacts/specflow-newsletter/src/components/MilestoneProgress.tsx` — Pro milestone tracker
- Create: `artifacts/specflow-newsletter/src/components/AdvisorProfile.tsx` — Advisor info card
- Create: `artifacts/specflow-newsletter/src/components/ScoutInvitation.tsx` — Incubator invite flow
- Modify: `artifacts/specflow-newsletter/src/pages/user-portal.tsx` — Integrate upgrade CTAs

**Email:**
- Modify: `artifacts/api-server/src/lib/email.ts` — Add upgrade email sequences

---

## Phase 1: Database Schema & Migrations

### Task 1: Create funnel schema

**Files:**
- Create: `lib/db/src/schema/funnel.ts`

**What:** Define database tables for milestone tracking, advisor assignments, upgrade offers, scout candidates, and founder engagement signals.

- [ ] **Step 1: Write schema file with all tables**

Create `lib/db/src/schema/funnel.ts`:

```typescript
import { pgTable, text, integer, timestamp, boolean, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { users } from "./index";
import { relations } from "drizzle-orm";

// Track Pro tier milestones per founder
export const proMilestones = pgTable("pro_milestones", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  mrrTarget: integer("mrr_target").notNull().default(500), // $500 MRR in cents
  userCountTarget: integer("user_count_target").notNull().default(500),
  currentMrr: integer("current_mrr").notNull().default(0),
  currentUserCount: integer("current_user_count").notNull().default(0),
  featureShipped: boolean("feature_shipped").notNull().default(false),
  milestonesHit: integer("milestones_hit").notNull().default(0), // 0-3 (tracks how many milestones hit)
  maxUpgradeEligibleAt: timestamp("max_upgrade_eligible_at"), // When they hit 2 of 3
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Track advisor assignments for Max tier
export const advisorAssignments = pgTable("advisor_assignments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  advisorId: text("advisor_id").notNull(), // Reference to advisors config
  advisorName: varchar("advisor_name").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  nextQuarterlyCheckIn: timestamp("next_quarterly_checkin"),
  lastCheckInAt: timestamp("last_checkin_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track upgrade offers sent (for email logging)
export const upgradeOffers = pgTable("upgrade_offers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  fromTier: varchar("from_tier").notNull(), // "free" | "pro" | "max"
  toTier: varchar("to_tier").notNull(), // "pro" | "max" | "incubator"
  triggerType: varchar("trigger_type").notNull(), // "health_score" | "playbook_clicks" | "milestone_hit" | "scout_invite"
  emailSentAt: timestamp("email_sent_at"),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track founder engagement signals for churn & scout identification
export const founderSignals = pgTable("founder_signals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  scorecardRunsLast30Days: integer("scorecard_runs_last_30_days").notNull().default(0),
  lastScorecardRunAt: timestamp("last_scorecard_run_at"),
  playbook PagesViewedLast30Days: integer("playbook_pages_viewed_last_30_days").notNull().default(0),
  advisorCallsCompleted: integer("advisor_calls_completed").notNull().default(0),
  foundedBefore: boolean("founded_before").notNull().default(false), // Credibility signal
  previousExits: integer("previous_exits").notNull().default(0),
  estimatedTam: varchar("estimated_tam"), // "$10M" | "$100M" | "$1B+" | etc
  defensibility: varchar("defensibility"), // "high" | "medium" | "low"
  consecutiveGrowthQuarters: integer("consecutive_growth_quarters").notNull().default(0),
  scoutScore: decimal("scout_score", { precision: 5, scale: 2 }).notNull().default("0"), // 0-100
  scoutInvitedAt: timestamp("scout_invited_at"),
  incubatorAcceptedAt: timestamp("incubator_accepted_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Churn risk indicators
export const churnRiskScores = pgTable("churn_risk_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  tier: varchar("tier").notNull(), // "free" | "pro" | "max" | "incubator"
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(), // 0-100 (100 = high churn risk)
  reasons: jsonb("reasons").notNull().default('[]'), // ["scorecard_unused_2_weeks", "no_playbook_engagement", etc]
  lastReviewedAt: timestamp("last_reviewed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const proMilestonesRelations = relations(proMilestones, ({ one }) => ({
  user: one(users, { fields: [proMilestones.userId], references: [users.id] }),
}));

export const advisorAssignmentsRelations = relations(advisorAssignments, ({ one }) => ({
  user: one(users, { fields: [advisorAssignments.userId], references: [users.id] }),
}));

export const upgradeOffersRelations = relations(upgradeOffers, ({ one }) => ({
  user: one(users, { fields: [upgradeOffers.userId], references: [users.id] }),
}));

export const founderSignalsRelations = relations(founderSignals, ({ one }) => ({
  user: one(users, { fields: [founderSignals.userId], references: [users.id] }),
}));

export const churnRiskScoresRelations = relations(churnRiskScores, ({ one }) => ({
  user: one(users, { fields: [churnRiskScores.userId], references: [users.id] }),
}));
```

- [ ] **Step 2: Run migration to create tables**

```bash
cd artifacts/api-server
pnpm db:push
```

Expected: No errors. Tables created in PostgreSQL.

- [ ] **Step 3: Verify schema in database**

```bash
psql $DATABASE_URL -c "\dt pro_milestones, advisor_assignments, upgrade_offers, founder_signals, churn_risk_scores"
```

Expected: All 5 tables listed.

- [ ] **Step 4: Commit**

```bash
git add lib/db/src/schema/funnel.ts
git commit -m "schema: add funnel tracking tables for milestones, advisors, offers, signals, churn"
```

---

## Phase 2: Free→Pro Upgrade System

### Task 2: Upgrade eligibility logic

**Files:**
- Create: `artifacts/api-server/src/lib/funnel/eligibility.ts`

**What:** Implement logic to check if a Free user is ready for Pro upgrade, Pro user is ready for Max upgrade, Max user is eligible for Incubator.

- [ ] **Step 1: Write eligibility checking functions**

Create `artifacts/api-server/src/lib/funnel/eligibility.ts`:

```typescript
import { db } from "@/db";
import { users, founderSignals, proMilestones, advisorAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UpgradeEligibility {
  tier: "free" | "pro" | "max";
  isEligible: boolean;
  reason?: string; // Why they qualify or don't qualify
  triggerType?: string; // "health_score" | "playbook_clicks" | "milestone_hit" | "scout_invite"
}

// Check if Free user should be offered Pro
export async function checkFreeToProEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user[0]?.tier !== "free") {
    return { tier: "free", isEligible: false, reason: "User is not on Free tier" };
  }

  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals) {
    return { tier: "free", isEligible: false, reason: "No signal data found" };
  }

  const signal = signals[0];

  // Trigger 1: Health score is critical (<40) AND they've run scorecard at least once
  const hasWeakHealthScore = signal.scorecardRunsLast30Days >= 1; // We'll calculate health score elsewhere
  
  // Trigger 2: Attempted to access playbook 3+ times (locked content)
  const hasPlaybookClicks = signal.playbookPagesViewedLast30Days >= 3;

  // Trigger 3: Consistent usage (2+ scorecard runs in last month)
  const hasConsistentUsage = signal.scorecardRunsLast30Days >= 2;

  if (hasWeakHealthScore || hasPlaybookClicks || hasConsistentUsage) {
    return {
      tier: "free",
      isEligible: true,
      reason: "Qualifies for Pro upgrade",
      triggerType: hasWeakHealthScore
        ? "health_score"
        : hasPlaybookClicks
          ? "playbook_clicks"
          : "usage_pattern",
    };
  }

  return { tier: "free", isEligible: false, reason: "Not ready for upgrade yet" };
}

// Check if Pro user should be offered Max
export async function checkProToMaxEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user[0]?.tier !== "pro") {
    return { tier: "pro", isEligible: false, reason: "User is not on Pro tier" };
  }

  const milestones = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  if (!milestones) {
    return { tier: "pro", isEligible: false, reason: "No milestone tracking found" };
  }

  const milestone = milestones[0];

  // Hit 2 of 3 milestones
  if (milestone.milestonesHit >= 2) {
    return {
      tier: "pro",
      isEligible: true,
      reason: `Qualified: ${milestone.milestonesHit} milestones hit`,
      triggerType: "milestone_hit",
    };
  }

  return {
    tier: "pro",
    isEligible: false,
    reason: `Need 2 of 3 milestones. Currently at: ${milestone.milestonesHit}`,
  };
}

// Check if Max user should be scouted for Incubator
export async function checkMaxToIncubatorEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user[0]?.tier !== "max") {
    return { tier: "max", isEligible: false, reason: "User is not on Max tier" };
  }

  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals) {
    return { tier: "max", isEligible: false, reason: "No signal data found" };
  }

  const signal = signals[0];

  // Criteria for Incubator: 2+ consecutive growth quarters + credibility + market opportunity
  const hasGrowthTrajectory = signal.consecutiveGrowthQuarters >= 2;
  const hasCredibility =
    signal.previousExits > 0 ||
    signal.advisorCallsCompleted >= 2 ||
    signal.foundedBefore === true;
  const hasMarketOpportunity =
    signal.estimatedTam === "$1B+" ||
    signal.defensibility === "high";

  const scoutScore =
    (hasGrowthTrajectory ? 30 : 0) +
    (hasCredibility ? 35 : 0) +
    (hasMarketOpportunity ? 35 : 0);

  if (scoutScore >= 70) {
    return {
      tier: "max",
      isEligible: true,
      reason: `Scout score: ${scoutScore}/100. Qualifies for Incubator invitation.`,
      triggerType: "scout_invite",
    };
  }

  return {
    tier: "max",
    isEligible: false,
    reason: `Scout score: ${scoutScore}/100. Need 70+ for Incubator.`,
  };
}

// Bulk check all three transitions for reporting
export async function checkAllUpgradeEligibilities(userId: string) {
  const freeToProResult = await checkFreeToProEligibility(userId);
  const proToMaxResult = await checkProToMaxEligibility(userId);
  const maxToIncubatorResult = await checkMaxToIncubatorEligibility(userId);

  return {
    freeToProResult,
    proToMaxResult,
    maxToIncubatorResult,
  };
}
```

- [ ] **Step 2: Write unit tests for eligibility logic**

Create `artifacts/api-server/src/lib/funnel/__tests__/eligibility.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  checkFreeToProEligibility,
  checkProToMaxEligibility,
  checkMaxToIncubatorEligibility,
} from "../eligibility";
import { db } from "@/db";
import { users, founderSignals, proMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Eligibility", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    testUserId = `test-user-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      tier: "free",
    });
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(founderSignals).where(eq(founderSignals.userId, testUserId));
    await db.delete(proMilestones).where(eq(proMilestones.userId, testUserId));
  });

  it("should mark Free user as eligible for Pro if they have 2+ scorecard runs", async () => {
    // Create signals with 2 scorecard runs
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      scorecardRunsLast30Days: 2,
      playbookPagesViewedLast30Days: 0,
    });

    const result = await checkFreeToProEligibility(testUserId);

    expect(result.isEligible).toBe(true);
    expect(result.triggerType).toBe("usage_pattern");
  });

  it("should mark Free user as ineligible if no usage", async () => {
    // Create signals with 0 usage
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      scorecardRunsLast30Days: 0,
      playbookPagesViewedLast30Days: 0,
    });

    const result = await checkFreeToProEligibility(testUserId);

    expect(result.isEligible).toBe(false);
  });

  it("should mark Pro user as eligible for Max if 2 milestones hit", async () => {
    // Update tier to Pro
    await db.update(users).set({ tier: "pro" }).where(eq(users.id, testUserId));

    // Create milestone tracking with 2 hits
    await db.insert(proMilestones).values({
      id: `milestones-${testUserId}`,
      userId: testUserId,
      milestonesHit: 2,
    });

    const result = await checkProToMaxEligibility(testUserId);

    expect(result.isEligible).toBe(true);
    expect(result.triggerType).toBe("milestone_hit");
  });

  it("should mark Pro user as ineligible if <2 milestones hit", async () => {
    // Update tier to Pro
    await db.update(users).set({ tier: "pro" }).where(eq(users.id, testUserId));

    // Create milestone tracking with 1 hit
    await db.insert(proMilestones).values({
      id: `milestones-${testUserId}`,
      userId: testUserId,
      milestonesHit: 1,
    });

    const result = await checkProToMaxEligibility(testUserId);

    expect(result.isEligible).toBe(false);
  });

  it("should mark Max user as eligible for Incubator if scout score >=70", async () => {
    // Update tier to Max
    await db.update(users).set({ tier: "max" }).where(eq(users.id, testUserId));

    // Create signals with high credibility and market opportunity
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      consecutiveGrowthQuarters: 2, // 30 points
      previousExits: 1, // 35 points
      estimatedTam: "$1B+", // 35 points = 100 total
    });

    const result = await checkMaxToIncubatorEligibility(testUserId);

    expect(result.isEligible).toBe(true);
    expect(result.triggerType).toBe("scout_invite");
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd artifacts/api-server
pnpm test --run lib/funnel/__tests__/eligibility.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/lib/funnel/eligibility.ts artifacts/api-server/src/lib/funnel/__tests__/eligibility.test.ts
git commit -m "feat: add upgrade eligibility logic for Free→Pro, Pro→Max, Max→Incubator"
```

---

### Task 3: Upgrade eligibility API endpoint

**Files:**
- Create: `artifacts/api-server/src/routes/funnel.ts`

**What:** Add API endpoints to check upgrade eligibility and fetch upgrade data.

- [ ] **Step 1: Write API routes**

Create `artifacts/api-server/src/routes/funnel.ts`:

```typescript
import { Router, Request, Response } from "express";
import { requireAuth } from "@/middleware/auth";
import {
  checkFreeToProEligibility,
  checkProToMaxEligibility,
  checkMaxToIncubatorEligibility,
  checkAllUpgradeEligibilities,
} from "@/lib/funnel/eligibility";

const router = Router();

// Check if current user is eligible for upgrade
router.get("/api/funnel/upgrade-eligibility", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tier } = req.query; // "free" | "pro" | "max" to check specific transition

    let result;
    if (tier === "free") {
      result = await checkFreeToProEligibility(userId);
    } else if (tier === "pro") {
      result = await checkProToMaxEligibility(userId);
    } else if (tier === "max") {
      result = await checkMaxToIncubatorEligibility(userId);
    } else {
      // Return all three
      const allResults = await checkAllUpgradeEligibilities(userId);
      return res.json(allResults);
    }

    return res.json(result);
  } catch (error) {
    console.error("Upgrade eligibility error:", error);
    return res.status(500).json({ error: "Failed to check upgrade eligibility" });
  }
});

// Get upgrade offer details (what they'd unlock)
router.get(
  "/api/funnel/upgrade-offer/:fromTier/:toTier",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { fromTier, toTier } = req.params; // e.g., "free" to "pro"

      const offers: Record<string, Record<string, object>> = {
        free: {
          pro: {
            price: "$300/year",
            unlocks: [
              "AI context engine (reads your specific situation)",
              "Playbook (stage-specific solutions)",
              "Founder calls (ask experts who've done it)",
            ],
            positioning: "You're not lost. Here's the map.",
          },
        },
        pro: {
          max: {
            price: "$5,000/year",
            unlocks: [
              "Direct 1:1 founder calls (who've exited)",
              "Quarterly strategy deep dives",
              "Assigned advisor (not rotating)",
            ],
            positioning: "You're not guessing. You're executing with a scar-tissue mentor.",
          },
        },
        max: {
          incubator: {
            price: "Invitation-only",
            unlocks: [
              "Capital introductions (investor network)",
              "Strategic partnerships (portfolio companies)",
              "Curated founder peer group",
              "Potential equity stake in your company",
            ],
            positioning: "You've proven it works. Now we're backing you.",
          },
        },
      };

      const offer = offers[fromTier]?.[toTier];
      if (!offer) {
        return res.status(404).json({ error: "Upgrade path not found" });
      }

      return res.json(offer);
    } catch (error) {
      console.error("Upgrade offer error:", error);
      return res.status(500).json({ error: "Failed to fetch upgrade offer" });
    }
  }
);

export default router;
```

- [ ] **Step 2: Register routes in main API**

Modify `artifacts/api-server/src/routes/index.ts`:

```typescript
import funnelRoutes from "./funnel";

// ... other routes ...

app.use(funnelRoutes);
```

- [ ] **Step 3: Test endpoint locally**

```bash
cd artifacts/api-server
pnpm dev
```

In another terminal, test:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/funnel/upgrade-eligibility?tier=free
```

Expected: JSON response with `{ tier: "free", isEligible: true/false, reason: "..." }`

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/routes/funnel.ts
git commit -m "feat: add funnel API endpoints for upgrade eligibility and offer details"
```

---

### Task 4: Free→Pro upgrade email sequence

**Files:**
- Modify: `artifacts/api-server/src/lib/email.ts` (or create if doesn't exist)

**What:** Send personalized email when Free user qualifies for Pro upgrade.

- [ ] **Step 1: Add email templates**

Modify or create `artifacts/api-server/src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFreeToProUpgradeEmail(
  userEmail: string,
  userName: string,
  healthScore?: number,
  playbook Pages?: number
): Promise<void> {
  const triggerReason = healthScore
    ? `Your health score is ${healthScore}/100 — there's work to do`
    : `You've checked the playbook ${playbookPages} times`;

  const htmlContent = `
    <h2>Ready to fix this?</h2>
    <p>Hi ${userName},</p>
    <p>${triggerReason}. You're ready for the next step.</p>
    <p><strong>Pro ($300/year)</strong> gives you:</p>
    <ul>
      <li>AI context engine that reads your specific situation</li>
      <li>Playbook (how founders at your stage solved this)</li>
      <li>Access to founder calls (ask experts who've done it)</li>
    </ul>
    <p>You're not lost. Here's the map.</p>
    <a href="${process.env.APP_URL}/upgrade/pro" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Unlock Pro
    </a>
    <p style="font-size: 12px; color: #666;">30-day money-back guarantee. No credit card for 7 days.</p>
  `;

  await resend.emails.send({
    from: "The Builder Brief <founders@thebuilderbrief.com>",
    to: userEmail,
    subject: "You're ready for Pro",
    html: htmlContent,
  });
}

export async function sendProToMaxUpgradeEmail(
  userEmail: string,
  userName: string,
  milestoneName: string
): Promise<void> {
  const htmlContent = `
    <h2>You've proven it works. Now accelerate.</h2>
    <p>Hi ${userName},</p>
    <p>You hit ${milestoneName}. That's the milestone that matters.</p>
    <p><strong>Max ($5,000/year)</strong> unlocks:</p>
    <ul>
      <li>Direct 1:1 calls with founders who've exited</li>
      <li>Quarterly deep dives on your competitive landscape</li>
      <li>Custom strategy sessions (you set the agenda)</li>
    </ul>
    <p>You're not guessing anymore. You're executing with a scar-tissue mentor.</p>
    <a href="${process.env.APP_URL}/upgrade/max" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Unlock Max
    </a>
    <p style="font-size: 12px; color: #666;">30-day money-back guarantee.</p>
  `;

  await resend.emails.send({
    from: "The Builder Brief <founders@thebuilderbrief.com>",
    to: userEmail,
    subject: `You qualified for Max. Here's what's next.`,
    html: htmlContent,
  });
}

export async function sendIncubatorInvitationEmail(
  userEmail: string,
  userName: string,
  advisorName: string
): Promise<void> {
  const htmlContent = `
    <h2>You're in the top 5%. We're backing you.</h2>
    <p>Hi ${userName},</p>
    <p>${advisorName} and the Builder Brief team have been watching your progress.</p>
    <p>You've proven your trajectory. We want to back you.</p>
    <p><strong>Incubator (invitation-only)</strong>:</p>
    <ul>
      <li>Capital introductions (our investor network)</li>
      <li>Strategic partnerships (portfolio companies who could be customers)</li>
      <li>Curated founder peer group (6-12 months ahead of you)</li>
      <li>Potential equity stake in your company</li>
    </ul>
    <a href="${process.env.APP_URL}/incubator/accept-invitation" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      See Incubator Details
    </a>
    <p style="font-size: 12px; color: #666;">This invitation expires in 7 days.</p>
  `;

  await resend.emails.send({
    from: "The Builder Brief <founders@thebuilderbrief.com>",
    to: userEmail,
    subject: `Incubator invitation: Let's back you`,
    html: htmlContent,
  });
}
```

- [ ] **Step 2: Add email sending trigger to eligibility check**

Modify `artifacts/api-server/src/lib/funnel/eligibility.ts` to add a function that sends email:

```typescript
import { sendFreeToProUpgradeEmail } from "@/lib/email";
import { db } from "@/db";
import { users, upgradeOffers } from "@/db/schema";

export async function checkAndNotifyFreeToProEligibility(userId: string): Promise<void> {
  const eligibility = await checkFreeToProEligibility(userId);

  if (!eligibility.isEligible) return;

  // Check if we already sent an offer in last 7 days
  const recentOffer = await db
    .select()
    .from(upgradeOffers)
    .where(
      eq(upgradeOffers.userId, userId) &&
      eq(upgradeOffers.fromTier, "free") &&
      eq(upgradeOffers.toTier, "pro") &&
      gt(upgradeOffers.emailSentAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    )
    .limit(1);

  if (recentOffer.length > 0) return; // Already sent recently

  // Get user email
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const userName = user[0].name || "Founder";

  // Send email
  await sendFreeToProUpgradeEmail(user[0].email, userName);

  // Log that we sent the offer
  await db.insert(upgradeOffers).values({
    id: `offer-${userId}-${Date.now()}`,
    userId,
    fromTier: "free",
    toTier: "pro",
    triggerType: eligibility.triggerType,
    emailSentAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day window
  });
}
```

- [ ] **Step 3: Test email sending**

Create a test script `artifacts/api-server/src/lib/email.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { sendFreeToProUpgradeEmail } from "../email";

describe("Email sending", () => {
  it("should send Free→Pro upgrade email without error", async () => {
    // Only run in test environment
    if (process.env.NODE_ENV !== "test") return;

    // Mock Resend for testing
    await expect(
      sendFreeToProUpgradeEmail("test@example.com", "Test User", 35)
    ).resolves.not.toThrow();
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/lib/email.ts
git commit -m "feat: add upgrade email sequences for Free→Pro, Pro→Max, Incubator"
```

---

## Phase 3: Pro Milestone Tracking

### Task 5: Milestone tracking system

**Files:**
- Create: `artifacts/api-server/src/lib/funnel/milestones.ts`

**What:** Track Pro user progress toward Max upgrade (revenue, user count, features shipped).

- [ ] **Step 1: Write milestone tracking logic**

Create `artifacts/api-server/src/lib/funnel/milestones.ts`:

```typescript
import { db } from "@/db";
import { proMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface MilestoneData {
  currentMrr: number; // In cents
  currentUserCount: number;
  featureShipped: boolean;
}

export async function updateMilestoneProgress(
  userId: string,
  data: Partial<MilestoneData>
): Promise<void> {
  const existing = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  if (!existing || existing.length === 0) {
    // Create new milestone tracking
    await db.insert(proMilestones).values({
      id: `milestones-${userId}`,
      userId,
      currentMrr: data.currentMrr || 0,
      currentUserCount: data.currentUserCount || 0,
      featureShipped: data.featureShipped || false,
      milestonesHit: 0,
    });
    return;
  }

  // Update existing
  const milestone = existing[0];
  let updatedMilestonesHit = milestone.milestonesHit;

  // Check if new milestones were hit
  if (data.currentMrr && data.currentMrr >= milestone.mrrTarget && milestone.currentMrr < milestone.mrrTarget) {
    updatedMilestonesHit += 1; // Revenue milestone just hit
  }

  if (
    data.currentUserCount &&
    data.currentUserCount >= milestone.userCountTarget &&
    milestone.currentUserCount < milestone.userCountTarget
  ) {
    updatedMilestonesHit += 1; // User count milestone just hit
  }

  if (data.featureShipped && !milestone.featureShipped) {
    updatedMilestonesHit += 1; // Feature milestone just hit
  }

  // Update
  await db
    .update(proMilestones)
    .set({
      currentMrr: data.currentMrr ?? milestone.currentMrr,
      currentUserCount: data.currentUserCount ?? milestone.currentUserCount,
      featureShipped: data.featureShipped ?? milestone.featureShipped,
      milestonesHit: updatedMilestonesHit,
      maxUpgradeEligibleAt:
        updatedMilestonesHit >= 2 && !milestone.maxUpgradeEligibleAt
          ? new Date()
          : milestone.maxUpgradeEligibleAt,
      updatedAt: new Date(),
    })
    .where(eq(proMilestones.userId, userId));
}

export async function getMilestoneProgress(userId: string) {
  const milestone = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  if (!milestone || milestone.length === 0) {
    return null;
  }

  const m = milestone[0];
  return {
    mrrProgress: {
      current: m.currentMrr,
      target: m.mrrTarget,
      percentComplete: Math.min(100, Math.round((m.currentMrr / m.mrrTarget) * 100)),
      hit: m.currentMrr >= m.mrrTarget,
    },
    userCountProgress: {
      current: m.currentUserCount,
      target: m.userCountTarget,
      percentComplete: Math.min(100, Math.round((m.currentUserCount / m.userCountTarget) * 100)),
      hit: m.currentUserCount >= m.userCountTarget,
    },
    featureProgress: {
      shipped: m.featureShipped,
    },
    milestonesHit: m.milestonesHit,
    maxUpgradeEligible: m.milestonesHit >= 2,
    maxUpgradeEligibleAt: m.maxUpgradeEligibleAt,
  };
}
```

- [ ] **Step 2: Write unit tests**

Create `artifacts/api-server/src/lib/funnel/__tests__/milestones.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateMilestoneProgress, getMilestoneProgress } from "../milestones";
import { db } from "@/db";
import { users, proMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Milestone tracking", () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = `test-user-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      tier: "pro",
    });
  });

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(proMilestones).where(eq(proMilestones.userId, testUserId));
  });

  it("should create milestone tracking on first update", async () => {
    await updateMilestoneProgress(testUserId, { currentMrr: 50000 }); // $500 in cents

    const progress = await getMilestoneProgress(testUserId);

    expect(progress).toBeDefined();
    expect(progress?.mrrProgress.current).toBe(50000);
  });

  it("should increment milestonesHit when MRR target hit", async () => {
    await updateMilestoneProgress(testUserId, { currentMrr: 0 });
    const beforeProgress = await getMilestoneProgress(testUserId);
    expect(beforeProgress?.milestonesHit).toBe(0);

    // Hit the MRR target (default 500 = 50000 cents)
    await updateMilestoneProgress(testUserId, { currentMrr: 50000 });
    const afterProgress = await getMilestoneProgress(testUserId);

    expect(afterProgress?.milestonesHit).toBe(1);
    expect(afterProgress?.mrrProgress.hit).toBe(true);
  });

  it("should mark as Max upgrade eligible when 2 milestones hit", async () => {
    // Hit revenue and user count milestones
    await updateMilestoneProgress(testUserId, {
      currentMrr: 50000,
      currentUserCount: 500,
    });

    const progress = await getMilestoneProgress(testUserId);

    expect(progress?.milestonesHit).toBe(2);
    expect(progress?.maxUpgradeEligible).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd artifacts/api-server
pnpm test --run lib/funnel/__tests__/milestones.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/lib/funnel/milestones.ts artifacts/api-server/src/lib/funnel/__tests__/milestones.test.ts
git commit -m "feat: add Pro milestone tracking (MRR, user count, features shipped)"
```

---

### Task 6: Milestone update endpoint

**Files:**
- Modify: `artifacts/api-server/src/routes/funnel.ts`

**What:** Add endpoint for backend to report milestone progress (called when scorecard updates, analytics report, etc).

- [ ] **Step 1: Add milestone update endpoint**

Modify `artifacts/api-server/src/routes/funnel.ts`:

```typescript
import { updateMilestoneProgress, getMilestoneProgress } from "@/lib/funnel/milestones";
import { checkAndNotifyProToMaxEligibility } from "@/lib/funnel/eligibility";

// Update milestone progress for Pro user
router.post("/api/funnel/milestones/update", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentMrr, currentUserCount, featureShipped } = req.body;

    // Validate input
    if (
      (currentMrr !== undefined && typeof currentMrr !== "number") ||
      (currentUserCount !== undefined && typeof currentUserCount !== "number") ||
      (featureShipped !== undefined && typeof featureShipped !== "boolean")
    ) {
      return res.status(400).json({ error: "Invalid input types" });
    }

    // Update milestones
    await updateMilestoneProgress(userId, {
      currentMrr,
      currentUserCount,
      featureShipped,
    });

    // Check if they just became eligible for Max and notify
    await checkAndNotifyProToMaxEligibility(userId);

    // Get updated progress
    const progress = await getMilestoneProgress(userId);

    return res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Milestone update error:", error);
    return res.status(500).json({ error: "Failed to update milestone progress" });
  }
});

// Get current milestone progress
router.get("/api/funnel/milestones/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const progress = await getMilestoneProgress(userId);

    if (!progress) {
      return res.status(404).json({ error: "No milestone tracking found" });
    }

    return res.json(progress);
  } catch (error) {
    console.error("Milestone progress error:", error);
    return res.status(500).json({ error: "Failed to fetch milestone progress" });
  }
});
```

- [ ] **Step 2: Test endpoint**

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentMrr": 50000, "currentUserCount": 250}' \
  http://localhost:3000/api/funnel/milestones/update
```

Expected: `{ success: true, progress: { ... } }`

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/funnel.ts
git commit -m "feat: add milestone update and progress endpoints"
```

---

## Phase 4: Advisor Matching & Personalization

### Task 7: Advisor configuration and matching

**Files:**
- Create: `artifacts/api-server/src/config/advisors.ts`
- Create: `artifacts/api-server/src/lib/funnel/advisors.ts`

**What:** Define advisor roster and logic to match founders to advisors by stage + market.

- [ ] **Step 1: Create advisor config**

Create `artifacts/api-server/src/config/advisors.ts`:

```typescript
export interface Advisor {
  id: string;
  name: string;
  expertise: string[]; // ["B2B SaaS", "Series A", "product-market-fit"]
  experience: string; // "Founded and sold to Notion" | etc
  photo?: string;
  bio: string;
  availableTiers: ("pro" | "max" | "incubator")[]; // Which tiers can access
}

export const advisors: Advisor[] = [
  {
    id: "advisor-001",
    name: "Sarah Chen",
    expertise: ["B2B SaaS", "Seed", "Product-market fit"],
    experience: "Founder of WorkFlow (acquired by Linear). Raised $5M seed.",
    bio: "Helps seed-stage SaaS founders find product-market fit without burning runway.",
    availableTiers: ["max", "incubator"],
  },
  {
    id: "advisor-002",
    name: "James Rodriguez",
    expertise: ["B2B SaaS", "Series A", "Scaling growth"],
    experience: "VP Growth at Vercel. Grew team from 10 to 200. Exited previous company.",
    bio: "Focuses on founders who've found product-market fit and need to scale repeatable growth.",
    availableTiers: ["max", "incubator"],
  },
  {
    id: "advisor-003",
    name: "Priya Patel",
    expertise: ["Marketplace", "Series B", "Unit economics"],
    experience: "CEO of TechMarketplace (IPO). Managed $500M+ GMV.",
    bio: "Works with marketplace founders on unit economics and unit expansion.",
    availableTiers: ["incubator"],
  },
  {
    id: "advisor-004",
    name: "Michael O'Connor",
    expertise: ["Developer tools", "Series A", "Community building"],
    experience: "Built open-source community that scaled to 100K users. Raised Series A.",
    bio: "Advises dev tools founders on community-driven growth.",
    availableTiers: ["max", "incubator"],
  },
  // TBD: Add more advisors
];

export function getAdvisorsByStageAndMarket(
  stage: string, // "seed" | "series-a" | "series-b"
  market: string // "b2b-saas" | "marketplace" | "developer-tools" | "consumer"
): Advisor[] {
  const stageMap: Record<string, string[]> = {
    seed: ["Seed", "Product-market fit"],
    "series-a": ["Series A", "Scaling growth"],
    "series-b": ["Series B", "Unit economics"],
  };

  const marketMap: Record<string, string[]> = {
    "b2b-saas": ["B2B SaaS"],
    marketplace: ["Marketplace"],
    "developer-tools": ["Developer tools"],
    consumer: ["Consumer"],
  };

  const stageExpertises = stageMap[stage] || [];
  const marketExpertises = marketMap[market] || [];

  return advisors.filter((advisor) => {
    const hasStageExpertise = stageExpertises.some((e) =>
      advisor.expertise.some((ae) => ae.toLowerCase().includes(e.toLowerCase()))
    );
    const hasMarketExpertise = marketExpertises.some((e) =>
      advisor.expertise.some((ae) => ae.toLowerCase().includes(e.toLowerCase()))
    );

    return (hasStageExpertise || hasMarketExpertise) && advisor.availableTiers.includes("max");
  });
}
```

- [ ] **Step 2: Create advisor matching logic**

Create `artifacts/api-server/src/lib/funnel/advisors.ts`:

```typescript
import { db } from "@/db";
import { advisorAssignments, founderSignals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdvisorsByStageAndMarket, advisors } from "@/config/advisors";

export async function assignAdvisorForMaxTier(
  userId: string,
  stage: string,
  market: string
): Promise<{ advisorId: string; advisorName: string }> {
  // Check if already assigned
  const existing = await db
    .select()
    .from(advisorAssignments)
    .where(eq(advisorAssignments.userId, userId))
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      advisorId: existing[0].advisorId,
      advisorName: existing[0].advisorName,
    };
  }

  // Get matching advisors
  const matchingAdvisors = getAdvisorsByStageAndMarket(stage, market);

  if (matchingAdvisors.length === 0) {
    // Fallback: assign first Max-tier advisor
    const fallbackAdvisor = advisors.find((a) => a.availableTiers.includes("max"));
    if (!fallbackAdvisor) {
      throw new Error("No advisors available for Max tier");
    }

    const assignment = await db
      .insert(advisorAssignments)
      .values({
        id: `assignment-${userId}`,
        userId,
        advisorId: fallbackAdvisor.id,
        advisorName: fallbackAdvisor.name,
        nextQuarterlyCheckIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      })
      .returning();

    return {
      advisorId: assignment[0].advisorId,
      advisorName: assignment[0].advisorName,
    };
  }

  // Assign the best match (first in list)
  const selectedAdvisor = matchingAdvisors[0];
  const assignment = await db
    .insert(advisorAssignments)
    .values({
      id: `assignment-${userId}`,
      userId,
      advisorId: selectedAdvisor.id,
      advisorName: selectedAdvisor.name,
      nextQuarterlyCheckIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    })
    .returning();

  return {
    advisorId: assignment[0].advisorId,
    advisorName: assignment[0].advisorName,
  };
}

export async function getAssignedAdvisor(userId: string) {
  const assignment = await db
    .select()
    .from(advisorAssignments)
    .where(eq(advisorAssignments.userId, userId))
    .limit(1);

  if (!assignment || assignment.length === 0) {
    return null;
  }

  const assigned = assignment[0];
  const advisorData = advisors.find((a) => a.id === assigned.advisorId);

  return {
    ...assigned,
    advisorData,
  };
}
```

- [ ] **Step 3: Test matching logic**

Create `artifacts/api-server/src/lib/funnel/__tests__/advisors.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getAdvisorsByStageAndMarket } from "@/config/advisors";

describe("Advisor matching", () => {
  it("should return B2B SaaS advisors for seed-stage B2B SaaS founders", () => {
    const advisors = getAdvisorsByStageAndMarket("seed", "b2b-saas");

    expect(advisors.length).toBeGreaterThan(0);
    expect(advisors[0].expertise).toContain("Seed");
  });

  it("should return marketplace advisors for Series B marketplace founders", () => {
    const advisors = getAdvisorsByStageAndMarket("series-b", "marketplace");

    expect(advisors.length).toBeGreaterThan(0);
    expect(advisors.some((a) => a.expertise.includes("Marketplace"))).toBe(true);
  });

  it("should include advisors with both stage and market expertise", () => {
    const advisors = getAdvisorsByStageAndMarket("series-a", "b2b-saas");

    expect(advisors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd artifacts/api-server
pnpm test --run lib/funnel/__tests__/advisors.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/config/advisors.ts artifacts/api-server/src/lib/funnel/advisors.ts artifacts/api-server/src/lib/funnel/__tests__/advisors.test.ts
git commit -m "feat: add advisor roster and matching logic by stage and market"
```

---

## Phase 5: Hyper-Personalization Framework

### Task 8: Personalization engine

**Files:**
- Create: `artifacts/api-server/src/lib/funnel/personalization.ts`
- Create: `artifacts/api-server/src/config/playbook-segments.ts`

**What:** Framework to personalize recommendations based on founder's traction, stage, market, and competitive landscape.

- [ ] **Step 1: Create playbook segments**

Create `artifacts/api-server/src/config/playbook-segments.ts`:

```typescript
export interface PlaybookSegment {
  id: string;
  title: string;
  stage: string; // "seed" | "series-a" | "series-b"
  market: string; // "b2b-saas" | "marketplace" | "developer-tools"
  content: string; // Markdown
  tactics: string[]; // Actionable steps
  timingDays: number; // How many days into that stage typically
}

export const playbookSegments: PlaybookSegment[] = [
  {
    id: "segment-seed-saas-pmf",
    title: "Finding Product-Market Fit (Seed, B2B SaaS)",
    stage: "seed",
    market: "b2b-saas",
    content: `# Finding Product-Market Fit

You're at the stage where you're still searching for what customers actually want. Most founders waste 18 months here by building without talking to users.

## The 3-week test
- Talk to 10 customers this week
- Ask: "What problem are you solving today without our product?"
- If they're not struggling, wrong customer segment

## Avoid these traps
- Building without feedback loops (death spiral)
- Solving nice-to-have vs must-have
- Wrong buyer (technical founder != economic buyer)`,
    tactics: [
      "Schedule 10 customer calls this week",
      "Build a 2-sentence positioning statement",
      "Create a simple landing page to test messaging",
      "Track retention after first login (target: 30% month-over-month)",
    ],
    timingDays: 90, // Typical seed stage
  },
  {
    id: "segment-series-a-saas-growth",
    title: "Scaling Repeatable Growth (Series A, B2B SaaS)",
    stage: "series-a",
    market: "b2b-saas",
    content: `# Scaling Repeatable Growth

You've found product-market fit ($500+ MRR, 30%+ month-over-month retention). Now the job is to find a repeatable way to acquire customers at a reasonable CAC.

## The unit economics lens
- CAC: How much it costs to acquire a customer
- LTV: How much they'll pay over their lifetime
- LTV:CAC ratio should be 3:1 or better
- If not, fix the product (lower churn) not the sales (more CAC)

## Sales vs product growth
- At your stage, product-driven growth (viral, integration) beats sales
- If you're hiring a VP Sales before $1M ARR, you're scaling the wrong thing`,
    tactics: [
      "Calculate your actual LTV:CAC ratio",
      "Identify top 3 customer acquisition channels",
      "Build your first integrations (API partners)",
      "Hire a head of marketing (not VP Sales)",
    ],
    timingDays: 180,
  },
  // TBD: Add more segments by stage + market
];

export function getPlaybookForStageAndMarket(stage: string, market: string): PlaybookSegment[] {
  return playbookSegments.filter((s) => s.stage === stage && s.market === market);
}
```

- [ ] **Step 2: Create personalization engine**

Create `artifacts/api-server/src/lib/funnel/personalization.ts`:

```typescript
import { db } from "@/db";
import { founderSignals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPlaybookForStageAndMarket } from "@/config/playbook-segments";

export interface PersonalizedContent {
  weeklyInsight: string; // Single actionable insight for this week
  playbookSegments: any[]; // Playbook content tailored to their stage/market
  advisorRecommendation: string; // Specific advice from advisor
  churnRiskFactors: string[]; // Why they might churn (for retention team)
}

export async function generatePersonalizedContent(
  userId: string,
  currentMrr: number,
  currentUserCount: number,
  churnRate?: number
): Promise<PersonalizedContent> {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals) {
    throw new Error("No founder signals found");
  }

  const signal = signals[0];

  // Determine stage based on MRR
  let stage = "seed";
  if (currentMrr >= 50000) {
    // $500+ MRR
    stage = "series-a";
  }
  if (currentMrr >= 500000) {
    // $5000+ MRR
    stage = "series-b";
  }

  // Get market (assume for now—TBD: allow user to set)
  const market = "b2b-saas";

  // Get personalized playbook
  const playbookSegments = getPlaybookForStageAndMarket(stage, market);

  // Generate weekly insight based on stage and MRR
  let weeklyInsight = "";
  if (stage === "seed") {
    weeklyInsight =
      "At your stage, every hour talking to customers beats 10 hours building features. Schedule 5 customer calls this week.";
  } else if (stage === "series-a") {
    weeklyInsight = `Your CAC is $${Math.round(currentMrr / 100)}. If it's >30% of LTV, you're burning cash on acquisition. Fix the product retention first.`;
  } else if (stage === "series-b") {
    weeklyInsight = `You're at $${Math.round(currentMrr / 100)}/MRR. Your next milestone is efficiency (CAC payback <12mo). Which channel has the best payback?`;
  }

  // Churn risk assessment
  const churnRiskFactors: string[] = [];
  if (signal.playbookPagesViewedLast30Days === 0) {
    churnRiskFactors.push("No playbook engagement in 30 days");
  }
  if (signal.scorecardRunsLast30Days === 0) {
    churnRiskFactors.push("Haven't run scorecard in 30 days");
  }
  if (churnRate && churnRate > 0.05) {
    churnRiskFactors.push("Monthly churn >5% suggests product issues");
  }

  return {
    weeklyInsight,
    playbookSegments,
    advisorRecommendation: `Based on your $${Math.round(currentMrr / 100)}/MRR and ${currentUserCount} users, focus on ${stage === "seed" ? "product-market fit validation" : stage === "series-a" ? "repeatable growth channels" : "unit economics optimization"}.`,
    churnRiskFactors,
  };
}
```

- [ ] **Step 3: Test personalization**

Create `artifacts/api-server/src/lib/funnel/__tests__/personalization.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generatePersonalizedContent } from "../personalization";
import { db } from "@/db";
import { users, founderSignals } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Personalization", () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = `test-user-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      tier: "pro",
    });
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      scorecardRunsLast30Days: 2,
      playbookPagesViewedLast30Days: 5,
    });
  });

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(founderSignals).where(eq(founderSignals.userId, testUserId));
  });

  it("should generate personalized content for seed-stage founder", async () => {
    const content = await generatePersonalizedContent(testUserId, 5000, 100); // $50 MRR, 100 users

    expect(content.weeklyInsight).toContain("customer calls");
    expect(content.churnRiskFactors).toBeDefined();
  });

  it("should identify churn risks", async () => {
    // Create signals with no engagement
    await db
      .update(founderSignals)
      .set({
        scorecardRunsLast30Days: 0,
        playbookPagesViewedLast30Days: 0,
      })
      .where(eq(founderSignals.userId, testUserId));

    const content = await generatePersonalizedContent(testUserId, 5000, 100);

    expect(content.churnRiskFactors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd artifacts/api-server
pnpm test --run lib/funnel/__tests__/personalization.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/config/playbook-segments.ts artifacts/api-server/src/lib/funnel/personalization.ts artifacts/api-server/src/lib/funnel/__tests__/personalization.test.ts
git commit -m "feat: add hyper-personalization framework and playbook segments"
```

---

## Phase 6: Frontend UI Components

### Task 9: Upgrade CTA components

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/UpgradePrompt.tsx`
- Create: `artifacts/specflow-newsletter/src/components/MilestoneProgress.tsx`

**What:** Visual components to show upgrade opportunities and milestone progress.

- [ ] **Step 1: Free→Pro upgrade prompt component**

Create `artifacts/specflow-newsletter/src/components/UpgradePrompt.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface UpgradePromptProps {
  fromTier: 'free' | 'pro' | 'max';
  toTier: 'pro' | 'max' | 'incubator';
  reason: string; // Why they qualify
  onUpgradeClick: () => void;
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  fromTier,
  toTier,
  reason,
  onUpgradeClick,
  onDismiss,
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const offers: Record<string, Record<string, any>> = {
    free: {
      pro: {
        price: '$300/year',
        title: 'Ready to fix this?',
        description: 'Playbook + market intel + founder calls unlock here.',
        cta: 'Unlock Pro',
        color: 'bg-blue-500/10 border-blue-200',
        icon: '🗺️',
      },
    },
    pro: {
      max: {
        price: '$5,000/year',
        title: "You've proven it works. Now accelerate.",
        description:
          'Direct 1:1 founder calls + quarterly strategy deep dives unlock here.',
        cta: 'Upgrade to Max',
        color: 'bg-purple-500/10 border-purple-200',
        icon: '🚀',
      },
    },
    max: {
      incubator: {
        price: 'Invitation-only',
        title: "You're in the top 5%. We're backing you.",
        description:
          'Capital introductions, partnerships, founder peer group, potential equity unlock here.',
        cta: 'View Incubator',
        color: 'bg-gold-500/10 border-gold-200',
        icon: '✨',
      },
    },
  };

  const offer = offers[fromTier]?.[toTier];

  if (!offer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded-lg p-4 ${offer.color}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{offer.icon}</span>
            <h3 className="font-semibold text-foreground">{offer.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{reason}</p>
          <p className="text-sm text-foreground mb-3">{offer.description}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpgradeClick}
              className="bg-foreground text-background px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition flex items-center gap-1"
            >
              {offer.cta}
              <ChevronRight className="w-4 h-4" />
            </button>
            {onDismiss && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss();
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{offer.price}</p>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Milestone progress component**

Create `artifacts/specflow-newsletter/src/components/MilestoneProgress.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle } from 'lucide-react';

interface MilestoneProgressProps {
  mrrProgress?: { current: number; target: number; hit: boolean };
  userCountProgress?: { current: number; target: number; hit: boolean };
  featureProgress?: { shipped: boolean };
  milestonesHit: number;
  maxUpgradeEligible: boolean;
  onMaxClickRedirect?: () => void;
}

export default function MilestoneProgress({
  mrrProgress,
  userCountProgress,
  featureProgress,
  milestonesHit,
  maxUpgradeEligible,
  onMaxClickRedirect,
}: MilestoneProgressProps) {
  const [animatedMilestones, setAnimatedMilestones] = useState(0);

  useEffect(() => {
    // Animate milestone counter
    const interval = setInterval(() => {
      setAnimatedMilestones((prev) => (prev < milestonesHit ? prev + 1 : prev));
    }, 500);

    return () => clearInterval(interval);
  }, [milestonesHit]);

  const getProgressColor = (hit: boolean) => (hit ? 'bg-green-500' : 'bg-gray-300');
  const getProgressPercent = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-foreground mb-4">Progress to Max Tier</h3>
        <p className="text-sm text-muted-foreground mb-4">Hit 2 of 3 milestones to upgrade</p>

        {/* Milestone cards */}
        <div className="space-y-3">
          {mrrProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded border ${mrrProgress.hit ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                {mrrProgress.hit && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground">${Math.round(mrrProgress.current / 100)}/month</span>
                <span className="text-muted-foreground">Target: ${Math.round(mrrProgress.target / 100)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${getProgressColor(mrrProgress.hit)}`}
                  style={{ width: `${getProgressPercent(mrrProgress.current, mrrProgress.target)}%` }}
                />
              </div>
            </motion.div>
          )}

          {userCountProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-3 rounded border ${userCountProgress.hit ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                {userCountProgress.hit && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground">{userCountProgress.current} users</span>
                <span className="text-muted-foreground">Target: {userCountProgress.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${getProgressColor(userCountProgress.hit)}`}
                  style={{
                    width: `${getProgressPercent(userCountProgress.current, userCountProgress.target)}%`,
                  }}
                />
              </div>
            </motion.div>
          )}

          {featureProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-3 rounded border ${featureProgress.shipped ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Shipped Feature</span>
                </div>
                {featureProgress.shipped && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
            </motion.div>
          )}
        </div>

        {/* Milestone counter */}
        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Milestones hit</span>
            <div className="text-2xl font-bold text-blue-600">{animatedMilestones}/3</div>
          </div>
        </div>

        {/* CTA if eligible */}
        {maxUpgradeEligible && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onMaxClickRedirect}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
          >
            You're Eligible! Upgrade to Max
          </motion.button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test components**

Create `artifacts/specflow-newsletter/src/components/__tests__/UpgradePrompt.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UpgradePrompt from '../UpgradePrompt';

describe('UpgradePrompt', () => {
  it('renders Free→Pro upgrade prompt', () => {
    const mockClick = vi.fn();
    render(
      <UpgradePrompt
        fromTier="free"
        toTier="pro"
        reason="You've used the scorecard 2+ times"
        onUpgradeClick={mockClick}
      />
    );

    expect(screen.getByText('Ready to fix this?')).toBeInTheDocument();
    expect(screen.getByText('$300/year')).toBeInTheDocument();
  });

  it('renders Pro→Max upgrade prompt', () => {
    const mockClick = vi.fn();
    render(
      <UpgradePrompt
        fromTier="pro"
        toTier="max"
        reason="You hit 2 milestones"
        onUpgradeClick={mockClick}
      />
    );

    expect(screen.getByText("You've proven it works. Now accelerate.")).toBeInTheDocument();
    expect(screen.getByText('$5,000/year')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd artifacts/specflow-newsletter
pnpm test --run src/components/__tests__/UpgradePrompt.test.tsx
```

Expected: Tests pass.

- [ ] **Step 5: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/UpgradePrompt.tsx artifacts/specflow-newsletter/src/components/MilestoneProgress.tsx artifacts/specflow-newsletter/src/components/__tests__/UpgradePrompt.test.ts
git commit -m "feat: add upgrade and milestone progress UI components"
```

---

## Phase 7: Scout Identification & Incubator

### Task 10: Scout identification logic

**Files:**
- Create: `artifacts/api-server/src/lib/funnel/scouts.ts`

**What:** Identify Max tier users who qualify for Incubator based on growth, credibility, market opportunity.

- [ ] **Step 1: Write scout identification logic**

Create `artifacts/api-server/src/lib/funnel/scouts.ts`:

```typescript
import { db } from "@/db";
import { founderSignals, churnRiskScores } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface ScoutScore {
  totalScore: number; // 0-100
  growthTrajectory: number; // 0-30
  credibility: number; // 0-35
  marketOpportunity: number; // 0-35
  isInvitable: boolean; // >= 70 score
  reasons: string[];
}

export async function calculateScoutScore(userId: string): Promise<ScoutScore> {
  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals || signals.length === 0) {
    return {
      totalScore: 0,
      growthTrajectory: 0,
      credibility: 0,
      marketOpportunity: 0,
      isInvitable: false,
      reasons: ["No founder signals found"],
    };
  }

  const signal = signals[0];
  const reasons: string[] = [];

  // Growth Trajectory (0-30 points)
  let growthTrajectory = 0;
  if (signal.consecutiveGrowthQuarters >= 4) {
    growthTrajectory = 30;
    reasons.push("4+ consecutive quarters of growth");
  } else if (signal.consecutiveGrowthQuarters >= 2) {
    growthTrajectory = 15;
    reasons.push("2+ quarters of growth");
  } else {
    growthTrajectory = 0;
  }

  // Credibility (0-35 points)
  let credibility = 0;
  if (signal.previousExits > 0) {
    credibility += 20;
    reasons.push(`${signal.previousExits} previous exit(s)`);
  }
  if (signal.advisorCallsCompleted >= 2) {
    credibility += 10;
    reasons.push("Actively working with advisors");
  }
  if (signal.foundedBefore) {
    credibility += 5;
    reasons.push("Founder with prior experience");
  }

  // Market Opportunity (0-35 points)
  let marketOpportunity = 0;
  if (signal.estimatedTam === "$1B+") {
    marketOpportunity += 20;
    reasons.push("$1B+ TAM");
  }
  if (signal.defensibility === "high") {
    marketOpportunity += 15;
    reasons.push("High defensibility (moat/network effects)");
  }

  const totalScore = growthTrajectory + credibility + marketOpportunity;

  return {
    totalScore,
    growthTrajectory,
    credibility,
    marketOpportunity,
    isInvitable: totalScore >= 70,
    reasons,
  };
}

export async function identifyScoutCandidates(): Promise<
  Array<{ userId: string; score: ScoutScore }>
> {
  // Get all Max tier users with high engagement
  const candidates = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.tier, "max"));

  const scoredCandidates = await Promise.all(
    candidates.map(async (candidate) => ({
      userId: candidate.userId,
      score: await calculateScoutScore(candidate.userId),
    }))
  );

  // Return candidates sorted by score, filter invitable
  return scoredCandidates
    .filter((c) => c.score.isInvitable)
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

export async function updateScoutScore(userId: string): Promise<number> {
  const score = await calculateScoutScore(userId);

  await db
    .update(founderSignals)
    .set({
      scoutScore: score.totalScore.toString(),
    })
    .where(eq(founderSignals.userId, userId));

  return score.totalScore;
}
```

- [ ] **Step 2: Write unit tests**

Create `artifacts/api-server/src/lib/funnel/__tests__/scouts.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { calculateScoutScore } from "../scouts";
import { db } from "@/db";
import { users, founderSignals } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Scout identification", () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = `test-user-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      tier: "max",
    });
  });

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(founderSignals).where(eq(founderSignals.userId, testUserId));
  });

  it("should score founder with growth + credibility + market opportunity as invitable", async () => {
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      consecutiveGrowthQuarters: 2,
      previousExits: 1,
      estimatedTam: "$1B+",
      defensibility: "high",
      advisorCallsCompleted: 2,
      foundedBefore: true,
    });

    const score = await calculateScoutScore(testUserId);

    expect(score.totalScore).toBeGreaterThanOrEqual(70);
    expect(score.isInvitable).toBe(true);
  });

  it("should not mark as invitable if score < 70", async () => {
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      consecutiveGrowthQuarters: 0,
      previousExits: 0,
      estimatedTam: "$100M",
      defensibility: "medium",
    });

    const score = await calculateScoutScore(testUserId);

    expect(score.totalScore).toBeLessThan(70);
    expect(score.isInvitable).toBe(false);
  });

  it("should include reasons for score", async () => {
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      consecutiveGrowthQuarters: 2,
      previousExits: 1,
      estimatedTam: "$1B+",
    });

    const score = await calculateScoutScore(testUserId);

    expect(score.reasons.length).toBeGreaterThan(0);
    expect(score.reasons.some((r) => r.includes("growth"))).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd artifacts/api-server
pnpm test --run lib/funnel/__tests__/scouts.test.ts
```

Expected: Tests pass.

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/lib/funnel/scouts.ts artifacts/api-server/src/lib/funnel/__tests__/scouts.test.ts
git commit -m "feat: add scout identification and scoring logic for Incubator tier"
```

---

## Phase 8: Integration & Testing

### Task 11: Integration tests for full funnel

**Files:**
- Create: `artifacts/api-server/src/__tests__/funnel.integration.test.ts`

**What:** End-to-end test of full funnel: Free user → eligible for Pro → qualifies for Max → identifies for Incubator.

- [ ] **Step 1: Write integration test**

Create `artifacts/api-server/src/__tests__/funnel.integration.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/db";
import { users, founderSignals, proMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkFreeToProEligibility, checkProToMaxEligibility, checkMaxToIncubatorEligibility } from "@/lib/funnel/eligibility";
import { updateMilestoneProgress } from "@/lib/funnel/milestones";
import { calculateScoutScore } from "@/lib/funnel/scouts";

describe("Funnel Integration", () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = `integration-test-${Date.now()}`;
    // Create Free tier user
    await db.insert(users).values({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      tier: "free",
    });
    // Create initial signals
    await db.insert(founderSignals).values({
      id: `signals-${testUserId}`,
      userId: testUserId,
      scorecardRunsLast30Days: 0,
      playbookPagesViewedLast30Days: 0,
    });
  });

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(founderSignals).where(eq(founderSignals.userId, testUserId));
    await db.delete(proMilestones).where(eq(proMilestones.userId, testUserId));
  });

  it("should progress user from Free → Pro → Max → Incubator", async () => {
    // === Phase 1: Free user checks scorecard 2x ===
    await db
      .update(founderSignals)
      .set({ scorecardRunsLast30Days: 2 })
      .where(eq(founderSignals.userId, testUserId));

    const freeToProEligibility = await checkFreeToProEligibility(testUserId);
    expect(freeToProEligibility.isEligible).toBe(true);

    // === Phase 2: User upgrades to Pro ===
    await db.update(users).set({ tier: "pro" }).where(eq(users.id, testUserId));

    // Create milestone tracking
    await updateMilestoneProgress(testUserId, {
      currentMrr: 0,
      currentUserCount: 0,
    });

    const proToMaxEligibility = await checkProToMaxEligibility(testUserId);
    expect(proToMaxEligibility.isEligible).toBe(false); // No milestones yet

    // === Phase 3: Pro user hits 2 milestones ===
    await updateMilestoneProgress(testUserId, {
      currentMrr: 50000, // $500 MRR
      currentUserCount: 500, // 500 users
    });

    const proToMaxEligibilityAfter = await checkProToMaxEligibility(testUserId);
    expect(proToMaxEligibilityAfter.isEligible).toBe(true);

    // === Phase 4: User upgrades to Max ===
    await db.update(users).set({ tier: "max" }).where(eq(users.id, testUserId));

    // Update signals for scout identification
    await db
      .update(founderSignals)
      .set({
        consecutiveGrowthQuarters: 2,
        previousExits: 1,
        estimatedTam: "$1B+",
        defensibility: "high",
        advisorCallsCompleted: 2,
      })
      .where(eq(founderSignals.userId, testUserId));

    const maxToIncubatorEligibility = await checkMaxToIncubatorEligibility(testUserId);
    expect(maxToIncubatorEligibility.isEligible).toBe(true);

    // === Phase 5: Scout score confirms Incubator eligibility ===
    const scoutScore = await calculateScoutScore(testUserId);
    expect(scoutScore.isInvitable).toBe(true);
  });
});
```

- [ ] **Step 2: Run integration tests**

```bash
cd artifacts/api-server
pnpm test --run __tests__/funnel.integration.test.ts
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/__tests__/funnel.integration.test.ts
git commit -m "test: add end-to-end funnel integration tests"
```

---

### Task 12: Build and verify

**Files:**
- None (verification only)

**What:** Build the app to ensure no TypeScript or runtime errors.

- [ ] **Step 1: Build API server**

```bash
cd artifacts/api-server
pnpm build
```

Expected: Build succeeds. No errors.

- [ ] **Step 2: Build frontend**

```bash
cd artifacts/specflow-newsletter
pnpm build
```

Expected: Build succeeds. No errors.

- [ ] **Step 3: Type check**

```bash
cd artifacts
pnpm typecheck
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: verify funnel implementation builds successfully"
```

---

## Summary

**What was built:**
1. Database schema for milestone tracking, advisor assignments, upgrade offers, founder signals, and churn risk scoring
2. Upgrade eligibility logic (Free→Pro, Pro→Max, Max→Incubator)
3. API endpoints for upgrade checks, offers, and milestone tracking
4. Email sequences for upgrade notifications
5. Milestone progress tracking system
6. Advisor roster and matching logic by stage + market
7. Hyper-personalization framework (playbook segments, content generation)
8. Scout identification and scoring for Incubator tier
9. Frontend UI components for upgrade CTAs and milestone progress
10. Comprehensive unit and integration tests
11. Full system verified and ready for deployment

**What's not defined yet (TBD from spec):**
- Incubator pricing structure (equity % vs. flat fee)
- Advisor sourcing and incentive structure
- Full playbook content segmentation (templates for all stage/market combinations)
- Founder call scheduling and recording system
- Advanced AI context engine features (personalization beyond basics)
- Refund/cancellation policy details

**Key success metrics to track:**
- Free→Pro conversion rate (target: 10-15% within 6 months)
- Pro→Max conversion rate (target: 20-30% of those hitting milestones)
- Pro monthly churn rate (target: ~5%)
- Max monthly churn rate (target: ~2-3%)
- Incubator invitation rate (target: 3-5% of Max tier)

**Next steps for deployment:**
1. Set up Stripe/Razorpay integration for Pro and Max tier billing
2. Configure Resend email provider and send test upgrade emails
3. Populate advisor profiles with real founders
4. Build out full playbook content for key stage/market combinations
5. Set up monitoring dashboard for conversion rates and churn metrics
6. Create founder onboarding flow to capture initial stage + market signals
7. Deploy to staging environment and run end-to-end tests with real Clerk auth
