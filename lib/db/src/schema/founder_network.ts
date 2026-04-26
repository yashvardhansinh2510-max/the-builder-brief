import { pgTable, text, serial, timestamp, varchar, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

// Leaderboard scores and rankings
export const founderLeaderboardTable = pgTable("founder_leaderboard", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }).unique(),
  profileViews: integer("profile_views").default(0).notNull(),
  connectionsCount: integer("connections_count").default(0).notNull(),
  badgesCount: integer("badges_count").default(0).notNull(),
  networkEngagementScore: integer("network_engagement_score").default(0).notNull(),
  lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Badge definitions
export const badgeDefinitionsTable = pgTable("badge_definitions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  requirement: text("requirement"), // How to earn this badge
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Earned badges
export const earnedBadgesTable = pgTable("earned_badges", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badgeDefinitionsTable.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Founder network connections
export const founderConnectionsTable = pgTable("founder_connections", {
  id: serial("id").primaryKey(),
  subscriberId1: integer("subscriber_id_1").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  subscriberId2: integer("subscriber_id_2").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  connectionType: varchar("connection_type", { length: 50 }).default("colleague").notNull(), // colleague, mentor, investor, etc
  strength: integer("strength").default(1).notNull(), // 1-5 scale
  mutuallyConnected: boolean("mutually_connected").default(false).notNull(),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Profile views and engagement tracking
export const profileEngagementTable = pgTable("profile_engagement", {
  id: serial("id").primaryKey(),
  profileSubscriberId: integer("profile_subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }),
  viewerSubscriberId: integer("viewer_subscriber_id").references(() => subscribersTable.id, { onDelete: "set null" }), // null for anonymous
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  interactionType: varchar("interaction_type", { length: 50 }).default("view").notNull(), // view, like, message, connection_request
  ipHash: varchar("ip_hash", { length: 255 }), // For anonymous tracking
});

// "Built with Builder Brief" badge verification
export const builtWithVerificationTable = pgTable("built_with_verification", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }).unique(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  websiteUrl: varchar("website_url", { length: 500 }).notNull(),
  traction: text("traction"), // Revenue, users, metrics
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(), // pending, verified, rejected
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
