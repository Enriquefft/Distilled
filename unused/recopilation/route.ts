import { and, eq, isNotNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { serverEnv } from "@/env/server";
import { getErrorMessage } from "@/lib/handle-error.ts";
import {
	fetchPostsFromSources,
	processUserDelivery,
	storePosts,
} from "@/lib/notifications/cron-helpers.ts";

/**
 * Vercel cron job: Tech news digest with interactive buttons
 * Runs daily at 3 AM UTC
 *
 * Tasks performed:
 * 1. Fetch posts from Product Hunt, GitHub, Reddit, HackerNews
 * 2. Store posts in database (prevent duplicates)
 * 3. Get opted-in users with phone numbers
 * 4. Apply filtering based on user preferences (after 5+ interactions)
 * 5. Send posts with like/dislike buttons via WhatsApp
 * 6. Track delivery status in database
 */
export async function GET(request: NextRequest) {
	console.log("[cron] Post delivery job triggered");

	// Verify authorization to prevent unauthorized calls
	const authHeader = request.headers.get("authorization");
	const expectedAuth = `Bearer ${serverEnv.CRON_SECRET}`;

	if (authHeader !== expectedAuth) {
		console.warn("[cron] Unauthorized request");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// 1. Fetch posts from external sources
		const posts = await fetchPostsFromSources();

		if (posts.length === 0) {
			console.warn("[cron] No posts fetched from any source");
			return NextResponse.json(
				{
					message: "No posts available",
					success: true,
					timestamp: new Date().toISOString(),
				},
				{ status: 200 },
			);
		}

		// 2. Store posts in database (prevent duplicates)
		await storePosts(posts);

		// 3. Get opted-in users with phone numbers
		const users = await db
			.select({
				id: user.id,
				phone: user.phone,
			})
			.from(user)
			.where(and(eq(user.whatsappOptIn, true), isNotNull(user.phone)));

		console.log(`[cron] Processing ${users.length} opted-in users`);

		if (users.length === 0) {
			console.log("[cron] No opted-in users with phone numbers");
			return NextResponse.json(
				{
					message: "No opted-in users",
					postsCount: posts.length,
					success: true,
					timestamp: new Date().toISOString(),
				},
				{ status: 200 },
			);
		}

		// 4. Process each user individually
		const results = {
			errors: [] as string[],
			failed: 0,
			success: 0,
			total: users.length,
		};

		for (const u of users) {
			try {
				await processUserDelivery(u.id, u.phone!, posts);
				results.success++;
			} catch (error) {
				results.failed++;
				const errorMsg = getErrorMessage(error);
				results.errors.push(`User ${u.id}: ${errorMsg}`);
				console.error(`[cron] Failed to process user ${u.id}:`, errorMsg);
			}
		}

		console.log("[cron] Job completed:", results);

		return NextResponse.json(
			{
				postsCount: posts.length,
				results,
				success: true,
				timestamp: new Date().toISOString(),
			},
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		console.error("[cron] Job failed:", errorMessage);

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

// prevent route from being statically generated
export const dynamic = "force-dynamic";
