/**
 * Quick test script - send text message to your own number
 *
 * IMPORTANT: Before running this:
 * 1. Open WhatsApp on your phone
 * 2. Send ANY message to your Kapso business number
 * 3. This opens a 24-hour window for free-form messages
 *
 * Usage: bun scripts/test-quick.ts +51926689401
 */

import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";

const KAPSO_API_KEY = process.env["KAPSO_API_KEY"];
const KAPSO_PHONE_NUMBER_ID = process.env["KAPSO_PHONE_NUMBER_ID"];

if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
	console.error("❌ Missing required environment variables:");
	console.error("  KAPSO_API_KEY:", KAPSO_API_KEY ? "✓" : "✗");
	console.error("  KAPSO_PHONE_NUMBER_ID:", KAPSO_PHONE_NUMBER_ID ? "✓" : "✗");
	process.exit(1);
}

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
	console.error("❌ Please provide a phone number:");
	console.error("   bun scripts/test-quick.ts +51926689401");
	process.exit(1);
}

// Initialize Kapso client
const kapsoClient = new WhatsAppClient({
	baseUrl: "https://api.kapso.ai/meta/whatsapp",
	kapsoApiKey: KAPSO_API_KEY,
});

const testMessage = `🚀 *Test Message from Distilled*

This is a quick test to verify WhatsApp integration is working!

📌 *Better Auth*
An open-source, self-hosted user authentication and management solution that simplifies adding secure auth to any application.

👍 420 votes

🔗 https://www.producthunt.com/posts/better-auth

---
Powered by Distilled
Sent at: ${new Date().toLocaleString()}`;

console.log("📱 Quick Test Script\n");
console.log("IMPORTANT: Make sure you've sent a message FROM your WhatsApp");
console.log("TO the Kapso business number in the last 24 hours!\n");
console.log(`Sending to: ${phoneNumber}\n`);
console.log("Message content:");
console.log("─".repeat(60));
console.log(testMessage);
console.log("─".repeat(60));
console.log();

try {
	const response = await kapsoClient.messages.sendText({
		body: testMessage,
		phoneNumberId: KAPSO_PHONE_NUMBER_ID,
		to: phoneNumber,
	});

	console.log("✅ Message sent successfully!");
	console.log();
	console.log("Response:");
	console.log(JSON.stringify(response, null, 2));
	console.log();
	console.log("Check your WhatsApp now! 📱");

	process.exit(0);
} catch (error) {
	console.error("\n❌ Failed to send message:");

	if (error instanceof Error) {
		console.error(error.message);

		// Check for common errors
		if (error.message.includes("24-hour")) {
			console.log("\n💡 Solution:");
			console.log("1. Open WhatsApp on your phone");
			console.log("2. Send ANY message to your Kapso business number");
			console.log("3. Wait a few seconds");
			console.log("4. Run this script again");
		} else if (error.message.includes("Template")) {
			console.log("\n💡 This error means the 24-hour window expired.");
			console.log("   Follow the steps above to reopen it.");
		}
	} else {
		console.error(error);
	}

	process.exit(1);
}
