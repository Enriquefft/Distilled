import { index, text, timestamp } from "drizzle-orm/pg-core";
import { schema } from "./schema.ts";

export const post = schema.table(
	"post",
	{
		createdAt: timestamp("created_at").notNull().defaultNow(),
		id: text("id").primaryKey(), // External ID like "ph_374983", "gh_12345", "r_abc123"
		source: text("source").notNull(), // "product_hunt" | "github" | "reddit"
		title: text("title").notNull(),
		url: text("url").notNull(),
	},
	(table) => ({
		// Index for looking up posts by source
		sourceIdx: index("post_source_idx").on(table.source),
	}),
);
