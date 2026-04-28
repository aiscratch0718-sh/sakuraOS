# NestJS — Persistence Module Reference

ORM choice (TypeORM / Prisma / Drizzle), repository pattern, transactions,
migrations, query builders, performance pitfalls (N+1, eager joins).

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Pick **one** ORM and stay with it
- Repositories live in their own module; services depend on repositories,
  not the ORM client directly
- All schema changes go through migrations — never `synchronize: true` in
  production
- Wrap multi-write operations in a transaction; the ORM's transaction
  helper threads the transactional client through repositories
- Watch for N+1 queries on list endpoints — use eager loading or DataLoader

> Last verified: [TO BE CONFIGURED]
