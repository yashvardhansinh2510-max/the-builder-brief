import pg from "pg";

const sql = `
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false NOT NULL;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "tier" varchar(50) DEFAULT 'free' NOT NULL;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "portal_state" jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "last_payment_at" timestamp with time zone;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "payment_provider" varchar(50);
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for subscribers expansion...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
