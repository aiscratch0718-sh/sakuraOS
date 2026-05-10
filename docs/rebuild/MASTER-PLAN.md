# SAKURA OS リビルド マスタープラン

> **目的**: クライアント(さくら株式会社・秋元様)に評価いただいた v4.0 デモ
> (`C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4`)のデザイン言語と
> ゲーミフィケーション機能を、現行の本番品質コード(Next.js 15 +
> Supabase + RLS + 認証実装済み)に統合する。
>
> **方針**: 既存の本番アーキテクチャ(REPORT3, 見積, 請求, 領収書, RBAC, RLS)は
> 維持。デモの「顔」のデザイントークンと、未実装のゲーミフィケーション層
> (ポイント / 称号 / マスコット獅子丸 / 現場マップ / ボスHPモニター)を追加。

---

## 全体構成(3フェーズ・累計43タスク)

| フェーズ | 内容 | タスク数 | 想定セッション |
|---|---|---|---|
| Phase 1 | ビジュアル基盤(デザイントークン + 共通コンポーネント) | 8 | 1〜2 |
| Phase 2 | ダッシュボード再構成 + 獅子丸マスコット | 9 | 2〜3 |
| Phase 3-A | ポイント管理システム | 7 | 2 |
| Phase 3-B | パワプロ風ステータス画面 | 8 | 2〜3 |
| Phase 3-C | 現場マップ画面 | 5 | 1〜2 |
| Phase 3-D | ボスHPモニター(TV用) | 4 | 1 |
| Phase 3-E | 幹部育成スキルツリー | 3 | 1 |
| Phase 4 | 演出 / アニメーション仕上げ | 4 | 1 |

---

## デザイントークン参照(デモ版 base.css より)

```
--p1: #D9415A  --p1-light: #FDEEF1  --p1-glow: rgba(217,65,90,0.3)   /* 赤 = 警告/重要 */
--p2: #C47A00  --p2-light: #FEF5E4  --p2-glow: rgba(196,122,0,0.3)   /* 茶金 = 注意 */
--p3: #0A8F6E  --p3-light: #E4F7F2  --p3-glow: rgba(10,143,110,0.3)  /* 緑 = 順調/承認 */
--p4: #5B3FA8  --p4-light: #F0EAFB  --p4-glow: rgba(91,63,168,0.3)   /* 紫 = 称号/特殊 */
--ink: #1A2740  --sub: #4A5E7A  --muted: #8099BA
--border: #D8E8F5  --bg: #F6F9FC  --white: #FFFFFF  --panel: #EBF2FB
--gold: #FFD700  --silver: #C0C0C0  --bronze: #CD7F32
--shadow-sm: 0 2px 8px rgba(11,31,69,0.06)
--shadow-md: 0 8px 24px rgba(11,31,69,0.1)
--radius: 12px  --radius-lg: 16px  --radius-xl: 20px
```

ボディ背景(ログイン画面など): `linear-gradient(135deg, #0B1F45 0%, #0D1A35 50%, #0F1528 100%)`

---

# Phase 1: ビジュアル基盤

> 既存機能はいじらない。デザイン言語だけ揃える。リスク最小・効果最大。

## P1-01: Tailwind config にデザイントークン追加
- **ファイル**: `tailwind.config.ts`(または `.js`)
- **内容**: `colors.p1〜p4` + `colors.gold/silver/bronze` + `boxShadow.p1-glow〜p4-glow` + `borderRadius.btn` 等
- **AC**: `bg-p3` `text-p4` `shadow-p1-glow` などのクラスが使える

## P1-02: グローバル CSS 変数の整備
- **ファイル**: `src/app/globals.css`(または `styles/globals.css`)
- **内容**: `:root` に上記カラーを CSS 変数として定義(動的テーマ切替の基盤と整合)
- **AC**: `var(--p1)` などが全コンポーネントから参照可能

## P1-03: 共通コンポーネント `<KpiCard>` 作成
- **ファイル**: `src/components/ui/KpiCard.tsx`
- **Props**: `label`, `value`, `unit`, `subText`, `trend?: { dir: "up" | "down"; value: string }`, `accent: "p1"|"p2"|"p3"|"p4"|"gold"`, `icon: string`
- **構造**: 左4pxバー + 角アイコンタイル + ラベル + 大きな値 + サブテキスト
- **AC**: hover で `translate-y-[-2px]` + `shadow-md`

