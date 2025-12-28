# Implementation Plan: Template Initialization for Distilled Platform

**Branch**: `000-template-init` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/000-template-init/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transform the Next.js template repository into the Distilled platform codebase by customizing project identity (package.json, metadata, README), selecting required integrations (Better Auth with Google OAuth, Kapso for WhatsApp), removing unused features (Polar payments, Google Places), cleaning up database schemas and UI components, updating environment configuration, and verifying all tests and builds pass.

## Technical Context

**Language/Version**: TypeScript with Next.js 15 (App Router), Bun runtime
**Primary Dependencies**: Next.js, React 19, Better Auth, Drizzle ORM, Kapso SDK, PostHog (optional), shadcn/ui, TanStack Form
**Storage**: PostgreSQL (Neon) via Drizzle ORM with namespaced schemas
**Testing**: Bun test (unit), Playwright (E2E), Happy DOM
**Target Platform**: Web application (Vercel deployment)
**Project Type**: Web (Next.js App Router with server actions)
**Performance Goals**: Standard Next.js web app performance (< 3s FCP, < 100ms server actions)
**Constraints**: Must maintain existing template structure, preserve speckit workflow, keep working auth and database
**Scale/Scope**: Single developer, template customization (not feature implementation), ~50 files to modify/delete

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: The project constitution is not yet defined (template file exists at `.specify/memory/constitution.md`). This template initialization feature will establish the baseline codebase that future features will build upon. Constitution definition can occur after template initialization is complete.

**Proceeding without constitution**: Since this is a template customization task (not feature development), the primary constraints come from the TEMPLATE_CHECKLIST.md and existing template architecture. No violations to check.

## Project Structure

### Documentation (this feature)

```text
specs/000-template-init/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - N/A for template init
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for template init
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Router web application structure
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/            # Auth-related pages (sign-in, sign-up)
│   ├── api/               # API routes
│   │   ├── auth/          # Better Auth endpoints (KEEP)
│   │   ├── whatsapp/      # Kapso WhatsApp webhook (KEEP)
│   │   └── polar/         # Polar payment webhooks (REMOVE)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/                # shadcn/ui primitives (KEEP - excluded from linting)
│   ├── sign-in.tsx        # Auth components (KEEP)
│   ├── sign-up.tsx        # Auth components (KEEP)
│   ├── PostHogProvider.tsx # Analytics (CONDITIONAL)
│   ├── ProductCard.tsx    # Example component (REMOVE)
│   ├── form-example.tsx   # Example component (REMOVE)
│   └── AddressAutocomplete.tsx # Google Places (REMOVE)
├── db/                    # Database client and schemas
│   ├── index.ts           # Drizzle client
│   └── schema/            # Drizzle schemas
│       ├── index.ts       # Schema exports
│       ├── auth.ts        # Better Auth tables (KEEP)
│       └── post.ts        # Example schema (REMOVE)
├── env/                   # Environment validation
│   ├── client.ts          # Client-side env (UPDATE)
│   ├── server.ts          # Server-side env (UPDATE)
│   └── db.ts              # Database env (KEEP)
├── hooks/                 # Custom React hooks
│   └── use-google-places.tsx # Google Places hook (REMOVE)
├── lib/                   # Utilities and integrations
│   ├── auth.ts            # Better Auth config (KEEP)
│   ├── auth-client.ts     # Client auth utilities (KEEP)
│   ├── kapso.ts           # Kapso WhatsApp SDK (KEEP)
│   ├── polar.ts           # Polar payments (REMOVE)
│   ├── posthog.ts         # PostHog analytics (CONDITIONAL)
│   └── utils.ts           # General utilities (KEEP)
├── metadata.ts            # SEO metadata config (UPDATE)
└── manifest.ts            # PWA manifest (UPDATE)

tests/                     # Unit tests (UPDATE/REMOVE broken tests)
e2e/                       # E2E tests
├── tests/                 # Test specs (UPDATE/REMOVE broken tests)
├── fixtures/              # Test data (UPDATE if needed)
└── helpers/               # Test utilities (KEEP)

scripts/                   # Utility scripts
└── seed/                  # Database seed scripts (KEEP)

drizzle/                   # Database migrations (UPDATE after schema changes)

# Configuration files to update
package.json               # UPDATE: name, description, author
.env                       # UPDATE: NEXT_PUBLIC_PROJECT_NAME, remove unused vars
.env.example               # UPDATE: document only kept integrations
README.md                  # UPDATE: project title, description
CLAUDE.md                  # UPDATE: remove unused integration docs
```

**Structure Decision**: This is a Next.js App Router web application with server-side rendering and server actions. The structure follows Next.js 15 conventions with App Router. Template customization will primarily involve updating configuration files, removing unused integration code, and cleaning up example components/schemas.

## Complexity Tracking

> **Not applicable** - no constitution violations for template initialization

## Phase 0: Research & Outline

The research phase will focus on:

1. **Integration Inventory**: Catalog all current integrations and determine keep/remove decisions
   - Better Auth setup and OAuth providers
   - Kapso WhatsApp configuration requirements
   - Polar payment integration removal checklist
   - Google Places integration removal checklist
   - PostHog analytics configuration options

2. **File Dependency Analysis**: Identify all files that import/reference integrations to be removed
   - Search for `polar` imports and usage
   - Search for `google-places` and `googlemaps` imports
   - Identify components/pages using removed integrations

3. **Environment Variable Mapping**: Map environment variables to their usage locations
   - Document which files validate which env vars
   - Create migration checklist for .env files

4. **Test Update Strategy**: Determine which tests need updates vs removal
   - Identify tests for removed features
   - Plan auth flow test verification

**Research Output**: `research.md` will document:
- Final keep/remove decisions for each integration
- Complete file change checklist
- Environment variable migration plan
- Test update strategy

## Phase 1: Design & Contracts

**Note**: This template initialization feature does not involve data modeling or API contract design. Phase 1 will focus on:

1. **Configuration Design**: Document the target state for all configuration files
   - package.json updates
   - metadata.ts branding
   - .env.example documentation

2. **Integration Configuration**: Document the configuration for kept integrations
   - Better Auth OAuth provider setup
   - Kapso environment variables and webhook configuration
   - PostHog analytics setup (if kept)

3. **Quickstart Guide**: Create quickstart.md with:
   - Post-initialization setup steps
   - Environment variable configuration guide
   - Verification checklist
   - Next steps for feature development

**Phase 1 Outputs**:
- ~~data-model.md~~ (N/A - no new data models)
- ~~contracts/~~ (N/A - no new API contracts)
- quickstart.md (setup and verification guide)

## Next Steps

After `/speckit.plan` completes:

1. **Review generated artifacts**: Check research.md and quickstart.md
2. **Run `/speckit.tasks`**: Generate tasks.md with dependency-ordered implementation tasks
3. **Run `/speckit.implement`**: Execute the implementation following TEMPLATE_CHECKLIST.md
4. **Verify**: Run full test suite, build, and type check
5. **Merge**: Create PR and merge to main after CI passes
