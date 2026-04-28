---
name: review-all-prds
description: "Holistic cross-PRD consistency and product design review. Reads all system PRDs simultaneously and checks for contradictions between them, stale references, ownership conflicts, formula incompatibilities, and product design theory violations (dominant strategies, economic imbalance, cognitive overload, pillar drift). Run after all MVP PRDs are written, before architecture begins."
argument-hint: "[focus: full | consistency | design-theory | since-last-review]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, AskUserQuestion, Task
model: opus
---

# Review All PRDs

This skill reads every system PRD simultaneously and performs two complementary
reviews that cannot be done per-PRD in isolation:

1. **Cross-PRD Consistency** — contradictions, stale references, and ownership
 conflicts between documents
2. **Product Design Holism** — issues that only emerge when you see all systems
 together: dominant strategies, broken economies, cognitive overload, pillar
 drift, competing progression loops

**This is distinct from `/design-review`**, which reviews one PRD for internal
completeness. This skill reviews the *relationships* between all PRDs.

**When to run:**
- After all MVP-tier PRDs are individually approved
- After any PRD is significantly revised mid-production
- Before `/create-architecture` begins (architecture built on inconsistent PRDs
 inherits those inconsistencies)

**Argument modes:**

**Focus:** `$ARGUMENTS[0]` (blank = `full`)

- **No argument / `full`**: Both consistency and design theory passes
- **`consistency`**: Cross-PRD consistency checks only (faster)
- **`design-theory`**: Product design holism checks only
- **`since-last-review`**: Only PRDs modified since the last review report (git-based)

---

## Phase 1: Load Everything

### Phase 1a — L0: Summary Scan (fast, low tokens)

Before reading any full document, use Grep to extract `## Summary` sections
from all PRD files:

```
Grep pattern="## Summary" glob="design/prd/*.md" output_mode="content" -A 5
```

Display a manifest to the user:
```
Found [N] PRDs. Summaries:
 • billing.md — [summary text]
 • inventory.md — [summary text]
 ...
```

For `since-last-review` mode: run `git log --name-only` to identify PRDs
modified since the last review report file was written. Show the user which
PRDs are in scope based on summaries before doing any full reads. Only
proceed to L1 for those PRDs plus any PRDs listed in their "Key deps".

### Phase 1b — Registry Pre-Load (fast baseline)

Before full-reading any PRD, check for the entity registry:

```
Read path="design/registry/entities.yaml"
```

If the registry exists and has entries, use it as a **pre-built conflict
baseline**: known entities, items, formulas, and constants with their
authoritative values and source PRDs. In Phase 2, grep PRDs for registered
names first — this is faster than reading all PRDs in full before knowing
what to look for.

If the registry is empty or absent: proceed without it. Note in the report:
"Entity registry is empty — consistency checks rely on full PRD reads only.
Run `/consistency-check` after this review to populate the registry."

### Phase 1c — L1/L2: Full Document Load

Full-read the in-scope documents:

1. `design/prd/product-concept.md` — product vision, core user flow, MVP definition
2. `design/prd/product-pillars.md` if it exists — design pillars and anti-pillars
3. `design/prd/systems-index.md` — authoritative system list, layers, dependencies, status
4. **Every in-scope system PRD in `design/prd/`** — read completely (skip
 product-concept.md and systems-index.md — those are read above)

Report: "Loaded [N] system PRDs covering [M] systems. Pillars: [list]. Anti-pillars: [list]."

If fewer than 2 system PRDs exist, stop:
> "Cross-PRD review requires at least 2 system PRDs. Write more PRDs first,
> then re-run `/review-all-prds`."

---

### Parallel Execution

Phase 2 (Consistency) and Phase 3 (Design Theory) are independent — they read
the same PRD inputs but produce separate reports. Spawn both as parallel Task
agents simultaneously rather than waiting for Phase 2 to complete before
starting Phase 3. Collect both results before writing the combined report.

---

## Phase 2: Cross-PRD Consistency

Work through every pair and group of PRDs to find contradictions and gaps.

### 2a: Dependency Bidirectionality

