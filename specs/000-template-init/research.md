# Research: Template Initialization for Distilled Platform

**Date**: 2025-12-28
**Feature**: Template customization and setup for Distilled platform
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This research document consolidates the findings from analyzing the Next.js template codebase to determine which integrations to keep, which to remove, and the complete file change checklist for template initialization.

## Integration Inventory & Decisions

### 1. Better Auth (Authentication) - **KEEP**

**Decision**: Keep with email/password and Google OAuth

**Rationale**:
- Required for user authentication in Distilled platform
- Already configured with PostgreSQL session storage
- Supports email/password + Google OAuth (sufficient for MVP)
- Well-integrated with Next.js App Router and server actions

**Configuration Required**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Ensure `BETTER_AUTH_SECRET` is generated (via `bun run auth:secret`)
- Confirm `BETTER_AUTH_URL` matches deployment URL

**Files to Keep**:
- `src/lib/auth.ts` - Better Auth configuration
- `src/lib/auth-client.ts` - Client-side auth utilities
- `src/auth.ts` - Auth exports
- `src/db/schema/auth.ts` - Auth database tables
- `src/components/sign-in.tsx` - Sign in component
- `src/components/sign-up.tsx` - Sign up component (if exists)
- `src/app/api/auth/` - Better Auth API routes
- Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

**Alternatives Considered**:
- NextAuth/Auth.js: Better Auth chosen for simpler setup and better TypeScript support
- Custom auth: Rejected due to security complexity and time investment

---

### 2. Kapso (WhatsApp Messaging) - **KEEP**

**Decision**: Keep for WhatsApp news delivery

**Rationale**:
- Core requirement for Distilled platform (WhatsApp news delivery)
- SDK already integrated (`@kapso/whatsapp-cloud-api`)
- Webhook route configured at `/api/whatsapp/webhook`
- Required for all user-facing news delivery features

**Configuration Required**:
- Set `KAPSO_ACCOUNT_ID` - Kapso account identifier
- Set `KAPSO_PHONE_NUMBER_ID` - WhatsApp business phone number ID
- Set `KAPSO_WHATSAPP_TOKEN` - WhatsApp API access token
- Set `META_APP_SECRET` - Meta app secret for webhook verification
- Set `KAPSO_WEBHOOK_URL` - Public webhook URL (e.g., `https://distilled.app/api/whatsapp/webhook`)

**Files to Keep**:
- `src/lib/kapso.ts` - Kapso SDK wrapper with `sendTextMessage` and `sendButtonMessage` functions
- `src/app/api/whatsapp/webhook/route.ts` - WhatsApp webhook handler
- Environment variables: `KAPSO_ACCOUNT_ID`, `KAPSO_PHONE_NUMBER_ID`, `KAPSO_WHATSAPP_TOKEN`, `META_APP_SECRET`, `KAPSO_WEBHOOK_URL`

**Webhook Configuration**:
- Webhook must be registered in Meta Developer Console
- URL: `https://<domain>/api/whatsapp/webhook`
- Verification: Uses `META_APP_SECRET`

**Alternatives Considered**:
- Twilio WhatsApp: Higher cost, more complex setup
- Direct Meta WhatsApp API: Kapso SDK provides better abstraction
- Other WhatsApp providers: Kapso chosen for simplicity and pricing

---

### 3. Polar (Payments) - **REMOVE**

**Decision**: Remove completely

**Rationale**:
- Not required for Distilled MVP (no payment features planned)
- Adds unnecessary dependency weight
- Can be added later if monetization features are needed

**Files to Remove**:
- `src/lib/polar.ts` - Polar SDK integration
- `src/app/api/polar/` - Polar webhook routes (if exists)

**Dependencies to Remove from package.json**:
- `@polar-sh/sdk`
- `@polar-sh/better-auth` (check if this is actually Polar-specific or just Better Auth)

**Environment Variables to Remove from .env.example**:
- `POLAR_ACCESS_TOKEN`
- `POLAR_MODE`

**Files to Update**:
- `src/env/server.ts` - Remove Polar environment variable validation
- `CLAUDE.md` - Remove Polar documentation section
- `README.md` - Remove Polar mentions
- `TEMPLATE_CHECKLIST.md` - Reference document (no changes needed)

**Import Search Results**: 19 files reference "polar" (mostly docs and test fixtures)

**Critical Files with Polar Imports**:
- `src/lib/polar.ts` - DELETE entire file
- `src/env/server.ts` - REMOVE Polar env validation
- `src/components/ProductCard.tsx` - CHECK if uses Polar, likely example component to remove anyway

**Alternatives Considered**: N/A (no payments needed for MVP)

---

### 4. Google Places (Address Autocomplete) - **REMOVE**

**Decision**: Remove completely

