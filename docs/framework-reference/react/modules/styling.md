# React — Styling Module Reference

CSS Modules, Tailwind CSS, CSS-in-JS (styled-components, emotion, vanilla-
extract), animation libraries (Framer Motion).

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Pick one strategy per project — mixing CSS Modules + Tailwind + a
  CSS-in-JS library makes design system enforcement painful
- Tailwind requires a `content` glob covering every file that uses classes
- CSS-in-JS adds runtime cost — measure before adopting on perf-sensitive
  surfaces
- Prefer the `prefers-reduced-motion` media query for any animation longer
  than 200ms

> Last verified: [TO BE CONFIGURED]
