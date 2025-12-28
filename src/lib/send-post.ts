import "server-only";
import { sendButtonMessage } from "./kapso.ts";

export interface PostData {
	id: string; // External ID like "ph_374983", "gh_12345", "r_abc123"
	source: string; // "product_hunt" | "github" | "reddit"
	title: string;
	content: string;
	url: string;
	votes?: number;
	media?: string[];
}

export async function sendPostToUser(
	phoneNumber: string,
	post: PostData,
): Promise<{ messageId?: string; success: boolean }> {
	try {
		const sourceEmoji =
			{
				github: "💻",
				hackernews: "📰",
				product_hunt: "🚀",
				reddit: "🤖",
			}[post.source] || "📰";

		const sourceName = formatSourceName(post.source);
		const header = `${sourceEmoji} ${sourceName}`;

		// Truncate content if too long (WhatsApp has limits)
		const maxContentLength = 800;
		const truncatedContent =
			post.content.length > maxContentLength
				? `${post.content.slice(0, maxContentLength)}...`
				: post.content;

		const body = `*${post.title}*\n\n${truncatedContent}\n\n🔗 ${post.url}`;

		const footer = post.votes ? `${post.votes} votes` : undefined;

		// Button IDs encode the action and post ID
		const buttons = [
			{ id: `like:${post.id}`, title: "👍 Like" },
			{ id: `dislike:${post.id}`, title: "👎 Dislike" },
		];

		const response = await sendButtonMessage(
			phoneNumber,
			body,
			buttons,
			header,
			footer,
		);

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

function formatSourceName(source: string): string {
	const sourceNames: Record<string, string> = {
		github: "GitHub",
		hackernews: "Hacker News",
		product_hunt: "Product Hunt",
		reddit: "Reddit",
	};

	return sourceNames[source] || source;
}
