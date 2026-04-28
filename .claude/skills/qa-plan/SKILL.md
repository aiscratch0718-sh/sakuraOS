---
name: qa-plan
description: "Generate a QA test plan for a sprint or feature. Reads PRDs and story files, classifies stories by test type (Logic/Integration/Visual/UI), and produces a structured test plan covering automated tests required, manual test cases, smoke test scope, and usability test sign-off requirements. Run before sprint begins or when starting a major feature."
argument-hint: "[sprint | feature: system-name | story: path]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion
agent: qa-lead
---

# QA Plan

This skill generates a structured QA plan for a sprint, feature, or individual
story. It reads all in-scope story files and their referenced PRDs, classifies
each story by test type, and produces a plan that tells developers exactly what
to automate, what to verify manually, what the smoke test scope is, and when
to bring in a usability tester.

Run this before a sprint begins so the team knows upfront what testing work
is required. A test plan written after implementation is a post-mortem, not a
plan.

**Output:** `production/qa/qa-plan-[sprint-slug]-[date].md`

---

## Phase 1: Parse Scope

**Argument:** `$ARGUMENTS` (blank = ask user via AskUserQuestion)

Determine scope from the argument:

- **`sprint`** — read the most recent file in `production/sprints/`, extract
 every story file path referenced. If `production/sprint-status.yaml` exists,
 use it as the primary story list and fall back to the sprint plan for story
 metadata.
- **`feature: [system-name]`** — glob `production/epics/*/story-*.md`, filter
 to stories whose file path or title contains the system name. Also check the
 epic index file (`EPIC.md`) in that system's directory.
- **`story: [path]`** — validate that the path exists and load that single file.
- **No argument** — use `AskUserQuestion`:
 - "What is the scope for this QA plan?"
 - Options: "Current sprint", "Specific feature (enter system name)",
 "Specific story (enter path)", "Full epic"

After resolving scope, report: "Building QA plan for [N] stories in [scope]."

If a story file path is referenced but the file does not exist, note it as
MISSING and continue with the remaining stories. Do not fail the entire plan
for one missing file.

---

## Phase 2: Load Inputs

For each in-scope story file, read the full file and extract:

- **Story title** and story ID (from filename or header)
- **Story Type** field (if present in the file header — e.g., `Type: Logic`)
- **Acceptance criteria** — the complete numbered/bulleted list
- **Implementation files** — listed under "Files to Create / Modify" or similar
- **Framework notes** — any framework API warnings or version-specific notes
- **PRD reference** — the PRD path(s) cited
- **ADR reference** — the ADR(s) cited
- **Estimate** — hours or story points if present
- **Dependencies** — other stories this one depends on

After reading stories, load supporting context once (not per story):

- `design/prd/systems-index.md` — to understand system priorities and which
 PRDs are approved
- For each unique PRD referenced across all stories: read only the
 **Acceptance Criteria** and **Formulas** sections. Do not load full PRD text —
 these two sections contain the testable requirements and the math to verify.
- `docs/architecture/control-manifest.md` — scan for forbidden patterns that
 automated tests should guard against (if the file exists)

If no PRD is referenced in a story, note it as a gap but do not block the plan.
The story will be classified using acceptance criteria alone.

---

## Phase 3: Classify Each Story

For each story, assign a Story Type. If the story already has a `Type:` field
in its header, use that value and validate it against the criteria below. If the
field is missing or ambiguous, infer the type from the acceptance criteria.

| Story Type | Classification Indicators |
|---|---|
| **Logic** | Acceptance criteria reference calculations, formulas, numerical thresholds, state transitions, validation rules, billing rules, or any testable computation |
| **Integration** | Criteria involve two or more systems interacting, domain events propagating across feature boundaries, database round-trips, queue jobs, webhook ingress / egress, or persistence |
| **Visual / Feel** | Criteria reference animation behaviour, motion, perceived timing, focus order, transition quality, or visual feedback quality |
| **UI** | Criteria reference navigation, dashboard widgets, list / detail screens, forms, dialogs, toasts, tooltips, or any user-facing interface element |
| **Config / Data** | Changes are limited to entitlement / pricing / feature-flag values, seed data, or configuration — no new code logic is involved |

**Mixed stories** (e.g., a story that adds both a formula and a UI display):
assign the primary type based on which acceptance criteria carry the highest
implementation risk, and note the secondary type. Mixed Logic+Integration or
Visual+UI combinations are the most common.

After classifying all stories, produce a classification summary table in
conversation before proceeding to Phase 4. This gives the user visibility into
how tests will be allocated.

---

## Phase 4: Generate Test Plan

Assemble the full QA plan document. Use this structure:

````markdown
# QA Plan: [Sprint/Feature Name]
**Date**: [date]
**Generated by**: /qa-plan
**Scope**: [N stories across [N systems]]
**Framework**: [framework name from .claude/docs/technical-preferences.md, or "Not configured"]
**Sprint File**: [path to sprint plan if applicable]

---

## Test Summary

