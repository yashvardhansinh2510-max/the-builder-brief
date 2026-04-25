import pg from "pg";

const sql = `
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "is_investor" boolean DEFAULT false NOT NULL;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "investor_profile" jsonb;

ALTER TABLE "walls" ADD COLUMN IF NOT EXISTS "skills" text[];
ALTER TABLE "walls" ADD COLUMN IF NOT EXISTS "looking_for" text[];
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for institutional phase...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
