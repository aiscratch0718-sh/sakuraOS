# Interaction Pattern Library: [Product Name]

> **Status**: Draft | In Review | Approved | Living Document
> **Owner**: design-director (visual) / interaction-designer (behavior)
> **Last Updated**: [Date]
> **Style Reference**: `design/prd/design-system-bible.md`

> **Note — purpose**: This document is the **single source of truth** for reusable
> interaction patterns across the product. Before designing a new screen or
> widget, search this library first. New patterns are added here only when no
> existing pattern fits — addition requires design-director approval.
>
> The library is consumed by:
> - `/ux-design` (Phase 1 Context Gathering — checks for reusable patterns)
> - `/team-ui` (Phase 1a — read before authoring any UX spec)
> - `frontend-engineer` (during implementation — must use library components)

---

## 1. Pattern Inventory

| Pattern | Category | Description | Used In | Status |
|---------|----------|-------------|---------|--------|
| Primary Button | Action | Solid-fill action button for the most prominent action on a screen | All forms, dialogs | Draft |
| Secondary Button | Action | Outlined or ghost button for non-primary actions | All forms, dialogs | Draft |
| Destructive Button | Action | Red-tinted button for irreversible actions; requires confirmation | Delete confirmations | Draft |
| Icon Button | Action | Icon-only button for compact toolbars | Toolbars, table row actions | Draft |
| Toggle / Switch | Action | Binary on/off control with clear state | Settings, feature flags | Draft |
| Form Field — Text Input | Input | Labeled text input with helper text and error state | All forms | Draft |
| Form Field — Select | Input | Dropdown selection from finite options | All forms | Draft |
| Form Field — Combobox | Input | Searchable single-select with autocomplete | Forms with large option lists | Draft |
| Form Field — Multi-select | Input | Tag-based multiple selection | Filtering, tagging | Draft |
| Form Field — Date / Date-range | Input | Calendar-based date picker | Reports, filters | Draft |
| Form Field — File Upload | Input | Drag-and-drop or click-to-browse with progress | Imports, attachments | Draft |
| Form — Inline Validation | Input | Per-field validation state with messaging | All forms | Draft |
| Modal Dialog | Disclosure | Centered overlay for focused tasks or confirmations | Confirmations, edit-in-place | Draft |
| Drawer / Side Panel | Disclosure | Edge-anchored slide-out panel for related actions | Filters, detail panels | Draft |
| Popover | Disclosure | Anchored floating panel for contextual content | Help text, mini-actions | Draft |
| Tooltip | Disclosure | Hover/focus-triggered short hint | Icon buttons, truncated text | Draft |
| Disclosure / Accordion | Disclosure | Click-to-expand inline content | FAQs, settings groups | Draft |
| Tabs | Navigation | Switch between peer views in the same context | Detail screens with multiple aspects | Draft |
| Stepper / Wizard | Navigation | Multi-step flow with progress indicator | Onboarding, multi-step forms | Draft |
| Breadcrumbs | Navigation | Hierarchical position indicator | Deep-link contexts | Draft |
| Pagination | Navigation | Page-based navigation through long lists | Tables, search results | Draft |
| Data Table | Display | Sortable, filterable, row-action-equipped table | List views | Draft |
| Empty State | Display | Friendly explanation when no data exists yet, with primary action | Lists, dashboards, search | Draft |
| Loading — Skeleton | Display | Layout-preserving placeholder during data fetch | All async data surfaces | Draft |
| Loading — Spinner | Display | In-button or inline indeterminate progress | Submit buttons, small surfaces | Draft |
| Error State | Display | Recoverable error with retry affordance | Failed fetches, failed mutations | Draft |
| Toast / Snackbar | Feedback | Transient confirmation or non-blocking error | After mutations | Draft |
| Alert / Banner | Feedback | Persistent contextual message at top of surface | Quota warnings, system status | Draft |
| Confirmation Modal | Feedback | Block-and-confirm pattern for destructive or irreversible actions | Delete, archive, bulk operations | Draft |
| Badge / Pill | Display | Compact status or count indicator | Status columns, counts | Draft |
| Tag / Chip | Display | Categorization label, optionally removable | Filters, taxonomies | Draft |
| KPI Card | Display | Headline number with delta and sparkline | Dashboards | Draft |
| Chart — Time Series | Display | Line/area chart for metrics over time | Dashboards, reports | Draft |
| Chart — Distribution | Display | Bar / histogram / box plot | Analytics screens | Draft |
| Search Bar | Action | Global or scoped text search with results dropdown | Top nav, list filters | Draft |
| Filter Bar | Action | Composable filter chips above a list | Data tables, search results | Draft |
| Avatar / User Chip | Display | User identity affordance with optional menu | Top nav, comments, audit logs | Draft |
| Activity Feed | Display | Reverse-chronological event list with grouping | Audit logs, notifications | Draft |

