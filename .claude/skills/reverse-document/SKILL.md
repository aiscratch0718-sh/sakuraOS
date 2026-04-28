---
name: reverse-document
description: "Generate design or architecture documents from existing implementation. Works backwards from code/prototypes to create missing planning docs."
argument-hint: "<type> <path> (e.g., 'design src/features/billing' or 'architecture src/server/lib')"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
# Read-only diagnostic skill — no specialist agent delegation needed
---

# Reverse Documentation

This skill analyzes existing implementation (code, prototypes, systems) and generates
appropriate design or architecture documentation. Use this when:
- You built a feature without writing a design doc first
- You inherited a codebase without documentation
- You prototyped a mechanic and need to formalize it
- You need to document "why" behind existing code

---

## Workflow

## Phase 1: Parse Arguments

**Format**: `/reverse-document <type> <path>`

**Type options**:
- `design` → Generate a product requirements document (PRD section)
- `architecture` → Generate an Architecture Decision Record (ADR)
- `concept` → Generate a concept document from prototype

**Path**: Directory or file to analyze
- `src/features/billing/` → All billing-related code
- `src/server/lib/audit-log.ts` → Specific file
- `prototypes/import-wizard/` → Prototype directory

**Examples**:
```bash
/reverse-document design src/features/billing
/reverse-document architecture src/server/lib/queue
/reverse-document concept prototypes/import-wizard
```

## Phase 2: Analyze Implementation

**Read and understand the code/prototype**:

**For design docs (PRD):**
- Identify the workflow, rules, formulas
- Extract tunable values (limits, thresholds, retry counts)
- Find state machines (entity status, lifecycle), domain events
- Detect edge cases handled in code (empty / loading / error / partial)
- Map dependencies (what features / services interact?)

**For architecture docs (ADR):**
- Identify patterns (repository, BFF, queue, event bus, observer)
- Understand technical decisions (transaction boundary, idempotency,
  caching strategy, multi-tenant scoping)
- Map dependencies and coupling
- Assess performance and operational characteristics
- Find constraints and trade-offs

**For concept docs (prototype analysis):**
- Identify the core workflow being validated
- Extract emergent usage patterns from the prototype's logs / fixtures
- Note what worked vs what didn't
- Find technical feasibility insights
- Document customer outcome / promise being tested

## Phase 3: Ask Clarifying Questions

**DO NOT** just describe the code. **ASK** about intent:

**Design questions**:
- "I see a [resource] system that depletes during [activity]. Was this for:
 - Pacing (prevent spam)?
 - Resource management (strategic depth)?
 - Or something else?"
- "The [mechanic] seems central. Is this a core pillar, or supporting feature?"
- "[Value] scales exponentially with [factor]. Intentional design, or needs rebalancing?"

**Architecture questions**:
- "You're using a service locator pattern. Was this chosen for:
 - Testability (mock dependencies)?
 - Decoupling (reduce hard references)?
 - Or inherited from existing code?"
- "I see manual memory management instead of smart pointers. Performance requirement, or legacy?"

**Concept questions**:
- "The prototype emphasizes batch import speed over inline editing. Is that the intended pillar?"
- "Users seem to use the search bar to navigate instead of the menu. Feature or bug?"

## Phase 4: Present Findings

Before drafting, show what you discovered:

```
I've analyzed [path]/. Here's what I found:

MECHANICS IMPLEMENTED:
- [mechanic-a] with [property] (e.g. timing windows, cooldowns)
- [mechanic-b] (e.g. interaction between two states)
- [resource] system (depletes on [action], regens on [condition])
- [state] system (builds up, triggers [effect])

FORMULAS DISCOVERED:
- [Output] = [formula using discovered variables]
- [Secondary output] = [formula]

UNCLEAR INTENT AREAS:
1. [Resource] system — pacing or resource management?
2. [Mechanic] — core pillar or supporting feature?
3. [Value] scaling — intentional design or needs tuning?

Before I draft the design doc, could you clarify these points?
```

Wait for user to clarify intent before drafting.

## Phase 5: Draft Document Using Template

Based on type, use appropriate template:

| Type | Template | Output Path |
|------|----------|-------------|
| `design` | `templates/design-doc-from-implementation.md` | `design/prd/[system-name].md` |
| `architecture` | `templates/architecture-doc-from-code.md` | `docs/architecture/[decision-name].md` |
| `concept` | `templates/concept-doc-from-prototype.md` | `prototypes/[name]/CONCEPT.md` or `design/concepts/[name].md` |

