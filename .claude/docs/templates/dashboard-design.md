# Dashboard Design: [Product Name]

> **Status**: Draft | In Review | Approved | Implemented
> **Author**: [screen-designer / ux-designer]
> **Last Updated**: [Date]
> **Product**: [Product name — this is the master dashboard spec for the product, not per-widget]
> **Target Roles**: [User roles that see this dashboard — e.g., Admin, Analyst, End-user]
> **Related PRDs**: [Every PRD whose data surfaces on this dashboard — e.g., `design/prd/billing.md`, `design/prd/audit-log.md`, `design/prd/usage-metrics.md`]
> **Accessibility Tier**: Basic | Standard | Comprehensive | Exemplary
> **Style Reference**: [Link to design-system-bible — e.g., `design/prd/design-system-bible.md § Dashboard Visual Language`]

> **Note — Scope boundary**: This document specifies the dashboard surface — KPI
> cards, charts, tables, filters, and notification toasts that summarize state at a
> glance. For dedicated detail screens (settings, record edit, list views with
> primary CRUD actions), use `ux-spec.md` instead. The test: if the user comes here
> to "see what's going on" rather than to "do a specific task," it belongs here.

---

## 1. Dashboard Philosophy

> **Why this section exists**: The dashboard's design philosophy is a decision
> framework, not decoration. Without an explicit philosophy, every stakeholder lobbies
> for "their" widget on the dashboard, and it slowly accretes into a wall of charts
> nobody reads. With a philosophy, there is a shared standard the team can use to push
> back on additions. Write this before specifying widgets.

### 1.1 Core Promise

[One sentence: what does this dashboard let the user know in 5 seconds? Examples:
"Whether the system is healthy and where to look if it isn't." / "Whether this
month's revenue is on track and what's pulling it off track." / "Whether my team
is unblocked." If you cannot finish the sentence, the dashboard does not yet have
a purpose — resolve that ambiguity first.]

### 1.2 Information Density Stance

[Pick one and justify: **Sparse** (3–5 widgets, executive-readable) /
**Standard** (6–10 widgets, mixed audience) / **Dense** (10+ widgets, analyst
audience). Density determines spacing, font sizing, and how much chrome is
acceptable.]

### 1.3 Refresh Model

[Live-streaming / Auto-refresh every N seconds / Manual refresh / Snapshot
(point-in-time). State explicitly — this constrains backend architecture and the
"last updated" affordance shown to the user.]

### 1.4 Drill-down Discipline

[Every widget either opens a detail screen on click or it does not. Mixed behavior
confuses users. Pick the rule and document exceptions.]

---

## 2. Layout & Zones

[Describe the spatial layout in zones. Most B2B dashboards split into:
- **Top bar** — global filters (date range, tenant, environment)
- **KPI strip** — 3–5 number cards near the top
- **Primary chart zone** — 1–2 large time-series or distribution charts
- **Secondary widget grid** — smaller cards, tables, lists
- **Activity / alerts feed** — running log of relevant events (right rail or bottom)

Provide a wireframe diagram. Specify which zones reflow on narrow viewports.]

---

## 3. Widget Inventory

For each widget, fill in:

| Widget | Zone | Data Source (PRD) | Refresh | Empty State | Loading State | Error State | Drill-down Target |
|--------|------|-------------------|---------|-------------|---------------|-------------|-------------------|
| [Name] | [Zone] | [PRD slug] | [model] | [copy] | [skeleton / spinner] | [copy + retry] | [route] |

> Every widget must have empty / loading / error states specified. Missing any
> of these is a defect, not a polish item.

---

## 4. Filter & Time-range Model

[Which filters apply globally (top bar) vs per-widget? Default time range? How
are filters persisted (URL query params, user preferences, both)? What happens
when the URL is shared with a teammate — do they see the same view?]

---

## 5. Permissions & Multi-tenancy

[Which roles see which widgets? Are any widgets gated by feature flags or
entitlement tiers? In multi-tenant SaaS, confirm that no widget can leak data
across tenants — explicitly note RLS / scoping enforcement.]

---

## 6. Performance Budget

| Metric | Budget | Notes |
|--------|--------|-------|
| Time to first widget rendered | [ms] | |
| Time to all widgets settled | [ms] | |
| Number of network round-trips on initial load | [count] | Prefer batch over N×fetch |
| Page weight (gzipped) | [KB] | |

If the dashboard cannot meet these on the slowest supported environment,
specify which widgets degrade (skeleton vs hidden) rather than blocking render.

---

## 7. Accessibility Requirements

- Color is never the only indicator of state (every chart's color encoding has a
  shape, label, or icon backup)
- All charts have an equivalent table view reachable by keyboard
- Live-updating widgets respect `prefers-reduced-motion`
- Focus order moves through zones top-to-bottom, left-to-right
- Color contrast meets the committed accessibility tier

[Reference `accessibility-requirements.md` for the committed tier.]

---

## 8. Open Questions

[Track unresolved decisions here so they don't disappear into the conversation
log. Each question must have an owner and a resolution deadline.]
