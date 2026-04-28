---
name: ux-review
description: "Validates a UX spec, dashboard design, or interaction pattern library for completeness, accessibility compliance, PRD alignment, and implementation readiness. Produces APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED verdict with specific gaps."
argument-hint: "[file-path or 'all' or 'dashboard' or 'patterns']"
user-invocable: true
allowed-tools: Read, Glob, Grep
agent: ux-designer
---

## Overview

Validates UX design documents before they enter the implementation pipeline.
Acts as the quality gate between UX Design and Visual Design/Implementation in
the `/team-ui` pipeline.

**Run this skill:**
- After completing a UX spec with `/ux-design`
- Before handing off to `frontend-engineer` or `design-director`
- Before the Pre-Production to Production gate check (which requires key screens
 to have reviewed UX specs)
- After major revisions to a UX spec

**Verdict levels:**
- **APPROVED** — spec is complete, consistent, and implementation-ready
- **NEEDS REVISION** — specific gaps found; fix before handoff but not a full redesign
- **MAJOR REVISION NEEDED** — fundamental issues with scope, user need, or
 completeness; needs significant rework

---

## Phase 1: Parse Arguments

- **Specific file path** (e.g., `/ux-review design/ux/inventory.md`): validate
 that one document
- **`all`**: find all files in `design/ux/` and validate each
- **`dashboard`**: validate `design/ux/dashboard.md` specifically
- **`patterns`**: validate `design/ux/interaction-patterns.md` specifically
- **No argument**: ask the user which spec to validate

For `all`, output a summary table first (file | verdict | primary issue) then
full detail for each.

---

## Phase 2: Load Cross-Reference Context

Before validating any spec, load:

1. **Input & Platform config**: Read `.claude/docs/technical-preferences.md` and
 extract `## Input & Platform`. This is the authoritative source for which input
 methods the product supports — use it to drive the Input Method Coverage checks in
 Phase 3A, not the spec's own header. If unconfigured, fall back to the spec header.
2. The accessibility tier committed to in `design/accessibility-requirements.md`
 (if it exists)
3. The interaction pattern library at `design/ux/interaction-patterns.md` (if
 it exists)
4. The PRDs referenced in the spec's header (read their UI Requirements sections)
5. The user journey map at `design/user-journey.md` (if it exists) for
 context-arrival validation

---

## Phase 3A: UX Spec Validation Checklist

Run all checks against a `ux-spec.md`-based document.

### Completeness (required sections)

- [ ] Document header present with Status, Author, Platform Target
- [ ] Purpose & User Need — has a user-perspective need statement (not
 developer-perspective)
- [ ] User Context on Arrival — describes user's state and prior activity
- [ ] Navigation Position — shows where screen sits in hierarchy
- [ ] Entry & Exit Points — all entry sources and exit destinations documented
- [ ] Layout Specification — zones defined, component inventory table present
- [ ] States & Variants — at minimum: loading, empty/populated, and error states
 documented
- [ ] Interaction Map — covers all target input methods (check platform target
 in header)
- [ ] Data Requirements — every displayed data element has a source system and owner
- [ ] Events Fired — every user action has a corresponding event or null
 explanation
- [ ] Transitions & Animations — at least enter/exit transitions specified
- [ ] Accessibility Requirements — screen-level requirements present
- [ ] Localization Considerations — max character counts for text elements
- [ ] Acceptance Criteria — at least 5 specific testable criteria

### Quality Checks

