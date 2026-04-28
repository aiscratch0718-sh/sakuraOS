---
name: setup-stack
description: "Configure the project's framework family and version. Pins the framework in CLAUDE.md, detects knowledge gaps versus the LLM cutoff, and populates `docs/framework-reference/` via WebSearch when the version is beyond the LLM's training data."
argument-hint: "[framework] | [framework version] | refresh | upgrade [old-version] [new-version] | no args for guided selection"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Task, AskUserQuestion
---

When this skill is invoked:

## 1. Parse Arguments

Five modes:

- **Full spec**: `/setup-stack nextjs 15.1` — framework and version provided
- **Framework only**: `/setup-stack react` — framework provided, version looked up
- **No args**: `/setup-stack` — guided framework family + version selection
- **Refresh**: `/setup-stack refresh` — update reference docs to the latest version
- **Upgrade**: `/setup-stack upgrade [old] [new]` — guided upgrade across major versions

Supported framework families:

- **`nextjs`** — Next.js (App Router) + Supabase / Postgres + Tailwind. Default recommendation for new B2B SaaS.
- **`react`** — React (Vite) + Node.js (Express / Fastify / Hono) + Postgres / Supabase. SPA-first; backend split.
- **`nestjs`** — NestJS (Enterprise) + TypeORM / Prisma + admin SPA frontend. Multi-team, modular monolith or microservices.

---

## 2. Guided Mode (No Arguments)

If no framework is specified, run an interactive selection process.

### Check for existing product concept

- Read `design/prd/product-concept.md` if it exists. Extract: deployment model
  (multi-tenant SaaS / single-tenant / on-prem), team size, regulated-industry
  flags (SOC 2 / HIPAA / region residency), realtime requirements, and any
  framework recommendation already documented.
- If no concept exists, inform the user:
  > "No product concept yet. I'll ask the questions directly. Run `/brainstorm`
  > later to capture the full concept."

### Ask questions in order, via `AskUserQuestion`

**Question 1 — Team experience** (one most-experienced family becomes a default tiebreaker)

> "Which framework families has the team shipped production B2B apps in?"
> Options: "Next.js", "React + Node", "NestJS / NestJS-style backend", "Mix / unsure"

**Question 2 — Primary architecture style**

> "How do you want to organize the codebase?"
> Options:
> - "Full-stack in one app — server + UI in one repo, deployed together (Next.js fits this)"
> - "Frontend SPA + separate API service (React + Node fits this)"
> - "Multiple bounded contexts, each a Nest module, possibly later split into services (NestJS fits this)"

**Question 3 — Deployment target**

> "Where will this be deployed?"
> Options: "Vercel / Cloudflare / similar managed PaaS", "Self-hosted on your cloud (AWS/GCP/Azure)", "On-prem or air-gapped"

**Question 4 — Compliance & data residency**

> "Any compliance / residency constraints up front?"
> Options: "None known yet", "SOC 2 / GDPR (typical B2B)", "HIPAA / regulated", "Region-specific data residency required"

### Produce a recommendation

Reason through the user's profile against these honest tradeoffs:

#### Next.js family
- **Genuine strengths**: zero-config full-stack experience; Server Components + Server Actions reduce API boilerplate; mature Vercel deployment story; great for content-rich and dashboard apps; large hiring pool
- **Real limitations**: opinionated about caching and routing — fighting the framework is painful; vendor lock-in pressure on Vercel for the best DX; long-running jobs require an external queue; some compliance setups force self-hosting and lose half the platform's value

#### React + Node family
- **Genuine strengths**: maximum flexibility; clean separation between UI and API; backend can run anywhere; easy to introduce a second client (mobile, partner integration) sharing the API
- **Real limitations**: more wiring (auth, data fetching, deployment) than Next.js; team owns the build / deploy / monitoring story end-to-end; SSR / SEO is opt-in, not the default

#### NestJS family
- **Genuine strengths**: enforced module boundaries scale to multiple teams; first-class DI / decorators / OpenAPI generation; excellent for API-first products that may sprout multiple frontends; TypeORM / Prisma are mature
- **Real limitations**: heavier for a single small team; admin / customer UI requires a separate frontend project; the decorator-heavy style is divisive on smaller teams

