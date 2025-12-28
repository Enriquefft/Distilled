import "server-only";
import type { PostData } from "@/lib/send-post.ts";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

interface HNItem {
	id: number;
	title: string;
	url?: string;
	text?: string;
	score: number;
	by: string;
	time: number;
	descendants?: number;
}

async function fetchItem(id: number): Promise<HNItem> {
	const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
	if (!response.ok) {
		throw new Error(`Failed to fetch HN item ${id}`);
	}
	return response.json();
}

export async function fetchHackerNewsPosts(): Promise<PostData[]> {
	try {
		// Get top story IDs
		const topStoriesResponse = await fetch(`${HN_API_BASE}/topstories.json`);
		if (!topStoriesResponse.ok) {
			throw new Error("Failed to fetch HN top stories");
		}

		const topIds: number[] = await topStoriesResponse.json();

		// Fetch details for top 10 stories in parallel
		const items = await Promise.all(topIds.slice(0, 10).map(fetchItem));

		return items.slice(0, 5).map((item) => ({
			content:
				item.text || `${item.score} points • ${item.descendants ?? 0} comments`,
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
