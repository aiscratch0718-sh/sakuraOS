# Agent Coordination and Delegation Map

## Organizational Hierarchy

```
 [Human Developer]
 |
 +---------------+---------------+
 | | |
 product-director technical-director engineering manager
 | | |
 +--------+--------+ | (coordinates all)
 | | | |
 product-manager art-dir narr-dir lead-engineer qa-lead audio-dir
 | | | | | |
 +--+--+ | +--+--+ +--+--+--+--+--+ | |
 | | | | | | | | | | | | | |
 sys lvl eco ta wrt wrld gp ep ai net tl ui qa-t snd
 |
 +---+---+
 | |
 perf-a devops analytics

 Additional Leads (report to engineering manager/directors):
 release-manager -- Release pipeline, versioning, deployment
 localization-lead -- i18n, string tables, translation pipeline
 prototyper -- Rapid throwaway prototypes, concept validation
 security-engineer -- Authn / authz, multi-tenant isolation, dependency CVEs, data privacy
 accessibility-specialist -- WCAG conformance, color independence, keyboard / touch, motion
 growth-engineer -- Lifecycle messaging, activation, retention, expansion experiments
 customer-success-manager -- Release notes, customer feedback, incident comms

 Framework Specialists (use the SET matching your framework):

 NestJS family:
 nestjs-specialist        -- Module / controller / service split, DTOs, guards, interceptors
 api-gateway-specialist   -- Public API surface, BFF, OpenAPI, rate limiting, webhook ingestion
 orm-specialist           -- ORM choice, schemas, migrations, repositories, query perf
 websocket-specialist     -- WebSocket gateways, handshake auth, rooms, Redis adapter
 admin-ui-specialist      -- Admin framework choice, entity CRUD, RBAC integration

 React + Node family:
 react-specialist         -- Build / routing / state-management choice, code-splitting, perf
 realtime-specialist      -- WebSockets / SSE / vendor pub-sub, channel auth, recovery
 css-animation-specialist -- Motion design, CSS transitions, Framer Motion, reduced-motion
 cdn-asset-specialist     -- CDN choice, image / font optimization, cache headers
 component-library-specialist -- Component catalog, design-token integration, accessibility

 Next.js family:
 nextjs-specialist        -- App / Pages router, rendering strategy, caching, middleware
 app-router-specialist    -- File-based routing, layouts, route groups, parallel / intercepting
 typescript-specialist    -- Strict TS, Zod source-of-truth, generics, RSC / Client typing
 tailwind-specialist      -- tailwind.config.ts, design-token mapping, dark mode, variants
 server-actions-specialist -- Mutations, form integration, idempotency, revalidation
```

### Legend
```
sys = systems-analyst gp = feature-engineer
lvl = screen-designer ep = platform-engineer
eco = business-analyst ai = ml-engineer
ta = design-systems-engineer net = api-engineer
wrt = content-writer tl = devx-engineer
wrld = information-architect ui = frontend-engineer
snd = interaction-designer qa-t = qa-engineer
narr-dir = content-director perf-a = performance-engineer
art-dir = design-director
```

## Delegation Rules

### Who Can Delegate to Whom

| From | Can Delegate To |
|------|----------------|
| product-director | product-manager, design-director, brand-director, content-director |
| technical-director | lead-engineer, devops-engineer, performance-engineer, design-systems-engineer (technical decisions) |
| engineering manager | Any agent (task assignment within their domain only) |
| product-manager | systems-analyst, screen-designer, business-analyst |
| lead-engineer | feature-engineer, platform-engineer, ml-engineer, api-engineer, devx-engineer, frontend-engineer |
| design-director | design-systems-engineer, ux-designer |
| brand-director | interaction-designer |
| content-director | content-writer, information-architect |
| qa-lead | qa-engineer |
| release-manager | devops-engineer (release builds), qa-lead (release testing) |
| localization-lead | content-writer (string review), frontend-engineer (text fitting) |
| prototyper | (works independently, reports findings to engineering manager and relevant leads) |
| security-engineer | api-engineer (security review), lead-engineer (secure patterns) |
| accessibility-specialist | ux-designer (accessible patterns), frontend-engineer (implementation), qa-engineer (a11y testing) |
| [framework]-specialist | framework sub-specialists (delegates subsystem-specific work) |
| [framework] sub-specialists | (advises all programmers on framework subsystem patterns and optimization) |
| growth-engineer | business-analyst (pricing / entitlements), customer-success-manager (lifecycle comms), analytics-engineer (growth metrics) |
| customer-success-manager | (works with engineering-manager for approval, release-manager for release-note timing) |

### Escalation Paths

| Situation | Escalate To |
|-----------|------------|
| Two designers disagree on a flow | product-manager |
| Product design vs content / brand voice conflict | product-director |
| Product design vs technical feasibility | engineering-manager (facilitates), then product-director + technical-director |
| Visual design vs interaction design conflict | product-director |
| Code architecture disagreement | technical-director |
| Cross-system code conflict | lead-engineer, then technical-director |
| Schedule conflict between departments | engineering manager |
| Scope exceeds capacity | engineering manager, then product-director for cuts |
| Quality gate disagreement | qa-lead, then technical-director |
| Performance budget violation | performance-engineer flags, technical-director decides |

## Common Workflow Patterns

### Pattern 1: New Feature (Full Pipeline)

```
1. product-director -- Approves feature concept aligns with vision
2. product-manager -- Creates design document with full spec
3. engineering manager -- Schedules work, identifies dependencies
4. lead-engineer -- Designs code architecture, creates interface sketch
5. [specialist-programmer] -- Implements the feature
6. design-systems-engineer -- Implements visual effects (if needed)
7. content-writer -- Creates text content (if needed)
8. interaction-designer -- Creates audio event list (if needed)
9. qa-engineer -- Writes test cases
10. qa-lead -- Reviews and approves test coverage
11. lead-engineer -- Code review
12. qa-engineer -- Executes tests
13. engineering manager -- Marks task complete
```

