import { pgTable, text, serial, timestamp, jsonb, boolean, numeric } from "drizzle-orm/pg-core";

export const marketSizingReportsTable = pgTable("market_sizing_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  companyName: text("company_name"),
  industry: text("industry").notNull(),
  productDescription: text("product_description").notNull(),
  targetMarket: text("target_market").notNull(),
  tam: jsonb("tam").$type<{
    estimate: number;
    reasoning: string;
    source: string;
  }>(),
  sam: jsonb("sam").$type<{
    estimate: number;
    reasoning: string;
    serviceable: string;
  }>(),
  som: jsonb("som").$type<{
    estimate: number;
    reasoning: string;
    firstYear: string;
  }>(),
  marketTrends: text("market_trends"),
  competitorAnalysis: text("competitor_analysis"),
  growthOpportunities: text("growth_opportunities"),
  risks: text("risks"),
  analysis: text("analysis"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const marketInsightsTable = pgTable("market_insights", {
  id: serial("id").primaryKey(),
  reportId: numeric("report_id").notNull(),
  userId: text("user_id").notNull(),
  insight: text("insight").notNull(),
  category: text("category").notNull(), // trends, opportunities, risks, competitors
  confidence: numeric("confidence"), // 0-100
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
