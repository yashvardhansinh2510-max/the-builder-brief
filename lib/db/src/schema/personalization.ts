import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const personalizationTable = pgTable("personalization", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .notNull()
    .references(() => subscribersTable.id, { onDelete: "cascade" }),
  interests: text("interests").array(), // ["deals", "insights", "markets"]
  focusAreas: text("focus_areas").array(), // ["AI", "fintech", "climate"]
  excludeTopics: text("exclude_topics").array(), // topics to deprioritize
  contextStyle: varchar("context_style", { length: 50 }).default("detailed").notNull(), // "detailed", "summary", "quick"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPersonalizationSchema = createInsertSchema(personalizationTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPersonalization = z.infer<typeof insertPersonalizationSchema>;
export type Personalization = typeof personalizationTable.$inferSelect;
