---
name: smoke-check
description: "Run the critical path smoke test gate before QA hand-off. Executes the automated test suite, verifies core functionality, and produces a PASS/FAIL report. Run after a sprint's stories are implemented and before manual QA begins. A failed smoke check means the build is not ready for QA."
argument-hint: "[sprint | quick | --surface desktop|mobile|all]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, AskUserQuestion
---

# Smoke Check

This skill is the gate between "implementation done" and "ready for QA
hand-off". It runs the automated test suite, checks for test coverage gaps,
batch-verifies critical paths with the developer, and produces a PASS/FAIL
report.

The rule is simple: **a build that fails smoke check does not go to QA.**
Handing a broken build to QA wastes their time and demoralises the team.

**Output:** `production/qa/smoke-[date].md`

---

## Parse Arguments

Arguments can be combined: `/smoke-check sprint --surface mobile`

**Base mode** (first argument, default: `sprint`):
- `sprint` — full smoke check against the current sprint's stories
- `quick` — skip coverage scan (Phase 3) and Batch 3; use for rapid re-checks

**Surface flag** (`--surface`, default: none):
- `--surface desktop` — add desktop-web checks (keyboard nav, hover states,
  large viewport reflow)
- `--surface mobile` — add mobile-web checks (touch targets, viewport
  rotation, narrow-viewport reflow)
- `--surface all` — add all surface variants; output per-surface verdict table

If `--surface` is provided, Phase 4 adds surface-specific batches and
Phase 5 outputs a per-surface verdict table in addition to the overall verdict.

---

## Phase 1: Detect Test Setup

Before running anything, understand the environment:

1. **Test framework check**: verify `tests/` directory exists.
 If it does not: "No test directory found at `tests/`. Run `/test-setup`
 to scaffold the testing infrastructure, or create the directory manually
 if tests live elsewhere." Then stop.

2. **CI check**: check whether `.github/workflows/` contains a workflow file
 referencing tests. Note in the report whether CI is configured.

3. **Framework detection**: read `.claude/docs/technical-preferences.md` and
 extract the `Framework:` value. Store this for test command selection in
 Phase 2.

4. **Smoke test list**: check whether `production/qa/smoke-tests.md` or
 `tests/smoke/` exists. If a smoke test list is found, load it for use in
 Phase 4. If neither exists, smoke tests will be drawn from the current QA
 plan (Phase 4 fallback).

5. **QA plan check**: glob `production/qa/qa-plan-*.md` and take the most
 recently modified file. If found, note the path — it will be used in
 Phase 3 and Phase 4. If not found, note: "No QA plan found. Run
 `/qa-plan sprint` before smoke-checking for best results."

Report findings before proceeding: "Environment: [framework]. Test directory:
[found / not found]. CI configured: [yes / no]. QA plan: [path / not found]."

---

## Phase 2: Run Automated Tests

Attempt to run the test suite via Bash. Select the command based on the framework
detected in Phase 1:

**Next.js:**
```bash
nextjs --headless --script tests/gdunit4_runner.ts 2>&1
```
If the GDUnit4 runner script does not exist at that path, try:
```bash
nextjs --headless -s addons/gdunit4/GdUnitRunner.ts 2>&1
```
If neither path exists, note: "GDUnit4 runner not found — confirm the runner
path for your test framework."

**React:**
React tests require the editor and cannot be run headlessly via shell in most
environments. Check for recent test result artifacts:
```bash
ls -t test-results/ 2>/dev/null | head -5
```
If test result files exist (XML or JSON), read the most recent one and parse
PASS/FAIL counts. If no artifacts exist: "React tests must be run from the
editor or CI pipeline. Please confirm test status manually before proceeding."

**NestJS:**
```bash
ls -t Saved/Logs/ 2>/dev/null | grep -i "test\|automation" | head -5
```
If no matching log found: "UE automation tests must be run via the Session
Frontend or CI pipeline. Please confirm test status manually."

**Unknown framework / not configured:**
"Framework not configured in `.claude/docs/technical-preferences.md`. Run
`/setup-stack` to specify the framework, then re-run `/smoke-check`."

**If the test runner is not available in this environment** (framework binary not
on PATH, runner script not found, etc.), report clearly:

"Automated tests could not be executed — framework binary not found on PATH.
Status will be recorded as NOT RUN. Confirm test results from your local IDE
or CI pipeline. Unconfirmed NOT RUN is treated as PASS WITH WARNINGS, not
FAIL — the developer must manually confirm results."

Do not treat NOT RUN as an automatic FAIL. Record it as a warning. The
developer's manual confirmation in Phase 4 can resolve it.

Parse runner output and extract:
- Total tests run
- Passing count
- Failing count
- Names of any failing tests (up to 10; if more, note the count)
- Any crash or error output from the runner itself

---

## Phase 3: Check Test Coverage

