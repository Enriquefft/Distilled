import "server-only";
import { db } from "@/db";
import { post, whatsappMessage } from "@/db/schema";
import { filterPostsForUser } from "@/lib/filter-posts.ts";
import { type PostData, sendPostToUser } from "@/lib/send-post.ts";
import { fetchGitHubTrendingRepos } from "./fetch-github.ts";
import { fetchHackerNewsPosts } from "./fetch-hackernews.ts";
import { fetchProductHuntPosts } from "./fetch-product-hunt.ts";
import { fetchRedditPosts } from "./fetch-reddit.ts";

const MAX_POSTS_PER_DAY = 5;

export async function fetchPostsFromSources(): Promise<PostData[]> {
	console.log("[Cron] Fetching posts from all sources...");

	const [productHuntPosts, githubPosts, redditPosts, hackerNewsPosts] =
		await Promise.all([
			fetchProductHuntPosts().catch((err) => {
				console.error("[Cron] Product Hunt fetch failed:", err);
				return [];
			}),
			fetchGitHubTrendingRepos().catch((err) => {
				console.error("[Cron] GitHub fetch failed:", err);
				return [];
			}),
			fetchRedditPosts().catch((err) => {
				console.error("[Cron] Reddit fetch failed:", err);
				return [];
			}),
			fetchHackerNewsPosts().catch((err) => {
				console.error("[Cron] HackerNews fetch failed:", err);
				return [];
			}),
		]);

	const allPosts = [
		...productHuntPosts,
		...githubPosts,
		...redditPosts,
		...hackerNewsPosts,
	];

	console.log(
		`[Cron] Fetched ${allPosts.length} posts (PH: ${productHuntPosts.length}, GH: ${githubPosts.length}, Reddit: ${redditPosts.length}, HN: ${hackerNewsPosts.length})`,
	);

	return allPosts;
}

export async function storePosts(posts: PostData[]): Promise<void> {
	if (posts.length === 0) {
		console.log("[Cron] No posts to store");
		return;
	}

	try {
		await db
			.insert(post)
			.values(
				posts.map((p) => ({
					id: p.id,
					source: p.source,
					title: p.title,
					url: p.url,
				})),
			)
			.onConflictDoNothing(); // Skip duplicates

		console.log(`[Cron] Stored ${posts.length} posts in database`);
	} catch (error) {
		console.error("[Cron] Failed to store posts:", error);
		throw error;
	}
}

export async function processUserDelivery(
	userId: string,
	phoneNumber: string,
	allPosts: PostData[],
): Promise<void> {
	// Apply filtering algorithm
	const filteredPosts = await filterPostsForUser(userId, allPosts);

	if (filteredPosts.length === 0) {
		console.log(`[Cron] No posts to send to user ${userId} after filtering`);
		return;
	}

	// Limit to max posts per day
	const postsToSend = filteredPosts.slice(0, MAX_POSTS_PER_DAY);

	console.log(
		`[Cron] Sending ${postsToSend.length} posts to user ${userId} (${phoneNumber})`,
	);

	// Send each post with delay to avoid rate limiting
	for (const postData of postsToSend) {
		try {
			const messageId = crypto.randomUUID();
			const result = await sendPostToUser(phoneNumber, postData);

			if (result.success) {
				// Record in database
				await db.insert(whatsappMessage).values({
					id: messageId,
					messageBody: `Interactive: ${postData.title}`,
					recipientPhone: phoneNumber,
					sentAt: new Date(),
					status: "sent",
					userId,
					whatsappMessageId: result.messageId || null,
				});

				console.log(
					`[Cron] ✓ Sent post ${postData.id} to user ${userId} (WhatsApp ID: ${result.messageId})`,
				);
			} else {
				// Log failed attempt
				await db.insert(whatsappMessage).values({
					errorMessage: "Failed to send button message",
					id: messageId,
					messageBody: `Interactive: ${postData.title}`,
					recipientPhone: phoneNumber,
					sentAt: new Date(),
					status: "failed",
					userId,
				});

				console.error(
					`[Cron] ✗ Failed to send post ${postData.id} to user ${userId}`,
				);
			}

			// Rate limiting: 1 message per second
			await sleep(1000);
		} catch (error) {
			console.error(
				`[Cron] Error sending post ${postData.id} to user ${userId}:`,
				error,
			);
		}
	}

	console.log(`[Cron] Completed delivery for user ${userId}`);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
