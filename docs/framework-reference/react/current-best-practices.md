# React + Node — Current Best Practices

Patterns correct in the project's pinned versions but not necessarily in
the LLM's training data.

[TO BE POPULATED via /setup-stack]

## Stable defaults

- TypeScript strict mode
- React Query (TanStack Query) or SWR for server state caching on the
  client
- React Hook Form + Zod for forms and validation
- Single source of truth for API contracts (e.g. OpenAPI, tRPC, or
  hand-written shared types)
- Cookie-based session auth with `httpOnly; secure; sameSite=lax` over
  localStorage tokens
- CORS configured strictly (allowlist origins, not `*` for credentialed
  requests)

## Backend framework notes

- **Express**: still the default, but middleware ordering and async error
  handling remain footguns — use `express-async-errors` or wrap handlers
- **Fastify**: schema-first; register plugins via `fastify.register()`
- **Hono**: edge-runtime friendly; minimal API surface

> Last verified: [TO BE CONFIGURED]
