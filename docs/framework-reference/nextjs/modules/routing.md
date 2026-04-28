# Next.js — Routing Module Reference

App Router conventions, route handlers, dynamic segments, route groups,
parallel routes, intercepting routes, middleware.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- File-based routing under `app/`
- `page.tsx` = route, `layout.tsx` = nested layout, `loading.tsx`,
  `error.tsx`, `not-found.tsx` for UX states
- `route.ts` for HTTP route handlers (REST endpoints)
- Dynamic segments: `app/posts/[slug]/page.tsx`
- Route groups (do not affect URL): `app/(marketing)/`
- `middleware.ts` runs at the edge before route resolution

> Last verified: [TO BE CONFIGURED]
