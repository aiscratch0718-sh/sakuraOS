# Path-Specific Rules

Rules in `.claude/rules/` are automatically enforced when editing files in
matching paths:

| Rule File | Path Pattern | Enforces |
|-----------|--------------|----------|
| `feature-code.md` | `src/features/**`, `src/app/(features)/**`, `src/server/features/**` | Validated inputs, idempotency, tenant scoping, no hardcoded business values |
| `platform-code.md` | `src/lib/**`, `src/server/lib/**`, `src/middleware.ts`, `src/server/auth/**`, `src/server/db/**`, `src/server/queue/**`, `src/server/audit/**` | Auth invariants, multi-tenant scoping, audit log writes in-transaction, queued background work |
| `ai-code.md` | `src/server/ai/**`, `src/server/llm/**`, `src/lib/ai/**` | Bounded LLM calls, versioned prompts, evals, fallbacks, cost discipline |
| `network-code.md` | `src/server/api/**`, `src/app/api/**`, `src/server/webhooks/**`, `src/server/websocket/**` | Validated boundaries, versioned APIs, idempotency, webhook signatures, rate limits |
| `ui-code.md` | `src/components/**`, `src/app/**/*.tsx`, `src/app/**/*.jsx`, `src/ui/**` | No server-state ownership, localization-ready text, full keyboard / touch support, reduced-motion support |
| `design-docs.md` | `design/prd/**` | 8 required PRD sections, testable acceptance criteria, sourced pricing/limits |
| `data-files.md` | `config/**`, `src/config/**`, `src/server/seed/**`, `data/**` | Validated schemas, kebab-case naming, unit comments, no committed secrets |
| `test-standards.md` | `tests/**`, `src/**/*.test.ts(x)`, `src/**/*.spec.ts`, `e2e/**` | Behavioral test names, AAA structure, isolated unit tests, regression tests for fixed bugs |
| `prototype-code.md` | `prototypes/**` | Relaxed standards; README required; hypothesis documented |
