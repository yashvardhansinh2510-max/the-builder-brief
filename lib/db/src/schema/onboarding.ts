import { pgTable, text, serial, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";

// Founder profile data from onboarding
export const founderProfilesTable = pgTable("founder_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // email
  sector: text("sector").notNull(),
  stage: text("stage").notNull(),
  goal: text("goal").notNull(),
  teamSize: integer("team_size").notNull(),
  companyName: text("company_name").notNull(),
  targetCustomer: text("target_customer"),
  ideaDescription: text("idea_description"),
  completedQuiz: boolean("completed_quiz").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Onboarding quiz responses
export const onboardingQuizzesTable = pgTable("onboarding_quizzes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // email
  answer1_sector: text("answer_1_sector").notNull(),
  answer2_stage: text("answer_2_stage").notNull(),
  answer3_goal: text("answer_3_goal").notNull(),
  answer4_teamSize: integer("answer_4_team_size").notNull(),
  answer5_company: text("answer_5_company").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
