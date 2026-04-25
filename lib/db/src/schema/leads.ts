import { pgTable, text, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").notNull().default(sql`gen_random_uuid()`),

  // Identity
  name: text("name").notNull(),
  email: text("email").notNull(),
  linkedin_url: text("linkedin_url"),
  twitter_handle: text("twitter_handle"),

  // Venture
  startup_name: text("startup_name"),
  stage: text("stage").notNull().default("idea"),
  industry: text("industry"),
  problem: text("problem"),
  traction: text("traction"),

  // Vision & Fit
  goals: text("goals").notNull(),
  looking_for: text("looking_for"),
  revenue_goal: text("revenue_goal"),
  why_now: text("why_now"),
  referral_source: text("referral_source"),
  deck_url: text("deck_url"),

  // Meta
  status: text("status").notNull().default("reviewing"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
