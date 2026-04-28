---
name: test-helpers
description: "Generate framework-specific test helper libraries for the project's test suite. Reads existing test patterns and produces `tests/helpers/` with assertion utilities, factory functions, and mock objects tailored to the project's systems. Reduces boilerplate in new test files."
argument-hint: "[system-name | all | scaffold]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
---

# Test Helpers

Writing test cases is faster and more consistent when common setup, teardown,
and assertion patterns are abstracted into helpers. This skill generates a
`tests/helpers/` library tailored to the project's actual framework family,
language, and systems — so every developer writes less boilerplate and more
assertions.

**Output:** `tests/helpers/` directory with framework-specific helper files

**When to run:**
- After `/test-setup` scaffolds the framework (first time)
- When multiple test files repeat the same setup boilerplate
- When starting to write tests for a new system

---

## 1. Parse Arguments

**Modes:**
- `/test-helpers [system-name]` — generate helpers for a specific system
  (e.g., `/test-helpers billing`)
- `/test-helpers all` — generate helpers for all systems with test files
- `/test-helpers scaffold` — generate only the base helper library (no
  system-specific helpers); use this on first run
- No argument — run `scaffold` if no helpers exist, else `all`

---

## 2. Detect Framework Family and Language

Read `.claude/docs/technical-preferences.md` and extract:
- `Framework Family:` value (`Next.js` / `React + Node` / `NestJS-Enterprise`)
- `Language:` value (default: TypeScript)
- `Database:` value (Postgres + Prisma / TypeORM / Drizzle / Other)
- Testing framework from the Testing section (Vitest / Jest / Playwright)

If the framework family is not configured:
> "Framework not configured. Run `/setup-stack` first."

---

## 3. Load Existing Test Patterns

Scan the test directory for patterns already in use:

- Glob `tests/**/*.test.ts`, `tests/**/*.spec.ts`, `e2e/**/*.spec.ts`
- Grep for repeated `beforeEach`, factory-style helpers, mock setups
- Note: any common DB-cleanup pattern, any common HTTP-mock pattern

If the project uses a custom testing convention not detected, ask the user for
clarification before generating helpers that conflict.

---

## 4. Generate Framework-Specific Helpers

Generate the base helper library tailored to the framework family.

### Next.js (Vitest + Playwright)

`tests/helpers/factories.ts` — typed factories for entities

```typescript
import { faker } from "@faker-js/faker";
import type { User, Tenant, Invoice } from "@/server/db/types";

export function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: crypto.randomUUID(),
    name: faker.company.name(),
    plan: "pro",
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    email: faker.internet.email(),
    tenantId: crypto.randomUUID(),
    role: "member",
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: crypto.randomUUID(),
    tenantId: crypto.randomUUID(),
    amountCents: 9900,
    status: "open",
    issuedAt: new Date(),
    ...overrides,
  };
}
```

`tests/helpers/db.ts` — transactional test wrapper

```typescript
import { prisma } from "@/server/db";

/** Run `fn` inside a transaction that rolls back at teardown. */
export async function withRollback<T>(fn: (tx: typeof prisma) => Promise<T>): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    const result = await fn(tx as typeof prisma);
    throw new RollbackSignal(result); // signal rollback after the work is done
  }).catch((e) => {
    if (e instanceof RollbackSignal) return e.value;
    throw e;
  });
}

class RollbackSignal<T> extends Error { constructor(public value: T) { super("__rollback__"); } }
```

`tests/helpers/http.ts` — Server Action / route handler test client

```typescript
import { createMocks } from "node-mocks-http";

export function mockRequest(overrides: Parameters<typeof createMocks>[0] = {}) {
  return createMocks({ method: "POST", ...overrides });
}
```

`tests/helpers/assertions.ts` — domain assertions

```typescript
import { expect } from "vitest";

/** Assert a value is in the inclusive range [min, max]. */
export function expectInRange(value: number, min: number, max: number) {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/** Assert an audit log entry was written for a given action. */
export async function expectAuditLog(
  prisma: typeof import("@/server/db").prisma,
  predicate: { tenantId: string; action: string; targetId?: string },
) {
  const entry = await prisma.auditLog.findFirst({ where: predicate });
  expect(entry, `audit entry for ${predicate.action} not found`).not.toBeNull();
}
```

### React + Node (Vitest + Playwright + MSW)

`tests/helpers/factories.ts` — same shape as the Next.js factories above

`tests/helpers/msw.ts` — MSW handlers + server bootstrap

```typescript
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/me", () => HttpResponse.json({ id: "u1", email: "u1@example.com" })),
];

export const server = setupServer(...handlers);
```

`tests/helpers/render.tsx` — wrapped render for components that need
providers (TanStack Query, theme, router)

```typescript
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>, options);
}
```

### NestJS-Enterprise (Jest / Vitest with `@nestjs/testing` + supertest)

`tests/helpers/app.ts` — bootstraps an `INestApplication` for e2e tests

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../src/app.module";

export async function bootstrapTestApp(): Promise<INestApplication> {
  const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return app;
}
```

`tests/helpers/auth.ts` — issues JWTs / session cookies for test users

```typescript
import { sign } from "jsonwebtoken";
export function makeJwt(payload: object, secret = process.env.TEST_JWT_SECRET ?? "test-secret") {
  return sign(payload, secret);
}
```

`tests/helpers/db.ts` — transactional test wrapper for the chosen ORM
(Prisma / TypeORM / Drizzle); same pattern as the Next.js variant

---

## 5. Generate System-Specific Helpers

When `/test-helpers [system-name]` is invoked, read
`design/prd/[system-name].md` to learn the system's domain shape, then generate:

`tests/helpers/[system-name].ts` — factories and assertions specific to that
system. Example for `billing`:

```typescript
import { faker } from "@faker-js/faker";

export function makeDiscountInput(overrides = {}) {
  return {
    invoiceId: crypto.randomUUID(),
    rate: 0.1,
    idempotencyKey: faker.string.uuid(),
    ...overrides,
  };
}

/** Assert the final amount is consistent with the PRD formula. */
export function expectDiscountedAmount(subtotal: number, rate: number, final: number) {
  const expected = Number((subtotal * (1 - rate)).toFixed(2));
  expect(final).toBe(expected);
}
```

Reference the PRD requirement TR-IDs in the helper file's header so reviewers
can trace assertions back to the specification.

---

## 6. Write Output

Present the planned helper files in conversation:

```
Test Helpers to Create
======================
tests/helpers/factories.ts
tests/helpers/db.ts
tests/helpers/http.ts (Next.js) | tests/helpers/msw.ts (React+Node) | tests/helpers/app.ts (NestJS)
tests/helpers/assertions.ts
[plus per-system helpers if requested]
```

Ask: "May I write these files?"

Write only after approval. Existing helper files are not overwritten without
explicit confirmation.

---

## Collaborative Protocol

- **Never overwrite an existing helper without asking** — show the diff first
- **Match existing test conventions** — if the project uses `describe.each`
  patterns, factories should produce data that fits those patterns
- **Helpers should compose** — a per-system helper builds on the base
  factories, never duplicates them
- **Document where each helper is used** — add a one-line comment showing the
  test files that consume the helper

---

## Next Steps

After helpers are generated:

- Refactor existing tests to use the new helpers (optional, safe)
- Run the test suite to confirm nothing broke (`npm test` / `pnpm test`)
- Run `/test-evidence-review` to confirm story acceptance criteria still pass
