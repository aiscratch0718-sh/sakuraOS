# Session Example: Scope Crisis Decision

> Illustrative walk-through of using `/scope-check` and `engineering-manager`
> when a sprint is at risk and a scope decision must be made. Names and
> numbers are illustrative.

---

## Setup

Mid-sprint, week 2 of 3. The team committed 8 stories. After standup, the
engineering-manager observes:

- 3 stories complete
- 2 in code review (likely complete this week)
- 2 still in implementation, behind schedule
- 1 not started (blocked on an external dependency that just resolved)

**Velocity assessment**: at the current pace, only 6 of 8 stories will
ship this sprint. The user (acting as engineering-manager) runs:

```
/scope-check
```

---

## Conversation (compressed)

The skill reads:
- `production/sprints/sprint-2026-04-w2.md` — the sprint plan
- The 8 story files and their current statuses
- `production/sprint-status-2026-04-w2.md` (most recent status snapshot)

It produces a structured assessment:

```
## Scope Check — Sprint 2026-04-w2

Committed: 8 stories (24 points)
Done:      3 stories (9 points)
In review: 2 stories (6 points)
At risk:   2 stories (6 points)
Not started: 1 story (3 points)

Trajectory at current velocity: 6 of 8 stories complete.
Recommendation: cut 2 stories from this sprint, or accept the 2-story slip.

Candidates to cut (lowest-risk per business value):
- story-018-export-csv-progress-bar — Visual/Feel polish; Pro tier only
- story-021-admin-settings-redesign — Internal-only; no customer impact

Stories to KEEP (highest-leverage):
- story-014-apply-discount — Logic, gates revenue; LOG TR-BILL-014
- story-015-invoice-generation-async — required for end-to-end billing
- story-019-rbac-policy-update — security-engineer flagged blocker
```

The user uses `AskUserQuestion`:

> "How do you want to handle this?"
> Options: "Cut both candidates, keep velocity", "Slip — extend sprint by
> 1 week", "Re-plan — promote one cut and defer another high-risk story"

User picks "Cut both candidates, keep velocity."

The skill:
- Updates the sprint plan to mark the two cut stories as "Deferred to
  next sprint"
- Adds a one-line note to each story file
- Surfaces the two stories as candidates in the upcoming
  `/sprint-plan` for the next sprint
- Documents the decision in `production/sprints/decisions.md` for the
  retrospective

---

## Outcome

- Sprint scope reduced to 6 stories (18 points)
- Two cut stories carried over with rationale captured
- Customer-success-manager notified that the dashboard polish story slips
  to next sprint (no customer commitment was made for this release)
- Sprint retrospective will include "what made the bottom-2 stories
  underestimated?" as a discussion topic