Present **1–2 recommendations** with full context. Always end with the user
choosing — never force a verdict.

Default recommendations by profile:

- Small team, fast time-to-first-customer, dashboard-heavy → **Next.js + Supabase**
- Need a clean SPA + a public API for partners or mobile → **React + Node**
- Multiple bounded contexts, multiple teams, modular monolith → **NestJS-Enterprise**

State explicitly: "This is a starting point, not a verdict — you can migrate
families, and the agents in this template are framework-aware so the workflow
stays the same."

---

## 3. Look Up Current Version

After the family is chosen:

- Read `docs/framework-reference/<family>/VERSION.md` for the project's current
  pinned version (if any)
- If the user supplied a version, use it
- Otherwise, prompt: "Which version should we pin? (latest stable / specific
  version / let me check the latest)"
- If "let me check the latest", use `WebSearch` for the framework's release page
  (`nextjs.org/blog`, `github.com/facebook/react/releases`, `nestjs.com`) to find
  the latest stable release

---

## 4. Update CLAUDE.md Technology Stack

Read `CLAUDE.md`. Replace the Technology Stack section with the family-specific
template from the Appendix.

### Language Selection

All three families default to **TypeScript** with strict mode. JavaScript-only
projects are supported only with an explicit decision documented in an ADR.

For Next.js: Server Actions for mutations + Server Components for reads.
For React + Node: pick the backend framework (Express / Fastify / Hono) and
record it in `technical-preferences.md`.
For NestJS: pick the ORM (Prisma / TypeORM / Drizzle) and record it.

---

## 5. Populate Technical Preferences

Read `.claude/docs/technical-preferences.md`. Fill in:

### Framework & Language

```
- Framework Family: [Next.js | React + Node | NestJS-Enterprise]
- Framework Version: [pinned version]
- Language: TypeScript (strict mode)
- Database: [Supabase Postgres | Postgres + Prisma | Postgres + TypeORM | Other]
- Auth: [Supabase Auth | Auth.js | Clerk | NestJS-Passport | Custom]
- Styling: [Tailwind CSS | CSS Modules | Other]
```

### Naming Conventions (defaults)

```
- Files: kebab-case for files, PascalCase for components
- Variables: camelCase
- Components: PascalCase
- Constants: SCREAMING_SNAKE_CASE
- Database tables: snake_case
- Domain events: feature.action (e.g., invoice.canceled)
```

### Target Surfaces & Input

```
- Target Surfaces: Web (desktop), Web (mobile), [PWA?] [Native?]
- Input Methods: Keyboard + Mouse, Touch
- Primary Input: Keyboard + Mouse
- Touch Support: [Full | Partial | None — based on whether mobile is targeted]
- Browser Support: last 2 versions of evergreen browsers
```

### Framework Specialists Routing

Choose the specialist set based on the family:

#### Next.js routing table

```
## Framework Specialists

- Primary: nextjs-specialist
- Language / Code Specialist: typescript-specialist
- Routing Specialist: app-router-specialist
- UI Specialist: component-library-specialist
- Mutation Specialist: server-actions-specialist
- Styling Specialist: tailwind-specialist
- Animation Specialist: css-animation-specialist
- Realtime Specialist: realtime-specialist (or websocket-specialist if pairing with Nest)

### File Type Routing

| File Type | Specialist to Spawn |
|-----------|---------------------|
| Server Action / mutation file | server-actions-specialist |
| Route file (page.tsx, route.ts, layout.tsx) | app-router-specialist |
| Component file (*.tsx in components/) | component-library-specialist |
| Tailwind config / theme tokens | tailwind-specialist |
| Animation / motion file | css-animation-specialist |
| WebSocket / SSE handler | realtime-specialist |
| General architecture review | nextjs-specialist |
```

#### React + Node routing table

