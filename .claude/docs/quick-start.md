# Web Studio Agent Architecture — Quick Start Guide

## What Is This?

This is a complete Claude Code agent architecture for B2B web / SaaS
development. It organizes 49 specialized AI agents into a studio
hierarchy that mirrors real product teams, with defined responsibilities,
delegation rules, and coordination protocols. It includes framework-
specialist agents for **Next.js**, **React + Node**, and **NestJS** —
each with dedicated sub-specialists. Use whichever framework family
matches your project.

## How to Use

### 1. Understand the Hierarchy

There are three tiers of agents:

- **Tier 1 (Opus)**: Directors who make high-level decisions
  - `product-director` — vision and strategic conflict resolution
  - `technical-director` — architecture and technology decisions
  - `engineering-manager` — scheduling, coordination, and risk management

- **Tier 2 (Sonnet)**: Department leads who own their domain
  - `product-manager`, `lead-engineer`, `design-director`, `brand-director`,
    `content-director`, `qa-lead`, `release-manager`, `localization-lead`

- **Tier 3 (Sonnet/Haiku)**: Specialists who execute within their domain
  - Designers, engineers, content writers, testers, framework specialists

### 2. Pick the Right Agent for the Job

Ask yourself: "What department would handle this in a real product team?"

| I need to... | Use this agent |
|--------------|----------------|
| Design a new feature / workflow | `product-manager` |
| Write feature business logic | `feature-engineer` |
| Build a reusable component | `component-library-specialist` |
| Write UX copy or microcopy | `content-writer` |
| Plan the next sprint | `engineering-manager` |
| Review code quality | `lead-engineer` |
| Write test cases | `qa-engineer` |
| Design a screen or area | `screen-designer` |
| Fix a performance problem | `performance-engineer` |
| Set up CI/CD | `devops-engineer` |
| Design pricing tiers / entitlements | `business-analyst` |
| Resolve a strategic conflict | `product-director` |
| Make an architecture decision | `technical-director` |
| Manage a release | `release-manager` |
| Prepare strings for translation | `localization-lead` |
| Validate a feature idea quickly | `prototyper` |
| Review code for security issues | `security-engineer` |
| Check accessibility compliance | `accessibility-specialist` |
| Get NestJS advice | `nestjs-specialist` |
| Get React advice | `react-specialist` |
| Get Next.js advice | `nextjs-specialist` |
| Design API gateway / public API surface | `api-gateway-specialist` |
| Design DB schema / repository / migrations | `orm-specialist` |
| Implement WebSocket / realtime channels | `websocket-specialist` or `realtime-specialist` |
| Build internal admin / back-office UI | `admin-ui-specialist` |
| Author Server Actions for forms / mutations | `server-actions-specialist` |
| Configure App Router routes / layouts | `app-router-specialist` |
| Configure CDN / image / font delivery | `cdn-asset-specialist` |
| Define motion / animation tokens | `css-animation-specialist` |
| Maintain Tailwind config and design tokens | `tailwind-specialist` |
| Write idiomatic TypeScript across the stack | `typescript-specialist` |
| Plan lifecycle messaging and growth experiments | `growth-engineer` |
| Write release notes / customer comms | `customer-success-manager` |
| Brainstorm a new product idea | Use the `/brainstorm` skill |

### 3. Use Slash Commands for Common Tasks

