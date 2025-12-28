# Feature Specification: Template Initialization for Distilled Platform

**Feature Branch**: `000-template-init`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Initialize Distilled platform repository barebones - customize the Next.js template by configuring project identity, selecting required integrations (auth, WhatsApp/Kapso, analytics), removing unused features, and preparing the codebase for Distilled feature development"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Project Identity (Priority: P1)

A developer needs to transform the generic template into the Distilled project by updating all project-specific names, metadata, and documentation.

**Why this priority**: This establishes the project's identity and ensures all configuration files reflect "Distilled" instead of generic template placeholders. Without this, the project cannot be properly identified or deployed.

**Independent Test**: Can be fully tested by verifying package.json name is "distilled", NEXT_PUBLIC_PROJECT_NAME is set, metadata.ts contains Distilled branding, and README.md reflects the project. Delivers a properly branded codebase.

**Acceptance Scenarios**:

1. **Given** the template repository, **When** package.json is updated, **Then** name field is "distilled" and description mentions "personalized weekly news via WhatsApp"
2. **Given** environment configuration, **When** .env and .env.example are updated, **Then** NEXT_PUBLIC_PROJECT_NAME is set to "distilled"
3. **Given** the metadata configuration, **When** src/metadata.ts is updated, **Then** title, description, and applicationName reflect Distilled branding
4. **Given** project documentation, **When** README.md is updated, **Then** title is "Distilled" and description explains the WhatsApp news platform
5. **Given** all branding updates, **When** the dev server runs, **Then** browser tab shows "Distilled" title and correct metadata

---

### User Story 2 - Select and Configure Required Integrations (Priority: P2)

A developer needs to keep only the integrations required for Distilled (authentication, Kapso for WhatsApp, optional analytics) and remove unused payment/Google Places integrations.

**Why this priority**: This reduces bundle size, removes unnecessary dependencies, and ensures only relevant integrations are configured. Essential for a clean, maintainable codebase.

**Independent Test**: Can be fully tested by verifying Better Auth works, Kapso is configured, Polar payments are removed, and Google Places is removed. Delivers a streamlined integration setup.

**Acceptance Scenarios**:

1. **Given** authentication requirements, **When** Better Auth is configured, **Then** email/password and Google OAuth work for sign up/sign in
2. **Given** WhatsApp delivery needs, **When** Kapso integration is reviewed, **Then** KAPSO_* environment variables are documented and src/lib/kapso.ts exists
3. **Given** payment integration review, **When** Polar is removed, **Then** src/lib/polar.ts is deleted, polar-sdk is removed from package.json, and POLAR_* variables are removed from .env.example
4. **Given** Google Places review, **When** it's determined unnecessary, **Then** src/hooks/use-google-places.tsx and src/components/AddressAutocomplete.tsx are deleted
5. **Given** analytics review, **When** decision is made (keep PostHog or remove), **Then** configuration matches the decision with proper environment variables

---

### User Story 3 - Clean Up Database Schema (Priority: P3)

A developer needs to remove example database tables (like posts) while keeping the essential auth schema, preparing for Distilled-specific tables.

**Why this priority**: This ensures the database only contains necessary tables and provides a clean slate for adding Distilled entities (WhatsAppConnection, NewsSourcePreference, etc.) in future features.

**Independent Test**: Can be fully tested by verifying only auth.ts schema exists in src/db/schema/, running db:push successfully, and confirming database has only auth tables. Delivers a clean database foundation.

**Acceptance Scenarios**:

1. **Given** the schema directory, **When** example schemas are reviewed, **Then** post.ts is identified for removal
2. **Given** example schema removal, **When** post.ts is deleted, **Then** the import is removed from src/db/schema/index.ts
3. **Given** schema updates, **When** bun run db:push is executed, **Then** the database syncs successfully with only auth tables
4. **Given** the cleaned schema, **When** database is inspected, **Then** only Better Auth tables exist (user, session, account, verification)
5. **Given** future development, **When** Distilled-specific schemas are added, **Then** they can be added cleanly without example table conflicts

---

### User Story 4 - Remove Unused UI Components (Priority: P4)

A developer needs to remove example components and pages while keeping essential UI primitives and auth components.

**Why this priority**: This reduces code clutter and ensures the component library only contains reusable UI elements. This can be done after core configuration since it doesn't block development.

**Independent Test**: Can be fully tested by verifying example components are deleted, shadcn/ui remains intact, auth components work, and bun dev runs without errors. Delivers a clean component library.

**Acceptance Scenarios**:

1. **Given** the components directory, **When** example components are reviewed, **Then** ProductCard.tsx and form-example.tsx are identified for removal
2. **Given** component cleanup, **When** example components are deleted, **Then** src/components/ contains only ui/, sign-in.tsx, sign-up.tsx, and PostHogProvider.tsx (if keeping analytics)
3. **Given** page cleanup, **When** example routes are reviewed, **Then** any pages using deleted components are updated or removed
4. **Given** the cleaned codebase, **When** bun dev runs, **Then** the development server starts without import errors
5. **Given** type checking, **When** bun type runs, **Then** no errors related to deleted components exist

---

### User Story 5 - Update Environment Configuration (Priority: P5)

A developer needs to ensure .env.example only lists variables for kept integrations and all environment validation schemas match the configuration.

**Why this priority**: This ensures proper environment validation and clear documentation of required variables. This is a final cleanup step that depends on integration decisions.

**Independent Test**: Can be fully tested by verifying .env.example matches kept integrations, src/env/client.ts and server.ts validate correctly, and bun dev runs with proper validation. Delivers correct environment configuration.

