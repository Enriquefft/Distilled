/**
 * Manual test script for the cronjob with real service data
 * Usage: bun scripts/test-cronjob-real.ts
 */

import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { post } from "@/db/schema";
import type { PostData } from "@/lib/send-post";

// Get environment variables
const KAPSO_API_KEY = process.env["KAPSO_API_KEY"];
const KAPSO_PHONE_NUMBER_ID = process.env["KAPSO_PHONE_NUMBER_ID"];
const PRODUCTHUNT_TOKEN = process.env["PRODUCTHUNT_TOKEN"];
const GH_TOKEN = process.env["GH_TOKEN"];

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

// Inline implementations to avoid server-only imports

async function fetchProductHuntPosts(): Promise<PostData[]> {
	try {
		if (!PRODUCTHUNT_TOKEN) {
			console.warn("[Product Hunt] PRODUCTHUNT_TOKEN not configured - skipping");
			return [];
		}

		const query = `
			query($limit: Int!) {
				posts(first: $limit, order: VOTES) {
					nodes {
						id
						name
						tagline
						url
						votesCount
					}
				}
			}
		`;

		const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
			body: JSON.stringify({
				query,
				variables: { limit: 10 },
			}),
			headers: {
				Authorization: `Bearer ${PRODUCTHUNT_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
		});

		if (!response.ok) {
			throw new Error(`ProductHunt API error: ${response.status}`);
		}

		const data = await response.json();

		if (data.errors) {
			throw new Error(`ProductHunt GraphQL error: ${data.errors[0]?.message}`);
		}

		const posts = data.data.posts.nodes;

		return posts.slice(0, 5).map((post: any) => ({
			content: post.tagline,
			id: `ph_${post.id}`,
			source: "product_hunt",
			title: post.name,
			url: post.url,
			votes: post.votesCount,
		}));
	} catch (error) {
		console.error("[Product Hunt] Failed to fetch posts:", error);
		return [];
	}
}

async function fetchHackerNewsPosts(): Promise<PostData[]> {
	try {
		const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
		if (!response.ok) {
			throw new Error("Failed to fetch HN top stories");
		}

		const topIds: number[] = await response.json();

		const items = await Promise.all(
			topIds.slice(0, 10).map(async (id) => {
				const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
				return itemResponse.json();
			})
		);

		return items.slice(0, 5).map((item: any) => ({
			content: item.text || `${item.score} points • ${item.descendants ?? 0} comments`,
			id: `hn_${item.id}`,
			source: "hackernews",
			title: item.title,
			url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
			votes: item.score,
		}));
	} catch (error) {
		console.error("[HackerNews] Failed to fetch posts:", error);
		return [];
	}
}

async function fetchGitHubTrendingRepos(): Promise<PostData[]> {
	try {
		if (GH_TOKEN) {
			const today = new Date();
			today.setDate(today.getDate() - 1);
			const dateStr = today.toISOString().split("T")[0];

			const query = `
				query($limit: Int!, $query: String!) {
					search(query: $query, type: REPOSITORY, first: $limit) {
						nodes {
							... on Repository {
								name
								owner { login }
								description
								url
								stargazerCount
							}
						}
					}
				}
			`;

			const response = await fetch("https://api.github.com/graphql", {
				body: JSON.stringify({
					query,
					variables: {
						limit: 10,
						query: `created:>${dateStr} stars:>50 sort:stars-desc`,
					},
				}),
				headers: {
					Authorization: `Bearer ${GH_TOKEN}`,
					"Content-Type": "application/json",
				},
				method: "POST",
			});

			if (!response.ok) {
				throw new Error(`GitHub GraphQL API error: ${response.status}`);
			}

			const data = await response.json();

			if (data.errors) {
				throw new Error(`GitHub GraphQL error: ${data.errors[0]?.message}`);
			}

			return data.data.search.nodes.slice(0, 5).map((repo: any) => ({
				content: repo.description || "No description available",
				id: `gh_${repo.owner.login}_${repo.name}`.replace(/[^a-zA-Z0-9_]/g, "_"),
				source: "github",
				title: `${repo.owner.login}/${repo.name}`,
				url: repo.url,
				votes: repo.stargazerCount,
			}));
		}

		// Fallback to third-party API
		const response = await fetch("https://api.gitterapp.com/repositories?since=daily", {
			headers: {
				"User-Agent": "Distilled-App",
			},
		});

		if (!response.ok) {
			throw new Error(`GitHub trending API error: ${response.status}`);
		}

		const repos = await response.json();

		return repos.slice(0, 5).map((repo: any) => ({
			content: repo.description || `⭐ ${repo.stars} stars • ${repo.language || "Unknown language"}`,
			id: `gh_${repo.name.replace("/", "_").replace(/[^a-zA-Z0-9_]/g, "")}`,
			source: "github",
			title: repo.name,
			url: repo.url,
			votes: repo.stars,
		}));
	} catch (error) {
		console.error("[GitHub] Failed to fetch trending repos:", error);
		return [];
	}
}

async function filterPostsForUser(userId: string, posts: PostData[]): Promise<PostData[]> {
	// Simplified version - in real implementation this would check user preferences
	// For testing, we'll just return all posts
	return posts;
}

async function sendPostToUser(
	phoneNumber: string,
	postData: PostData,
): Promise<{ messageId?: string; success: boolean }> {
	try {
		const sourceEmoji =
			{
				github: "💻",
				hackernews: "📰",
				product_hunt: "🚀",
				reddit: "🤖",
			}[postData.source] || "📰";

		const sourceName =
			{
				github: "GitHub",
				hackernews: "Hacker News",
				product_hunt: "Product Hunt",
				reddit: "Reddit",
			}[postData.source] || postData.source;

		const header = `${sourceEmoji} ${sourceName}`;

		const maxContentLength = 800;
		const truncatedContent =
			postData.content.length > maxContentLength
				? `${postData.content.slice(0, maxContentLength)}...`
				: postData.content;

		const body = `*${postData.title}*\n\n${truncatedContent}\n\n🔗 ${postData.url}`;
		const footer = postData.votes ? `${postData.votes} votes` : undefined;

		const buttons = [
			{ id: `like:${postData.id}`, title: "👍 Like" },
			{ id: `dislike:${postData.id}`, title: "👎 Dislike" },
		];

		const response = await kapsoClient.messages.sendInteractiveButtons({
			bodyText: body,
			buttons,
			footerText: footer,
			header: header ? { text: header, type: "text" } : undefined,
			phoneNumberId: KAPSO_PHONE_NUMBER_ID,
			to: phoneNumber,
		});

		return {
			messageId: response.messages?.[0]?.id,
			success: true,
		};
	} catch (error) {
		console.error("Error sending post to user:", error);
		return {
			success: false,
		};
	}
}

async function fetchAllPosts(): Promise<PostData[]> {
	console.log("📥 Fetching posts from all services...\n");

	const [productHuntPosts, hackerNewsPosts, githubPosts] = await Promise.all([
		fetchProductHuntPosts(),
		fetchHackerNewsPosts(),
		fetchGitHubTrendingRepos(),
	]);

	const allPosts = [
		...productHuntPosts,
		...hackerNewsPosts,
		...githubPosts,
	];

	console.log(`  Product Hunt: ${productHuntPosts.length} posts`);
	console.log(`  Hacker News: ${hackerNewsPosts.length} posts`);
	console.log(`  GitHub: ${githubPosts.length} posts`);
	console.log(`  Total: ${allPosts.length} posts\n`);

	return allPosts;
}

async function storePostsInDatabase(posts: PostData[]) {
	console.log("💾 Storing posts in database...\n");

	for (const postData of posts) {
		try {
			// Check if post already exists
			const existing = await db
				.select({ id: post.id })
				.from(post)
				.where(eq(post.id, postData.id))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(post).values({
					content: postData.content,
					id: postData.id,
					source: postData.source,
					title: postData.title,
					url: postData.url,
					votes: postData.votes || 0,
				});
				console.log(`  ✅ Stored: ${postData.title}`);
			} else {
				console.log(`  ⏭️  Skipped (exists): ${postData.title}`);
			}
		} catch (error) {
			console.error(`  ❌ Failed to store ${postData.title}:`, error);
		}
	}

	console.log();
}

async function testCronjob() {
	// 1. Fetch posts from all services
	const allPosts = await fetchAllPosts();

	if (allPosts.length === 0) {
		console.log("⚠️  No posts fetched. Check your API tokens.");
		return {
			errors: [],
			failed: 0,
			sent: 0,
		};
	}

	// 2. Store posts in database
	await storePostsInDatabase(allPosts);

	// 3. Fetch all opted-in users with phones
	const users = await db
		.select({ id: user.id, name: user.name, phone: user.phone })
		.from(user)
		.where(and(isNotNull(user.phone), eq(user.whatsappOptIn, true)));

	console.log(`👥 Found ${users.length} opted-in users with phone numbers\n`);

	if (users.length === 0) {
		console.log("⚠️  No users to send to.");
		return {
			errors: [],
			failed: 0,
			sent: 0,
		};
	}

	const results = {
		errors: [] as Array<{ userId: string; error: string; postTitle?: string }>,
		failed: 0,
		sent: 0,
	};

	// 4. Send filtered posts to each user
	for (const recipient of users) {
		console.log(
			`\n📤 Processing user: ${recipient.name || "Unknown"} (${recipient.phone})`,
		);

		try {
			// Filter posts based on user preferences
			const filteredPosts = await filterPostsForUser(recipient.id, allPosts);

			console.log(`  → ${filteredPosts.length} posts after filtering`);

			if (filteredPosts.length === 0) {
				console.log("  ⚠️  No posts to send (all filtered out)");
				continue;
			}

			// Send each post
			for (const postData of filteredPosts) {
				try {
					console.log(`  📨 Sending: ${postData.title}`);

					const result = await sendPostToUser(recipient.phone!, postData);

					if (result.success) {
						results.sent++;
						console.log(`    ✅ Sent successfully (ID: ${result.messageId})`);
					} else {
						results.failed++;
						results.errors.push({
							error: "Send failed",
							postTitle: postData.title,
							userId: recipient.id,
						});
						console.log("    ❌ Failed to send");
					}

					// Rate limiting: 1 message per second
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} catch (error) {
					results.failed++;
					results.errors.push({
						error: error instanceof Error ? error.message : "Unknown error",
						postTitle: postData.title,
						userId: recipient.id,
					});

					console.log(
						`    ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
		} catch (error) {
			results.failed++;
			results.errors.push({
				error: error instanceof Error ? error.message : "Unknown error",
				userId: recipient.id,
			});

			console.log(
				`  ❌ Failed for user: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	return results;
}

console.log("🚀 Testing cronjob with real service data...\n");
console.log("=".repeat(60));
console.log();

try {
	const results = await testCronjob();

	console.log("\n" + "=".repeat(60));
	console.log("✅ Test completed!");
	console.log("=".repeat(60));
	console.log(`📊 Messages sent: ${results.sent}`);
	console.log(`❌ Messages failed: ${results.failed}`);

	if (results.errors.length > 0) {
		console.log(`\n⚠️  Errors (${results.errors.length}):`);
		for (const err of results.errors) {
			const postInfo = err.postTitle ? ` - Post: ${err.postTitle}` : "";
			console.log(`  • User ${err.userId}${postInfo}: ${err.error}`);
		}
	}

	process.exit(0);
} catch (error) {
	console.error("\n❌ Test failed:");
	console.error(error);
	process.exit(1);
}
