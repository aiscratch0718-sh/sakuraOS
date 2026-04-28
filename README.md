# SAKURA OS

さくら株式会社 業務管理システム — 配管工事業向け B2B 業務管理 SaaS。

> **Phase B (MVP骨格)** 完了 — 認証 + ロール別ホーム + REPORT3 入力・閲覧・承認 を Vercel で動作確認できる段階。
>
> 設計の詳細は `design/prd/`、ADR は `docs/architecture/` を参照。

---

## Tech Stack

| 領域 | 採用技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router, Server Components) |
| 言語 | TypeScript(strict) |
| DB / Auth | Supabase(Postgres + RLS + Auth) |
| スタイル | Tailwind CSS + デザイントークン(navy / blue / teal / amber / pink / purple) |
| フォント | M PLUS Rounded 1c(Google Fonts) |
| ホスティング | Vercel |

---

## 既存スクリーンと URL マップ

| URL | 役割 | アクセス可能ロール |
|---|---|---|
| `/sign-in` | サインイン | 全員(未認証) |
| `/sp/home` | 作業員モバイルホーム | worker / leader |
| `/sp/report3/new` | REPORT3 入力(モバイル) | worker / leader |
| `/sp/report3/[id]` | 日報詳細 | 全員(自分の or 管理権限あり) |
| `/sp/approvals` | 承認待ち日報(モバイル) | leader / office / ceo |
| `/sp/profile` | プロフィール(モバイル) | 全員 |
| `/pc/home` | 経営ダッシュボード | office / ceo / system |
| `/pc/approvals` | 承認待ち日報(PC) | office / ceo / system |
| `/pc/projects` | 現場一覧(PC) | office / ceo / system |
| `/pc/profile` | プロフィール(PC) | 全員 |

ロール別ホーム振り分けは `src/server/auth/session.ts:homeForRole()` に定義。

---

## テスト用ログイン情報(全テナント = SAKURA)

| ロール | Email | パスワード | 表示名 | ログイン後のリダイレクト先 |
|---|---|---|---|---|
| ceo | `admin@sakura-os.local` | `Sakura2026!` | 管理者(初期) | `/pc/home` |
| office | `office@sakura-os.local` | `Sakura2026!` | 佐藤 花子 | `/pc/home` |
| leader | `leader@sakura-os.local` | `Sakura2026!` | 鈴木 一郎 | `/sp/home` |
| worker | `worker@sakura-os.local` | `Sakura2026!` | 山田 太郎 | `/sp/home` |

> 本番リリース前に必ず変更してください。これらは MVP 確認用のシード値です。

---

## ローカル開発

```bash
npm install --legacy-peer-deps   # 初回のみ
npm run dev                      # http://localhost:3000
```

`.env.local` は **絶対に git にコミットしない**(.gitignore 済み)。Vercel ダッシュボードで Environment Variables として設定する。

### 必要な環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://qmmvebwyepxdfbtjpjfu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

---

## 主要なコマンド

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド(Vercel が裏で実行) |
| `npm run start` | 本番ビルドをローカルで起動 |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript 型チェック |

---

## ディレクトリ構成

```
src/
  app/
    sign-in/                     # サインイン画面 + Server Action
    sign-out/                    # サインアウト route
    (authenticated)/             # 認証必須グループ
      layout.tsx                 # 共通ヘッダー(navy グラデ + ロゴ)
      sp/                        # モバイル UI(作業員・リーダー)
        layout.tsx               # ボトムナビ付き
        home/
        report3/
        approvals/
        profile/
        _components/BottomNav.tsx
      pc/                        # デスクトップ UI(事務・経営層)
        layout.tsx               # サイドバー付き
        home/
        approvals/
        projects/
        profile/
        _components/Sidebar.tsx
    error.tsx                    # 全体エラー境界
    not-found.tsx                # 404
  features/
    report3/
      schemas.ts                 # Zod スキーマ
      actions/
        submit.ts                # REPORT3 投稿
        approve.ts               # リーダー承認
  lib/
    supabase/                    # Server / Browser クライアント
    format.ts                    # 日本語ロケール日付
  server/
    auth/session.ts              # requireSession + homeForRole
  middleware.ts                  # Supabase セッションリフレッシュ

supabase/
  migrations/0001_initial.sql    # 9 tables + RLS + helpers
  seed/0001_seed_sakura.sql      # SAKURA テナント + 33 work_classifications
```

---

## ロードマップ

| 段階 | スコープ | 状況 |
|---|---|---|
| **Phase B(MVP骨格)** | 認証・ロール別ホーム・REPORT3 入力/閲覧/承認 | ✅ 本実装 |
| Beta(第3段階) | 工事概況表・現場別原価管理表・客先別売上・車両運行・工具QR管理 | 未着手 |
| Phase 4(ゲーム拡張) | XP / バッジ / クエスト / サクライコイン / ナビ / パワプロ風UI | 未着手 |

詳細は `design/prd/product-concept.md` を参照。

---

## 参考ドキュメント

- 製品コンセプト: `design/prd/product-concept.md`
- 26 システム分解: `design/prd/systems-index.md`
- REPORT3 PRD: `design/prd/REPORT3.md`
- 原子 fanout 設計: `docs/architecture/adr-0001-report3-atomic-fanout.md`
- デザイントークン: `design/design-system/design-system-tokens.md`
