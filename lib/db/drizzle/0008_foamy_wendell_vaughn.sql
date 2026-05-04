CREATE TYPE "public"."earnings_status" AS ENUM('pending', 'processing', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payout_method" AS ENUM('bank_transfer', 'paypal');--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"category" varchar(100) NOT NULL,
	"content_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"razorpay_order_id" varchar(255),
	"amount_paid" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referred_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_claimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walls" (
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
	"skills" text[],
	"looking_for" text[],
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "walls_subscriber_id_unique" UNIQUE("subscriber_id")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" serial NOT NULL,
	"key" text NOT NULL,
	"name" text,
	"last_used" timestamp,
	"rate_limit" numeric(10, 0) DEFAULT '1000',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "creator_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" serial NOT NULL,
	"month" varchar(7) NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"subscriber_fees" numeric(12, 2) DEFAULT '0',
	"referral_bonuses" numeric(12, 2) DEFAULT '0',
	"marketplace_shares" numeric(12, 2) DEFAULT '0',
	"platform_fee" numeric(12, 2) DEFAULT '0',
	"net_payout" numeric(12, 2) DEFAULT '0',
	"pro_revenue" numeric(12, 2) DEFAULT '0',
	"max_revenue" numeric(12, 2) DEFAULT '0',
	"incubator_revenue" numeric(12, 2) DEFAULT '0',
	"status" "earnings_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" serial NOT NULL,
	"subscriber_id" serial NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"tier" varchar(20) DEFAULT 'pro',
	"status" varchar(20) DEFAULT 'active',
	"auto_renew" boolean DEFAULT true,
	"subscription_start_date" timestamp DEFAULT now(),
	"subscription_end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payout_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" serial NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" "payout_method" NOT NULL,
	"status" "earnings_status" DEFAULT 'pending',
	"transaction_id" text,
	"processed_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" serial NOT NULL,
	"tier" varchar(20) NOT NULL,
	"total_referrals" numeric(10, 0) DEFAULT '0',
	"total_commission" numeric(12, 2) DEFAULT '0',
	"commission_rate" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_owner_id" integer NOT NULL,
	"team_member_id" integer,
	"team_member_email" varchar(255),
	"role" varchar(20) DEFAULT 'member',
	"cost_per_seat" text DEFAULT '50.00',
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tier_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" varchar(20) NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"limit_value" integer,
	"value_description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tier_features_tier_feature_key_unique" UNIQUE("tier","feature_key")
);
--> statement-breakpoint
CREATE TABLE "user_tier_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"month" varchar(7) NOT NULL,
	"usage_count" integer DEFAULT 0,
	"limit_value" integer,
	"reset_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_tier_usage_user_id_feature_key_month_unique" UNIQUE("user_id","feature_key","month")
);
--> statement-breakpoint
CREATE TABLE "badge_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"requirement" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badge_definitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "built_with_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"website_url" varchar(500) NOT NULL,
	"traction" text,
	"verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "built_with_verification_subscriber_id_unique" UNIQUE("subscriber_id")
);
--> statement-breakpoint
CREATE TABLE "earned_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id_1" integer NOT NULL,
	"subscriber_id_2" integer NOT NULL,
	"connection_type" varchar(50) DEFAULT 'colleague' NOT NULL,
	"strength" integer DEFAULT 1 NOT NULL,
	"mutually_connected" boolean DEFAULT false NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"profile_views" integer DEFAULT 0 NOT NULL,
	"connections_count" integer DEFAULT 0 NOT NULL,
	"badges_count" integer DEFAULT 0 NOT NULL,
	"network_engagement_score" integer DEFAULT 0 NOT NULL,
	"last_calculated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "founder_leaderboard_subscriber_id_unique" UNIQUE("subscriber_id")
);
--> statement-breakpoint
CREATE TABLE "profile_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_subscriber_id" integer NOT NULL,
	"viewer_subscriber_id" integer,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interaction_type" varchar(50) DEFAULT 'view' NOT NULL,
	"ip_hash" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "founder_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sector" text NOT NULL,
	"stage" text NOT NULL,
	"goal" text NOT NULL,
	"team_size" integer NOT NULL,
	"company_name" text NOT NULL,
	"target_customer" text,
	"idea_description" text,
	"completed_quiz" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "founder_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "onboarding_quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"answer_1_sector" text NOT NULL,
	"answer_2_stage" text NOT NULL,
	"answer_3_goal" text NOT NULL,
	"answer_4_team_size" integer NOT NULL,
	"answer_5_company" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_quizzes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "journey_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stage" text NOT NULL,
	"milestone_name" text NOT NULL,
	"description" text,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_stage" text NOT NULL,
	"completed_milestones" integer DEFAULT 0 NOT NULL,
	"total_milestones" integer DEFAULT 5 NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journey_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "weekly_check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"current_stage" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"scorecard" jsonb,
	"reflections" text,
	"focus_area" text,
	"next_week_goals" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text,
	"current_stage" text NOT NULL,
	"total_check_ins" integer DEFAULT 0 NOT NULL,
	"consistency" integer DEFAULT 0 NOT NULL,
	"average_progress" integer DEFAULT 0 NOT NULL,
	"recent_activity_score" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"last_check_in_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_leaderboard_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "market_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" numeric NOT NULL,
	"user_id" text NOT NULL,
	"insight" text NOT NULL,
	"category" text NOT NULL,
	"confidence" numeric,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_sizing_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text,
	"industry" text NOT NULL,
	"product_description" text NOT NULL,
	"target_market" text NOT NULL,
	"tam" jsonb,
	"sam" jsonb,
	"som" jsonb,
	"market_trends" text,
	"competitor_analysis" text,
	"growth_opportunities" text,
	"risks" text,
	"analysis" text,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"report_id" numeric,
	"competitor_name" text NOT NULL,
	"product_name" text NOT NULL,
	"website" text,
	"funding_stage" text,
	"estimated_funding" numeric,
	"strengths" text,
	"weaknesses" text,
	"market_position" text,
	"pricing_strategy" text,
	"target_audience" text,
	"product_features" text,
	"technical_stack" text,
	"vulnerabilities" jsonb,
	"overall_vulnerability_score" numeric,
	"market_share" numeric,
	"growth_rate" numeric,
	"customer_sentiment" text,
	"analysis_notes" text,
	"analyzed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vulnerability_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"competitor_analysis_id" numeric NOT NULL,
	"user_id" text NOT NULL,
	"vulnerability_title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"exploitability" numeric,
	"business_impact" numeric,
	"our_advantage" text,
	"action_items" text,
	"timeline_to_exploit" text,
	"priority" text NOT NULL,
	"status" text DEFAULT 'identified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "co_founder_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_user_id" text NOT NULL,
	"interaction_type" text NOT NULL,
	"status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "co_founder_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id_1" text NOT NULL,
	"user_id_2" text NOT NULL,
	"overall_score" numeric NOT NULL,
	"complementary_score" numeric NOT NULL,
	"stage_match" numeric NOT NULL,
	"industry_match" numeric NOT NULL,
	"interest_match" numeric NOT NULL,
	"timeline_alignment" numeric NOT NULL,
	"reasons" jsonb NOT NULL,
	"mutual_likes" boolean DEFAULT false,
	"status" text DEFAULT 'potential',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "co_founder_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"bio" text,
	"linkedin_url" text,
	"twitter_url" text,
	"profile_image" text,
	"stage" text NOT NULL,
	"industry" text NOT NULL,
	"main_focus" text NOT NULL,
	"years_experience" numeric,
	"previous_exits" numeric,
	"skills" jsonb NOT NULL,
	"interests" jsonb NOT NULL,
	"looking_for" text,
	"timezone" text,
	"open_to_relocate" boolean DEFAULT false,
	"commitment_level" text,
	"verified" boolean DEFAULT false,
	"profile_complete" boolean DEFAULT false,
	"viewed_profiles" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "co_founder_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "co_founder_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "co_founder_skills_skill_name_unique" UNIQUE("skill_name")
);
--> statement-breakpoint
CREATE TABLE "advisor_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"advisor_id" text NOT NULL,
	"advisor_name" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"next_quarterly_checkin" timestamp,
	"last_checkin_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "churn_risk_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tier" varchar NOT NULL,
	"risk_score" numeric(5, 2) NOT NULL,
	"reasons" jsonb DEFAULT '[]' NOT NULL,
	"last_reviewed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_signals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"scorecard_runs_last_30_days" integer DEFAULT 0 NOT NULL,
	"last_scorecard_run_at" timestamp,
	"playbook_pages_viewed_last_30_days" integer DEFAULT 0 NOT NULL,
	"advisor_calls_completed" integer DEFAULT 0 NOT NULL,
	"founded_before" boolean DEFAULT false NOT NULL,
	"previous_exits" integer DEFAULT 0 NOT NULL,
	"estimated_tam" varchar,
	"defensibility" varchar,
	"consecutive_growth_quarters" integer DEFAULT 0 NOT NULL,
	"scout_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"scout_invited_at" timestamp,
	"incubator_accepted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pro_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mrr_target" integer DEFAULT 500 NOT NULL,
	"user_count_target" integer DEFAULT 500 NOT NULL,
	"current_mrr" integer DEFAULT 0 NOT NULL,
	"current_user_count" integer DEFAULT 0 NOT NULL,
	"feature_shipped" boolean DEFAULT false NOT NULL,
	"milestones_hit" integer DEFAULT 0 NOT NULL,
	"max_upgrade_eligible_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upgrade_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"from_tier" varchar NOT NULL,
	"to_tier" varchar NOT NULL,
	"trigger_type" varchar NOT NULL,
	"email_sent_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_drops" ALTER COLUMN "action_label" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "daily_drops" ALTER COLUMN "action_label" SET DEFAULT 'Read Brief';--> statement-breakpoint
