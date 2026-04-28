# Product Concept: [Working Title]

*Created: [Date]*
*Status: [Draft / Under Review / Approved]*

---

## Elevator Pitch

> [1–2 sentences that capture the entire product. Compelling enough to make a
> stranger want to hear more.
> Format: "It's a [category] for [target user] that lets them [core action] so
> that [outcome] without [pain point of incumbents]."
>
> Test: Can someone who has never heard of this product understand what they
> would do with it in 10 seconds? If not, simplify.]

---

## Core Identity

| Aspect | Detail |
|--------|--------|
| **Category** | [B2B SaaS / B2B Internal Tool / Vertical SaaS / Platform / Other] |
| **Sub-category** | [e.g., Finance ops, Customer support tooling, Observability, Analytics] |
| **Target Customer** | [See User & Buyer Profiles below] |
| **Deployment Model** | [Multi-tenant SaaS / Single-tenant SaaS / Self-hosted / On-prem] |
| **Buyer Surface Area** | [Single team / Department / Whole org] |
| **Engagement Cadence** | [Daily / Weekly / Monthly / Event-driven] |
| **Revenue Model** | [B2B contract — monthly invoice → bank transfer (template default)] |
| **Estimated Build Scope** | [Small (1–3 months) / Medium (3–9 months) / Large (9+ months)] |
| **Comparable Products** | [2–3 existing products in the same space] |

---

## The Hook

> [The unique angle that makes this product worth choosing over the next-best
> alternative. Not just a list of features — the structural decision that
> would be hard for an incumbent to copy without dismantling their product.]

The hook should be:

- Explainable in one sentence
- Genuinely novel (not just "the same, but with AI")
- Connected to the core promise (not a marketing tagline bolted on)
- Something that affects how the product works, not just how it looks

---

## Job-to-be-Done (JTBD)

> Frame the product around the customer's job. The customer "hires" the
> product to make progress in a specific situation, with constraints, against
> alternatives.

### Primary Job Statement

When **[situation / trigger]**,
I want to **[motivation / progress]**,
so I can **[outcome the customer cares about]**.

Example: *"When I'm closing the books at month-end and need to record dozens
of accruals, I want to draft and validate journal entries against last
period's pattern, so I can finish the close in 2 days instead of 10."*

### Forces of Progress

| Force | What's pulling the customer? |
|-------|------------------------------|
| **Push of the situation** | [What is making the status quo painful right now?] |
| **Pull of the new solution** | [What does our product offer that the customer wants?] |
| **Anxiety of the new solution** | [What might stop them from switching? Risk, learning curve, lock-in.] |
| **Inertia of the existing habit** | [Why is the current workflow sticky? Sunk cost, integrations, comfort.] |

A good product **amplifies** push and pull, and **reduces** anxiety and
inertia. Each pillar of the product should be traceable to one of these forces.

---

## Target Users & Buyers

In B2B the buyer and the user are often different people. Concept must
account for both.

### Daily User

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | [e.g., Senior Accountant, SRE, Customer Success Manager] |
| **Seniority** | [IC / Lead / Manager / Director] |
| **Company size context** | [Solo / Small team (5–20) / Mid-market / Enterprise] |
| **Time spent in product** | [e.g., "Heavy use 2 hours/day during close week, light use rest of month"] |
| **Tools they use today** | [The actual stack they currently rely on] |
| **Unmet need** | [Specifically what is broken / missing / slow] |
| **Dealbreakers** | [What would make them refuse to adopt — e.g., "must support SSO"] |

### Economic Buyer

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | [e.g., VP Finance, CTO, Head of Operations] |
| **What they care about** | [ROI framing, risk reduction, compliance, headcount avoidance, time-to-value] |
| **Approval threshold** | [Discretionary spend ceiling — e.g., "<$50k/yr is a Director-level decision"] |
| **Procurement requirements** | [SOC 2, security questionnaire, MSA, vendor review] |
| **Reference customers they will ask** | [Who they would call for a backchannel reference] |

### Champion

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | [Often the most passionate user — they advocate internally] |
| **What's in it for them** | [Career win, internal credibility, time saved] |
| **What they need from us** | [Internal pitch deck, ROI calculator, customer references] |

### IT / Security Reviewer

| Attribute | Detail |
|-----------|--------|
| **What they need** | [SSO, audit log, data residency, deletion guarantees, security questionnaire] |
| **Likely objections** | [Where the deal could stall in security review] |

---

## Core Workflow

### The Daily Loop (5–15 minutes)

[What does the user do most often? The repeated action that builds the
habit. Must be smooth and rewarding — if the daily loop is friction-heavy,
no amount of dashboards will save the product.]

### The Weekly / Monthly Loop (when applicable)

[For products with rhythm beyond daily — e.g., month-end close, weekly
reporting, quarterly review. What does the longer cycle look like?]

### The Outcome (what changes for the customer)

