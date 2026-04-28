---
name: create-architecture
description: "Guided, section-by-section authoring of the master architecture document for the product. Reads all PRDs, the systems index, existing ADRs, and the framework reference library to produce a complete architecture server-actions before any code is written. Framework-version-aware: flags knowledge gaps and validates decisions against the pinned framework version."
argument-hint: "[focus-area: full | layers | data-flow | api-boundaries | adr-audit] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, AskUserQuestion, Task
agent: technical-director
---

# Create Architecture

This skill produces `docs/architecture/architecture.md` — the master architecture
document that translates all approved PRDs into a concrete technical server-actions.
It sits between design and implementation, and must exist before sprint planning begins.

**Distinct from `/architecture-decision`**: ADRs record individual point decisions.
This skill creates the whole-system server-actions that gives ADRs their context.

Resolve the review mode (once, store for all gate spawns this run):
1. If `--review [full|lean|solo]` was passed → use that
2. Else read `production/review-mode.txt` → use that value
3. Else → default to `lean`

See `.claude/docs/director-gates.md` for the full check pattern.

**Argument modes:**
- **No argument / `full`**: Full guided walkthrough — all sections, start to finish
- **`layers`**: Focus on the system layer diagram only
- **`data-flow`**: Focus on data flow between modules only
- **`api-boundaries`**: Focus on API boundary definitions only
- **`adr-audit`**: Audit existing ADRs for framework compatibility gaps only

---

## Phase 0: Load All Context

Before anything else, load the full project context in this order:

### 0a. Framework Context (Critical)

Read the framework reference library completely:

1. `docs/framework-reference/[framework]/VERSION.md`
 → Extract: framework name, version, LLM cutoff, post-cutoff risk levels
2. `docs/framework-reference/[framework]/breaking-changes.md`
 → Extract: all HIGH and MEDIUM risk changes
3. `docs/framework-reference/[framework]/deprecated-apis.md`
 → Extract: APIs to avoid
4. `docs/framework-reference/[framework]/current-best-practices.md`
 → Extract: post-cutoff best practices that differ from training data
5. All files in `docs/framework-reference/[framework]/modules/`
 → Extract: current API patterns per domain

If no framework is configured, stop and prompt:
> "No framework is configured. Run `/setup-stack` first. Architecture cannot be
> written without knowing which framework and version you are targeting."

### 0b. Design Context + Technical Requirements Extraction

Read all approved design documents and extract technical requirements from each:

1. `design/prd/product-concept.md` — product pillars, product category, core user flow
2. `design/prd/systems-index.md` — all systems, dependencies, priority tiers
3. `.claude/docs/technical-preferences.md` — naming conventions, performance budgets,
 allowed libraries, forbidden patterns
4. **Every PRD in `design/prd/`** — for each, extract technical requirements:
 - Data structures implied by the product rules
 - Performance constraints stated or implied
 - Framework capabilities the system requires
 - Cross-system communication patterns (what talks to what, how)
 - State that must persist (save/load implications)
 - Threading or timing requirements

Build a **Technical Requirements Baseline** — a flat list of all extracted
requirements across all PRDs, numbered `TR-[prd-slug]-[NNN]`. This is the
complete set of what the architecture must cover. Present it as:

```
## Technical Requirements Baseline
Extracted from [N] PRDs | [X] total requirements

| Req ID | PRD | System | Requirement | Domain |
|--------|-----|--------|-------------|--------|
| TR-BILL-001 | billing.md | Billing | Discount calculation accuracy on multi-line invoices | Persistence |
| TR-BILL-002 | billing.md | Billing | Idempotent payment-failure handling | Messaging |
| TR-AUDIT-001 | audit-log.md | Audit | Audit-write happens in same transaction as state change | Platform |
```

This baseline feeds into every subsequent phase. No PRD requirement should be
left without an architectural decision to support it by the end of this session.

### 0c. Existing Architecture Decisions

Read all files in `docs/architecture/` to understand what has already been decided.
List any ADRs found and their domains.

### 0d. Generate Knowledge Gap Inventory

Before proceeding, display a structured summary:

```
## Framework Knowledge Gap Inventory
Framework: [name + version]
LLM Training Covers: up to approximately [version]
Post-Cutoff Versions: [list]

### HIGH RISK Domains (must verify against framework reference before deciding)
- [Domain]: [Key changes]

### MEDIUM RISK Domains (verify key APIs)
- [Domain]: [Key changes]

### LOW RISK Domains (in training data, likely reliable)
- [Domain]: [no significant post-cutoff changes]

### Systems from PRD that touch HIGH/MEDIUM risk domains:
- [PRD system name] → [domain] → [risk level]
```

Ask: "This inventory identifies [N] systems in HIGH RISK framework domains. Shall I
continue building the architecture with these warnings flagged throughout?"

