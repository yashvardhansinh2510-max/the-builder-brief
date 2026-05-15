import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEventsTable.$inferInsert;
