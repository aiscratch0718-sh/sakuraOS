# 🌸 SAKURA OS プロジェクトマップ

**さくら株式会社 専用 統合業務管理システム** の開発リポジトリです。

このフォルダの中身を **「ぱっと見て何のためのファイルか」** が分かるように
整理したマップです。迷ったらここに戻ってきてください。

---

## このプロジェクトの基本情報

| 項目 | 内容 |
|---|---|
| **アプリ名** | SAKURA OS |
| **クライアント** | さくら株式会社(配管工事業) |
| **開発元** | 株式会社 AIscratch(板澤様 担当) |
| **GitHub** | `aiscratch0718-sh/sakuraOS` |
| **package.json name** | `sakura-os` |
| **デプロイ先** | Vercel(Tokyo region / hnd1) |
| **DB** | Supabase Postgres |
| **フォルダパス** | `C:\Users\liim1\Desktop\エージェント会社\sakuraOSシステム開発用\` |

---

## 📂 ディレクトリの読み方(凡例つき)

### 凡例

| 記号 | 意味 |
|---|---|
| 🌸 | **SAKURA OS 本体**(さくら株式会社向け実装/設計の中核) |
| 🛠️ | **エージェント基盤**(49 specialist + skills + hooks の土台) |
| 📚 | **テンプレート由来**(Claude Code Web Studio 由来、SAKURA OS の本筋ではない) |
| ⚙️ | **設定/ビルド**(ツールチェーン) |

---

### ルート直下

| 項目 | 区分 | 説明 |
|---|---|---|
| `src/` | 🌸 | **SAKURA OS のアプリケーションコード**(Next.js) ← **メイン開発箇所** |
| `supabase/` | 🌸 | **DB マイグレーション**(0001〜) と Supabase 設定 |
| `public/` | 🌸 | 静的アセット(画像・ロゴなど) |
| `tools/` | 🌸 | SAKURA OS 用スクリプト(Excel 自動生成等) |
| `design/` | 🌸+📚 | 設計文書群(下記参照) |
| `docs/` | 🌸+📚 | ドキュメント群(下記参照) |
| `production/` | 📚 | テンプレートのスプリント/マイルストーン管理(現状未活用) |
| `.claude/` | 🛠️ | **49 エージェント・skills・rules・hooks の定義群** |
| `.git/` | ⚙️ | Git リポジトリ |
| `node_modules/` | ⚙️ | npm 依存関係(Git 管理外) |
| `package.json` | ⚙️ | 依存関係 + スクリプト定義 |
| `next.config.ts` | ⚙️ | Next.js 設定 |
| `tailwind.config.ts` | ⚙️ | Tailwind CSS 設定(デモ v4.0 トークンも組み込み済み) |
| `tsconfig.json` | ⚙️ | TypeScript 設定(strict) |
| `vercel.json` | ⚙️ | Vercel デプロイ設定 |
| `postcss.config.mjs` | ⚙️ | PostCSS 設定 |
| `next-env.d.ts` | ⚙️ | Next.js 自動生成型定義 |
| `LICENSE` | 📚 | テンプレート由来 |
| `DEPLOYMENT.md` | 🌸 | SAKURA OS デプロイ手順 |
| `README.md` | 🌸 | プロジェクト概要(SAKURA OS 用に書き換え済み) |
| `PROJECT.md` | 🌸 | **本ファイル**(プロジェクトマップ) |
| `CLAUDE.md` | 🌸+🛠️ | Claude Code 用プロジェクト指示書(SAKURA OS 識別 + リビルド手順) |

---

### `src/` の中身(🌸 SAKURA OS 本体コード)

| パス | 内容 |
|---|---|
| `src/app/(authenticated)/pc/*` | デスクトップ画面(事務・社長用) |
| `src/app/(authenticated)/sp/*` | モバイル画面(作業員・現場リーダー用) |
| `src/app/(authenticated)/admin/*` | システム管理者画面 |
| `src/app/sign-in/`, `sign-out/` | 認証 |
| `src/components/ui/` | **共通 UI コンポーネント**(KpiCard / AlertCard / HpBar / Tag 等。S1 で整備) |
| `src/features/` | 業務ドメインごとの Server Actions / クエリ |
| `src/lib/` | 共有ユーティリティ(Supabase クライアント、フォーマッタ) |
| `src/server/` | サーバー専用モジュール(認証セッション、監査ログ) |

---

### `design/` の中身

| パス | 区分 | 内容 |
|---|---|---|
| `design/prd/` | 🌸 | **SAKURA OS の仕様書**(REPORT3, master-backlog, 顧客ヒアリングログ等) |
| `design/prd/feedback/` | 🌸 | クライアント(秋元様)からの回答・ヒアリングログ Excel |
| `design/registry/entities.yaml` | 🌸 | SAKURA OS のドメインエンティティ定義 |
| `design/design-system/` | 🌸 | デザイントークン(S1 で v4.0 トークンも追加) |
| `design/CLAUDE.md` | 🛠️ | Claude 向け design ディレクトリ説明 |

---

### `docs/` の中身

| パス | 区分 | 内容 |
|---|---|---|
| `docs/rebuild/` | 🌸 | **デモ v4.0 ベースの全面リビルド計画 + 進捗トラッカー**(MASTER-PLAN / PROGRESS / SESSION-LOG / FOLDER-RENAME) |
| `docs/architecture/` | 🌸 | ADR(SAKURA OS の意思決定記録) |
| `docs/framework-reference/` | 📚 | Next.js のバージョン参照(テンプレ由来だが残す) |
| `docs/_template-archive/` | 📚 | **テンプレート由来の汎用文書**(SAKURA OS には無関係。後で消してもよい) |
| `docs/CLAUDE.md` | 🛠️ | Claude 向け docs ディレクトリ説明 |

---

### `.claude/` の中身(🛠️ エージェント基盤)

ここは触らない領域(基本 SDK / Claude Code テンプレートに任せる)。

| パス | 内容 |
|---|---|
| `.claude/agents/*.md` | **49 specialist エージェントの定義**(nextjs-specialist, server-actions-specialist 等) |
| `.claude/skills/*/SKILL.md` | スキル定義(`/code-review`, `/architecture-decision` 等のスラッシュコマンド) |
| `.claude/rules/*.md` | コーディングルール(ui-code, api-code 等) |
| `.claude/hooks/` | フック実装 |
| `.claude/docs/` | エージェント協調ルール、ディレクトリ構造説明等 |
| `.claude/settings.json` | 権限設定、ステータスライン設定 |
| `.claude/agent-memory/` | エージェントの永続メモリ |
| `.claude/statusline.sh` | ターミナル下部の status line スクリプト |

エージェント体系の現状については `docs/rebuild/PROGRESS.md` の「Decisions Log」を参照
(現在: Phase 3 から疑似 specialist 化を導入予定)。

---

## 🚀 開発作業をするとき、どこを見るか

### 「次に何をすればいいか?」
→ `docs/rebuild/PROGRESS.md`(リビルド作業継続時の起点)

### 「全体計画を確認したい」
→ `docs/rebuild/MASTER-PLAN.md`

### 「過去のセッションで何があったか」
→ `docs/rebuild/SESSION-LOG.md`

### 「クライアントの要望・ヒアリング履歴」
→ `design/prd/feedback/`

### 「機能の仕様」
→ `design/prd/`(REPORT3.md, master-backlog.md, systems-index.md 等)

### 「アプリ本体のコード」
→ `src/app/` `src/features/` `src/components/`

### 「DB スキーマ」
→ `supabase/migrations/`

---

## 🚨 よくある混乱と解決

### Q. テンプレート由来のファイルと SAKURA OS 本体の見分けがつかない
A. **`📚`(テンプレ由来)系のファイルは `docs/_template-archive/` にまとめました。**
ルート直下と `docs/` 直下に出ているのは原則 SAKURA OS 関連です。

### Q. `.claude/` 配下の 49 エージェントは動いているの?
A. **定義は揃っているが、現セッションでは未起動**。
詳細は `docs/rebuild/PROGRESS.md` の Decisions Log。
**Phase 3 から疑似 specialist 化を導入予定**(板澤様 確認済)。

### Q. 「Claude-Code-Game-Studios」というフォルダ名が以前あった気がする
A. **2026-05-10 にリネーム済み**(`Claude-Code-Game-Studios` → `sakuraOSシステム開発用`)。
経緯は `docs/rebuild/SESSION-LOG.md` の S1.5 / S1.6 参照。

### Q. テンプレ由来のファイルを完全に消してもいい?
A. **YES、消しても SAKURA OS 本体は動作します**。
`docs/_template-archive/` の中身を全削除しても、ビルドにもデプロイにも影響しません。
ただし `git log` で復元できるので慌てて消す必要はありません。

---

## 関連リソース(リポジトリ外)

- クライアント評価済みデモ:
  `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\index.html`
- ヒアリングログ Excel(リポジトリ内):
  `design/prd/feedback/2026-05-08_hearing-log.xlsx`
