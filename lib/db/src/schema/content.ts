import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Daily Drops table
export const dailyDropsTable = pgTable("daily_drops", {
  id: serial("id").primaryKey(),
  pillar: varchar("pillar", { length: 50 }).notNull(), // e.g. "scaling", "startup"
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  categoryIcon: varchar("category_icon", { length: 10 }),
  value: varchar("value", { length: 100 }),
  content: text("content").notNull(),
  actionLabel: varchar("action_label", { length: 255 }).notNull().default("Read Brief"),
  dayOfWeek: integer("day_of_week").notNull().unique(), // 0-6 (Sun-Sat)
  embedding: text("embedding"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Playbook Modules
export const playbookModulesTable = pgTable("playbook_modules", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // e.g. "validation"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// Playbook Lessons
export const playbookLessonsTable = pgTable("playbook_lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => playbookModulesTable.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // JSON string or markdown
  isFree: boolean("is_free").notNull().default(false),
  order: integer("order").notNull().default(0),
  embedding: text("embedding"),
  isActive: boolean("is_active").notNull().default(true),
});

// Zod schemas
export const insertDailyDropSchema = createInsertSchema(dailyDropsTable);
export const insertPlaybookModuleSchema = createInsertSchema(playbookModulesTable);
export const insertPlaybookLessonSchema = createInsertSchema(playbookLessonsTable);

export type DailyDrop = typeof dailyDropsTable.$inferSelect;
export type PlaybookModule = typeof playbookModulesTable.$inferSelect;
export type PlaybookLesson = typeof playbookLessonsTable.$inferSelect;
