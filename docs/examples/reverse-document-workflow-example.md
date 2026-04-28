# Reverse Documentation Workflow — Example

> Illustrative walk-through of `/reverse-document` on existing code that
> has no PRD. Names and numbers are illustrative.

---

## Setup

The team built a discount-tiers feature ahead of writing the PRD. Code
exists in `src/features/billing/discount-tiers/`. There is no
`design/prd/discount-tiers.md`. The user runs:

```
/reverse-document design src/features/billing/discount-tiers
```

---

## Conversation (compressed)

### Phase 1: Code Analysis

The skill reads every file under `src/features/billing/discount-tiers/`
and identifies:
- One service: `tier-resolver.ts` (resolves the customer's eligible tier)
- One repository method: `BillingRepo.applyTier()`
- One Server Action: `setTier(formData)`
- A typed config: `src/config/billing/tiers.json`
- Tests: `tests/unit/billing/tier-resolver.test.ts`

It infers the PRD shape:
- **Workflow**: customer or admin selects a tier; resolver validates
  eligibility (customer-tenure, contract terms); repo applies and audits
- **Formulas**: tenure threshold (90 days for "Loyal"), revenue
  threshold ($10k LTV for "Strategic")
- **Edge cases handled in code**: customer downgrades mid-cycle,
  manual admin override, tier change inside an in-flight invoice
- **Edge cases NOT handled in code**: refund on tier downgrade —
  flagged

### Phase 2: Clarifying Questions

> "I see the customer can request a tier change at any time, but the
> code does not handle refunds on downgrade. Was that:
>
> 1. An intentional decision (tier downgrades are not refundable),
> 2. A known gap (intentional but you wanted me to ask before drafting),
> 3. An oversight that should be documented as an edge case to address?"

User: "It's #1 — non-refundable per contract terms. Document that."

> "The 'Loyal' tier requires 90 days of tenure. The code reads this from
> `tiers.json`, but there's no comment explaining the unit. Confirm
> '90 days' is the unit (not hours, not weeks)?"

User: "Yes, days."

> "I see an admin override path that bypasses the eligibility check.
> Was that:
>
> 1. An intentional VIP / customer-success-driven escape hatch, or
> 2. A debug-only feature that should be flagged for production removal?"

User: "Intentional. CSMs use it for design-partner accounts. It writes
an audit log entry."

### Phase 3: Findings

Skill presents the inferred PRD before writing:

```
## Inferred PRD: discount-tiers

### Detected workflow
1. Customer or admin requests a tier change
2. Resolver checks eligibility against tier rules
3. Repository applies the tier inside a transaction
4. Audit log entry written (admin override path always; auto-approved
   path on success)

### Detected rules
- "Loyal" tier requires ≥90 days tenure (from tiers.json)
- "Strategic" tier requires ≥$10k LTV (from tiers.json)
- Admin override bypasses eligibility (audit-logged)
- Downgrade is non-refundable (per code; per user clarification)

### Missing acceptance-criteria coverage (will flag in the PRD)
- No acceptance criterion for the admin-override audit log entry
  format
- No acceptance criterion for the "downgrade-mid-cycle" billing
  behavior

### Quality notes
- ✅ Tests exist for the resolver
- ✅ Tenant-scoping enforced in the repo
- ⚠️  Magic number in resolver: `90` is read from config but the unit
   ("days") is not commented. Recommend a one-line comment.
```

### Phase 4: Draft and Write

The skill drafts `design/prd/discount-tiers.md` with all 8 required
sections, asks for approval, and writes after the user confirms.

---

## Outcome

- `design/prd/discount-tiers.md` written
- A FOLLOW-UP list captured in the PRD's Open Questions section:
  - Add acceptance criterion for admin-override audit format
  - Add acceptance criterion for downgrade-mid-cycle behavior
  - Add a one-line `// 90 days` comment in `tier-resolver.ts`
- The systems index is updated with `discount-tiers`, status "Designed"
- Recommends `/design-review design/prd/discount-tiers.md` in a fresh
  session to validate the inferred PRD against the code's actual behavior
