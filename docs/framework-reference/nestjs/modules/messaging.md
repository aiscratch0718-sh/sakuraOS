# NestJS — Messaging & Background Jobs Module Reference

BullMQ / `@nestjs/bull` queues, microservices transport (Redis, NATS,
Kafka, gRPC), event emitter, scheduled jobs (`@nestjs/schedule`).

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Background work goes through a queue, not `setTimeout` or in-process
  promises — restarts must not lose jobs
- Idempotency keys on every job — workers may be re-run on transient
  failures
- Schedule cron jobs via `@Cron()` decorator from `@nestjs/schedule` —
  document the cron expression in code comments
- For cross-service messaging at scale, prefer microservices transport
  (NATS / Kafka) over HTTP

> Last verified: [TO BE CONFIGURED]