**Rationale**:
- Not required for Distilled platform (no address input functionality)
- Adds unnecessary Google Maps API dependency and costs
- Can be added later if address features are needed

**Files to Remove**:
- `src/hooks/use-google-places.tsx` - Google Places hook
- `src/components/AddressAutocomplete.tsx` - Address autocomplete component

**Dependencies to Remove from package.json**:
- `@react-google-maps/api` (unless used elsewhere - verify)

**Environment Variables to Remove from .env.example**:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

**Files to Update**:
- `src/env/client.ts` - Remove Google Maps API key validation
- `CLAUDE.md` - Remove Google Places documentation section
- `README.md` - Remove Google Places mentions (if any)

**Import Search Results**: 6 files reference "google.*place|googlemaps"

**Alternatives Considered**: N/A (no address functionality needed)

---

### 5. PostHog (Analytics) - **KEEP (Optional)**

**Decision**: Keep for MVP with option to remove later

**Rationale**:
- Useful for tracking user behavior and feature usage
- Lightweight and privacy-friendly analytics
- Can provide insights for news preference algorithm
- Helps measure success criteria (user engagement, satisfaction)
- Optional: Can be removed if user prefers no analytics

**Configuration Required**:
- Set `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- Set `NEXT_PUBLIC_POSTHOG_HOST` - PostHog instance URL (default: `https://app.posthog.com`)

**Files to Keep**:
- `src/lib/posthog.ts` - PostHog server-side client
- `src/components/PostHogProvider.tsx` - PostHog client provider
- `src/app/[locale]/layout.tsx` - Provider wrapper (keep PostHog import)
- Environment variables: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`

**Files to Update**:
- Keep PostHog sections in `CLAUDE.md` and `README.md`

**Import Search Results**: 17 files reference "posthog"

**If Removing PostHog** (user preference):
- Delete `src/lib/posthog.ts`
- Delete `src/components/PostHogProvider.tsx`
- Remove PostHog provider from `src/app/[locale]/layout.tsx`
- Remove `posthog-js` and `posthog-node` from `package.json`
- Remove `NEXT_PUBLIC_POSTHOG_*` from `.env.example`
- Update `src/env/client.ts` to remove PostHog validation

**Alternatives Considered**:
- Google Analytics: Privacy concerns, heavier setup
- Mixpanel: More expensive for scale
- No analytics: Limits ability to measure success criteria

---

## File Change Checklist

### Configuration Files - UPDATE

| File | Changes Required | Priority |
|------|-----------------|----------|
| `package.json` | Update `name` to "distilled", update `description`, update `repository.url`, update `bugs.url` | P1 |
| `.env` | Set `NEXT_PUBLIC_PROJECT_NAME=distilled`, remove unused integration vars | P1 |
| `.env.example` | Document kept integrations only (Better Auth, Kapso, PostHog optional), remove Polar, Google Maps | P1 |
| `README.md` | Update title to "Distilled", update description, update Quick Start section, remove Polar/Google Places mentions | P1 |
| `CLAUDE.md` | Remove Polar and Google Places sections, verify Better Auth and Kapso docs are correct | P2 |
| `src/metadata.ts` | Update `title`, `description`, `applicationName` to "Distilled" branding | P1 |
| `src/manifest.ts` | Update PWA `name`, `short_name`, `description` | P2 |

### Integration Code - REMOVE

| File/Directory | Action | Dependencies |
|----------------|--------|--------------|
| `src/lib/polar.ts` | DELETE | Must update `src/env/server.ts` first |
| `src/app/api/polar/` | DELETE (if exists) | Check for directory existence |
| `src/hooks/use-google-places.tsx` | DELETE | Must update `src/env/client.ts` first |
| `src/components/AddressAutocomplete.tsx` | DELETE | Check for import usage |

### Example Code - REMOVE

| File/Directory | Action | Notes |
|----------------|--------|-------|
| `src/db/schema/post.ts` | DELETE | Example schema |
| `src/components/ProductCard.tsx` | DELETE | Example component (may use Polar) |
| `src/components/form-example.tsx` | DELETE | Example component |

### Environment Validation - UPDATE

| File | Changes Required | Priority |
|------|-----------------|----------|
| `src/env/server.ts` | Remove Polar validation (`POLAR_ACCESS_TOKEN`, `POLAR_MODE`), keep Kapso validation | P1 |
| `src/env/client.ts` | Remove Google Maps validation (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`), keep PostHog (optional) | P1 |

### Database Schema - UPDATE

| File | Changes Required | Priority |
|------|-----------------|----------|
| `src/db/schema/index.ts` | Remove export of `post` schema | P2 |
| Run `bun run db:push` | Sync schema changes to database | P2 |

### Dependencies - REMOVE from package.json

