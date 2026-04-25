import { relations } from "drizzle-orm/relations";
import { subscribers, chatMessages } from "./schema";

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	subscriber: one(subscribers, {
		fields: [chatMessages.subscriberId],
		references: [subscribers.id]
	}),
}));

export const subscribersRelations = relations(subscribers, ({many}) => ({
	chatMessages: many(chatMessages),
}));