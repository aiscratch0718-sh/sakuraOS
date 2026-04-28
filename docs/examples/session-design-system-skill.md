# Session Example: Design a Notifications System

> Illustrative walk-through of `/design-system` for a workflow-heavy system.
> Names and numbers are illustrative.

---

## Setup

The system: **Notifications** — the dispatcher and channel adapters
(in-app, email, browser push, webhook OUT) that deliver event-driven
messages to customers.

Skill invocation: `/design-system notifications`

---

## Conversation (compressed)

**Skill** loads context:
- Reads `design/prd/product-concept.md` — confirms the product is
  multi-tenant SaaS, Pro and Enterprise tiers
- Reads `design/prd/systems-index.md` — finds `notifications` listed
  with priority MVP
- Reads existing PRDs in `design/prd/` to understand which features will
  emit events that need notification (billing, reporting, audit)
- Reads `docs/framework-reference/<family>/modules/messaging.md`
- Surfaces a Technical Feasibility Brief

**Skill** asks: "Ready to start designing notifications?"

**User**: "Yes."

---

### Section 1: Overview

> "The notifications system is the single dispatcher for all event-driven
> customer communication. Features emit domain events; the dispatcher fans
> them out to enrolled channels (in-app, email, optional push and webhook),
> applying frequency caps, quiet hours, and idempotency."

### Section 2: Target User & Job

JTBD:
> "When the system completes a long-running action on my behalf (export,
> import, payment), I want to know without checking, so I can act on the
> result during my next active session — but I do not want noise."

### Section 3: User Journey

The customer:
1. Sets per-channel preferences in settings
2. Triggers an action
3. Sees the in-app notification when ready (sometimes paired with email)
4. Acts on the notification or dismisses
5. Reviews older notifications in the bell tray

### Section 4: Functional Requirements

- `TR-NOT-001`: SHALL provide a single dispatch entrypoint
  (`notify({event, target, channels?, data})`)
- `TR-NOT-002`: SHALL deduplicate by `(event, target, idempotencyKey)`
- `TR-NOT-003`: SHALL respect per-customer channel preferences
- `TR-NOT-004`: SHALL respect frequency caps (default: 5 per channel
  per hour) and quiet hours (default: customer's local timezone, 22:00–07:00)
- `TR-NOT-005`: SHALL ship in-app notifications via SSE for active
  sessions; fall back to polling on reconnect
- `TR-NOT-006`: SHALL ship email via the chosen email vendor with
  retries and a delivery log
- `TR-NOT-007`: SHALL produce an audit log entry for any
  privileged-action notification
- `TR-NOT-008`: SHOULD support webhook OUT subscriptions (Pro tier and
  above)

### Section 5: Edge Cases

- Customer is offline for an extended period (queue and digest)
- Email bounces (mark address invalid; alert the customer's admin)
- Webhook endpoint unreachable (retry with exponential backoff;
  dead-letter after the documented attempt count)
- Customer changes timezone (quiet hours follow them)
- Notification carries data that was deleted before delivery
  (defensive rendering — never reveal stale internals)

### Section 6: Out of Scope

- SMS / phone notifications (deferred)
- AI-summarized digest content (deferred)
- Per-user routing rules beyond customer-level preferences

### Section 7: Acceptance Criteria

Given / When / Then for every functional requirement.

### Section 8: Success Metrics

- ≥ 95% of in-app notifications delivered within 2 seconds of dispatch
- ≤ 0.5% email bounce rate after 30 days of GA
- < 0.1% duplicate-notification rate measured via the dispatcher's
  idempotency log

---

## Cross-System Notes

- Dependencies: `auth`, `multi-tenancy`, `audit-log`, plus the email
  vendor and the chosen realtime adapter
- Updates `design/registry/entities.yaml` with `Notification`,
  `NotificationPreference`, and `WebhookSubscription` entities
- Flags a UX requirement for the in-app notification component and the
  preferences screen — recommends `/ux-design notifications` after PRD
  approval

---

## Outcome

- PRD written: `design/prd/notifications.md`
- Systems index updated to status "Designed (pending review)"
- Recommends running `/design-review design/prd/notifications.md` in a
  fresh session
