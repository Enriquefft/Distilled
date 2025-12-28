---
description: "Task list for template initialization - Distilled platform setup"
---

# Tasks: Template Initialization for Distilled Platform

**Input**: Design documents from `/specs/000-template-init/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Tests are NOT included - this is a template customization task, not feature development. Validation happens via existing test suite.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each customization area.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router structure**: `src/app/`, `src/components/`, `src/lib/`, `src/db/`
- **Tests**: `tests/`, `e2e/tests/`
- All paths relative to repository root

---

## Phase 1: Setup (No Prerequisites)

**Purpose**: Verify prerequisites and understand current state

- [ ] T001 Review TEMPLATE_CHECKLIST.md to understand all customization areas
- [ ] T002 [P] Review research.md for integration keep/remove decisions
- [ ] T003 [P] Review quickstart.md for post-initialization setup steps

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites for this template customization - each user story is independent

**⚠️ NOTE**: This template initialization is unique - there are no foundational blockers. Each user story (customization area) can proceed independently.

**Checkpoint**: Can begin user story implementation immediately after Phase 1

---

## Phase 3: User Story 1 - Configure Project Identity (Priority: P1) 🎯 MVP

**Goal**: Transform generic template branding into Distilled project identity across all configuration files and documentation

**Independent Test**: Verify package.json name is "distilled", dev server shows "Distilled" in browser tab, metadata contains Distilled branding

### Implementation for User Story 1

- [ ] T004 [P] [US1] Update name to "distilled" in package.json line 66
- [ ] T005 [P] [US1] Update description to "Personalized weekly news distillation delivered via WhatsApp" in package.json line 37
- [ ] T006 [P] [US1] Update repository.url to "https://github.com/Enriquefft/Distilled" in package.json line 74
- [ ] T007 [P] [US1] Update bugs.url to "https://github.com/Enriquefft/Distilled/issues" in package.json line 3
- [ ] T008 [P] [US1] Set NEXT_PUBLIC_PROJECT_NAME=distilled in .env
- [ ] T009 [P] [US1] Update NEXT_PUBLIC_PROJECT_NAME=distilled in .env.example
- [ ] T010 [P] [US1] Update title to include "Distilled" in src/metadata.ts
- [ ] T011 [P] [US1] Update description to "Personalized weekly news distillation via WhatsApp" in src/metadata.ts
- [ ] T012 [P] [US1] Update applicationName to "Distilled" in src/metadata.ts
- [ ] T013 [P] [US1] Update name to "Distilled" in src/manifest.ts
- [ ] T014 [P] [US1] Update short_name to "Distilled" in src/manifest.ts
- [ ] T015 [P] [US1] Update description in src/manifest.ts to match src/metadata.ts
- [ ] T016 [P] [US1] Update README.md title (line 1) to "Distilled"
- [ ] T017 [P] [US1] Update README.md description paragraph with Distilled platform explanation
- [ ] T018 [P] [US1] Update repository URLs in README.md Quick Start section
- [ ] T019 [P] [US1] Update badge URLs in README.md (if badges reference repository)
- [ ] T020 [US1] Run bun dev and verify browser tab shows "Distilled" title

**Checkpoint**: All project configuration files reflect "Distilled" branding, dev server shows correct title

---

## Phase 4: User Story 2 - Select and Configure Required Integrations (Priority: P2)

**Goal**: Remove unused integrations (Polar payments, Google Places) while keeping required ones (Better Auth, Kapso)

**Independent Test**: Verify Better Auth sign-up works, Polar code is deleted, Google Places components are deleted, no build errors

### Implementation for User Story 2

#### Step 1: Update Environment Validation (Must come first)

- [ ] T021 [US2] Remove POLAR_ACCESS_TOKEN and POLAR_MODE validation from src/env/server.ts
- [ ] T022 [US2] Remove NEXT_PUBLIC_GOOGLE_MAPS_API_KEY validation from src/env/client.ts
- [ ] T023 [P] [US2] Remove POLAR_* variables from .env.example
- [ ] T024 [P] [US2] Remove NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from .env.example

#### Step 2: Delete Integration Code

- [ ] T025 [P] [US2] Delete src/lib/polar.ts
- [ ] T026 [P] [US2] Check if src/app/api/polar/ directory exists and delete if found
- [ ] T027 [P] [US2] Delete src/hooks/use-google-places.tsx
- [ ] T028 [P] [US2] Delete src/components/AddressAutocomplete.tsx

#### Step 3: Update Dependencies

- [ ] T029 [US2] Remove @polar-sh/sdk from package.json dependencies
- [ ] T030 [US2] Remove @react-google-maps/api from package.json dependencies (verify not used elsewhere first)
- [ ] T031 [US2] Run bun install to update bun.lock

#### Step 4: Update Documentation

- [ ] T032 [P] [US2] Remove Polar integration section from CLAUDE.md
- [ ] T033 [P] [US2] Remove Google Places integration section from CLAUDE.md
- [ ] T034 [P] [US2] Remove Polar mentions from README.md (if any)

#### Step 5: Verify Integrations

- [ ] T035 [US2] Run bun dev and test Better Auth email/password sign-up
- [ ] T036 [US2] Test Google OAuth sign-in flow
- [ ] T037 [US2] Verify no import errors related to deleted integrations

**Checkpoint**: Polar and Google Places completely removed, Better Auth and Kapso integrations intact and functional

---

## Phase 5: User Story 3 - Clean Up Database Schema (Priority: P3)

**Goal**: Remove example database tables (post.ts) while keeping auth schema

**Independent Test**: Verify only auth tables exist in database, post schema is deleted, db:push succeeds

### Implementation for User Story 3

- [ ] T038 [P] [US3] Delete src/db/schema/post.ts
- [ ] T039 [US3] Remove post schema export from src/db/schema/index.ts
- [ ] T040 [US3] Search for imports of post schema and remove: grep -r "from.*schema.*post" src/
- [ ] T041 [US3] Run bun run db:push to sync schema changes to database
- [ ] T042 [US3] Run bun run db:studio and verify only auth tables exist (distilled_user, distilled_session, distilled_account, distilled_verification)

**Checkpoint**: Database contains only Better Auth tables, no example schemas remain

---

## Phase 6: User Story 4 - Remove Unused UI Components (Priority: P4)

**Goal**: Delete example components while keeping essential UI (shadcn/ui, auth components)

**Independent Test**: Verify example components deleted, no import errors, bun dev runs successfully, type check passes

### Implementation for User Story 4

#### Step 1: Delete Example Components

- [ ] T043 [P] [US4] Delete src/components/ProductCard.tsx
- [ ] T044 [P] [US4] Delete src/components/form-example.tsx

#### Step 2: Check for Component Usage

- [ ] T045 [US4] Search for ProductCard imports and remove: grep -r "ProductCard" src/
- [ ] T046 [US4] Search for form-example imports and remove: grep -r "form-example" src/
- [ ] T047 [US4] Check if any pages in src/app/ use deleted components and remove those imports

#### Step 3: Verify Component Cleanup

- [ ] T048 [US4] Run bun dev and verify no import errors
- [ ] T049 [US4] Run bun type and verify no TypeScript errors related to deleted components
- [ ] T050 [US4] Verify shadcn/ui components in src/components/ui/ are intact
- [ ] T051 [US4] Verify auth components (sign-in.tsx, sign-up.tsx) are intact

**Checkpoint**: Example components removed, essential components intact, no broken imports

---

## Phase 7: User Story 5 - Update Environment Configuration (Priority: P5)

**Goal**: Ensure .env.example documents only kept integrations and validation schemas match configuration

**Independent Test**: Verify .env.example matches research.md decisions, environment validation works correctly, bun dev validates env properly

### Implementation for User Story 5

#### Step 1: Verify .env.example Content

- [ ] T052 [US5] Verify .env.example documents Better Auth variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_SECRET, BETTER_AUTH_URL)
- [ ] T053 [US5] Verify .env.example documents Kapso variables (KAPSO_ACCOUNT_ID, KAPSO_PHONE_NUMBER_ID, KAPSO_WHATSAPP_TOKEN, META_APP_SECRET, KAPSO_WEBHOOK_URL)
- [ ] T054 [US5] Verify .env.example documents PostHog variables if analytics kept (NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST)
- [ ] T055 [US5] Verify .env.example documents database variables (DATABASE_URL, DATABASE_URL_DEV, DATABASE_URL_TEST)
- [ ] T056 [US5] Confirm POLAR_* and GOOGLE_MAPS_API_KEY are already removed from .env.example (completed in US2)

#### Step 2: Verify Environment Validation Schemas

- [ ] T057 [US5] Verify src/env/server.ts validates kept server variables (Better Auth, Kapso, database)
- [ ] T058 [US5] Verify src/env/server.ts does NOT validate Polar variables (removed in US2)
- [ ] T059 [US5] Verify src/env/client.ts validates kept client variables (NEXT_PUBLIC_PROJECT_NAME, PostHog if kept)
- [ ] T060 [US5] Verify src/env/client.ts does NOT validate Google Maps (removed in US2)

#### Step 3: Test Environment Validation

- [ ] T061 [US5] Run bun dev and verify environment validation passes with current .env
- [ ] T062 [US5] Test missing required variable shows clear validation error (temporarily remove DATABASE_URL and check error)

**Checkpoint**: Environment configuration is clean, documented, and properly validated

---

## Phase 8: User Story 6 - Verify Build and Test Pipeline (Priority: P6)

**Goal**: Ensure all tests pass, build succeeds, and CI/CD pipeline works after template customization

**Independent Test**: All commands succeed: bun test, bun run test:e2e, bun run build, bun type, bun lint

### Implementation for User Story 6

#### Step 1: Check for Broken Tests

- [ ] T063 [US6] Run bun test and identify any failing tests
- [ ] T064 [US6] Fix or remove tests that reference deleted features (Polar, Google Places, ProductCard, post schema)
- [ ] T065 [US6] Verify auth-related tests still pass

#### Step 2: Check E2E Tests

- [ ] T066 [US6] Run bun run test:e2e and identify any failing E2E tests
- [ ] T067 [US6] Update or remove E2E tests for deleted features
- [ ] T068 [US6] Verify E2E auth flow tests pass

#### Step 3: Verify Build and Type Checking

- [ ] T069 [US6] Run bun run build and verify production build succeeds
- [ ] T070 [US6] Run bun type and verify 0 TypeScript errors
- [ ] T071 [US6] Run bun lint and verify no linting errors (auto-fixes applied)

#### Step 4: Final Verification

- [ ] T072 [US6] Run complete verification sequence from quickstart.md:
  - bun install (fresh install)
  - bun run build (production build)
  - bun dev (dev server starts)
  - bun test (unit tests pass)
  - bun run test:e2e (E2E tests pass)
  - bun type (no type errors)
  - bun lint (no lint errors)
- [ ] T073 [US6] Verify no references to "polar" in src/: grep -ri "polar" src/
- [ ] T074 [US6] Verify no references to Google Places in src/: grep -ri "google.*place" src/
- [ ] T075 [US6] Run bun run db:studio and confirm only auth tables exist

**Checkpoint**: All tests pass, build succeeds, template initialization complete

---

## Phase 9: Polish & Finalization

**Purpose**: Final cleanup and documentation

- [ ] T076 [P] Verify TEMPLATE_CHECKLIST.md sections are complete
- [ ] T077 [P] Review CLAUDE.md for any remaining references to removed integrations
- [ ] T078 [P] Review README.md for accuracy and completeness
- [ ] T079 Run git status and review all changed files
- [ ] T080 Commit changes with proper commit message (see quickstart.md for format)
- [ ] T081 Push to origin/000-template-init branch
- [ ] T082 Verify GitHub Actions CI/CD pipeline passes (tests, lint, build, CodeQL)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no blocking foundation for template init
- **User Stories (Phase 3-8)**: Most are independent, with some ordering requirements:
  - **US1 (P1)** can start immediately (independent)
  - **US2 (P2)** must update env validation BEFORE deleting code (internal dependency)
  - **US3 (P3)** can start after US1 (independent, just needs project name set)
  - **US4 (P4)** can start independently (independent)
  - **US5 (P5)** should start after US2 completes (depends on US2 env changes)
  - **US6 (P6)** MUST run after ALL other stories complete (validation phase)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - can start immediately
- **User Story 2 (P2)**: No dependencies on other stories - internally must update env validation before deleting code
- **User Story 3 (P3)**: Can start independently - recommends US1 complete first (needs NEXT_PUBLIC_PROJECT_NAME)
- **User Story 4 (P4)**: No dependencies - can start independently
- **User Story 5 (P5)**: Should wait for US2 (needs env validation updates from US2)
- **User Story 6 (P6)**: Depends on US1-US5 being complete (verification phase)

### Recommended Execution Order

**Sequential** (one developer):
1. Phase 1 (Setup) → Phase 3 (US1) → Phase 4 (US2) → Phase 7 (US5) → Phase 5 (US3) → Phase 6 (US4) → Phase 8 (US6) → Phase 9 (Polish)

**Parallel** (multiple developers):
1. Everyone: Phase 1 (Setup)
2. Parallel:
   - Dev A: US1 (Project Identity)
   - Dev B: US2 (Integration Cleanup)
3. After US2 complete: Dev B → US5 (Env Configuration)
4. Parallel (independent):
   - Dev C: US3 (Database Cleanup)
   - Dev D: US4 (Component Cleanup)
5. After ALL complete: US6 (Verification)
6. After verification: Polish

### Within Each User Story

User Story 2 (Integration Cleanup) internal sequence:
1. Update environment validation (T021-T024) FIRST
2. Delete code (T025-T028)
3. Update dependencies (T029-T031)
4. Update docs (T032-T034)
5. Verify (T035-T037)

All other user stories: Tasks can run in parallel within the story (marked [P])

### Parallel Opportunities

- **Phase 1**: All tasks (T001-T003) can run in parallel
- **US1**: All file updates (T004-T019) can run in parallel, T020 runs last
- **US2 Step 1**: T023-T024 can run in parallel after T021-T022
- **US2 Step 2**: T025-T028 all parallel
- **US2 Step 4**: T032-T034 all parallel
- **US3**: T038 and T039 can run in parallel, T040-T042 sequential
- **US4 Step 1**: T043-T044 parallel
- **US4 Step 2**: T045-T047 can run in parallel
- **US4 Step 3**: T048-T051 sequential verification
- **Different user stories**: US1, US2, US4 can all run in parallel (US3 recommended after US1, US5 after US2)

---

## Parallel Example: User Story 1 (Project Identity)

```bash
# Launch all configuration file updates in parallel:
Task: "Update name in package.json"
Task: "Update description in package.json"
Task: "Update repository.url in package.json"
Task: "Update bugs.url in package.json"
Task: "Set NEXT_PUBLIC_PROJECT_NAME in .env"
Task: "Update .env.example"
Task: "Update title in src/metadata.ts"
Task: "Update description in src/metadata.ts"
Task: "Update applicationName in src/metadata.ts"
Task: "Update src/manifest.ts"
Task: "Update README.md title"
Task: "Update README.md description"
Task: "Update README.md URLs"