For every PRD's Dependencies section, check that every listed dependency is
reciprocal:
- If PRD-A lists "depends on PRD-B", check that PRD-B lists PRD-A as a dependent
- If PRD-A lists "depended on by PRD-C", check that PRD-C lists PRD-A as a dependency
- Flag any one-directional dependency as a consistency issue

```
⚠️ Dependency Asymmetry
[system-a].md lists: Depends On → [system-b].md
[system-b].md does NOT list [system-a].md as a dependent
→ One of these documents has a stale dependency section
```

### 2b: Rule Contradictions

For each product rule, mechanic, or constraint defined in any PRD, check whether
any other PRD defines a contradicting rule for the same situation:

Categories to scan:
- **Floor/ceiling rules**: Does any PRD define a minimum value for an output? Does any other say a different system can bypass that floor? These contradict.
- **Resource ownership**: If two PRDs both define how a shared resource accumulates or depletes, do they agree?
- **State transitions**: If PRD-A describes what happens when a character dies,
 does PRD-B's description of the same event agree?
- **Timing**: If PRD-A says "X happens on the same frame", does PRD-B assume
 it happens asynchronously?
- **Stacking rules**: If PRD-A says status effects stack, does PRD-B assume
 they don't?

```
🔴 Rule Contradiction
[system-a].md: "Minimum [output] after reduction is [floor_value]"
[system-b].md: "[mechanic] bypasses [system-a]'s rules and can reduce [output] to 0"
→ These rules directly contradict. Which PRD is authoritative?
```

### 2c: Stale References

For every cross-document reference (PRD-A mentions a mechanic, value, or
system name from PRD-B), verify the referenced element still exists in PRD-B
with the same name and behaviour:

- If PRD-A says "discount rate from the billing system feeds into reporting", check
 that the billing PRD actually defines a discount rate that outputs to reporting
- If PRD-A references "the entitlement matrix defined in [system].md", check that
 [system].md actually has that matrix, not a different entitlement model
- If PRD-A was written before PRD-B and assumed a mechanic that PRD-B later
 designed differently, flag PRD-A as containing a stale reference

```
⚠️ Stale Reference
inventory.md (written first): "Item weight uses the encumbrance formula
 from movement.md"
movement.md (written later): Defines no encumbrance formula — uses a flat
 carry limit instead
→ inventory.md references a formula that doesn't exist
```

### 2d: Data and Tuning Knob Ownership Conflicts

Two PRDs should not both claim to own the same data or tuning knob. Scan all
Tuning Knobs sections across all PRDs and flag duplicates:

```
⚠️ Ownership Conflict
[system-a].md Tuning Knobs: "[multiplier_name] — controls [output] scaling"
[system-b].md Tuning Knobs: "[multiplier_name] — scales [output] with [factor]"
→ Two PRDs define multipliers on the same output. Which owns the final value?
 This will produce either a double-application bug or a design conflict.
```

### 2e: Formula Compatibility

For PRDs whose formulas are connected (output of one feeds input of another),
check that the output range of the upstream formula is within the expected
input range of the downstream formula:

- If [system-a].md outputs values between [min]–[max], and [system-b].md is
 designed to receive values between [min2]–[max2], is the mismatch intentional?
- If an economy PRD expects resource acquisition in range X, and the
 progression PRD generates it at range Y, the economy will be trivial or
 inaccessible — is that intended?

Flag incompatibilities as CONCERNS (design judgment needed, not necessarily wrong):

```
⚠️ Formula Range Mismatch
[system-a].md: Max [output] = [value_a] (at max [condition])
[system-b].md: Base [input] = [value_b], max [input] = [value_c]
→ Late-[stage] [scenario] can resolve in a single [event].
 Is this intentional? If not, either [system-a]'s ceiling or [system-b]'s ceiling needs adjustment.
```

### 2f: Acceptance Criteria Cross-Check

Scan Acceptance Criteria sections across all PRDs for contradictions:

- PRD-A criteria: "User cannot die from a single hit"
- PRD-B criteria: "Boss attack deals 150% of user max health"
These acceptance criteria cannot both pass simultaneously.

