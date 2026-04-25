import { pgTable, text, serial, timestamp, date, integer } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyBriefsTable = pgTable("daily_briefs", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .notNull()
    .references(() => subscribersTable.id, { onDelete: "cascade" }),
  briefDate: date("brief_date").notNull(), // YYYY-MM-DD for the brief
  summary: text("summary").notNull(), // AI-generated summary
  highlights: text("highlights").array(), // bullet points
  sourceArticleIds: integer("source_article_ids").array(), // article IDs used to generate this
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
});

export const insertDailyBriefSchema = createInsertSchema(dailyBriefsTable).omit({
  id: true,
  generatedAt: true,
});
export type InsertDailyBrief = z.infer<typeof insertDailyBriefSchema>;
export type DailyBrief = typeof dailyBriefsTable.$inferSelect;
