---
name: team-information-architecture
description: "Orchestrate screen design team: screen-designer + content-director + information-architect + design-director + systems-analyst + qa-engineer for complete area/level creation."
argument-hint: "[level name or area to design]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
---

When this skill is invoked:

**Decision Points:** At each step transition, use `AskUserQuestion` to present
the user with the subagent's proposals as selectable options. Write the agent's
full analysis in conversation, then capture the decision with concise labels.
The user must approve before moving to the next step.

1. **Read the argument** for the target level or area (e.g., `tutorial`,
 `forest dungeon`, `hub town`, `final boss arena`).

2. **Gather context**:
 - Read the product concept at `design/prd/product-concept.md`
 - Read product pillars at `design/prd/product-pillars.md`
 - Read existing level docs in `design/levels/`
 - Read relevant narrative docs in `design/narrative/`
 - Read information-architecture docs for the area's region/faction

## How to Delegate

Use the Task tool to spawn each team member as a subagent:
- `subagent_type: content-director` — Editorial purpose of the area, content taxonomy, voice consistency
- `subagent_type: information-architect` — Information hierarchy, navigation model, taxonomy / labels, search affordances
- `subagent_type: screen-designer` — Layout, page structure, list / detail / dashboard composition, cross-screen navigation
- `subagent_type: systems-analyst` — Entity model for the area, state transitions, permission scoping
- `subagent_type: design-director` — Visual theme, density direction, component reuse vs new, asset requirements
- `subagent_type: accessibility-specialist` — Navigation clarity, color independence, cognitive load
- `subagent_type: qa-engineer` — Test cases, boundary testing, usability-test checklist

Always provide full context in each agent's prompt (product concept, pillars, existing level docs, narrative docs).

3. **Orchestrate the screen design team** in sequence:

### Step 1: Narrative + Visual Direction (content-director + information-architect + design-director, parallel)

Spawn all three agents simultaneously — issue all three Task calls before waiting for any result.

Spawn the `content-director` agent to:
- Define the narrative purpose of this area (what story beats happen here?)
- Identify key characters, dialogue triggers, and lore elements
- Specify emotional arc (how should the user feel entering, during, leaving?)

Spawn the `information-architect` agent to:
- Provide lore context for the area (history, faction presence, ecology)
- Define environmental storytelling opportunities
- Specify any world rules that affect user flow in this area

Spawn the `design-director` agent to:
- Establish visual theme targets for this area — these are INPUTS to layout, not outputs of it
- Define the color temperature and lighting mood for this area (how does it differ from adjacent areas?)
- Specify shape language direction (angular fortress? organic cave? decayed grandeur?)
- Name the primary visual landmarks that will orient the user
- Read `design/art/design-system-bible.md` if it exists — anchor all direction in the established design system bible

**The design-director's visual targets from Step 1 must be passed to the screen-designer in Step 2** as explicit constraints. Layout decisions happen within the visual direction, not before it.

**Gate**: Use `AskUserQuestion` to present all three Step 1 outputs (narrative brief, lore foundation, visual direction targets) and confirm before proceeding to Step 2.

### Step 2: Layout and Workflow step Design (screen-designer)
Spawn the `screen-designer` agent with the full Step 1 output as context:
- Narrative brief (from content-director)
- Lore foundation (from information-architect)
- **Visual direction targets (from design-director)** — layout must work within these targets, not contradict them

The screen-designer should:
- Design the spatial layout (critical path, optional paths, secrets) — ensuring primary routes align with the visual landmark targets from Step 1
- Define pacing curve (tension peaks, rest areas, exploration zones) — coordinated with the emotional arc from content-director
- Place encounters with difficulty progression
- Design environmental puzzles or navigation challenges
- Define points of interest and landmarks for wayfinding — these must match the visual landmarks the design-director specified
- Specify entry/exit points and connections to adjacent areas

**Adjacent area dependency check**: After the layout is produced, check `design/levels/` for each adjacent area referenced by the screen-designer. If any referenced area's `.md` file does not exist, surface the gap:
> "Level references [area-name] as an adjacent area but `design/levels/[area-name].md` does not exist."