---

## Phase 3: Product Design Holism

Review all PRDs together through the lens of product design theory and user
psychology. These are issues that individual PRD reviews cannot catch because
they require seeing all systems at once.

### 3a: Progression Loop Competition

A product should have one dominant progression loop that users feel is "the
point" of the product, with supporting loops that feed into it. When multiple
systems compete equally as the primary progression driver, users don't know
what the product is about.

Scan all PRDs for systems that:
- Drive the customer's primary outcome (activation, retention, expansion)
- Define themselves as the "core" or "main" workflow
- Have comparable depth and time investment to other systems doing the same

```
⚠️ Competing Primary Workflows
billing.md: Drives expansion via per-seat upgrades, described as "the core revenue motion"
imports.md: Drives retention via batch ingestion, described as "the daily anchor"
reporting.md: Drives habit via weekly digests, described as "the main return reason"
→ Three systems all claim to be the primary workflow and all compete for
 the customer's daily attention. Customers will adopt one and ignore the
 others. Consider: one primary workflow with the others as support flows.
```

### 3b: User Attention Budget

Count how many systems require active user attention simultaneously during
a typical session. Each actively-managed system costs attention:

- Active = user must make decisions about this system regularly during use
- Passive = system runs automatically, user sees results but doesn't manage it

More than 3-4 simultaneously active systems creates cognitive overload for most
users. Present the count and flag if it exceeds 4 concurrent active systems:

```
⚠️ Cognitive Load Risk
Simultaneously active systems during [core user flow moment]:
 1. [system-a].md — [decision type] (active)
 2. [system-b].md — [resource management] (active)
 3. [system-c].md — [tracking] (active)
 4. [system-d].md — [item/action use] (active)
 5. [system-e].md — [cooldown/timer management] (active)
 6. [system-f].md — [coordination decisions] (active)
→ 6 simultaneously active systems during the core user flow.
 Research suggests 3-4 is the comfortable limit for most users.
 Consider: which of these can be made passive or simplified?
```

### 3c: Dominant Strategy Detection

A dominant strategy makes other strategies irrelevant — users discover it,
use it exclusively, and find the rest of the product boring. Look for:

- **Resource monopolies**: One strategy generates a resource significantly
 faster than all others
- **Risk-free power**: A strategy that is both high-reward and low-risk
 (if high-risk strategies exist, they need proportionally higher reward)
- **No trade-offs**: An option that is superior in all dimensions to all others
- **Obvious optimal path**: If any progression choice is "clearly correct",
 the others aren't real choices

```
⚠️ Potential Dominant Strategy
pricing-tiers.md: "Pro" tier offers 80% of "Enterprise" features at 30% of the price
pricing-tiers.md: "Enterprise" tier offers SSO, SAML, audit-log retention beyond 90 days
→ Unless "Enterprise" has a significant compensating advantage (security
 controls, dedicated support SLA, contractual terms), "Pro" is dominant —
 lower cost, only 20% less feature coverage. Consider what "Enterprise"
 offers that "Pro" cannot.
```

### 3d: Economic Loop Analysis

Identify all resources across all PRDs (gold, XP, crafting materials, stamina,
health, mana, etc.). For each resource, map its **sources** (how users gain
it) and **sinks** (how users spend it).

Flag dangerous economic conditions:

| Condition | Sign | Risk |
|-----------|------|------|
| **Infinite source, no sink** | Resource accumulates indefinitely | Late product becomes trivially easy |
| **Sink, no source** | Resource drains to zero | System becomes unavailable |
| **Source >> Sink** | Surplus accumulates | Resource becomes meaningless |
| **Sink >> Source** | Constant scarcity | Frustration and gatekeeping |
| **Positive feedback loop** | More resource → easier to earn more | Runaway leader, snowball |
| **No catch-up** | Falling behind accelerates deficit | Unrecoverable states |

