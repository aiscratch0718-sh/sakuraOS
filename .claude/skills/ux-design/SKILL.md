---
name: ux-design
description: "Guided, section-by-section UX spec authoring for a screen, flow, or dashboard. Reads product concept, user journey, and relevant PRDs to provide context-aware design guidance. Produces ux-spec.md (per screen/flow) or dashboard-design.md using the studio templates."
argument-hint: "[screen/flow name] or 'dashboard' or 'patterns'"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion, Task
agent: ux-designer
---

When this skill is invoked:

## 1. Parse Arguments & Determine Mode

Three authoring modes exist based on the argument:

| Argument | Mode | Output file |
|----------|------|-------------|
| `dashboard` | Dashboard design | `design/ux/dashboard.md` |
| `patterns` | Interaction pattern library | `design/ux/interaction-patterns.md` |
| Any other value (e.g., `settings`, `billing-detail`) | UX spec for a screen or flow | `design/ux/[argument].md` |
| No argument | Ask the user | (see below) |

**If no argument is provided**, do not fail — ask instead. Use `AskUserQuestion`:
- "What are we designing today?"
 - Options: "A specific screen or flow (I'll name it)", "The product dashboard", "The interaction pattern library", "I'm not sure — help me figure it out"

If the user selects "I'll name it" or types a screen name, normalize it to kebab-case
for the filename (e.g., "Billing Detail" becomes `billing-detail`).

---

## 2. Gather Context (Read Phase)

Read all relevant context **before** asking the user anything. The skill's value
comes from arriving informed.

### 2a: Required Reads

- **Product concept**: Read `design/prd/product-concept.md` — if missing, warn:
 > "No product concept found. Run `/brainstorm` first to establish the product's
 > foundation before designing UX."
 > Continue anyway if the user asks.

### 2b: User Journey

Read `design/user-journey.md` if it exists. For each relevant section, extract:
- Which journey phase(s) does this screen appear in?
- What is the user's emotional state on arrival at this screen?
- What user need is this screen serving in the journey?
- What critical moments (from the journey map) does this screen deliver?

If the user journey file does not exist, note the gap and proceed:
> "No user journey map found at `design/user-journey.md`. Designing without it
> means we'll be making assumptions about user context. Consider running a user
> journey session after this spec is drafted."

### 2c: PRD UI Requirements

Glob `design/prd/*.md` and grep for `UI Requirements` sections. Read any PRD whose
UI Requirements section references this screen by name or category.

These PRD UI Requirements are the **requirements input** to this spec. Collect them
as a list of constraints the spec must satisfy.

If designing the dashboard, read ALL PRD UI Requirements sections — the dashboard
aggregates requirements from every system.

### 2d: Existing UX Specs

Glob `design/ux/*.md` and note which screens already have specs. For screens that
will link to or from the current screen, read their navigation/flow sections to
find the entry and exit points this spec must match.

### 2e: Interaction Pattern Library

If `design/ux/interaction-patterns.md` exists, read the pattern catalog index
(the list of pattern names and their one-line descriptions). Do not read full
pattern details — just the catalog. This tells you which patterns already exist
so you can reference them rather than reinvent them.

### 2f: Design System Bible

Check for `design/art/design-system-bible.md`. If found, read the visual direction
section. UX layout must align with the aesthetic commitments already made.

### 2g: Accessibility Requirements

Check for `design/accessibility-requirements.md`. If found, read it. The spec
must satisfy the accessibility tier committed to there.

### 2h: Input Method (from Project Config)

Read `.claude/docs/technical-preferences.md` and extract the `## Input & Platform`
section. Store these values for use throughout the skill — they drive the
Interaction Map and inform accessibility requirements:

- **Input Methods** — e.g., Keyboard + Mouse, Touch, Mixed
- **Primary Input** — the dominant input for this product
- **Touch Support** — Full / Partial / None
- **Target Platforms** — Web (desktop), Web (mobile), PWA, Native — for safe-area and breakpoint decisions

