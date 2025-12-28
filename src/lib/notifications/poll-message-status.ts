import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { whatsappMessage, whatsappMessageStatus } from "@/db/schema/whatsapp";
import { queryMessageStatus } from "@/lib/kapso";

export async function pollMessageStatus() {
	const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

	const pendingMessages = await db
		.select()
		.from(whatsappMessage)
		.where(eq(whatsappMessage.status, "sent"))
		.limit(100);

	if (pendingMessages.length === 0) {
		console.log("No pending messages to poll");
		return;
	}

	const since = twentyFourHoursAgo.toISOString();
	const messages = await queryMessageStatus(since, 100);

	for (const pendingMsg of pendingMessages) {
		const kapsoMessage = messages.data.find(
			(m) => m.id === pendingMsg.whatsappMessageId,
		);

		if (!kapsoMessage) continue;

		const status = kapsoMessage["status"] || "sent";

		const updateData: {
			status: string;
			deliveredAt?: Date;
			readAt?: Date;
			errorMessage?: string;
		} = { status };

		if (status === "delivered" && kapsoMessage.timestamp) {
			updateData.deliveredAt = new Date(Number(kapsoMessage.timestamp) * 1000);
		} else if (status === "read" && kapsoMessage.timestamp) {
			updateData.readAt = new Date(Number(kapsoMessage.timestamp) * 1000);
		} else if (status === "failed") {
			updateData.errorMessage = "Delivery failed";
		}

		await db
			.update(whatsappMessage)
			.set(updateData)
			.where(eq(whatsappMessage.id, pendingMsg.id));

		await db.insert(whatsappMessageStatus).values({
			id: crypto.randomUUID(),
			messageId: pendingMsg.id,
			status,
			timestamp: new Date(
				kapsoMessage.timestamp
					? Number(kapsoMessage.timestamp) * 1000
					: Date.now(),
			),
			webhookPayload: JSON.stringify(kapsoMessage),
		});

		console.log(`Updated message ${pendingMsg.id} to status: ${status}`);
	}

	console.log(`Polled ${pendingMessages.length} messages`);
}
