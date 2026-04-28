# Next.js — Authentication Module Reference

Auth integration patterns. This template's default is **Supabase Auth**.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders (Supabase Auth on Next.js App Router)

- Use `@supabase/ssr` (not legacy `auth-helpers-nextjs`) for cookie-based
  session handling across Server / Client Components
- Create separate `createServerClient` / `createBrowserClient` factories in
  `lib/supabase/`
- Always call `supabase.auth.getUser()` in middleware to refresh sessions
- Never read auth state from `getSession()` in Server Components — use
  `getUser()` so the JWT is verified server-side
- Row Level Security (RLS) is the primary authorization layer — do not
  rely solely on app-level checks

## Alternatives covered (if /setup-stack chose them)

- **Auth.js** (formerly NextAuth) — providers, callbacks, JWT vs database
  sessions
- **Clerk** — `<ClerkProvider>`, middleware, `auth()` helper
- **Custom** — JWT in HTTP-only cookies, CSRF protection requirements

> Last verified: [TO BE CONFIGURED]
