# React — State Management Module Reference

Local state (`useState`, `useReducer`), context, global stores (Zustand,
Jotai, Redux Toolkit). When to reach for what.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Default to `useState` / `useReducer` — don't reach for a global store
  until the same state is read in three or more unrelated places
- React Context is for *passing* values, not for high-frequency updates —
  every consumer re-renders on context change
- Server state (data from the API) belongs in TanStack Query / SWR, not in
  a global store
- Form state belongs in React Hook Form, not in a global store

> Last verified: [TO BE CONFIGURED]
