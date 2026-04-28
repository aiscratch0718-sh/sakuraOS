---
paths:
 - "src/components/**"
 - "src/app/**/*.tsx"
 - "src/app/**/*.jsx"
 - "src/ui/**"
---

# UI Code Rules

- UI must NEVER own or directly mutate server state — render from server data;
  trigger mutations through Server Actions, API calls, or a typed client SDK
- All user-facing text must go through the localization system — no hardcoded
  user-facing strings (placeholders for empty states, error messages, button
  labels, table headers all flow through i18n)
- Support keyboard, mouse, and touch for every interactive element. Tab order
  must follow visual order; every interactive element must have a visible
  focus indicator
- All animations longer than 200ms must respect `prefers-reduced-motion: reduce`
  — fall back to instant transition or cross-fade
- Notification cues (toasts, banners) trigger through the central notification
  dispatcher, not by ad-hoc inline state. ARIA live regions wrap dynamic
  announcements (`polite` for routine, `assertive` for errors only)
- UI must never block the main thread. Long work runs in a Server Action,
  Web Worker, or background job — not in a render path
- Color is never the only indicator of state. Pair color with text, icon, or
  shape. Color contrast meets the committed accessibility tier
- Test every screen at the smallest and largest supported viewports; verify
  no horizontal scroll appears below 320 CSS px width
- Touch targets are at least 44×44 CSS px on touch viewports
- Server Components are the default in Next.js App Router; opt into Client
  Components with `"use client"` only when interactivity, browser APIs, or
  refs require it