---

## Phase 1: System Layer Mapping

Map every system from `systems-index.md` into an architecture layer. The standard
product architecture layers are:

```
┌─────────────────────────────────────────────┐
│ PRESENTATION LAYER  │ ← UI components, dashboards, screens, animations
├─────────────────────────────────────────────┤
│ FEATURE LAYER       │ ← business workflows, domain logic, integrations
├─────────────────────────────────────────────┤
│ DOMAIN LAYER        │ ← entities, state machines, services, validation
├─────────────────────────────────────────────┤
│ PLATFORM LAYER      │ ← auth, multi-tenancy, audit log, queue, observability
├─────────────────────────────────────────────┤
│ INFRA LAYER         │ ← database, cache, CDN, deployment runtime
└─────────────────────────────────────────────┘
```

For each PRD system, ask:
- Which layer does it belong to?
- What are its module boundaries?
- What does it own exclusively? (data, state, behaviour)

Present the proposed layer assignment and ask for approval before proceeding to
the next section. Write the approved layer map immediately to the skeleton file.

**Framework awareness check**: For each system assigned to the Core and Foundation
layers, flag if it touches a HIGH or MEDIUM risk framework domain. Show the relevant
framework reference excerpt inline.

---

## Phase 2: Module Ownership Map

For each module defined in Phase 1, define ownership:

- **Owns**: what data and state this module is solely responsible for
- **Exposes**: what other modules may read or call
- **Consumes**: what it reads from other modules
- **Framework APIs used**: which specific framework classes/nodes/signals this module
 calls directly (with version and risk level noted)

Format as a table per layer, then as an ASCII dependency diagram.

**Framework awareness check**: For every framework API listed, verify against the
relevant module reference doc. If an API is post-cutoff, flag it:

```
⚠️ [ClassName.method()] — Next.js.6 (post-cutoff, HIGH risk)
 Verified against: docs/framework-reference/nextjs/modules/[domain].md
 Behaviour confirmed: [yes / NEEDS VERIFICATION]
```

Get user approval on the ownership map before writing.

---

## Phase 3: Data Flow

Define how data moves between modules during key product scenarios. Cover at minimum:

1. **Frame update path**: Input → Core systems → State → Rendering
2. **Event/signal path**: How systems communicate without tight coupling
3. **Save/load path**: What state is serialised, which module owns serialisation
4. **Initialisation order**: Which modules must boot before others

Use ASCII sequence diagrams where helpful. For each data flow:
- Name the data being transferred
- Identify the engineering manager and consumer
- State whether this is synchronous call, signal/event, or shared state
- Flag any data flows that cross thread boundaries

Get user approval per scenario before writing.

---

## Phase 4: API Boundaries

Define the public contracts between modules. For each boundary:

- What is the interface a module exposes to the rest of the system?
- What are the entry points (functions/signals/properties)?
- What invariants must callers respect?
- What must the module guarantee to callers?

Write in pseudocode or the project's actual language (from technical preferences).
These become the contracts programmers implement against.

**Framework awareness check**: If any interface uses framework-specific types (e.g.
`Node`, `Resource`, `Signal` in Next.js), flag the version and verify the type
exists and has not changed signature in the target framework version.

---

## Phase 5: ADR Audit + Traceability Check

Review all existing ADRs from Phase 0c against both the architecture built in
Phases 1-4 AND the Technical Requirements Baseline from Phase 0b.

### ADR Quality Check

For each ADR:
- [ ] Does it have a Framework Compatibility section?
- [ ] Is the framework version recorded?
- [ ] Are post-cutoff APIs flagged?
- [ ] Does it have a "PRD Requirements Addressed" section?
- [ ] Does it conflict with the layer/ownership decisions made in this session?
- [ ] Is it still valid for the pinned framework version?

| ADR | Framework Compat | Version | PRD Linkage | Conflicts | Valid |
|-----|--------------|---------|-------------|-----------|-------|
| ADR-0001: [title] | ✅/❌ | ✅/❌ | ✅/❌ | None/[conflict] | ✅/⚠️ |

### Traceability Coverage Check

Map every requirement from the Technical Requirements Baseline to existing ADRs.
For each requirement, check if any ADR's "PRD Requirements Addressed" section
or decision text covers it:

| Req ID | Requirement | ADR Coverage | Status |
|--------|-------------|--------------|--------|
| TR-BILL-001 | Discount calculation accuracy on multi-line invoices | ADR-0003 | ✅ |
| TR-BILL-002 | Idempotent payment-failure handling | — | ❌ GAP |

Count: X covered, Y gaps. For each gap, it becomes a **Required New ADR**.

### Required New ADRs

