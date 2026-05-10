# SAKURA OS リビルド マスタープラン

> **目的**: クライアント(さくら株式会社・秋元様)に評価いただいた v4.0 デモ
> (`C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4`)のデザイン言語と
> ゲーミフィケーション機能を、現行の本番品質コード(Next.js 15 +
> Supabase + RLS + 認証実装済み)に統合する。
>
> **方針**: 既存の本番アーキテクチャ(REPORT3, 見積, 請求, 領収書, RBAC, RLS)は
> 維持。デモの「顔」のデザイントークンと、未実装のゲーミフィケーション層
> (ポイント / 称号 / マスコットししまる / 現場マップ / ボスHPモニター)を追加。

---

## 全体構成(累計 約 100 タスク)

| フェーズ | 内容 | タスク数 | 想定セッション |
|---|---|---|---|
| Phase 1 | ビジュアル基盤(デザイントークン + 共通コンポーネント) | 8 | 1〜2 |
| Phase 2 | ダッシュボード再構成 + ししまるマスコット | 9 | 2〜3 |
| Phase 3-A | ポイント管理システム | 7 | 2 |
| Phase 3-B | パワプロ風ステータス画面 | 8 | 2〜3 |
| Phase 3-C | 現場マップ画面(マリオ風 + 従業員配置) | 8 | 2〜3 |
| Phase 3-D | ボスHPモニター(TV用) | 4 | 1 |
| Phase 3-E | 幹部育成スキルツリー | 3 | 1 |
| Phase 4 | 演出 / アニメーション仕上げ | 4 | 1 |
| **Phase 5** | **CORE 業務補完(TASK / SCH / ATT 専用打刻)** | **12** | **3〜4** |
| **Phase 6** | **GENKA 詳細 + GAIKYO(工事概況表)** | **8** | **2〜3** |
| **Phase 7** | **外部 SaaS 連携(LINE WORKS / Money Forward / Cloud Sign / Google Maps)** | **16** | **5〜6** |
| **Phase 8** | **ゲーミフィケーション完成(バッジ画面 / クエスト / XP 自動付与拡張 / さくらししまる AI ナビ)** | **9** | **3〜4** |
| **Phase 9** | **ロール別画面ガード徹底(全画面の権限分離)** | **5** | **1〜2** |
| **Phase 10** | **汎用ファイル管理(Google Drive 風)+ ロール別アクセス制御 + バックアップ + 履歴** | **12** | **3〜4** |
| **合計** | **— ** | **約 110** | **約 30〜40 セッション** |

> 設計図 12 項目との照合監査(2026-05-10)結果から Phase 5〜10 を追加。
> 詳細は `docs/rebuild/SESSION-LOG.md` の S4.5 監査セッション参照。

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

# Phase 2: ダッシュボード再構成 + ししまるマスコット

## P2-01: ダッシュボード(`/pc/home`)レイアウト刷新
- KPI 4枚 → アラート → 本日の稼働現場 → ししまる提案 → グリッド2列(進行中現場 + 今日の活動)
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

## P2-06: 🦁 ししまるサジェスト(ルールベース)
- **新規 server action**: `generateShishimaruAdvice(tenantId)`
- **ロジック**: 当面ルールベース(承認待ち > 5 → 「決裁が滞っておるぞ」、人件費が予算超過 → 警告 etc)
- **DB**: 新規 `suggestions` テーブル(id, tenant_id, type, severity, title, message, target_url, created_at, dismissed_at)
- **AC**: ダッシュボード上部に黄色グラデのカードで表示。クリックで対象ページへ遷移。

## P2-07: 🦁 ししまるの表情ロジック
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
- 右: SVG レーダーチャート / 称号一覧 / ししまるアドバイス / 保有資格 + 出勤情報

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

# Phase 3-C: 現場マップ画面(マリオ風 WORLD MAP + 従業員配置)