If the section is unconfigured (`[TO BE CONFIGURED]`), ask once:
> "Input methods aren't configured yet. What does this product target?"
> Options: "Desktop web (keyboard + mouse)", "Mobile web (touch)", "Both (responsive)", "PWA on tablet/desktop", "Other"
>
> (Run `/setup-stack` to save this permanently so you won't be asked again.)

Store the answer for the rest of this session. Do **not** ask again per section
or per screen.

### 2i: Present Context Summary

Before any design work, present a brief summary to the user:

> **Designing: [Screen/Flow Name]**
> - Mode: [UX Spec / Dashboard Design / Pattern Library]
> - Journey phase(s): [from user-journey.md, or "unknown — no journey map"]
> - PRD requirements feeding this spec: [count and names, or "none found"]
> - Related screens already specced: [list, or "none yet"]
> - Known patterns available: [count, or "no pattern library yet"]
> - Accessibility tier: [from requirements doc, or "not yet defined"]
> - Input methods: [from technical-preferences.md, or "asked above"]

Then ask: "Anything else I should read before we start, or shall we proceed?"

---

## 2b. Retrofit Mode Detection

Before creating a skeleton, check if the target output file already exists.

Glob `design/ux/[filename].md` (where `[filename]` is the resolved output path from Phase 1).

**If the file exists — retrofit mode:**
- Read the file in full
- For each expected section, check whether the body has real content (more than a `[To be designed]` placeholder) or is empty/placeholder
- Present a section status summary to the user:

> "Found existing UX spec at `design/ux/[filename].md`. Here's what's already done:
>
> | Section | Status |
> |---------|--------|
> | Overview & Context | [Complete / Empty / Placeholder] |
> | User Journey Integration | ... |
> | Screen Layout & Information Architecture | ... |
> | Interaction Model | ... |
> | Feedback & State Communication | ... |
> | Accessibility | ... |
> | Edge Cases & Error States | ... |
> | Open Questions | ... |
>
> I'll work on the [N] incomplete sections only — existing content will not be overwritten."

- Skip Section 3 (skeleton creation) — the file already exists
- In Phase 4 (Section Authoring), only work on sections with Status: Empty or Placeholder
- Use `Edit` to fill placeholders in-place rather than creating a new skeleton

**If the file does not exist — fresh authoring mode:**
Proceed to Phase 3 (Create File Skeleton) as normal.

---

## 3. Create File Skeleton

Once the user confirms, **immediately** create the output file with empty section
headers. This ensures incremental writes have a target and work survives interruptions.

Ask: "May I create the skeleton file at `design/ux/[filename].md`?"

---

### Skeleton for UX Spec (screen or flow)

```markdown
# UX Spec: [Screen/Flow Name]

> **Status**: In Design
> **Author**: [user + ux-designer]
> **Last Updated**: [today's date]
> **Journey Phase(s)**: [from context]
> **Template**: UX Spec

---

## Purpose & User Need

[To be designed]

---

## User Context on Arrival

[To be designed]

---

## Navigation Position

[To be designed]

---

## Entry & Exit Points

[To be designed]

---

## Layout Specification

### Information Hierarchy

[To be designed]

### Layout Zones

[To be designed]

### Component Inventory

[To be designed]

### ASCII Wireframe

[To be designed]

---

## States & Variants

[To be designed]

---

## Interaction Map

[To be designed]

---

## Events Fired

[To be designed]

---

## Transitions & Animations

[To be designed]

---

## Data Requirements

[To be designed]

---

## Accessibility

[To be designed]

---

## Localization Considerations

[To be designed]

---

## Acceptance Criteria

[To be designed]

---

## Open Questions

[To be designed]
```

---

### Skeleton for Dashboard Design

```markdown
# Dashboard Design

> **Status**: In Design
> **Author**: [user + ux-designer]
> **Last Updated**: [today's date]
> **Template**: Dashboard Design

---

## Dashboard Philosophy

[To be designed]

---

## Information Architecture

### Full Information Inventory

[To be designed]

### Categorization

[To be designed]

---

## Layout Zones

[To be designed]

---

## Widget Inventory

[To be designed]

---

## Filter, Time-range, & Refresh Model

[To be designed]

---

## Permissions & Multi-tenancy

[To be designed]

---

## Performance Budget

[To be designed]

---

## Accessibility

[To be designed]

---

## Open Questions

[To be designed]
```

---

### Skeleton for Interaction Pattern Library

```markdown
# Interaction Pattern Library

> **Status**: In Design
> **Author**: [user + ux-designer]
> **Last Updated**: [today's date]
> **Template**: Interaction Pattern Library

---

## Overview

[To be designed]

---

## Pattern Catalog

[To be designed]

---

## Patterns

[Individual pattern entries added here as they are defined]

---

## Gaps & Patterns Needed

[To be designed]

---

## Open Questions

[To be designed]
```

---

After writing the skeleton, update `production/session-state/active.md` with:
- Task: Designing [screen/flow name] UX spec
- Current section: Starting (skeleton created)
- File: design/ux/[filename].md

---

## 4. Section-by-Section Authoring

Walk through each section in order. For **each section**, follow this cycle:

```
Context -> Questions -> Options -> Decision -> Draft -> Approval -> Write
```

1. **Context**: State what this section needs to contain and surface any relevant
 constraints from context gathered in Phase 2.
2. **Questions**: Ask what is needed to draft this section. Use `AskUserQuestion`
 for constrained choices, conversational text for open-ended exploration.
3. **Options**: Where design choices exist, present 2-4 approaches with pros/cons.
 Explain reasoning in conversation, then use `AskUserQuestion` to capture the decision.
4. **Decision**: User picks an approach or provides custom direction.
5. **Draft**: Write the section content in conversation for review. Flag provisional
 assumptions explicitly.
6. **Approval**: "Does this capture it? Any changes before I write it to the file?"
7. **Write**: Use `Edit` to replace the `[To be designed]` placeholder with approved
 content. Confirm the write.

After writing each section, update `production/session-state/active.md`.

---

### Section Guidance: UX Spec Mode

#### Section A: Purpose & User Need

This section is the foundation. Every other decision flows from it.

**Questions to ask**:
- "What user goal does this screen serve? What is the user trying to DO here?"
- "What would go wrong if this screen didn't exist or was hard to use?"
- "Complete this sentence: 'The user arrives at this screen wanting to ___.' "

Cross-reference the user journey context gathered in Phase 2. The stated purpose
must align with the journey phase and emotional state.

---

#### Section B: User Context on Arrival

**Questions to ask**:
- "When in the product does a user first workflow step this screen?"
- "What were they just doing immediately before reaching this screen?"
- "What emotional state should the design assume? (calm, stressed, curious, time-pressured)"
- "Do users arrive at this screen voluntarily, or are they sent here by the product?"

Offer to map this against the journey phases if the user journey doc exists.

---

#### Section B2: Navigation Position

Where does this screen sit in the product's navigation hierarchy? This is a one-paragraph orientation map — not a full flow diagram.

**Questions to ask**:
- "Is this screen accessed from the main menu, from pause, from within user flow, or from another screen?"
- "Is it a top-level destination (always reachable) or a context-dependent one (only accessible in certain states)?"
- "Can the user reach this screen from more than one place in the product?"

Present as: "This screen lives at: [root] → [parent] → [this screen]" plus any alternate entry paths.

---

#### Section B3: Entry & Exit Points

Map every way the user can arrive at and leave this screen.

**Questions to ask**:
- "What are all the ways a user can reach this screen?" (List each trigger: button press, product event, redirect from another screen, etc.)
- "What can the user do to exit? What happens when they do?" (Back button, confirm action, timeout, product event)
- "Are there any exits that are one-way — where the user cannot return to this screen without starting over?"

Present as two tables:

| Entry Source | Trigger | User carries this context |
|---|---|---|
| [screen/event] | [how] | [state/data they arrive with] |

| Exit Destination | Trigger | Notes |
|---|---|---|
| [screen/event] | [how] | [any irreversible state changes] |

---

#### Section C: Layout Specification

This is the largest and most interactive section. Work through it in sub-sections:

**Sub-section 1 — Information Hierarchy** (establish this before any layout):
- Ask the user to list every piece of information this screen must communicate.
- Then ask them to rank the items: "What is the single most important thing a user
 needs to see first? What is second? What can be discovered rather than immediately visible?"
- Present the resulting hierarchy for approval before moving to zones.

**Sub-section 2 — Layout Zones**:
- Based on the information hierarchy, propose rough screen zones (header, content
 area, action bar, sidebar, etc.).
- Offer 2-3 zone arrangements with rationale for each. Reference platform and
 input context gathered from product concept.
- Ask: "Do any of these match your mental image, or shall we build a custom arrangement?"

**Sub-section 3 — Component Inventory**:
- For each zone, list the UI components it contains. For each component, note:
 - Component type (button, list, card, stat display, input field, etc.)
 - Content it displays
 - Whether it is interactive
 - If it uses an existing pattern from the library (reference by pattern name)
 - If it introduces a new pattern (flag for later addition to the library)

**Sub-section 4 — ASCII Wireframe**:
- Offer to generate an ASCII wireframe based on the zone layout and component list.
- Use `AskUserQuestion`: "Want an ASCII wireframe as part of this spec?"
 - Options: "Yes, include one", "No, I'll attach a separate file"
- If yes, produce the wireframe in conversation first. Ask for feedback before
 writing it to file.

---

#### Section D: States & Variants

Guide the user to think beyond the happy path.

**Questions to ask** (work through these one at a time):
- "What does this screen look like the very first time a user sees it, when there
 is no data yet? (empty state)"
- "What happens when something goes wrong — an error, a failed action, a missing
 resource? (error state)"
- "Is there ever a loading wait on this screen? If so, what does it show? (loading state)"
- "Are there any user progression states that change what this screen shows? For
 example, locked content, premium content, or tutorial-mode overlays?"
- "Does this screen behave differently on any supported platform? (platform variant)"

Present the collected states as a table for approval:

| State / Variant | Trigger | What Changes |
|-----------------|---------|--------------|
| Default | Normal load | — |
| Empty | No data available | [content area description] |
| [etc.] | [trigger] | [changes] |

---

#### Section E: Interaction Map

For each interactive component identified in the Layout Specification, define:
- The action (click, hover, focus, keyboard activation, drag, scroll)
- The input(s) that trigger it (mouse click, keyboard Enter/Space, touch tap)
- The immediate feedback (visual, ARIA live announcement)
- The outcome (navigation target, state change, network mutation)

Use the input methods loaded from `technical-preferences.md` in Phase 2h — do
not ask the user again. State them upfront: "Mapping interactions for:
[Input Methods from tech-prefs]. Touch support: [Touch Support from tech-prefs]."

Work through components one at a time rather than asking for all at once.
For navigation actions (going to another screen), verify the target matches
an existing UX spec or note it as a spec dependency.

---

#### Section E2: Events Fired

For every user action in the Interaction Map, document the corresponding event the product or analytics system should fire — or explicitly note "no event" if none applies.

**Questions to ask**:
- "For each action, should the product fire an analytics event, trigger a product-state change, or both?"
- "Are there any actions that should NOT fire an event — and is that a deliberate choice?"

Present as a table alongside the Interaction Map:

| User Action | Event Fired | Payload / Data |
|---|---|---|
| [action] | [EventName] or none | [data passed with event] |

Flag any action that modifies persistent server state (database writes, billing-affecting actions, externally-visible side effects) — these need explicit attention from the architecture team.

---

#### Section E3: Transitions & Animations

Specify how the screen enters and exits, and how it responds to state changes.

**Questions to ask**:
- "How does this screen appear? (fade in, slide from right, instant pop, scale from button)"
- "How does it dismiss? (fade out, slide back, cut)"
- "Are there any in-screen state transitions that need animation? (loading spinner, success state, error flash)"
- "Is there any animation that could cause motion sickness — and does the product have a reduced-motion option?"

Minimum required:
- Screen enter transition
- Screen exit transition
- At least one state-change animation if the screen has multiple states

---

#### Section F: Data Requirements

Cross-reference the PRD UI Requirements sections gathered in Phase 2.

For each piece of information the screen displays, ask:
- "Where does this data come from? Which system owns it?"
- "Does this screen need to write data back, or is it read-only?"
- "Is any of this data time-sensitive or real-time? (live status, streaming metrics)"

Flag any case where the UI would need to own or manage server state as an architectural
concern. UX specs define what the UI needs; they do not dictate how the data is
delivered. That is an architecture decision.

Present the data requirements as a table:

| Data | Source System | Read / Write | Notes |
|------|--------------|--------------|-------|
| [item] | [system] | Read | — |
| [item] | [system] | Write | [concern if any] |

---

#### Section G: Accessibility

Cross-reference `design/accessibility-requirements.md` if it exists.

Walk through the ux-designer agent's standard checklist for this screen:
- Keyboard-only navigation path through all interactive elements (Tab order, focus visibility)
- Touch target sizes (minimum 44×44 CSS px)
- Text contrast and minimum readable font sizes
- Color-independent communication (no information conveyed by color alone)
- Screen reader semantics for any non-text elements (ARIA roles, labels, live regions)
- Any motion or animation that needs a `prefers-reduced-motion` alternative

Use `AskUserQuestion` to surface any open questions on accessibility tier:
- "Has the accessibility tier been committed to for this project?"
 - Options: "Yes, read from requirements doc", "Not yet — let's flag it as a question", "Skip accessibility section for now"

---

#### Section H: Localization Considerations

Document constraints that affect how this screen behaves when text is translated.

**Questions to ask**:
- "Which text elements on this screen are the longest? What is the maximum character count that fits the layout?"
- "Are there any elements where text length is layout-critical — e.g., a button label that must stay on one line?"
- "Are there any elements that display numbers, dates, or currencies that need locale-specific formatting?"

Note: aim to flag any element where a 40% text expansion (common in translations from English to German or French) would break the layout. Mark those as HIGH PRIORITY for the localization engineer.

---

#### Section I: Acceptance Criteria

Write at least 5 specific, testable criteria that a QA tester can verify without reading any other design document. These become the pass/fail conditions for `/story-done`.

**Format**: Use checkboxes. Each criterion must be verifiable by a human tester:

```
- [ ] Screen reaches first meaningful paint within [X]ms from [trigger]
- [ ] [Element] displays correctly at [minimum] and [maximum] values
- [ ] [Navigation action] correctly routes to [destination screen]
- [ ] Error state appears when [condition] and shows [specific message or icon]
- [ ] Keyboard navigation reaches all interactive elements in logical Tab order with visible focus
- [ ] [Accessibility requirement] is met — e.g., "all interactive elements have focus indicators"
```

**Minimum required**:
- 1 performance criterion (load/open time)
- 1 navigation criterion (at least one entry or exit path verified)
- 1 error/empty state criterion
- 1 accessibility criterion (per committed tier)
- 1 criterion specific to this screen's core purpose

Ask the user to confirm: "Do these criteria cover what would actually make this screen 'done' for your QA process?"

---

### Section Guidance: Dashboard Design Mode

Dashboard design follows a different order from UX spec mode. Begin with
philosophy; do not touch layout until the information architecture is complete.

#### Section A: Dashboard Philosophy

Ask the user to describe the product's relationship with at-a-glance
information in 1–2 sentences.

Offer framing examples to help:
- "Sparse executive view — 3–5 KPIs at the top, no detail (e.g., a CFO weekly summary)"
- "Standard operational dashboard — 6–10 widgets, mixed audience (e.g., Customer Success snapshot)"
- "Information-dense — analyst audience, every relevant metric always visible (e.g., observability board, financial close cockpit)"
- "Adaptive — density and widgets shift based on user role or selected scope (e.g., team-level vs org-level toggle)"

This philosophy becomes the design constraint for every subsequent dashboard
decision. If a proposed widget conflicts with the stated philosophy, surface
that conflict.

---

#### Section B: Information Architecture

Complete this before any layout work. Do not skip it.

**Step 1 — Full information inventory**:
Pull all information from PRD UI Requirements sections gathered in Phase 2.
Present the full list: "These are all the things your product systems say they
need to communicate to the user at-a-glance."

**Step 2 — Categorization**:
For each item, ask the user to categorize it:

| Category | Description |
|----------|-------------|
| **Must Show** | Always visible — needed in every session for the dashboard's core promise |
| **Contextual** | Visible only when relevant (specific role, specific time period, threshold breached) |
| **On Demand** | User must actively request it (filter, expand, drill-down) |
| **Off-dashboard** | Belongs on a detail screen or report, not on the dashboard |

Use `AskUserQuestion` to step through items in groups of 3–4, not all at once.
This is the most consequential design decision in the dashboard — do not rush it.

**Conflict check**: If the philosophy (Section A) says "sparse executive view"
but the Must Show list is growing long, surface the conflict explicitly:
> "The current Must Show list has [N] items. That may conflict with the
> sparse-executive philosophy. Options: reduce Must Show, revise the philosophy,
> or define a hybrid approach (sparse top zone + dense lower zone, or
> role-based density toggle)."

---

#### Section C: Layout Zones

Only after the information architecture is approved, design layout zones.

Base layout on:
- Which items are Must Show (they drive the permanent zone decisions)
- B2B dashboard conventions (top bar global filters → KPI strip → primary
  charts → secondary widget grid → activity feed in right rail or bottom)
- Responsive breakpoints (which zones reflow on narrow viewports)

Offer 2–3 zone arrangements. Include rationale based on the philosophy and
the categorization from Section B.

---

#### Section D: Widget Inventory

For each widget in the layout, specify:
- Widget name and category (Must Show / Contextual / On Demand)
- Data source (PRD slug)
- Visual form (KPI card, line chart, bar chart, table, list, status badge,
  activity feed)
- Refresh model (live-streaming / auto-refresh every N seconds / manual /
  snapshot)
- Empty / loading / error states (every widget needs all three specified)
- Drill-down target (route opened on click), or explicitly "no drill-down"

Work widget by widget. Reference the interaction pattern library if relevant
patterns exist for KPI cards, charts, or activity feeds.

---

#### Sections E, F, G: Filter / Refresh Model, Permissions & Multi-tenancy, Accessibility

These follow the structure of the UX spec equivalents. See UX Spec section
guidance for D (States/Variants), E (Interactions), and G (Accessibility).

For the dashboard specifically, emphasize:
- Filter & Refresh Model: which filters apply globally vs per-widget? How is
  the URL / shared link pattern handled? How is "last updated" surfaced?
- Permissions & Multi-tenancy: which roles see which widgets? Confirm no widget
  can leak data across tenants — explicitly note the RLS / scoping enforcement.

---

### Section Guidance: Interaction Pattern Library Mode

Pattern library authoring is additive and catalog-driven, not linear.

#### Phase 1: Catalog Existing Patterns

Glob `design/ux/*.md` (excluding `interaction-patterns.md`) and read the Component
Inventory and Interaction Map sections of each spec. Extract every interaction
pattern used.

Present the extracted list: "Based on existing UX specs, these patterns are already
in use in the product:"
- [Pattern name]: used in [screen], [screen]
- [etc.]

Ask: "Are there patterns you know exist but aren't in existing specs yet? List any
additional ones now."

---

#### Phase 2: Formalize Each Pattern

For each pattern (existing or new), document:

```markdown
### [Pattern Name]

**Category**: Navigation / Input / Feedback / Data Display / Modal / Overlay / [other]
**Used In**: [list of screens]

**Description**: [One paragraph explaining what this pattern is and when to use it]

**Specification**:
- [Component behavior]
- [Input mapping]
- [Visual/audio feedback]
- [Accessibility requirements for this pattern]

**When to Use**: [Conditions where this pattern is appropriate]
**When NOT to Use**: [Conditions where another pattern is more appropriate]

**Reference**: [Screenshot path or ASCII example, if available]
```

Work through patterns in groups. Offer: "Shall I draft the first batch based on what
I've found in the existing specs, or do you want to define them one by one?"

---

#### Phase 3: Identify Gaps

After cataloging known patterns, ask:
- "Are there screens or interactions planned that would need patterns not yet
 in this library?"
- "Are there any patterns in existing specs that feel inconsistent with each
 other and should be consolidated?"

Document gaps in the Gaps section for follow-up.

---

## 5. Cross-Reference Check

Before marking the spec as ready for review, run these checks:

**1. PRD requirement coverage**: Does every PRD UI Requirement that references
this screen have a corresponding element in this spec? Present any gaps.

**2. Pattern library alignment**: Are all interaction patterns used in this spec
referenced by name? If a new pattern was invented during this spec session, flag
it for addition to the pattern library:
> "This spec uses [pattern name], which isn't in the pattern library yet.
> Want to add it now, or flag it as a gap?"

**3. Navigation consistency**: Do the entry/exit points in this spec match the
navigation map in any related specs? Flag mismatches.

**4. Accessibility coverage**: Does the spec address the accessibility tier
committed to in `design/accessibility-requirements.md`? If not, flag open questions.

**5. Empty states**: Does every data-dependent element have an empty state defined?
Flag any that don't.

Present the check results:
> **Cross-Reference Check: [Screen Name]**
> - PRD requirements: [N of M covered / all covered]
> - New patterns to add to library: [list or "none"]
> - Navigation mismatches: [list or "none"]
> - Accessibility gaps: [list or "none"]
> - Missing empty states: [list or "none"]

---

## 6. Handoff

When all sections are approved and written:

### 6a: Update Session State

Update `production/session-state/active.md` with:
- Task: [screen-name] UX spec
- Status: Complete (or In Review)
- File: design/ux/[filename].md
- Sections: All written
- Next: [suggestion]

### 6b: Suggest Next Step

Before presenting options, state clearly:

> "This spec should be validated with `/ux-review` before it enters the
> implementation pipeline. The Pre-Production gate requires all key screen specs
> to have a review verdict."

Then use `AskUserQuestion`:
- "Run `/ux-review [filename]` now, or do something else first?"
 - Options:
 - "Run `/ux-review` now — validate this spec"
 - "Design another screen first, then review all specs together"
 - "Update the interaction pattern library with new patterns from this spec"
 - "Stop here for this session"

If the user picks "Design another screen first", add a note: "Reminder: run
`/ux-review` on all completed specs before running `/gate-check pre-production`."

### 6c: Cross-Link Related Specs

If other UX specs link to or from this screen, note which ones should reference
this spec. Do not edit those files without asking — just name them.

---

## 7. Recovery & Resume

If the session is interrupted (compaction, crash, new session):

1. Read `production/session-state/active.md` — it records the current screen
 and which sections are complete.
2. Read `design/ux/[filename].md` — sections with real content are done;
 sections with `[To be designed]` still need work.
3. Resume from the next incomplete section — no need to re-discuss completed ones.

This is why incremental writing matters: every approved section survives any
disruption.

---

## 8. Specialist Agent Routing

This skill uses `ux-designer` as the primary agent (set in frontmatter). For
specific sub-topics, additional context or coordination may be needed:

| Topic | Coordinate with |
|-------|----------------|
| Visual aesthetics, color, layout feel | `design-director` — UX spec defines zones; art defines how they look |
| Implementation feasibility (framework constraints) | `frontend-engineer` — before finalizing component inventory |
| User-facing behavior data requirements | `product-manager` — when data ownership is unclear |
| UX copy visible in the UI | `content-director` — for headings, helper text, empty-state copy, error messages |
| Accessibility tier decisions | Handled by this session — owned by ux-designer |

When delegating to another agent via the Task tool:
- Provide: screen name, product concept summary, the specific question needing expert input
- The agent returns analysis to this session
- This session presents the agent's output to the user
- The user decides; this session writes to file
- Agents do NOT write to files directly — this session owns all file writes

---

## Collaborative Protocol

This skill follows the collaborative design principle at every step:

1. **Question -> Options -> Decision -> Draft -> Approval** for every section
2. **AskUserQuestion** at every decision point (Explain -> Capture pattern):
 - Phase 2: "Ready to start, or need more context?"
 - Phase 3: "May I create the skeleton?"
 - Phase 4 (each section): design questions, approach options, draft approval
 - Phase 5: "Run cross-reference check? What's next?"
3. **"May I write to [filepath]?"** before the skeleton and before each section write
4. **Incremental writing**: Each section is written to file immediately after approval
5. **Session state updates**: After every section write

**Aesthetic deference**: When layout or visual choices come down to personal taste,
present the options and ask. Do not select a layout because it is "standard" — always
confirm. The user is the product director.

**Conflict surfacing**: When a PRD requirement and the available screen real estate
conflict, surface the conflict and present resolution options. Never silently drop
a requirement. Never silently expand the layout without flagging it.

**Never** auto-generate the full spec and present it as a fait accompli.
**Never** write a section without user approval.
**Never** contradict an existing approved UX spec without flagging the conflict.
**Always** show where decisions come from (PRD requirements, user journey, user choices).

Verdict: **COMPLETE** — UX spec written and approved section by section.

---

## Recommended Next Steps

- Run `/ux-review [filename]` to validate this spec before it enters the implementation pipeline
- Run `/ux-design [next-screen]` to continue designing remaining screens or flows
- Run `/gate-check pre-production` once all key screens have approved UX specs
