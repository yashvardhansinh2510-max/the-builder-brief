CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"linkedin_url" text,
	"twitter_handle" text,
	"startup_name" text,
	"stage" text DEFAULT 'idea' NOT NULL,
	"industry" text,
	"problem" text,
	"traction" text,
	"goals" text NOT NULL,
	"looking_for" text,
	"revenue_goal" text,
	"why_now" text,
	"referral_source" text,
	"deck_url" text,
	"status" text DEFAULT 'reviewing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source" varchar(100) NOT NULL,
	"category" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscribers" DROP CONSTRAINT "subscribers_email_key";--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "payment_provider" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "last_payment_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "portal_state" jsonb DEFAULT '{"streak":0,"lastVisit":"Sat Apr 25 2026","unlockedItems":[],"completedSteps":[],"deployedArsenal":[],"chatUsage":{},"chatHistory":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "what_building" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "startup_stage" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "startup_sector" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "target_customer" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "biggest_challenge" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "context_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_email_unique" UNIQUE("email");