# Session Example: UX Pipeline for the Primary Dashboard

> Illustrative walk-through of `/team-ui` for designing and implementing the
> primary customer dashboard end-to-end. Names and numbers are illustrative.

---

## Setup

The feature: **Primary dashboard** — the screen the typical customer
sees first when signed in. KPI strip + a primary chart + a secondary
widget grid + an activity feed.

Skill invocation: `/team-ui dashboard`

---

## Conversation (compressed)

### Phase 1: UX Spec
The skill spawns `ux-designer` and `/ux-design dashboard` to author
`design/ux/dashboard.md`. The dashboard-design template guides:

- **Dashboard Philosophy**: "standard operational" density (6–10 widgets)
- **Information Architecture**: 6 widgets in Must Show; 4 widgets in
  Contextual; 3 items moved to Off-dashboard (deeper drill-down)
- **Layout zones**: top filters, KPI strip, primary chart, secondary
  widget grid, activity feed in right rail
- **Refresh model**: auto-refresh every 60 seconds; "last updated"
  affordance in the top bar
- **Drill-down rule**: every widget opens a detail screen on click;
  none are inert

Output: `design/ux/dashboard.md`. Validation via `/ux-review` returns
APPROVED.

### Phase 2: Visual Design
Spawns `design-director`, who applies the design system bible:
- Token-based color usage (semantic: `bg-surface`, `text-foreground`)
- Typography scale: `display-md` for KPI numbers, `body` for labels
- Spacing scale: `8 / 12 / 16 / 24` for widget padding
- Asset spec: empty-state illustrations for two widgets

Output: `design/ux/dashboard-visual.md` and an asset list for
`/asset-spec`.

### Phase 3: Implementation
Spawns the **framework UI specialist** (`component-library-specialist`
in this project) to plan the component split:

- `app/(authenticated)/dashboard/page.tsx` — Server Component, fetches
  per-widget data in parallel with `Promise.all`
- `components/dashboard/KpiCard.tsx` — Server Component (no
  interactivity)
- `components/dashboard/TimeSeriesChart.tsx` — Client Component
  (interactive tooltips)
- `components/dashboard/ActivityFeed.tsx` — Client Component (live
  updates via polling for now; SSE upgrade flagged as future ADR)

Spawns **frontend-engineer** to implement; ships in a single PR.

### Phase 4: Review (parallel)
- **ux-designer**: keyboard-only navigation through every widget passes;
  focus order matches visual order
- **design-director**: token usage clean; no hardcoded hex
- **accessibility-specialist**: contrast 4.5:1+ on all text; ARIA live
  region on activity feed; reduced-motion fallback for the chart

All three return PASS.

### Phase 5: Polish
Spawns `/team-polish` for: bundle size audit, query budget audit, motion
review. Three small fixes shipped (lazy-load the chart library, dedupe a
duplicate fetch, replace a 600ms transition with a 240ms fade).

---

## Outcome

- `design/ux/dashboard.md` (approved UX spec)
- `design/ux/dashboard-visual.md` (visual direction)
- Implementation merged behind a feature flag
- Performance budget met on representative production-like data
- Story closed via `/story-done`
