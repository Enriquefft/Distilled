import "server-only";
import { serverEnv } from "@/env/server";
import type { PostData } from "@/lib/send-post.ts";

const PH_GRAPHQL_API = "https://api.producthunt.com/v2/api/graphql";

export async function fetchProductHuntPosts(): Promise<PostData[]> {
	try {
		// Check if token is available
		if (!serverEnv.PRODUCTHUNT_TOKEN) {
			console.warn(
				"[Product Hunt] PRODUCTHUNT_TOKEN not configured - skipping",
			);
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
						thumbnail {
							url
						}
						makers {
							name
						}
					}
				}
			}
		`;

		const response = await fetch(PH_GRAPHQL_API, {
			body: JSON.stringify({
				query,
				variables: { limit: 10 },
			}),
			headers: {
				Authorization: `Bearer ${serverEnv.PRODUCTHUNT_TOKEN}`,
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
