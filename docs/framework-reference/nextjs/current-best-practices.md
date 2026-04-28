# Next.js — Current Best Practices

Patterns that are correct in the project's pinned Next.js version but may
not be reflected in the LLM's training data. `/setup-stack` populates this
file when the version exceeds the LLM knowledge cutoff.

## Format

```
## <area> (e.g. Data Fetching, Server Actions, Caching)

- **Pattern**: <what to do>
- **Why**: <reason it replaces older guidance>
- **Example**:
  ```tsx
  // correct
  ```
- **Avoid**: <older pattern the model might suggest>
```

[TO BE POPULATED via /setup-stack]

## Stable defaults (template assumes Next.js + Supabase)

- TypeScript strict mode enabled in `tsconfig.json`
- App Router (`app/`) for new routes
- Server Components by default; Client Components only when interactivity
  or browser-only APIs are required
- Server Actions for mutations originating from forms
- Tailwind CSS for styling (this template's default)
- Supabase client in `lib/supabase/` (server / browser variants split)

> Last verified: [TO BE CONFIGURED]
