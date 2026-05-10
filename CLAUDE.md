# 🌸 SAKURA OS — さくら株式会社 業務管理システム

> **このリポジトリは「さくら株式会社」(配管工事業)向けの統合業務管理 SaaS
> = SAKURA OS の本番開発リポジトリです。** B2B Web/SaaS テンプレートを
> ベースにしていますが、既にさくら株式会社向けにカスタマイズ・本番運用前提
> で開発されています。
>
> - **クライアント**: さくら株式会社(配管工事業)
> - **開発主**: 株式会社 AIscratch(板澤様 担当)
> - **GitHub**: `aiscratch0718-sh/sakuraOS`
> - **デプロイ先**: Vercel(Tokyo region / hnd1)
> - **DB**: Supabase Postgres
> - **本番ドメイン名フォルダ推奨**: `sakura-os/`(GitHub repo 名と一致)
>
> プロジェクト概要は `README.md`、設計詳細は `design/prd/`、ADR は
> `docs/architecture/` を参照。

---

## ⚠️ SAKURA OS リビルド作業継続時の必読手順

**現在、SAKURA OS の v4.0 デモを参考にした全面リビルドが進行中です。**

ユーザーから「リビルドの続き」「次のタスク」「P1-XX を進めて」「ステータス画面を作って」など、
リビルドに関する指示があった場合、**コードを書き始める前に** 必ず以下の順で読むこと:

1. `docs/rebuild/PROGRESS.md` — 現在の進捗 + 次に着手するタスク
2. `docs/rebuild/MASTER-PLAN.md` — 全43タスクの詳細(必要部分のみ)
3. `docs/rebuild/SESSION-LOG.md` — 直近1〜2セッションの引き継ぎ事項

**作業完了後は必ず**:
1. `npm run build` でビルド通過確認
2. `PROGRESS.md` の「現在のステータス」「次セッションでやること」を更新
3. `SESSION-LOG.md` に新セッションを append(最新を最上部に)
4. git commit + push

これを怠るとコンテキスト切れで進捗を失う。スキップ厳禁。

---

## ベーステンプレート由来の説明(参考情報)

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