---
name: tradeoff-check
description: "Analyzes product feature tradeoff data files, formulas, and configuration to identify outliers, broken progressions, degenerate strategies, and economy imbalances. Use after modifying any feature tradeoff-related data or design. Use when user says 'feature tradeoff report', 'check product feature tradeoff', 'run a feature tradeoff check'."
argument-hint: "[system-name|path-to-data-file]"
user-invocable: true
allowed-tools: Read, Glob, Grep
agent: business-analyst
---

## Phase 1: Identify Feature Tradeoff Domain

Determine the feature tradeoff domain from `$ARGUMENTS[0]`:

- **Pricing tiers** → tier feature gates, value-vs-price ratios, dominated tiers, upgrade path clarity
- **Entitlements & limits** → seat caps, usage caps, hard / soft limits, overage behavior
- **Rate limiting & quotas** → per-tier throttle values, fairness across tenants, denial-of-service surface
- **Activation milestones** → time-to-value pacing, feature-gate ordering, milestone reachability
- **File path given** → load that file directly and infer the domain from content

If no argument, ask the user which system to check.

---

## Phase 2: Read Data Files

Read relevant files from `assets/data/` and `design/feature tradeoff/` for the identified domain.
Note every file read — they will appear in the Data Sources section of the report.

---

## Phase 3: Read Design Document

Read the PRD for the system from `design/prd/` to understand intended design targets,
tuning knobs, and expected value ranges. This is the baseline for "correct" behaviour.

---

## Phase 4: Perform Analysis

Run domain-specific checks:

**Pricing tier tradeoff:**
- Map every feature → tier visibility matrix
- Check that every tier has at least one differentiating feature vs the
  tier below it (no "dominated" tiers)
- Compare tier price increments to feature increments — flag any tier
  that costs disproportionately more without adding proportionate value
- Verify upgrade path is monotonic (no feature in a lower tier missing
  from a higher tier)

**Entitlements & limits tradeoff:**
- Plot per-tier usage limits against the customer's expected workload
- Check that "soft" limits actually have a friction-only path
  (e.g., warning banner, not blocked)
- Check that "hard" limits cannot accidentally lock out an engaged
  customer; surface the upgrade prompt before the limit is hit
- Verify overage behavior is consistent (auto-charge vs throttle vs
  block) and matches the contract documentation

**Rate limiting & quotas tradeoff:**
- Compare per-tenant rate limits against the heaviest legitimate
  customer workload observed
- Check that the limits cannot be exhausted by a single user inside a
  multi-user tenant (NAT'd IP rate-limiting is a footgun)
- Verify there is a documented escalation path for legitimate
  high-throughput customers

**Activation milestones tradeoff:**
- Plot expected time-to-each-milestone against the median user's
  available time budget
- Check that no milestone is gated behind a feature locked to a higher
  tier (silent dead-end)
- Verify milestone ordering surfaces the product's "aha" before the
  customer's evaluation period ends

---

## Phase 5: Output the Analysis

```
## Feature Tradeoff Check: [System Name]

### Data Sources Analyzed
- [List of files read]

### Health Summary: [HEALTHY / CONCERNS / CRITICAL ISSUES]

### Outliers Detected
| Item/Value | Expected Range | Actual | Issue |
|-----------|---------------|--------|-------|

### Degenerate Strategies Found
- [Strategy description and why it is problematic]

### Progression Analysis
[Graph description or table showing progression curve health]

### Recommendations
| Priority | Issue | Suggested Fix | Impact |
|----------|-------|--------------|--------|

### Values That Need Attention
[Specific values with suggested adjustments and rationale]
```

---

## Phase 6: Fix & Verify Cycle

After presenting the report, ask:

> "Would you like to fix any of these feature tradeoff issues now?"

If yes:
- Ask which issue to address first (refer to the Recommendations table by priority row)
- Guide the user to update the relevant data file in `assets/data/` or formula in `design/feature tradeoff/`
- After each fix, offer to re-run the relevant feature tradeoff checks to verify no new outliers were introduced
- If the fix changes a tuning knob defined in a PRD or referenced by an ADR, remind the user:
 > "This value is defined in a design document. Run `/propagate-design-change [path]` on the affected PRD to find downstream impacts before committing."

If no:
- Summarize open issues and suggest saving the report to `design/feature tradeoff/tradeoff-check-[system]-[date].md` for later

End with:
> "Re-run `/tradeoff-check` after fixes to verify."
