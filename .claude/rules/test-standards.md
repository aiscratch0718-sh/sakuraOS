---
paths:
 - "tests/**"
 - "src/**/*.test.ts"
 - "src/**/*.test.tsx"
 - "src/**/*.spec.ts"
 - "e2e/**"
---

# Test Standards

- Test naming describes the behavior in plain English. Use Vitest / Jest
  `describe` + `it("returns X when Y")`, or Playwright `test("user X can do Y")`.
  Avoid cryptic names like `test_thing_works`
- Every test follows arrange / act / assert. The arrange block is explicit;
  hidden global state is a code smell
- Unit tests must NOT depend on external state (filesystem, network,
  database). Mock at the boundary
- Integration tests run against a real database in a transaction that rolls
  back at teardown. They MUST clean up after themselves — a leftover row is
  a defect
- E2E tests (Playwright / Cypress) target a fully migrated test environment.
  Each test owns its own tenant / user fixtures and tears them down
- Performance tests assert against an explicit budget (response time,
  memory, query count). A test without a numeric threshold is not a
  performance test
- Test fixtures are defined in the test or in dedicated factory functions
  (`tests/factories/`). Never share mutable global state between tests
- Mock at module boundaries (HTTP client, database client) — not deep
  inside business logic. Tests that mock too much pass even when the code
  is broken
- Every bug fix must ship with a regression test that would have caught the
  original bug. Reference the bug ID in the test description
- Do not test framework internals (e.g., that React calls `useEffect`).
  Test what the user observes
- Snapshot tests are reserved for stable visual / serialization outputs.
  A 400-line auto-generated snapshot is a maintenance hazard

## Examples

**Correct** (Vitest, Arrange / Act / Assert, named for behavior):

```typescript
describe('applyDiscount', () => {
  it('rejects discount rates above the policy maximum', async () => {
    // Arrange
    const tenant = await tenantFactory.create();
    const invoice = await invoiceFactory.create({ tenantId: tenant.id });

    // Act
    const result = applyDiscount({
      tenantId: tenant.id,
      invoiceId: invoice.id,
      rate: 0.95,
      idempotencyKey: 'k1',
    });

    // Assert
    await expect(result).rejects.toThrow('discount.rate.exceeds-policy-max');
  });
});
```

**Incorrect**:

```typescript
test('test1', () => { // VIOLATION: cryptic name
  const x = applyDiscount({ rate: 0.95 }); // VIOLATION: no arrange, untyped
  expect(x).toBeTruthy(); // VIOLATION: imprecise assertion
});
```
