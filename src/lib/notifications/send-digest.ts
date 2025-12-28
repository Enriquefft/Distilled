import "server-only";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { whatsappMessage } from "@/db/schema/whatsapp";
import { sendTemplateMessage } from "@/lib/kapso";
import { formatDigestMessage } from "./format-message";

export async function derivedatafromproducthunt(newsData: {
	title: string;
	content: string;
	post_link: string;
	post_votes: number;
	media?: string[];
}) {
	// 1. Fetch all opted-in users with phones
	const users = await db
		.select({ id: user.id, name: user.name, phone: user.phone })
		.from(user)
		.where(and(isNotNull(user.phone), eq(user.whatsappOptIn, true)));

	const results = {
		errors: [] as Array<{ userId: string; error: string }>,
		failed: 0,
		sent: 0,
	};

	// 2. Format message
	formatDigestMessage(newsData);

	// 3. Send to each recipient
	for (const recipient of users) {
		try {
			const messageId = crypto.randomUUID();

			// Send via Kapso using template message
			const response = await sendTemplateMessage(
				recipient.phone!,
				"daily_tech_digest", // Template created via scripts/create-template.ts
				"en_US",
				[
					{
						parameters: [
							{ text: newsData.title, type: "text" }, // {{1}}
							{ text: newsData.content, type: "text" }, // {{2}}
							{ text: newsData.post_votes.toString(), type: "text" }, // {{3}}
							{ text: newsData.post_link, type: "text" }, // {{4}}
						],
						type: "body",
					},
				],
			);

			// Record in database
			await db.insert(whatsappMessage).values({
				id: messageId,
				messageBody: `Template: daily_tech_digest | ${newsData.title}`,
				recipientPhone: recipient.phone!,
				sentAt: new Date(),
				status: "sent",
				userId: recipient.id,
				whatsappMessageId: response.messages?.[0]?.id || null,
			});

			results.sent++;

			// Rate limiting: 1 message per second
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			results.failed++;
			results.errors.push({
				error: error instanceof Error ? error.message : "Unknown error",
				userId: recipient.id,
			});

			// Log failed attempt
			await db.insert(whatsappMessage).values({
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				id: crypto.randomUUID(),
				messageBody: `Template: daily_tech_digest | ${newsData.title}`,
				recipientPhone: recipient.phone!,
				sentAt: new Date(),
				status: "failed",
				userId: recipient.id,
			});
		}
	}

	return results;
}
