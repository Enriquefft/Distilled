import { PostHog } from "posthog-node";
import { clientEnv } from "@/env/client.ts";

export default function PostHogClient() {
	const posthogKey = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
	if (!posthogKey) {
		throw new Error("PostHog key not configured");
	}
	const posthogClient = new PostHog(posthogKey, {
		flushAt: 1,
		flushInterval: 0,
		host: "https://us.i.posthog.com",
	});
	return posthogClient;
}