ALTER TABLE "daily_drops" ALTER COLUMN "action_label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "playbook_lessons" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "confirmation_token" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "portal_state" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "what_building" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "startup_sector" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "startup_stage" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "target_customer" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "biggest_challenge" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "foundry_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "context_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "is_investor" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "roadmap" jsonb;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "payment_provider" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "last_payment_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "daily_drops" ADD COLUMN "embedding" text;--> statement-breakpoint
ALTER TABLE "playbook_lessons" ADD COLUMN "embedding" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_subscribers_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_subscribers_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walls" ADD CONSTRAINT "walls_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_creator_id_subscribers_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_creator_id_subscribers_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_subscriptions" ADD CONSTRAINT "creator_subscriptions_creator_id_subscribers_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_subscriptions" ADD CONSTRAINT "creator_subscriptions_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_history" ADD CONSTRAINT "payout_history_creator_id_subscribers_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD CONSTRAINT "referral_tiers_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_seats" ADD CONSTRAINT "team_seats_team_owner_id_subscribers_id_fk" FOREIGN KEY ("team_owner_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_seats" ADD CONSTRAINT "team_seats_team_member_id_subscribers_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tier_usage" ADD CONSTRAINT "user_tier_usage_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "built_with_verification" ADD CONSTRAINT "built_with_verification_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earned_badges" ADD CONSTRAINT "earned_badges_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earned_badges" ADD CONSTRAINT "earned_badges_badge_id_badge_definitions_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_connections" ADD CONSTRAINT "founder_connections_subscriber_id_1_subscribers_id_fk" FOREIGN KEY ("subscriber_id_1") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_connections" ADD CONSTRAINT "founder_connections_subscriber_id_2_subscribers_id_fk" FOREIGN KEY ("subscriber_id_2") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_leaderboard" ADD CONSTRAINT "founder_leaderboard_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_engagement" ADD CONSTRAINT "profile_engagement_profile_subscriber_id_subscribers_id_fk" FOREIGN KEY ("profile_subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_engagement" ADD CONSTRAINT "profile_engagement_viewer_subscriber_id_subscribers_id_fk" FOREIGN KEY ("viewer_subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisor_assignments" ADD CONSTRAINT "advisor_assignments_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "churn_risk_scores" ADD CONSTRAINT "churn_risk_scores_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_signals" ADD CONSTRAINT "founder_signals_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_milestones" ADD CONSTRAINT "pro_milestones_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_offers" ADD CONSTRAINT "upgrade_offers_user_id_subscribers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_confirmation_token_unique" UNIQUE("confirmation_token");--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_referral_code_unique" UNIQUE("referral_code");