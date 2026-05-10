# リブランドサマリー / Rebrand Summary

このリポジトリは [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (ゲーム開発スタジオ向けテンプレート) を **B2B Web/SaaS開発スタジオ** 向けに組み替えたものです。

## 想定モデル / Operating Model

- **B2B 受託 / 自社SaaS** (法人契約ベース)
- **月次請求 → 銀行振込** (オフライン課金前提)
- **サブスクリプション自動課金は取り扱わない** (Stripe等の組み込みなし)
- 推奨スタック: **Next.js + Supabase** (Stripe依存なし)

## 変換規模 / Scope of Change

| 区分 | 数量 | 状態 |
|------|------|------|
| エージェント | 49 体 | 全てリネーム済み (ゲーム開発役職 → B2B Web/SaaS役職) |
| スキル | 72 個 | 全て自動置換済み、用語をWeb開発文脈に変換 |
| フック | 12 個 | 維持 (ライフサイクル/検証は共通) |
| ルール | 11 個 | 維持 (パススコープのコーディング規約) |
| ドキュメント | 14+ 個 | 用語置換済み |

## エージェント主要マッピング / Key Agent Mapping

| Before (ゲーム) | After (B2B SaaS) | 役割の本質 |
|---|---|---|
| creative-director | **product-director** | プロダクトビジョン責任者 |
| producer | **engineering-manager** | デリバリー管理 |
| game-designer | **product-manager** | PRD・ユーザーストーリー |
| lead-programmer | **lead-engineer** | コードアーキテクト・レビュー |
| art-director | **design-director** | デザインシステム責任者 |
| audio-director | **brand-director** | ブランドボイス・トーン |
| narrative-director | **content-director** | コンテンツ戦略・ドキュメント |
| sound-designer | **interaction-designer** | モーション・マイクロインタラクション |
| level-designer | **screen-designer** | 画面レイアウト・情報設計 |
| economy-designer | **business-analyst** | 課金階層・利用上限・価値分析 |
| systems-designer | **systems-analyst** | ドメインモデル・状態遷移 |
| world-builder | **information-architect** | 情報アーキテクチャ |
| ai-programmer | **ml-engineer** | 機械学習・LLM機能 |
| gameplay-programmer | **feature-engineer** | 機能実装 |
| engine-programmer | **platform-engineer** | プラットフォーム・基盤 |
| network-programmer | **api-engineer** | API設計・実装 |
| tools-programmer | **devx-engineer** | 開発者体験・内部ツール |
| ui-programmer | **frontend-engineer** | フロントエンド実装 |
| live-ops-designer | **growth-engineer** | 継続成長・ライフサイクル |
| community-manager | **customer-success-manager** | カスタマーサクセス |
| writer | **content-writer** | UXコピー・ドキュメント執筆 |
| technical-artist | **design-systems-engineer** | デザイン↔エンジニアリング橋渡し |

(QA/Security/DevOps/Performance/Accessibility/Analyticsはほぼ同名で維持。)

## フレームワークスペシャリスト (Engine specialists)

3 つのフレームワークファミリーに再編。

**Next.js ファミリー** (Godot系の置き換え):
- nextjs-specialist, typescript-specialist, server-actions-specialist, app-router-specialist, tailwind-specialist

**React + Node ファミリー** (Unity系の置き換え):
- react-specialist, cdn-asset-specialist, realtime-specialist, css-animation-specialist, component-library-specialist

**NestJS-Enterprise ファミリー** (Unreal系の置き換え):
- nestjs-specialist, orm-specialist, api-gateway-specialist, websocket-specialist, admin-ui-specialist

## スキル主要リネーム / Skill Renames

| Before | After |
|---|---|
| `/setup-engine` | `/setup-stack` |
| `/art-bible` | `/design-system-bible` |
| `/balance-check` | `/tradeoff-check` |
| `/create-control-manifest` | `/create-permissions-manifest` |
| `/day-one-patch` | `/day-one-hotfix` |
| `/patch-notes` | `/release-notes` |
| `/playtest-report` | `/usability-test-report` |
| `/review-all-gdds` | `/review-all-prds` |
| `/team-audio` | `/team-notifications` |
| `/team-combat` | `/team-core-workflows` |
| `/team-level` | `/team-information-architecture` |
| `/team-live-ops` | `/team-growth` |
| `/team-narrative` | `/team-content` |

## ディレクトリ変換 / Directory Changes

| Before | After |
|---|---|
| `docs/engine-reference/godot/` | `docs/framework-reference/nextjs/` |
| `docs/engine-reference/unity/` | `docs/framework-reference/react/` |
| `docs/engine-reference/unreal/` | `docs/framework-reference/nestjs/` |
| `design/gdd/` (PRD格納先) | `design/prd/` |
| `CCGS Skill Testing Framework` | `CCWS Skill Testing Framework` |

## 完全に書き直された主要エージェント / Fully Rewritten Agents

以下11体は、ゲーム特化の理論(MDA、Bartle分類、sink/faucet経済等)を完全に外し、B2B SaaS向け理論(JTBD、RICE、Kano、Diátaxis、DDD等)に置き換えた本格書き直しを実施:

1. **product-director** — Wedge Strategy / North Star / Working Backwards
2. **engineering-manager** — Cone of Uncertainty / Theory of Constraints / RAB
3. **product-manager** — JTBD / RICE / Kano / Opportunity Solution Tree
4. **brand-director** — Obviously Awesome Positioning / Voice Spectrum
5. **content-director** — Diátaxis / 監査サイクル / Audience Layering
6. **interaction-designer** — Doherty Threshold / Material Motion / prefers-reduced-motion
7. **screen-designer** — Tufte Data-Ink / F&Z パターン / Progressive Disclosure
8. **business-analyst** — Patrick Campbell Tiers / Hard/Soft Limits / 監査ディシプリン
9. **design-director** — Token-First Design / Atomic / B2B 密度規約
10. **ml-engineer** — Rules of ML / LLM Eval / コスト規律
11. **systems-analyst** — DDD / Event Storming / Invariants > Validation

残り 38 体は自動置換 + 第二・第三スイープで用語をWeb開発文脈に変換しています。

## 残課題 / Known Limitations

- **`.git` フォルダ**: 元のCloneの.git権限が一部残っており削除できませんでした。新規リポジトリとして使う場合は手動で `.git/` を削除し `git init` してください。
- **38 体のスペシャリストエージェント**: 自動変換のためフレームワークの本質的な思想は反映されていますが、各役職の専門理論まで深く書き換えてはいません。実運用で物足りなければ `engineering:architecture` skill 等で個別深堀り可能です。
- **GitHub URL**: README/UPGRADING内の `https://github.com/Donchitos/Claude-Code-Game-Studios.git` は元リポジトリへの参照として意図的に保持しています。

## 次のステップ / Next Steps

1. `git init` で新規リポジトリ化 (元の`.git/`を削除)
2. Claude CodeでこのフォルダをCWDにして開く
3. `/start` を実行 → ガイド付きオンボーディング
4. `/setup-stack` でNext.js or React or NestJSファミリーを選択
5. `/brainstorm` または `/quick-design` でプロダクト定義開始