**User Need Clarity**
- [ ] Purpose is written from user perspective, not system/developer perspective
- [ ] User goal on arrival is unambiguous ("The user arrives wanting to ___")
- [ ] The user context on arrival is specific (not just "they opened the
 inventory")

**Completeness of States**
- [ ] Error state is documented (not just happy path)
- [ ] Empty state is documented (no data scenario)
- [ ] Loading state is documented if the screen fetches async data
- [ ] Any state with a timer or auto-dismiss is documented with duration

**Input Method Coverage**
- [ ] If desktop web: keyboard-only navigation is fully specified
- [ ] If mobile/tablet: touch targets meet 44×44 CSS px minimum and gestures
 documented
- [ ] No interaction requires hover-only behavior (every hover affordance
 also reachable via focus or click)
- [ ] Focus order is defined (Tab order for keyboard, with visible focus
 indicators)

**Data Architecture**
- [ ] No data element has "UI" listed as the owner (UI must not own server state)
- [ ] Update frequency is specified for all real-time data (not just "realtime" —
 what triggers update?)
- [ ] Null handling is specified for all data elements (what shows when data is
 unavailable?)

**Accessibility**
- [ ] Accessibility tier from `accessibility-requirements.md` is matched or exceeded
- [ ] If Basic tier: no color-only information indicators
- [ ] If Standard tier+: focus order documented, text contrast ratios specified
- [ ] If Comprehensive tier+: screen reader announcements for key state changes
- [ ] Colorblind check: any color-coded elements have non-color alternatives

**PRD Alignment**
- [ ] Every PRD UI Requirement referenced in the header is addressed in this spec
- [ ] No UI element displays or modifies product state without a corresponding PRD
 requirement
- [ ] No PRD UI Requirement is missing from this spec (cross-check the referenced
 PRD sections)

**Pattern Library Consistency**
- [ ] All interactive components reference the pattern library (or note they are
 new patterns)
- [ ] No pattern behavior is re-specified from scratch if it already exists in
 the pattern library
- [ ] Any new patterns invented in this spec are flagged for addition to the
 pattern library

**Localization**
- [ ] Character limit warnings present for all text-heavy elements
- [ ] Any layout-critical text has been flagged for 40% expansion accommodation

**Acceptance Criteria Quality**
- [ ] Criteria are specific enough for a QA tester who hasn't seen the design docs
- [ ] Performance criterion present (screen opens within Xms)
- [ ] Resolution criterion present
- [ ] No criterion requires reading another document to evaluate

---

## Phase 3B: Dashboard Validation Checklist

Run all checks against a `dashboard-design.md`-based document.

### Completeness

- [ ] Dashboard Philosophy defined (sparse / standard / dense / adaptive)
- [ ] Core Promise stated (what the user knows in 5 seconds)
- [ ] Information Architecture covers ALL PRDs whose data should appear at-a-glance
- [ ] Layout Zones defined with responsive breakpoint behavior
- [ ] Every widget has empty / loading / error states specified
- [ ] Refresh Model declared (live / auto-refresh / manual / snapshot) with
 "last updated" affordance
- [ ] Drill-down rule applied consistently — every widget either drills down or
 explicitly does not
- [ ] Permissions & Multi-tenancy section confirms no cross-tenant leakage
- [ ] Performance Budget defined (TTFB, time-to-first-widget, time-to-settled)

### Quality Checks

- [ ] No widget displays raw IDs or internal codes without a friendly label
- [ ] Every information item from any PRD is either on the dashboard or
 explicitly categorized as "off-dashboard"
- [ ] All color-coded charts have non-color encoding (shape, label, or icon
 fallback)
- [ ] Activity feed and notification widgets have grouping / collapse behavior
 defined
- [ ] Performance Budget compliance: estimated network round-trips on initial
 load is within budget

### PRD Alignment

- [ ] All systems in `design/prd/systems-index.md` with UI category have
 dashboard representation (or justified absence)

---

## Phase 3C: Pattern Library Validation Checklist

- [ ] Pattern catalog index is current (matches actual patterns in document)
- [ ] All standard control patterns are specified: button variants, toggle,
 slider, dropdown, list, grid, modal, dialog, toast, tooltip, progress bar,
 input field, tab bar, scroll
- [ ] All product-specific patterns needed by current UX specs are present
- [ ] Each pattern has: When to Use, When NOT to Use, full state specification,
 accessibility spec, implementation notes
- [ ] Animation Standards table present
- [ ] Sound Standards table present
- [ ] No conflicting behaviors between patterns (e.g., "Back" behavior consistent
 across all navigation patterns)

---

## Phase 4: Output the Verdict

```markdown
## UX Review: [Document Name]
**Date**: [date]
**Reviewer**: ux-review skill
**Document**: [file path]
**Platform Target**: [from header]
**Accessibility Tier**: [from header or accessibility-requirements.md]

### Completeness: [X/Y sections present]
- [x] Purpose & User Need
- [ ] States & Variants — MISSING: error state not documented

### Quality Issues: [N found]
1. **[Issue title]** [BLOCKING / ADVISORY]
 - What's wrong: [specific description]
 - Where: [section name]
 - Fix: [specific action to take]

### PRD Alignment: [ALIGNED / GAPS FOUND]
- PRD [name] UI Requirements — [X/Y requirements covered]
- Missing: [list any uncovered PRD requirements]

### Accessibility: [COMPLIANT / GAPS / NON-COMPLIANT]
- Target tier: [tier]
- [list specific accessibility findings]

### Pattern Library: [CONSISTENT / INCONSISTENCIES FOUND]
- [findings]

### Verdict: APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED
**Blocking issues**: [N] — must be resolved before implementation
**Advisory issues**: [N] — recommended but not blocking

[For APPROVED]: This spec is ready for handoff to `/team-ui` Phase 2
(Visual Design).

[For NEEDS REVISION]: Address the [N] blocking issues above, then re-run
`/ux-review`.

[For MAJOR REVISION NEEDED]: The spec has fundamental gaps in [areas].
Recommend returning to `/ux-design` to rework [sections].
```

---

## Phase 5: Collaborative Protocol

This skill is READ-ONLY — it never edits or writes files. It reports findings only.

After delivering the verdict:
- For **APPROVED**: suggest running `/team-ui` to begin implementation coordination
- For **NEEDS REVISION**: offer to help fix specific gaps ("Would you like me to
 help draft the missing error state?") — but do not auto-fix; wait for user
 instruction
- For **MAJOR REVISION NEEDED**: suggest returning to `/ux-design` with the
 specific sections to rework

Never block the user from proceeding — the verdict is advisory. Document risks,
present findings, let the user decide whether to proceed despite concerns. A user
who chooses to proceed with a NEEDS REVISION spec takes on the documented risk.
