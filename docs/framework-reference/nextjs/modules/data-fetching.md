# Next.js — Data Fetching Module Reference

Server Components data access, fetch caching, Server Actions, revalidation,
streaming with Suspense, route segment config.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Fetch directly inside Server Components — no need for SWR/React Query on
  the server
- `fetch()` in App Router supports `cache` and `next: { revalidate, tags }`
- Server Actions handle mutations from forms; mark file with `"use server"`
- `revalidatePath()` / `revalidateTag()` to invalidate cached data
- Stream slow data with `<Suspense>` + `loading.tsx`

> Last verified: [TO BE CONFIGURED]
