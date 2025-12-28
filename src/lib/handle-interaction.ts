import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { interaction, post, user } from "@/db/schema";

export async function handleInteractiveResponse(
	phoneNumber: string,
	buttonId: string,
): Promise<void> {
	try {
		// Parse button ID: "like:ph_374983" -> {action: "like", postId: "ph_374983"}
		const [action, postId] = buttonId.split(":");

		if (!action || !postId || !["like", "dislike"].includes(action)) {
			console.warn(`[Interaction] Invalid button ID format: ${buttonId}`);
			return;
		}

		const liked = action === "like";

		// Find user by phone number
		const [foundUser] = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.phone, phoneNumber))
			.limit(1);

		if (!foundUser) {
			console.error(`[Interaction] User not found for phone: ${phoneNumber}`);
			return;
		}

		// Verify post exists
		const [foundPost] = await db
			.select({ id: post.id })
			.from(post)
			.where(eq(post.id, postId))
			.limit(1);

		if (!foundPost) {
			console.error(`[Interaction] Post not found: ${postId}`);
			return;
		}

		// Upsert interaction (handles duplicate clicks - last click wins)
		await db
			.insert(interaction)
			.values({
				liked,
				postId,
				userId: foundUser.id,
			})
			.onConflictDoUpdate({
				set: {
					createdAt: new Date(),
					liked,
				},
				target: [interaction.userId, interaction.postId],
			});

		console.log(
			`[Interaction] Recorded: User ${foundUser.id} ${action}d post ${postId}`,
		);
	} catch (error) {
		console.error("[Interaction] Error handling interaction:", error);
		// Don't throw - we don't want to fail the polling job
	}
}
