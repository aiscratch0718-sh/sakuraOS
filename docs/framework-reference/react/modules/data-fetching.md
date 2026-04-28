# React — Data Fetching Module Reference

TanStack Query / SWR for server state, fetch wrappers, error handling,
optimistic updates, infinite queries, mutations.

[TO BE POPULATED via /setup-stack — keep under 150 lines]

## Quick reminders

- Server state ≠ client state — do not put server data in `useState`
- Centralize the fetch wrapper (auth headers, error mapping, retries)
- Use query keys consistently — encode every input that affects the result
- Invalidate with `queryClient.invalidateQueries({ queryKey })` after
  mutations
- Prefer mutations with `onMutate` for optimistic UI updates only when the
  rollback path is well-defined

> Last verified: [TO BE CONFIGURED]
