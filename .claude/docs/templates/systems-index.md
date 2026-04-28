# Systems Index: [Product Title]

> **Status**: [Draft / Under Review / Approved]
> **Created**: [Date]
> **Last Updated**: [Date]
> **Source Concept**: design/prd/product-concept.md

---

## Overview

[One paragraph explaining the product's mechanical scope. What kind of systems does
this product need? Reference the core user flow and product pillars. This should help any
team member understand the "big picture" of what needs to be designed and built.]

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | [e.g., Authentication] | Foundation | MVP | [Not Started / In Design / In Review / Approved / Implemented] | [design/prd/auth.md or "—"] | [e.g., Multi-tenancy] |
| 2 | [e.g., Multi-tenancy] | Foundation | MVP | Not Started | — | Authentication |

[Add a row for every identified system. Use the categories and priority tiers
defined below. Mark systems that were inferred (not explicitly in the concept doc)
with "(inferred)" in the system name.]

---

## Categories

| Category | Description | Typical Systems |
|----------|-------------|-----------------|
| **Foundation** | Cross-cutting systems everything depends on | Auth, RBAC, multi-tenancy, audit log, observability, configuration |
| **Domain Core** | Primary domain entities and their lifecycle | Account / Organization, User, the product's core resources (e.g. Project, Document, Order, Invoice) |
| **Workflow** | User-facing flows that combine domain objects | Onboarding, signup → activation, primary CRUD flows, approvals, exports |
| **Commercial** | Pricing, entitlement, and limits | Plan tiers, entitlement matrix, usage metering, hard/soft limits, dunning (if applicable) |
| **Persistence** | Data store strategy and continuity | Database schema, migrations, soft-delete, archival, backups, retention |
| **UI** | Information displays and admin surfaces | Dashboards, list/detail screens, settings, notifications, command palette |
| **Integrations** | External systems and webhooks | OAuth providers, third-party APIs, webhook ingress/egress, file storage |
| **Notifications** | Async user-facing communication | Email, in-app notifications, browser push, webhook subscriptions |
| **Reporting** | Read-side analytics and exports | Reporting database, scheduled reports, CSV / API exports, embedded charts |
| **Meta** | Systems outside the primary user journey | Telemetry, feature flags, in-app help, customer support tooling |

[Not every product needs every category. Remove categories that don't apply.
Add custom categories if needed.]

---

## Priority Tiers

| Tier | Definition | Target Milestone | Design Urgency |
|------|------------|------------------|----------------|
| **MVP** | Required for the core workflow to function end-to-end. Without these, the product cannot serve its primary job-to-be-done. | First releasable build | Design FIRST |
| **Beta** | Required for one complete, polished customer journey. Demonstrates the full intended experience. | Closed / Open Beta | Design SECOND |
| **GA** | All features present in rough form. Complete functional scope, polish in progress. | General Availability | Design THIRD |
| **Full Vision** | Polish, edge cases, nice-to-haves, and breadth-completing features. | Post-GA roadmap | Design as needed |

---

## Dependency Map

[Systems sorted by dependency order — design and build from top to bottom.
Systems at the top are foundations; systems at the bottom are wrappers.]

### Foundation Layer (no dependencies)

1. [System] — [one-line rationale for why this is foundational]

### Core Layer (depends on foundation)

1. [System] — depends on: [list]

### Feature Layer (depends on core)

1. [System] — depends on: [list]

### Presentation Layer (depends on features)

1. [System] — depends on: [list]

### Polish Layer (depends on everything)

1. [System] — depends on: [list]

---

## Recommended Design Order

[Combining dependency sort and priority tiers. Design these systems in this
order. Each system's PRD should be completed and reviewed before starting the
next, though independent systems at the same layer can be designed in parallel.]

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | [First system to design] | MVP | Foundation | product-manager | [S/M/L] |
| 2 | [Second system] | MVP | Foundation | product-manager | [S/M/L] |

[Effort estimates: S = 1 session, M = 2-3 sessions, L = 4+ sessions.
A "session" is one focused design conversation producing a complete PRD.]

---

## Circular Dependencies

[List any circular dependency chains found during analysis. These require
special architectural attention — either break the cycle with an interface,
or design the systems simultaneously.]

- [None found] OR
- [System A <-> System B: Description of the circular relationship and
 proposed resolution]

---

## High-Risk Systems

[Systems that are technically unproven, design-uncertain, or scope-dangerous.
These should be prototyped early regardless of priority tier.]

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| [System] | [Technical / Design / Scope] | [What could go wrong] | [Prototype, research, or scope fallback] |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | [N] |
| Design docs started | [N] |
| Design docs reviewed | [N] |
| Design docs approved | [N] |
| MVP systems designed | [N/total MVP] |
| Vertical Slice systems designed | [N/total VS] |

---

## Next Steps

- [ ] Review and approve this systems enumeration
- [ ] Design MVP-tier systems first (use `/design-system [system-name]`)
- [ ] Run `/design-review` on each completed PRD
- [ ] Run `/gate-check pre-production` when MVP systems are designed
- [ ] Prototype the highest-risk system early (`/prototype [system]`)
