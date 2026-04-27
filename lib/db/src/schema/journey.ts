import { pgTable, text, serial, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";

export const journeyMilestonesTable = pgTable("journey_milestones", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  stage: text("stage").notNull(), // 'Ideation', 'Building', 'Validating', 'Revenue', 'Scaling', 'Exited'
  milestoneName: text("milestone_name").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journeyProgressTable = pgTable("journey_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentStage: text("current_stage").notNull(), // Ideation, Building, etc.
  completedMilestones: integer("completed_milestones").default(0).notNull(),
  totalMilestones: integer("total_milestones").default(5).notNull(),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