Use `AskUserQuestion` with options:
- (a) Proceed with a placeholder reference — mark the connection as UNRESOLVED in the level doc and list it in the open cross-level dependencies section of the summary report
- (b) Pause and run `/team-information-architecture [area-name]` first to establish that area

Do NOT invent content for the missing adjacent area.

**Gate**: Use `AskUserQuestion` to present Step 2 layout (including any unresolved adjacent area dependencies) and confirm before proceeding to Step 3.

### Step 3: Systems Integration (systems-analyst)
Spawn the `systems-analyst` agent to:
- Specify the entities and state transitions exposed in this area
- Define filtering, sorting, and search behavior across this area
- Specify the permission scoping model (which roles see which records,
  which actions are gated by which entitlements)
- Design any area-specific data validation or export rules
- Specify error and recovery behaviors (network failure, permission
  denied, partial data, concurrent edit)

**Gate**: Use `AskUserQuestion` to present Step 3 outputs and confirm before proceeding to Step 4.

### Step 4: Production Concepts + Accessibility (design-director + accessibility-specialist, parallel)

**Note**: The design-director's directional pass (visual theme, color targets, mood) happened in Step 1. This pass is location-specific production concepts — given the finalized layout, what does each specific space look like?

Spawn the `design-director` agent with the finalized layout from Step 2:
- Produce location-specific concept specs for key spaces (entrance, key workflow step zones, landmarks, exits)
- Specify which art assets are unique to this area vs. shared from the global pool
- Define sight-line and lighting setups per key space (these are now layout-informed, not directional)
- Specify VFX needs that are specific to this area's layout (weather volumes, particles, atmospheric effects)
- Flag any locations where the layout creates visual direction conflicts with the Step 1 targets — surface these as production risks

Spawn the `accessibility-specialist` agent in parallel to:
- Review the level layout for navigation clarity (can users orient themselves without relying on color alone?)
- Check that critical path signposting uses shape/icon/sound cues in addition to color
- Review any puzzle mechanics for cognitive load — flag anything that requires holding more than 3 simultaneous states
- Check that key user flow areas have sufficient contrast for colorblind users
- Output: accessibility concerns list with severity (BLOCKING / RECOMMENDED / NICE TO HAVE)

Wait for both agents to return before proceeding.

**Gate**: Use `AskUserQuestion` to present both Step 4 results. If the accessibility-specialist returned any BLOCKING concerns, highlight them prominently and offer:
- (a) Return to screen-designer and design-director to redesign the flagged elements before Step 5
- (b) Document as a known accessibility gap and proceed to Step 5 with the concern explicitly logged in the final report

Do NOT proceed to Step 5 without the user acknowledging any BLOCKING accessibility concerns.

### Step 5: QA Planning (qa-engineer)
Spawn the `qa-engineer` agent to:
- Write test cases for the critical path
- Identify boundary and edge cases (sequence breaks, softlocks)
- Create a usability test checklist for the area
- Define acceptance criteria for level completion

4. **Compile the screen design document** combining all team outputs into the
 screen design template format.

5. **Save to** `design/levels/[level-name].md`.

6. **Output a summary** with: area overview, workflow step count, estimated asset
 list, narrative beats, any cross-team dependencies or open questions, open
 cross-level dependencies (adjacent areas referenced but not yet designed, each
 marked UNRESOLVED), and accessibility concerns with their resolution status.

## File Write Protocol

All file writes (screen design docs, narrative docs, test checklists) are delegated
to sub-agents spawned via Task. Each sub-agent enforces the "May I write to [path]?"
protocol. This orchestrator does not write files directly.

Verdict: **COMPLETE** — screen design document produced and all team outputs compiled.
Verdict: **BLOCKED** — one or more agents blocked; partial report produced with unresolved items listed.

## Next Steps

- Run `/design-review design/levels/[level-name].md` to validate the completed screen design doc.
- Run `/dev-story` to implement level content once the design is approved.
- Run `/qa-plan` to generate a QA test plan for this level.

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
- Scope too large → split into two stories via `/create-stories`
- Conflicting instructions between ADR and story → surface the conflict, do not guess
