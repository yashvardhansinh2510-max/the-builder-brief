import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { vaultsTable } from "./vaults";

export const vaultBookmarksTable = pgTable("vault_bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  vaultId: integer("vault_id").notNull().references(() => vaultsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userVaultUnique: unique().on(table.userId, table.vaultId),
}));
