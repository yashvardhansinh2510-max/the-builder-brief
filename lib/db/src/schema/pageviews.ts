import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pageviewsTable = pgTable("pageviews", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPageviewSchema = createInsertSchema(pageviewsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPageview = z.infer<typeof insertPageviewSchema>;
export type Pageview = typeof pageviewsTable.$inferSelect;