> **コンセプト**(板澤様 2026-05-10 確定):
> - マリオのステージマップがモチーフ
> - **WORLD - STAGE 形式のステージナンバリング**(1-1, 1-2, 2-1...)
> - WORLD = エリア(area_group: 東京エリア / 神奈川エリア / 埼玉エリア 等)
> - STAGE = エリア内の現場(現場名で表示、内部的には番号も持つ)
> - **従業員がどの現場に配置されているか地図上で確認できる**(本要件は最重要)
> - クライアントと詳細詰めは後日。導入確定済み、実装しないとならない。
>
> 詳細仕様確定までの暫定実装方針として進める。クライアント確認後に修正可能。

## P3-C-01: マイグレーション 0014 — 現場マップ用カラム + ステージ番号
```sql
alter table public.projects
  add column if not exists area_group text default '東京エリア',
  add column if not exists is_boss_stage boolean not null default false,
  add column if not exists map_position_x numeric,        -- 0〜100 (%)
  add column if not exists map_position_y numeric,        -- 0〜100 (%)
  add column if not exists icon text default '🏠',
  -- ステージナンバリング(1-1, 1-2 形式):
  --   world_number は area_group ごとに 1, 2, 3...(ユーザー側設定 or 自動)
  --   stage_number は同 world 内で 1, 2, 3...
  --   表示は「{world_number}-{stage_number}: {project.name}」
  add column if not exists world_number integer,          -- 1, 2, 3...
  add column if not exists stage_number integer,          -- 1, 2, 3...
  -- 同 world 内で stage_number は重複させない
  add constraint uq_projects_world_stage unique (tenant_id, world_number, stage_number) deferrable;

create index idx_projects_world_stage on public.projects(tenant_id, world_number, stage_number);
```

## P3-C-02: `/pc/projects/map` ページ — マリオ風ステージマップ
- 上部に WORLD タブ(area_group の distinct で動的生成、各タブに「WORLD 1: 東京」表記)
- 各 WORLD 内のマップ:
  - SVG パスでステージをつなぐ(マリオ風)
  - ステージノード(現場)に **「1-1」「1-2」表記 + 現場名** を併記
  - クリア状況で見た目変化(完了 = 旗 / 進行中 = 通常 / ボス = 城アイコン)
  - 進捗ノード色:
    - ≥60% 順調(緑)/ 30〜59% 注意(黄)/ <30% 遅延(赤パルス)/ 0% 未着手(点線)
- Mario 風背景装飾(雲・パイプ・ブロック・コイン)はデモ v4.0 から踏襲

## P3-C-03: 従業員配置レイヤー(本要件のキー機能)
**「どの従業員が今どの現場にいるか」を地図上で確認できる UI。**

実装方針:
- **データソース**: 当日の `report3_entries.work_date = today` で `project_id` ごとに `user_id` を集約
  - スケジュール導入後(Phase 5)は `schedules.schedule_date = today` も参照
- **表示**:
  - 各ステージノードの周囲に、配置中の従業員アバター(profiles.display_name の頭文字)を最大 5 つまで重ねて表示
  - 5 名超の場合「+N」バッジ
  - クリックで全配置メンバー一覧ポップアップ
- **モード切替**(管理者目線とプレイヤー目線):
  - **MAP モード(デフォルト)**: 進捗中心で表示
  - **配置モード**: 全従業員のアバターをマップ上に配置(誰がどこにいるか俯瞰)
  - **班別モード**: 班(`teams` or 暫定で `org_departments`)ごとに色分け
- **タイムライン再生**(任意拡張): 過去日を選んで「このメンバーがこの日この現場にいた」を再生

## P3-C-04: ししまるキャラマーカー(自分の現在地)
- ログインユーザーの「本日配置中の現場」(`report3_entries` 直近)に
  公式マスコット画像をマーカー化(`/mascot/mascot-avatar-circle-512.webp` 使用)
- 浮遊アニメ(`animate-floatSlow`)
- 自分が複数現場にいる時は最後の現場優先

## P3-C-05: 現場詳細ポップアップ
- ノードクリック → 進捗 / 配置班 / 配置メンバー一覧 / 今日の出来高 / 安全コンボ / 残工期 / ステータス
- ボタン: 「ボスHPモニターへ」「クエスト入力へ」「Google Maps で開く」(P7-13 で実地図連携)

