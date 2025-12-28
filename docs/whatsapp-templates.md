# WhatsApp Message Templates Guide

## Why Templates Are Required

WhatsApp requires **pre-approved Message Templates** for messages sent outside the 24-hour customer service window. This prevents spam and ensures quality.

## Prerequisites

1. **Kapso Account**: Sign up at [app.kapso.ai](https://app.kapso.ai)
2. **WhatsApp Business Account**: Connect your WhatsApp number in Kapso dashboard
3. **Business Account ID**: Copy from Kapso dashboard → Connected numbers

## Option 1: Create Template via Kapso API (Recommended)

### Step 1: Get Your Business Account ID

1. Login to [app.kapso.ai](https://app.kapso.ai)
2. Go to **Connected numbers**
3. Copy your **WhatsApp Business Account ID**
4. Add to `.env`:
   ```bash
   WHATSAPP_BUSINESS_ACCOUNT_ID='your-account-id-here'
   ```

### Step 2: Create Template

Run the script:

```bash
bun scripts/create-template.ts
```

This will:
- Create a `daily_tech_digest` template with 4 parameters
- Submit it to WhatsApp for approval
- Show status: PENDING

### Step 3: Wait for Approval

- Meta reviews templates within 24-48 hours
- You'll receive an email when approved
- Check status in [Meta Business Manager](https://business.facebook.com/latest/whatsapp_manager)

## Option 2: Create Template in Meta Business Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Navigate to **WhatsApp Manager** → **Message Templates**
3. Click **Create Template**

### Template Configuration

**Option 1: Simple Template (No Variables)**

```
Template Name: hello_world
Category: UTILITY
Language: English (US)
Body: Hello! This is a test message from Distilled.
```

**Option 2: Template with Variables (Recommended for Daily Digest)**

```
Template Name: daily_tech_digest
Category: MARKETING
Language: English (US)

Body:
🚀 *Daily Tech Digest*

📌 {{1}}
{{2}}

👍 {{3}} votes

🔗 {{4}}

---
Powered by Distilled
```

Variables:
- `{{1}}` = Product title (e.g., "better auth")
- `{{2}}` = Product description
- `{{3}}` = Vote count
- `{{4}}` = Product Hunt link

4. Submit for review (Meta typically approves within 24-48 hours)

## Step 2: Update Your Code

### For Simple Template (hello_world)

The code is already configured! Just run:

```bash
bun scripts/test-cronjob.ts
```

### For Template with Variables

Update `scripts/test-cronjob.ts` and `src/lib/notifications/send-digest.ts`:

```typescript
const response = await sendTemplateMessage(
  recipient.phone!,
  "daily_tech_digest", // Your template name
  "en_US",
  [
    {
      type: "body",
      parameters: [
        { type: "text", text: newsData.title },
        { type: "text", text: newsData.content },
        { type: "text", text: newsData.post_votes.toString() },
        { type: "text", text: newsData.post_link },
      ],
    },
  ],
);
```

## Step 3: Testing

### Test with the script:

```bash
bun scripts/test-cronjob.ts
```

### Expected Output:

```
Found 1 opted-in users with phone numbers

Sending to Enrique Flores (+51926689401)...
  ✅ Sent successfully
```

## Common Template Examples

### 1. Welcome Message

```
Name: welcome_message
Category: UTILITY
Body: Welcome to Distilled! We'll send you daily tech digests every morning.
```

### 2. Notification with Button

```
Name: post_notification
Category: MARKETING
Body:
New trending post: {{1}}
{{2}}

[View Post Button]
```

### 3. Order Confirmation

```
Name: order_confirmation
Category: TRANSACTIONAL
Body:
Order Confirmed! 🎉
Order ID: {{1}}
Total: {{2}}

Thank you for your purchase!
```

## Troubleshooting

### Error: "Template not found"
- Wait 24-48 hours for Meta approval
- Check template name matches exactly (case-sensitive)
- Verify template is approved in Meta Business Manager

### Error: "Invalid parameters"
- Number of parameters must match template variables
- Parameter type must be "text" for text variables
- Parameters are in correct order

### Error: "Template status is PENDING"
- Template is still under review by Meta
- Use `hello_world` template for testing (auto-approved)

## Advanced: Multiple Languages

```typescript
// Send in Spanish
await sendTemplateMessage(
  recipient.phone!,
  "daily_tech_digest",
  "es", // Spanish
  components,
);

// Send in Portuguese
await sendTemplateMessage(
  recipient.phone!,
  "daily_tech_digest",
  "pt_BR", // Brazilian Portuguese
  components,
);
```

## Next Steps

1. ✅ Created template in Meta Business Manager
2. ✅ Updated code with template name
3. ✅ Tested with `bun scripts/test-cronjob.ts`
4. 🔄 Wait for approval (if needed)
5. 🚀 Deploy to production

## Resources

- [Meta WhatsApp Templates Documentation](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Template Best Practices](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [Kapso Documentation](https://docs.kapso.ai)
