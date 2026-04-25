CREATE TABLE "personalization" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"interests" text[],
	"focus_areas" text[],
	"exclude_topics" text[],
	"context_style" varchar(50) DEFAULT 'detailed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personalization" ADD CONSTRAINT "personalization_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "tier";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "payment_provider";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "last_payment_at";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "portal_state";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "what_building";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "startup_stage";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "startup_sector";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "target_customer";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "biggest_challenge";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "context_updated_at";