/**
 * Script to create WhatsApp message template via Kapso API
 * Usage: bun scripts/create-template.ts
 */

const KAPSO_API_KEY = process.env["KAPSO_API_KEY"];
const BUSINESS_ACCOUNT_ID = process.env["WHATSAPP_BUSINESS_ACCOUNT_ID"]; // Get from Kapso dashboard

if (!KAPSO_API_KEY || !BUSINESS_ACCOUNT_ID) {
    console.error("❌ Missing required environment variables:");
    console.error("  KAPSO_API_KEY:", KAPSO_API_KEY ? "✓" : "✗");
    console.error(
        "  WHATSAPP_BUSINESS_ACCOUNT_ID:",
        BUSINESS_ACCOUNT_ID ? "✓" : "✗",
    );
    console.log(
        "\nGet your Business Account ID from: https://app.kapso.ai → Connected numbers",
    );
    process.exit(1);
}

// Template definition
const template = {
    category: "MARKETING",
    components: [
        {
            example: {
                body_text: [
                    ["Better Auth"], // {{1}} - title
                    [
                        "An open-source authentication solution that simplifies secure auth.",
                    ], // {{2}} - content
                    ["420"], // {{3}} - votes
                    ["https://www.producthunt.com/posts/better-auth"], // {{4}} - link
                ],
            },
            text: `🚀 *Daily Tech Digest*

📌 *{{1}}*
{{2}}

👍 {{3}} votes

🔗 {{4}}

---
Powered by Distilled`,
            type: "BODY",
        },
    ],
    language: "en_US",
    name: "daily_tech_digest",
    parameter_format: "POSITIONAL", // Use {{1}}, {{2}}, etc.
};

console.log("🚀 Creating WhatsApp template...\n");
console.log("Template details:");
console.log(JSON.stringify(template, null, 2));
console.log();

try {
    const response = await fetch(
        `https://api.kapso.ai/meta/whatsapp/v24.0/${BUSINESS_ACCOUNT_ID}/message_templates`,
        {
            body: JSON.stringify(template),
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": KAPSO_API_KEY,
            },
            method: "POST",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("❌ Failed to create template:");
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
    }

    console.log("✅ Template created successfully!");
    console.log(JSON.stringify(data, null, 2));
    console.log();
    console.log("⏳ Template status: PENDING");
    console.log("⏳ Waiting for WhatsApp approval (usually 24-48 hours)");
    console.log();
    console.log("Next steps:");
    console.log("1. Wait for approval email from Meta");
    console.log("2. Update code with template name: 'daily_tech_digest'");
    console.log("3. Test with: bun scripts/test-cronjob.ts");

    process.exit(0);
} catch (error) {
    console.error("\n❌ Error creating template:");
    console.error(error);
    process.exit(1);
}
