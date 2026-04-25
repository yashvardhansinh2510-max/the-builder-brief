import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id")
    .notNull()
    .references(() => subscribersTable.id, { onDelete: "cascade" }),
  referredId: integer("referred_id")
    .notNull()
    .references(() => subscribersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "rewarded"
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Referral = typeof referralsTable.$inferSelect;
export type InsertReferral = typeof referralsTable.$inferInsert;