## P1-04: 共通コンポーネント `<AlertCard>` `<AlertItem>` 作成
- **ファイル**: `src/components/ui/AlertCard.tsx`
- **構造**: 左4px赤ボーダー + 微弱グラデ背景 + タイトル + バッジ件数 + Alert 横並び
- **AC**: 0件時は `null` を返す

## P1-05: 共通コンポーネント `<ProgressBar>` `<HpBar>` 作成
- **ファイル**: `src/components/ui/ProgressBar.tsx`, `HpBar.tsx`
- **Props**: `value`, `max`, `color?`, `size?`
- **AC**: アクセシブル(`role="progressbar"` + `aria-valuenow` 等)

## P1-06: 共通コンポーネント `<DataTable>` スタイル統一
- **ファイル**: `src/components/ui/DataTable.tsx`(or `data-table` クラスを globals.css に)
- **内容**: th: アンダーライン2px + uppercase + tracking + bg。td: hover で panel 色。
- **AC**: 既存のテーブルを置換しても見た目が崩れない

## P1-07: `<Tag>` `<Badge>` `<Pill>` 統一
- **ファイル**: `src/components/ui/Tag.tsx`
- **バリエーション**: `p1/p2/p3/p4/gold/silver/bronze/blue/purple`
- **AC**: `pill-blue` `pill-amber` の既存クラスとの互換 or 置換完了

## P1-08: 既存ページの段階的差し替え
- **対象**: `/pc/home`, `/pc/reports`, `/pc/projects`, `/pc/customers`, `/pc/receipts` など全21ページ
- **作業**: 既存の自前カード・テーブルを Phase 1 共通コンポーネントに置換
- **AC**: 全ページで visual regression テストパス。レイアウト崩れゼロ。

---

# Phase 2: ダッシュボード再構成 + 獅子丸マスコット

## P2-01: ダッシュボード(`/pc/home`)レイアウト刷新
- KPI 4枚 → アラート → 本日の稼働現場 → 獅子丸提案 → グリッド2列(進行中現場 + 今日の活動)
- **AC**: モバイル(/sp/home)は別レイアウトで構築

## P2-02: KPI クエリ実装
- 「本日の出来高達成率」: `report3_entries.work_date = today` の hours 集計 ÷ projects.daily_target
- 「出勤中」: `report3_entries.work_date = today` の `count(distinct user_id)` / `profiles.count`
- 「安全コンボ」: 連続無事故日数(`incidents` テーブル無発生連続)
- 「今月の称号付与数」: `titles_granted.count where granted_at >= 月初` (P3-B-01 で追加)

## P2-03: アラート集約クエリ
- 期限切れ資格: `user_qualifications.expiry_date <= now() + 14 day`
- 承認待ち: `report3_entries.requires_leader_approval = true and approved_at is null`
- 日報未提出: 出勤予定だが今日の `report3_entries` が無いユーザー
- ポイント交換承認待ち: `exchange_requests.status = 'pending'`(P3-A-04 で追加)

## P2-04: 本日の稼働現場テーブル
- `projects` join `report3_entries` (today) を集計
- 列: 現場名 / 天候 / 担当班 / 出勤数 / 本日の目標 / 達成率 / KY実施 / 状態
- 天候は外部 API(後回し可、最初は固定値)

## P2-05: タイムライン(今日の活動)
- `audit_logs` を時系列で取得 → タイトル / 説明 / 時刻表示
- Realtime 購読で逐次追加(後でフェーズ4)

## P2-06: 🦁 獅子丸サジェスト(ルールベース)
- **新規 server action**: `generateShishimaruAdvice(tenantId)`
- **ロジック**: 当面ルールベース(承認待ち > 5 → 「決裁が滞っておるぞ」、人件費が予算超過 → 警告 etc)
- **DB**: 新規 `suggestions` テーブル(id, tenant_id, type, severity, title, message, target_url, created_at, dismissed_at)
- **AC**: ダッシュボード上部に黄色グラデのカードで表示。クリックで対象ページへ遷移。

## P2-07: 🦁 獅子丸の表情ロジック
- 達成率 0-50%: 😰 / 50-80%: 😊 / 80-100%: 🔥 / 100%+: 🎉
- これを `<Shishimaru>` コンポーネントの `mood` prop で切替
- **AC**: ダッシュボード・ステータス画面・ボスHPモニターで再利用可能

