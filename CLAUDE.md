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
> - **ローカルフォルダ**: `sakuraOSシステム開発用/`(2026-05-10 にリネーム済み、旧名 `Claude-Code-Game-Studios`)
>
> プロジェクトの全体マップは `PROJECT.md`、概要は `README.md`、設計詳細は
> `design/prd/`、ADR は `docs/architecture/` を参照。

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

## 🌟 全タスク共通: ベストプラクティス確認の必須プロセス

**2026-05-10 板澤様確定ルール: タスク着手前に毎回ベストプラクティスかどうかを必ず確認する。**

各タスク開始時、コードを書き始める前に以下を自問・宣言する:

### 着手前の自問チェックリスト

- [ ] **設計**: この実装は単一責任原則 / 関心の分離 を満たすか? 既存の似た機能と整合するか?
- [ ] **セキュリティ**: 入力検証 / RLS / RBAC / SQL インジェクション / XSS / CSRF を考慮したか?
- [ ] **マルチテナント**: 全クエリ・全書込みに `tenant_id` スコープが効くか?
- [ ] **アトミック性**: 関連する複数テーブル更新は 1 トランザクション or RPC で完結するか?
- [ ] **冪等性**: 同じリクエスト 2 回で 2 回反映される設計になっていないか?
- [ ] **アクセシビリティ**: ARIA / キーボード操作 / focus / prefers-reduced-motion を意識したか?
- [ ] **パフォーマンス**: N+1 / 過剰 fetch / 過剰 re-render を避けたか?
- [ ] **エラーハンドリング**: 失敗時のロールバック / ユーザーへのフィードバック / ログ記録は明確か?
- [ ] **命名**: プロジェクトの慣習(kebab-case ファイル / camelCase 変数 / snake_case DB)に従っているか?
- [ ] **テスト可能性**: ロジックを純粋関数 / 分離された層に切り出せているか?
- [ ] **保守性**: 6 ヶ月後の自分が見ても意図が分かる comment / type 名にしたか?
- [ ] **ロール別表示**: そのページ・データに不要なロールが見える状態になっていないか?

### 着手前に宣言する言い回し例

> 「P5-03 タスクボードを実装します。事前にベストプラクティスを確認します:
> - DB アクセスは Server Component で完結、tenant_id スコープを RLS で強制
> - DnD は client component で `useTransition` で楽観更新
> - 楽観更新失敗時のロールバック表示
> - ARIA `aria-grabbed` / キーボード操作対応
> - n+1 を避けるため tasks + assignee join を 1 クエリで...
> このアプローチで進めて問題ありませんか?」

### specialist agent 起動時も同様

specialist に任せる場合も、prompt 内に **「事前にベストプラクティスを宣言してから実装する」** を明示する。
specialist の出力を受け取ったら parent (Claude) が **その宣言が守られたか確認** する。

このプロセスをスキップすると、設計図のレベルに届かない、品質の低い実装になる。
**毎タスク必ず確認する**。

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