# Then verify:
Task: "Run bun dev and verify browser tab"
```

---

## Parallel Example: User Story 2 (Integration Cleanup)

```bash
# First: Update environment validation (sequential)
Task: "Remove Polar validation from src/env/server.ts"
Task: "Remove Google Maps validation from src/env/client.ts"

# Then: Delete integration code (parallel)
Task: "Delete src/lib/polar.ts"
Task: "Check and delete src/app/api/polar/"
Task: "Delete src/hooks/use-google-places.tsx"
Task: "Delete src/components/AddressAutocomplete.tsx"

# Update .env.example (parallel)
Task: "Remove POLAR_* from .env.example"
Task: "Remove GOOGLE_MAPS_API_KEY from .env.example"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review documentation)
2. Complete Phase 3: User Story 1 (Project Identity)
3. **STOP and VALIDATE**: Run bun dev, verify "Distilled" branding
4. Commit and push

**Why US1 as MVP**: Establishes project identity, minimal risk, immediate visible value

### Incremental Delivery

1. Complete US1 → Commit → Push (Project branded as "Distilled")
2. Complete US2 → Verify integrations → Commit → Push (Clean integrations)
3. Complete US5 → Commit → Push (Environment config clean)
4. Complete US3 → Commit → Push (Database clean)
5. Complete US4 → Commit → Push (Components clean)
6. Complete US6 → Full verification → Commit → Push (All tests pass)
7. Complete Polish → Final commit → Create PR

