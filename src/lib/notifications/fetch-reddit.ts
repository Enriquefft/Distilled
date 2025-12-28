import "server-only";
import type { PostData } from "@/lib/send-post.ts";

export async function fetchRedditPosts(): Promise<PostData[]> {
	try {
		// Reddit JSON API - no auth needed for public endpoints
		const subreddits = ["programming", "webdev", "javascript"];
		const posts: PostData[] = [];

		for (const subreddit of subreddits) {
			try {
				const response = await fetch(
					`https://www.reddit.com/r/${subreddit}/hot.json?limit=3`,
					{
						headers: {
							"User-Agent": "Distilled-App/1.0",
						},
					},
				);

				if (!response.ok) {
					console.warn(
						`[Reddit] Failed to fetch r/${subreddit}: ${response.status}`,
					);
					continue;
				}

				const data = await response.json();

				for (const child of data.data.children) {
					const p = child.data;

					// Skip stickied posts, ads, and removed posts
					if (p.stickied || p.promoted || p.removed) continue;

					// Get content - prefer selftext, fallback to title
					const content =
						p.selftext && p.selftext.length > 0
							? p.selftext.slice(0, 300)
							: p.title;

					posts.push({
						content,
						id: `r_${p.id}`,
						source: "reddit",
						title: `r/${subreddit}: ${p.title}`,
						url: `https://reddit.com${p.permalink}`,
						votes: p.ups,
					});
				}
			} catch (subError) {
				console.warn(`[Reddit] Error fetching r/${subreddit}:`, subError);
			}
		}

		return posts.slice(0, 5);
	} catch (error) {
		console.error("[Reddit] Failed to fetch posts:", error);
		return [];
	}
}
