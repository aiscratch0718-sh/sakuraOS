<p align="center">
 <h1 align="center">Claude Code Web Studio</h1>
 <p align="center">
 Turn a single Claude Code session into a full B2B web/SaaS development studio.
 <br />
 49 agents. 72 skills. One coordinated AI team.
 </p>
</p>

<p align="center">
 <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
 <a href=".claude/agents"><img src="https://img.shields.io/badge/agents-49-blueviolet" alt="49 Agents"></a>
 <a href=".claude/skills"><img src="https://img.shields.io/badge/skills-72-green" alt="72 Skills"></a>
 <a href=".claude/hooks"><img src="https://img.shields.io/badge/hooks-12-orange" alt="12 Hooks"></a>
 <a href=".claude/rules"><img src="https://img.shields.io/badge/rules-9-red" alt="9 Rules"></a>
 <a href="https://docs.anthropic.com/en/docs/claude-code"><img src="https://img.shields.io/badge/built%20for-Claude%20Code-f5f5f5?logo=anthropic" alt="Built for Claude Code"></a>
</p>

---

## なぜこれを作ったか / Why This Exists

B2B Webアプリやお客様向けSaaSを少人数(あるいは1人)で作るとき、AIは強力ですが、単一のチャットセッションには **構造がありません**。誰もマジックナンバーのハードコードを止めてくれず、PRDをスキップしても怒られず、スパゲッティコードのレビューも入りません。「この機能は本当にプロダクトの方針に合っているか?」と問いかける人もいない。

**Claude Code Web Studio** はその穴を埋めます。汎用の1つのアシスタントではなく、**49人の専門エージェント** を実在のWeb開発スタジオの階層構造で組織し、AIセッションそのものに「スタジオの仕事の仕方」を持ち込みます。プロダクトのビジョンを守るディレクター、各領域を所有するリード、手を動かすスペシャリスト。各エージェントには明確な責務、エスカレーションパス、そして品質ゲートが定義されています。

結果として、最終判断はあなた自身が下しつつ、「正しい問いを立て、ミスを早期に検出し、最初のブレストからリリースまでプロジェクトを整然と保つ」AIチームが手に入ります。

> **想定モデル**: B2B 受託 / 自社SaaS。サブスクリプション自動課金は **取り扱いません** (契約 → 月次請求 → 銀行振込のようなオフライン課金を前提)。

---

## Table of Contents

