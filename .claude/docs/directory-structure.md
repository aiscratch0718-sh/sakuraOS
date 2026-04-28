# Directory Structure

```text
/
├── CLAUDE.md                  # Master configuration
├── .claude/                   # Agent definitions, skills, hooks, rules, docs
├── src/                       # Application source code
│   ├── app/                   # Next.js App Router (or pages/ for Pages Router)
│   ├── components/            # Reusable UI components (ui/ primitives, blocks/)
│   ├── features/              # Feature modules (one bounded context per folder)
│   ├── lib/                   # Shared client / server utilities
│   └── server/                # Server-only modules (auth, db, queue, audit, api)
├── design/                    # Design documents
│   ├── prd/                   # Product Requirement Documents
│   ├── ux/                    # UX specs, dashboard, interaction patterns
│   ├── brand/                 # Voice and tone, positioning
│   ├── content/               # Content architecture (Diátaxis split, taxonomy)
│   ├── design-system/         # Tokens, components catalog
│   ├── commercial/            # Pricing tiers, entitlements, usage limits
│   └── registry/              # Domain entity registry, glossary, state machines
├── docs/                      # Technical documentation
│   ├── architecture/          # ADRs, traceability matrix, control manifest
│   └── framework-reference/   # Curated framework API snapshots (version-pinned)
├── tests/                     # Test suites (unit, integration, e2e, performance)
├── tools/                     # Build and pipeline tools (ci, scripts)
├── prototypes/                # Throwaway prototypes (isolated from src/)
└── production/                # Production management
    ├── sprints/               # Sprint plans
    ├── milestones/            # Milestone reviews
    ├── releases/              # Release notes per version
    ├── customer-comms/        # Customer-facing communications
    ├── qa/                    # QA evidence, bug tracking
    ├── session-state/         # Ephemeral session state (active.md — gitignored)
    └── session-logs/          # Session audit trail (gitignored)
```
