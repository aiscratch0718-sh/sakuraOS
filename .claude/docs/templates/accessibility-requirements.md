# Accessibility Requirements: [Product Name]

> **Status**: Draft | Committed | Audited | Certified
> **Author**: [accessibility-specialist / ux-designer / engineering-manager]
> **Last Updated**: [Date]
> **Committed Tier**: Basic | Standard | Comprehensive | Exemplary
> **Conformance Target**: WCAG 2.1 Level [A / AA / AAA]
> **Audited By**: [Internal / Third-party auditor — name]
> **Last Audit Date**: [Date or "Not yet audited"]

---

## 1. Why This Document Exists

Accessibility is a **gating commitment**, not a polish item. This document
records the project's committed accessibility tier and the testable
requirements that flow from it. Stories are blocked from "Done" if they
violate the committed tier.

This document is read by:
- `/ux-design` — every UX spec must satisfy committed requirements
- `/team-ui` Phase 4 — accessibility-specialist audits against this doc
- `/code-review` — flags violations of stated requirements
- `/launch-checklist` — confirms audit status before release

---

## 2. Accessibility Tiers

| Tier | What It Covers | Effort |
|------|----------------|--------|
| **Basic** | WCAG 2.1 Level A. Keyboard reachable, alt text, form labels, focus indicators, no flashing content. | Low — table-stakes for any web product |
| **Standard** | Level AA. All Basic + color contrast (4.5:1 body, 3:1 large), reflow, resize text 200%, error identification, language declared, status messages announced. | Medium — required for most B2B contracts |
| **Comprehensive** | Level AA strict + screen reader support across all flows, captions and transcripts for any media, full keyboard navigation including custom widgets, high-contrast mode, prefers-reduced-motion compliance. | High — required for public sector / regulated industries |
| **Exemplary** | Level AAA where applicable, plus user-facing accessibility settings (font size, density, motion, contrast), live regions for all dynamic updates, internal accessibility champion role, external audit on every release. | Very High — competitive differentiator |

**This project's committed tier**: [Tier]