## P2-08: 通知ドロップダウン(ヘッダー)
- 現状 `/pc/notifications` ページのみ → ヘッダーに鈴アイコン + バッジ + ドロップダウン
- 未読 5件まで表示、「すべて既読にする」ボタン、「すべての通知へ」リンク
- **AC**: クリック外で閉じる、Esc で閉じる

## P2-09: 既存「ランキング」ページの位置づけ整理
- 現状 `/pc/gamification` がある → P3-A の「ポイント管理」と統合 or リネーム
- **決定事項**: P3-A 着手時に方針確定

---

# Phase 3-A: ポイント管理システム

## P3-A-01: マイグレーション 0012 — ポイント関連テーブル
```sql
-- 全社員のポイント残高を保持(集計ビューでも代替可だが速度のため実体化)
create table public.points_balances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id),
  balance integer not null default 0,
  total_earned integer not null default 0,
  total_spent integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 全トランザクション(append only)
create table public.points_ledger (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  type text not null check (type in ('earn', 'spend', 'bonus', 'adjust', 'refund')),
  amount integer not null,
  balance_after integer not null,
  reason text not null,
  source_table text,        -- 'report3_entries' | 'safety_combo' | 'titles_granted' | manual
  source_id uuid,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 獲得ルール
create table public.point_rules (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  category text not null,    -- '出来高' | '安全' | '称号' | '日報' | 'リーダー' | 'KY活動'
  description text not null,
  amount_per_unit integer not null,
  unit text not null,         -- '㎡' | '日' | '回' | '月' | '20日'
  monthly_cap integer,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 報酬カタログ
create table public.rewards (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  icon text,
  cost_points integer not null,
  description text,
  is_rare boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0
);

-- 交換申請
create table public.exchange_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  reward_id uuid not null references public.rewards(id),
  cost_points integer not null,
  status text not null check (status in ('pending', 'approved', 'rejected', 'fulfilled')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS: 自テナントのみ。spend / approve は office+
```

## P3-A-02: シード — 初期 point_rules + rewards
- 出来高: 10pt/㎡, 月上限 2000pt
- 安全: 5pt/日, 月上限 500pt
- 称号: 50〜200pt, 上限なし
- 日報: 100pt/20日, 月上限 300pt
- 報酬: ☕カフェギフト 200pt / 🎟️有給0.5日 1000pt / 🛍️Amazonギフト 1500pt / 👑社長ランチ 5000pt

## P3-A-03: Server Actions
- `awardPoints(userId, ruleCategory, amount, reason, sourceTableId?)`
- `requestExchange(rewardId)` — 残高チェック
- `approveExchange(requestId)` — office+ のみ、残高引き落とし
- `rejectExchange(requestId, reason)`
- `adjustPoints(userId, delta, reason)` — admin only
- 全て points_ledger に append + balances 更新を 1 トランザクションで

## P3-A-04: ポイント自動付与バッチ(pg_cron)
- 日次: REPORT3 の前日分 hours から `awardPoints(user, '出来高', hours * 10, ...)`
- 日次: 前日インシデント無 → 安全コンボ +5pt
- 月次: 月末リセット系の集計

## P3-A-05: `/pc/points` ページ
- 構成: 4 KPIs + ランキング + 報酬交換所 + 獲得内訳 + 12週推移グラフ
- KPI: 全社合計 / 今月獲得 / 交換申請未処理 / 今月交換済み

## P3-A-06: `/pc/points/rules` ページ — 管理者専用
- point_rules の CRUD
- カテゴリ・付与pt・上限・有効/停止 の編集

## P3-A-07: `/pc/points/exchange-requests` ページ
- 未処理一覧 + 承認/却下ボタン
- 履歴(approved / rejected / fulfilled)も同ページ

---

# Phase 3-B: パワプロ風ステータス画面