[The before/after. Concrete, measurable. Not "saves time" — "closes the
books in 2 days instead of 10."]

---

## Product Pillars (preview)

Pillars are the 3–5 non-negotiable principles that guide every decision.
Drafted here, finalized in `design/prd/product-pillars.md`.

### Pillar 1: [Name]

[One sentence defining this non-negotiable principle.]

*Decision test*: [A concrete question this pillar would resolve. "If we are
debating between X and Y, this pillar says we choose __."]

### Pillar 2: [Name]

[Definition]

*Decision test*: [Decision it resolves]

### Pillar 3: [Name]

[Definition]

*Decision test*: [Decision it resolves]

### Anti-Pillars (What This Product Is NOT)

- **NOT [thing]**: [Why this is explicitly excluded and what it would
  compromise]
- **NOT [thing]**: [Why]
- **NOT [thing]**: [Why]

---

## Inspiration & References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
|-----------|----------------------|-------------------------|----------------|
| [Product 1] | [Specific approach, pattern, or feel] | [Our twist] | [What it validates about our concept] |
| [Product 2] | [What we learn] | [Our twist] | [Validation] |
| [Product 3] | [What we learn] | [Our twist] | [Validation] |

**Non-product inspirations**: [Books, frameworks, real-world workflows from
adjacent industries. Strong concepts often pull from outside the category.]

---

## Competitive Landscape

| Competitor | What They Do Well | Where They Fall Short | How We Win |
|------------|-------------------|------------------------|------------|
| [Incumbent 1] | [Their strength] | [The gap we exploit] | [Our positioning] |
| [Incumbent 2] | [Strength] | [Gap] | [Positioning] |
| [Substitute (e.g., spreadsheets, in-house tools)] | [Why people stick with it] | [Where it breaks at scale] | [How we displace it] |

---

## Technical Considerations

| Consideration | Assessment |
|---------------|------------|
| **Recommended Framework Family** | [Next.js / React + Node / NestJS — and why, given scope and team expertise] |
| **Key Technical Challenges** | [What is hard or unproven about building this?] |
| **Data Model Complexity** | [Simple CRUD / Multi-tenant + RLS / Complex domain with state machines / Real-time collab] |
| **Integration Surface** | [Which third-party systems must we read from / write to?] |
| **Compliance Requirements** | [SOC 2, HIPAA, GDPR, regional data residency — drives architecture] |
| **Realtime Needs** | [None / Soft realtime (polling OK) / Hard realtime (websockets / collab)] |
| **Estimated Data Volume** | [Records per tenant per month / total over 1 year] |
| **Search / Reporting Needs** | [Simple filters / Faceted search / Full-text / Analytics warehouse] |

---

## Commercial Hypothesis

| Aspect | Detail |
|--------|--------|
| **Pricing model** | [Per-seat / Per-tenant / Usage-based / Tiered (Free/Pro/Enterprise) / Hybrid] |
| **Estimated price band** | [e.g., $20–$80 per seat per month, or $X–$Y per tenant per month] |
| **Reference deal size** | [Typical first-year ACV] |
| **Time to first value** | [How long after sign-up until the customer reaches "aha"] |
| **Sales motion** | [Self-serve / Sales-led / Hybrid (PLG → Sales)] |
| **Key entitlement boundaries** | [Which features gate by tier — usage caps, advanced features, SSO, audit log] |

> Reminder: this template assumes B2B contract revenue (monthly invoice → bank
> transfer). No subscription auto-billing scaffolding is included by default.
> If self-serve billing is required later, document it as a deliberate
> commercial decision.

---

## Risks & Open Questions

### Product Risks
[Things that could make the product not deliver on its promise]
- [Risk 1 — e.g., "Core workflow may take longer than incumbents at low data volume"]
- [Risk 2 — e.g., "Job-to-be-done weakens above company size N"]

### Technical Risks
[Things that could be hard or impossible to build at the targeted price/quality]
- [Risk 1 — e.g., "Multi-tenant RLS policies grow combinatorial with role count"]
- [Risk 2 — e.g., "Realtime collaboration may require infra we have not built"]

### Market & Commercial Risks
[Things that could prevent commercial traction]
- [Risk 1 — e.g., "Category is saturated with well-funded incumbents"]
- [Risk 2 — e.g., "Target buyer's discretionary spend is below our viable price"]

### Scope Risks
[Things that could blow the timeline]
- [Risk 1 — e.g., "Compliance scope (SOC 2 Type II) adds 3 months before first sale"]
- [Risk 2 — e.g., "Mandatory integrations expand quickly with each new buyer"]

### Open Questions
[Things that need research, prototyping, or customer interviews before we can answer]
- [Question 1 — and how we plan to answer it]
- [Question 2 — and what artifact would resolve it]

---

## MVP Definition

[The minimum version that validates the core hypothesis. The MVP answers
ONE question: "Does the daily user reach 'aha' fast enough for them to
choose this over the status quo?"]

**Core hypothesis**: [The single statement the MVP tests — e.g., "Finance
teams of 5–20 people will draft month-end accruals 50% faster using our
template-based journal entry workflow."]

**Required for MVP**:
1. [Essential capability 1 — directly tests the hypothesis]
2. [Essential capability 2]
3. [Essential capability 3]

**Explicitly NOT in MVP** (defer to later):
- [Capability that is nice but does not test the hypothesis]
- [Capability that expands surface area without validating the core job]

### Scope Tiers (if budget / time shrinks)

| Tier | Functional Coverage | Polish Level | Timeline |
|------|---------------------|--------------|----------|
| **MVP** | [Daily loop only, single role] | [Functional, rough edges OK] | [X weeks] |
| **Beta** | [Daily + weekly loop, primary role] | [Polished critical paths] | [X weeks] |
| **GA** | [All loops, all roles] | [Polished + accessibility committed] | [X weeks] |
| **Full Vision** | [All loops + advanced features + integrations] | [Polished, certified] | [X weeks] |

---

## Next Steps

- [ ] Get concept approval from product-director
- [ ] Fill in CLAUDE.md technology stack via `/setup-stack`
- [ ] Create product pillars document via `/design-review` to validate
- [ ] Decompose concept into systems via `/map-systems` (maps dependencies,
      assigns priorities, guides per-system PRD writing)
- [ ] Create first architecture decision record via `/architecture-decision`
- [ ] Prototype the daily loop via `/prototype [core-workflow]`
- [ ] Validate the daily loop with usability test via `/usability-test-report`
- [ ] Plan first sprint via `/sprint-plan new`
