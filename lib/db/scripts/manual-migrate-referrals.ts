import pg from "pg";

const sql = `
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "referral_code" varchar(20) UNIQUE;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "referred_by" integer REFERENCES "subscribers"("id");

CREATE TABLE IF NOT EXISTS "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL REFERENCES "subscribers"("id") ON DELETE cascade,
	"referred_id" integer NOT NULL REFERENCES "subscribers"("id") ON DELETE cascade,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_claimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for referrals...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