## P3-B-01: マイグレーション 0013 — 称号・スキル関連テーブル
```sql
-- 称号マスタ
create table public.title_definitions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  code text not null,            -- '現場復旧の神' など
  display_name text not null,
  icon text not null,
  description text not null,
  rarity text not null check (rarity in ('bronze', 'silver', 'gold', 'platinum')),
  unlock_condition text,         -- 自然言語で記述(将来は構造化)
  reward_points integer not null default 0,
  is_active boolean not null default true,
  unique (tenant_id, code)
);

-- 称号付与履歴
create table public.titles_granted (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  title_id uuid not null references public.title_definitions(id),
  granted_by uuid not null references public.profiles(id),
  granted_at timestamptz not null default now(),
  reason text,
  unique (user_id, title_id)
);

-- スキルパラメータ(算出済み値を保持。ロジックは後述)
create table public.skill_parameters (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id),
  technical integer not null default 0,    -- 技術力
  judgment integer not null default 0,     -- 判断力
  safety integer not null default 0,       -- 安全
  communication integer not null default 0,-- 報連相
  stamina integer not null default 0,      -- 体力
  responsibility integer not null default 0,-- 責任感
  level integer not null default 1,
  exp integer not null default 0,
  exp_to_next integer not null default 1000,
  recalculated_at timestamptz not null default now()
);

-- 特殊能力(マスタ)
create table public.special_abilities (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  code text not null,
  display_name text not null,
  icon text not null,
  description text not null,
  rarity text not null check (rarity in ('bronze', 'silver', 'gold')),
  unique (tenant_id, code)
);

-- ユーザーが保持する特殊能力
create table public.user_abilities (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ability_id uuid not null references public.special_abilities(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, ability_id)
);
```

## P3-B-02: シード — 初期称号 12件 + 特殊能力 8件
- 称号例: 現場復旧の神 / 安全の番人 / スピードスター / 鉄壁の守護者 / コミュニケーター / レジェンド施工
- 特殊能力例: 「不屈」「閃き」「鼓舞」「冷静沈着」「クリティカルヒット」

## P3-B-03: スキルパラメータ算出ロジック(server action)
- `recalculateSkillParameters(userId)` を実装
- ロジック(デモ版 wf-note より):
  - 技術力: AVG(work_evaluations.quality) + certifications.count×2
  - 判断力: AVG(incident_responses.speed_score)(暫定: 承認まで時間の逆数)
  - 安全: safety_combo_days / 2 + ky_completion_rate×50
  - 報連相: report3_entries 提出率×60 + meeting_evaluations×40(暫定: 提出率のみ)
  - 体力: 出勤率×80 + (1-残業率)×20
  - 責任感: 期限達成率×60 + peer_evaluations×40(暫定: 期限達成率のみ)
- **AC**: 既存DBから算出可能なものから先に実装、未集計のものは固定値で許容

## P3-B-04: `/pc/profile/status` ページ — パワプロ風画面
- 左: キャラカード(avatar / level / EXP / 6パラメータ + ランク / 特殊能力)
- 右: SVG レーダーチャート / 称号一覧 / 獅子丸アドバイス / 保有資格 + 出勤情報

## P3-B-05: SVG レーダーチャート コンポーネント
- 6軸(技術力 / 判断力 / 安全 / 報連相 / 体力 / 責任感)
- 値 0〜100 → ポリゴン頂点座標計算
- transition で滑らかに描画
- **ファイル**: `src/components/ui/RadarChart.tsx`

## P3-B-06: 称号付与モーダル(管理者用)
- title_definitions から選択
- ユーザー選択
- 理由入力
- **AC**: 付与時に `awardPoints` で reward_points 加算 + 称号獲得演出を被付与者にプッシュ通知

## P3-B-07: 称号獲得演出オーバーレイ(P4 と統合可)
- フルスクリーン + キラキラ + バウンス
- **ファイル**: `src/components/effects/TitleGrantedOverlay.tsx`
- 自身が新しい称号を持った状態でログインしたら 1 回だけ表示(Cookie / localStorage で既読管理)

## P3-B-08: 全社員一覧ページ強化
- 既存 `/pc/users` をパワプロ要素拡張
- 一覧に「Lv / 主要称号 / 今月pt」を追加
- 詳細クリックで P3-B-04 のステータス画面へ

---

# Phase 3-C: 現場マップ画面

## P3-C-01: マイグレーション 0014 — 現場マップ用カラム追加
```sql
alter table public.projects
  add column if not exists area_group text default '東京エリア',
  add column if not exists is_boss_stage boolean not null default false,
  add column if not exists map_position_x numeric,    -- 0〜100 (%)
  add column if not exists map_position_y numeric,    -- 0〜100 (%)
  add column if not exists icon text default '🏠';
```