## P3-C-06: マップエディタ(管理者用)
- `/pc/projects/[id]/edit` で:
  - map_position_x/y(地図上の座標)
  - area_group, world_number, stage_number(ステージ番号)
  - is_boss_stage(ボスフラグ)
  - icon(絵文字 or アイコン名)
- 推奨: ドラッグ&ドロップでマップ画面そのものから直接位置設定できる UI(管理者専用モード)

## P3-C-07: ステージ番号自動採番ヘルパー
- 新規 project 作成時に world_number, stage_number 未指定なら自動的に「同 world の最大 stage_number + 1」を割当
- `assign_next_stage_number(area_group)` server action

## P3-C-08: モバイル(`/sp/map`)版マップ
- 縦スクロールで世界を表示(画面幅小さいので horizontal pan は使わず縦に)
- 配置メンバーは省略表示(タップで詳細)
- 自分が配置されている現場をハイライト(さくらししまるマーカーで可視化)

---

# Phase 3-D: ボスHPモニター(TV用画面)

## P3-D-01: `/display/site/[id]` 新ルート
- 認証は省略可(QRコード経由のキオスク表示前提)or 共有閲覧トークン
- ヘッダー / サイドバー無しのフルスクリーン
- ダーク背景 + LIVE バッジ + 日時

## P3-D-02: BOSS HP メガゲージ
- 大きな進捗バー + パーセント数値カウントアップ
- 本日の達成量 / 残りHP / 稼働人数 / ㎡/人/時 の4 stats

## P3-D-03: TODAY'S TOP 3 + 安全コンボ + ししまる
- ランキングトップ3(本日の出来高)
- safety_combo の大きな数値
- ししまるメッセージ(達成率で表情変化)

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

## P4-03: ししまる float アニメ
- 浮遊する 6px の Y 軸往復(2.5s, ease-in-out, infinite)

## P4-04: モバイル(/sp/*)版の主要画面
- `/sp/home` — シンプル版ダッシュボード
- `/sp/profile` — ステータス画面のモバイル最適版
- `/sp/points` — 自分のポイント残高 + 交換申請

---

# Phase 5: CORE 業務補完(TASK / SCH / ATT 専用打刻)

> 2026-05-10 の設計図照合監査で「設計図 CORE のうち TASK / SCH / 専用 ATT が空白」と判明。
> Phase 5 で REPORT3 への入口となる TASK 管理、配車・人員配置の SCH、
> モバイル専用の打刻画面 ATT を補完する。

## P5-01: マイグレーション 0014 — TASK / SCH / ATT 関連テーブル
```sql
-- TASK: 案件配下のタスク
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid not null references public.projects(id),
  parent_task_id uuid references public.tasks(id),
  title text not null,
  description text,
  status text not null check (status in ('todo','in_progress','blocked','done','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assignee_user_id uuid references public.profiles(id),
  due_date date,
  estimated_hours numeric(6,2),
  actual_hours numeric(6,2) default 0,  -- REPORT3 から自動集計
  display_order integer default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_tasks_project_status on public.tasks(project_id, status);
create index idx_tasks_assignee on public.tasks(assignee_user_id, status);

-- SCH: スケジュール / 配車表
create table public.schedules (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  schedule_date date not null,
  project_id uuid not null references public.projects(id),
  user_id uuid not null references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  shift_start time,
  shift_end time,
  role_in_shift text,  -- 'driver' | 'leader' | 'member'
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now()
);
create unique index uq_schedules_user_date on public.schedules(user_id, schedule_date);
create index idx_schedules_date_project on public.schedules(schedule_date, project_id);
create index idx_schedules_vehicle on public.schedules(vehicle_id, schedule_date);

-- ATT: 専用打刻
create table public.attendance_punches (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  punched_at timestamptz not null default now(),
  punch_type text not null check (punch_type in ('clock_in','clock_out','break_start','break_end')),
  project_id uuid references public.projects(id),
  lat numeric(10,7),
  lng numeric(10,7),
  accuracy_m numeric(7,2),
  source text not null default 'sp_app' check (source in ('sp_app','pc_app','admin_manual')),
  created_at timestamptz default now()
);
create index idx_attendance_user_date on public.attendance_punches(user_id, punched_at desc);
```

