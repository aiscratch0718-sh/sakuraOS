# Coding Standards

- All product code must include doc comments on public APIs
- Every system must have a corresponding architecture decision record in `docs/architecture/`
- User-facing behavior values must be data-driven (external config), never hardcoded
- All public methods must be unit-testable (dependency injection over singletons)
- Commits must reference the relevant design document or task ID
- **Verification-driven development**: Write tests first when adding user flow systems.
 For UI changes, verify with screenshots. Compare expected output to actual output
 before marking work complete. Every implementation should have a way to prove it works.

# Design Document Standards

- All design docs use Markdown
- Each mechanic has a dedicated document in `design/prd/`
- Documents must include these 8 required sections:
 1. **Overview** -- one-paragraph summary
 2. **User Fantasy** -- intended feeling and experience
 3. **Detailed Rules** -- unambiguous mechanics
 4. **Formulas** -- all math defined with variables
 5. **Edge Cases** -- unusual situations handled
 6. **Dependencies** -- other systems listed
 7. **Tuning Knobs** -- configurable values identified
 8. **Acceptance Criteria** -- testable success conditions
- Feature Tradeoff values must link to their source formula or rationale

# Testing Standards

## Test Evidence by Story Type

All stories must have appropriate test evidence before they can be marked Done:

| Story Type | Required Evidence | Location | Gate Level |
|---|---|---|---|
| **Logic** (formulas, business rules, state machines) | Automated unit test — must pass | `tests/unit/[area]/` | BLOCKING |
| **Integration** (multi-system) | Integration test OR documented usability test | `tests/integration/[area]/` | BLOCKING |
| **Visual / Feel** (animation, motion, theme) | Screenshot / video + lead sign-off | `production/qa/evidence/` | ADVISORY |
| **UI** (navigation, dashboards, screens) | Manual walkthrough doc OR component interaction test | `production/qa/evidence/` | ADVISORY |
| **Config / Data** (entitlements, pricing, feature flags) | Smoke check pass | `production/qa/smoke-[date].md` | ADVISORY |

## Automated Test Rules

- **Naming**: `[system]_[feature]_test.[ext]` for files; `test_[scenario]_[expected]` for functions
- **Determinism**: Tests must produce the same result every run — no random seeds, no time-dependent assertions
- **Isolation**: Each test sets up and tears down its own state; tests must not depend on execution order
- **No hardcoded data**: Test fixtures use constant files or factory functions, not inline magic numbers
 (exception: boundary value tests where the exact number IS the point)
- **Independence**: Unit tests do not call external APIs, databases, or file I/O — use dependency injection

## What NOT to Automate

- Visual fidelity (theme output, motion curves)
- "Feel" qualities (perceived responsiveness, timing nuance)
- Cross-browser rendering (test on real browsers, not headlessly only)
- Full multi-session customer flows (covered by usability testing, not automation)

## CI/CD Rules

- Automated test suite runs on every push to main and every PR
- No merge if tests fail — tests are a blocking gate in CI
- Never disable or skip failing tests to make CI pass — fix the underlying issue
- Framework-family-specific CI commands (defaults; project may override):
 - **Next.js**: `pnpm test` (Vitest unit) + `pnpm test:e2e` (Playwright)
 - **React + Node**: `pnpm test` + `pnpm test:e2e`
 - **NestJS**: `pnpm test` (Jest unit) + `pnpm test:e2e` (supertest against `INestApplication`)
