# Design Directory

When authoring or editing files in this directory, follow these standards.

## PRD Files (`design/prd/`)

Every PRD must include all **8 required sections** in this order:
1. Overview — one-paragraph summary ("this enables [user role] to [job] so that [outcome]")
2. Target User & Job — persona, JTBD, trigger, evidence
3. User Journey — happy path, alternative paths, failure paths
4. Functional Requirements — numbered, SHALL/SHOULD/MAY testable items
5. Edge Cases & Failure Modes — empty / loading / error / partial / permission-denied / network-failure / concurrent-edit
6. Out of Scope — what this PRD explicitly does NOT cover, with rationale
7. Acceptance Criteria — Given/When/Then for every requirement and edge case
8. Success Metrics — which metric moves, by how much, by when, with instrumentation requirements

**File naming:** `[feature-slug].md` (e.g. `auth.md`, `billing.md`, `admin-dashboard.md`, `api-rate-limiting.md`)

**Feature index:** `design/prd/feature-index.md` — update when adding a new PRD.

**Design order:** Foundation → Core → Feature → Presentation → Polish
- Foundation: auth, RBAC, multi-tenancy, audit log, observability
- Core: domain entities and their CRUD/lifecycle
- Feature: user-facing workflows
- Presentation: dashboards, reports, exports
- Polish: empty states, onboarding, microcopy

**Validation:** Run `/design-review [path]` after authoring any PRD.
Run `/review-all-prds` after completing a set of related PRDs.

## Quick Specs (`design/quick-specs/`)

Lightweight specs for tuning changes, minor copy/UI changes, or single-screen feature additions that don't warrant a full PRD. Use `/quick-design` to author.

## UX Specs (`design/ux/`)

- Per-screen specs: `design/ux/[screen-name].md`
- Dashboard design: `design/ux/dashboard.md`
- Interaction pattern library: `design/ux/interaction-patterns.md`
- Accessibility requirements: `design/ux/accessibility-requirements.md`

Use `/ux-design` to author. Validate with `/ux-review` before passing to `/team-ui`.

## Brand & Content (`design/brand/`, `design/content/`)

- Voice & tone: `design/brand/voice-and-tone.md` (owned by `brand-director`)
- Positioning: `design/brand/positioning.md` (owned by `brand-director`)
- Content architecture: `design/content/architecture.md` (owned by `content-director`)
- Diátaxis split: `design/content/diataxis.md`

## Design System (`design/design-system/`)

- Tokens: `design/design-system/tokens.json` (owned by `design-director`)
- Motion tokens: `design/design-system/motion-tokens.json` (owned by `interaction-designer`)
- Component catalog: `design/design-system/components/<name>.md`

## Commercial (`design/commercial/`)

- Entitlement matrix: `design/commercial/entitlements.md` (owned by `business-analyst`)
- Pricing-tier rationale: `design/commercial/pricing.md`
- Usage-limit model: `design/commercial/usage-limits.md`

> **Reminder**: This template assumes B2B contract-based revenue (monthly
> invoicing, bank transfer). There is no Stripe scaffolding. If subscription
> auto-billing is later required, document it as a deliberate addition.

## Domain Registry (`design/registry/`)

- Entities, events, calculations, constants: `design/registry/entities.yaml`
- State machines: `design/registry/state-machines/<entity>.md`
- Glossary: `design/registry/glossary.md`

Owned by `systems-analyst`. Read before authoring any PRD that references a domain term.
