# Source Directory

This is where the application source code lives.

## Layout (Next.js + Supabase default)

```
src/
  app/                # Next.js App Router (pages, layouts, route handlers)
  components/         # React components, organized by feature
    ui/               # design-system primitives (from component-library)
    [feature]/        # feature-scoped components
  lib/                # shared libraries (DB clients, utilities, helpers)
  server/             # server-only code (server actions, server components)
  api/                # REST/RPC handlers if not using server actions
  styles/             # global styles (rarely used; Tailwind is preferred)
```

For React + Node-API or NestJS-Enterprise families, the layout differs.
See `.claude/docs/technical-preferences.md` for the active layout.

## Coding Standards

Path-scoped rules apply automatically:
- `src/components/ui/**` — design system rules (`.claude/rules/ui-code.md`)
- `src/api/**`, `src/server/**` — API/server rules (`.claude/rules/api-code.md`)
- `src/lib/**` — shared library rules (`.claude/rules/data-files.md` if data)

When in doubt, run `/code-review` before merging.

## What Not to Put Here

- PRDs (those go in `design/prd/`)
- Sprint plans (those go in `production/sprints/`)
- Generated artifacts (those go in `dist/` or `build/`)
- Secrets (use environment variables; see `.claude/docs/setup-requirements.md`)
