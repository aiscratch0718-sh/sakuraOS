# Session Example: Design an Import Pipeline System

> Illustrative walk-through of `/design-system` for a workflow-heavy system
> (CSV / API import). Names and numbers are illustrative.

---

## Setup

The system: **Import Pipeline** — customers upload large CSV files
(or call the bulk API) to ingest records into the product. The pipeline
must validate, deduplicate, partially commit on row-level failures, and
surface progress.

Skill invocation: `/design-system import-pipeline`

---

## Conversation (compressed)

**Skill** loads context:
- Reads `design/prd/product-concept.md` — confirms the product is
  finance-ops focused, customer mid-market
- Reads `design/prd/systems-index.md` — finds `import-pipeline` listed
  with priority MVP, depends on `auth`, `multi-tenancy`, `audit-log`
- Reads `docs/architecture/control-manifest.md` for current rules
- Surfaces a Technical Feasibility Brief based on
  `docs/framework-reference/<family>/modules/messaging.md`

**Skill** asks: "Ready to start designing import-pipeline?"

**User**: "Yes."

---

### Section 1: Overview

Skill writes a one-paragraph summary: "Customers upload tabular data and the
product ingests it row-by-row, validating each row, deduplicating against
existing records, and producing a typed import report. Partial commits
allowed; full rollback is not." User approves; skill writes to file.

### Section 2: Target User & Job

Spawned `product-manager` agent provides 3 candidate JTBDs. The user picks:

> "When I have a monthly batch of new accounts from our CRM and need to
> reconcile them into the product without double-creating, I want to upload
> a CSV and trust the dedupe so I can move on to month-end review."

### Section 3: User Journey

The user walks through: choose source (CSV / API), confirm field
mapping, submit, watch progress, review the import report, resolve errors.
Skill writes the journey with happy path, alternative paths (resume on
failure, partial-commit), and failure paths (auth-token expired,
quota exhausted, invalid file).

### Section 4: Functional Requirements

Numbered SHALL / SHOULD / MAY items, each gets a TR-ID:

- `TR-IMP-001`: SHALL stream rows in chunks of 1,000 to bound memory
- `TR-IMP-002`: SHALL deduplicate against existing records on a
  per-table key (configurable per import type)
- `TR-IMP-003`: SHOULD support pause / resume on user request
- `TR-IMP-004`: SHALL produce a row-level report with reason codes
- `TR-IMP-005`: SHALL bound a single import to the customer's
  per-tenant rate limit
- `TR-IMP-006`: SHALL run import as a queued background job
  (queue: BullMQ)
- (etc.)

### Section 5: Edge Cases

Standard B2B coverage: empty file, file exceeds size limit, mixed line
endings, BOM, partial-byte upload, network failure mid-stream,
permission denied, concurrent edit (target record changed during import),
quota exhausted mid-import.

### Section 6: Out of Scope

- Real-time push imports (out of MVP)
- Cross-tenant data sharing during import (forbidden, not just out of scope)
- AI-suggested field mapping (deferred to follow-up)

### Section 7: Acceptance Criteria

Given / When / Then for every functional requirement and edge case, each
linked back to its TR-ID.

### Section 8: Success Metrics

- ≥ 90% of customer imports complete without manual intervention within
  60 days of GA
- p95 import latency for a 10k-row file ≤ 5 minutes on the standard plan
- Row-level error rate < 0.5% for well-formed inputs

---

## Cross-System Notes

Skill flags:
- Dependencies: `auth`, `multi-tenancy`, `audit-log`, `notifications`
  (success / failure email)
- Updates `design/registry/entities.yaml` with the `ImportJob` entity
- Flags a UX requirement for the import-progress screen — recommends
  running `/ux-design import-pipeline-progress` when this PRD is approved

---

## Outcome

- PRD written: `design/prd/import-pipeline.md`
- Systems index updated to status "Designed (pending review)"
- Skill recommends running `/design-review design/prd/import-pipeline.md`
  in a fresh session