**Draft structure**:
- Capture **what exists** (mechanics, patterns, implementation)
- Document **why it exists** (intent clarified with user)
- Identify **what's missing** (edge cases not handled, gaps in design)
- Flag **follow-up work** (feature tradeoff tuning, missing features)

## Phase 6: Show Draft and Request Approval

**Collaborative protocol**:
```
I've drafted the [system-name] design doc based on your code and clarifications.

[Show key sections: Overview, Mechanics, Formulas, Design Intent]

ADDITIONS I MADE:
- Documented [mechanic] as "[intent]" per your clarification
- Added edge cases not in code (e.g., what if [resource] hits 0 mid-[action]?)
- Flagged feature tradeoff concern: [scaling type] scaling at [boundary condition]

SECTIONS MARKED AS INCOMPLETE:
- "[System] interaction with [other-system]" (not fully implemented yet)
- "[Variant or feature]" (only [subset] implemented so far)

May I write this to design/prd/[system-name].md?
```

Wait for approval. User may request changes before writing.

## Phase 7: Write Document with Metadata

When approved, write the file with special markers:

```markdown
---
status: reverse-documented
source: [path/]
date: [today]
verified-by: [User name]
---

# [System Name] Design

> **Note**: This document was reverse-engineered from the existing implementation.
> It captures current behavior and clarified design intent. Some sections may be
> incomplete where implementation is partial or intent was unclear.

[Rest of document...]
```

## Phase 8: Flag Follow-Up Work

After writing, suggest next steps:

```
✅ Written to design/prd/billing.md

FOLLOW-UP RECOMMENDED:
1. Run /tradeoff-check on billing tiers (per-seat upgrade ramp concern)
2. Create ADR for the idempotency-key strategy on payment-failure handling
3. Implement missing edge cases:
 - Customer cancels mid-billing-cycle behavior
 - Tax-jurisdiction change during a period
4. Extend the PRD when annual / multi-year contracts are added

Would you like me to tackle any of these now?
```

---

## Template Selection Logic

| If analyzing... | Use template... | Because... |
|----------------|-----------------|------------|
| `src/user flow/*` | design-doc-from-implementation.md | User-facing behavior mechanics → PRD |
| `src/core/*`, `src/ai/*` | architecture-doc-from-code.md | Core systems → ADR |
| `prototypes/*` | concept-doc-from-prototype.md | Experiments → concept doc |
| `src/networking/*` | architecture-doc-from-code.md | Technical systems → ADR |
| `src/ui/*` | design-doc-from-implementation.md | UI/UX → design spec |

---

## Example Session: Reverse-Document a System

```
User: /reverse-document design src/user flow/[system]

Agent: I'll analyze your [system] implementation to create a design doc.
 [Reads code, discovers mechanics, formulas]

Agent: I've analyzed src/user flow/[system]/. Here's what I found:
 [Shows mechanics, formulas, unclear areas]

 Before drafting, could you clarify:
 1. [Resource] system intent?
 2. Is [mechanic] a core pillar?
 3. [Value] scaling — intentional or needs tuning?

User: 1. [Resource] is for pacing, prevent [unwanted behavior]
 2. [Mechanic] is core — I want [design intent]
 3. Yeah, exponential is too much, should be linear

Agent: Perfect, that clarifies the vision. Let me draft the design doc.
 [Shows draft with clarified intent]

 May I write this to design/prd/[system-name].md?

User: Yes, write it.

Agent: ✅ Written to design/prd/[system-name].md
 ✅ Marked as [REVERSE-DOCUMENTED]
 ✅ Flagged [value] scaling for rebalancing

 Next steps:
 - Update [formula] to [corrected scaling]
 - Run /tradeoff-check to validate [curve]
 - Document [mechanic] as core pillar in product-pillars.md
```

---

## Collaborative Protocol

This skill follows the collaborative design principle:

1. **Analyze First**: Read code, understand implementation
2. **Question Intent**: Ask about "why", not just "what"
3. **Present Findings**: Show discoveries, highlight unclear areas
4. **User Clarifies**: Separate intent from accidents
5. **Draft Document**: Create doc based on reality + intent
6. **Show Draft**: Display key sections, explain additions
7. **Get Approval**: "May I write to [filepath]?" On approval: Verdict: **COMPLETE** — document generated. On decline: Verdict: **BLOCKED** — user declined write.
8. **Flag Follow-Up**: Suggest related work, don't auto-execute

**Never assume intent. Always ask before documenting "why".**
