import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const weeklyCheckInsTable = pgTable("weekly_check_ins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  currentStage: text("current_stage").notNull(),
  completed: boolean("completed").default(false).notNull(),
  scorecard: jsonb("scorecard").$type<{
    milestonesCompleted: number;
    milestonesTarget: number;
    progressPercentage: number;
  }>(),
  reflections: text("reflections"),
  focusArea: text("focus_area"),
  nextWeekGoals: text("next_week_goals"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const weeklyLeaderboardTable = pgTable("weekly_leaderboard", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  companyName: text("company_name"),
  currentStage: text("current_stage").notNull(),
  totalCheckIns: integer("total_check_ins").default(0).notNull(),
  consistency: integer("consistency").default(0).notNull(),
  averageProgress: integer("average_progress").default(0).notNull(),
  recentActivityScore: integer("recent_activity_score").default(0).notNull(),
  rank: integer("rank"),
  lastCheckInAt: timestamp("last_check_in_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
