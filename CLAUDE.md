# Claude Code Web Studio -- B2B Web/SaaS Agent Architecture

B2B web/SaaS development managed through 49 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

> **Revenue model assumption**: B2B contract-based — monthly invoicing, bank
> transfer, no subscription/auto-billing. There is no Stripe scaffolding in
> this template. If you need self-serve billing later, add it as a
> deliberate, scoped feature (and update `.claude/docs/technical-preferences.md`).

## Technology Stack

- **Framework family**: [CHOOSE: Next.js / React + Node / NestJS-Enterprise]
- **Language**: TypeScript (default; switch to JS only with explicit decision)
- **Database**: [CHOOSE: Supabase Postgres / Prisma + Postgres / Other]
- **Auth**: [CHOOSE: Supabase Auth / Auth.js / Clerk / Custom]
- **Version Control**: Git with trunk-based development
- **CI/CD**: [SPECIFY after choosing the framework family]
- **Hosting**: [SPECIFY after choosing the framework family]

> **Note**: Framework-specialist agents exist for the Next.js family, the React
> + Node family, and the NestJS-Enterprise family, with dedicated
> sub-specialists. Use the set matching the family you pick. The default
> recommendation for new B2B SaaS is **Next.js + Supabase**.

## Project Structure

@.claude/docs/directory-structure.md

## Framework Version Reference

@docs/framework-reference/nextjs/VERSION.md

## Technical Preferences

@.claude/docs/technical-preferences.md

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -