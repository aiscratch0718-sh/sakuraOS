# Session Example: Adopting a Brownfield Project

> Illustrative walk-through of `/adopt` on a project that has existing
> code and design notes but does not yet follow this template's format.

---

## Setup

The project: a 6-month-old SaaS with code in `src/`, ad-hoc design notes
in `design/`, and no ADRs. The user just adopted this template and runs:

```
/adopt
```

---

## Conversation (compressed)

### Phase 1: Inventory

The skill scans:
- `design/` — finds 4 ad-hoc markdown files in flat structure (not in
  the template's `design/prd/` layout)
- `docs/` — finds README.md and a single ARCHITECTURE.md
- `src/` — finds the source tree
- `.claude/` — finds the template's agent / skill / rule definitions

Output:

```
## Brownfield Audit

Existing artifacts:
- 4 design notes in design/ (none in design/prd/)
- 1 architecture doc (no ADR format)
- src/ tree with 3 feature modules
- No tests directory
- No production/sprints/ directory

Template-format compliance:
- ❌ design/ — 4 files in wrong location, no PRD format
- ❌ docs/architecture/ — empty; ARCHITECTURE.md not in ADR format
- ❌ tests/ — missing
- ❌ production/ — missing
- ✅ .claude/ — present (you just adopted)
```

### Phase 2: Migration Plan

The skill produces a numbered, prioritized plan:

```
| # | Task | Skill | Priority | Notes |
|---|------|-------|----------|-------|
| 1 | Migrate ad-hoc design notes to PRD format | /design-system retrofit | HIGH | 4 files; ~1h each |
| 2 | Decompose ARCHITECTURE.md into ADRs | /architecture-decision | HIGH | Likely 3–5 ADRs |
| 3 | Map existing src/ modules to a systems index | /map-systems | HIGH | Already decomposed in code |
| 4 | Scaffold tests/ infrastructure | /test-setup | MEDIUM | Vitest + Playwright per family |
| 5 | Set up production/sprints/ | /sprint-plan new | MEDIUM | After systems are mapped |
| 6 | Run /architecture-review on extracted ADRs | /architecture-review | MEDIUM | Validates after #2 completes |
| 7 | Run /security-audit baseline | /security-audit | MEDIUM | Reveals existing security debt |
```

### Phase 3: Mapping Existing Code to Systems

The skill suggests a draft systems index:

```
| System | Layer | Priority | Source | PRD Status |
|--------|-------|----------|--------|------------|
| auth | Foundation | MVP | src/server/auth/ | ❌ Missing |
| billing | Domain Core | MVP | src/features/billing/ | 1 ad-hoc note |
| reports | Workflow | MVP | src/features/reports/ | 1 ad-hoc note |
| dashboard UI | Presentation | MVP | src/app/(authenticated)/dashboard | ❌ Missing |
| audit log | Foundation | Beta | src/server/lib/audit/ | ❌ Missing |
```

> "Looks right. Add a `notifications` system — there's prototype code
> in `src/server/lib/notify-experiment/` that should be its own system."

The skill records the addition; the systems index now has 6 entries.

### Phase 4: Next Steps

```
Recommended sequence:

1. /map-systems — confirm the systems index reflects what exists
2. /design-system retrofit design/billing-notes.md — pull billing notes into a PRD
3. /design-system retrofit design/reports-notes.md
4. /design-system auth — net-new PRD; nothing in design/ yet
5. /architecture-decision (×3–5) — extract from ARCHITECTURE.md
6. /test-setup — scaffold testing infrastructure
7. /architecture-review — validate the extracted ADRs

Estimated time for steps 1–5: ~6 hours of focused work.
```

---

## Outcome

- Migration plan written to `production/adoption-plan-2026-04-28.md`
- The user proceeds to step 2 in a fresh session
- Existing code remains untouched until ADRs land — adoption is
  documentation-first, code-second