```
🔴 Resource Imbalance: Unbounded API Quota
api-quota economy:
 Sources: included quota per tier (resets monthly), one-time top-up purchase
 Sinks: per-call cost (sub-cent), report generation (modest), data export (modest)
→ After the included quota is exhausted, top-up purchase has no proportional
 sink — usage rarely consumes a meaningful fraction of a top-up. Customers
 buy top-ups defensively and never use them. Consider: smaller top-up
 increments, or shift to usage-billing instead of fixed top-up.
```

### 3e: Difficulty Curve Consistency

When multiple systems scale with user progression, they must scale in
compatible directions and at compatible rates. Mismatched scaling curves
create unintended difficulty spikes or trivialisations.

For each system that scales over time, extract:
- What scales (edge case health, user damage, resource cost, area size)
- How it scales (linear, exponential, stepped)
- When it scales (level, time, area)

Compare all scaling curves. Flag mismatches:

```
⚠️ Scaling Curve Mismatch
pricing-tiers.md: Per-tenant rate limit grows linearly across tiers (+50/min per tier)
usage-metering.md: Charge per overage unit grows quadratically with tier
→ A growing customer who upgrades tiers expects fewer surprises, not more.
 Heavy users who outgrow the highest tier face accelerating overage costs
 without a clear next step. Reconcile the curves so growth is predictable.
```

### 3f: Pillar Alignment

Every system should clearly serve at least one design pillar. A system that
serves no pillar is "scope creep by design" — it's in the product but not in
service of what the product is trying to be.

For each PRD system, check its User Fantasy section against the design pillars.
Flag any system whose stated fantasy doesn't map to any pillar:

```
⚠️ Pillar Drift
in-app-chat.md: Customer outcome — "casual social messaging between coworkers"
Pillars: "Operational discipline", "Auditable decisions", "Compliance-ready"
→ The in-app chat system serves none of the three pillars. Either add a
 pillar that covers it, redesign it to serve an existing pillar
 (e.g., scoped to compliance-relevant audit threads), or cut it.
```

Also check anti-pillars — flag any system that does what an anti-pillar
explicitly says the product will NOT do:

```
🔴 Anti-Pillar Violation
Anti-Pillar: "We will NOT do real-time collaboration — async-first"
shared-cursor.md: Defines a live shared-cursor experience on every document
→ This system directly violates the defined anti-pillar.
```

### 3g: User Fantasy Coherence

The user fantasies across all systems should be compatible — they should
reinforce a consistent identity for what the user IS in this product. Conflicting
user fantasies create identity confusion.

```
⚠️ Customer Outcome Conflict
billing.md: "Customer is in tight control — every charge is reviewable line-by-line"
auto-billing.md: "Customer is hands-off — billing happens automatically with minimal touch"
admin-overrides.md: "Customer can override any billing rule on demand for VIP accounts"
→ Three systems present incompatible operating models. Customers will feel
 the product doesn't know how it wants them to operate. Consider: do these
 outcomes serve the same role from different angles, or do they genuinely
 conflict?
```

---

## Phase 4: Cross-System Scenario Walkthrough

Walk through the product from the user's perspective to find problems that only
appear at the interaction boundary between multiple systems — things static
analysis of individual PRDs cannot surface.

### 4a: Identify Key Multi-System Moments

Scan all PRDs and identify the 3–5 most important user-facing moments where
multiple systems activate simultaneously. Look specifically for:

- **Workflow + Billing overlap**: actions that consume billable usage,
  hitting a soft / hard limit mid-action, plan downgrade affecting an
  in-flight workflow
- **Workflow + Permissions overlap**: role change mid-workflow, RBAC
  policy update changing access to in-progress records
- **Workflow + Notifications overlap**: action triggering email +
  in-app notification + audit log + analytics event simultaneously
- **3+ system chains**: any user action that triggers System A, which
  feeds into System B, which triggers System C (these are highest-risk
  interaction paths)

List each identified scenario with a one-line description before proceeding.

### 4b: Walk Through Each Scenario

For each scenario, step through the sequence explicitly:

1. **Trigger** — what user action or product event starts this?
2. **Activation order** — which systems activate, in what sequence?
3. **Data flow** — what does each system output, and is that output a valid
 input for the next system in the chain?
