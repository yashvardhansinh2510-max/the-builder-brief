import pg from "pg";

const sql = `
CREATE TABLE IF NOT EXISTS "walls" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"startup_name" varchar(255) NOT NULL,
	"sector" varchar(100),
	"stage" varchar(100),
	"bio" text,
	"linkedin_url" varchar(500),
	"twitter_url" varchar(500),
	"github_url" varchar(500),
	"website_url" varchar(500),
	"avatar_url" varchar(1000),
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "walls_subscriber_id_unique" UNIQUE("subscriber_id"),
    CONSTRAINT "walls_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action
);
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for walls...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
