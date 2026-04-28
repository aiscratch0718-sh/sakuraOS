---
name: security-audit
description: "Audit the product for security vulnerabilities: input validation, authn/authz, multi-tenant isolation, secrets management, dependency CVEs, and data exposure. Produces a prioritised security report with remediation guidance. Run before any public release or major surface change."
argument-hint: "[full | api | tenant | secrets | quick]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Task
agent: security-engineer
---

# Security Audit

Security is not optional. B2B SaaS has high-leverage vulnerability classes —
cross-tenant data leakage, IDOR, JWT misuse, RLS bypass, dependency CVEs — that
compound quickly. This skill systematically audits the codebase for the most
common SaaS security failures and produces a prioritised remediation plan.

**Run this skill:**
- Before any public release (required for the Polish → Release gate)
- Before opening a new tenant signup flow or partner-API surface
- After implementing auth, audit-log, billing, or any cross-tenant feature
- When a security-related bug or report comes in
- Quarterly as a baseline check

**Output:** `production/security/security-audit-[date].md`

---

## Phase 1: Parse Arguments and Scope

**Modes:**
- `full` — all categories (recommended before release)
- `api` — public API surface only (route handlers, controllers, gateway)
- `tenant` — multi-tenant isolation only
- `secrets` — secrets, env, dependency, supply chain
- `quick` — high-severity checks only (fastest, for iterative use)
- No argument — run `full`

Read `.claude/docs/technical-preferences.md` to determine:
- Framework family (Next.js / React+Node / NestJS) — drives which patterns to grep for
- Database / ORM (Prisma / TypeORM / Drizzle / raw SQL) — affects RLS / scoping checks
- Auth provider (Supabase Auth / Auth.js / Clerk / NestJS-Passport) — affects token / session checks
- Whether the product exposes a public API to partners

---

## Phase 2: Spawn Security Engineer

Spawn `security-engineer` via Task. Pass:
- The audit scope / mode
- Framework and language from technical preferences
- A manifest of all source directories: `src/`, `tests/`, configuration files

The security-engineer runs the audit across 7 categories (see Phase 3). Collect
their full findings before proceeding.

---

## Phase 3: Audit Categories

The security-engineer evaluates each of the following. Skip categories not
applicable to the project scope.

### Category 1: Input Validation & Output Encoding
- Are all HTTP route handlers validating inputs at the boundary
  (Zod / `class-validator`)? Reject unknown fields rather than silently dropping
- Is dynamic SQL constructed with parameterized queries only — no string
  concatenation?
- Are user-supplied URLs fetched server-side without SSRF defense?
- Is HTML output escaped / Content-Type set correctly to prevent XSS?
- Are file uploads validated for type, size, and content (not just extension)?

Grep patterns: `db.$queryRaw`, `executeQuery`, `req.query`, `req.body`,
`searchParams`, `dangerouslySetInnerHTML`, `eval(`, `new Function(`, raw `fetch`
calls with user-supplied URLs.

### Category 2: Authentication & Session
- Are all protected routes behind an auth guard / middleware?
- Are sessions cookie-based with `httpOnly; secure; sameSite=lax`?
- Are JWTs validated with the correct algorithm (no `alg: none`, no key
  confusion)?
- Are session lifetimes appropriate (short-lived access tokens, refresh tokens
  with rotation)?
- Are public routes explicitly marked as such (`@Public()`, no-auth middleware
  bypass)?

Grep patterns: `@Public()`, `getServerSession`, `auth()`, `verifyJWT`, route
files lacking an auth check.

### Category 3: Authorization (RBAC / Policy / IDOR)
- After auth, does every resource read confirm the resource belongs to the
  caller's tenant / organization?
- Are admin-only endpoints gated by an admin role check (not just a "hidden"
  URL)?
- Are bulk operations capped to prevent enumeration / DoS?
- Are object IDs (UUIDs) used everywhere — never sequential integers — to
  raise the cost of IDOR probes?

Grep patterns: `findUnique`, `findFirst`, `findById` calls inside route
handlers — verify each scopes by tenant / owner.

### Category 4: Multi-Tenant Isolation
- Does every database query that touches tenant-owned tables filter by
  `tenant_id`?
- Is RLS (Row-Level Security) enabled at the database where supported?
- Do background jobs and queue workers carry tenant context and apply it
  correctly?
- Do search / reporting paths review tenant scoping (denormalized or
  cross-tenant aggregation is a frequent leak)?

Grep patterns: `prisma.[model]`, `repository.findOne`, repository methods —
verify tenant scoping.

### Category 5: Secrets, Config & Dependencies
- Are any API keys, credentials, or secrets hardcoded in `src/` or committed
  config?
- Are environment variables validated at startup with a typed schema?
- Are debug logs or verbose error responses leaking PII / internal paths in
  production?
- Are dependencies up to date — does the project run a CVE scanner
  (npm audit, Snyk, Dependabot, GitHub Advanced Security) in CI?
- Are package-lock / pnpm-lock / yarn.lock committed and pinned?

Grep patterns: `api_key`, `secret`, `password`, `token`, `private_key`,
`process.env.` reads outside the typed config layer.

### Category 6: Webhooks & External Integrations
- Inbound webhooks: signature verification on every handler?
- Inbound webhooks: idempotent processing (deduplicate by event ID)?
- Outbound webhooks: signed payloads + retries with backoff + delivery log?
- Third-party API tokens: scoped, rotatable, revokable?
- OAuth flows: state parameter present, redirect URI strictly validated?

Grep patterns: `webhooks/`, `verifySignature`, `crypto.createHmac`,
`stripe.webhooks.constructEvent`, OAuth callback routes.

### Category 7: Audit Log & Observability
- Are all privileged actions (admin operations, billing, role changes, data
  export) writing audit log entries in the same transaction as the change?
- Are audit logs immutable / append-only?
- Is structured logging redacting PII before write (no full request body
  logging on PII routes)?
- Are alerts configured for security-relevant events (failed-login spike,
  privilege escalation, unusual export volume)?

Grep patterns: `auditLog.create`, `logger.info` near sensitive operations,
unredacted `console.log(req.body)`.

---

## Phase 4: Classify Findings

For each finding, assign:

**Severity:**

| Level | Definition |
|-------|-----------|
| **CRITICAL** | Remote code execution, cross-tenant data leak, secret exposure, or auth bypass that allows unauthorized access |
| **HIGH** | IDOR / authorization bypass with limited scope, missing tenant scoping, dependency CVE with known exploit, JWT validation flaw |
| **MEDIUM** | Input validation gap with limited impact, audit-log gap on a privileged action, weak rate limit, missing webhook signature on a low-impact endpoint |
| **LOW** | Defence-in-depth improvement — hardening that reduces attack surface but no direct exploit exists |

**Status:** Open / Accepted Risk / Out of Scope

---

## Phase 5: Generate Report

```markdown
# Security Audit Report

**Date**: [date]
**Scope**: [full | api | tenant | secrets | quick]
**Framework**: [framework + version]
**Audited by**: security-engineer via /security-audit
**Files scanned**: [N source files, N config files]

---

## Executive Summary

| Severity | Count | Must Fix Before Release |
|----------|-------|------------------------|
| CRITICAL | [N] | Yes — all |
| HIGH | [N] | Yes — all |
| MEDIUM | [N] | Recommended |
| LOW | [N] | Optional |

**Release recommendation**: [CLEAR TO SHIP / FIX CRITICALS FIRST / DO NOT SHIP]

---

## CRITICAL Findings

### SEC-001: [Title]
**Category**: [Input / Auth / Authz / Tenant / Secrets / Webhook / Audit / Dependency]
**File**: `[path]` line [N]
**Description**: [What the vulnerability is]
**Attack scenario**: [How a malicious actor would exploit it]
**Remediation**: [Specific code change or pattern to apply]
**Effort**: [Low / Medium / High]

[repeat per finding]

---

## HIGH Findings

[same format]

---

## MEDIUM Findings

[same format]

---

## LOW Findings

[same format]

---

## Accepted Risk

[Any findings explicitly accepted by the team with rationale and review date]

---

## Dependency Inventory

| Package | Version | Source | Known CVEs |
|---------|---------|--------|------------|
| [name] | [version] | [registry] | [none / CVE-XXXX-NNNN] |

---

## Remediation Priority Order

1. [SEC-NNN] — [1-line description] — Est. effort: [Low/Medium/High]
2. ...

---

## Re-Audit Trigger

Run `/security-audit` again after remediating any CRITICAL or HIGH findings.
The Polish → Release gate requires this report with no open CRITICAL or HIGH
items. Quarterly re-runs are required regardless of code change to catch
new dependency CVEs.
```

---

## Phase 6: Write Report

Present the report summary (executive summary + CRITICAL / HIGH findings only)
in conversation.

Ask: "May I write the full security audit report to
`production/security/security-audit-[date].md`?"

Write only after approval.

---

## Phase 7: Gate Integration

This report is a required artifact for the **Polish → Release gate**.

After remediating findings, re-run: `/security-audit quick` to confirm
CRITICAL / HIGH items are resolved before running `/gate-check release`.

If CRITICAL findings exist:
> "⛔ CRITICAL security findings must be resolved before any public release.
> Do not proceed to `/launch-checklist` until these are addressed."

If no CRITICAL / HIGH findings:
> "✅ No blocking security findings. Report written to
> `production/security/`. Include this path when running `/gate-check release`."

---

## Collaborative Protocol

- **Never assume a pattern is safe** — flag it and let the user decide
- **Accepted risk is a valid outcome** — some LOW findings are acceptable
  trade-offs for a small team; document the decision and the review date
- **Public-API products have a higher bar** — any HIGH finding on a partner-
  facing API endpoint should be treated as CRITICAL
- **This is not a penetration test** — this audit covers common patterns; a
  real pentest by a human security professional is recommended before any
  enterprise-tier launch or compliance certification (SOC 2 Type II, HIPAA)