| Command | What it does |
|---------|--------------|
| `/start` | First-time onboarding — asks where you are, guides you to the right workflow |
| `/help` | Context-aware "what do I do next?" — reads your current phase and artifacts |
| `/project-stage-detect` | Analyze project state, detect stage, identify gaps |
| `/setup-stack` | Configure framework family + version, populate reference docs |
| `/adopt` | Brownfield audit and migration plan for existing projects |
| `/brainstorm` | Guided product concept ideation from scratch |
| `/map-systems` | Decompose concept into systems, map dependencies, guide per-system PRDs |
| `/design-system` | Guided, section-by-section PRD authoring for a single product system |
| `/quick-design` | Lightweight spec for small changes — tuning, tweaks, minor additions |
| `/review-all-prds` | Cross-PRD consistency and product design review |
| `/propagate-design-change` | Find ADRs and stories affected by a PRD change |
| `/ux-design` | Author UX specs (screen / flow, dashboard, interaction patterns) |
| `/ux-review` | Validate UX specs for accessibility and PRD alignment |
| `/create-architecture` | Master architecture document for the product |
| `/architecture-decision` | Creates an ADR |
| `/architecture-review` | Validate all ADRs, dependency ordering, PRD traceability |
| `/create-permissions-manifest` | Flat programmer rules sheet from Accepted ADRs |
| `/create-epics` | Translate PRDs + ADRs into epics (one per architectural module) |
| `/create-stories` | Break a single epic into implementable story files |
| `/dev-story` | Read a story and implement it — routes to the correct programmer agent |
| `/sprint-plan` | Creates or updates sprint plans |
| `/sprint-status` | Quick sprint progress snapshot |
| `/story-readiness` | Validate a story is implementation-ready before pickup |
| `/story-done` | End-of-story completion review — verifies acceptance criteria |
| `/estimate` | Produces structured effort estimates |
| `/design-review` | Reviews a design document |
| `/code-review` | Reviews code for quality and architecture |
| `/tradeoff-check` | Analyzes pricing / entitlement / limit data for outliers |
| `/asset-audit` | Audits assets for compliance |
| `/content-audit` | PRD-specified content vs. implemented — find gaps |
| `/scope-check` | Detect scope creep against plan |
| `/perf-profile` | Performance profiling and bottleneck ID |
| `/tech-debt` | Scan, track, and prioritize tech debt |
| `/gate-check` | Validate phase readiness (PASS / CONCERNS / FAIL) |
| `/consistency-check` | Scan all PRDs for cross-document inconsistencies |
| `/reverse-document` | Generate design / architecture docs from existing code |
| `/milestone-review` | Reviews milestone progress |
| `/retrospective` | Runs sprint / milestone retrospective |
| `/bug-report` | Structured bug report creation |
| `/usability-test-report` | Creates or analyzes usability test feedback |
| `/onboard` | Generates onboarding docs for a role |
| `/release-checklist` | Validates pre-release checklist |
| `/launch-checklist` | Complete launch readiness validation |
| `/changelog` | Generates changelog from git history |
| `/release-notes` | Generate customer-facing release notes |
| `/hotfix` | Emergency fix with audit trail |
| `/prototype` | Scaffolds a throwaway prototype |
| `/localize` | Localization scan, extract, validate |
| `/team-core-workflows` | Orchestrate full core-workflows team pipeline |
| `/team-content` | Orchestrate full content team pipeline |
| `/team-ui` | Orchestrate full UI team pipeline |
| `/team-release` | Orchestrate full release team pipeline |
| `/team-polish` | Orchestrate full polish team pipeline |
| `/team-notifications` | Orchestrate full notifications team pipeline |
| `/team-information-architecture` | Orchestrate full screen / area design pipeline |
| `/team-growth` | Orchestrate growth-ops team for lifecycle, activation, retention |
| `/team-qa` | Orchestrate full QA team cycle — test plan, test cases, smoke check, sign-off |
| `/qa-plan` | Generate a QA test plan for a sprint or feature |
| `/bug-triage` | Re-prioritize open bugs, assign to sprints, surface systemic trends |
| `/smoke-check` | Run critical path smoke test gate before QA hand-off (PASS / FAIL) |
| `/soak-test` | Generate a soak test protocol for extended-session and high-volume scenarios |
| `/regression-suite` | Map coverage to PRD critical paths, flag gaps, maintain regression suite |
| `/test-setup` | Scaffold test framework + CI pipeline (Vitest / Jest / Playwright) |
| `/test-helpers` | Generate framework-specific test helper libraries and factories |
| `/test-flakiness` | Detect flaky tests from CI history, flag for quarantine or fix |
| `/test-evidence-review` | Quality review of test files and manual evidence |
| `/skill-test` | Validate skill files for compliance and correctness |

### 4. Use Templates for New Documents

Templates live in `.claude/docs/templates/`:

- `architecture-decision-record.md` — for technical decisions
- `architecture-traceability.md` — maps PRD requirements to ADRs to story IDs
- `accessibility-requirements.md` — committed accessibility tier and feature matrix
- `changelog-template.md` — for customer-facing release notes
- `concept-doc-from-prototype.md` — reverse-document a prototype into a concept
- `dashboard-design.md` — full dashboard spec (philosophy, zones, widgets, refresh model)
- `design-doc-from-implementation.md` — reverse-document existing code into a PRD
- `design-system-bible.md` — visual identity reference
- `architecture-doc-from-code.md` — reverse-document code into architecture docs
- `incident-response.md` — incident communication runbook
- `interaction-pattern-library.md` — standard UI patterns and product-specific patterns
- `milestone-definition.md` — for new milestones
- `pitch-document.md` — for pitching the product to stakeholders
- `post-mortem.md` — for project / milestone / incident retrospectives
- `product-concept.md` — for initial product concepts (JTBD, RICE, Kano)
- `product-pillars.md` — for the 3–5 product pillars
- `project-stage-report.md` — output of `/project-stage-detect`
- `release-checklist-template.md` — for release readiness checklists
- `release-notes.md` — customer-facing release notes
- `risk-register-entry.md` — for new risks
- `skill-test-spec.md` — behavioral test for a skill
- `sprint-plan.md` — for sprint planning
- `systems-index.md` — systems decomposition and dependency mapping
- `technical-design-document.md` — per-system technical designs
- `test-evidence.md` — for recording manual test evidence
- `test-plan.md` — for feature test plans
- `user-journey.md` — customer lifecycle stages with retention hooks
- `ux-spec.md` — per-screen UX specifications

