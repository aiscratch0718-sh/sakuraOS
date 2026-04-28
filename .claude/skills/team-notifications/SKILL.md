---
name: team-notifications
description: "Orchestrate the notifications team: brand-director + interaction-designer + design-systems-engineer + feature-engineer for the full notification pipeline (in-app, email, browser push, webhooks) from voice to implementation."
argument-hint: "[feature or area to design notifications for]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
---

If no argument is provided, output usage guidance and exit without spawning any agents:
> Usage: `/team-notifications [feature or area]` — specify the feature or area to design notifications for (e.g., `billing-failure`, `signup-onboarding`, `report-ready`, `incident-alert`). Do not use `AskUserQuestion` here; output the guidance directly.

When this skill is invoked with an argument, orchestrate the notifications team through a structured pipeline.

**Decision Points:** At each step transition, use `AskUserQuestion` to present
the user with the subagent's proposals as selectable options. Write the agent's
full analysis in conversation, then capture the decision with concise labels.
The user must approve before moving to the next step.

1. **Read the argument** for the target feature or area (e.g., `billing-failure`,
 `signup-onboarding`, `report-ready`, `incident-alert`).

2. **Gather context**:
 - Read relevant PRDs in `design/prd/` for the feature
 - Read voice and tone guide at `design/brand/voice-and-tone.md` if it exists
 - Read existing notification specs in `design/notifications/` if any
 - Read the email template inventory at `design/notifications/email-templates.md` if it exists

## How to Delegate

Use the Task tool to spawn each team member as a subagent:
- `subagent_type: brand-director` — Voice and tone for transactional and lifecycle messages
- `subagent_type: interaction-designer` — In-app notification patterns (toast, banner, badge), live region behavior, dismiss logic
- `subagent_type: content-writer` — Subject lines, body copy, CTA copy, localization-ready strings
- `subagent_type: design-systems-engineer` — Notification component tokens, channel orchestration model
- `subagent_type: [primary framework specialist]` — Validate notification integration patterns for the framework
- `subagent_type: feature-engineer` — Notification dispatcher, channel adapters, queue, idempotency

Always provide full context in each agent's prompt (feature description, existing notification specs, PRD references).

3. **Orchestrate the notifications team** in sequence:

### Step 1: Voice & Channel Strategy (brand-director)
Spawn the `brand-director` agent to:
- Define the voice for this notification family (transactional vs lifecycle vs critical)
- Select channels (in-app, email, browser push, webhook, SMS) and the rationale for each
- Specify when each channel fires (immediate, batched/digest, fallback chain)
- Define quiet hours and frequency caps to avoid notification fatigue
- Establish escalation rules for critical events (e.g., payment failure → in-app + email + admin email)

### Step 2: Copy & Accessibility (parallel)
Spawn the `content-writer` agent to:
- Write subject lines, preview text, body copy, and CTA labels for every channel
- Provide localization-ready strings (no concatenation, no embedded HTML in keys)
- Author plain-text fallbacks for HTML emails
- Provide a "from name" and "reply-to" guidance per notification type

Spawn the `accessibility-specialist` agent in parallel to:
- Verify in-app notifications use `aria-live` regions appropriately (`polite` for routine, `assertive` for errors only — never `assertive` for promotional content)
- Check that no notification is conveyed by color alone (icon, text, and ARIA role together)
- Confirm dismiss controls are keyboard-reachable with visible focus
- Confirm timed auto-dismiss has a "pause / extend" affordance for users with cognitive accessibility needs
- Output: accessibility requirements list integrated into the notification spec

### Step 3: Component & Integration Design (parallel)
Spawn the `design-systems-engineer` agent to:
- Design / reuse the in-app notification components (toast, banner, modal alert) in the design system
- Define the notification dispatcher contract (single emit point → channel adapters)
- Specify queueing, deduplication, and idempotency rules
- Specify retention (how long does a user see a notification in the bell tray?)

Spawn the **primary framework specialist** in parallel (from `.claude/docs/technical-preferences.md` Framework Specialists) to validate the integration approach:
- Is the proposed dispatcher pattern idiomatic for the framework? (e.g., Server Actions + email service in Next.js; queue + worker in NestJS; library choice for browser push)
- Any framework-specific gotchas for live regions, server-sent events, or websocket channels?
- Known framework changes that affect the integration plan?
- Output: framework notification integration notes to merge with the design-systems-engineer's plan

If no framework is configured, skip the specialist spawn.

### Step 4: Implementation (feature-engineer)
Spawn the `feature-engineer` agent to:
- Implement the notification dispatcher and channel adapters (email, in-app, browser push, webhook)
- Wire feature events to the dispatcher
- Implement quiet hours and frequency caps
- Implement idempotency keys and dedup
- Write unit tests for dispatcher behavior and channel adapter contracts

4. **Compile the notification design document** combining all team outputs.

5. **Save to** `design/notifications/[feature].md`.

6. **Output a summary** with: notification count, channels used, copy review status,
 implementation tasks, and any open questions between team members.

Verdict: **COMPLETE** — notification design document produced and team pipeline finished.

If the pipeline stops because a dependency is unresolved (e.g., critical accessibility gap or missing PRD not resolved by the user):

Verdict: **BLOCKED** — [reason]

## File Write Protocol

All file writes (notification design docs, copy specs, implementation files) are delegated
to sub-agents spawned via Task. Each sub-agent enforces the "May I write to [path]?"
protocol. This orchestrator does not write files directly.

## Next Steps

- Review the notification design doc with the brand-director before implementation begins.
- Use `/dev-story` to implement the dispatcher and channel adapters once the design is approved.
- Run `/localize` to produce translator-ready strings for every notification copy element.

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
- Input file missing (PRD absent) → redirect to the skill that creates it
- ADR status is Proposed → do not implement; run `/architecture-decision` first
- Scope too large → split into smaller stories via `/create-stories`
- Conflicting instructions between ADR and story → surface the conflict, do not guess
