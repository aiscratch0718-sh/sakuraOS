---
paths:
 - "src/server/api/**"
 - "src/app/api/**"
 - "src/server/webhooks/**"
 - "src/server/websocket/**"
---

# Network Code Rules

Applies to HTTP API routes, Server Actions, websocket handlers, webhook
endpoints, and external HTTP clients.

- The server is AUTHORITATIVE for every business-critical state change —
  never trust client-supplied authorization, prices, or identifiers
- Every public API endpoint validates inputs at the boundary (Zod /
  `class-validator`). Reject unknown / extra fields rather than silently
  ignoring them
- Every endpoint sets an explicit auth posture: public, authenticated, or
  authenticated + role-gated. There is no "implicitly authenticated" route
- API contracts are versioned. Breaking changes go to a new version (URL,
  header, or media-type-versioned) with a deprecation period documented in
  an ADR
- Mutation endpoints are idempotent (safe to retry) or carry an explicit
  `Idempotency-Key`. Workers and clients with retry logic must never
  double-apply a mutation
- Rate limit every public endpoint, with stricter limits for unauthenticated
  routes. Document the limits in the OpenAPI spec
- Webhooks IN: verify the signature; reject without it. Process in a queue,
  not inline — return 200 fast, do the work async
- Webhooks OUT: idempotency key on the payload; retry with exponential
  backoff; record every delivery attempt in a webhook log
- Websocket / SSE handlers: authenticate at connect, re-authenticate on
  long-lived sessions, and broadcast only to authorized subscribers. Never
  fan out raw database rows — shape the event payload first
- Outbound HTTP clients set explicit timeouts (default 5–10s); never inherit
  Node's default of "no timeout"
- Rate-limit log lines from network handlers to avoid log flooding under
  attack
- Bandwidth-sensitive payloads (lists, search results) document a default
  page size and a hard maximum
- Never log full request bodies for endpoints that handle PII or secrets;
  redact in middleware
