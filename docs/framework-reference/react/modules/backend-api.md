# React + Node — Backend API Module Reference

Building REST / RPC APIs in Node.js (Express, Fastify, Hono). Request
validation, error handling, auth middleware, OpenAPI generation.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Validate every request body / query / params with Zod (or framework-
  native schema) — never trust client input
- Centralize error handling — return consistent error shapes
  (`{ error: { code, message, details? } }`)
- Auth middleware sits *before* business logic, not inside route handlers
- Rate limit at the edge or middleware layer — not per-handler
- Generate OpenAPI from code (Zod → OpenAPI, or `@fastify/swagger`) so the
  contract cannot drift from the implementation

> Last verified: [TO BE CONFIGURED]
