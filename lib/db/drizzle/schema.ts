import { pgTable, serial, text, timestamp, uuid, foreignKey, integer, boolean, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const pageviews = pgTable("pageviews", {
	id: serial().primaryKey().notNull(),
	page: text().notNull(),
	referrer: text(),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const leads = pgTable("leads", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	goals: text().notNull(),
	status: text().default('reviewing').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	linkedinUrl: text("linkedin_url"),
	twitterHandle: text("twitter_handle"),
	startupName: text("startup_name"),
	stage: text().default('idea').notNull(),
	industry: text(),
	problem: text(),
	traction: text(),
	lookingFor: text("looking_for"),
	revenueGoal: text("revenue_goal"),
	whyNow: text("why_now"),
	referralSource: text("referral_source"),
	deckUrl: text("deck_url"),
});

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	subscriberId: integer("subscriber_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subscriberId],
			foreignColumns: [subscribers.id],
			name: "chat_messages_subscriber_id_fkey"
		}).onDelete("cascade"),
]);

export const subscribers = pgTable("subscribers", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	source: text().default('homepage').notNull(),
	confirmed: boolean().default(false).notNull(),
	unsubscribed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	whatBuilding: text("what_building"),
	startupStage: text("startup_stage"),
	startupSector: text("startup_sector"),
	targetCustomer: text("target_customer"),
	biggestChallenge: text("biggest_challenge"),
	contextUpdatedAt: timestamp("context_updated_at", { withTimezone: true, mode: 'string' }),
});

export const articles = pgTable("articles", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	source: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});
