import type { nextrequest } from "next/server";
import { nextresponse } from "next/server";
import { serverenv } from "@/env/server";
import { geterrormessage } from "@/lib/handle-error.ts";
import { derivedatafromproducthunt } from "@/lib/kapso.ts";

/**
 * vercel cron job:product hunt data send
 * runs daily at 3 am utc (after trial management job)
 * schedule: "0 3 * * *"
 *
 * tasks performed:
 * 1. refresh tokens expiring within 7 days
 * 2. send expiration reminder emails (7 days before)
 * 3. send failure notifications when refresh fails
 * 4. re-validate credentials that previously had errors
 */
export async function get(request: nextrequest) {
    console.log("[cronjob] triggered");

    // verify authorization to prevent unauthorized calls
    const authheader = request.headers.get("authorization");
    const expectedauth = `bearer ${env.cron_secret}`;

    if (authheader !== expectedauth) {
        console.warn("[cron] unauthorized cronjob secret");
        return nextresponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
        // product hunt data
        const sample_data = {
            content:
                "better auth is an open-source, self-hosted user authentication and management solution that simplifies adding secure auth to any application.",
            media: [
                "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=374983&theme=light",
                "https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=374983&theme=light",
            ],
            post_link: "https://www.producthunt.com/posts/better-auth",
            post_votes: 420,
            title: "better auth",
        };

        await derivedatafromproducthunt(sample_data);

        return nextresponse.json(response, { status: 500 });
    } catch (error) {
        const errormessage = geterrormessage(error);
        console.error("[cron] mp token refresh exception:", errormessage);

        return nextresponse.json(
            {
                error: "internal server error",
                message: errormessage,
                timestamp: new date().toisostring(),
            },
            { status: 500 },
        );
    }
}

// prevent route from being statically generated
export const dynamic = "force-dynamic";
