import { pgTable, text, serial, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core";

export const coFounderSkillsTable = pgTable("co_founder_skills", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull().unique(),
  category: text("category").notNull(), // technical, business, design, marketing, operations, etc.
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coFounderProfilesTable = pgTable("co_founder_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  profileImage: text("profile_image"),
  stage: text("stage").notNull(), // idea, mvp, traction, growth
  industry: text("industry").notNull(),
  mainFocus: text("main_focus").notNull(), // technical, business, operations, etc.
  yearsExperience: numeric("years_experience"),
  previousExits: numeric("previous_exits"),
  skills: jsonb("skills").$type<Array<{
    id: number;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>>().notNull(),
  interests: jsonb("interests").$type<string[]>().notNull(),
  lookingFor: text("looking_for"),
  timezone: text("timezone"),
  openToRelocate: boolean("open_to_relocate").default(false),
  commitmentLevel: text("commitment_level"), // fulltime, parttime, advisory
  verified: boolean("verified").default(false),
  profileComplete: boolean("profile_complete").default(false),
  viewedProfiles: jsonb("viewed_profiles").$type<number[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const coFounderMatchesTable = pgTable("co_founder_matches", {
  id: serial("id").primaryKey(),
  userId1: text("user_id_1").notNull(),
  userId2: text("user_id_2").notNull(),
  overallScore: numeric("overall_score").notNull(), // 0-100
  complementaryScore: numeric("complementary_score").notNull(), // skill complementarity
  stageMatch: numeric("stage_match").notNull(), // how aligned are they on stage
  industryMatch: numeric("industry_match").notNull(), // industry alignment
  interestMatch: numeric("interest_match").notNull(), // shared interests
  timelineAlignment: numeric("timeline_alignment").notNull(), // commitment timeline
  reasons: jsonb("reasons").$type<string[]>().notNull(), // why they match
  mutualLikes: boolean("mutual_likes").default(false),
  status: text("status").default('potential'), // potential, interested, matched, rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const coFounderInteractionsTable = pgTable("co_founder_interactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  targetUserId: text("target_user_id").notNull(),
  interactionType: text("interaction_type").notNull(), // viewed, liked, messaged, matched
  status: text("status"), // pending, accepted, rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
