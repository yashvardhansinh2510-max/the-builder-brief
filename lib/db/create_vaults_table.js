import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vaults (
        id SERIAL PRIMARY KEY,
        vault_week DATE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        source_article_ids INTEGER[],
        is_published BOOLEAN NOT NULL DEFAULT false,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Successfully created vaults table");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

run();