Each step adds value and maintains working state.

### Parallel Team Strategy

With 2-3 developers:

1. Everyone: Review documentation (Phase 1)
2. Parallel execution:
   - Dev A: US1 (Project Identity) → US3 (Database Schema)
   - Dev B: US2 (Integrations) → US5 (Environment)
   - Dev C: US4 (Components)
3. Everyone: US6 (Verification) together
4. Polish and PR

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story**: Independently testable and deliverable
- **Verification strategy**: Run bun dev after each major change to catch errors early
- **Git strategy**: Commit after each user story completion, not per-task
- **US2 special note**: Must update env validation BEFORE deleting code to avoid build errors
- **US6 purpose**: Comprehensive verification that everything still works
- **No tests to write**: Using existing test suite to validate template customization
- **Template checklist**: TEMPLATE_CHECKLIST.md remains as reference, delete when fully complete

---

## Task Count Summary

- **Total Tasks**: 82
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 0 tasks (N/A for template init)
- **Phase 3 (US1 - Project Identity)**: 17 tasks
- **Phase 4 (US2 - Integrations)**: 17 tasks
- **Phase 5 (US3 - Database Schema)**: 5 tasks
- **Phase 6 (US4 - UI Components)**: 9 tasks
- **Phase 7 (US5 - Environment Config)**: 11 tasks
- **Phase 8 (US6 - Verification)**: 13 tasks
- **Phase 9 (Polish)**: 7 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel within their phase/story

**MVP Scope**: Phase 1 + Phase 3 (US1) = 20 tasks = Distilled branding complete