| Package | Reason | Priority |
|---------|--------|----------|
| `@polar-sh/sdk` | Polar payments removed | P2 |
| `@react-google-maps/api` | Google Places removed | P2 |
| `posthog-js`, `posthog-node` | Only if user chooses to remove analytics | P3 |

### Components - KEEP

| Component | Reason | Notes |
|-----------|--------|-------|
| `src/components/ui/*` | shadcn/ui primitives | Excluded from linting, essential UI |
| `src/components/sign-in.tsx` | Authentication | Required for Better Auth |
| `src/components/sign-up.tsx` | Authentication | If exists, required for Better Auth |
| `src/components/PostHogProvider.tsx` | Analytics | If keeping PostHog |
| `src/components/theme-provider.tsx` | Theme system | Keep if using dark mode |
| `src/components/error-boundary.tsx` | Error handling | Keep for production resilience |
| `src/components/submit-button.tsx` | Form helper | Keep if used in auth forms |
| `src/components/mode-toggle.tsx` | Theme toggle | Keep if using dark mode |

---

## Environment Variable Migration Plan

### Variables to KEEP

```bash
# Database
DATABASE_URL=           # Neon PostgreSQL connection string (main)
DATABASE_URL_DEV=       # Development database
DATABASE_URL_TEST=      # Test database for E2E

# Auth (Better Auth)
GOOGLE_CLIENT_ID=       # Google OAuth client ID
GOOGLE_CLIENT_SECRET=   # Google OAuth client secret
BETTER_AUTH_SECRET=     # Generate with: bun run auth:secret
BETTER_AUTH_URL=        # Base URL (http://localhost:3000 or production URL)

# WhatsApp (Kapso)
KAPSO_ACCOUNT_ID=       # Kapso account identifier
KAPSO_PHONE_NUMBER_ID=  # WhatsApp business phone number ID
KAPSO_WHATSAPP_TOKEN=   # WhatsApp API access token
META_APP_SECRET=        # Meta app secret for webhook verification
KAPSO_WEBHOOK_URL=      # Public webhook URL

# Analytics (Optional - PostHog)
NEXT_PUBLIC_POSTHOG_KEY=  # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST= # PostHog instance URL

# Project Config
NEXT_PUBLIC_PROJECT_NAME=distilled
```

### Variables to REMOVE

```bash
# Polar Payments (REMOVE)
POLAR_ACCESS_TOKEN=     # DELETE
POLAR_MODE=             # DELETE

# Google Places (REMOVE)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # DELETE
```

### Validation Schema Updates

**src/env/server.ts**:
- Remove: `POLAR_ACCESS_TOKEN`, `POLAR_MODE`
- Keep: All Better Auth vars, all Kapso vars, PostHog server var (if keeping)

**src/env/client.ts**:
- Remove: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Keep: `NEXT_PUBLIC_PROJECT_NAME`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (if keeping PostHog)

---

## Test Update Strategy

### Tests to UPDATE

1. **Authentication Tests** (VERIFY):
   - Check e2e tests for sign-up/sign-in flows
   - Verify unit tests for auth utilities
   - Ensure tests use Better Auth correctly

2. **Database Tests** (UPDATE):
   - Remove tests for `post` schema if they exist
   - Verify auth schema tests pass

### Tests to REMOVE

1. **Polar Payment Tests**:
   - Search for tests importing or mocking `src/lib/polar.ts`
   - Remove any payment flow tests

2. **Google Places Tests**:
   - Remove tests for `AddressAutocomplete` component
   - Remove tests for `use-google-places` hook

3. **Example Component Tests**:
   - Remove tests for `ProductCard`
   - Remove tests for `form-example`

### Test Verification Checklist

After template customization:

```bash
# Run all tests
bun test                 # Should pass (or have only intentional failures documented)
bun run test:e2e         # Should pass auth flows
bun run build            # Should succeed
bun type                 # Should have 0 errors
bun lint                 # Should pass
```

---

## Integration Best Practices

### Better Auth Setup

**OAuth Provider Configuration**:
1. Create Google Cloud Console project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://<domain>/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env`

**Session Management**:
- Sessions stored in PostgreSQL (`user`, `session`, `account`, `verification` tables)
- Session duration: Default 7 days (configurable in `src/lib/auth.ts`)
- Automatic session refresh on activity

### Kapso WhatsApp Setup

**Meta Developer Console**:
1. Create Meta Business App
2. Add WhatsApp product
3. Create WhatsApp Business Account
4. Get Phone Number ID
5. Generate WhatsApp Access Token
6. Configure webhook:
   - URL: `https://<domain>/api/whatsapp/webhook`
   - Verify token: Use `META_APP_SECRET`
   - Subscribe to messages, message_status

