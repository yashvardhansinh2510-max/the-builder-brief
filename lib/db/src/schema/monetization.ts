import { pgTable, text, uuid, timestamp, numeric, varchar, boolean, pgEnum, serial } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

export const earningsStatus = pgEnum("earnings_status", ["pending", "processing", "paid", "failed"]);
export const payoutMethod = pgEnum("payout_method", ["stripe", "bank_transfer", "paypal"]);

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
  proRevenue: numeric("pro_revenue", { precision: 12, scale: 2 }).default("0"),
  maxRevenue: numeric("max_revenue", { precision: 12, scale: 2 }).default("0"),
  incubatorRevenue: numeric("incubator_revenue", { precision: 12, scale: 2 }).default("0"),
  status: earningsStatus("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payoutHistory = pgTable("payout_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: serial("creator_id").notNull().references(() => subscribersTable.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: payoutMethod("method").notNull(),
  status: earningsStatus("status").default("pending"),
  transactionId: text("transaction_id"),
  processedAt: timestamp("processed_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creatorSubscriptions = pgTable("creator_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: serial("creator_id").notNull().references(() => subscribersTable.id),
  subscriberId: serial("subscriber_id").notNull().references(() => subscribersTable.id),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  tier: varchar("tier", { length: 20 }).default("pro"),
  status: varchar("status", { length: 20 }).default("active"),
  autoRenew: boolean("auto_renew").default(true),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: serial("creator_id").notNull().references(() => subscribersTable.id),
  key: text("key").unique().notNull(),
  name: text("name"),
  lastUsed: timestamp("last_used"),
  rateLimit: numeric("rate_limit", { precision: 10, scale: 0 }).default("1000"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referralTiers = pgTable("referral_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: serial("user_id").notNull().references(() => subscribersTable.id),
  tier: varchar("tier", { length: 20 }).notNull(),
  totalReferrals: numeric("total_referrals", { precision: 10, scale: 0 }).default("0"),
  totalCommission: numeric("total_commission", { precision: 12, scale: 2 }).default("0"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
