import "server-only";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { interaction, post } from "@/db/schema";
import type { PostData } from "./send-post.ts";

interface SourcePreference {
	source: string;
	likes: number;
	dislikes: number;
	score: number;
}

const INTERACTION_THRESHOLD = 5; // Minimum interactions before filtering
const FILTER_THRESHOLD = -0.2; // Score below this = filter out source

export async function filterPostsForUser(
	userId: string,
	posts: PostData[],
): Promise<PostData[]> {
	// Get user's interaction count
	const [result] = await db
		.select({ count: count() })
		.from(interaction)
		.where(eq(interaction.userId, userId));

	const totalInteractions = result?.count ?? 0;

	// If below threshold, send all posts (learning phase)
	if (totalInteractions < INTERACTION_THRESHOLD) {
		console.log(
			`[Filter] User ${userId}: Learning phase (${totalInteractions}/${INTERACTION_THRESHOLD} interactions)`,
		);
		return posts;
	}

	// Calculate preferences by source
	const preferences = await calculateSourcePreferences(userId);

	// Filter out sources with low scores
	const allowedSources = new Set(
		preferences
			.filter((pref) => pref.score >= FILTER_THRESHOLD)
			.map((pref) => pref.source),
	);

	// Also allow sources with no interactions yet (neutral)
	const interactedSources = new Set(preferences.map((pref) => pref.source));
	const filteredPosts = posts.filter(
		(post) =>
			allowedSources.has(post.source) || !interactedSources.has(post.source),
	);

	console.log(
		`[Filter] User ${userId}: Filtered ${posts.length} → ${filteredPosts.length} posts`,
		{
			allowedSources: Array.from(allowedSources),
			preferences,
		},
	);

	return filteredPosts;
}

async function calculateSourcePreferences(
	userId: string,
): Promise<SourcePreference[]> {
	// Aggregate likes/dislikes by source
	const results = await db
		.select({
			dislikes: sql<number>`count(*) filter (where ${interaction.liked} = false)`,
			likes: sql<number>`count(*) filter (where ${interaction.liked} = true)`,
			source: post.source,
		})
		.from(interaction)
		.innerJoin(post, eq(interaction.postId, post.id))
		.where(eq(interaction.userId, userId))
		.groupBy(post.source);

	return results.map((row) => {
		const likes = Number(row.likes);
		const dislikes = Number(row.dislikes);
		const total = likes + dislikes;
		const score = total > 0 ? (likes - dislikes) / total : 0;

		return {
			dislikes,
			likes,
			score,
			source: row.source,
		};
	});
}

// Helper function for testing
export function calculateScore(likes: number, dislikes: number): number {
	const total = likes + dislikes;
	return total > 0 ? (likes - dislikes) / total : 0;
}