Also in `.claude/docs/templates/collaborative-protocols/` (used by agents, not typically edited directly):

- `design-agent-protocol.md` — question-options-draft-approval cycle for design agents
- `implementation-agent-protocol.md` — story pickup through /story-done cycle for engineering agents
- `leadership-agent-protocol.md` — cross-department delegation and escalation for director-tier agents

### 5. Follow the Coordination Rules

1. Work flows down the hierarchy: Directors → Leads → Specialists
2. Conflicts escalate up the hierarchy
3. Cross-department work is coordinated by the `engineering-manager`
4. Agents do not modify files outside their domain without delegation
5. All decisions are documented

## First Steps for a New Project

**Don't know where to begin?** Run `/start`. It asks where you are and routes
you to the right workflow. No assumptions about your product, framework, or
experience level.

If you already know what you need, jump directly to the relevant path:

### Path A: "I have no idea what to build"

1. **Run `/start`** (or `/brainstorm`) — guided exploration of what
   excites you, what you've used, your constraints
   - Generates concepts, helps you pick one, defines core workflow and pillars
   - Produces a product concept document and recommends a framework family
2. **Set up the framework** — Run `/setup-stack` (uses the brainstorm recommendation)
   - Configures CLAUDE.md, detects knowledge gaps, populates reference docs
   - Creates `.claude/docs/technical-preferences.md` with naming conventions,
     performance budgets, and framework-specific defaults
   - If the framework version is newer than the LLM's training data, it
     fetches current docs from the web so agents suggest correct APIs
3. **Validate the concept** — Run `/design-review design/prd/product-concept.md`
4. **Decompose into systems** — Run `/map-systems` to map all systems and dependencies
5. **Design each system** — Run `/design-system [system-name]` to write PRDs in dependency order
6. **Test the core workflow** — Run `/prototype [core-workflow]`
7. **Usability-test it** — Run `/usability-test-report`
8. **Plan the first sprint** — Run `/sprint-plan new`
9. Start building

### Path B: "I know what I want to build"

If you already have a product concept and framework choice:

1. **Set up the framework** — Run `/setup-stack [framework] [version]`
   (e.g., `/setup-stack nextjs 15.1`) — also creates technical preferences
2. **Write the Product Pillars** — delegate to `product-director`
3. **Decompose into systems** — Run `/map-systems` to enumerate systems
4. **Design each system** — Run `/design-system [system-name]` for PRDs
5. **Create the initial ADRs** — Run `/architecture-decision`
6. **Create the first milestone** in `production/milestones/`
7. **Plan the first sprint** — Run `/sprint-plan new`
8. Start building

### Path C: "I know the product but not the framework"

If you have a concept but don't know which framework fits:

1. **Run `/setup-stack`** with no arguments — it asks about your product's
   needs (deployment model, team experience, compliance) and recommends a
   framework family based on your answers
2. Follow Path B from step 2 onward

### Path D: "I have an existing project"

If you have design docs, prototypes, or code already:

1. **Run `/start`** (or `/project-stage-detect`) — analyzes what exists,
   identifies gaps, recommends next steps
2. **Run `/adopt`** if you have existing PRDs, ADRs, or stories — audits
   internal format compliance and builds a numbered migration plan to
   fill gaps without overwriting your existing work
3. **Configure framework if needed** — Run `/setup-stack` if not yet configured
4. **Validate phase readiness** — Run `/gate-check` to see where you stand
5. **Plan the next sprint** — Run `/sprint-plan new`

## File Structure Reference

```
CLAUDE.md                                — Master config (read this first)
.claude/
  settings.json                          — Claude Code hooks and project settings
  agents/                                — 49 agent definitions (YAML frontmatter)
  skills/                                — 72 slash command definitions (YAML frontmatter)
  hooks/                                 — 12 hook scripts (.sh) wired by settings.json
  rules/                                 — 9 path-specific rule files
  docs/
    quick-start.md                       — This file
    technical-preferences.md             — Project-specific standards (populated by /setup-stack)
    coordination-rules.md                — Agent coordination rules
    directory-structure.md               — Project directory layout
    rules-reference.md                   — Path-scoped rules summary
    workflow-catalog.yaml                — Pipeline definition (read by /help)
    templates/                           — Document templates
```
