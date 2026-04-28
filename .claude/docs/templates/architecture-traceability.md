# Architecture Traceability Index

<!-- Living document — updated by /architecture-review after each review run.
 Do not edit manually unless correcting an error. -->

## Document Status

- **Last Updated**: [YYYY-MM-DD]
- **Framework**: [e.g. Next.js.6]
- **PRDs Indexed**: [N]
- **ADRs Indexed**: [M]
- **Last Review**: [link to docs/architecture/architecture-review-[date].md]

## Coverage Summary

| Status | Count | Percentage |
|--------|-------|-----------|
| ✅ Covered | [X] | [%] |
| ⚠️ Partial | [Y] | [%] |
| ❌ Gap | [Z] | [%] |
| **Total** | **[N]** | |

---

## Traceability Matrix

<!-- One row per technical requirement extracted from a PRD.
 A "technical requirement" is any PRD statement that implies a specific
 architectural decision: data structures, performance constraints, framework
 capabilities needed, cross-system communication, state persistence. -->

| Req ID | PRD | System | Requirement Summary | ADR(s) | Status | Notes |
|--------|-----|--------|---------------------|--------|--------|-------|
| TR-[prd]-001 | [filename] | [system name] | [one-line summary] | [ADR-NNNN] | ✅ | |
| TR-[prd]-002 | [filename] | [system name] | [one-line summary] | — | ❌ GAP | Needs `/architecture-decision [title]` |

---

## Known Gaps

Requirements with no ADR coverage, prioritised by layer (Foundation first):

### Foundation Layer Gaps (BLOCKING — must resolve before coding)
- [ ] TR-[id]: [requirement] — PRD: [file] — Suggested ADR: "[title]"

### Core Layer Gaps (must resolve before relevant system is built)
- [ ] TR-[id]: [requirement] — PRD: [file] — Suggested ADR: "[title]"

### Feature Layer Gaps (should resolve before feature sprint)
- [ ] TR-[id]: [requirement] — PRD: [file] — Suggested ADR: "[title]"

### Presentation Layer Gaps (can defer to implementation)
- [ ] TR-[id]: [requirement] — PRD: [file] — Suggested ADR: "[title]"

---

## Cross-ADR Conflicts

<!-- Pairs of ADRs that make contradictory claims. Must be resolved. -->

| Conflict ID | ADR A | ADR B | Type | Status |
|-------------|-------|-------|------|--------|
| CONFLICT-001 | ADR-NNNN | ADR-MMMM | Data ownership | 🔴 Unresolved |

---

## ADR → PRD Coverage (Reverse Index)

<!-- For each ADR, which PRD requirements does it address? -->

| ADR | Title | PRD Requirements Addressed | Framework Risk |
|-----|-------|---------------------------|-------------|
| ADR-0001 | [title] | TR-core-feature interaction-001, TR-core-feature interaction-002 | HIGH |

---

## Superseded Requirements

<!-- Requirements that existed in a PRD when an ADR was written, but the PRD
 has since changed. The ADR may need updating. -->

| Req ID | PRD | Change | Affected ADR | Status |
|--------|-----|--------|-------------|--------|
| TR-[id] | [file] | [what changed] | ADR-NNNN | 🔴 ADR needs update |

---

## How to Use This Document

**When writing a new ADR**: Add it to the "ADR → PRD Coverage" table and mark
the requirements it satisfies as ✅ in the matrix.

**When approving a PRD change**: Scan the matrix for requirements from that PRD
and check whether the change invalidates any existing ADR. Add to "Superseded
Requirements" if so.

**When running `/architecture-review`**: The skill will update this document
automatically with the current state.

**Gate check**: The Pre-Production gate requires this document to exist and to
have zero Foundation Layer Gaps.
