# Available Skills (Slash Commands)

68 slash commands organized by phase. Type `/` in Claude Code to access any of them.

## Onboarding & Navigation

| Command | Purpose |
|---------|---------|
| `/start` | First-time onboarding — asks where you are, then guides you to the right workflow |
| `/help` | Context-aware "what do I do next?" — reads current stage and surfaces the required next step |
| `/project-stage-detect` | Full project audit — detect phase, identify existence gaps, recommend next steps |
| `/setup-stack` | Configure framework + version, detect knowledge gaps, populate version-aware reference docs |
| `/adopt` | Brownfield format audit — checks internal structure of existing PRDs/ADRs/stories, produces migration plan |

## Product Design

| Command | Purpose |
|---------|---------|
| `/brainstorm` | Guided ideation using professional studio methods (MDA, SDT, Bartle, verb-first) |
| `/map-systems` | Decompose product concept into systems, map dependencies, prioritize design order |
| `/design-system` | Guided, section-by-section PRD authoring for a single product system |
| `/quick-design` | Lightweight design spec for small changes — tuning, tweaks, minor additions |
| `/review-all-prds` | Cross-PRD consistency and product design holism review across all design docs |
| `/propagate-design-change` | When a PRD is revised, find affected ADRs and produce an impact report |

## UX & Interface Design

| Command | Purpose |
|---------|---------|
| `/ux-design` | Guided section-by-section UX spec authoring (screen / flow, dashboard, or pattern library) |
| `/ux-review` | Validate UX specs for PRD alignment, accessibility, and pattern compliance |

## Architecture

| Command | Purpose |
|---------|---------|
| `/create-architecture` | Guided authoring of the master architecture document |
| `/architecture-decision` | Create an Architecture Decision Record (ADR) |
| `/architecture-review` | Validate all ADRs for completeness, dependency ordering, and PRD coverage |
| `/create-permissions-manifest` | Generate flat programmer rules sheet from accepted ADRs |

## Stories & Sprints

| Command | Purpose |
|---------|---------|
| `/create-epics` | Translate PRDs + ADRs into epics — one per architectural module |
| `/create-stories` | Break a single epic into implementable story files |
| `/dev-story` | Read a story and implement it — routes to the correct programmer agent |
| `/sprint-plan` | Generate or update a sprint plan; initializes sprint-status.yaml |
| `/sprint-status` | Fast 30-line sprint snapshot (reads sprint-status.yaml) |
| `/story-readiness` | Validate a story is implementation-ready before pickup (READY/NEEDS WORK/BLOCKED) |
| `/story-done` | 8-phase completion review after implementation; updates story file, surfaces next story |
| `/estimate` | Structured effort estimate with complexity, dependencies, and risk breakdown |

## Reviews & Analysis

| Command | Purpose |
|---------|---------|
| `/design-review` | Review a product requirements document for completeness and consistency |
| `/code-review` | Architectural code review for a file or changeset |
| `/tradeoff-check` | Analyze product feature tradeoff data, formulas, and config — flag outliers |
| `/asset-audit` | Audit assets for naming conventions, file size budgets, and pipeline compliance |
| `/content-audit` | Audit PRD-specified content counts against implemented content |
| `/scope-check` | Analyze feature or sprint scope against original plan, flag scope creep |
| `/perf-profile` | Structured performance profiling with bottleneck identification |
| `/tech-debt` | Scan, track, prioritize, and report on technical debt |
| `/gate-check` | Validate readiness to advance between development phases (PASS/CONCERNS/FAIL) |
| `/consistency-check` | Scan all PRDs against the entity registry to detect cross-document inconsistencies (stats, names, rules that contradict each other) |

## QA & Testing

| Command | Purpose |
|---------|---------|
| `/qa-plan` | Generate a QA test plan for a sprint or feature |
| `/smoke-check` | Run critical path smoke test gate before QA hand-off |
| `/soak-test` | Generate a soak test protocol for extended use sessions |
| `/regression-suite` | Map test coverage to PRD critical paths, identify fixed bugs without regression tests |
| `/test-setup` | Scaffold the test framework and CI/CD pipeline for the project's framework |
| `/test-helpers` | Generate framework-specific test helper libraries for the test suite |
| `/test-evidence-review` | Quality review of test files and manual evidence documents |
| `/test-flakiness` | Detect non-deterministic (flaky) tests from CI run logs |
| `/skill-test` | Validate skill files for structural compliance and behavioral correctness |

## Production

| Command | Purpose |
|---------|---------|
| `/milestone-review` | Review milestone progress and generate status report |
| `/retrospective` | Run a structured sprint or milestone retrospective |
| `/bug-report` | Create a structured bug report |
| `/bug-triage` | Read all open bugs, re-evaluate priority vs. severity, assign owner and label |
| `/reverse-document` | Generate design or architecture docs from existing implementation |
| `/usability-test-report` | Generate a structured usability test report or analyze existing usability test notes |

## Release

| Command | Purpose |
|---------|---------|
| `/release-checklist` | Generate and validate a pre-release checklist for the current build |
| `/launch-checklist` | Complete launch readiness validation across all departments |
| `/changelog` | Auto-generate changelog from git commits and sprint data |
| `/release-notes` | Generate user-facing release notes from git history and internal data |
| `/hotfix` | Emergency fix workflow with audit trail, bypassing normal sprint process |

## Creative & Content

| Command | Purpose |
|---------|---------|
| `/prototype` | Rapid throwaway prototype to validate a mechanic (relaxed standards, isolated worktree) |
| `/onboard` | Generate contextual onboarding document for a new contributor or agent |
| `/localize` | Localization workflow: string extraction, validation, translation readiness |

## Team Orchestration

Coordinate multiple agents on a single feature area:

| Command | Coordinates |
|---------|-------------|
| `/team-core-workflows` | product-manager + feature-engineer + ml-engineer + design-systems-engineer + interaction-designer + qa-engineer |
| `/team-content` | content-director + content-writer + information-architect + screen-designer |
| `/team-ui` | ux-designer + frontend-engineer + design-director + accessibility-specialist |
| `/team-release` | release-manager + qa-lead + devops-engineer + engineering manager |
| `/team-polish` | performance-engineer + design-systems-engineer + interaction-designer + qa-engineer |
| `/team-notifications` | brand-director + interaction-designer + design-systems-engineer + feature-engineer |
| `/team-information-architecture` | screen-designer + content-director + information-architect + design-director + systems-analyst + qa-engineer |
| `/team-growth` | growth-engineer + business-analyst + customer-success-manager + analytics-engineer |
| `/team-qa` | qa-lead + qa-engineer + feature-engineer + engineering manager |
