import pg from "pg";

const sql = `
CREATE TABLE IF NOT EXISTS "founder_leaderboard" (
  "id" serial PRIMARY KEY NOT NULL,
  "subscriber_id" integer NOT NULL UNIQUE,
  "profile_views" integer DEFAULT 0 NOT NULL,
  "connections_count" integer DEFAULT 0 NOT NULL,
  "badges_count" integer DEFAULT 0 NOT NULL,
  "network_engagement_score" integer DEFAULT 0 NOT NULL,
  "last_calculated_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "founder_leaderboard_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "badge_definitions" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(100) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "icon_url" varchar(500),
  "requirement" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "earned_badges" (
  "id" serial PRIMARY KEY NOT NULL,
  "subscriber_id" integer NOT NULL,
  "badge_id" integer NOT NULL,
  "earned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "earned_badges_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "earned_badges_badge_id_badge_definitions_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "founder_connections" (
  "id" serial PRIMARY KEY NOT NULL,
  "subscriber_id_1" integer NOT NULL,
  "subscriber_id_2" integer NOT NULL,
  "connection_type" varchar(50) DEFAULT 'colleague' NOT NULL,
  "strength" integer DEFAULT 1 NOT NULL,
  "mutually_connected" boolean DEFAULT false NOT NULL,
  "connected_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "founder_connections_subscriber_id_1_subscribers_id_fk" FOREIGN KEY ("subscriber_id_1") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "founder_connections_subscriber_id_2_subscribers_id_fk" FOREIGN KEY ("subscriber_id_2") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "profile_engagement" (
  "id" serial PRIMARY KEY NOT NULL,
  "profile_subscriber_id" integer NOT NULL,
  "viewer_subscriber_id" integer,
  "viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "interaction_type" varchar(50) DEFAULT 'view' NOT NULL,
  "ip_hash" varchar(255),
  CONSTRAINT "profile_engagement_profile_subscriber_id_subscribers_id_fk" FOREIGN KEY ("profile_subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "profile_engagement_viewer_subscriber_id_subscribers_id_fk" FOREIGN KEY ("viewer_subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "built_with_verification" (
  "id" serial PRIMARY KEY NOT NULL,
  "subscriber_id" integer NOT NULL UNIQUE,
  "company_name" varchar(255) NOT NULL,
  "website_url" varchar(500) NOT NULL,
  "traction" text,
  "verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
  "verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "built_with_verification_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "founder_leaderboard_network_engagement_score_idx" ON "founder_leaderboard" ("network_engagement_score" DESC);
CREATE INDEX IF NOT EXISTS "profile_engagement_profile_subscriber_id_idx" ON "profile_engagement" ("profile_subscriber_id");
CREATE INDEX IF NOT EXISTS "profile_engagement_viewer_subscriber_id_idx" ON "profile_engagement" ("viewer_subscriber_id");
CREATE INDEX IF NOT EXISTS "founder_connections_subscriber_id_1_idx" ON "founder_connections" ("subscriber_id_1");
CREATE INDEX IF NOT EXISTS "founder_connections_subscriber_id_2_idx" ON "founder_connections" ("subscriber_id_2");
CREATE INDEX IF NOT EXISTS "earned_badges_subscriber_id_idx" ON "earned_badges" ("subscriber_id");
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Running manual migration for founder network tables...");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

main().catch(console.error);