Draw the story list from, in priority order:
1. The QA plan found in Phase 1 (its Test Summary table lists expected test
 file paths per story)
2. The current sprint plan from `production/sprints/` (most recently modified
 file)
3. If the `quick` argument was passed, skip this phase entirely and note:
 "Coverage scan skipped — run `/smoke-check sprint` for full coverage
 analysis."

For each story in scope:

1. Extract the system slug from the story's file path
 (e.g., `production/epics/billing/story-001.md` → `billing`)
2. Glob `tests/unit/[system]/` and `tests/integration/[system]/` for files
 whose name contains the story slug or a closely related term
3. Check the story file itself for a `Test file:` header field or a
 "Test Evidence" section

Assign a coverage status to each story:

| Status | Meaning |
|--------|---------|
| **COVERED** | A test file was found matching this story's system and scope |
| **MANUAL** | Story type is Visual/Feel or UI; a test evidence document was found |
| **MISSING** | Logic or Integration story with no matching test file |
| **EXPECTED** | Config/Data story — no test file required; spot-check is sufficient |
| **UNKNOWN** | Story file missing or unreadable |

MISSING entries are advisory gaps. They do not cause a FAIL verdict but must
appear prominently in the report and must be resolved before `/story-done` can
fully close those stories.

---

## Phase 4: Run Manual Smoke Checks

Draw the smoke test checklist from, in priority order:
1. The QA plan's "Smoke Test Scope" section (if QA plan was found in Phase 1)
2. `production/qa/smoke-tests.md` (if it exists)
3. `tests/smoke/` directory contents (if it exists)
4. The standard fallback list below (used only when none of the above exist)

Tailor batches 2 and 3 to the actual systems identified from the sprint or QA
plan. Replace bracketed placeholders with real mechanic names from the current
sprint's stories.

Use `AskUserQuestion` to batch-verify. Keep to at most 3 calls.

**Batch 1 — Core stability (always run):**
```
question: "Smoke check — Batch 1: Core stability. Please verify each:"
options:
 - "Product launches to main menu without crash — PASS"
 - "Product launches to main menu without crash — FAIL"
 - "New product / session starts successfully — PASS"
 - "New product / session starts successfully — FAIL"
 - "Main menu responds to all inputs — PASS"
 - "Main menu responds to all inputs — FAIL"
```

**Batch 2 — Sprint mechanic and regression (always run):**
```
question: "Smoke check — Batch 2: This sprint's changes and regression check:"
options:
 - "[Primary mechanic this sprint] — PASS"
 - "[Primary mechanic this sprint] — FAIL: [describe what broke]"
 - "[Second notable change this sprint, if any] — PASS"
 - "[Second notable change this sprint] — FAIL"
 - "Previous sprint's features still work (no regressions) — PASS"
 - "Previous sprint's features — regression found: [brief description]"
```

**Batch 3 — Data integrity and performance (run unless `quick` argument):**
```
question: "Smoke check — Batch 3: Data integrity and performance:"
options:
 - "Save / load completes without data loss — PASS"
 - "Save / load — FAIL: [describe what broke]"
 - "Save / load — N/A (save system not yet implemented)"
 - "No new frame rate drops or hitches observed — PASS"
 - "Frame rate drops or hitches found — FAIL: [where]"
 - "Performance — not checked in this session"
```

Record each response verbatim for the Phase 5 report.

**Surface Batches** *(run only if `--surface` argument was provided)*:

**Desktop web** (`--surface desktop` or `--surface all`):
```
question: "Smoke check — Desktop Web: Verify surface-specific behaviour:"
options:
 - "Keyboard navigation reaches every interactive element with visible focus — PASS"
 - "Keyboard navigation — FAIL: [describe what is unreachable]"
 - "Hover states render correctly; nothing is hover-only — PASS"
 - "Hover-only behavior — FAIL: [describe]"
 - "Layout reflows correctly at the largest supported viewport (≥1920px) — PASS"
 - "Large viewport — FAIL: [describe what overflows]"
 - "Browser back / forward / refresh preserve expected state — PASS"
 - "Browser navigation — FAIL: [describe issue]"
```

**Mobile web** (`--surface mobile` or `--surface all`):
```
question: "Smoke check — Mobile Web: Verify surface-specific behaviour:"
options:
 - "Touch targets meet 44×44 CSS px minimum — PASS"
 - "Touch targets — FAIL: [describe small targets]"
 - "Layout reflows correctly down to 320px width — PASS"
 - "Narrow viewport — FAIL: [describe what overflows]"
 - "Orientation change (portrait ↔ landscape) preserves state — PASS"
 - "Orientation change — FAIL: [describe what breaks]"
 - "iOS / Android in-app browser quirks handled (Safari, Chrome Mobile) — PASS"
 - "Mobile browser quirk — FAIL: [describe issue]"
```

