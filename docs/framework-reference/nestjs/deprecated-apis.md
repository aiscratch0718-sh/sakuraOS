# NestJS — Deprecated APIs Lookup

"Don't use X → Use Y" reference. Agents must consult this before suggesting
any NestJS API call when the project's pinned version exceeds the LLM
knowledge cutoff.

[TO BE POPULATED via /setup-stack]

## Common stable patterns (reminder)

- Module → Controller → Service / Provider hierarchy
- DTOs with `class-validator` + `ValidationPipe` for request validation
- `@Injectable()` providers; constructor-injected dependencies
- Guards for authn/authz; Interceptors for cross-cutting transforms
- Exception filters for centralized error mapping

> Last verified: [TO BE CONFIGURED]