| Story | Type | Automated Test Required | Manual Verification Required |
|-------|------|------------------------|------------------------------|
| [story title] | Logic | Unit test — `tests/unit/[system]/` | None |
| [story title] | Integration | Integration test — `tests/integration/[system]/` | Smoke check |
| [story title] | Visual/Feel | None (not automatable) | Screenshot + lead sign-off |
| [story title] | UI | Interaction walkthrough | Manual step-through |
| [story title] | Config/Data | Data validation test | Spot-check in-app values |

---

## Automated Tests Required

### [Story Title] — [Type]
**Test file path**: `tests/[unit|integration]/[system]/[story-slug]_test.[ext]`
**What to test**:
- [Specific formula or rule from the PRD Formulas section]
- [Each named state transition or decision branch]
- [Each side effect that should or should not occur]

**Edge cases to cover**:
- Zero/minimum input values (e.g., 0 damage, empty inventory)
- Maximum/boundary input values (e.g., max level, stat cap)
- Invalid or null input (e.g., missing target, dead entity)
- [Any edge case explicitly called out in the PRD Edge Cases section]

**Estimated test count**: ~[N] unit tests

[If no PRD formula reference was found for this story, note:]
*No formula found in referenced PRD — test cases must be derived from acceptance
criteria directly. Review the PRD Formulas section before writing tests.*

---

## Manual QA Checklist

### [Story Title] — [Type]
**Verification method**: [Screenshot + designer sign-off | Usability Test session |
Manual step-through | Comparison against reference footage]
**Who must sign off**: [designer / lead-engineer / qa-lead / art-lead]
**Evidence to capture**: [screenshot of X | video clip of Y | written usability test
notes | side-by-side comparison]

Checklist:
- [ ] [Specific observable condition — concrete and falsifiable]
- [ ] [Another condition]
- [ ] [Every acceptance criterion translated into a manual check item]

*If any criterion uses subjective language ("feels", "looks", "seems"), it must
be supplemented with a specific benchmark or a usability test protocol note.*

---

## Smoke Test Scope

Critical paths to verify before any QA hand-off for this sprint:

1. Product launches to main menu without crash
2. New product / new session can be started
3. [Primary mechanic introduced or changed this sprint]
4. [Any system with a regression risk from this sprint's changes]
5. Save / load cycle completes without data loss (if save system exists)
6. Performance is within budget on target hardware (no new frame spikes)

*Smoke tests are verified by the developer via `/smoke-check`. Reference this
list when running that skill.*

---

## Usability Test Requirements

| Story | Usability Test Goal | Min Sessions | Target User Type |
|-------|--------------|--------------|-------------------|
| [story] | [What question must the session answer?] | [N] | [new user / experienced] |

**Sign-off requirement**: Usability Test notes must be written to
`production/session-logs/usability test-[sprint]-[story-slug].md` and reviewed by
the [designer / qa-lead] before the story can be marked COMPLETE.

If no stories require usability test validation: *No usability test sessions required for
this sprint.*

---

## Definition of Done — This Sprint

A story is DONE when ALL of the following are true:

- [ ] All acceptance criteria verified — via automated test result OR documented
 manual evidence (screenshot, video, or usability test notes with sign-off)
- [ ] Test file exists at the specified path for all Logic and Integration stories
- [ ] Manual evidence document exists for all Visual/Feel and UI stories
- [ ] Smoke check passes (run `/smoke-check sprint` before QA hand-off)
- [ ] No regressions introduced
- [ ] Code reviewed (via `/code-review` or documented peer review)
- [ ] Story file updated to `Status: Complete` (via `/story-done`)
````

When generating content, use the actual story titles, PRD formula text, and
acceptance criteria extracted in Phase 2. Do not use placeholder text — every
test entry should reflect the real requirements of these specific stories.

---

## Phase 5: Write Output

Show the complete plan in conversation (or a summary if the plan is very long),
then ask:

"May I write this QA plan to `production/qa/qa-plan-[sprint-slug]-[date].md`?"

Write the plan exactly as generated — do not truncate.

After writing:

"QA plan written to `production/qa/qa-plan-[sprint-slug]-[date].md`.

Next steps:
- Share this plan with the team before sprint implementation begins
- Run `/smoke-check sprint` after all stories are implemented to gate QA hand-off
- For Logic/Integration stories, create the test files at the listed paths
 before marking stories done — `/story-done` checks for them"

---

## Collaborative Protocol

- **Never write the plan without asking** — Phase 5 requires explicit approval.
- **Classify conservatively**: when a story is ambiguous between Logic and
 Integration, classify it as Integration — it requires both unit and
 integration tests.
- **Do not invent test cases** beyond what acceptance criteria and PRD formulas
 support. If a formula is absent from the PRD, flag it rather than guessing.
- **Usability Test requirements are advisory**: the user decides whether a usability test
 is warranted for borderline Visual/Feel stories. Flag the case; do not mandate.
- Use `AskUserQuestion` for scope selection when no argument is provided.
 Keep all other phases non-interactive — present findings, then ask once to
 approve the write.
