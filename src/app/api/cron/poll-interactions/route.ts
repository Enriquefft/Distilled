import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverEnv } from "@/env/server";
import { getErrorMessage } from "@/lib/handle-error.ts";
import { pollInteractions } from "@/lib/notifications/poll-interactions.ts";

/**
 * Vercel cron job: Poll for WhatsApp button interactions
 * Runs every 5 minutes
 * Schedule: "*/5 * * * *"
 *
 * Tasks performed:
 * 1. Fetch inbound messages from Kapso API
 * 2. Detect interactive button responses (like/dislike)
 * 3. Store user interactions in database
 * 4. Update user preference scores
 */
export async function GET(request: NextRequest) {
	console.log("[cron] Poll interactions job triggered");

	// Verify authorization to prevent unauthorized calls
	const authHeader = request.headers.get("authorization");
	const expectedAuth = `Bearer ${serverEnv.CRON_SECRET}`;

	if (authHeader !== expectedAuth) {
		console.warn("[cron] Unauthorized request");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await pollInteractions();

		return NextResponse.json(
			{
				result,
				success: true,
				timestamp: new Date().toISOString(),
			},
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		console.error("[cron] Poll interactions failed:", errorMessage);

		return NextResponse.json(
			{
				error: "Internal server error",
				message: errorMessage,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}

// Prevent route from being statically generated
export const dynamic = "force-dynamic";
