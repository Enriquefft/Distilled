# Quickstart Guide: Distilled Platform Setup

**Feature**: Template Initialization
**Last Updated**: 2025-12-28
**Related Docs**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## Overview

This guide walks you through setting up the Distilled platform after template initialization. Follow these steps to configure all required integrations and verify your development environment.

## Prerequisites

Before starting, ensure you have:

- ✅ Bun installed (v1.0.0+)
- ✅ PostgreSQL database (Neon recommended)
- ✅ Google Cloud Console account (for OAuth)
- ✅ Meta Developer account (for WhatsApp/Kapso)
- ✅ PostHog account (optional, for analytics)
- ✅ Git repository cloned and on `000-template-init` branch

## Step 1: Environment Configuration

### 1.1 Copy Environment Template

```bash
cp .env.example .env
```

### 1.2 Configure Database URLs

**For Development**:

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/distilled
DATABASE_URL_DEV=postgresql://user:password@localhost:5432/distilled_dev
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/distilled_test
```

**For Neon (Recommended)**:

1. Create account at [neon.tech](https://neon.tech)
2. Create new project named "Distilled"
3. Copy connection string
4. Create separate databases for dev and test:

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/distilled?sslmode=require
DATABASE_URL_DEV=postgresql://user:password@ep-xxx.neon.tech/distilled_dev?sslmode=require
DATABASE_URL_TEST=postgresql://user:password@ep-xxx.neon.tech/distilled_test?sslmode=require
```

### 1.3 Configure Project Identity

```bash
# .env
NEXT_PUBLIC_PROJECT_NAME=distilled
```

### 1.4 Generate Auth Secret

```bash
bun run auth:secret
```

Copy the output to your `.env`:

```bash
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:3000
```

---

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Distilled"
3. Enable "Google+ API" (or "Google Identity API")

### 2.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in application details:
   - App name: **Distilled**
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 2.3 Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **Distilled Web**
5. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-domain>/api/auth/callback/google`
6. Click **Create**
7. Copy Client ID and Client Secret

### 2.4 Add to Environment

```bash
# .env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

---

## Step 3: Kapso WhatsApp Setup

### 3.1 Create Meta Business App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create new app: **Type: Business**
3. App name: **Distilled**
4. Contact email: Your email

### 3.2 Add WhatsApp Product

1. In app dashboard, click **Add Product**
2. Find **WhatsApp** → **Set Up**
3. Select **Business Account** or create new one

### 3.3 Get Phone Number & Credentials

1. Navigate to **WhatsApp** → **Getting Started**
2. Copy:
   - **Phone Number ID**: Find in "From" section
   - **WhatsApp Business Account ID**: Find in settings
   - **Access Token**: Click "Generate" (temporary) or create permanent token

### 3.4 Create Permanent Access Token

1. Navigate to **System Users** in Business Settings
2. Create new system user
3. Assign to WhatsApp app
4. Generate access token with permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Copy token (save securely - shown only once)

### 3.5 Get App Secret

1. Navigate to **Settings** → **Basic**
2. Copy **App Secret** (click "Show")

### 3.6 Add to Environment

```bash
# .env
KAPSO_ACCOUNT_ID=<whatsapp-business-account-id>
KAPSO_PHONE_NUMBER_ID=<phone-number-id>
KAPSO_WHATSAPP_TOKEN=<permanent-access-token>
META_APP_SECRET=<app-secret>
KAPSO_WEBHOOK_URL=https://<your-domain>/api/whatsapp/webhook
```

**Note**: For local development, use ngrok or similar tunneling service for webhook URL:

```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start tunnel
ngrok http 3000

# Copy HTTPS URL to KAPSO_WEBHOOK_URL
KAPSO_WEBHOOK_URL=https://abc123.ngrok.io/api/whatsapp/webhook
```

### 3.7 Configure Webhook in Meta Console

1. Navigate to **WhatsApp** → **Configuration**
2. Edit webhook settings:
   - **Callback URL**: Your `KAPSO_WEBHOOK_URL`
   - **Verify Token**: Your `META_APP_SECRET`
3. Subscribe to fields:
   - ✅ messages
   - ✅ message_status
4. Click **Verify and Save**

---

## Step 4: PostHog Analytics Setup (Optional)

### 4.1 Create PostHog Account

