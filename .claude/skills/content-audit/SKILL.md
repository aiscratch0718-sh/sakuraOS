---
name: content-audit
description: "Audit PRD-specified content counts against implemented content. Identifies what's planned vs built."
argument-hint: "[system-name | --summary | (no arg = full audit)]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
agent: engineering manager
---

When this skill is invoked:

Parse the argument:
- No argument → full audit across all systems
- `[system-name]` → audit that single system only
- `--summary` → summary table only, no file write

---

## Phase 1 — Context Gathering

1. **Read `design/prd/systems-index.md`** for the full list of systems, their
 categories, and MVP/priority tier.

2. **L0 pre-scan**: Before full-reading any PRDs, Grep all PRD files for
   `## Summary` sections plus common content-count keywords:
   ```
   Grep pattern="(## Summary|N entity types|N templates|N report types|N integrations|N webhook events|N email types|N tier|N role|N permission)" glob="design/prd/*.md" output_mode="files_with_matches"
   ```
   For a single-system audit: skip this step and go straight to full-read.
   For a full audit: full-read only the PRDs that matched content-count
   keywords. PRDs with no content-count language (pure logic PRDs) are
   noted as "No auditable content counts" without a full read.

3. **Full-read in-scope PRD files** (or the single system PRD if a system
   name was given).

4. **For each PRD, extract explicit content counts or lists.** Look for
   patterns like:
   - "N entity types" / "N record templates" / list of named entities
   - "N report types" / "N dashboards" / "N widgets"
   - "N integrations" / "N webhook event types" / "N OAuth providers"
   - "N email templates" / "N in-app notification types"
   - "N pricing tiers" / "N entitlement scopes"
   - "N RBAC roles" / "N permission scopes"
   - "N seed records" / "N starter data items"
   - Any explicit enumerated list (bullet list of named content pieces)

4. **Build a content inventory table** from the extracted data:

 | System | Content Type | Specified Count/List | Source PRD |
 |--------|-------------|---------------------|------------|

 Note: If a PRD describes content qualitatively but gives no count, record
 "Unspecified" and flag it — unspecified counts are a design gap worth noting.

---

## Phase 2 — Implementation Scan

For each content type found in Phase 1, scan the relevant directories to count
what has been implemented. Use Glob and Grep to locate files.

**Pages / Screens:**
- Glob `src/app/**/page.tsx` (Next.js App Router)
- Glob `src/pages/**/*.tsx` (Next.js Pages Router)
- Glob `src/routes/**/*.tsx` or `src/screens/**/*.tsx` (React + Vite)
- Count distinct user-facing routes (exclude API route handlers)

**Email / Notification Templates:**
- Glob `src/server/email/**/*.tsx`, `src/server/email/**/*.html`
- Glob `src/server/notifications/**/*.ts`
- Count templates (one per notification type)

**Pricing Tiers / Entitlements:**
- Glob `config/**/pricing-tiers.json`, `src/config/**/pricing*.ts`
- Glob `design/commercial/entitlements.md`
- Count tier names and entitlement scopes

**RBAC Roles / Permissions:**
- Glob `src/server/auth/**/roles*.ts`, `src/server/permissions/**/*.ts`
- Glob `prisma/seed/roles.ts` (or equivalent ORM seed)
- Count role names and permission scopes

**Integrations / Webhooks:**
- Glob `src/server/integrations/**/*.ts`
- Glob `src/server/webhooks/**/*.ts`
- Count integration adapters and inbound / outbound webhook handlers

**Reports / Exports:**
- Glob `src/features/reporting/**/*.ts`, `src/server/reporting/**/*.ts`
- Count distinct report definitions and export formats

**Seed Data:**
- Glob `prisma/seed/**/*.ts`, `src/server/seed/**/*.ts`,
  `db/seed/**/*.sql`
- Count seed record types

**Notes (acknowledge in the report):**
- Counts are approximations — the skill cannot perfectly distinguish
  example / fixture content from production-shipped content
- Some routes are admin-only or feature-flagged off; the scan counts
  all matches and notes this caveat

---

## Phase 3 — Gap Report

Produce the gap table:

```
| System | Content Type | Specified | Found | Gap | Status |
|--------|-------------|-----------|-------|-----|--------|
```

**Status categories:**
- `COMPLETE` — Found ≥ Specified (100%+)
- `IN PROGRESS` — Found is 50–99% of Specified
- `EARLY` — Found is 1–49% of Specified
- `NOT STARTED` — Found is 0

**Priority flags:**
Flag a system as `HIGH PRIORITY` in the report if:
- Status is `NOT STARTED` or `EARLY`, AND
- The system is tagged MVP or Vertical Slice in the systems index, OR
- The systems index shows the system is blocking downstream systems

**Summary line:**
- Total content items specified (sum of all Specified column values)
- Total content items found (sum of all Found column values)
- Overall gap percentage: `(Specified - Found) / Specified * 100`

---

## Phase 4 — Output

### Full audit and single-system modes

Present the gap table and summary to the user. Ask: "May I write the full report to `docs/content-audit-[YYYY-MM-DD].md`?"

If yes, write the file:

```markdown
# Content Audit — [Date]

## Summary
- **Total specified**: [N] content items across [M] systems
- **Total found**: [N]
- **Gap**: [N] items ([X%] unimplemented)
- **Scope**: [Full audit | System: name]

> Note: Counts are approximations based on file scanning.
> The audit cannot distinguish shipped content from editor/test assets.
> Manual verification is recommended for any HIGH PRIORITY gaps.

## Gap Table

| System | Content Type | Specified | Found | Gap | Status |
|--------|-------------|-----------|-------|-----|--------|

## HIGH PRIORITY Gaps

[List systems flagged HIGH PRIORITY with rationale]

## Per-System Breakdown

### [System Name]
- **PRD**: `design/prd/[file].md`
- **Content types audited**: [list]
- **Notes**: [any caveats about scan accuracy for this system]

## Recommendation

Focus implementation effort on:
1. [Highest-gap HIGH PRIORITY system]
2. [Second system]
3. [Third system]

## Unspecified Content Counts

The following PRDs describe content without giving explicit counts.
Consider adding counts to improve auditability:
[List of PRDs and content types with "Unspecified"]
```

After writing the report, ask:

> "Would you like to create backlog stories for any of the content gaps?"

If yes: for each system the user selects, suggest a story title and point them
to `/create-stories [epic-slug]` or `/quick-design` depending on the size of the gap.

### --summary mode

Print the Gap Table and Summary directly to conversation. Do not write a file.
End with: "Run `/content-audit` without `--summary` to write the full report."

---

## Phase 5 — Next Steps

After the audit, recommend the highest-value follow-up actions:

- If any system is `NOT STARTED` and MVP-tagged → "Run `/design-system [name]` to
 add missing content counts to the PRD before implementation begins."
- If total gap is >50% → "Run `/sprint-plan` to allocate content work across upcoming sprints."
- If backlog stories are needed → "Run `/create-stories [epic-slug]` for each HIGH PRIORITY gap."
- If `--summary` was used → "Run `/content-audit` (no flag) to write the full report to `docs/`."

Verdict: **COMPLETE** — content audit finished.
