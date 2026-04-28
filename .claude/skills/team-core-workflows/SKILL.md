---
name: team-core-workflows
description: "Orchestrate the core-workflows team: coordinates product-manager, feature-engineer, ml-engineer, design-systems-engineer, interaction-designer, and qa-engineer to design, implement, and validate a primary product workflow end-to-end."
argument-hint: "[workflow description]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
---
**Argument check:** If no workflow description is provided, output:
> "Usage: `/team-core-workflows [workflow description]` — Provide a description of the core workflow to design and implement (e.g., `month-end close`, `import wizard`, `bulk export`, `approval flow`)."

Then stop immediately without spawning any subagents or reading any files.

When this skill is invoked with a valid argument, orchestrate the
core-workflows team through a structured pipeline.

**Decision Points:** At each phase transition, use `AskUserQuestion` to
present the user with the subagent's proposals as selectable options.
Write the agent's full analysis in conversation, then capture the
decision with concise labels. The user must approve before moving to
the next phase.

## Team Composition
- **product-manager** — Design the workflow, define inputs / outputs / steps and edge cases
- **feature-engineer** — Implement the workflow's domain logic and service layer
- **ml-engineer** — Implement any LLM / classifier / recommendation logic the workflow uses
- **design-systems-engineer** — Wire up the UI components, motion, and design-token usage
- **interaction-designer** — Define micro-interactions, status feedback, and notification cues
- **framework specialist** (primary) — Validate architecture and implementation patterns are idiomatic for the framework family (read from `.claude/docs/technical-preferences.md` Framework Specialists section)
- **qa-engineer** — Write test cases and validate the implementation

## How to Delegate

Use the Task tool to spawn each team member as a subagent:
- `subagent_type: product-manager` — Design the workflow, define rules and edge cases
- `subagent_type: feature-engineer` — Implement the workflow's server-side logic
- `subagent_type: ml-engineer` — Implement ML / LLM-backed steps in the workflow (if any)
- `subagent_type: design-systems-engineer` — Wire up UI components and motion
- `subagent_type: interaction-designer` — Define interactive feedback and notifications
- `subagent_type: [primary framework specialist]` — Framework idiom validation
- `subagent_type: qa-engineer` — Write test cases and validate implementation

Always provide full context in each agent's prompt (PRD path, relevant
code files, constraints). Launch independent agents in parallel where
the pipeline allows it (e.g., Phase 3 agents can run simultaneously).

## Pipeline

### Phase 1: Design
Delegate to **product-manager**:
- Create or update the PRD in `design/prd/` covering: workflow overview,
  target user and JTBD, step-by-step flow with inputs / outputs, formulas
  / rules, edge cases (empty / loading / error / partial / permission /
  network / concurrent edit), dependencies, tunable values, and
  acceptance criteria
- Output: completed PRD

### Phase 2: Architecture
Delegate to **feature-engineer** (with **ml-engineer** if any LLM /
classifier step is involved):
- Review the PRD
- Design the code architecture: module boundaries, service contracts,
  event payloads, data-fetching layout, transaction boundaries
- Identify integration points with existing systems (auth, audit log,
  notifications, queue)
- Output: architecture sketch with file list and contract definitions

Then spawn the **primary framework specialist** to validate the proposed
architecture:
- Is the module / service / repository structure idiomatic for the
  pinned framework? (Server Actions vs route handlers in Next.js;
  module + service split in NestJS; SPA + API split in React + Node)
- Are there framework-native primitives that should be used instead of
  custom implementations?
- Any proposed APIs that are deprecated or changed in the pinned
  version?
- Output: framework architecture notes — incorporate into the
  architecture before Phase 3 begins

### Phase 3: Implementation (parallel where possible)
Delegate in parallel:
- **feature-engineer**: Implement the workflow's server-side logic
- **ml-engineer**: Implement LLM / classifier steps (if the workflow
  uses them)
- **design-systems-engineer**: Wire up UI components for each step
- **interaction-designer**: Define interactive feedback (loading,
  success, error, progress)

### Phase 4: Integration
- Wire together the server logic, UI, ML steps (if any), and
  notifications
- Ensure all tunable values come from typed config / database
- Verify the feature works with existing systems (auth, audit log,
  notifications)

### Phase 5: Validation
Delegate to **qa-engineer**:
- Write test cases from the acceptance criteria
- Test all edge cases documented in the PRD
- Verify performance impact is within budget
- File bug reports for any issues found

### Phase 6: Sign-off
- Collect results from all team members
- Report workflow status: COMPLETE / NEEDS WORK / BLOCKED
- List any outstanding issues and their assigned owners

## Error Recovery Protocol

If any spawned agent (via Task) returns BLOCKED, errors, or cannot complete:

1. **Surface immediately**: Report "[AgentName]: BLOCKED — [reason]" to the user before continuing to dependent phases
2. **Assess dependencies**: Check whether the blocked agent's output is required by subsequent phases. If yes, do not proceed past that dependency point without user input.
3. **Offer options** via AskUserQuestion with choices:
 - Skip this agent and note the gap in the final report
 - Retry with narrower scope
 - Stop here and resolve the blocker first
4. **Always produce a partial report** — output whatever was completed. Never discard work because one agent blocked.

Common blockers:
- Input file missing (story not found, PRD absent) → redirect to the skill that creates it
- ADR status is Proposed → do not implement; run `/architecture-decision` first
- Scope too large → split into smaller stories via `/create-stories`
- Conflicting instructions between ADR and story → surface the conflict, do not guess

## File Write Protocol

All file writes (PRDs, implementation files, test cases) are delegated to
sub-agents spawned via Task. Each sub-agent enforces the
"May I write to [path]?" protocol. This orchestrator does not write
files directly.

## Output

A summary report covering: design completion status, implementation status per team member, test results, and any open issues.

Verdict: **COMPLETE** — workflow designed, implemented, and validated.
Verdict: **BLOCKED** — one or more phases could not complete; partial report produced with unresolved items listed.

## Next Steps

- Run `/code-review` on the implemented workflow code before closing stories.
- Run `/tradeoff-check` to validate any pricing / entitlement / limit values the workflow surfaces.
- Run `/team-polish` if motion, performance, or accessibility polish is needed.
