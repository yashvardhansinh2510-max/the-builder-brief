import { pgTable, text, serial, timestamp, jsonb, numeric, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

export const investorProfilesTable = pgTable("investor_profiles", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }).unique(),
  firmName: varchar("firm_name", { length: 255 }).notNull(),
  investorName: varchar("investor_name", { length: 255 }).notNull(),
  bio: text("bio"),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  twitterUrl: varchar("twitter_url", { length: 500 }),
  firmWebsite: varchar("firm_website", { length: 500 }),
  profileImage: varchar("profile_image", { length: 500 }),
  investmentThesis: text("investment_thesis"), // What they look for
  ticketSize: varchar("ticket_size", { length: 100 }), // e.g., "250k-1m", "1m-5m"
  yearsExperience: integer("years_experience"),
  successfulExits: integer("successful_exits").default(0),
  focusGeography: jsonb("focus_geography").$type<string[]>().notNull().default([]), // US, EU, APAC, etc.
  verified: boolean("verified").default(false),
  profileComplete: boolean("profile_complete").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const investorPreferencesTable = pgTable("investor_preferences", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorProfilesTable.id, { onDelete: "cascade" }).unique(),
  preferredStages: jsonb("preferred_stages").$type<string[]>().notNull(), // seed, series-a, series-b, growth, late-stage
  preferredIndustries: jsonb("preferred_industries").$type<string[]>().notNull(), // AI, fintech, healthtech, etc.
  excludedIndustries: jsonb("excluded_industries").$type<string[]>().default([]),
  minimumTeamSize: integer("minimum_team_size"),
  preferredFounderBackground: jsonb("preferred_founder_background").$type<string[]>().default([]),
  focusOnDiversity: boolean("focus_on_diversity").default(false),
  checkSizMin: numeric("check_size_min"),
  checkSizeMax: numeric("check_size_max"),
  followOnInvestment: boolean("follow_on_investment").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const investorConnectionsTable = pgTable("investor_connections", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorProfilesTable.id, { onDelete: "cascade" }),
  startupSubscriberId: integer("startup_subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  connectionStatus: varchar("connection_status", { length: 50 }).default("interested").notNull(), // interested, contacted, meeting_scheduled, term_sheet, rejected
  initiatedBy: varchar("initiated_by", { length: 50 }).default("startup").notNull(), // investor or startup
  notes: text("notes"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const investorMatchesTable = pgTable("investor_matches", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorProfilesTable.id, { onDelete: "cascade" }),
  startupSubscriberId: integer("startup_subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  overallScore: numeric("overall_score").notNull(), // 0-100
  stageAlignment: numeric("stage_alignment").notNull(),
  industryMatch: numeric("industry_match").notNull(),
  geographyMatch: numeric("geography_match").notNull(),
  checkSizeAlignment: numeric("check_size_alignment").notNull(),
  teamQualityScore: numeric("team_quality_score").notNull(),
  reasons: jsonb("reasons").$type<string[]>().notNull(), // why they match
  matchedAt: timestamp("matched_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const investorEngagementTable = pgTable("investor_engagement", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorProfilesTable.id, { onDelete: "cascade" }),
  startupSubscriberId: integer("startup_subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  profileViews: integer("profile_views").default(0).notNull(),
  pitchDownloads: integer("pitch_downloads").default(0).notNull(),
  messagesSent: integer("messages_sent").default(0).notNull(),
  meetingsScheduled: integer("meetings_scheduled").default(0).notNull(),
  lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
