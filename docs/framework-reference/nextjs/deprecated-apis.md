# Next.js — Deprecated APIs Lookup

Quick "Don't use X → Use Y" reference. Agents must consult this before
suggesting any Next.js API call when the project's pinned version exceeds
the LLM knowledge cutoff.

## Format

| Deprecated | Replacement | Since version | Notes |
|------------|-------------|---------------|-------|
| `<old API>` | `<new API>` | `<version>` | `<migration notes>` |

[TO BE POPULATED via /setup-stack]

## Common stable patterns (reminder)

- App Router (`app/`) is the recommended router for new projects since
  Next.js 13.4. Pages Router (`pages/`) remains supported but is in
  maintenance mode.
- `next/image` for optimized images (not raw `<img>`).
- `next/link` for client-side navigation (not raw `<a>` for internal links).
- Server Components by default in `app/`; opt into Client Components with
  `"use client"`.

> Last verified: [TO BE CONFIGURED]
