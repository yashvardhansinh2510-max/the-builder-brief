import { pgTable, text, serial, timestamp, date, integer, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaultsTable = pgTable("vaults", {
  id: serial("id").primaryKey(),
  vaultWeek: date("vault_week").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }),
  problemStatement: text("problem_statement"),
  description: text("description"),
  content: text("content").notNull(),
  tier: varchar("tier", { length: 10 }).default("free"),
  momentum: integer("momentum").default(0),
  daysActive: integer("days_active").default(0),
  signalsCount: integer("signals_count").default(0),
  marketSize: varchar("market_size", { length: 255 }),
  tam: varchar("tam", { length: 255 }),
  unitEconomics: text("unit_economics"),
  keywordsTrending: text("keywords_trending").array(),
  tags: text("tags").array(),
  scoresJson: jsonb("scores_json"),
  signalsJson: jsonb("signals_json"),
  verificationJson: jsonb("verification_json"),
  // Rich vault fields (P27–P30)
  scores: jsonb("scores"),
  sourceAttribution: jsonb("source_attribution"),
  sourceArticleIds: integer("source_article_ids").array(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVaultSchema = createInsertSchema(vaultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type VaultRow = typeof vaultsTable.$inferSelect;
// Alias for P27–P30 feature code
export type Vault = VaultRow;
