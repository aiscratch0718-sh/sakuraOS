# Product Pillars: [Product Name]

## Document Status
- **Version**: 1.0
- **Last Updated**: [Date]
- **Approved By**: product-director
- **Status**: [Draft / Under Review / Approved]

---

## What Are Product Pillars?

Pillars are the 3–5 non-negotiable principles that define this product's identity.
Every design, content, brand, and engineering decision must serve at least one
pillar. If a feature does not serve a pillar, it does not belong in the product.

**Why pillars matter**: In a typical development cycle, the team makes thousands
of small decisions. Pillars ensure those decisions push in the same direction,
producing a coherent product rather than a collection of disconnected features.

### What Makes a Good Pillar

A good pillar is:

- **Falsifiable**: "Easy to use" is not a pillar. "Any task is reachable in
  three clicks or fewer from the dashboard" is — it makes a testable claim.
- **Constraining**: If a pillar never forces you to say no to something, it is
  too vague. Good pillars eliminate options.
- **Cross-departmental**: A pillar that only constrains engineering but says
  nothing about design, content, brand, or commercial decisions is incomplete.
  Real pillars shape every discipline.
- **Memorable**: The team should be able to recite the pillars from memory. If
  they cannot, the pillars are too numerous or too complex.

### Real B2B SaaS Examples

These products' public positioning shows how concrete and specific effective
pillars can be. (Not all of these are stated as "pillars" by the company, but
the operational behavior makes them visible.)

| Product | Pillars (paraphrased) | Why They Work |
|---------|------------------------|---------------|
| **Linear** | Speed is a feature; opinionated defaults over flexibility; offline-first; keyboard-first | "Keyboard-first" forced every interaction to have a shortcut, shaping the entire UX. "Opinionated defaults" justified rejecting customization that other tools accept. |
| **Stripe** | Developers first; documentation is the product; API stability over breaking improvements | "Documentation is the product" drove a writing culture and ranked docs work alongside engineering work. |
| **Basecamp / 37signals** | Calm, not real-time-everywhere; opinionated workflow; long-term over growth-at-all-costs | "Calm" rejected the in-vogue Slack-style real-time pattern, even though customers asked for it. |
| **Figma** | Multiplayer is the default, not a feature; the browser is the platform; designers and engineers in the same file | "Multiplayer by default" required a new technical foundation — pillar-level commitment justified the cost. |
| **Notion** | Composable building blocks over fixed templates; one tool for many jobs; democratized internal tools | "Composable" justified leaving many surface workflows underbuilt — flexibility was the point. |
| **PostHog** | Open source first; everything in one place; transparent pricing | "Open source first" constrained how features were rolled out — even paid tiers expose source. |

---

## Core Promise

> [What outcome does this product deliver to its target user that they cannot
> get elsewhere? The core promise is the operational answer to "why would a
> buyer choose THIS product over the next-best alternative?"
>
> Strong core promises are concrete and measurable:
> - "Close the books in 2 days instead of 10"
> - "Onboard a new engineering hire from offer to first PR in 48 hours"
> - "Replace the 6-tool stack a 5-person ops team currently maintains"
> - "Detect production incidents before customer-facing alerts fire"]

---

## Target Customer Outcomes (JTBD)

[Rank the Jobs-to-be-Done this product serves. Pillars should collectively
serve the top 2–3 jobs.]

| Rank | Job-to-be-Done | How Our Product Delivers It |
|------|----------------|-----------------------------|
| 1 | [e.g., "Help me close the month-end books faster"] | [Specific delivery mechanism] |
| 2 | [e.g., "Help me prove SOX compliance to auditors"] | [Specific delivery mechanism] |
| 3 | [e.g., "Help me see variance in real time so I can intervene"] | [Specific delivery mechanism] |
| N/A | [Jobs we explicitly do not serve] | [Why this is not a priority] |

---

## The Pillars

### Pillar 1: [Name]

**One-Sentence Definition**: [A clear, falsifiable statement of what this pillar
means. Specific enough that two people would reach the same conclusion when
applying it to a design question.]

**Jobs Served**: [Which JTBDs from the ranking above does this pillar primarily
deliver?]