```
## Framework Specialists

- Primary: react-specialist
- Language / Code Specialist: typescript-specialist
- UI Specialist: component-library-specialist
- API Specialist: api-engineer
- Realtime Specialist: realtime-specialist
- Asset Specialist: cdn-asset-specialist
- Animation Specialist: css-animation-specialist

### File Type Routing

| File Type | Specialist to Spawn |
|-----------|---------------------|
| Component file (*.tsx) | component-library-specialist |
| API endpoint / route handler | api-engineer |
| WebSocket / SSE handler | realtime-specialist |
| CDN / image / font config | cdn-asset-specialist |
| Animation / motion file | css-animation-specialist |
| General architecture review | react-specialist |
```

#### NestJS-Enterprise routing table

```
## Framework Specialists

- Primary: nestjs-specialist
- Language / Code Specialist: typescript-specialist
- API Gateway Specialist: api-gateway-specialist
- ORM Specialist: orm-specialist
- WebSocket Specialist: websocket-specialist
- Admin UI Specialist: admin-ui-specialist
- API Specialist: api-engineer

### File Type Routing

| File Type | Specialist to Spawn |
|-----------|---------------------|
| Module / controller / service file | nestjs-specialist |
| Repository / migration / entity file | orm-specialist |
| Gateway / aggregation / public API file | api-gateway-specialist |
| WebSocket gateway file | websocket-specialist |
| Admin UI screen | admin-ui-specialist |
| General architecture review | nestjs-specialist |
```

### Collaborative Step

Before writing, present the proposed CLAUDE.md and `technical-preferences.md`
diffs to the user. Use `AskUserQuestion`:

> "Apply these defaults?"
> Options: "Apply as-is", "Modify before applying (I'll specify changes)", "Cancel"

---

## 6. Determine Knowledge Gap

Compare the project's pinned version to the LLM's knowledge cutoff (currently
**January 2026** unless overridden). Classify:

- **LOW RISK** — pinned version is at or before the cutoff; LLM training covers it
- **MEDIUM RISK** — pinned version is up to one major version past the cutoff
- **HIGH RISK** — pinned version is two or more major versions past the cutoff

State the verdict to the user before populating reference docs.

---

## 7. Populate Framework Reference Docs

### If WITHIN training data (LOW RISK)

- Update `docs/framework-reference/<family>/VERSION.md` to mark the version
  pinned and "Last verified: [today]"
- Leave the rest of the directory as-is (the stub content is sufficient until
  the version surpasses the cutoff)
- Note in conversation: "Reference docs are stubs because the version is within
  training data — agents will use general framework knowledge."

### If BEYOND training data (MEDIUM or HIGH RISK)

Use `WebSearch` and `WebFetch` to populate:

1. `VERSION.md` — version, release date, pinned date, knowledge cutoff
2. `breaking-changes.md` — breaking changes per version, organized by risk
3. `deprecated-apis.md` — deprecated → replacement table
4. `current-best-practices.md` — patterns introduced after the cutoff
5. `modules/*.md` — subsystem-specific quick references

Verify against official sources only:

- Next.js: `nextjs.org/blog`, `github.com/vercel/next.js/releases`
- React: `react.dev/blog`, `github.com/facebook/react/releases`
- NestJS: `docs.nestjs.com`, `github.com/nestjs/nest/releases`

Each file ends with `> Last verified: YYYY-MM-DD` set to today.

---

## 8. Update CLAUDE.md Import

Confirm the `@docs/framework-reference/<family>/VERSION.md` import line in
CLAUDE.md points at the chosen family's VERSION.md.

```markdown
## Framework Version Reference

@docs/framework-reference/<family>/VERSION.md
```

---

## 9. Update Agent Instructions

Confirm that framework-specialist agents reference
`docs/framework-reference/<family>/` in their "Version Awareness" sections.
This is already wired in the rebrand; sanity-check after population.

---

## 10. Refresh Subcommand

`/setup-stack refresh` re-runs the population step (Section 7) for the already-
pinned version. Useful after the LLM model upgrades or when the user notices
drift between docs and reality.

Steps:

1. Read the pinned version from `VERSION.md`
2. Re-fetch the latest official sources for that version
3. Diff against the existing reference files
4. Present the diff to the user; ask for approval before overwriting

---

## 11. Upgrade Subcommand

`/setup-stack upgrade [old-version] [new-version]` migrates the project from
one framework version to another.

### Step 1 — Read Current Version State

