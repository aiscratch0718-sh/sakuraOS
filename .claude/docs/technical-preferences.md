# Technical Preferences

<!-- Pinned 2026-04-28 for さくら株式会社業務管理システム (SAKURA OS) -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Framework & Language

- **Framework Family**: Next.js (App Router)
- **Framework Version**: Next.js 15.x (latest stable as of 2026-04 — verify via /setup-stack refresh)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase Postgres (RLS-first multi-tenant pattern)
- **Auth**: Supabase Auth + 2FA (TOTP) — required for all roles
- **Styling**: Tailwind CSS + tailwind-variants for component variants
- **Background jobs**: Supabase Edge Functions + pg_cron + a queue (BullMQ if a Node worker is added)
- **Realtime**: Supabase Realtime (Postgres CDC) for in-app dashboards; LINE WORKS for external alerts

## Target Surfaces

- **Target Surfaces**: Web (mobile) for 作業員・現場リーダー; Web (desktop) for 事務・社長
- **Input Methods**: Touch (primary on mobile), Keyboard + Mouse (desktop)
- **Primary Input**: Touch on `/sp/*` routes; Keyboard + Mouse on `/pc/*` routes
- **Touch Support**: Full (mobile workflows are first-class)
- **Browser Support**: last 2 versions of evergreen browsers; iOS Safari 16+, Chrome Mobile 110+
- **Platform Notes**:
  - GPS access on mobile required (打刻・工具スキャン・車両運行)
  - PWA install supported on Android (作業員のホーム画面追加)
  - Camera access required (写真記録・QRスキャン・アルコールチェック)

## Naming Conventions

- **Files**: kebab-case for files, PascalCase for components
- **Variables**: camelCase
- **Components**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Database tables**: snake_case (Postgres convention)
- **Domain events**: `feature.action` (e.g., `report3.submitted`, `invoice.issued`, `vehicle.gps_received`)
- **Server Actions**: verb-noun (`submitReport3`, `applyDiscount`, `approveCoinTransfer`)
- **Routes**:
  - `app/(authenticated)/sp/*` — mobile-first 作業員・現場リーダー surfaces
  - `app/(authenticated)/pc/*` — desktop 事務・社長 surfaces
  - `app/(authenticated)/admin/*` — system admin (system role only)

## Performance Budgets

- **TTFB (authenticated, p95)**: ≤ 600ms
- **LCP (p75)**:
  - Mobile (sp/* on 4G): ≤ 2.5s
  - Desktop dashboards: ≤ 2.0s
- **INP (p75)**: ≤ 200ms
- **CLS (p75)**: ≤ 0.1
- **JS bundle per route (gzipped)**:
  - Mobile sp/report3 entry route: ≤ 90 KB
  - Dashboard routes: ≤ 200 KB
- **Database query budget per request**: ≤ 8 queries on a page render (use joins; avoid N+1)

## Testing

- **Unit / Integration framework**: Vitest
- **E2E framework**: Playwright (`pnpm test:e2e`)
- **Minimum Coverage**: 80% on `src/features/**` and `src/server/**`; no coverage requirement on `src/components/**` (visual regression instead)
- **Required Tests**:
  - REPORT3 atomicity (write → 5系統 fanout → all rollback together on failure)
  - Multi-tenant scoping (every read/write scoped by `tenant_id` — single-tenant for SAKURA, but pattern enforced for future SaaS expansion)
  - Auth flows (sign-in, 2FA, session refresh, role-based redirect)
  - Money Forward webhook handlers (idempotency, signature verification)

## Forbidden Patterns

- **No data input outside REPORT3 / マスタ更新画面 / 見積・請求画面** — every other "input" must derive from these three (Design Principle #1)
- **Accounting / billing / payroll outside Money Forward** — never persist accounting state in this system (Design Principle #2)
- **No direct DB writes from UI components** — all mutations go through Server Actions
- **No `getSession()` in Server Components** — always `auth.getUser()` for verified server-side auth
- **No `fetch()` to internal APIs from Server Components** — call the service layer directly
- **No raw `<img>` for content images** — always `next/image`
- **No `tabindex > 0`** — DOM order is the focus order

## Allowed Libraries / Dependencies

- `@supabase/ssr` — required for cookie-based auth across Server / Client Components
- `react-hook-form` + `zod` + `@hookform/resolvers/zod` — all form handling
- `@tanstack/react-query` — client-side server-state for the few interactive widgets that need optimistic updates (most data fetched in Server Components)
- `tailwind-variants` — component variant composition
- `date-fns-tz` — timezone-aware date handling (Asia/Tokyo by default)
- `decimal.js` — financial / cost calculations (never native float)
- (External) Money Forward, Google Maps Platform, LINE WORKS, Cloud Sign — API-integration only

## Architecture Decisions Log

- **ADR-0001**: REPORT3 atomic fanout — see `docs/architecture/adr-0001-report3-atomic-fanout.md`
- (further ADRs added as `/architecture-decision` is run)

## Framework Specialists

- **Primary**: nextjs-specialist
- **Language / Code Specialist**: typescript-specialist
- **Routing Specialist**: app-router-specialist
- **UI Specialist**: component-library-specialist
- **Mutation Specialist**: server-actions-specialist
- **Styling Specialist**: tailwind-specialist
- **Animation Specialist**: css-animation-specialist
- **Realtime Specialist**: realtime-specialist (Supabase Realtime)
- **Asset Specialist**: cdn-asset-specialist (Cloudflare Images / Vercel)
- **Routing Notes**: Server Components by default; opt into Client Components only for: REPORT3 mobile input form, GPS/camera-using flows, the dashboard chart components, and the ししまるナビ overlay.

### File Type Routing

| File Type | Specialist to Spawn |
|-----------|---------------------|
| Server Action / mutation file | server-actions-specialist |
| Route file (`page.tsx`, `route.ts`, `layout.tsx`) | app-router-specialist |
| Component file (`*.tsx` in `components/`) | component-library-specialist |
| Tailwind config / theme tokens | tailwind-specialist |
| Animation / motion file | css-animation-specialist |
| Supabase Realtime channel handler | realtime-specialist |
| CDN / image / font config | cdn-asset-specialist |
| Money Forward / Google Maps / LINE WORKS adapter | api-engineer |
| General architecture review | nextjs-specialist |