**Decision Test**: [A concrete decision this pillar resolves. "If we are
debating between X and Y, this pillar says we choose __."]

#### What This Means for Each Department

| Department | This Pillar Says... | Example |
|------------|---------------------|---------|
| **Product** | [How this constrains product decisions] | [Concrete example] |
| **Design** | [How this constrains visual / interaction decisions] | [Concrete example] |
| **Content** | [How this constrains UX copy, docs, marketing voice] | [Concrete example] |
| **Brand** | [How this constrains positioning and tone] | [Concrete example] |
| **Engineering** | [Technical implications and priorities] | [Concrete example] |
| **Commercial** | [Implications for pricing tiers / entitlements] | [Concrete example] |

#### Serving This Pillar

- [Concrete example of a feature/decision that embodies this pillar]
- [Another example]

#### Violating This Pillar

- [Concrete example of what would betray this pillar — things we must never do]
- [Another example]

---

### Pillar 2: [Name]

**One-Sentence Definition**: [Specific, falsifiable statement]

**Jobs Served**: [JTBDs]

**Decision Test**: [Concrete decision it resolves]

#### What This Means for Each Department

| Department | This Pillar Says... | Example |
|------------|---------------------|---------|
| **Product** | [Constraint] | [Example] |
| **Design** | [Constraint] | [Example] |
| **Content** | [Constraint] | [Example] |
| **Brand** | [Constraint] | [Example] |
| **Engineering** | [Constraint] | [Example] |
| **Commercial** | [Constraint] | [Example] |

#### Serving This Pillar
- [Example]

#### Violating This Pillar
- [Example]

---

### Pillar 3: [Name]

[Same structure as Pillars 1–2.]

### Pillar 4: [Name] (Optional)

[Same structure.]

### Pillar 5: [Name] (Optional)

[Same structure.]

---

## Anti-Pillars (What This Product Is NOT)

Anti-pillars are equally important as pillars — they prevent scope creep and
keep positioning focused. Every "no" protects the "yes."

Great anti-pillars are things the team might actually want to do. "NOT a CRM"
is obvious and useless if the product is an analytics dashboard. "NOT a
real-time collaboration tool" is useful if real-time is plausible but
deliberately rejected.

- **NOT [thing]**: [Why this is explicitly excluded, what pillar it would
  compromise, and what it would cost in development focus]
- **NOT [thing]**: [Why excluded]
- **NOT [thing]**: [Why excluded]

---

## Pillar Conflict Resolution

When two pillars conflict (and they will), use this priority order. The ranking
reflects which aspects of the experience are most essential to the core promise.

| Priority | Pillar | Rationale |
|----------|--------|-----------|
| 1 | [Highest priority pillar] | [Why this wins when it conflicts with others] |
| 2 | [Second priority] | [Why] |
| 3 | [Third priority] | [Why] |

**Resolution Process**:
1. Identify which pillars are in tension
2. Consult the priority ranking above
3. If the lower-priority pillar can be served partially without compromising the
   higher-priority one, do so
4. If not, the higher-priority pillar wins
5. Document the decision and rationale in the relevant design document
6. If the conflict is fundamental (two pillars are irreconcilable), escalate to
   the product-director to consider revising the pillars themselves

---

## Buyer & User Motivation Alignment

[Verify that the pillars collectively serve both the **buyer** (who signs the
contract) and the **user** (who uses the product daily). In B2B these are often
different people with different motivations.]

| Stakeholder | Motivation | Which Pillar Serves It | How |
|-------------|------------|------------------------|-----|
| **Economic buyer** | ROI / cost reduction / risk reduction | [Pillar] | [How] |
| **Champion** | Career win, internal credibility | [Pillar] | [How] |
| **Daily user** | Get the job done with minimal friction | [Pillar] | [How] |
| **IT / Security reviewer** | Compliance, integration, safety | [Pillar] | [How] |

**Gap check**: If a stakeholder is not served by at least one pillar, the
product likely loses the deal at that stakeholder's stage of the buying
process. Address the gap.

---

## Customer Lifecycle Arc

[Map the intended customer experience across the lifecycle. This should be a
deliberate design, not an accident.]

| Phase | Target Outcome | Pillar(s) Driving It | Mechanism |
|-------|----------------|----------------------|-----------|
| **Trial / Evaluation** | Customer reaches "aha" within first session | [Pillar] | [What they do; what we instrument] |
| **Activation** | Customer completes the first valuable workflow end-to-end | [Pillar] | [Mechanism] |
| **Habit** | Customer returns at the natural cadence (daily / weekly / monthly) | [Pillar] | [Mechanism] |
| **Expansion** | Customer adopts a second use case or invites a teammate | [Pillar] | [Mechanism] |
| **Renewal / Advocacy** | Customer renews and recommends | [Pillar] | [Mechanism] |

---

## Reference Products

| Reference | What We Take From It | What We Do Differently | Which Pillar It Validates |
|-----------|----------------------|-------------------------|---------------------------|
| [Product 1] | [Specific approach, feeling, or pattern] | [Our twist] | [Pillar name] |
| [Product 2] | [What we learn] | [Our twist] | [Pillar name] |
| [Product 3] | [What we learn] | [Our twist] | [Pillar name] |

**Non-product inspirations**: [Books, frameworks, real-world workflows, or
companies in adjacent industries that inform the tone or operational model.]

---

## Pillar Validation Checklist

Before finalizing the pillars, verify:

- [ ] **Count**: 3–5 pillars (no more, no fewer)
- [ ] **Falsifiable**: Each pillar makes a claim that could be wrong
- [ ] **Constraining**: Each pillar forces saying "no" to some plausible ideas
- [ ] **Cross-departmental**: Each pillar has implications for product, design,
      content, brand, AND engineering
- [ ] **Decision-tested**: Each pillar has a concrete decision test that
      resolves a real upcoming question
- [ ] **Anti-pillars defined**: At least 3 explicit "this product is NOT"
      statements
- [ ] **Priority-ranked**: Clear order for resolving conflicts between pillars
- [ ] **JTBD-aligned**: Pillars collectively deliver the top-ranked jobs
- [ ] **Stakeholder coverage**: Every key stakeholder (buyer, champion, user,
      IT) is served by at least one pillar
- [ ] **Memorable**: The team can recite all pillars from memory
- [ ] **Core promise served**: Every pillar traces back to the core promise

---

## Next Steps

- [ ] Get pillar approval from product-director
- [ ] Distribute to all department leads for sign-off
- [ ] Create decision tests for each pillar using real upcoming decisions
- [ ] Schedule first pillar review (after 2 weeks of development)
- [ ] Add pillars to the product-concept document and pitch document

---

*This document is the strategic north star. It lives at
`design/prd/product-pillars.md` and is referenced by every PRD, design spec,
and brand document in the project. Review quarterly or after major pivots.*