## P5-02: REPORT3 fanout に tasks.actual_hours 加算を追加
- `submit_report3_atomic` RPC を更新し、project_id + work_classification と一致するタスクを検索 → actual_hours += hours

## P5-03: `/pc/projects/[id]/tasks` ページ — タスクボード(Kanban 風)
- todo / in_progress / blocked / done の 4 列
- ドラッグ&ドロップで status 更新(client component + server action)
- assignee アバター、due_date バッジ、estimated_hours vs actual_hours の進捗バー

## P5-04: `/sp/tasks` ページ — モバイル: 自分のタスク一覧
- assignee_user_id = 自分、status != done で当日 due 順
- タップで詳細、status 変更ボタン
- REPORT3 入力への近道リンク

## P5-05: `/pc/schedules` ページ — 配車表(週間ビュー)
- 縦軸: ユーザー / 車両、横軸: 日付(7日)
- セルにシフト & 案件 & 車両 を集約表示
- 月単位ビューも切替可

## P5-06: `/pc/schedules/edit` — スケジュール編集
- ドラッグ&ドロップで割当変更
- 衝突検知(同日 user 重複は uq 制約で DB が弾く)

## P5-07: `/sp/today` ページ — 今日の予定 + タスク
- 朝一で見る画面: 今日のシフト / 案件 / タスク / 通知
- ATT 打刻ボタン(出勤/退勤/休憩開始/休憩終了)

## P5-08: ATT 打刻 server action(`punchAttendance`)
- GPS 取得 → punch_type を受け取り attendance_punches に INSERT
- audit_log にも記録

## P5-09: `/pc/attendance` ページ — 勤怠一覧(管理者)
- ユーザー × 日 マトリクス、出退勤時刻と勤務時間
- 差戻し / 手動調整(admin manual punch)機能

## P5-10: スケジュール → REPORT3 の予選定
- `/sp/report3/new` で本日のスケジュールから自動的に project_id / work_classification を初期選択

## P5-11: タスク差戻し / 連動の `notifications` 通知
- タスク assigned, due 接近, blocked → notifications テーブルに INSERT

## P5-12: TASK / SCH / ATT のロール別画面ガード(P9 と整合)
- TASK: 全員閲覧、編集は leader+
- SCH: 閲覧は全員、編集は office+
- ATT 打刻: 本人のみ、閲覧(他人)は leader+ in 同班

---

# Phase 6: GENKA 詳細 + GAIKYO(工事概況表)

> REPORT3 → 原価への自動反映は既存(project_cost_aggregates)。
> Phase 6 では、それを「現場別に詳細表示する画面」と、
> 設計図の核 GAIKYO(工事概況表)を新設する。

## P6-01: マイグレーション 0015 — GENKA / GAIKYO 関連
```sql
-- 原価詳細(REPORT3 / supplier_invoices / receipts / vehicle_runs から集計)
create or replace view public.project_cost_breakdown as
select
  p.id as project_id,
  p.tenant_id,
  p.name as project_name,
  -- 人件費(REPORT3 ベース、既存)
  coalesce(sum(case when src = 'labor' then amount end), 0) as labor_cost,
  -- 材料費(supplier_invoices 'material')
  coalesce(sum(case when src = 'material' then amount end), 0) as material_cost,
  -- 外注費(supplier_invoices 'subcontractor')
  coalesce(sum(case when src = 'subcontractor' then amount end), 0) as subcontract_cost,
  -- 車両費(vehicle_runs * 距離単価 + 駐車場代等)
  coalesce(sum(case when src = 'vehicle' then amount end), 0) as vehicle_cost,
  -- リース費 / 雑費
  coalesce(sum(case when src = 'misc' then amount end), 0) as misc_cost,
  coalesce(sum(amount), 0) as total_cost
from public.projects p
left join (...集計サブクエリ) costs on costs.project_id = p.id
group by p.id, p.tenant_id, p.name;

-- GAIKYO: 工事概況表(現場×期間 集計)
create table public.construction_overview (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid not null references public.projects(id),
  period_start date not null,
  period_end date not null,
  -- 売上(invoices から集計)
  invoice_amount integer not null default 0,
  -- 原価(project_cost_breakdown view から集計)
  labor_cost integer not null default 0,
  material_cost integer not null default 0,
  subcontract_cost integer not null default 0,
  vehicle_cost integer not null default 0,
  misc_cost integer not null default 0,
  total_cost integer not null default 0,
  -- 利益(計算済み)
  gross_profit integer not null default 0,
  gross_profit_rate numeric(5,2),
  -- 進捗
  progress_rate numeric(5,2),
  status text not null default 'in_progress' check (status in ('in_progress','completed','suspended')),
  recalculated_at timestamptz default now(),
  unique (project_id, period_start, period_end)
);
create index idx_overview_project on public.construction_overview(project_id, period_end desc);
```

