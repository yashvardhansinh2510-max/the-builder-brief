import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

export const wallsTable = pgTable("walls", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => subscribersTable.id, { onDelete: "cascade" }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  startupName: varchar("startup_name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  stage: varchar("stage", { length: 100 }),
  bio: text("bio"),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  twitterUrl: varchar("twitter_url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  avatarUrl: varchar("avatar_url", { length: 1000 }), // Optional profile pic
  skills: text("skills").array(),
  lookingFor: text("looking_for").array(),
  isVisible: boolean("is_visible").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
