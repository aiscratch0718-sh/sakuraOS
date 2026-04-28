---
paths:
 - "src/lib/**"
 - "src/server/lib/**"
 - "src/middleware.ts"
 - "src/server/auth/**"
 - "src/server/db/**"
 - "src/server/queue/**"
 - "src/server/audit/**"
---

# Platform Code Rules

Rules for cross-cutting infrastructure: auth, multi-tenancy, audit log,
background jobs, database access layer, configuration, observability.
Feature code lives in `src/features/` and is governed by `feature-code.md`.

- **Auth middleware is mandatory** for every protected route. Routes that opt
  out must be explicitly marked (e.g., `/api/health`, `/api/webhooks/<vendor>`)
  and documented in an ADR
- **Multi-tenancy invariant**: every database query that touches tenant-owned
  rows MUST scope by `tenant_id`. The query builder / ORM layer should make
  unscoped queries impossible to write (RLS enforcement, repository pattern,
  or middleware injection)
- **Audit log writes are required** for every state change that affects
  billing, permissions, or user-visible records. Audit writes happen in the
  same transaction as the change — no fire-and-forget audit
- **Background work goes through the queue**, never `setTimeout` /
  `setInterval` in process. Workers must be idempotent — receiving the same
  job twice must not double-apply
- **Configuration access goes through a typed schema** (Zod, `@nestjs/config`
  with validation). No `process.env.X` reads scattered across the codebase
- **Logging must be structured** (key/value JSON), not freeform `console.log`.
  Every log line includes `tenant_id`, `request_id`, `user_id` where available
- **Public platform APIs are versioned**. Breaking changes require a deprecation
  period and a migration guide
- **Before using framework APIs**, consult `docs/framework-reference/` for the
  pinned version and check `breaking-changes.md` / `deprecated-apis.md`
- **Secrets never appear in code or logs**. Read from a secret manager;
  redact in log middleware

## Examples

**Correct** (scoped query through the repository, audit in the same txn):

```typescript
// src/server/lib/billing-repo.ts
export class BillingRepo {
  constructor(private tx: Prisma.TransactionClient, private ctx: TenantCtx) {}

  async cancelInvoice(invoiceId: string, actor: ActorRef) {
    const updated = await this.tx.invoice.update({
      where: { id: invoiceId, tenantId: this.ctx.tenantId },
      data: { status: 'CANCELED' },
    });
    await this.tx.auditLog.create({
      data: {
        tenantId: this.ctx.tenantId,
        actorId: actor.id,
        action: 'invoice.cancel',
        targetId: invoiceId,
      },
    });
    return updated;
  }
}
```

**Incorrect** (cross-tenant leak + missing audit + fire-and-forget):

```typescript
async function cancelInvoice(invoiceId: string) {
  // VIOLATION: no tenantId scoping — any tenant's invoice could be canceled
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'CANCELED' },
  });
  // VIOLATION: audit happens outside transaction; can fail silently
  fetch('/api/audit', { method: 'POST', body: JSON.stringify({ invoiceId }) });
  // VIOLATION: in-process timer for follow-up; lost on restart
  setTimeout(() => sendCancellationEmail(invoiceId), 5000);
}
```
