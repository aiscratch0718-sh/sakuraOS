---
name: team-polish
description: "Orchestrate the polish team: coordinates performance-engineer, design-systems-engineer, interaction-designer, and qa-engineer to optimize, polish, and harden a feature or area for release quality."
argument-hint: "[feature or area to polish]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
---
If no argument is provided, output usage guidance and exit without spawning any agents:
> Usage: `/team-polish [feature or area]` — specify the feature or area to polish (e.g., `dashboard`, `onboarding`, `billing`, `import-wizard`). Do not use `AskUserQuestion` here; output the guidance directly.

When this skill is invoked with an argument, orchestrate the polish team through a structured pipeline.

**Decision Points:** At each phase transition, use `AskUserQuestion` to present
the user with the subagent's proposals as selectable options. Write the agent's
full analysis in conversation, then capture the decision with concise labels.
The user must approve before moving to the next phase.

## Team Composition
- **performance-engineer** — Profiling, optimization, memory analysis, frame budget
- **platform-engineer** — Framework-level bottlenecks: rendering pipeline, memory, resource loading (invoke when performance-engineer identifies low-level root causes)
- **design-systems-engineer** — VFX polish, stylesheet optimization, visual quality
- **interaction-designer** — Audio polish, mixing, ambient layers, feedback sounds
- **devx-engineer** — Content pipeline tool verification, editor tool stability, automation fixes (invoke when content authoring tools are involved in the polished area)
- **qa-engineer** — Edge case testing, regression testing, soak testing

## How to Delegate

Use the Task tool to spawn each team member as a subagent:
- `subagent_type: performance-engineer` — Profiling, optimization, memory analysis
- `subagent_type: platform-engineer` — Framework-level fixes for rendering, memory, resource loading
- `subagent_type: design-systems-engineer` — VFX polish, stylesheet optimization, visual quality
- `subagent_type: interaction-designer` — Audio polish, mixing, ambient layers
- `subagent_type: devx-engineer` — Content pipeline and editor tool verification
- `subagent_type: qa-engineer` — Edge case testing, regression testing, soak testing

Always provide full context in each agent's prompt (target feature/area, performance budgets, known issues). Launch independent agents in parallel where the pipeline allows it (e.g., Phases 3 and 4 can run simultaneously).

## Pipeline

### Phase 1: Assessment
Delegate to **performance-engineer**:
- Profile the target feature/area using `/perf-profile`
- Identify performance bottlenecks and frame budget violations
- Measure memory usage and check for leaks
- Benchmark against target hardware specs
- Output: performance report with prioritized optimization list

### Phase 2: Optimization
Delegate to **performance-engineer** (with relevant programmers as needed):
- Fix performance hotspots identified in Phase 1
- Optimize draw calls, reduce overdraw
- Fix memory leaks and reduce allocation pressure
- Verify optimizations don't change user flow behavior
- Output: optimized code with before/after metrics

If Phase 1 identified framework-level root causes (rendering pipeline, resource loading, memory allocator), delegate those fixes to **platform-engineer** in parallel:
- Optimize hot paths in framework systems
- Fix allocation pressure in core user flows
- Output: framework-level fixes with profiler validation

### Phase 3: Visual Polish (parallel with Phase 2)
Delegate to **design-systems-engineer**:
- Review VFX for quality and consistency with design system bible
- Optimize particle systems and stylesheet effects
- Add screen shake, camera effects, and visual juice where appropriate
- Ensure effects degrade gracefully on lower settings
- Output: polished visual effects

### Phase 4: Audio Polish (parallel with Phase 2)
Delegate to **interaction-designer**:
- Review interaction events for completeness (are any actions missing sound feedback?)
- Check audio mix levels — nothing too loud or too quiet relative to the mix
- Add ambient audio layers for atmosphere
- Verify audio plays correctly with spatial positioning
- Output: audio polish list and mixing notes

### Phase 5: Hardening
Delegate to **qa-engineer**:
- Test all edge cases: boundary conditions, rapid inputs, unusual sequences
- Soak test: run the feature for extended periods checking for degradation
- Stress test: maximum entities, worst-case scenarios
- Regression test: verify polish changes haven't broken existing functionality
- Test on minimum spec hardware (if available)
- Output: test results with any remaining issues

### Phase 6: Sign-off
- Collect results from all team members
- Compare performance metrics against budgets
- Report: READY FOR RELEASE / NEEDS MORE WORK
- List any remaining issues with severity and recommendations

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

## File Write Protocol

All file writes (performance reports, test results, evidence docs) are delegated to
sub-agents spawned via Task. Each sub-agent enforces the "May I write to [path]?"
protocol. This orchestrator does not write files directly.

## Output

A summary report covering: performance before/after metrics, visual polish changes, audio polish changes, test results, and release readiness assessment.

## Next Steps

- If READY FOR RELEASE: run `/release-checklist` for the final pre-release validation.
- If NEEDS MORE WORK: schedule remaining issues in `/sprint-plan update` and re-run `/team-polish` after fixes.
- Run `/gate-check` for a formal phase gate verdict before handing off to release.