### Pattern 2: Bug Fix

```
1. qa-engineer -- Files bug report with /bug-report
2. qa-lead -- Triages severity and priority
3. engineering manager -- Assigns to sprint (if not S1)
4. lead-engineer -- Identifies root cause, assigns to programmer
5. [specialist-programmer] -- Fixes the bug
6. lead-engineer -- Code review
7. qa-engineer -- Verifies fix and runs regression
8. qa-lead -- Closes bug
```

### Pattern 3: Feature Tradeoff Adjustment

```
1. analytics-engineer -- Identifies imbalance from data (or user reports)
2. product-manager -- Evaluates the issue against design intent
3. business-analyst -- Models the adjustment
4. product-manager -- Approves the new values
5. [data file update] -- Change configuration values
6. qa-engineer -- Regression test affected systems
7. analytics-engineer -- Monitor post-change metrics
```

### Pattern 4: New Screen / Module / Area

```
1. content-director -- Defines the editorial purpose of the area
2. information-architect -- Defines the information hierarchy and navigation
3. screen-designer -- Designs layout, list / detail / dashboard composition
4. product-manager -- Reviews the area's interaction model and PRD coverage
5. design-director -- Defines visual direction for the area
6. brand-director -- Defines voice and tonal direction for the area
7. [implementation by relevant engineers]
8. content-writer -- Creates area-specific UX copy
9. qa-engineer -- Tests the complete area end-to-end
```

### Pattern 5: Sprint Cycle

```
1. engineering manager -- Plans sprint with /sprint-plan new
2. [All agents] -- Execute assigned tasks
3. engineering manager -- Daily status with /sprint-plan status
4. qa-lead -- Continuous testing during sprint
5. lead-engineer -- Continuous code review during sprint
6. engineering manager -- Sprint retrospective with post-sprint hook
7. engineering manager -- Plans next sprint incorporating learnings
```

### Pattern 6: Milestone Checkpoint

```
1. engineering manager -- Runs /milestone-review
2. product-director -- Reviews creative progress
3. technical-director -- Reviews technical health
4. qa-lead -- Reviews quality metrics
5. engineering manager -- Facilitates go/no-go discussion
6. [All directors] -- Agree on scope adjustments if needed
7. engineering manager -- Documents decisions and updates plans
```

### Pattern 7: Release Pipeline

```text
1. engineering manager -- Declares release candidate, confirms milestone criteria met
2. release-manager -- Cuts release branch, generates /release-checklist
3. qa-lead -- Runs full regression, signs off on quality
4. localization-lead -- Verifies all strings translated, text fitting passes
5. performance-engineer -- Confirms performance benchmarks within targets
6. devops-engineer -- Builds release artifacts, runs deployment pipeline
7. release-manager -- Generates /changelog, tags release, creates release notes
8. technical-director -- Final sign-off on major releases
9. release-manager -- Deploys and monitors for 48 hours
10. engineering manager -- Marks release complete
```

### Pattern 8: Rapid Prototype

```text
1. product-manager -- Defines the hypothesis and success criteria
2. prototyper -- Scaffolds prototype with /prototype
3. prototyper -- Builds minimal implementation (hours, not days)
4. product-manager -- Evaluates prototype against criteria
5. prototyper -- Documents findings report
6. product-director -- Go/no-go decision on proceeding to production
7. engineering manager -- Schedules production work if approved
```

### Pattern 9: Lifecycle Campaign / Growth Experiment Launch

```text
1. growth-engineer -- Designs the campaign / experiment, hypothesis, success metric
2. product-manager -- Validates the user-facing change the campaign relies on
3. business-analyst -- Reviews entitlement / pricing implications
4. content-director -- Provides voice / tone direction
5. content-writer -- Creates lifecycle copy (email, in-app, push)
6. engineering-manager -- Schedules implementation work
7. [implementation by relevant engineers]
8. qa-lead -- Tests the campaign end-to-end (delivery, dedup, frequency caps)
9. customer-success-manager -- Drafts the customer-facing announcement
10. release-manager -- Coordinates the rollout
11. analytics-engineer -- Monitors the success metric and guardrails
12. growth-engineer -- Post-campaign analysis and learnings
```

## Cross-Domain Communication Protocols

### Design Change Notification

When a design document changes, the product-manager must notify:
- lead-engineer (implementation impact)
- qa-lead (test plan update needed)
- engineering manager (schedule impact assessment)
- Relevant specialist agents depending on the change

### Architecture Change Notification

When an ADR is created or modified, the technical-director must notify:
- lead-engineer (code changes needed)
- All affected specialist programmers
- qa-lead (testing strategy may change)
- engineering manager (schedule impact)

### Asset Standard Change Notification

When the design system bible or asset standards change, the design-director must notify:
- design-systems-engineer (pipeline changes)
- All content creators working with affected assets
- devops-engineer (if build pipeline is affected)

## Anti-Patterns to Avoid

1. **Bypassing the hierarchy**: A specialist agent should never make decisions
 that belong to their lead without consultation.
2. **Cross-domain implementation**: An agent should never modify files outside
 their designated area without explicit delegation from the relevant owner.
3. **Shadow decisions**: All decisions must be documented. Verbal agreements
 without written records lead to contradictions.
4. **Monolithic tasks**: Every task assigned to an agent should be completable
 in 1-3 days. If it is larger, it must be broken down first.
5. **Assumption-based implementation**: If a spec is ambiguous, the implementer
 must ask the specifier rather than guessing. Wrong guesses are more expensive
 than a question.
