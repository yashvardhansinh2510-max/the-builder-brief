import pg from "pg";

const sql = `
CREATE TABLE IF NOT EXISTS "daily_drops" (
	"id" serial PRIMARY KEY NOT NULL,
	"pillar" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"category_icon" varchar(10),
	"value" varchar(100),
	"content" text NOT NULL,
	"action_label" varchar(100),
	"day_of_week" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_drops_day_of_week_unique" UNIQUE("day_of_week")
);

CREATE TABLE IF NOT EXISTS "playbook_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "playbook_modules_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "playbook_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"is_free" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "playbook_lessons_slug_unique" UNIQUE("slug"),
    CONSTRAINT "playbook_lessons_module_id_playbook_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."playbook_modules"("id") ON DELETE cascade ON UPDATE no action
);
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