**Message Formats**:
- Text messages: `sendTextMessage(phoneNumber, text)`
- Button messages: `sendButtonMessage(phoneNumber, text, buttons[])`
- Buttons limited to 3 per message (WhatsApp API constraint)

### PostHog Analytics Setup (If Keeping)

**PostHog Configuration**:
1. Create account at app.posthog.com (or self-host)
2. Create new project
3. Copy Project API Key to `NEXT_PUBLIC_POSTHOG_KEY`
4. Server-side events: Use `src/lib/posthog.ts`
5. Client-side events: Use PostHog React SDK via provider

**Privacy Considerations**:
- GDPR compliance: Enable data anonymization
- Respect DNT (Do Not Track) headers
- Cookie consent: Implement if serving EU users

---

## Implementation Sequence

Based on dependencies, the recommended implementation order is:

1. **P1 - Configuration Updates** (no dependencies):
   - Update `package.json`, `README.md`, `metadata.ts`, `manifest.ts`
   - Set `NEXT_PUBLIC_PROJECT_NAME=distilled` in `.env`

2. **P2 - Environment Variable Cleanup**:
   - Update `.env.example` (remove Polar, Google Maps)
   - Update `src/env/server.ts` (remove Polar validation)
   - Update `src/env/client.ts` (remove Google Maps validation)

3. **P3 - Delete Integration Code**:
   - Delete `src/lib/polar.ts`
   - Delete `src/app/api/polar/` (if exists)
   - Delete `src/hooks/use-google-places.tsx`
   - Delete `src/components/AddressAutocomplete.tsx`

4. **P4 - Delete Example Code**:
   - Delete `src/db/schema/post.ts`
   - Update `src/db/schema/index.ts` (remove post export)
   - Delete `src/components/ProductCard.tsx`
   - Delete `src/components/form-example.tsx`

5. **P5 - Update Dependencies**:
   - Remove `@polar-sh/sdk` from `package.json`
   - Remove `@react-google-maps/api` from `package.json`
   - Run `bun install` to update `bun.lock`

6. **P6 - Database Sync**:
   - Run `bun run db:push` to sync schema changes

7. **P7 - Update Documentation**:
   - Update `CLAUDE.md` (remove Polar, Google Places sections)
   - Verify README reflects current integrations

8. **P8 - Verification**:
   - Run `bun test`
   - Run `bun run test:e2e`
   - Run `bun run build`
   - Run `bun type`
   - Run `bun lint`

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking auth flows | High | Test auth thoroughly before proceeding |
| Accidental removal of shared utilities | Medium | Careful code search before deletion |
| Environment variable misconfiguration | High | Clear documentation in .env.example |
| Database schema corruption | High | Use `db:push` in dev, migrations in prod |
| Test failures after cleanup | Medium | Update tests incrementally, verify at each step |
| Missing dependencies after removal | Low | Run build/test after each major deletion |

---

## Success Criteria Validation

After template initialization, verify:

1. ✅ Dev server starts successfully: `bun dev`
2. ✅ All unit tests pass: `bun test`
3. ✅ All E2E tests pass: `bun run test:e2e`
4. ✅ Production build succeeds: `bun run build`
5. ✅ Type checking passes: `bun type`
6. ✅ Linting passes: `bun lint`
7. ✅ Database contains only auth tables: `bun run db:studio`
8. ✅ No references to "polar" remain (except in TEMPLATE_CHECKLIST.md): `grep -ri "polar" src/`
9. ✅ No references to removed packages: `grep -ri "google.*place" src/`
10. ✅ All project files reference "Distilled": `grep -ri "distilled" package.json README.md src/metadata.ts`

---

## Open Questions & Assumptions

### Assumptions Made

1. **PostHog Decision**: Keeping PostHog for analytics (user can remove later if preferred)
2. **Auth Providers**: Only email/password + Google OAuth needed (no GitHub, magic links, etc.)
3. **Database**: Using Neon PostgreSQL (as configured in template)
4. **Deployment**: Vercel (as indicated by existing scripts)
5. **Internationalization**: Keeping next-intl setup (seen in file paths like `app/[locale]/`)

### Questions for Implementation Phase

1. Should we keep or remove `@polar-sh/better-auth` package? (Need to verify if this is actually a Polar-specific fork of Better Auth or just the standard Better Auth package)
2. Are there any example pages (like `/example` routes) that need to be removed?
3. Should we remove `@react-google-maps/api` dependency or check if it's used elsewhere besides AddressAutocomplete?
4. Should we keep internationalization (`next-intl`) or is English-only sufficient for MVP?

---

## Next Steps

This research is complete. Proceed to:

1. **Phase 1**: Generate `quickstart.md` with post-initialization setup guide
2. **Phase 2**: Run `/speckit.tasks` to generate implementation tasks
3. **Implementation**: Execute tasks following the dependency order above