Read `docs/framework-reference/<family>/VERSION.md` and confirm the recorded
old version matches the argument.

### Step 2 — Fetch Migration Guide

Use `WebSearch` for the framework's official migration guide between the two
versions:

- Next.js: `nextjs.org/docs/app/building-your-application/upgrading`
- React: `react.dev/learn/upgrading`
- NestJS: `docs.nestjs.com/migration-guide`

### Step 3 — Pre-Upgrade Audit

Grep the codebase for APIs / patterns that change between versions. Use the
`deprecated-apis.md` and `breaking-changes.md` for the source version.

Report findings:

```
src/app/api/users/route.ts | uses removed_api | High
src/components/dashboard.tsx | uses deprecated_pattern | Medium
```

### Step 4 — Confirm Before Updating

Present the audit + migration plan. Use `AskUserQuestion`:

> "Proceed with upgrade?"
> Options: "Apply migration patches", "Update VERSION.md only (manual fixes)", "Cancel"

### Step 5 — Update VERSION.md

Update the version, release date, pinned date, and "Last Docs Verified". Replace
the breaking-changes / deprecated-apis files with content from the migration guide.

### Step 6 — Post-Upgrade Reminder

Output:

> "Upgrade recorded. Next: run the test suite, run the smoke check via
> `/smoke-check`, and address audit findings. Open ADRs for any patterns
> that changed materially."

---

## 12. Output Summary

When the skill completes, output:

```
Framework family pinned: [family]
Framework version pinned: [version]
Knowledge gap: [LOW / MEDIUM / HIGH]
Reference docs: [updated | stubs retained]
CLAUDE.md: updated
technical-preferences.md: updated

Next steps:
- /map-systems to decompose the product into modules
- /design-system to author the first PRD
- /architecture-decision to record the framework choice in an ADR
```

---

## Guardrails

- Never add speculative dependencies to "Allowed Libraries" in
  `technical-preferences.md`. Add a library only when work that requires it is
  starting in the current session.
- Never replace `CLAUDE.md` content the user authored manually. Edit only the
  Technology Stack section the template owns.
- When a chosen version is BEYOND training data and `WebSearch` returns no
  authoritative source, surface the gap explicitly:
  > "I could not find an authoritative source for [framework] [version].
  > Reference docs will remain stubs until you provide a source."
- Never fabricate breaking-change entries. If unsure, leave the file as a stub
  and let the user populate manually.

---

## Appendix A — CLAUDE.md Technology Stack Templates

Each template is dropped into the `## Technology Stack` section of `CLAUDE.md`.

### A1. Next.js template

```markdown
## Technology Stack

- **Framework**: Next.js [version] (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: [Supabase Postgres | Postgres + Prisma | Other]
- **Auth**: [Supabase Auth | Auth.js | Clerk | Custom]
- **Styling**: Tailwind CSS
- **Deployment**: [Vercel | Self-hosted Node]
- **CI/CD**: [GitHub Actions | Other]
```

### A2. React + Node template

```markdown
## Technology Stack

- **Frontend**: React [version] (Vite [version])
- **Backend**: Node.js [version] + [Express | Fastify | Hono]
- **Language**: TypeScript (strict mode)
- **Database**: Postgres + [Prisma | Drizzle | Knex]
- **Auth**: [Auth.js | Clerk | Custom JWT]
- **Styling**: Tailwind CSS
- **Deployment**: [Cloud-managed | Self-hosted]
- **CI/CD**: [GitHub Actions | Other]
```

### A3. NestJS-Enterprise template

```markdown
## Technology Stack

- **Backend**: NestJS [version]
- **Frontend**: [React + Vite SPA | Next.js | Admin SPA via react-admin / Refine]
- **Language**: TypeScript (strict mode)
- **Database**: Postgres + [TypeORM | Prisma | Drizzle]
- **Auth**: NestJS-Passport ([JWT | Session | OAuth])
- **API Docs**: OpenAPI via @nestjs/swagger
- **Queue**: BullMQ via @nestjs/bull
- **Deployment**: [Cloud-managed | Self-hosted | Kubernetes]
- **CI/CD**: [GitHub Actions | Other]
```
