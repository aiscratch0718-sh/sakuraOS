---
paths:
 - "design/prd/**"
---

# PRD Document Rules

- Every PRD must contain the 8 required sections defined in `design/CLAUDE.md`:
  Overview, Target User & Job, User Journey, Functional Requirements,
  Edge Cases & Failure Modes, Out of Scope, Acceptance Criteria, Success Metrics
- Functional requirements use SHALL / SHOULD / MAY (RFC 2119) and are
  individually numbered and testable. Each requirement gets a stable TR-ID
  that survives renumbering (e.g., `TR-BILL-014`)
- Edge Cases must include the standard B2B set: empty / loading / error /
  partial-data / permission-denied / network-failure / concurrent-edit
- Edge Cases must explicitly state what happens, not just "handle gracefully"
- Dependencies must be bidirectional — if PRD A depends on PRD B, B's
  PRD lists A in `referenced_by` and the entity registry reflects both sides
- Acceptance Criteria must be testable — a QA engineer must be able to verify
  pass / fail without reading any other document
- No hand-waving: "the experience should feel responsive" is not a valid
  specification. State the measurable threshold (e.g., "TTFB ≤ 250ms p95")
- Pricing, limit, threshold, and entitlement values must link to their source
  (the commercial model in `design/commercial/` or an ADR), not appear inline
  as unexplained numbers
- PRDs MUST be written incrementally: create the skeleton first, then fill
  each section one at a time with user approval between sections. Write each
  approved section to the file immediately to persist decisions and manage
  context budget
- Never commit a PRD with a `[TO BE CONFIGURED]` placeholder in a section
  that gates implementation — block the story instead
