import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscribersTable = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("homepage"),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmationToken: text("confirmation_token").unique(),
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  tier: text("tier").notNull().default("free"), // free, pro, max, incubator
  portalState: jsonb("portal_state").default({}),
  whatBuilding: text("what_building"),
  startupSector: text("startup_sector"),
  startupStage: text("startup_stage"),
  targetCustomer: text("target_customer"),
  biggestChallenge: text("biggest_challenge"),
  foundryScore: integer("foundry_score").default(0),
  contextUpdatedAt: timestamp("context_updated_at", { withTimezone: true }),
  isAdmin: boolean("is_admin").notNull().default(false),
  isInvestor: boolean("is_investor").notNull().default(false),
  referralCode: text("referral_code").unique(),
  roadmap: jsonb("roadmap"),
  paymentProvider: text("payment_provider"), // stripe, razorpay
  lastPaymentAt: timestamp("last_payment_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSubscriberSchema = createInsertSchema(subscribersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribersTable.$inferSelect;
