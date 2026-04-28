# Agent Roster

The following agents are available. Each has a dedicated definition file in
`.claude/agents/`. Use the agent best suited to the task at hand. When a task
spans multiple domains, the coordinating agent (usually `engineering manager` or the
domain lead) should delegate to specialists.

## Tier 1 -- Leadership Agents (Opus)
| Agent | Domain | When to Use |
|-------|--------|-------------|
| `product-director` | High-level vision | Major creative decisions, pillar conflicts, tone/direction |
| `technical-director` | Technical vision | Architecture decisions, tech stack choices, performance strategy |
| `engineering manager` | Production management | Sprint planning, milestone tracking, risk management, coordination |

## Tier 2 -- Department Lead Agents (Sonnet)
| Agent | Domain | When to Use |
|-------|--------|-------------|
| `product-manager` | Product design | Mechanics, systems, progression, economy, balancing |
| `lead-engineer` | Code architecture | System design, code review, API design, refactoring |
| `design-director` | Visual direction | Style guides, design system bible, asset standards, UI/UX direction |
| `brand-director` | Audio direction | Music direction, sound palette, brand implementation strategy |
| `content-director` | Story and writing | Story arcs, information-architecture, persona design, microcopy strategy |
| `qa-lead` | Quality assurance | Test strategy, bug triage, release readiness, regression planning |
| `release-manager` | Release pipeline | Build management, versioning, changelogs, deployment, rollbacks |
| `localization-lead` | Internationalization | String externalization, translation pipeline, locale testing |

## Tier 3 -- Specialist Agents (Sonnet or Haiku)
| Agent | Domain | Model | When to Use |
|-------|--------|-------|-------------|
| `systems-analyst` | Systems design | Sonnet | Specific mechanic implementation, formula design, loops |
| `screen-designer` | Level design | Sonnet | Level layouts, pacing, workflow design, flow |
| `business-analyst` | Economy/feature tradeoff | Sonnet | Resource economies, loot tables, progression curves |
| `feature-engineer` | User-facing behavior code | Sonnet | Feature implementation, user flow systems code |
| `platform-engineer` | Framework systems | Sonnet | Core framework, rendering, physics, memory management |
| `ml-engineer` | AI systems | Sonnet | Behavior trees, pathfinding, system actor logic, state machines |
| `api-engineer` | Networking | Sonnet | Netcode, replication, lag compensation, matchmaking |
| `devx-engineer` | Dev tools | Sonnet | Editor extensions, pipeline tools, debug utilities |
| `frontend-engineer` | UI implementation | Sonnet | UI framework, screens, widgets, data binding |
| `design-systems-engineer` | Tech art | Sonnet | Stylesheets, VFX, optimization, art pipeline tools |
| `interaction-designer` | Sound design | Haiku | UI sound cues design docs, audio event lists, mixing notes |
| `content-writer` | Dialogue/lore | Sonnet | Dialogue writing, lore entries, item descriptions |
| `information-architect` | World/lore design | Sonnet | World rules, faction design, history, geography |
| `qa-engineer` | Test execution | Haiku | Writing test cases, bug reports, test checklists |
| `performance-engineer` | Performance | Sonnet | Profiling, optimization recs, memory analysis |
| `devops-engineer` | Build/deploy | Haiku | CI/CD, build scripts, version control workflow |
| `analytics-engineer` | Telemetry | Sonnet | Event tracking, dashboards, A/B test design |
| `ux-designer` | UX flows | Sonnet | User flows, wireframes, accessibility, input handling |
| `prototyper` | Rapid prototyping | Sonnet | Throwaway prototypes, mechanic testing, feasibility validation |
| `security-engineer` | Security | Sonnet | Authn / authz, multi-tenant isolation, dependency CVEs, data privacy |
| `accessibility-specialist` | Accessibility | Haiku | WCAG conformance, color independence, keyboard / touch, reduced-motion |
| `growth-engineer` | Growth ops | Sonnet | Lifecycle messaging, activation, retention, expansion experiments |
| `customer-success-manager` | Customer Comms | Haiku | Release notes, customer feedback, incident comms, customer health |

## Framework-Specific Agents (use the set matching your framework)

### Framework Leads

| Agent | Framework | Model | When to Use |
| ---- | ---- | ---- | ---- |
| `nestjs-specialist` | NestJS | Sonnet | Module decomposition, controller / service / repo split, validation pipes, guards, interceptors |
| `react-specialist` | React + Vite | Sonnet | Build / routing / state-management choice, code-splitting, perf, hook discipline |
| `nextjs-specialist` | Next.js | Sonnet | App Router architecture, rendering strategy, caching, middleware, deployment target |

### NestJS Sub-Specialists

| Agent | Subsystem | Model | When to Use |
| ---- | ---- | ---- | ---- |
| `api-gateway-specialist` | API Gateway / Public API | Sonnet | BFF / aggregation, public versioning, OpenAPI generation, rate limiting, webhook ingestion |
| `orm-specialist` | Persistence | Sonnet | ORM choice (Prisma / TypeORM / Drizzle), schemas, migrations, repositories, query perf |
| `websocket-specialist` | Realtime | Sonnet | WebSocket gateways, handshake auth, rooms / namespaces, Redis adapter, reconnection |
| `admin-ui-specialist` | Admin UI | Sonnet | Admin framework choice (react-admin / AdminJS / Refine), entity CRUD, RBAC integration |

### React + Node Sub-Specialists

| Agent | Subsystem | Model | When to Use |
| ---- | ---- | ---- | ---- |
| `realtime-specialist` | Realtime | Sonnet | WebSockets / SSE / vendor pub-sub, channel auth, reconnection, missed-event recovery |
| `css-animation-specialist` | Motion | Sonnet | CSS transitions, Framer Motion / Motion One, layout animations, reduced-motion |
| `cdn-asset-specialist` | Asset Delivery | Sonnet | CDN choice, image optimization, font hosting, cache headers, asset versioning |
| `component-library-specialist` | Components | Sonnet | Reusable component catalog, design-token integration, accessibility compliance |

### Next.js Sub-Specialists

| Agent | Subsystem | Model | When to Use |
| ---- | ---- | ---- | ---- |
| `app-router-specialist` | App Router | Sonnet | Routing tree, layouts, route groups, parallel / intercepting routes, middleware |
| `typescript-specialist` | TypeScript | Sonnet | Strict-mode config, Zod-as-source-of-truth, generics, Server / Client component types |
| `tailwind-specialist` | Tailwind / Styling | Sonnet | tailwind.config.ts, design-token mapping, dark mode, variants via cva / tailwind-variants |
| `server-actions-specialist` | Server Actions | Sonnet | Mutation handlers, form integration, idempotency, revalidation, progressive enhancement |