## P3-C-02: `/pc/projects/map` ページ
- WORLD タブ(area_group の distinct で動的生成)
- SVG ノード + パス
- ノード色は進捗で動的:
  - ≥60%: 順調(緑) / 30〜59%: 注意(黄) / <30%: 遅延(赤パルス) / 0%: 未着手

## P3-C-03: 獅子丸キャラマーカー
- ログインユーザーの「現在配置中の現場」(`report3_entries` 直近)に表示
- アニメーション付き(bounce)

## P3-C-04: 現場詳細ポップアップ
- ノードクリック → 進捗 / 配置班 / 今日の出来高 / 安全コンボ / 残工期 / ステータス
- ボスHPモニターへ / クエスト入力へ ボタン

## P3-C-05: マップエディタ(管理者用)
- `/pc/projects/[id]/edit` で map_position_x/y / area_group / is_boss_stage を設定可能に

---

# Phase 3-D: ボスHPモニター(TV用画面)

## P3-D-01: `/display/site/[id]` 新ルート
- 認証は省略可(QRコード経由のキオスク表示前提)or 共有閲覧トークン
- ヘッダー / サイドバー無しのフルスクリーン
- ダーク背景 + LIVE バッジ + 日時

## P3-D-02: BOSS HP メガゲージ
- 大きな進捗バー + パーセント数値カウントアップ
- 本日の達成量 / 残りHP / 稼働人数 / ㎡/人/時 の4 stats

## P3-D-03: TODAY'S TOP 3 + 安全コンボ + 獅子丸
- ランキングトップ3(本日の出来高)
- safety_combo の大きな数値
- 獅子丸メッセージ(達成率で表情変化)

## P3-D-04: ティッカー(下部スクロール)
- audit_logs の直近を流す
- Realtime で逐次追加

---

# Phase 3-E: 幹部育成スキルツリー

## P3-E-01: マイグレーション 0015
```sql
create table public.training_plans (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  current_role text,
  target_role text,
  start_date date not null,
  target_date date,
  status text not null check (status in ('active', 'completed', 'on_hold')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.skill_tree_nodes (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  parent_id uuid references public.skill_tree_nodes(id),
  title text not null,
  description text,
  required_certification_id uuid,
  required_skill_param text,
  required_skill_value integer,
  is_completed boolean not null default false,
  completed_at timestamptz,
  display_x numeric,
  display_y numeric
);
```

## P3-E-02: `/pc/training` 一覧
## P3-E-03: `/pc/training/[id]` スキルツリー画面 — SVG パス + ノード可視化

---

# Phase 4: 演出 / アニメーション

## P4-01: 数値カウントアップアニメ
- KPI / レーダー値 / BOSS HP に CSS 変数 + transition で滑らか加算

## P4-02: GSAP 風 entry アニメ(任意)
- 各カードが下からふわっと入る(`@keyframes fadeIn`)
- prefers-reduced-motion で無効化

## P4-03: 獅子丸 float アニメ
- 浮遊する 6px の Y 軸往復(2.5s, ease-in-out, infinite)

## P4-04: モバイル(/sp/*)版の主要画面
- `/sp/home` — シンプル版ダッシュボード
- `/sp/profile` — ステータス画面のモバイル最適版
- `/sp/points` — 自分のポイント残高 + 交換申請

---

# 完了の定義(全フェーズ通しの DoD)

- 全マイグレーション適用済み(0012〜0015)
- 全タスクのうち各 AC 達成
- `/pc/home` を秋元様(クライアント)に見せた時、デモ版の v4.0 のテイストが残りつつ、本物のデータで動作している
- `npm run build` がエラーなくパス
- 既存の本番機能(REPORT3 / 見積 / 請求 / 領収書 / マスタ)は一切退行していない
- `PROGRESS.md` の全タスクがチェック済み

---

# このプランを変更する場合のルール

1. クライアントから新たな要望が来た時は **このファイルを書き換えず** に
   `PROGRESS.md` の「Decisions Log」に追記する
2. プラン本体に変更が必要な場合のみここを編集し、編集理由を末尾の
   「Plan Change History」に追記する

## Plan Change History
- 2026-05-10: 初版作成(Claude セッションにて)
