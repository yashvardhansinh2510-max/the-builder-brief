import pg from "pg";

const sql = `
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "daily_drops" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
ALTER TABLE "playbook_lessons" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Enabling pgvector and adding embedding columns...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
