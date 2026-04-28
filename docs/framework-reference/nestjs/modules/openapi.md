# NestJS — OpenAPI / Swagger Module Reference

`@nestjs/swagger` decorators, generating OpenAPI documents at build time,
CLI plugin for automatic schema inference from DTOs, exposing Swagger UI
in dev only.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Enable the Swagger CLI plugin so `@ApiProperty()` is inferred from DTO
  decorators — manual annotation is error-prone
- Group endpoints with `@ApiTags()`; document responses with
  `@ApiResponse()` for non-2xx status codes
- Expose Swagger UI at `/docs` in development; gate it behind auth or
  disable in production
- Generate the static `openapi.json` in CI for downstream client SDK
  generation

> Last verified: [TO BE CONFIGURED]
