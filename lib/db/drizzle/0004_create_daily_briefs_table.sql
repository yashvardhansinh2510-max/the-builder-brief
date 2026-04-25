CREATE TABLE "daily_briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"brief_date" date NOT NULL,
	"summary" text NOT NULL,
	"highlights" text[],
	"source_article_ids" integer[],
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "daily_briefs" ADD CONSTRAINT "daily_briefs_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
