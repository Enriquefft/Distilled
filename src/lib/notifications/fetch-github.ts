import "server-only";
import { serverEnv } from "@/env/server";
import type { PostData } from "@/lib/send-post.ts";

// Using unofficial but reliable GitHub trending API
const GITHUB_TRENDING_API = "https://api.gitterapp.com/repositories";

export async function fetchGitHubTrendingRepos(): Promise<PostData[]> {
	try {
		// If GH_TOKEN is available, use official API for better reliability
		if (serverEnv.GH_TOKEN) {
			return await fetchGitHubTrendingOfficial(serverEnv.GH_TOKEN);
		}

		// Fallback to third-party trending API (no auth required)
		const response = await fetch(`${GITHUB_TRENDING_API}?since=daily`, {
			headers: {
				"User-Agent": "Distilled-App",
			},
		});

		if (!response.ok) {
			throw new Error(`GitHub trending API error: ${response.status}`);
		}

		const repos = await response.json();

		return repos.slice(0, 5).map((repo: any) => ({
			content:
				repo.description ||
				`⭐ ${repo.stars} stars • ${repo.language || "Unknown language"}`,
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

// Official GitHub GraphQL API (requires GH_TOKEN)
async function fetchGitHubTrendingOfficial(token: string): Promise<PostData[]> {
	try {
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
				Authorization: `Bearer ${token}`,
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

		return data.data.search.nodes
			.slice(0, 5)
			.map(
				(repo: {
					owner: { login: string };
					name: string;
					description: string | null;
					url: string;
					stargazerCount: number;
				}) => ({
					content: repo.description || "No description available",
					id: `gh_${repo.owner.login}_${repo.name}`.replace(
						/[^a-zA-Z0-9_]/g,
						"_",
					),
					source: "github",
					title: `${repo.owner.login}/${repo.name}`,
					url: repo.url,
					votes: repo.stargazerCount,
				}),
			);
	} catch (error) {
		console.error("[GitHub] Official API failed:", error);
		throw error;
	}
}
