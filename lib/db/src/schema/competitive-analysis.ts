import { pgTable, text, serial, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";

export const competitorAnalysisTable = pgTable("competitor_analysis", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  reportId: numeric("report_id"),
  competitorName: text("competitor_name").notNull(),
  productName: text("product_name").notNull(),
  website: text("website"),
  fundingStage: text("funding_stage"),
  estimatedFunding: numeric("estimated_funding"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  marketPosition: text("market_position"),
  pricingStrategy: text("pricing_strategy"),
  targetAudience: text("target_audience"),
  productFeatures: text("product_features"),
  technicalStack: text("technical_stack"),
  vulnerabilities: jsonb("vulnerabilities").$type<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    opportunity: string;
  }[]>(),
  overallVulnerabilityScore: numeric("overall_vulnerability_score"),
  marketShare: numeric("market_share"),
  growthRate: numeric("growth_rate"),
  customerSentiment: text("customer_sentiment"),
  analysisNotes: text("analysis_notes"),
  analyzedAt: timestamp("analyzed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const vulnerabilityOpportunitiesTable = pgTable("vulnerability_opportunities", {
  id: serial("id").primaryKey(),
  competitorAnalysisId: numeric("competitor_analysis_id").notNull(),
  userId: text("user_id").notNull(),
  vulnerabilityTitle: text("vulnerability_title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  exploitability: numeric("exploitability"), // 0-100
  businessImpact: numeric("business_impact"), // 0-100
  ourAdvantage: text("our_advantage"),
  actionItems: text("action_items"),
  timelineToExploit: text("timeline_to_exploit"),
  priority: text("priority").notNull(), // high, medium, low
  status: text("status").notNull().default('identified'), // identified, planning, in_progress, implemented
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
