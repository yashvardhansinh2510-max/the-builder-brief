import pg from "pg";

const sql = `
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "foundry_score" integer;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "roadmap" jsonb;
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for scorecard columns...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
