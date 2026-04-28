---
name: test-setup
description: "Scaffold the test framework and CI/CD pipeline for the project's framework family. Creates the tests/ directory structure, framework-specific test runner configuration (Vitest / Jest / Playwright), and a GitHub Actions workflow. Run once during Technical Setup, before the first sprint."
argument-hint: "[force]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Test Setup

Scaffolds the automated testing infrastructure for the project. Detects the
configured framework family, generates the appropriate test runner
configuration, creates the standard directory layout, and wires up CI/CD so
tests run on every push.

Run this once during Technical Setup, before any implementation begins. A
test framework installed at sprint start costs 30 minutes; one installed at
sprint four costs three sprints.

**Output:** `tests/` and `e2e/` directory structure, runner config files,
`.github/workflows/tests.yml`

---

## Phase 1: Detect Framework Family and Existing State

1. **Read framework config**:
   - Read `.claude/docs/technical-preferences.md` and extract the
     `Framework Family:` value.
   - If not configured (`[TO BE CONFIGURED]`), stop:
     > "Framework family not configured. Run `/setup-stack` first, then
     > re-run `/test-setup`."

2. **Check for existing test infrastructure**:
   - Glob `tests/`, `e2e/`, `vitest.config.ts`, `jest.config.ts`,
     `playwright.config.ts`, `.github/workflows/`
   - Note which artifacts already exist

3. **Report findings**:
   > "Framework family: [family]. Tests directory: [found | not found].
   > E2E directory: [found | not found]. Runner config: [found | not found].
   > CI workflow: [found | not found]."
   - If everything already exists AND `force` was not passed:
     > "Test infrastructure appears to be in place. Re-run with
     > `/test-setup force` to regenerate. Proceeding will not overwrite
     > existing test files."

If `force` is passed, skip the early-exit but still do not overwrite files
that already exist. Only create missing files.

---

## Phase 2: Present Plan

Based on the framework detected and existing state, present a plan:

```
## Test Setup Plan — [Family]

I will create the following (skipping any that already exist):

tests/
  unit/         — Isolated unit tests (pure functions, services with mocked deps)
  integration/  — Service + repository tests against a real database in a transaction
  helpers/      — Shared factories and assertion utilities (see /test-helpers)
  smoke/        — Critical path manual checklist for /smoke-check gate
  evidence/     — Screenshot / video evidence and manual sign-off records
  README.md     — Test framework documentation

e2e/
  fixtures/     — Per-test tenant / user / data fixtures
  *.spec.ts     — Playwright e2e specs
  README.md

vitest.config.ts | jest.config.ts  — Unit / integration runner config
playwright.config.ts                — E2E runner config
.github/workflows/tests.yml         — CI workflow

Estimated time: ~5 minutes.
```

Ask: "May I create these files? I will not overwrite anything that already
exists at these paths."

Do not proceed without approval.

---

## Phase 3: Create Directory Structure

After approval, create the following.

### `tests/README.md`

```markdown
# Test Infrastructure

**Framework family**: [Next.js | React + Node | NestJS-Enterprise]
**Unit runner**: [Vitest | Jest]
**E2E runner**: Playwright
**CI**: `.github/workflows/tests.yml`
**Setup date**: [date]

## Directory Layout

\`\`\`
tests/
  unit/         # Isolated unit tests
  integration/  # Real-DB integration tests in rolled-back transactions
  helpers/      # Shared factories and assertion utilities
  smoke/        # Critical path checklist for /smoke-check gate
  evidence/     # Screenshot / video evidence and manual sign-off records

e2e/
  fixtures/     # Per-test tenant / user / data fixtures
  *.spec.ts     # Playwright e2e specs
\`\`\`

## Running Tests

\`\`\`
# unit + integration
pnpm test                 # or: npm test / yarn test
pnpm test --watch
pnpm test path/to/file.test.ts

# e2e
pnpm test:e2e             # headless
pnpm test:e2e --headed    # see the browser
pnpm test:e2e --ui        # Playwright UI mode
\`\`\`

## Test Naming

- **Files**: `[area]/[feature].test.ts` (unit / integration);
  `e2e/[user-journey].spec.ts` (Playwright)
- **`describe` / `it`**: behavioral phrases — `it("rejects discount above policy max")`

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|------------|-------------------|----------|
| Logic | Automated unit test — must pass | `tests/unit/[area]/` |
| Integration | Integration test against a real DB | `tests/integration/[area]/` |
| User-visible flow | Playwright e2e test | `e2e/*.spec.ts` |
| Visual / Feel | Screenshot / video + lead sign-off | `tests/evidence/` |
| Config / Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

Tests run on every push to `main` and every pull request. A failing test
suite blocks merging. The Playwright job uploads HTML reports as artifacts.
```

### Runner config

#### Next.js / React + Node — `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx", "src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      reporter: ["text", "html", "lcov"],
      exclude: ["**/*.config.*", "**/node_modules/**", "**/.next/**"],
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
```

#### NestJS-Enterprise — `jest.config.ts` (or Vitest if the project prefers)

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/tests/**/*.spec.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  coverageReporters: ["text", "lcov", "html"],
};

export default config;
```

#### All families — `playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
```

---

## Phase 4: Create CI/CD Workflow

`.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --reporter=default --coverage

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium firefox
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

For NestJS projects without a built-in start command, add a service container
(Postgres, Redis) under `services:` and a step that runs migrations before
the e2e job.

---

## Phase 5: Create Smoke Test Seed

`tests/smoke/README.md`:

```markdown
# Smoke Test Checklist

A focused list of critical-path checks the team runs before declaring a
build ready for QA. Run this list manually for any new sprint and update
when the critical path changes.

## Core Stability (always run)

- [ ] App boots in under 5 seconds locally
- [ ] Sign-in works for an existing test tenant
- [ ] Sign-out clears the session and redirects to sign-in
- [ ] Dashboard renders without console errors

## Core Workflow (update per sprint)

- [ ] [Sprint primary workflow] — happy path completes end-to-end
- [ ] [Critical async job] — fires and completes within budget

## Data Integrity

- [ ] Multi-tenant isolation: tenant A cannot see tenant B's data
- [ ] Audit log entries appear for privileged actions

## Performance

- [ ] First meaningful paint on the dashboard ≤ 2.5s on a fresh session
```

---

## Phase 6: Post-Setup Summary

```
✅ Test infrastructure ready

Files created:
- tests/{unit,integration,helpers,smoke,evidence}/
- e2e/
- vitest.config.ts | jest.config.ts
- playwright.config.ts
- .github/workflows/tests.yml

Recommended next steps:
1. Run `pnpm test` — confirm the empty suite passes
2. Run `pnpm exec playwright install --with-deps`
3. Run `/test-helpers scaffold` to generate factories and assertion helpers
4. Write the first unit test for any logic that already exists
5. Wire DB migrations into the e2e job's setup if the project has them

Maintenance:
- Re-run `/test-setup force` after a major framework version upgrade
- Update `tests/smoke/README.md` at the start of each sprint
```

---

## Collaborative Protocol

- **Never overwrite existing test runner config without showing the diff**
  and asking for explicit approval
- **Match the package manager** the project uses (`npm` / `pnpm` / `yarn`)
  in CI commands
- **Adapt to the chosen ORM** for the integration setup (Prisma migrate vs
  TypeORM migrations vs Drizzle migrations)
- **Match the project's chosen e2e port** (default 3000 for Next.js, but
  the project may use a different one)