1. Go to [app.posthog.com](https://app.posthog.com) (or self-hosted instance)
2. Create new account
3. Create new project: **Distilled**

### 4.2 Get Project API Key

1. Navigate to **Project Settings**
2. Copy **Project API Key**
3. Copy **Instance URL** (default: `https://app.posthog.com`)

### 4.3 Add to Environment

```bash
# .env
NEXT_PUBLIC_POSTHOG_KEY=phc_<your-project-key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**To Skip Analytics**: Remove these variables and PostHog will be disabled.

---

## Step 5: Database Initialization

### 5.1 Install Dependencies

```bash
bun install
```

### 5.2 Push Database Schema

**Development** (use for local dev only):

```bash
bun run db:push
```

**Production** (generate migrations):

```bash
bun run db:generate
bun run db:migrate
```

### 5.3 Verify Database Tables

```bash
bun run db:studio
```

Open Drizzle Studio at `https://local.drizzle.studio`. Verify tables:

- ✅ `distilled_user`
- ✅ `distilled_session`
- ✅ `distilled_account`
- ✅ `distilled_verification`

**Note**: Tables are prefixed with `NEXT_PUBLIC_PROJECT_NAME` (distilled).

---

## Step 6: Development Server

### 6.1 Start Dev Server

```bash
bun dev
```

Server runs at `http://localhost:3000`

### 6.2 Verify Authentication

1. Navigate to sign-up page
2. Test email/password registration
3. Test Google OAuth sign-in
4. Verify session persistence (refresh page)
5. Test sign-out

---

## Step 7: Testing

### 7.1 Run Unit Tests

```bash
bun test
```

Expected: All tests pass (or only expected failures documented)

### 7.2 Run E2E Tests

```bash
bun run test:e2e
```

**Note**: E2E tests require dev server to be stopped. Script handles this automatically.

### 7.3 Type Checking

```bash
bun type
```

Expected: 0 errors

### 7.4 Linting

```bash
bun lint
```

Expected: No errors (auto-fix applied)

### 7.5 Production Build

```bash
bun run build
```

Expected: Build succeeds without errors

---

## Step 8: Verification Checklist

Run through this checklist to ensure template initialization is complete:

### Configuration

- [ ] `package.json` name is "distilled"
- [ ] `README.md` title is "Distilled"
- [ ] `src/metadata.ts` contains Distilled branding
- [ ] `.env` has all required variables set
- [ ] `.env.example` documents only kept integrations

### Integrations Removed

- [ ] No references to Polar in source code: `grep -ri "polar" src/ | grep -v "TEMPLATE_CHECKLIST"`
- [ ] No references to Google Places: `grep -ri "google.*place" src/`
- [ ] `src/lib/polar.ts` deleted
- [ ] `src/hooks/use-google-places.tsx` deleted
- [ ] `src/components/AddressAutocomplete.tsx` deleted

### Integrations Working

- [ ] Better Auth: Email/password sign-up works
- [ ] Better Auth: Google OAuth sign-in works
- [ ] Kapso: Webhook URL configured in Meta Console
- [ ] PostHog: Analytics events tracked (optional)

### Database

- [ ] Only auth tables exist (user, session, account, verification)
- [ ] `src/db/schema/post.ts` deleted
- [ ] Schema index updated (no post export)

### Example Code Removed

- [ ] `src/components/ProductCard.tsx` deleted
- [ ] `src/components/form-example.tsx` deleted

### Tests & Build

- [ ] `bun test` passes
- [ ] `bun run test:e2e` passes
- [ ] `bun run build` succeeds
- [ ] `bun type` has 0 errors
- [ ] `bun lint` passes

---

## Step 9: Deployment (Optional)

### 9.1 Vercel Deployment

1. Install Vercel CLI:

```bash
bun add -g vercel
```

2. Login and deploy:

```bash
vercel login
vercel
```

3. Set environment variables in Vercel dashboard:
   - All variables from `.env` (except `*_DEV`, `*_TEST`)
   - Update `BETTER_AUTH_URL` to production domain
   - Update `KAPSO_WEBHOOK_URL` to production domain

4. Update webhook in Meta Console with production URL

### 9.2 Environment Variable Deployment Scripts

**Quick setup** (uses deployment scripts):

```bash
# GitHub Secrets (for CI/CD)
bun run deploy:github

# Vercel Environment Variables
bun run deploy:vercel
```

Follow prompts to configure each integration.

---

## Troubleshooting

### Database Connection Errors

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:
- Verify `DATABASE_URL` is correct
- For Neon: Ensure `?sslmode=require` is appended
- Check database exists: `psql <DATABASE_URL> -c "\l"`

### Google OAuth Error: "redirect_uri_mismatch"

**Solution**:
- Verify redirect URI in Google Console matches exactly:
  - Dev: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://<your-domain>/api/auth/callback/google`
- Note: NO trailing slash

### WhatsApp Webhook Verification Failed

**Solution**:
- Verify `META_APP_SECRET` matches App Secret in Meta Console
- For local dev: Ensure ngrok tunnel is active
- Check webhook URL is HTTPS (HTTP not allowed)
- Verify webhook route exists: `src/app/api/whatsapp/webhook/route.ts`

### PostHog Not Tracking Events

**Solution**:
- Verify `NEXT_PUBLIC_POSTHOG_KEY` starts with `phc_`
- Check browser console for PostHog errors
- Verify PostHog provider is in layout: `src/app/[locale]/layout.tsx`
- Check adblocker isn't blocking PostHog

### Build Fails: "Module not found"

**Solution**:
- Run `bun install` to ensure dependencies are installed
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `bun run build`

---

## Next Steps

After completing this quickstart:

1. **Verify template initialization is complete** using the checklist above
2. **Commit changes**:

```bash
git add .
git commit -m "feat: initialize Distilled platform template

- Configure project identity (package.json, metadata, README)
- Remove unused integrations (Polar, Google Places)
- Clean up example code and schemas
- Update environment configuration
- Verify all tests and builds pass

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

3. **Create pull request**:

```bash
git push origin 000-template-init
```

Then create PR: `000-template-init` → `main`

4. **Begin feature development**:

After merging template initialization, you can start building Distilled features:

```bash
# Create new feature
/speckit.specify "Add WhatsApp verification for user phone numbers"

# Or use the spec for the full Distilled platform (from PRD)
/speckit.specify "Implement news aggregation from Product Hunt, GitHub, and Reddit"
```

---

## Support & Resources

- **Better Auth Docs**: https://www.better-auth.com/docs
- **Kapso Docs**: https://docs.kapso.ai
- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team
- **PostHog Docs**: https://posthog.com/docs
- **TEMPLATE_CHECKLIST.md**: Reference for template customization

For issues or questions, refer to `CLAUDE.md` for project-specific guidance.