**Justification**: [One paragraph explaining why this tier was chosen.
Examples: "The product targets enterprise procurement which requires WCAG
2.1 AA conformance per VPAT." / "The product is a public sector tool;
Section 508 requires AA conformance."]

---

## 3. Visual Accessibility

| Requirement | Tier | Scope | Status | Notes |
|-------------|------|-------|--------|-------|
| Color contrast — body text | Basic | All text on all backgrounds | Not Started | 4.5:1 minimum (WCAG AA) |
| Color contrast — large text (≥18pt or ≥14pt bold) | Basic | All large text | Not Started | 3:1 minimum |
| Color contrast — non-text UI (focus rings, icons, form borders) | Standard | All interactive controls | Not Started | 3:1 against adjacent colors |
| Color is never the only indicator | Basic | Status, validation, charts | Not Started | Pair color with text, icon, or shape |
| Reflow at 320 CSS px width | Standard | All screens | Not Started | No horizontal scrolling for vertical content (and vice versa) |
| Text resize to 200% | Standard | All text | Not Started | Layout must not break |
| User font size preference respected | Comprehensive | All text | Not Started | Use rem/em, not fixed px on body text |
| High contrast / dark mode | Comprehensive | Whole product | Not Started | OS-level preference detected via `prefers-color-scheme` |
| `prefers-reduced-motion` respected | Standard | All animations >200ms | Not Started | Replace transitions with instant cuts |

---

## 4. Keyboard & Pointer Accessibility

| Requirement | Tier | Scope | Status | Notes |
|-------------|------|-------|--------|-------|
| All interactive elements reachable via Tab | Basic | All screens | Not Started | No keyboard traps |
| Visible focus indicator on every focusable element | Basic | All interactive | Not Started | Contrast 3:1 against adjacent; never `outline: none` without replacement |
| Logical Tab order matches visual order | Basic | All screens | Not Started | Use DOM order; avoid `tabindex > 0` |
| Skip-to-content link on every page | Standard | Top of every page | Not Started | First focusable element |
| Custom widgets follow WAI-ARIA Authoring Practices | Comprehensive | Tabs, menus, comboboxes, dialogs | Not Started | Roles, states, properties, expected keys |
| Touch target minimum size | Standard | All clickable | Not Started | 44×44 CSS px minimum |
| No hover-only interactions | Standard | All interactive | Not Started | Every hover behavior also reachable via focus or click |

---

## 5. Screen Reader & Semantics

| Requirement | Tier | Scope | Status | Notes |
|-------------|------|-------|--------|-------|
| Every form field has a programmatic label | Basic | All forms | Not Started | `<label for>` or `aria-labelledby` |
| Every image has alt text (or `alt=""` if decorative) | Basic | All images | Not Started | Reject auto-generated alt — author it |
| Every page has a unique, descriptive `<title>` | Basic | All pages | Not Started | Format: "[Page] · [Product]" |
| Heading structure is hierarchical (no skipped levels) | Standard | All screens | Not Started | One `<h1>` per page |
| Landmark regions (`<main>`, `<nav>`, `<header>`, `<footer>`) | Standard | All pages | Not Started | One `<main>` per page |
| Live region announcements for async state | Comprehensive | Toasts, async errors, mutation feedback | Not Started | `aria-live="polite"` for non-critical; `assertive` for errors only |
| Tables use proper `<th scope>` markup | Standard | All data tables | Not Started | Column / row scopes set |
| Language declared on `<html lang>` | Basic | All pages | Not Started | Update for inline language switches with `lang` attribute |

---

## 6. Forms & Errors

| Requirement | Tier | Scope | Status | Notes |
|-------------|------|-------|--------|-------|
| Errors identified in text (not color alone) | Basic | All forms | Not Started | Inline error message + icon |
| Errors associated with their field via `aria-describedby` | Standard | All forms | Not Started | Screen reader hears the error when field is focused |
| Required fields marked programmatically (`aria-required` / `required`) | Basic | All forms | Not Started | Visual asterisk alone is not enough |
| Error summary at top of form on submit failure | Standard | All forms | Not Started | Linked to first error; receives focus |
| Form submission has confirmation feedback | Basic | All forms | Not Started | Toast or inline confirmation; announced via live region |

---

## 7. Test Plan

| Test | Method | Acceptance Criteria | Owner | Status |
|------|--------|---------------------|-------|--------|
| Automated axe-core scan | Run on every page in CI | Zero serious or critical violations | qa-engineer | Not Started |
| Keyboard-only navigation | Manual — disconnect mouse, complete all critical flows | Every flow completable; visible focus throughout | accessibility-specialist | Not Started |
| Screen reader smoke test | Manual — NVDA on Windows / VoiceOver on macOS, complete sign-up + primary flow | All elements announced with meaningful labels | accessibility-specialist | Not Started |
| Reduced motion | Manual — enable OS preference, navigate all screens | No looping animations; no parallax; cross-fades collapse to cuts | ux-designer | Not Started |
| 200% text resize | Manual — set browser zoom to 200% | All content readable; layout intact; no horizontal scroll | ux-designer | Not Started |
| Color contrast audit | Automated — Lighthouse / axe / Stark plugin | All text and non-text contrast meets committed tier | accessibility-specialist | Not Started |

---

## 8. Open Questions

| Question | Owner | Resolution Deadline | Status |
|----------|-------|---------------------|--------|
| [Track unresolved accessibility decisions here.] | [Owner] | [Date] | [Unresolved] |

---

## 9. Audit History

| Date | Auditor | Tier Audited Against | Issues Found | Status |
|------|---------|----------------------|--------------|--------|
| [Date] | [Name / firm] | [Tier] | [Count by severity] | [Resolved / Open] |
