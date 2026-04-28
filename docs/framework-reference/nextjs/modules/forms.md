# Next.js — Forms & Mutations Module Reference

Server Actions, `useFormState`, `useFormStatus`, progressive enhancement,
client-side validation libraries (Zod, React Hook Form).

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Server Actions are the canonical mutation path in App Router — mark with
  `"use server"`
- `useFormState` (or `useActionState` in newer React) for surfacing
  validation errors to the UI
- `useFormStatus` for pending state in submit buttons
- Validate inputs server-side with Zod (do not trust client validation)
- Forms work without JS via progressive enhancement — `<form action={...}>`
  posts even if React hasn't hydrated

> Last verified: [TO BE CONFIGURED]
