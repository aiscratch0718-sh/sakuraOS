# Deployment Guide — Phase B

このドキュメントは Phase B(Minimum Spine)を Vercel に出すまでの手順書です。
**約 30〜60 分** で完了します。

---

## 前提

- ✅ Supabase プロジェクト作成済み
- ✅ GitHub リポジトリ `aiscratch0718-sh/sakuraOS` 作成済み
- ✅ Vercel アカウント GitHub 連携済み
- ✅ `.env.local` に Supabase URL + anon key 設定済み

---

## ステップ1: ローカル環境セットアップ (~10分)

### 1-1. Node.js + pnpm 確認

```bash
node -v    # v20 以上推奨
npm -v     # v10 以上
```

`pnpm` を使うのがおすすめ(なければ `npm` でも動きます):

```bash
npm install -g pnpm
```

### 1-2. 依存関係インストール

プロジェクトのルート(このREADMEがある場所)で:

```bash
pnpm install
# または npm install
```

3〜5分かかります。

### 1-3. ローカル動作確認(まだ Supabase スキーマ未投入なのでサインインは失敗するはず)

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く → `/sign-in` にリダイレクトされれば OK。
コンソールに大きなエラーが出ていなければここまで OK。

サインインはまだ動きません(次のステップで Supabase 側を準備する)。

---

## ステップ2: Supabase スキーマ投入 (~5分)

### 2-1. Supabase ダッシュボードを開く

https://supabase.com/dashboard → プロジェクト `sakura-os` を選択

### 2-2. SQL Editor で migration を実行

1. 左サイドバー **SQL Editor** → **New query**
2. ローカルの `supabase/migrations/0001_initial.sql` の内容を全部コピー
3. SQL Editor に貼り付け → 右下 **Run** ボタン
4. 「Success. No rows returned」と表示されれば OK

### 2-3. Seed データ投入

1. **New query** で別タブを開く
2. `supabase/seed/0001_seed_sakura.sql` の内容を全部コピー → 貼り付け
3. **Run** → SAKURA テナントと工種マスタが入ります

### 2-4. 確認

左サイドバー **Table Editor** で:
- `tenants` に1行(さくら株式会社)
- `work_classifications` に約 40 行
- `profiles` は **まだ空**(次のステップで自分のユーザーを作る)

---

## ステップ3: 初回ユーザー作成 (~5分)

### 3-1. Supabase Auth にユーザー追加

1. 左サイドバー **Authentication** → **Users** タブ
2. 右上 **Add user** → **Create new user**
3. Email: 自分のメール / Password: 強いもの
4. **Auto Confirm User** に**チェック**(メール確認をスキップ)
5. **Create user** クリック
6. 作成されたユーザーの **UID** をコピー(`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 形式)

### 3-2. profiles 行を追加

**SQL Editor** で:

```sql
insert into public.profiles (id, tenant_id, display_name, role, hourly_rate_cents)
values (
  'ここに3-1でコピーしたUID',
  '00000000-0000-0000-0000-000000000001',
  '自分の名前',
  'ceo',  -- 開発中は ceo にしておくと全ロール画面が見える
  500000  -- 5,000円/h(プレースホルダー)
);
```

→ **Run**

### 3-3. テスト用プロジェクトを1件追加(REPORT3 入力に必須)

```sql
-- まずテスト顧客を1件
insert into public.customers (id, tenant_id, name)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'テスト顧客株式会社'
);

-- テスト現場を1件
insert into public.projects (id, tenant_id, customer_id, name, status)
values (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  'テスト現場(練習用)',
  'active'
);
```

→ **Run**

---

## ステップ4: ローカルで動作確認 (~5分)

```bash
pnpm dev
```

http://localhost:3000 を開く:

1. `/sign-in` にリダイレクトされる
2. 3-1で作ったメール/パスワードでサインイン
3. ロールが `ceo` なので `/pc/home` にリダイレクトされる
4. 画面右上に自分の名前と「経営層」ラベル
5. ↑ ロールを `worker` に変えると `/sp/home` に行く(SQL Editor で `update profiles set role = 'worker' where id = ...`)

### REPORT3 入力テスト

`profiles.role` を `worker` に変更後 → `/sp/home` で **「📝 今日の作業日報を書く」** をタップ:

1. 現場: テスト現場(練習用)
2. 大分類: 配管 / 中分類: 冷媒 / 小分類: 塩ビ配管
3. 時間: 4h
4. **提出する** → ホームに戻り「直近の提出履歴」に表示されれば成功 🎉

データベース確認:
- `report3_entries` に1行
- `report3_rows` に1行
- `audit_log` に `report3.submitted` が1行

---

## ステップ5: GitHub に push (~5分)

```bash
# プロジェクトルートで
rm -rf .git
git init
git add .
git commit -m "Initial: SAKURA OS Phase B minimum spine"
git branch -M main
git remote add origin https://github.com/aiscratch0718-sh/sakuraOS.git
git push -u origin main
```

GitHub のリポジトリページでコードが反映されているか確認。

---

## ステップ6: Vercel デプロイ (~10分)

### 6-1. Vercel プロジェクト設定

1. https://vercel.com/dashboard
2. すでにインポート済みの `sakuraOS` プロジェクトをクリック
3. **Settings** → **Environment Variables** を開く

### 6-2. 環境変数を追加

以下3つを追加(全て **Production / Preview / Development** にチェック):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qmmvebwyepxdfbtjpjfu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key の値) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase Dashboard → Settings → API → service_role key の値) |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` は秘密鍵。今は Phase B では**使っていない**ので空でも動くが、後で必要になるので入れておく。

### 6-3. デプロイ

1. 左サイドバー **Deployments** タブ
2. 右上 **... → Redeploy** または、git push で自動デプロイ
3. ビルドログを眺める(2〜4分)
4. 成功したら **Visit** ボタンで本番URL確認

URL は `https://sakura-os-xxxxx.vercel.app` のような形式になる。

### 6-4. 本番サインイン確認

本番URLで `/sign-in` → 3-1 で作ったアカウントでログイン → 動けば完了 🎉

---

## トラブルシューティング

### `pnpm install` で失敗

- Node.js のバージョンを確認 (`node -v`)、v20 以上を推奨
- `node_modules/` を消して再実行 (`rm -rf node_modules .next && pnpm install`)

### サインイン後 `profile_missing` エラー

- ステップ3-2の SQL を実行し忘れている → SQL Editor で `select * from profiles` で確認

### REPORT3 提出時に「保存に失敗しました」

- ブラウザの DevTools → Network タブで Server Action のレスポンスを確認
- Supabase Dashboard → Logs で SQL エラーを確認(よくあるのは RLS ポリシーで insert が拒否されているケース)

### Vercel ビルドが失敗

- Build Logs を確認
- 大半は環境変数が未設定 / 名前 typo

---

## 次のステップ

Phase B が動いたら:

1. **アカウント追加**: 作業員・現場リーダー・事務 のテストアカウントを Supabase Auth で作成
2. **PRD通りの機能追加**: GPS打刻 / ししまるナビ / 入力漏れ検知 / 通知...
3. **ADR-0001 完全実装**: 現状の実装は単一トランザクション化していない部分があるので、Postgres function (RPC) で 5系統 atomic fanout を実装
4. **2FA**: Supabase Auth の TOTP 2FA を有効化
5. **独自ドメイン**: Vercel で `sakura-os.com` 等を割り当て

これらは別のスプリントで `/sprint-plan` を使って計画していきます。