## P6-02: 集計再計算関数 `recalculate_construction_overview(project_id)`
- security definer、トランザクション
- view を SELECT して overview にアップサート

## P6-03: `/pc/projects/[id]/cost` — 現場別 原価管理表
- 4 カテゴリ円グラフ(人件費 / 材料費 / 外注費 / 車両費)
- 月次推移ライングラフ
- 内訳テーブル(誰が何時間 / どの仕入先からいくら)

## P6-04: `/pc/gaikyo` — 工事概況表(全社)
- 全現場の 売上 / 原価 / 利益 / 進捗 を一覧
- ソート可、フィルタ(完了/進行/停止)
- 月別 / 期別 集計切替

## P6-05: `/pc/gaikyo/[projectId]` — 現場別 工事概況詳細
- 月次推移、累計売上 vs 累計原価のグラフ
- 顧客別売上集計

## P6-06: `/pc/customer-sales` — 既存ページ強化
- 顧客×現場 マトリクスを overview から再構成
- 顧客別の累計利益率を表示

## P6-07: REPORT3 / supplier_invoice / vehicle_run / invoice 保存時の overview 再計算 trigger
- 各テーブル INSERT/UPDATE 後に `recalculate_construction_overview` を呼ぶトリガ
- 重い場合は pg_cron で日次バッチに切替可

## P6-08: PDF 出力 — 工事概況表(請求書 PDF と同様、月次レポート)
- 既存の billing/pdf/generator.ts を拡張

---

# Phase 7: 外部 SaaS 連携

> ⚠️ 各サービスの API キー/認証情報を **板澤様→クライアント(秋元様)** から
> 入手する必要があります。Phase 7 の各タスクは、対応する API キーが揃った段階で
> 実装着手可能。

## P7-01: 環境変数 + 設定画面の整備
- `.env.example` に LINE_WORKS_BOT_TOKEN / MF_CLIENT_ID 等を追加
- `/pc/settings/integrations` で接続状態を可視化(管理者専用)

## P7-02: LINE WORKS — 通知送信モジュール
- `src/lib/lineworks/client.ts` を新規
- `sendNotificationToGroup(group_id, message)` を実装
- env: LINE_WORKS_BOT_ID / API_KEY

## P7-03: LINE WORKS — グループマッピングテーブル + UI
```sql
create table public.lineworks_groups (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  group_name text not null,
  lineworks_group_id text not null,
  scope_type text not null check (scope_type in ('all','department','position','project','role')),
  scope_id uuid,  -- department_id / project_id 等
  is_active boolean default true
);
```

## P7-04: LINE WORKS — 通知ルーティング server action
- notifications.created_at 時にトリガで lineworks_groups から該当 group を引き、Bot API で送信
- フォールバック: 失敗時は notifications テーブルに記録(再送可)

## P7-05: LINE WORKS — 異常検知 + 入力遅れ通知バッチ
- pg_cron で日次:
  - 出勤予定だが punch_in 無い → 該当ユーザーの所属班 LW グループに通知
  - 大幅遅刻 / 早退 / 残業オーバー → 上長に通知

## P7-06: Money Forward — 認証フロー
- OAuth2 implementation(`/api/auth/mf/callback`)
- mf_credentials テーブルに access/refresh token 保存

## P7-07: Money Forward — 仕訳 CSV 生成 + 連携
- 月次バッチ: invoices / supplier_invoices / receipts → MF 形式の CSV 生成
- API があれば直接 PUT、無ければダウンロード提供

## P7-08: Money Forward — 給与連携
- attendance_punches + profiles.hourly_rate_cents → 給与データ生成 → MF 給与 PJ へ

## P7-09: Money Forward — 連携ログ + 再送機能
```sql
create table public.mf_sync_log (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sync_type text not null,  -- 'journal' | 'invoice' | 'salary'
  target_period text not null,  -- '2026-05'
  status text not null check (status in ('pending','success','failed','retrying')),
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  retry_count integer default 0,
  created_at timestamptz default now()
);
```

## P7-10: Cloud Sign — 契約書送信 server action
- 見積承認後 → 契約書 PDF 生成 → Cloud Sign API で送信
- 送信ログを `cloudsign_envelopes` に記録

## P7-11: Cloud Sign — 締結ステータスの webhook 受信
- `/api/webhooks/cloudsign` で受信、署名検証後に envelope.status を更新

## P7-12: Cloud Sign — 締結済み PDF を Storage に保存
- 案件・顧客と紐付けて `signed_contracts/` フォルダ(後の Phase 10 の汎用ファイル管理に統合)

## P7-13: Google Maps — 案件住所からマップ表示
- `/pc/projects/[id]` に Google Maps Embed
- API キーは public 用と server 用を分離

## P7-14: Google Maps — 配車ルート表示
- スケジュール画面で「現場 A → 現場 B」のルート計算
- Distance Matrix API 使用

## P7-15: Google Maps — `/pc/projects/map` の現場マーカーを実地図に重畳(Phase 3-C と統合)
- 現状はゲーム風 SVG マップ。実地理マップとの切替モードを追加

## P7-16: 連携テスト + フェイルセーフ
- API 障害時の fallback メッセージ
- リトライキューと dead letter

---

# Phase 8: ゲーミフィケーション完成(残課題回収)

## P8-01: バッジ画面 — `/pc/badges` `/sp/badges`
- 既存 `badges` テーブル + `user_badges` を可視化
- 図鑑形式: 獲得済み / 未獲得をシルエット表示

## P8-02: クエスト画面 — `/pc/quests` `/sp/quests`
- 既存 `quests` テーブル + 進捗バー
- アクティブ / 完了 / 失敗の 3 タブ

## P8-03: クエスト達成判定バッチ
- pg_cron で REPORT3 / safety_combo / titles_granted を見て、quest 進捗を更新

## P8-04: XP 自動付与拡張
- 既存: REPORT3 提出 +10 XP のみ
- 追加: 称号獲得 / 連続出勤 / KY完了 / バッジ獲得 で XP 加算
- award_points と統合(`category = 'XP'`)

## P8-05: ランクアップ通知 + 演出
- レベルアップ時にフルスクリーン演出(P3-B-07 と同形式)
- notifications テーブル経由でモバイルにも通知

## P8-06: 称号自動付与ロジック
- `evaluate_titles_for_user` security definer 関数
- 安全コンボ 180 日 → 安全の番人 自動付与など

## P8-07: さくらししまる AI ナビ — 状況察知エンジン
- ダッシュボード以外でも能動的に出現
- 未提出日報がある時 / 期限切れ資格が近い時 / 配車衝突発生時 に「ナビ」として声かけ

## P8-08: NAVI コンポーネント `<SakuraShishimaruNavi>` 配置
- 全画面右下フローティング(opt-out 可)
- 状況に応じてバルーン表示

## P8-09: NAVI トーン設定 + Claude API オプション
- ルールベース → Claude API による文脈理解にアップグレード可能な抽象化レイヤー

---

# Phase 9: ロール別画面ガード徹底

> 設計図の「マスタ更新は事務ロールのみ」原則を全画面で履行。
> 現状は一部画面のみ redirect ガード。

## P9-01: ガード対象の網羅監査
- 全 `/pc/*` `/sp/*` ページを `requireSession` + role check の網羅で監査
- 漏れているページを `production/qa/role-guard-audit.md` に列挙

## P9-02: 中央ガード関数 `requireRole(allowed: UserRole[])` を実装
- session.role が含まれない場合 redirect("/pc/home")
- 既存の `requireSession` と並存

