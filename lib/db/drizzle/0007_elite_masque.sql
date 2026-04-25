CREATE TABLE "daily_drops" (
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
--> statement-breakpoint
CREATE TABLE "playbook_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"is_free" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "playbook_lessons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "playbook_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "playbook_modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
ALTER TABLE "playbook_lessons" ADD CONSTRAINT "playbook_lessons_module_id_playbook_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."playbook_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;