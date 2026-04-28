# Session Example: Implement Discount Calculation

> Illustrative walk-through of `/dev-story` for a Logic story implementing
> discount calculation logic. Names and numbers are illustrative; this is a
> reference for the *shape* of the conversation, not a real session log.

---

## Setup

The story file: `production/epics/billing/story-014-apply-discount.md`

Story type: **Logic** (formula-driven)
Test evidence required: automated unit test in `tests/unit/billing/`
PRD requirement: `TR-BILL-014` (from `design/prd/billing.md`)
Governing ADR: `ADR-0007` (Idempotency keys for mutation handlers)

---

## Conversation

**User**: `/dev-story production/epics/billing/story-014-apply-discount.md`

**Skill** (reads the story, PRD section, ADR, control manifest):

> Story loaded. Routing to **feature-engineer** for Logic-type
> implementation. Routing summary:
>
> - Story: Apply discount to an invoice (TR-BILL-014)
> - PRD formula: `final = subtotal × (1 − discountRate) × (1 − loyaltyRate) − flatCredit`
> - ADR-0007 governs: idempotency keys are required on every mutation
> - Control manifest version 2026-04-15: tenant scoping enforced in repo
>
> Spawning feature-engineer.

**feature-engineer** (subagent, after reading the same context):

> I have a few clarifying questions before implementing:
>
> 1. Should `discountRate` be capped at the policy maximum
>    (`pricingPolicy.maxDiscountRate`, default 0.5)?
> 2. The PRD doesn't say what happens when `flatCredit` exceeds the discounted
>    subtotal. Floor to zero? Carry the remainder to next invoice? Refuse?
> 3. Banker's rounding to 2 decimals (cents) — confirm this matches the
>    finance team's convention?

**User**: "1) yes, throw a typed error. 2) Floor to zero, never carry. 3) yes, banker's rounding."

**feature-engineer**:

> Proposed structure:
>
> ```
> src/features/billing/apply-discount.ts          # service function
> src/features/billing/discount-errors.ts          # typed error classes
> src/features/billing/billing-repo.ts             # repository (already exists; add applyDiscount method)
> tests/unit/billing/apply-discount.test.ts        # Vitest unit test
> ```
>
> The service function:
>
> ```typescript
> import { z } from "zod";
> import { applyBankersRounding } from "@/server/lib/rounding";
> import { discountConfig } from "@/config/billing";
> import { DiscountExceedsPolicyError } from "./discount-errors";
> import { domainEvents } from "@/server/lib/events";
>
> const ApplyDiscountInput = z.object({
>   tenantId: z.string().uuid(),
>   invoiceId: z.string().uuid(),
>   discountRate: z.number().min(0).max(1),
>   loyaltyRate: z.number().min(0).max(1),
>   flatCreditCents: z.number().int().min(0),
>   idempotencyKey: z.string().min(1),
> });
> export type ApplyDiscountInput = z.infer<typeof ApplyDiscountInput>;
>
> export async function applyDiscount(raw: unknown) {
>   const input = ApplyDiscountInput.parse(raw);
>   if (input.discountRate > discountConfig.maxDiscountRate) {
>     throw new DiscountExceedsPolicyError(input.discountRate, discountConfig.maxDiscountRate);
>   }
>   return await db.$transaction(async (tx) => {
>     const repo = new BillingRepo(tx, { tenantId: input.tenantId });
>     const invoice = await repo.findInvoice(input.invoiceId);
>     const discounted = invoice.subtotalCents *
>       (1 - input.discountRate) *
>       (1 - input.loyaltyRate);
>     const finalCents = applyBankersRounding(
>       Math.max(0, discounted - input.flatCreditCents),
>       0
>     );
>     await repo.applyDiscount(input.invoiceId, { finalCents, idempotencyKey: input.idempotencyKey });
>     domainEvents.emit("invoice.discount-applied", {
>       tenantId: input.tenantId,
>       invoiceId: input.invoiceId,
>       finalCents,
>     });
>     return { finalCents };
>   });
> }
> ```
>
> May I write this to the listed files?

**User**: "Yes, but use `Decimal.js` instead of native multiplication for the math — finance won't accept floating-point rounding."

**feature-engineer**:

> Good catch. Switching the math to `decimal.js`. One question: the result of
> `Decimal.mul(...).mul(...)` will be a `Decimal` instance. I'll convert to
> integer cents only at the boundary (the database stores `int` cents).
> Confirming that's the intended boundary?

**User**: "Yes."

**feature-engineer** writes the files, runs `pnpm test` locally, all tests
pass.

> Implemented. Files written:
>
> - `src/features/billing/apply-discount.ts`
> - `src/features/billing/discount-errors.ts`
> - `src/features/billing/billing-repo.ts` (added `applyDiscount` method)
> - `tests/unit/billing/apply-discount.test.ts` (covers: happy path,
>   discount-rate cap, flat-credit-exceeds-subtotal, idempotency replay)
>
> The unit test asserts the formula at the cents level for several scenarios
> drawn from the PRD's Acceptance Criteria. May I run `/code-review` next, or
> would you like to review the code first?

**User**: "Run `/code-review` then `/story-done`."

---

## Outcome

- Story marked Complete via `/story-done`
- TR-BILL-014 closed in the traceability matrix
- Audit log entry written via the domain event listener
- The next ready story in the sprint is surfaced automatically
