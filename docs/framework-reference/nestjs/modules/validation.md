# NestJS — Validation Module Reference

`class-validator` + `class-transformer` DTOs, `ValidationPipe` global
configuration, custom validators, sanitization.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Apply `ValidationPipe` globally in `main.ts` with `whitelist: true,
  forbidNonWhitelisted: true, transform: true`
- DTOs are classes (not interfaces) so decorators survive runtime
- `@Type(() => Date)` to coerce string → Date during transform
- Use a single DTO per request shape — avoid `Partial<UpdateDto>` shortcuts
  that bypass validation

> Last verified: [TO BE CONFIGURED]
