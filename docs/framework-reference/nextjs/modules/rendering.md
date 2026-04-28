# Next.js — Rendering Module Reference

Server vs Client Components, streaming, static / dynamic / ISR rendering,
PPR (Partial Prerendering), `generateStaticParams`, `dynamic` config.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- App Router: Server Components by default; opt into client with `"use client"`
- A Client Component cannot import a Server Component as a child by name —
  pass it as `children` instead
- Static rendering is the default; use `dynamic = "force-dynamic"` to
  opt into request-time rendering when needed
- `generateStaticParams` for static dynamic routes
- Partial Prerendering (PPR) blends static shell + dynamic holes — check
  the version's stability status

> Last verified: [TO BE CONFIGURED]
