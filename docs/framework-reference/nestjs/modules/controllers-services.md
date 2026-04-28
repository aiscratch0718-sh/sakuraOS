# NestJS — Controllers & Services Module Reference

Controller / Service / Repository separation, dependency injection,
request lifecycle, custom providers, dynamic modules.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Controllers do not contain business logic — they parse inputs and call
  services
- Services are `@Injectable()` providers; depend on repositories or other
  services, not directly on the database client
- One Controller per resource; one Service per Controller is fine to start
- Use `forwardRef()` only when circular dependencies are unavoidable —
  prefer refactoring

> Last verified: [TO BE CONFIGURED]
