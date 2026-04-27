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
  playbookPagesViewedLast30Days: integer("playbook_pages_viewed_last_30_days").notNull().default(0),
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
