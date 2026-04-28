---
name: launch-checklist
description: "Complete launch readiness validation covering every department: code, content, marketing site, customer comms, infrastructure, security and compliance, legal, and go/no-go sign-offs."
argument-hint: "[launch-date or 'dry-run']"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
---

> **Explicit invocation only**: This skill should only run when the user explicitly requests it with `/launch-checklist`. Do not auto-invoke based on context matching.

## Phase 1: Parse Arguments

Read the argument for the launch date or `dry-run` mode. Dry-run mode generates the checklist without creating sign-off entries or writing files.

---

## Phase 2: Gather Project Context

- Read `CLAUDE.md` for tech stack, target platforms, and team structure
- Read the latest milestone in `production/milestones/`
- Read any existing release checklist in `production/releases/`
- Read the content calendar in `design/growth-ops/content-calendar.md` if it exists

---

## Phase 3: Scan Codebase Health

- Count `TODO`, `FIXME`, `HACK` comments and their locations
- Check for any `console.log`, `print()`, or debug output left in production code
- Check for placeholder assets (search for `placeholder`, `temp_`, `WIP_`)
- Check for hardcoded test/dev values (localhost, test credentials, debug flags)

---

## Phase 4: Generate the Launch Checklist

```markdown
# Launch Checklist: [Product Title]
Target Launch: [Date or DRY RUN]
Generated: [Date]

---

## 1. Code Readiness

### Build Health
- [ ] Clean build on all target platforms
- [ ] Zero compiler warnings
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Performance benchmarks within targets
- [ ] No memory leaks (verified via extended soak test)
- [ ] Build size within platform limits
- [ ] Build version correctly set and tagged in source control

### Code Quality
- [ ] TODO count: [N] (zero required for launch, or documented exceptions)
- [ ] FIXME count: [N] (zero required)
- [ ] HACK count: [N] (each must have documented justification)
- [ ] No debug output in production code
- [ ] No hardcoded dev/test values
- [ ] All feature flags set to production values
- [ ] Error handling covers all critical paths
- [ ] Crash reporting integrated and verified

### Security
- [ ] No exposed API keys or credentials in source or committed config
- [ ] Customer data encrypted at rest and in transit (TLS, DB encryption)
- [ ] Multi-tenant isolation verified (cross-tenant data leak audit clean)
- [ ] Input validation on all public endpoints
- [ ] Webhook signature verification on every inbound webhook
- [ ] Latest dependency CVE scan clean (no open CRITICAL or HIGH)
- [ ] Privacy policy / DPA / SOC 2 evidence collected if applicable

---

## 2. Content Readiness

### Assets & Visual
- [ ] All placeholder UI illustrations replaced with final assets
- [ ] All marketing images, social cards, and OG images final
- [ ] Brand voice consistency reviewed by brand-director across in-app
      and marketing surfaces
- [ ] No missing or broken image / icon / font references
- [ ] Asset naming conventions enforced

### Text and Localization
- [ ] All user-facing text proofread
- [ ] No hardcoded strings (all externalized for localization)
- [ ] All supported languages translated and verified
- [ ] Text fits UI in all languages (40% expansion check complete)
- [ ] Font coverage verified for all supported languages
- [ ] In-app help / docs site live and reachable from the product

### Product Content
- [ ] All onboarding flows tested with at least 3 new-user sessions
- [ ] All critical workflows complete end-to-end on production-equivalent data
- [ ] Empty / loading / error states defined for every screen
- [ ] All transactional emails reviewed and rendering correctly
- [ ] Default tenant seed data and demo data prepared
- [ ] Help center / changelog updated for the launch version

---

## 3. Quality Assurance

### Testing
- [ ] Full automated test suite passing (unit + integration + e2e)
- [ ] Zero S1 (Critical) bugs open
- [ ] Zero S2 (Major) bugs open (or documented exceptions)
- [ ] Soak test passed (extended-session and high-record-count scenarios)
- [ ] Load test passed against production-equivalent data
- [ ] All critical user paths tested in supported browsers
- [ ] Edge cases tested (network failure, partial data, permission denied,
      concurrent edit)

### Compliance & Certification
- [ ] Accessibility tier (WCAG 2.1 [committed level]) audit clean
- [ ] SOC 2 Type II evidence collected if claimed (or roadmap published)
- [ ] GDPR / CCPA: data export and erasure paths verified
- [ ] DPA template ready for enterprise customers
- [ ] If HIPAA / regulated: BAA signed; PHI handling reviewed

### Performance
- [ ] Core Web Vitals (LCP, INP, CLS) within budget on representative
      pages
- [ ] TTFB on authenticated routes within budget at p95
- [ ] Bundle size within per-route budget
- [ ] Database query budget per request met (N+1 audit clean)
- [ ] CDN cache hit rate within target on hashed assets

---

## 4. Store and Distribution

### Marketing Site & Listings
- [ ] Marketing site copy finalized and proofread
- [ ] Pricing page accurate; all tier feature lists match the
      entitlement matrix in `design/commercial/`
- [ ] Demo video / product tour current and approved
- [ ] Open Graph and Twitter card images set per route
- [ ] Customer testimonials / case studies live (with sign-off)
- [ ] G2 / Capterra / Trustpilot listings updated
- [ ] If listed on a marketplace (Shopify App Store, Salesforce
      AppExchange, etc.): listing reviewed and approved

### Legal
- [ ] Master Service Agreement (MSA) reviewed by legal
- [ ] Data Processing Agreement (DPA) ready for enterprise customers
- [ ] Privacy policy and Terms of Service published and linked
- [ ] Third-party license attributions complete (NOTICE / LICENSES)
- [ ] Trademark / IP clearance confirmed
- [ ] GDPR / CCPA compliance verified (data collection, consent,
      export, erasure)
- [ ] Cookie policy and consent banner correct for the supported regions

---

## 5. Infrastructure

### Servers / Hosting
- [ ] Production environment provisioned and load-tested
- [ ] Auto-scaling configured and tested (or capacity plan documented if static)
- [ ] Database backups configured with documented restore procedure
- [ ] CDN configured for static assets
- [ ] WAF / DDoS protection active
- [ ] Monitoring and alerting configured (latency, error rate, queue depth)
- [ ] Status page live and pointed to monitoring data
- [ ] On-call rotation set up; runbook for top-5 incident types written
- [ ] Disaster-recovery RPO and RTO targets documented and tested

### Analytics and Monitoring
- [ ] Product analytics pipeline verified and receiving events
- [ ] Error tracking (Sentry / similar) active with sourcemaps
- [ ] Performance monitoring dashboards live (RUM and synthetic)
- [ ] Key metrics tracked: signup → activation, DAU / WAU / MAU,
      cohort retention, NPS / CSAT, error rate, p95 latency
- [ ] Alerts configured for SLO-violating thresholds

---

## 6. Customer Comms and Marketing

### Customer Comms Readiness
- [ ] Customer communication guidelines documented
- [ ] Support team briefed; macros / canned responses for common
      questions prepared
- [ ] FAQ and known-issues page prepared
- [ ] Support email / ticketing / live chat tested end-to-end
- [ ] Status page subscription flow documented

### Marketing
- [ ] Launch announcement / blog post drafted
- [ ] Customer email announcement drafted with the customer-success-manager
- [ ] Design-partner customers and beta users notified per the comms plan
- [ ] Social media launch posts scheduled
- [ ] Release notes for the launch version published

---

## 7. Operations

### Team Readiness
- [ ] On-call schedule set for first 72 hours post-launch
- [ ] Incident response playbook reviewed by team
- [ ] Rollback plan documented and tested
- [ ] Hotfix pipeline tested (can ship emergency fix within 4 hours)
- [ ] Communication plan for launch issues (who posts, where, how fast)

### Day-One Plan
- [ ] Day-one patch prepared (if needed)
- [ ] Server unlock/go-live procedure documented
- [ ] Launch monitoring dashboard bookmarked by all leads
- [ ] War room/channel established for launch day

---

## Go / No-Go Decision

**Overall Status**: [READY / NOT READY / CONDITIONAL]

### Blocking Items
[List any items that must be resolved before launch]

### Conditional Items
[List items that have documented workarounds or accepted risk]

### Sign-Offs Required
- [ ] Product Director — Content and experience quality
- [ ] Technical Director — Technical health and stability
- [ ] QA Lead — Quality and test coverage
- [ ] Engineering Manager — Schedule and overall readiness
- [ ] Release Manager — Build and deployment readiness
```

---

## Phase 5: Save Checklist

Present the completed checklist and summary to the user (total items, blocking items count, conditional items count, departments with incomplete sections).

If not in dry-run mode, ask: "May I write this to `production/releases/launch-checklist-[date].md`?"

If yes, write the file, creating directories as needed.

---

## Phase 6: Next Steps

- Run `/gate-check` to get a formal PASS/CONCERNS/FAIL verdict before launch.
- Coordinate sign-offs via `/team-release`.
