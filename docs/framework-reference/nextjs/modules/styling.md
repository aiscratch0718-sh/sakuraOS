# Next.js — Styling Module Reference

CSS strategies in App Router: Tailwind CSS (template default), CSS Modules,
global CSS, CSS-in-JS limitations on Server Components.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Tailwind CSS is the template default — configure in `tailwind.config.ts`,
  import via `app/globals.css`
- CSS Modules (`*.module.css`) work in both Server and Client Components
- Most CSS-in-JS libraries (styled-components, emotion classic) require
  Client Components — they do not run in Server Components without
  framework-specific adapters
- `next/font` for self-hosted, optimized web fonts (no layout shift)
- `next/image` with proper `sizes` attribute for responsive images

> Last verified: [TO BE CONFIGURED]
