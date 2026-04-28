# NestJS — Current Best Practices

Patterns correct in the project's pinned NestJS version but not necessarily
in the LLM's training data.

[TO BE POPULATED via /setup-stack]

## Stable defaults

- TypeScript strict mode
- One module per bounded context (DDD-aligned), not one module per file
- Configuration via `@nestjs/config` with `validationSchema`
- Database access through TypeORM, Prisma, or Drizzle (pick one)
- OpenAPI generation via `@nestjs/swagger` decorators
- Logging via `nestjs-pino` or built-in `Logger` — never `console.log`
- Background work via BullMQ or `@nestjs/bull`, never `setTimeout`

> Last verified: [TO BE CONFIGURED]
