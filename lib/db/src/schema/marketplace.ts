import { pgTable, text, serial, timestamp, integer, boolean, varchar, numeric } from "drizzle-orm/pg-core";
import { subscribersTable } from "./subscribers";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  category: varchar("category", { length: 100 }).notNull(), // "template", "stack", "blueprint"
  contentUrl: text("content_url"), // Link to the digital asset
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .notNull()
    .references(() => subscribersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