4. **User experience** — what does the user see, hear, or feel at each step?
5. **Failure modes** — are there any of the following?
 - **Race conditions**: two systems trying to modify the same state simultaneously
 - **Feedback loops**: System A amplifies System B which re-amplifies System A
 with no cap or dampener
 - **Broken state transitions**: a system assumes a state that a previous
 system may have changed (e.g., "subscription is active" assumption
 after a billing step that could have downgraded the plan)
 - **Contradictory messaging**: user receives conflicting feedback from two
 systems reacting to the same event (e.g., "success" sound + "failure" UI)
 - **Compounding difficulty spikes**: two systems both scaling up at the same
 progression point, multiplying the intended difficulty increase
 - **Reward conflicts**: two systems both reacting to the same trigger with
 rewards that together exceed the intended value (double-dipping)
 - **Undefined behavior**: the PRDs don't specify what happens in this combined
 state (neither system's rules cover it)

```
Example walkthrough:
Scenario: Customer hits seat-limit while inviting a teammate during a billing-cycle close

Trigger: Admin clicks "Invite teammate"
→ users.md: validates invite payload, creates pending invite
→ entitlements.md: checks seat count vs plan cap → seat cap reached
 Output: rejection with "upgrade required" message
→ billing.md: customer chooses "auto-upgrade to next tier"
 Output: prorated charge calculated, plan tier increased
→ users.md (again): retries invite creation → succeeds
 ⚠️ Data flow issue: billing.md issues the prorated charge without
 confirming the invite would succeed (e.g., the invitee email is invalid).
 If the second invite call fails, the customer is on a higher-priced
 plan with no extra teammate. progression.md has no rollback path.
 Undefined behavior: does the customer get a refund? Is the upgrade
 reversed automatically?
```

### 4c: Flag Scenario Issues

For each problem found during the walkthrough, categorize severity:

- **BLOCKER**: undefined behavior, broken state transition, or contradictory
 user messaging — the experience is broken or incoherent in this scenario
- **WARNING**: compounding spikes, feedback loops without caps, reward conflicts —
 the experience works but produces unintended outcomes
- **INFO**: minor ordering ambiguity or messaging overlap — worth noting but
 unlikely to cause user-visible problems

Add all findings to the output report under **"Cross-System Scenario Issues"**.
Each finding must cite: the scenario name, the specific systems involved, the
step where the issue occurs, and the nature of the failure mode.

---

## Phase 5: Output the Review Report

```
## Cross-PRD Review Report
Date: [date]
PRDs Reviewed: [N]
Systems Covered: [list]

---

### Consistency Issues

#### Blocking (must resolve before architecture begins)
🔴 [Issue title]
[What PRDs are involved, what the contradiction is, what needs to change]

#### Warnings (should resolve, but won't block)
⚠️ [Issue title]
[What PRDs are involved, what the concern is]

---

### Product Design Issues

#### Blocking
🔴 [Issue title]
[What the problem is, which PRDs are involved, design recommendation]

#### Warnings
⚠️ [Issue title]
[What the concern is, which PRDs are affected, recommendation]

---

### Cross-System Scenario Issues

Scenarios walked: [N]
[List scenario names]

#### Blockers
🔴 [Scenario name] — [Systems involved]
[Step where failure occurs, nature of the failure mode, what must be resolved]

#### Warnings
⚠️ [Scenario name] — [Systems involved]
[What the unintended outcome is, recommendation]

#### Info
ℹ️ [Scenario name] — [Systems involved]
[Minor ordering ambiguity or note]

---

### PRDs Flagged for Revision

| PRD | Reason | Type | Priority |
|-----|--------|------|----------|
| [system-a].md | Rule contradiction with [system-b].md | Consistency | Blocking |
| [system-c].md | Stale reference to nonexistent mechanic | Consistency | Blocking |
| [system-d].md | No pillar alignment | Design Theory | Warning |

---

### Verdict: [PASS / CONCERNS / FAIL]

PASS: No blocking issues. Warnings present but don't prevent architecture.
CONCERNS: Warnings present that should be resolved but are not blocking.
FAIL: One or more blocking issues must be resolved before architecture begins.

### If FAIL — required actions before re-running:
[Specific list of what must change in which PRD]
```

---

## Phase 6: Write Report and Flag PRDs

Use `AskUserQuestion` for write permission:
- Prompt: "May I write this review to `design/prd/prd-cross-review-[date].md`?"
- Options: `[A] Yes — write the report` / `[B] No — skip`

If any PRDs are flagged for revision, use a second `AskUserQuestion`:
- Prompt: "Should I update the systems index to mark these PRDs as needing revision? ([list of flagged PRDs])"
- Options: `[A] Yes — update systems index` / `[B] No — leave as-is`
- If yes: update each flagged PRD's Status field in systems-index.md to "Needs Revision".
 (Do NOT append parentheticals to the status value — other skills match "Needs Revision"
 as an exact string and parentheticals break that match.)

### Session State Update

After writing the report (and updating systems index if approved), silently
append to `production/session-state/active.md`:

 ## Session Extract — /review-all-prds [date]
 - Verdict: [PASS / CONCERNS / FAIL]
 - PRDs reviewed: [N]
 - Flagged for revision: [comma-separated list, or "None"]
 - Blocking issues: [N — brief one-line descriptions, or "None"]
 - Recommended next: [the Phase 7 handoff action, condensed to one line]
 - Report: design/prd/prd-cross-review-[date].md

If `active.md` does not exist, create it with this block as the initial content.
Confirm in conversation: "Session state updated."

---

## Phase 7: Handoff

After all file writes are complete, use `AskUserQuestion` for a closing widget.

Before building options, check project state:
- Are there any Warning-level items that are simple edits (flagged with "30-second edit", "brief addition", or similar)? → offer inline quick-fix option
- Are any PRDs in the "Flagged for Revision" table? → offer /design-review option for each
- Read systems-index.md for the next system with Status: Not Started → offer /design-system option
- Is the verdict PASS or CONCERNS? → offer /gate-check or /create-architecture

Build the option list dynamically — only include options that apply:

**Option pool:**
- `[_] Apply quick fix: [W-XX description] in [prd-name].md — [effort estimate]` (one option per simple-edit warning; only for Warning-level, not Blocking)
- `[_] Run /design-review [flagged-prd-path] — address flagged warnings` (one per flagged PRD, if any)
- `[_] Run /design-system [next-system] — next in design order` (always include, name the actual system)
- `[_] Run /create-architecture — begin architecture (verdict is PASS/CONCERNS)` (include if verdict is not FAIL)
- `[_] Run /gate-check — validate Systems Design phase gate` (include if verdict is PASS)
- `[_] Stop here`

Assign letters A, B, C… only to included options. Mark the most pipeline-advancing option as `(recommended)`.

Never end the skill with plain text. Always close with this widget.

---

## Error Recovery Protocol

If any spawned agent returns BLOCKED, errors, or fails to complete:

1. **Surface immediately**: Report "[AgentName]: BLOCKED — [reason]" before continuing
2. **Assess dependencies**: If the blocked agent's output is required by a later phase, do not proceed past that phase without user input
3. **Offer options** via AskUserQuestion with three choices:
 - Skip this agent and note the gap in the final report
 - Retry with narrower scope (fewer PRDs, single-system focus)
 - Stop here and resolve the blocker first
4. **Always produce a partial report** — output whatever was completed so work is not lost

---

## Collaborative Protocol

1. **Read silently** — load all PRDs before presenting anything
2. **Show everything** — present the full consistency and design theory analysis
 before asking for any action
3. **Distinguish blocking from advisory** — not every issue needs to block
 architecture; be clear about which do
4. **Don't make design decisions** — flag contradictions and options, but never
 unilaterally decide which PRD is "right"
5. **Ask before writing** — confirm before writing the report or updating the
 systems index
6. **Be specific** — every issue must cite the exact PRD, section, and text
 involved; no vague warnings
