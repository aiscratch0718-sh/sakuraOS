---
name: design-system-bible
description: "Guided, section-by-section Design System Bible authoring. Creates the visual identity specification that gates all asset production. Run after /brainstorm is approved and before /map-systems or any PRD authoring begins."
argument-hint: "[--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
---

## Phase 0: Parse Arguments and Context Check

Resolve the review mode (once, store for all gate spawns this run):
1. If `--review [full|lean|solo]` was passed → use that
2. Else read `production/review-mode.txt` → use that value
3. Else → default to `lean`

See `.claude/docs/director-gates.md` for the full check pattern.

Read `design/prd/product-concept.md`. If it does not exist, fail with:
> "No product concept found. Run `/brainstorm` first — the design system bible is authored after the product concept is approved."

Extract from product-concept.md:
- Product title (working title)
- Core fantasy and elevator pitch
- Product pillars (all of them)
- **Visual Identity Anchor** section if present (from brainstorm Phase 4 design-director output)
- Target platform (if noted)

**Retrofit mode detection**: Glob `design/art/design-system-bible.md`. If the file exists:
- Read it in full
- For each of the 9 sections, check whether the body contains real content (more than a `[To be designed]` placeholder or similar) vs. is empty/placeholder
- Build a section status table:

```
Section | Status
--------|--------
1. Visual Identity Statement | [Complete / Empty / Placeholder]
2. Color Palette | ...
3. Lighting & Atmosphere | ...
4. Character Visual Design Direction | ...
5. Environment & Level Art | ...
6. UI Visual Language | ...
7. VFX & Particle Style | ...
8. Asset Standards | ...
9. Style Prohibitions | ...
```

- Present this table to the user:
 > "Found existing design system bible at `design/art/design-system-bible.md`. [N] sections are complete, [M] need content. I'll work on the incomplete sections only — existing content will not be touched."
- Only work on sections with Status: Empty or Placeholder. Do not re-author sections that are already complete.

If the file does not exist, this is a fresh authoring session — proceed normally.

Read `.claude/docs/technical-preferences.md` if it exists — extract performance budgets and framework for asset standard constraints.

---

## Phase 1: Framing

Present the session context and ask two questions before authoring anything:

Use `AskUserQuestion` with two tabs:
- Tab **"Scope"** — "Which sections need to be authored today?"
 Options: `Full bible — all 9 sections` / `Visual identity core (sections 1–4 only)` / `Asset standards only (section 8)` / `Resume — fill in missing sections`
- Tab **"References"** — "Do you have reference products, films, or art that define the visual direction?"
 (Free text — let the user type specific titles. Do NOT preset options here.)

If the product-concept.md has a Visual Identity Anchor section, note it:
> "Found a visual identity anchor from brainstorm: '[anchor name] — [one-line rule]'. I'll use this as the foundation for the design system bible."

---

## Phase 2: Visual Identity Foundation (Sections 1–4)

These four sections define the core visual language. **All other sections flow from them.** Author and write each to file before moving to the next.

### Section 1: Visual Identity Statement

**Goal**: A one-line visual rule plus 2–3 supporting principles that resolve visual ambiguity.

If a visual anchor exists from product-concept.md: present it and ask:
- "Build directly from this anchor?"
- "Revise it before expanding?"
- "Start fresh with new options?"

**Agent delegation (MANDATORY)**: Spawn `design-director` via Task:
- Provide: product concept (elevator pitch, core fantasy), full pillar set, platform target, any reference products/art from Phase 1 framing, the visual anchor if it exists
- Ask: "Draft a Visual Identity Statement for this product. Provide: (1) a one-line visual rule that could resolve any visual decision ambiguity, (2) 2–3 supporting visual principles, each with a one-sentence design test ('when X is ambiguous, this principle says choose Y'). Anchor all principles directly in the stated pillars — each principle must serve a specific pillar."

Present the design-director's draft to the user. Use `AskUserQuestion`:
- Options: `[A] Lock this in` / `[B] Revise the one-liner` / `[C] Revise a supporting principle` / `[D] Describe my own direction`

Write the approved section to file immediately.

### Section 2: Mood & Atmosphere

**Goal**: Emotional and tonal targets by product surface — specific enough for a designer to work from.

