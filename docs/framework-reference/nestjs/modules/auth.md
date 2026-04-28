# NestJS — Authentication & Authorization Module Reference

Passport strategies, JWT, session-based auth, Guards, custom decorators
for current-user extraction, role/permission checks.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- `@nestjs/passport` for strategy plug-ins; pair with `@nestjs/jwt` for
  JWT issuance/verification
- Authentication = "who are you" (Guard checks JWT signature) vs
  Authorization = "are you allowed" (Guard checks role/policy)
- Custom `@CurrentUser()` decorator extracts the authenticated principal
  from the request
- Avoid putting auth logic in controllers — keep it in Guards and decorators

> Last verified: [TO BE CONFIGURED]
