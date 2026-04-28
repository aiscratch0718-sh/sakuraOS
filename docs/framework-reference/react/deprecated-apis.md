# React + Node — Deprecated APIs Lookup

"Don't use X → Use Y" reference. Agents must consult this before suggesting
any React or backend framework API call when the project's pinned version
exceeds the LLM knowledge cutoff.

## Format

| Deprecated | Replacement | Since version | Notes |
|------------|-------------|---------------|-------|
| `<old API>` | `<new API>` | `<version>` | `<migration notes>` |

[TO BE POPULATED via /setup-stack]

## Common stable patterns (reminder)

- Function components + hooks (class components are legacy, but supported)
- `createRoot()` (not `ReactDOM.render`) for mounting
- `useEffect` with proper cleanup; avoid effects for derived state
- Controlled inputs unless there's a strong reason for uncontrolled
- React Router (or TanStack Router) for SPA routing — pick one

> Last verified: [TO BE CONFIGURED]
