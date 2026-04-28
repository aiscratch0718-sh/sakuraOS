# Next.js — Caching Module Reference

The four cache layers (Request Memoization, Data Cache, Full Route Cache,
Router Cache), `revalidatePath`, `revalidateTag`, `unstable_cache`, opt-in
vs opt-out caching across Next.js versions.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Why this gets its own module

Caching defaults have changed across Next.js major versions (notably the
shift from cache-by-default to opt-in caching). The LLM may suggest
patterns from the wrong era — always verify against the pinned version.

## Quick reminders

- `fetch()` cache behavior depends on Next.js version — verify
- Tag-based revalidation: `fetch(url, { next: { tags: ['posts'] } })` then
  `revalidateTag('posts')`
- Path-based revalidation: `revalidatePath('/dashboard')`
- `unstable_cache` wraps non-fetch data (e.g. database queries) with the
  Data Cache
- Router Cache lives client-side — `router.refresh()` clears it

> Last verified: [TO BE CONFIGURED]
