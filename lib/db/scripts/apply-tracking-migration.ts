import { pgTable, integer } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../artifacts/api-server/.env") });

async function run() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  
  console.log("Adding tracking columns to daily_briefs...");
  try {
    await client.query('ALTER TABLE "daily_briefs" ADD COLUMN IF NOT EXISTS "open_count" integer DEFAULT 0');
    await client.query('ALTER TABLE "daily_briefs" ADD COLUMN IF NOT EXISTS "click_count" integer DEFAULT 0');
    console.log("Success!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

run();