For each major product surface (e.g., signed-out marketing, onboarding, primary dashboard, list screens, settings, error / empty states — adapt to this product's surfaces), define:
- Primary emotional target (calm / focused / urgent / celebratory)
- Visual character (theme intensity, color temperature, contrast level)
- Tonal descriptors (3–5 adjectives)
- Density level (sparse / standard / dense)

**Agent delegation**: Spawn `design-director` via Task with the Visual Identity Statement and pillar set. Ask: "Define emotional and tonal targets for each major surface of this product. Be specific — 'professional and calm' is not enough. Name the exact emotional target, the visual character (warm / cool, high / low contrast, density), and at least one visual element that carries the mood. Each surface must feel visually distinct from the others where the customer's mental state differs."

Write the approved section to file immediately.

### Section 3: Shape Language

**Goal**: The geometric and structural vocabulary that makes the product visually coherent and distinguishable.

Cover:
- Iconography shape philosophy (line vs. filled, stroke width, corner radius, sizing scale)
- Layout shape grammar (rectangular vs. rounded surfaces; pill buttons vs. squared buttons; corner radius hierarchy)
- Illustration shape style (geometric vs. organic; spot illustration role on empty states, marketing pages, onboarding)
- Hero shapes vs. supporting shapes (what draws the eye on a dashboard; what recedes into background)

**Agent delegation**: Spawn `design-director` via Task with Visual Identity Statement and mood targets. Ask: "Define the shape language for this product. Connect each shape principle back to the visual identity statement and a specific product pillar. Explain what these shape choices communicate to the customer."

Write the approved section to file immediately.

### Section 4: Color System

**Goal**: A complete, producible palette system that serves both aesthetic and communication needs.

Cover:
- Primary palette (5–7 colors with roles — not just hex codes, but the role
  each color plays: brand, action, success, warning, danger, neutral, surface)
- Semantic color usage (what does red communicate? Green? Yellow? Establish
  the color vocabulary across the product)
- Light / dark theme contracts — every semantic token has a light and dark
  variant; semantic names (`bg-surface`, `text-foreground`) replace literal
  colors in components
- Marketing / brand palette (may differ from in-product palette — define the
  divergence explicitly)
- Colorblind safety: which semantic colors need shape / icon / text backup
- Contrast: every text color is paired with the surface colors it can sit on
  (with measured contrast ratios) per the committed accessibility tier

**Agent delegation**: Spawn `design-director` via Task with Visual Identity Statement and mood targets. Ask: "Design the color system for this product. Every semantic color assignment must be explained — why does this color mean success / warning / danger in this product? Identify which color pairs might fail colorblind users and specify what backup cues are needed."

Write the approved section to file immediately.

---

## Phase 3: Production Guides (Sections 5–8)

These sections translate the visual identity into concrete production rules. They should be specific enough that an outsourcing team can follow them without additional briefing.

### Section 5: Typography & Voice

**Agent delegation**: Spawn `design-director` via Task with sections 1–4. Ask: "Define the typography system for this product. Cover: typeface choices (sans-serif body, optional display / mono), weight hierarchy (regular / medium / semibold / bold), size scale (display / heading / body / caption), line-height and tracking conventions, and the tone the type system should communicate (austere / friendly / editorial / utility)."

Write the approved section to file.

### Section 6: Layout & Density

**Agent delegation**: Spawn `design-director` via Task with sections 1–4. Ask: "Define layout and density rules for this product. Cover: spacing scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64), default breakpoints, container widths, dashboard vs settings vs detail-screen density target, and grid system. Specify when to use whitespace vs density for different surfaces (executive dashboard = sparse; analyst dashboard = dense)."

Write the approved section to file.

### Section 7: UI Component Visual Direction

**Agent delegation**: Spawn in parallel:
- **`design-director`**: Visual style for components — button visual treatments (filled / outlined / ghost), form field treatment (filled vs underlined), card and surface elevation philosophy, modal vs drawer vs popover preferences, animation feel for UI elements
- **`ux-designer`**: UX alignment check — does the visual direction support the interaction patterns this product requires? Flag any conflicts between visual decisions and readability / accessibility needs.

Collect both. If they conflict (e.g., design-director wants very low-contrast secondary buttons but ux-designer flags it fails AA contrast), surface the conflict explicitly with both positions. Do NOT silently resolve — use `AskUserQuestion` to let the user decide.

Write the approved section to file.

### Section 8: Asset & Token Standards

**Agent delegation**: Spawn in parallel:
- **`design-director`**: File format preferences (SVG for icons, AVIF / WebP for raster), naming convention direction, asset organization in design tools, marketing-image style, illustration source rules
- **`design-systems-engineer`**: Engineering-side constraints — token export format (CSS vars / Tailwind config / JSON), maximum bundle size per route, image optimization pipeline (next/image, sharp, Cloudflare Images), font subsetting and `font-display` rules, anything from the performance budgets in `.claude/docs/technical-preferences.md`

If any visual preference conflicts with a technical constraint (e.g., design-director wants four font weights but performance budget allows two), resolve the conflict explicitly — note both the ideal and the constrained standard, and explain the tradeoff. Ambiguity in asset standards is where production costs are born.

Write the approved section to file.

---

## Phase 4: Reference Direction (Section 9)

**Goal**: A curated reference set that is specific about what to take and what to avoid from each source.

**Agent delegation**: Spawn `design-director` via Task with the completed sections 1–8. Ask: "Compile a reference direction for this product. Provide 3–5 reference sources (products, films, art styles, or specific artists). For each: name it, specify exactly what visual element to draw from it (not 'the general aesthetic' — a specific technique, color choice, or compositional rule), and specify what to explicitly avoid or diverge from (to prevent the 'trying to copy X' reading). References should be additive — no two references should be pointing in exactly the same direction."

Write the approved section to file.

---

## Phase 5: Design Director Sign-Off

**Review mode check** — apply before spawning DD-DESIGN-BIBLE:
- `solo` → skip. Note: "DD-DESIGN-BIBLE skipped — Solo mode." Proceed to Phase 6.
- `lean` → skip (not a PHASE-GATE). Note: "DD-DESIGN-BIBLE skipped — Lean mode." Proceed to Phase 6.
- `full` → spawn as normal.

After all sections are complete (or the scoped set from Phase 1 is complete), spawn `product-director` via Task using gate **DD-DESIGN-BIBLE** (`.claude/docs/director-gates.md`).

Pass: design system bible file path, product pillars, visual identity anchor.

Handle verdict per standard rules in `director-gates.md`. Record the verdict in the design system bible's status header:
`> **Design Director Sign-Off (DD-DESIGN-BIBLE)**: APPROVED [date] / CONCERNS (accepted) [date] / REVISED [date]`

---

## Phase 6: Close

Before presenting next steps, check project state:
- Does `design/prd/systems-index.md` exist? → map-systems is done, skip that option
- Does `.claude/docs/technical-preferences.md` contain a configured framework (not `[TO BE CONFIGURED]`)? → setup-stack is done, skip that option
- Does `design/prd/` contain any `*.md` files? → design-system has been run, skip that option
- Does `design/prd/prd-cross-review-*.md` exist? → review-all-prds is done
- Do PRDs exist (check above)? → include /consistency-check option

Use `AskUserQuestion` for next steps. Only include options that are genuinely next based on the state check above:

**Option pool — include only if not already done:**
- `[_] Run /map-systems — decompose the concept into systems before writing PRDs` (skip if systems-index.md exists)
- `[_] Run /setup-stack — configure the framework (asset standards may need revisiting after framework is set)` (skip if framework configured)
- `[_] Run /design-system — start the first PRD` (skip if any PRDs exist)
- `[_] Run /review-all-prds — cross-PRD consistency check (required before Technical Setup gate)` (skip if prd-cross-review-*.md exists)
- `[_] Run /asset-spec — generate per-asset visual specs and AI generation prompts from approved PRDs` (include if PRDs exist)
- `[_] Run /consistency-check — scan existing PRDs against the design system bible for visual direction conflicts` (include if PRDs exist)
- `[_] Run /create-architecture — author the master architecture document (next Technical Setup step)`
- `[_] Stop here`

Assign letters A, B, C… only to the options actually included. Mark the most logical pipeline-advancing option as `(recommended)`.

> **Always include** `/create-architecture` and Stop here as options — these are always valid next steps once the design system bible is complete.

---

## Collaborative Protocol

Every section follows: **Question → Options → Decision → Draft (from design-director agent) → Approval → Write to file**

- Never draft a section without first spawning the relevant agent(s)
- Write each section to file immediately after approval — do not batch
- Surface all agent disagreements to the user — never silently resolve conflicts between design-director and design-systems-engineer
- The design system bible is a constraint document: it restricts future decisions in exchange for visual coherence. Every section should feel like it narrows the solution space productively.

---

## Recommended Next Steps

After the design system bible is approved:
- Run `/map-systems` to decompose the concept into product systems before authoring PRDs
- Run `/setup-stack` if the framework is not yet configured (asset standards may need revisiting after framework selection)
- Run `/design-system [first-system]` to start authoring per-system PRDs
- Run `/consistency-check` once PRDs exist to validate them against the design system bible's visual rules
- Run `/create-architecture` to produce the master architecture document