---

## 2. Pattern Specs

For each pattern in the inventory, fill in the following template. Patterns
in **Draft** status need a spec before they can be used in implementation.

### Pattern: [Name]

**Category**: [Action | Input | Disclosure | Navigation | Display | Feedback]

**When to Use**: [Specific contexts where this pattern is the right choice]

**When NOT to Use**: [Contexts where a different pattern is correct — explicit
anti-patterns prevent misuse]

**Anatomy**:
- [Slot 1 — e.g., label, icon, helper text]
- [Slot 2 — required vs optional]
- [Slot 3]

**States**:

| State | Visual | Behavior |
|-------|--------|----------|
| Default | [tokens] | [behavior] |
| Hover | [tokens] | [behavior] |
| Focus | [tokens — must be visible from keyboard] | [behavior] |
| Active / Pressed | [tokens] | [behavior] |
| Disabled | [tokens — contrast may be lower but must remain perceivable] | Non-interactive; explain why on hover/focus |
| Loading | [tokens] | Indeterminate; preserves layout |
| Error | [tokens] | Surface error message via inline validation |

**Keyboard Behavior**:
- Tab — [focus order]
- Enter / Space — [activation]
- Esc — [dismiss / cancel where applicable]
- Arrow keys — [where applicable, e.g. menus, tabs]

**Accessibility**:
- ARIA role: [role]
- ARIA labels required: [aria-label / aria-labelledby / aria-describedby usage]
- Color contrast: meets the committed accessibility tier
- Color is never the only indicator — pair with text, icon, or shape
- Animations respect `prefers-reduced-motion`

**Responsive Behavior**:
- [Behavior at breakpoints — e.g., desktop, tablet, mobile]
- [Touch target minimum size — typically 44×44 CSS pixels]

**Implementation Notes**: [Framework-specific notes per the project's pinned
framework. Reference `docs/framework-reference/<framework>/modules/` for API
details. Prefer the project's component library if one exists.]

**Example**:
```
[Code snippet or wireframe reference]
```

---

## 3. Motion & Animation Tokens

| Use Case | Duration (ms) | Easing | Notes |
|----------|---------------|--------|-------|
| Micro-feedback (button press, toggle) | 80–120 | linear or ease-out | Immediate, not noticed |
| Standard transition (modal open, drawer slide) | 200–300 | ease-in-out | Perceptible but quick |
| Page / route transition | 250–400 | ease-in-out | Should not block interaction |
| Loading skeleton shimmer | 1200–1600 (loop) | linear | Subtle, low contrast |
| Toast appear / dismiss | 200 in / 150 out | ease-out / ease-in | Should not steal focus |

All animations must:
- Respect `prefers-reduced-motion: reduce` — fall back to instant transition
- Never block keyboard input during the animation
- Never animate layout-affecting properties on the critical path

---

## 4. Sound & Notification Cues

> This template assumes B2B Web/SaaS. Sound is opt-in and never the sole
> signal for any state. If sound cues are added, every cue must have a
> visual equivalent.

| Event | Visual Cue | Sound Cue (optional) | Notes |
|-------|------------|----------------------|-------|
| Successful save | Inline checkmark + toast | None by default | Toast text states what was saved |
| Mutation error | Inline error + toast | None by default | Toast text includes retry guidance |
| Long-running job complete | Banner / browser notification | Soft chime (opt-in) | Use Notification API only with permission |
| Critical alert (e.g. payment failure) | Persistent banner + email | None | Email is the durable channel |

---

## 5. Adding a New Pattern

1. Confirm no existing pattern fits — search this library and the design
   system component catalog first
2. Draft the pattern spec using the template in Section 2
3. Submit for design-director review (visual treatment) and interaction-
   designer review (behavior, accessibility)
4. Once approved, set status to **Approved** and add the pattern to the
   project's component library (if one exists)
5. Backfill any existing screens that hand-rolled equivalent UI

---

## 6. Open Questions

| Question | Owner | Resolution Deadline | Status |
|----------|-------|---------------------|--------|
| [Track unresolved pattern decisions here so they do not disappear into chat.] | [Owner] | [Date] | [Unresolved] |
