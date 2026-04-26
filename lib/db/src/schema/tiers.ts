import { pgTable, text, uuid, timestamp, integer, varchar, unique } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

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

export const teamSeatsTable = pgTable("team_seats", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamOwnerId: integer("team_owner_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  teamMemberId: integer("team_member_id").references(() => subscribersTable.id, { onDelete: "setNull" }),
  teamMemberEmail: varchar("team_member_email", { length: 255 }),
  role: varchar("role", { length: 20 }).default("member"),
  costPerSeat: text("cost_per_seat").default("50.00"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
});
