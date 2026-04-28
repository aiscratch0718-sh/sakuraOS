---
paths:
 - "src/features/**"
 - "src/app/(features)/**"
 - "src/server/features/**"
---

# Feature Code Rules

Rules for code that implements business features (workflows, domain logic,
user-facing flows). UI components belong in `ui-code.md`; cross-cutting
infrastructure belongs in `platform-code.md`.

- All tunable values (limits, thresholds, prices, retry counts, timeouts) MUST
  come from typed config / env / database — NEVER hardcoded inline
- Validate every external input at the boundary with Zod (or `class-validator`
  for NestJS) — never trust client-supplied data inside the feature
- Mutations MUST be idempotent or carry an idempotency key — workers and
  retried requests should never double-apply
- Multi-tenant code MUST scope every read and write by `tenant_id` (or
  equivalent). Cross-tenant access is a security defect, not a feature.
- No direct DOM / framework UI imports inside business logic — keep server
  logic and UI components in separate modules
- Cross-feature communication goes through typed events or a shared service
  layer — features must not import each other's internals
- Every feature must implement a clear, typed contract (input DTO → output
  type → emitted events) that survives refactoring
- State machines (e.g., subscription status, document status) must have an
  explicit transition table; illegal transitions throw, not silently no-op
- Write unit tests for the pure logic; integration tests for the boundary
- Reference the PRD requirement ID (e.g., `TR-BILL-014`) in code comments only
  where the requirement is non-obvious from the surrounding code

## Examples

**Correct** (data-driven, validated, scoped):

```typescript
// src/features/billing/apply-discount.ts
import { z } from 'zod';
import { discountConfig } from '@/config/billing';

const ApplyDiscountInput = z.object({
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  customerId: z.string().uuid(),
  idempotencyKey: z.string().min(1),
});

export async function applyDiscount(rawInput: unknown) {
  const input = ApplyDiscountInput.parse(rawInput);
  const cap = discountConfig.maxDiscountRate; // from config, not inline 0.5
  return await db.transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id: input.invoiceId, tenantId: input.tenantId },
    });
    if (!invoice) throw new NotFoundError('invoice');
    // ...
  });
}
```

**Incorrect** (hardcoded, unvalidated, unscoped):

```typescript
export async function applyDiscount(invoiceId, rate) {
  if (rate > 0.5) return; // VIOLATION: magic number, silent no-op
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  // VIOLATION: no tenant scoping — cross-tenant read possible
  // VIOLATION: no idempotency — retried request applies the discount twice
  await db.invoice.update({
    where: { id: invoiceId },
    data: { discountRate: rate },
  });
}
```