---

## Phase 5: Generate Report

Assemble the full smoke check report:

````markdown
## Smoke Check Report
**Date**: [date]
**Sprint**: [sprint name / number, or "Not identified"]
**Framework**: [framework]
**QA Plan**: [path, or "Not found — run /qa-plan first"]
**Argument**: [sprint | quick | blank]

---

### Automated Tests

**Status**: [PASS ([N] tests, [N] passing) | FAIL ([N] failures) |
NOT RUN ([reason])]

[If FAIL, list failing tests:]
- `[test name]` — [brief failure description from runner output]

[If NOT RUN:]
"Manual confirmation required: did tests pass in your local IDE or CI? This
will determine whether the automated test row contributes to a FAIL verdict."

---

### Test Coverage

| Story | Type | Test File | Coverage Status |
|-------|------|-----------|----------------|
| [title] | Logic | `tests/unit/[system]/[slug]_test.[ext]` | COVERED |
| [title] | Visual/Feel | `tests/evidence/[slug]-screenshots.md` | MANUAL |
| [title] | Logic | — | MISSING ⚠ |
| [title] | Config/Data | — | EXPECTED |

**Summary**: [N] covered, [N] manual, [N] missing, [N] expected.

---

### Manual Smoke Checks

- [x] Product launches without crash — PASS
- [x] New product starts — PASS
- [x] [Core mechanic] — PASS
- [ ] [Other check] — FAIL: [user's description]
- [x] Save / load — PASS
- [-] Performance — not checked this session

---

### Missing Test Evidence

Stories that must have test evidence before they can be marked COMPLETE via
`/story-done`:

- **[story title]** (`[path]`) — Logic story has no test file.
 Expected location: `tests/unit/[system]/[story-slug]_test.[ext]`

[If none:] "All Logic and Integration stories have test coverage."

---

### Platform-Specific Results *(only if `--platform` was provided)*

| Platform | Checks Run | Passed | Failed | Platform Verdict |
|----------|-----------|--------|--------|-----------------|
| PC | [N] | [N] | [N] | PASS / FAIL |
| Console | [N] | [N] | [N] | PASS / FAIL |
| Mobile | [N] | [N] | [N] | PASS / FAIL |

**Platform notes**: [any platform-specific observations not captured in pass/fail]

Any platform with one or more FAIL checks contributes to the overall FAIL verdict.

---

### Verdict: [PASS | PASS WITH WARNINGS | FAIL]

[Verdict rules — first matching rule wins:]

**FAIL** if ANY of:
- Automated test suite ran and reported one or more test failures
- Any Batch 1 (core stability) check returned FAIL
- Any Batch 2 (primary sprint mechanic or regression check) returned FAIL

**PASS WITH WARNINGS** if ALL of:
- Automated tests PASS or NOT RUN (developer has not yet confirmed)
- All Batch 1 and Batch 2 smoke checks PASS
- One or more Logic/Integration stories have MISSING test evidence

**PASS** if ALL of:
- Automated tests PASS
- All smoke checks in all batches PASS or N/A
- No MISSING test evidence entries
````

---

## Phase 6: Write and Gate

Present the full report in conversation, then ask:

"May I write this smoke check report to `production/qa/smoke-[date].md`?"

Write only after approval.

After writing, deliver the gate verdict:

**If verdict is FAIL:**

"The smoke check failed. Do not hand off to QA until these failures are
resolved:

[List each failing automated test or smoke check with a one-line description]

Fix the failures and run `/smoke-check` again to re-gate before QA hand-off."

**If verdict is PASS WITH WARNINGS:**

"Smoke check passed with warnings. The build is ready for manual QA.

Advisory items to resolve before running `/story-done` on affected stories:
[list MISSING test evidence entries]

QA hand-off: share `production/qa/qa-plan-[sprint].md` with the qa-engineer
agent to begin manual verification."

**If verdict is PASS:**

"Smoke check passed cleanly. The build is ready for manual QA.

QA hand-off: share `production/qa/qa-plan-[sprint].md` with the qa-engineer
agent to begin manual verification."

---

## Collaborative Protocol

- **Never treat NOT RUN as automatic FAIL** — record it as NOT RUN and let
 the developer confirm status manually. Unconfirmed NOT RUN contributes to
 PASS WITH WARNINGS, not FAIL.
- **Never auto-fix failures** — report them and state what must be resolved.
 Do not attempt to edit source code or test files.
- **PASS WITH WARNINGS does not block QA hand-off** — it records advisory
 gaps for `/story-done` to follow up on.
- **`quick` argument** skips Phase 3 (coverage scan) and Phase 4 Batch 3.
 Use it for rapid re-checks after fixing a specific failure.
- Use `AskUserQuestion` for all manual smoke check verification.
- **Never write the report without asking** — Phase 6 requires explicit
 approval before any file is created.