- [What's Included](#whats-included)
- [Studio Hierarchy](#studio-hierarchy)
- [Slash Commands](#slash-commands)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Design Philosophy](#design-philosophy)
- [Customization](#customization)
- [License](#license)

---

## What's Included

| Category | Count | Description |
|----------|-------|-------------|
| **Agents** | 49 | Specialized subagents across product, engineering, design, content, QA, ops, and platform |
| **Skills** | 72 | Slash commands for every workflow phase (`/start`, `/design-system`, `/create-epics`, `/create-stories`, `/dev-story`, `/story-done`, etc.) |
| **Hooks** | 12 | Automated validation on commits, pushes, asset changes, session lifecycle, agent audit trail, and gap detection |
| **Rules** | 9 | Path-scoped coding standards enforced when editing feature, platform, UI, API, AI, data, and prototype code |
| **Templates** | 28 | Document templates for PRDs, UX specs, ADRs, sprint plans, dashboard design, accessibility, and more |

## Studio Hierarchy

Agents are organized into three tiers, matching how real product teams operate:

```
Tier 1 — Directors (Opus)
 product-director technical-director engineering-manager

Tier 2 — Department Leads (Sonnet)
 product-manager lead-engineer design-director
 brand-director content-director qa-lead
 release-manager localization-lead

Tier 3 — Specialists (Sonnet/Haiku)
 feature-engineer platform-engineer ml-engineer
 api-engineer devx-engineer frontend-engineer
 systems-analyst screen-designer business-analyst
 design-systems-engineer interaction-designer content-writer
 information-architect ux-designer prototyper
 performance-engineer devops-engineer analytics-engineer
 qa-engineer security-engineer accessibility-specialist
 customer-success-manager

Framework Specialists (Sonnet) — for stack-specific work
 Next.js family:
 nextjs-specialist typescript-specialist
 server-actions-specialist app-router-specialist
 tailwind-specialist
 React + Node family:
 react-specialist cdn-asset-specialist
 realtime-specialist css-animation-specialist
 component-library-specialist
 Backend / Enterprise family:
 nestjs-specialist orm-specialist
 api-gateway-specialist websocket-specialist
 admin-ui-specialist
```

Tier 1 directors hold the vision and final authority on cross-cutting concerns.
Tier 2 leads own a department and answer to a director.
Tier 3 specialists do the hands-on work and answer to a lead.

The full coordination map is in `.claude/docs/agent-coordination-map.md`.

---

## Slash Commands

72 skills, organized by phase. Run `/help` inside Claude Code to see all of them.

**Onboarding & setup**
- `/start` — first-time guided onboarding
- `/setup-stack` — configure the tech stack (Next.js / React / NestJS family)
- `/onboard` — onboard a new contributor to an existing project
- `/adopt` — adopt an existing codebase into this studio framework

**Discovery & design**
- `/brainstorm` — explore product ideas from scratch
- `/quick-design` — fast PRD outline for a feature
- `/design-system` — define the design system tokens and components
- `/design-system-bible` — full visual & interaction guidelines
- `/ux-design` — design a user flow
- `/architecture-decision` — write an ADR
- `/create-architecture` — propose system architecture
- `/map-systems` — map domain entities and their relationships
- `/create-permissions-manifest` — declare RBAC matrix and auth scopes

**Planning & execution**
- `/create-epics` — break down a quarter into epics
- `/create-stories` — break down an epic into user stories
- `/sprint-plan` — plan the next sprint
- `/sprint-status` — daily standup view
- `/estimate` — estimate a story or epic
- `/scope-check` — pressure-test scope against budget
- `/dev-story` — implement a single user story
- `/story-readiness` — check whether a story is ready to start
- `/story-done` — mark a story done with evidence

**Quality & review**
- `/code-review`, `/design-review`, `/architecture-review`, `/ux-review`
- `/usability-test-report` — synthesize usability test findings
- `/qa-plan`, `/regression-suite`, `/smoke-check`, `/soak-test`
- `/test-setup`, `/test-helpers`, `/test-flakiness`, `/test-evidence-review`
- `/security-audit`, `/perf-profile`
- `/tradeoff-check` — surface a feature tradeoff for explicit decision
- `/consistency-check`, `/content-audit`, `/asset-audit`, `/asset-spec`

**Release & ops**
- `/launch-checklist`, `/release-checklist`, `/release-notes`
- `/changelog`
- `/hotfix`, `/day-one-hotfix`
- `/gate-check`, `/milestone-review`
- `/team-content`, `/team-core-workflows`, `/team-information-architecture`,
 `/team-growth`, `/team-notifications`, `/team-polish`, `/team-qa`,
 `/team-release`, `/team-ui` — fan out a task to a department

**Misc**
- `/help`, `/retrospective`, `/reverse-document`
- `/skill-improve`, `/skill-test`
- `/project-stage-detect`, `/propagate-design-change`, `/review-all-prds`
- `/prototype`, `/bug-report`, `/bug-triage`, `/tech-debt`, `/localize`

---

## Getting Started

1. **Clone this template**
 ```bash
 git clone https://github.com/Donchitos/Claude-Code-Game-Studios.git my-product
 cd my-product
 ```
 Then remove `.git/` and `git init` your own repo.

2. **Open the folder in Claude Code**
 The `.claude/` directory is auto-loaded. CLAUDE.md is loaded into the
 session context.

3. **Run `/start`**
 The onboarding skill detects your project state (greenfield, has-PRD,
 has-codebase, etc.) and routes you to the right next step.

4. **Pick a tech stack**
 `/setup-stack` walks you through choosing one of the three framework
 families and writes your choice to `.claude/docs/technical-preferences.md`.
 The default recommendation is **Next.js + Supabase** (no payment integration).

5. **Define your product**
 - `/brainstorm` if you have nothing yet
 - `/quick-design` if you have a one-line idea
 - `/create-architecture` if you already have a PRD

---

## Project Structure

```
.claude/
 agents/ # 49 subagent definitions
 skills/ # 72 slash commands (each a folder with SKILL.md)
 rules/ # 11 path-scoped coding standards
 hooks/ # 12 lifecycle/validation hooks
 docs/ # internal docs read by agents
 agent-memory/ # per-agent persistent memory

design/
 prd/ # Product Requirements Documents
 registry/ # entity registry, domain model
 design-system/ # design tokens, components

production/
 sprints/ # sprint plans
 milestones/ # milestone reviews
 session-state/ # session resumption state

src/ # Application source code
 app/ # Next.js app router (when using Next.js)
 components/ # UI components
 lib/ # shared libraries
 api/ # API routes / handlers

docs/
 architecture/ # architecture decisions, system design
 examples/ # example PRDs, ADRs, sprint plans
```

---

## How It Works

Every interaction follows the **Question → Options → Decision → Draft → Approval** pattern. Agents propose; humans decide.

1. You give an agent a goal ("we need a billing-page redesign")
2. The agent asks clarifying questions and presents 2–3 options with trade-offs
3. You pick a direction (or write your own)
4. The agent drafts the artifact and asks "May I write this to `[path]`?"
5. You approve, edit, or reject

No autonomous commits. No silent file writes. No "I'll just go ahead and …".

The full collaboration protocol is in `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md`.

---

## Design Philosophy

- **MDP framework** — Mechanics (features), Data (state/persistence), Presentation (UX) — analogous to MDA in products. Use it to keep concerns separate when designing features.
- **Path-scoped rules** — UI code has different constraints than API code. Rules in `.claude/rules/` are loaded only when editing the matching paths.
- **Director gates** — large changes (architecture, design system, public API) require explicit director approval. See `.claude/docs/director-gates.md`.
- **No subscription / auto-billing assumptions** — this template assumes B2B contract-based revenue. There is no Stripe wiring, no subscription scaffolding, no auto-billing. If you need that later, add it deliberately.

---

## Customization

- **Change the framework family**: edit `.claude/docs/technical-preferences.md`. Framework-specialist agents are still useful even if you only use one family.
- **Remove agents you don't need**: delete the file in `.claude/agents/`. Other agents will simply not call them.
- **Add domain knowledge**: drop facts into `.claude/agent-memory/<agent-name>.md`.
- **Override coordination rules**: edit `.claude/docs/coordination-rules.md`.

---

## License

MIT License — see [LICENSE](LICENSE).

This project is an adaptation of [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios), rebranded for B2B Web/SaaS development.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               