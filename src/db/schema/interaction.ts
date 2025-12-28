import {
	boolean,
	index,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { post } from "./post.ts";
import { schema } from "./schema.ts";

export const interaction = schema.table(
	"interaction",
	{
		createdAt: timestamp("created_at").notNull().defaultNow(),
		id: uuid("id").primaryKey().defaultRandom(),
		liked: boolean("liked").notNull(), // true = 👍, false = 👎
		postId: text("post_id")
			.notNull()
			.references(() => post.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => ({
		// Prevent duplicate votes on same post
		uniqueUserPost: uniqueIndex("interaction_user_post_idx").on(
			table.userId,
			table.postId,
		),
		// Fast lookup of user's recent interactions
		userCreatedAtIdx: index("interaction_user_created_at_idx").on(
			table.userId,
			table.createdAt,
		),
	}),
);
