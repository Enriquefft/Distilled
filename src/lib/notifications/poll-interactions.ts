import "server-only";
import { handleInteractiveResponse } from "@/lib/handle-interaction.ts";
import { queryMessageStatus } from "@/lib/kapso";

/**
 * Polls Kapso API for inbound interactive button responses
 * Processes like/dislike button clicks from WhatsApp users
 */
export async function pollInteractions() {
	try {
		// Poll for inbound messages from the last 24 hours
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const since = twentyFourHoursAgo.toISOString();

		console.log("[Poll] Fetching inbound messages for interactions...");

		const messages = await queryMessageStatus(since, 100, "inbound");

		if (!messages.data || messages.data.length === 0) {
			console.log("[Poll] No inbound messages to process");
			return { processed: 0 };
		}

		let processedCount = 0;

		for (const message of messages.data) {
			// Check if message is an interactive button response
			if (message.type === "interactive" && message.interactive) {
				const buttonReply = message.interactive.button_reply;

				if (buttonReply && buttonReply.id) {
					console.log(
						`[Poll] Processing button click: ${buttonReply.id} from ${message.from}`,
					);

					await handleInteractiveResponse(message.from, buttonReply.id);
					processedCount++;
				}
			}
		}

		console.log(
			`[Poll] Processed ${processedCount} button interactions from ${messages.data.length} messages`,
		);

		return { processed: processedCount, total: messages.data.length };
	} catch (error) {
		console.error("[Poll] Error polling interactions:", error);
		throw error;
	}
}
