import { NextResponse } from "next/server";
import { serverEnv } from "@/env/server.ts";
import { pollMessageStatus } from "@/lib/notifications/poll-message-status";

export const runtime = "nodejs";

/**
 * Vercel cron job: Poll WhatsApp message delivery status
 * Runs every 5 minutes
 * Schedule: "*/5 * * * *"
 *
 * Tasks performed:
 * 1. Check delivery status of sent WhatsApp messages
 * 2. Update message status in database (sent, delivered, read, failed)
 */
export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");

	if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		await pollMessageStatus();
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error polling message status:", error);
		return NextResponse.json(
			{ error: "Failed to poll message status" },
			{ status: 500 },
		);
	}
}