## P9-03: 全マスタ画面に `requireRole(['office','ceo','system'])` 適用
- `/pc/qualifications`, `/pc/price-items`, `/pc/work-classifications`, `/pc/org-*`,
  `/pc/customers`, `/pc/users`, `/pc/projects/*` の編集ページなど

## P9-04: 全ページのナビゲーション側で **「見せない」ガード**
- Sidebar.tsx で role に応じてリンク自体を hide(現状一部実装済み)
- 統一的な `<RoleGate role={...}>` コンポーネントを作成

## P9-05: ロール別テストプラン作成
- `tests/role-guard.spec.ts`(Playwright)で全 5 ロール × 全主要画面を巡回

---

# Phase 10: 汎用ファイル管理(Google Drive 風) + ロール別アクセス制御 + バックアップ + 履歴

> 設計図の「DOC: 図面・書類・添付ファイル管理」と、
> 板澤様の追加要件「Google Drive 風のフォルダ管理 + ロール別アクセス制御」を実装。
> 既存の安全書類 / 元請テンプレート / 領収書写真等もこの汎用システムに段階的に集約していく。

## P10-01: マイグレーション 0016 — ファイル管理スキーマ
```sql
-- フォルダ階層(再帰)
create table public.file_folders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  parent_folder_id uuid references public.file_folders(id) on delete cascade,
  name text not null,
  description text,
  -- 関連エンティティ(任意): 案件配下フォルダ等の自動分類用
  related_table text,    -- 'projects' | 'customers' | 'users' | null
  related_id uuid,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (parent_folder_id, name)  -- 同一階層で名前重複禁止
);
create index idx_folders_tenant_parent on public.file_folders(tenant_id, parent_folder_id);
create index idx_folders_related on public.file_folders(related_table, related_id);

-- ファイル本体
create table public.files (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  folder_id uuid references public.file_folders(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,   -- Supabase Storage のパス
  description text,
  -- バージョン管理(同一 file_id + version)
  version integer not null default 1,
  is_latest boolean not null default true,
  uploaded_by uuid not null references public.profiles(id),
  uploaded_at timestamptz default now()
);
create index idx_files_folder_latest on public.files(folder_id, is_latest);
create index idx_files_tenant on public.files(tenant_id, uploaded_at desc);

-- アクセス権限(フォルダ または ファイル単位)
-- subject:
--   role:office  → ロール指定
--   user:<uuid>  → 個別ユーザー指定
--   department:<uuid> → 部署指定
create type file_access_subject_type as enum ('role', 'user', 'department', 'public');
create type file_access_permission as enum ('read', 'write', 'manage');

create table public.file_access_grants (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  -- 対象: フォルダ or ファイル(どちらか一方が NOT NULL)
  folder_id uuid references public.file_folders(id) on delete cascade,
  file_id uuid references public.files(id) on delete cascade,
  -- 権限の付与先
  subject_type file_access_subject_type not null,
  subject_value text not null,  -- 'office' / '<user_id>' / '<dept_id>' / null(public)
  permission file_access_permission not null,
  granted_by uuid not null references public.profiles(id),
  granted_at timestamptz default now(),
  -- どちらかは必須
  check ((folder_id is not null and file_id is null) or (folder_id is null and file_id is not null))
);
create index idx_access_folder on public.file_access_grants(folder_id);
create index idx_access_file on public.file_access_grants(file_id);
create index idx_access_subject on public.file_access_grants(subject_type, subject_value);

-- アクセスログ(監査用)
create table public.file_access_log (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  file_id uuid references public.files(id) on delete set null,
  folder_id uuid references public.file_folders(id) on delete set null,
  user_id uuid not null references public.profiles(id),
  action text not null check (action in ('view','download','upload','delete','rename','move','grant','revoke')),
  ip_address inet,
  user_agent text,
  occurred_at timestamptz default now()
);
create index idx_file_access_log_file on public.file_access_log(file_id, occurred_at desc);
create index idx_file_access_log_user on public.file_access_log(user_id, occurred_at desc);
```