List all decisions made during this architecture session (Phases 1-4) that do
not yet have a corresponding ADR, PLUS all uncovered Technical Requirements.
Group by layer — Foundation first:

**Foundation Layer (must create before any coding):**
- `/architecture-decision [title]` → covers: TR-[id], TR-[id]

**Core Layer:**
- `/architecture-decision [title]` → covers: TR-[id]

---

## Phase 6: Missing ADR List

Based on the full architecture, produce a complete list of ADRs that should exist
but don't yet. Group by priority:

**Must have before coding starts (Foundation & Core decisions):**
- [e.g. "Scene management and scene loading strategy"]
- [e.g. "Event bus vs direct signal architecture"]

**Should have before the relevant system is built:**
- [e.g. "Inventory serialisation format"]

**Can defer to implementation:**
- [e.g. "Specific stylesheet technique for water"]

---

## Phase 7: Write the Master Architecture Document

Once all sections are approved, write the complete document to
`docs/architecture/architecture.md`.

Ask: "May I write the master architecture document to `docs/architecture/architecture.md`?"

The document structure:

```markdown
# [Product Name] — Master Architecture

## Document Status
- Version: [N]
- Last Updated: [date]
- Framework: [name + version]
- PRDs Covered: [list]
- ADRs Referenced: [list]

## Framework Knowledge Gap Summary
[Condensed from Phase 0d inventory — HIGH/MEDIUM risk domains and their implications]

## System Layer Map
[From Phase 1]

## Module Ownership
[From Phase 2]

## Data Flow
[From Phase 3]

## API Boundaries
[From Phase 4]

## ADR Audit
[From Phase 5]

## Required ADRs
[From Phase 6]

## Architecture Principles
[3-5 key principles that govern all technical decisions for this project,
derived from the product concept, PRDs, and technical preferences]

## Open Questions
[Decisions deferred — must be resolved before the relevant layer is built]
```

---

## Phase 7b: Technical Director Sign-Off + Lead Engineer Feasibility Review

After writing the master architecture document, perform an explicit sign-off before handoff.

**Step 1 — Technical Director self-review** (this skill runs as technical-director):

Apply gate **TD-ARCHITECTURE** (`.claude/docs/director-gates.md`) as a self-review. Check all four criteria from that gate definition against the completed document.

**Review mode check** — apply before spawning LP-FEASIBILITY:
- `solo` → skip. Note: "LP-FEASIBILITY skipped — Solo mode." Proceed to Phase 8 handoff.
- `lean` → skip (not a PHASE-GATE). Note: "LP-FEASIBILITY skipped — Lean mode." Proceed to Phase 8 handoff.
- `full` → spawn as normal.

**Step 2 — Spawn `lead-engineer` via Task using gate LP-FEASIBILITY (`.claude/docs/director-gates.md`):**

Pass: architecture document path, technical requirements baseline summary, ADR list.

**Step 3 — Present both assessments to the user:**

Show the Technical Director assessment and Lead Engineer verdict side by side.

Use `AskUserQuestion` — "Technical Director and Lead Engineer have reviewed the architecture. How would you like to proceed?"
Options: `Accept — proceed to handoff` / `Revise flagged items first` / `Discuss specific concerns`

**Step 4 — Record sign-off in the architecture document:**

Update the Document Status section:
```
- Technical Director Sign-Off: [date] — APPROVED / APPROVED WITH CONDITIONS
- Lead Engineer Feasibility: FEASIBLE / CONCERNS ACCEPTED / REVISED
```

Ask: "May I update the Document Status section in `docs/architecture/architecture.md` with the sign-off?"

---

## Phase 8: Handoff

After writing the document, provide a clear handoff:

1. **Run these ADRs next** (from Phase 6, prioritised): list the top 3
2. **Gate check**: "The master architecture document is complete. Run `/gate-check
 pre-production` when all required ADRs are also written."
3. **Update session state**: Write a summary to `production/session-state/active.md`

---

## Collaborative Protocol

This skill follows the collaborative design principle at every phase:

1. **Load context silently** — do not narrate file reads
2. **Present findings** — show the knowledge gap inventory and layer proposals
3. **Ask before deciding** — present options for each architectural choice
4. **Get approval before writing** — each phase section is written only after
 user approves the content
5. **Incremental writing** — write each approved section immediately; do not
 accumulate everything and write at the end. This survives session crashes.

Never make a binding architectural decision without user input. If the user is
unsure, present 2-4 options with pros/cons before asking them to decide.

---

## Recommended Next Steps

- Run `/architecture-decision [title]` for each required ADR listed in Phase 6 — Foundation layer ADRs first
- Run `/create-permissions-manifest` once the required ADRs are written to produce the layer rules manifest
- Run `/gate-check pre-production` when all required ADRs are written and the architecture is signed off
