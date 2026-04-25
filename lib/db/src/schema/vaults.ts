import { pgTable, text, serial, timestamp, date, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaultsTable = pgTable("vaults", {
  id: serial("id").primaryKey(),
  vaultWeek: date("vault_week").notNull(), // start of week (YYYY-MM-DD)
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Week of April 25: AI Takeover"
  description: text("description"),
  content: text("content").notNull(), // curated vault content
  sourceArticleIds: integer("source_article_ids").array(), // articles curated for this vault
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
export type Vault = typeof vaultsTable.$inferSelect;