## P10-02: アクセス可否判定関数 `can_access_file(p_file_id, p_user_id, p_permission)`
- security definer
- 親フォルダの権限を継承(再帰)
- ロール / ユーザー / 部署のいずれかにマッチすれば許可
- system ロールは常に許可

## P10-03: Storage バケット `files` 新設 + RLS ポリシー
- can_access_file() を呼ぶ Storage policy

## P10-04: `/pc/files` — ルートエクスプローラ
- 左ペイン: フォルダツリー(再帰展開)
- 右ペイン: 現在フォルダの中身一覧(grid / list 切替)
- パンくずナビゲーション
- 検索バー(全文検索: 名前 / 説明)

## P10-05: `/pc/files/[folderId]` — フォルダ詳細
- 上記 + 右上に「アップロード」「新規フォルダ」「権限管理」ボタン

## P10-06: `<FileUploadDialog>` — ドラッグ&ドロップ + 複数同時アップロード
- 進捗バー、サイズ上限チェック、自動 mime_type 推定
- 完了後 file_access_log に 'upload' を記録

## P10-07: `<FolderTree>` 補助コンポーネント
- 仮想スクロール対応(数千フォルダでも快適)
- 現在地ハイライト

## P10-08: `<FilePreview>` — プレビュー機能
- 画像 / PDF / Office 系(Office Online or PDF 化)
- ダウンロードボタン(file_access_log 記録)

## P10-09: `<FileAccessControlDialog>` — 権限管理 UI(管理者専用)
- フォルダ / ファイルに対する grant 一覧の追加・削除
- ロール / ユーザー / 部署単位で権限を付与
- "継承を上書き" の警告表示

## P10-10: 既存ファイル系の段階的統合
- `safety_documents`(現状の `/pc/safety-documents`)→ files テーブルへ移行
- `contractor_templates` → files テーブル + 専用 metadata 列
- `receipts.photo_url` → files への移行
- 既存ページは互換ビューとして維持

## P10-11: 履歴管理 + バージョニング
- 同名ファイル再 upload 時:
  - 既存 file の `is_latest = false`
  - 新ファイルを `version = old.version + 1` で INSERT
- バージョン履歴ビュー

## P10-12: 論理バックアップ + 監査ログのエクスポート
- pg_cron で日次 / 週次の論理バックアップ
- audit_log + file_access_log の月次 CSV エクスポート(Storage 保存)
- 管理者用の「エクスポートをダウンロード」UI

---

# 完了の定義(全フェーズ通しの DoD)

- 全マイグレーション適用済み(0012〜0016)
- 全タスクのうち各 AC 達成
- `/pc/home` を秋元様(クライアント)に見せた時、デモ版の v4.0 のテイストが残りつつ、本物のデータで動作している
- 設計図 12 項目すべての実装完了
- 各ロール(worker / leader / office / ceo / system)で適切に画面が出し分けられる
- 外部 SaaS(LINE WORKS / MF / Cloud Sign / Google Maps)との連携が動作
- ファイル管理画面で Google Drive 風のフォルダ操作ができ、ロール別にアクセス制御が効く
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
- 2026-05-10: 初版作成(Claude セッションにて、Phase 1〜4 の 43 タスク)
- 2026-05-10: 設計図 12 項目との照合監査結果を反映、Phase 5〜10 を追加(計約 110 タスク)。
  追加要件: TASK / SCH / ATT 補完、GENKA 詳細 / GAIKYO 新設、外部 SaaS 連携(LW / MF / CS / GMaps)、
  ゲーミフィケーション完成(バッジ画面 / クエスト / NAVI)、ロール別画面ガード徹底、
  Google Drive 風ファイル管理 + ロール別アクセス制御 + バックアップ + 履歴。
- 2026-05-10: Phase 3-C(現場マップ)を 5 → 8 タスクに拡張。マリオ風ステージナンバリング
  (1-1, 1-2 形式、WORLD = area_group / STAGE = 同 area 内の現場)を必須化。
  **従業員がどの案件に配置されているかをマップで確認できる機能**(P3-C-03)を追加。
  詳細仕様はクライアントと詰めるが導入確定済み。モバイル版 `/sp/map`(P3-C-08)も
  必須に。マップエディタもステージ番号設定 UI 含めて拡張。