**Acceptance Scenarios**:

1. **Given** integration decisions, **When** .env.example is reviewed, **Then** only variables for Better Auth, Kapso, and chosen analytics remain
2. **Given** removed integrations, **When** .env.example is updated, **Then** POLAR_*, GOOGLE_MAPS_API_KEY are removed if those integrations were deleted
3. **Given** environment schemas, **When** src/env/server.ts is updated, **Then** validation matches kept integrations (removes Polar validation if deleted)
4. **Given** client environment, **When** src/env/client.ts is updated, **Then** validation matches client-side needs (keeps PostHog if analytics kept, removes Google Maps if deleted)
5. **Given** the updated configuration, **When** bun dev runs, **Then** environment validation passes and clear errors show for missing required variables

---

### User Story 6 - Verify Build and Test Pipeline (Priority: P6)

A developer needs to ensure all tests pass, the build succeeds, and the CI/CD pipeline works after template customization.

**Why this priority**: This validates that all changes haven't broken the codebase and ensures the project is ready for feature development. This is the final verification step.

**Independent Test**: Can be fully tested by running bun test, bun run test:e2e, bun run build, and bun type, then verifying all pass. Delivers a verified, working codebase.

**Acceptance Scenarios**:

1. **Given** the customized template, **When** bun test runs, **Then** all unit tests pass (or tests for deleted features are removed)
2. **Given** E2E test configuration, **When** bun run test:e2e runs, **Then** authentication flows pass and deleted feature tests are removed
3. **Given** production build, **When** bun run build runs, **Then** the build completes successfully without errors
4. **Given** type checking, **When** bun type runs, **Then** no TypeScript errors exist
5. **Given** linting, **When** bun lint runs, **Then** no linting errors exist and code follows project standards
6. **Given** all local checks pass, **When** changes are pushed to GitHub, **Then** CI/CD pipeline (tests, lint, build, CodeQL) succeeds

---

### Edge Cases

- What happens when a required environment variable is removed but still referenced in code?
- How does the system handle when dependencies are removed but still imported somewhere?
- What happens when schema changes are pushed but migrations aren't generated?
- How does the build process handle when public assets (favicon, OG images) haven't been replaced?
- What happens when auth configuration is changed but session storage isn't cleared?
- How does the system handle when .env and .env.example get out of sync?
- What happens when integration removal is incomplete (e.g., code deleted but package.json not updated)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update package.json name to "distilled" with correct description and repository URL
- **FR-002**: System MUST set NEXT_PUBLIC_PROJECT_NAME to "distilled" in environment files
- **FR-003**: System MUST update src/metadata.ts with Distilled branding (title, description, applicationName)
- **FR-004**: System MUST update README.md with Distilled project information
- **FR-005**: System MUST keep Better Auth with email/password and Google OAuth configured
- **FR-006**: System MUST verify Better Auth authentication flows work (sign up, sign in, sign out)
- **FR-007**: System MUST keep Kapso integration for WhatsApp messaging (src/lib/kapso.ts and webhook routes)
- **FR-008**: System MUST remove Polar payment integration completely (code, dependencies, environment variables)
- **FR-009**: System MUST remove Google Places integration if not needed (hooks, components, environment variables)
- **FR-010**: System MUST decide on analytics (keep PostHog or remove) and update configuration accordingly
- **FR-011**: System MUST delete example database schemas (post.ts) while keeping auth.ts
- **FR-012**: System MUST remove example schema imports from src/db/schema/index.ts
- **FR-013**: System MUST sync database schema using bun run db:push
- **FR-014**: System MUST delete example UI components (ProductCard, form-example, etc.)
- **FR-015**: System MUST keep essential UI components (shadcn/ui, auth components)
- **FR-016**: System MUST update .env.example to reflect only kept integrations
- **FR-017**: System MUST update src/env/server.ts validation schema to match kept integrations
- **FR-018**: System MUST update src/env/client.ts validation schema to match client environment needs
- **FR-019**: System MUST remove unused packages from package.json (polar-sdk, @googlemaps/js-api-loader if removed)
- **FR-020**: System MUST pass all checks: bun test, bun run test:e2e, bun run build, bun type, bun lint
- **FR-021**: System MUST update CLAUDE.md to remove documentation for deleted integrations

### Key Entities

- **Project Configuration**: Represents all configuration files (package.json, .env files, metadata.ts) that define project identity
- **Integration Configuration**: Represents enabled integrations (Better Auth, Kapso, optional analytics) with their configuration files and environment variables
- **Database Schema**: Represents the Drizzle schema files defining database structure (auth tables initially, prepared for future Distilled entities)
- **Environment Validation**: Represents the validation schemas (src/env/client.ts, server.ts) ensuring required environment variables are present
- **Build Artifacts**: Represents the output of build, test, and lint processes that verify codebase health

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The development server starts successfully with all environment variables validated
- **SC-002**: All unit tests pass after template customization (bun test returns exit code 0)
- **SC-003**: All E2E tests pass after removing unused feature tests (bun run test:e2e returns exit code 0)
- **SC-004**: Production build completes without errors (bun run build succeeds)
- **SC-005**: TypeScript compilation succeeds with no errors (bun type passes)
- **SC-006**: Linting passes with no errors (bun lint passes)
- **SC-007**: GitHub CI/CD pipeline passes all jobs (tests, lint, build, CodeQL) on first push
- **SC-008**: Bundle size is reduced by removing unused dependencies (measured by build output)
- **SC-009**: Database contains only auth-related tables after schema cleanup (verified via db:studio)
- **SC-010**: All project files reference "Distilled" instead of template placeholders (verified by grep)
