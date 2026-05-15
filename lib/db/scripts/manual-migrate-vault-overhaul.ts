import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const { Client } = pg;

const sql = `
ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(500),
  ADD COLUMN IF NOT EXISTS problem_statement TEXT,
  ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS momentum INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_active INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signals_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS market_size VARCHAR(255),
  ADD COLUMN IF NOT EXISTS tam VARCHAR(255),
  ADD COLUMN IF NOT EXISTS unit_economics TEXT,
  ADD COLUMN IF NOT EXISTS keywords_trending TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS scores_json JSONB,
  ADD COLUMN IF NOT EXISTS signals_json JSONB,
  ADD COLUMN IF NOT EXISTS verification_json JSONB;

CREATE TABLE IF NOT EXISTS vault_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  vault_id INTEGER NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, vault_id)
);
`;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ vault overhaul migration complete");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
