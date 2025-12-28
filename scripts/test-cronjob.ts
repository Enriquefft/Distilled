/**
 * Manual test script for the cronjob
 * Usage: bun scripts/test-cronjob.ts
 */

import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { whatsappMessage } from "@/db/schema/whatsapp";

function formatDigestMessage(data: {
	title: string;
	content: string;
	post_link: string;
	post_votes: number;
}) {
	return `🚀 *Daily Tech Digest*

📌 *${data.title}*
${data.content}

👍 ${data.post_votes} votes

🔗 ${data.post_link}

---
Powered by Distilled`;
}

// Get environment variables directly
const KAPSO_API_KEY = process.env.KAPSO_API_KEY;
const KAPSO_PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;

if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
	console.error("❌ Missing required environment variables:");
	console.error("  KAPSO_API_KEY:", KAPSO_API_KEY ? "✓" : "✗");
	console.error("  KAPSO_PHONE_NUMBER_ID:", KAPSO_PHONE_NUMBER_ID ? "✓" : "✗");
	process.exit(1);
}

// Initialize Kapso client
const kapsoClient = new WhatsAppClient({
	baseUrl: "https://api.kapso.ai/meta/whatsapp",
	kapsoApiKey: KAPSO_API_KEY,
});

const phoneNumberId = KAPSO_PHONE_NUMBER_ID;

async function sendTextMessage(to: string, body: string) {
	if (!kapsoClient || !phoneNumberId) {
		throw new Error(
			"Kapso is not configured. Set KAPSO_API_KEY and KAPSO_PHONE_NUMBER_ID.",
		);
	}
	return kapsoClient.messages.sendText({
		body,
		phoneNumberId,
		to,
	});
}

async function sendTemplateMessage(
	to: string,
	templateName: string,
	languageCode = "en",
	components?: Array<{
		type: string;
		parameters: Array<{ type: string; text?: string }>;
	}>,
) {
	if (!kapsoClient || !phoneNumberId) {
		throw new Error(
			"Kapso is not configured. Set KAPSO_API_KEY and KAPSO_PHONE_NUMBER_ID.",
		);
	}
	return kapsoClient.messages.sendTemplate({
		phoneNumberId,
		template: {
			components,
			language: { code: languageCode },
			name: templateName,
		},
		to,
	});
}

async function testCronjob(newsData: {
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
	const messageBody = formatDigestMessage(newsData);

	console.log(`\nFound ${users.length} opted-in users with phone numbers\n`);
	console.log("Message to send:");
	console.log("─".repeat(50));
	console.log(messageBody);
	console.log("─".repeat(50));
	console.log();

	// 3. Send to each recipient
	for (const recipient of users) {
		try {
			console.log(
				`Sending to ${recipient.name || "Unknown"} (${recipient.phone})...`,
			);
			const messageId = crypto.randomUUID();

			// Send via Kapso using simple text message (template not required)
			const response = await sendTextMessage(recipient.phone!, messageBody);

			// Record in database
			await db.insert(whatsappMessage).values({
				id: messageId,
				messageBody,
				recipientPhone: recipient.phone!,
				sentAt: new Date(),
				status: "sent",
				userId: recipient.id,
				whatsappMessageId: response.messages?.[0]?.id || null,
			});

			results.sent++;
			console.log("  ✅ Sent successfully");

			// Rate limiting: 1 message per second
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			results.failed++;
			results.errors.push({
				error: error instanceof Error ? error.message : "Unknown error",
				userId: recipient.id,
			});

			console.log(
				`  ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);

			// Log failed attempt
			await db.insert(whatsappMessage).values({
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				id: crypto.randomUUID(),
				messageBody,
				recipientPhone: recipient.phone!,
				sentAt: new Date(),
				status: "failed",
				userId: recipient.id,
			});
		}
	}

	return results;
}

const sample_data = {
	content:
		"better auth is an open-source, self-hosted user authentication and management solution that simplifies adding secure auth to any application.",
	media: [
		"https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=374983&theme=light",
		"https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=374983&theme=light",
	],
	post_link: "https://www.producthunt.com/posts/better-auth",
	post_votes: 420,
	title: "better auth",
};

console.log("🚀 Testing cronjob WhatsApp notification...\n");

try {
	const results = await testCronjob(sample_data);

	console.log("\n" + "=".repeat(50));
	console.log("✅ Test completed!");
	console.log("=".repeat(50));
	console.log(`Sent: ${results.sent}`);
	console.log(`Failed: ${results.failed}`);

	if (results.errors.length > 0) {
		console.log("\nErrors:");
		for (const err of results.errors) {
			console.log(`  - User ${err.userId}: ${err.error}`);
		}
	}

	process.exit(0);
} catch (error) {
	console.error("\n❌ Test failed:");
	console.error(error);
	process.exit(1);
}
