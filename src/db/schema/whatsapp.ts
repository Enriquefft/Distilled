import { text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { schema } from "./schema.ts";

export const whatsappMessage = schema.table("whatsapp_message", {
	deliveredAt: timestamp("delivered_at"),
	errorMessage: text("error_message"),
	id: text("id").primaryKey(),
	messageBody: text("message_body").notNull(),
	readAt: timestamp("read_at"),
	recipientPhone: text("recipient_phone").notNull(),
	sentAt: timestamp("sent_at").notNull(),
	status: text("status").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	whatsappMessageId: text("whatsapp_message_id"),
});

export const whatsappMessageStatus = schema.table("whatsapp_message_status", {
	id: text("id").primaryKey(),
	messageId: text("message_id")
		.notNull()
		.references(() => whatsappMessage.id, { onDelete: "cascade" }),
	status: text("status").notNull(),
	timestamp: timestamp("timestamp").notNull(),
	webhookPayload: text("webhook_payload"),
});
