# 参照データ画像 12 枚 監査レポート(S5)

> **日付**: 2026-05-11
> **トリガー**: 板澤様より参照データ(12 PNG)を共有 — 「すべてのデザイン・システム構造を模倣せよ」
> **方法**: 並列で 4 specialist agent を起動して網羅分析

## 監査対象画像

| ファイル | 内容 |
|---|---|
| `参照データ/ダッシュボード.png` | REPORT3 ホーム画面(KPI/タスク/通知/配車マップ/グラフ/クエスト) |
| `参照データ/日報.png` | REPORT3 入力(ステップウィザード形式) |
| `参照データ/案件管理.png` | 案件一覧 + 詳細パネル(2-pane) |
| `参照データ/スケジュール.png` | 配車表(週間ビュー、現場×日付グリッド) |
| `参照データ/マップ.png` | 配車マップ(Google Maps + 3-pane) |
| `参照データ/原価管理.png` | GENKA(売上・原価・利益月次グラフ + 案件別テーブル) |
| `参照データ/見積書.png` | 見積書作成(2-pane: フォーム + ライブプレビュー) |
| `参照データ/請求書.png` | 請求書発行 + 入金ランキング |
| `参照データ/車両工具.png` | 車両・工具統合画面(タブ + 2-pane) |
| `参照データ/クエストバッチ.png` | クエスト・バッジ専用ページ |
| `参照データ/通知.png` | 通知一覧 + 詳細 (2-pane + 4 KPI) |
| `参照データ/モバイル版.png` | iPhone モックアップ(出退勤・REPORT3 クイック・タスク) |

## Specialist 起動結果

| # | Agent ID | 役割 | 状態 |
|---|---|---|---|
| 1 | adf177a5dcff1db54 | brand-director | ✅ 完了(50k tokens) |
| 2 | a19af8f11944d6f92 | interaction-designer(ダッシュ/REPORT3/案件) | ⏳ 稼働中 |
| 3 | ae1492477397abca2 | screen-designer(スケジュール/マップ/原価/見積/請求) | ⏳ 稼働中 |
| 4 | a3a3c8943e64ef6f4 | systems-analyst(クエスト/通知/車両工具/モバイル + DB) | ⏳ 稼働中 |

---

## Brand Director 報告サマリー(完了)

### 1. カラーパレット精緻化
- サイドバー濃紺: `#1A3A6A`〜`#1A2740` の上下グラデ(下部リッチ)
- アクティブ項目: 左 4px の **赤バー (#E8516A)** + 白文字
- 主要アクセント: 青 `#2568C8` / 緑 `#0DA870` / 赤 `#E03030` / 紫 `#7040C8` / 茶金 `#D88000` / ロゴ赤橙 `#E8516A` 〜 `#F08C5A`
- 状態色: 進行中=赤系ピル / 完了=緑 / 警告=黄 / 緊急=赤背景白文字
- **REPORT3 ロゴはグラデ**: `from #E8516A → to #F5A45A`(新トークン `brand.report3.{from,to}` 提案)
- 既存 `navy / blue / teal / red / amber / purple` は流用可
- `p1〜p4 / gold / silver / bronze` はゲーミフィケーション専用に温存
- **セマンティック別名追加**: `status.active / status.done / status.warn / status.urgent`

### 2. タイポグラフィ階層
| 種別 | サイズ | 太さ |
|---|---|---|
| 画面タイトル | 22-24px | Bold |
| KPI 数値 | 28-32px | Black, 色付き |
| セクション見出し | 13-14px | Bold + アイコン |
| 本文(テーブル/フォーム) | 13-14px | Medium |
| ラベル | 12-13px | Medium |
| メタ(日付・補足) | 11-12px | Regular |
| テーブルヘッダー | 11px | Bold + Uppercase tracking |

### 3. 角丸・シャドウ
- KPI / プレビュー大カード: **radius 16px** + `shadow-md`
- 中パネル: 12px + shadow-sm
- 既存 `panel=10px` → **12px に拡張推奨**
- 新トークン: `borderRadius.card=12px / cardLg=16px`

### 4. アイコン体系
- 絵文字 = クエスト・バッジ画面のみ(王冠・トロフィー・★)
- 本業画面 = **Material/Lucide 系統一**
- サイドバー全項目を Lucide で再マッピング推奨(Home / Briefcase / Calculator / Calendar / MapPin / Truck / FileText / Bell / Trophy / Settings 等)

### 5. 共通レイアウトパターン
- **3-pane が主**(サイドバー 240px + メイン + 右ペイン 1:3:1)
- 2-pane(原価・クエスト・ダッシュ): KPI 4 → グラフ → 表
- ステップフロー: REPORT3 / 見積 / 請求 で頂部にステップバッジ
- 常駐ウィジェット: サイドバー左下「チームレベルゲージ」+ 右下「アバター + ロール」
  - **全画面共通レイアウト要素として `<SidebarFooterWidget>` 化推奨**

### 6. ロゴ運用統一案
- **「REPORT3」をプロダクトブランド名として全 PC 画面サイドバー上部に固定**
- 下のサブテキストに「さくら株式会社 業務管理システム」併記
- 「SAKURA OS」は社内開発呼称・リポジトリ名のみ(UI に出さない)
- モバイル: 小さく `REPORT3` ワードマーク

### 7. 既存実装ギャップ
- `<KpiCard>` 左 4px バー — OK、ただし数値 28→32px 拡大、アイコン+ラベル横並び化
- `<AlertCard>` — 左バーを 4 → 6px 強調
- `<Tag>` / `pill-*` — pill 形状 OK、ただしセマンティック名 `pill-active / pill-done` 追加推奨
- **サイドバー下部のチームゲージ — 現行未実装、レイアウト層で全画面追加が必要**
- データテーブル: 行高 44-48px、ステータス列の pill 配置・進捗バー埋め込み
- **`<StepBadgeBar>` 新設**(REPORT3/見積/請求 用)
- 角丸: panel 10 → 12px、KPI のみ 16px

### 8. 追加トークン提案(置換ではなく拡張)
```typescript
brand: {
  report3: { from: "#E8516A", to: "#F5A45A" },
  yellow: "#f5d800", // 既存
},
status: {
  active: red.DEFAULT,
  done: teal.DEFAULT,
  warn: amber.DEFAULT,
  urgent: "#B91C1C",
},
borderRadius: {
  card: "12px",
  cardLg: "16px",
  // 既存も維持
}
```

---

## Interaction Designer 報告(完了、40k tokens)

### A. ダッシュボード再構成(`/pc/home`)

**既存ギャップ表**:
| 項目 | 現状 | 参照 | 判定 |
|---|---|---|---|
| ヘッダー(タイトル+検索+通知+プロフィール) | 散在の可能性 | 1 行統合 | 既存改修 |
| KPI 4 枚 | あり | 78%/18件/¥12.45M/18.6% | 既存改修(値・サブ調整) |
| 今日のタスクテーブル | **無し** | 4列 | **新規** |
| 直近の通知カード | アラート枠あり | 種別アイコン+本文+時刻 | 既存改修 |
| 配車マップ右上埋め込み | **無し** | Google Map ピン複数 | **新規** |
| 稼働状況棒グラフ | タイムラインのみ | 縦棒 7 日 | **新規(Recharts)** |
| 売上/原価/利益 月次 | **無し** | 3 系列縦棒 | **新規(Recharts)** |
| クエスト・バッジサマリー | 別ページ | 右下ミニカード | **新規(既存データ流用)** |
| サイドバー左下チームレベル | アイコンのみ | ゲージ + アバター | 既存改修(layout.tsx) |
| よく使うアクション(下部) | 無し | 4-5 ボタン横並び | **新規** |

**新ダッシュレイアウト**:
```
┌─[Sidebar]──┬──[ホーム タイトル | 🔍検索 | 🔔3 | 👤山田]────────────────┐
│ ホーム      │ ┌KPI:78%─┐┌KPI:18件─┐┌KPI:¥12.45M─┐┌KPI:18.6%─┐         │
│ REPORT3    │ └────────┘└────────┘└────────────┘└──────────┘         │
│ 案件管理    │ ┌今日のタスク table──┐ ┌直近通知┐ ┌配車Map ピン6━┐ │
│ 工程進捗    │ └─────────────────────┘ └───────┘ └──────────────┘ │
│ 配車マップ  │ ┌稼働状況 棒グラフ──┐ ┌売上/原価/利益 月次──┐ ┌クエ┐ │
│ 原価管理    │ └───────────────────┘ └────────────────────────┘ └───┘ │
│ クエスト    │ [👥 出勤打刻] [📋 REPORT3] [🚗 配車] [💰 見積] [🔔 通知] │
│Lv5 ███▒    │                                                          │
│ 👤👤👤      │                                                          │
└────────────┴──────────────────────────────────────────────────────┘
```

**ロール別表**(worker/leader/office/ceo/system × KPI/タスク/マップ/グラフ/クエスト)を完全マトリクス化。

### B. REPORT3 入力ステップフロー(6 ステップ)

ステップ確定:
1. **基本情報**(現場・日付・天候)
2. **作業内容**
3. **時間入力**(始業/終業/休憩)
4. **写真添付**(4 枚 grid + 追加)
5. **工事完了 / 安全チェック**
6. **確認・送信**

**重要技術判断**:
- 全ステップを 1 つの `useFormContext` フォームに集約 → ステップ遷移で再マウントしない
- `form.trigger(stepNFields)` で対象フィールドのみ部分検証
- URL `?step=N` で進捗状態を表現(戻る/進むボタン対応)
- フォーカス: 次へ押下後に `<h2 tabIndex=-1>` に focus 移動
- ショートカット: `Alt+→` 次へ / `Alt+←` 戻る(PC のみ)
- 写真は `<input type="file" capture="environment">` でカメラ直結
- **モバイルも同じ Wizard 採用**(現状の 1 画面型は廃止)、右パネルは `<details>` で折りたたみ
- 下書き保存: `submitReport3Draft` server action(`status='draft'`)、URL `?draft=<id>` 維持

新規コンポーネント: `<Stepper>`, `<StepIndicator>`, `<StepFooter>`, `<PhotoGrid>`, `<SiteInfoPanel>`, `<QuickTips>`

### C. 案件管理 2-pane(`/pc/projects`)

**仕様**:
- 上部 KPI 4: 進行中18件 / 完了予定7件 / 受注5件 / 完了26件
- 一覧列: 案件名 / 客先 / 進捗バー / 受注金額 / 残期間 / ステータスバッジ(8 列)
- 右パネル: 工程進捗 + 担当者 + 関連書類 + 関連リンク + アクションボタン
- 行クリック → URL `?selected=<id>` 同期、Server Component 再描画
- 行 ↑↓ キー対応(roving tabindex)
- フィルタ・検索・ページネーションすべて URL searchParams
- Realtime: project_progress channel で右パネルのみ partial revalidate
- 該当案件がフィルタ外なら「該当なし」フォールバック

**新規コンポーネント**: `<ProjectsKpiBar>`, `<ProjectDetailPanel>`, テーブル進捗バー列拡張

---

## Screen Designer 報告(完了、41k tokens)

### A. スケジュール画面(`/pc/schedules` 新規 — P5)
- 縦軸: チーム/班、横軸: 日付 7 日分のグリッド
- 各セルにシフトラベル(出勤/休)+ 配置現場の色付きピル
- 右パネル「本日のスケジュール詳細」(出席者顔列 + 印刷/出力)
- 左サイドバー下端「チームコスト達成率 65%」ゲージ
- DnD で人員割当変更、`@dnd-kit` + キーボード fallback(矢印 + Space)
- 拡張: `shift_type` ENUM、`assignment_color`、`is_dragged_at`(楽観ロック)
- RPC: `get_week_schedule(tenant_id, start_date)` で N+1 回避
- 編集ロール: 事務 / 現場リーダー / 社長

### B. 配車マップ(`/pc/dispatch-map` 新規 — P7)
**重要発見**: マリオ風 STAGE マップとは **別物の実地理 Google Maps**
- 3-pane: フィルター左 / マップ中央 / 現場詳細右
- 左フィルタ: エリア / 日付 / 担当 / 距離 ≤ 5km / 作業員数
- 右パネル: 現場名 / 出席数 4/5 / 担当 / 「車両を割当」「現場レポートを送る」
- 下部: 通行情報(渋滞・工事のミニリスト)
- 必要 API: Google Maps + Directions、PostGIS の `ST_DWithin` で半径クエリ
- **マリオ風と実地理マップを併存**(マリオ風はトップ装飾、実地図は配車業務)

| | マリオ風 STAGE | 実地理(配車) |
|---|---|---|
| 用途 | エンタメ / ゲーミフィケーション | 業務オペレーション |
| 配置 | `/pc/projects/map`(P3-C) | `/pc/dispatch-map`(P7-04 新規) |
| データ | quest_progress | sites + vehicles 地理データ |

### C. 原価管理(`/pc/cost` 新規 — P6 詳細化)
- 上部 KPI 4: 累計売上 ¥84,250,000 / 平均粗利率 82.3% / 平均利益 ¥18,150,000 / 完了 7 件
- メイン: 売上・原価・利益月次積み上げ棒グラフ(青/赤/緑、12 ヶ月)
- 右パネル: 利益率トップ 5 + 「月次再集計」「レポート出力」ボタン
- 下部: 案件別 売上・原価・利益テーブル(列に 1月..12月)
- Materialized View `mv_project_cost_monthly` + RPC `refresh_cost_monthly`
- Edge Function で PDF レポート出力(署名付き Storage URL)
- ロール: 社長 / 事務(経理)が編集、現場リーダーは自分の現場のみ、作業員は 404

### D. 見積書 2-pane + ステッパー(`/pc/estimates` 既存改修 — P4 派生)
- 上部 4 ステップ: 基本情報 / 物件情報 / プレビュー / 承認フロー
- KPI 4: 有効期限 / 承認状態 / 進捗% / 合計金額
- **左フォーム + 右ライブプレビュー**(印影 SVG オーバーレイ、リアルタイム反映)
- 下部: 下書き保存 / PDF 出力 / **クラウドサインへ送信** / 承認申請
- 実装方式:
  - Client-side render(react-hook-form `watch()` + memo)
  - PDF は同じ React テンプレートを Server Action で renderToBuffer(1 ソース化)
  - `aria-live="polite"` で合計金額更新を SR 通知
- 拡張: `estimates.cloud_sign_envelope_id`, `cloud_sign_status` ENUM

### E. 請求書 2-pane + 入金ランキング(`/pc/invoices` 既存改修 — P4)
- 上部 4 ステップ: 請求書情報 / 明細入力 / プレビュー / 入金管理
- 左: 請求情報 + 中央: 項目テーブル + 右: 請求書プレビュー
- **最下部「入金ランキング」横バー**(各社の入金状況可視化)
- View `v_client_payment_status`(tenant_id, client_id, total_billed, total_paid, outstanding)
- Money Forward webhook → payments upsert(idempotent + 署名検証)
- 期日近い順アラート(7 日以内=橙、超過=赤)
- 共通 `<DocumentPreview type="invoice|estimate">` で見積/請求のテンプレ統一

---

## Systems Analyst 報告(完了、41k tokens)

### F. クエスト・バッジ画面(`/pc/quests-badges` 新規)
- KPI 4: Lv 18 / 128,450 XP / 進捗 8.9% / 獲得バッジ 23 個
- 3 タブ: 進行中のクエスト / **チームクエスト** / バッジ一覧
- 右パネル: アバター + 氏名 + Lv + ランク「ゴールド」 + 直近 3 バッジ + チームスコア
- 「直近の達成」タイムライン + 「おすすめアクション」(進捗 ≥70% のクエスト提示)

**DB 拡張**:
- `badges.rarity` ENUM(`bronze/silver/gold/platinum/legendary`)を追加
- `user_badges.granted_at` + `grant_reason` 列追加
- **新規テーブル**: `teams`, `team_members`, `team_quests`, `user_quest_progress`(進捗キャッシュ)
- `compute_user_rank(user_id)` 関数(Lv 帯 → ランク名)

### G. 通知画面 2-pane(`/pc/notifications` 改修)
- 上部 KPI 4: 緊急 12 / 警告 3 / 通知 5 / 期限 4
- 左一覧 + 右詳細(直接対応ボタン: 承認/却下/詳細を見る)
- フィルタ(種別 / 期間 / 状態)+ タブ(全て / 未読 / 緊急 / 期限)

**DB 拡張**(`notifications` への列追加):
- `severity` ENUM(`critical/warning/info/deadline`)
- `category`, `read_at`, `status`(`unread/read/actioned/dismissed`)
- `source_table`, `source_id`(ポリモーフィック逆引き)
- **新規テーブル** `notification_actions`(各通知に対するアクションリンク)
- View `notification_kpi_view`(KPI 集計 1 クエリ化)

### H. 車両・工具統合画面(`/pc/fleet` 新規)
既存 `/pc/vehicles` + `/pc/tools` を **統合した新画面**:
- KPI 4: 稼働数 12 / 修理中 3 / 持出件数 28 / 警告 5
- 4 タブ: **車両管理 / 工程確認 / 災害対策 / 通信記録**
- 一覧テーブル(ナンバー/種別/状態/担当/出庫日/帰庫日/GPS)
- 右パネル: 車両画像 + Google Maps GPS 表示 + 走行距離

**DB 拡張**:
- `vehicles.photo_url` + `status` ENUM(active/in_repair/standby/retired)
- **新規テーブル**(法令証跡):
  - `alcohol_checks`(道交法準拠、必須)
  - `vehicle_inspections`(点検記録)
  - `disaster_response_kits`(災害備蓄)
  - `vehicle_radio_logs`(無線/LINE WORKS 通信履歴)

### I. モバイル ホーム(`/sp/home` 改修)
- ヘッダー: アバター + 「山田 太郎 さん」+ 通知ベル
- 「今日の作業」カード(現場 + 時間 + 作業内容)
- **大型ボタン3つ**: 出勤(緑) / 退勤(赤) / REPORT3 入力(青)
- 「今日のタスク」チェックリスト
- 「REPORT3 クイック入力」(時間 + メモ簡易入力 → `submit_report3_quick` RPC)
- 「今月の進捗」(REPORT3提出率 91% / タスク完了率 82% / 出勤日数 3.0/8.0)
- ゲーミフィケーション(XP +120 / Lv 12 / 直近バッジ)
- チームレベル 72%
- お知らせ(LIMIT 3)
- フッターナビ: ホーム / REPORT3 / マップ / プロフィール

**DB 拡張**:
- `tasks` + `work_assignments` + `attendance_punches` を **Phase 5 から先行投入候補**(0017 で)
- View `monthly_progress_view`(REPORT3 提出率 / タスク完了率 / 出勤日数の集計)
- RPC `submit_report3_quick(...)`(モバイル簡略入力、欠損項目はテナントデフォルトで補完)

---

## J. 統合 DB 拡張(migration 0017 候補)

### J-1. 新規テーブル(11 件)

```
gamification 拡張:
  teams (id, tenant_id, name, leader_user_id, team_xp, team_level)
  team_members (team_id, user_id, joined_at, role)
  team_quests (id, tenant_id, team_id, quest_id, progress, status, ...)
  user_quest_progress (user_id, quest_id, progress_pct, current_value, target_value, updated_at)

通知拡張:
  notification_actions (id, notification_id, action_type, label, target_url, rpc_name, payload jsonb, sort_order)

車両・工具拡張(法令証跡含む):
  alcohol_checks (id, tenant_id, user_id, vehicle_id, checked_at, result_mg, passed, device_id, photo_url)
  vehicle_inspections (id, tenant_id, vehicle_id, inspector_id, inspected_at, items jsonb, passed, notes)
  vehicle_radio_logs (id, tenant_id, vehicle_id, sender_user_id, message, sent_at, channel)
  disaster_response_kits (id, tenant_id, vehicle_id, kit_items jsonb, last_inspected_at, next_due_at)

モバイル / Phase 5 統合:
  attendance_punches (id, tenant_id, user_id, punch_type, punched_at, gps_lat, gps_lng, project_id, photo_url)
  tasks (id, tenant_id, project_id, assigned_user_id, title, status, due_at, completed_at, source_assignment_id)
  work_assignments (id, tenant_id, user_id, project_id, scheduled_date, start_time, end_time, task_summary)
```

### J-2. 既存テーブル列追加

```sql
ALTER TABLE badges        ADD COLUMN rarity TEXT CHECK (rarity IN ('bronze','silver','gold','platinum','legendary'));
ALTER TABLE user_badges   ADD COLUMN granted_at TIMESTAMPTZ DEFAULT now(), grant_reason TEXT;
ALTER TABLE notifications ADD COLUMN severity TEXT, category TEXT, read_at TIMESTAMPTZ,
                                       status TEXT DEFAULT 'unread', source_table TEXT, source_id UUID;
ALTER TABLE vehicles      ADD COLUMN photo_url TEXT, status TEXT DEFAULT 'active';
ALTER TABLE estimates     ADD COLUMN cloud_sign_envelope_id TEXT, cloud_sign_status TEXT;
ALTER TABLE schedules     ADD COLUMN shift_type TEXT, assignment_color TEXT, is_dragged_at TIMESTAMPTZ;
```

### J-3. 新規ビュー / 関数

```sql
CREATE VIEW notification_kpi_view AS  -- 通知 KPI 4 枚集計
CREATE VIEW fleet_kpi_view AS         -- 車両 KPI 4 枚集計
CREATE VIEW monthly_progress_view AS  -- モバイル今月の進捗
CREATE VIEW user_quest_recommendations AS  -- 進捗 ≥0.7 のおすすめ
CREATE VIEW v_client_payment_status AS     -- 請求書下部の入金ランキング
CREATE MATERIALIZED VIEW mv_project_cost_monthly AS  -- 原価管理のグラフ・表

CREATE FUNCTION submit_report3_quick(...) -- モバイルクイック入力
CREATE FUNCTION compute_user_rank(user_id) -- Lv 帯 → ランク名(ゴールド等)
CREATE FUNCTION refresh_cost_monthly(tenant_id) -- 月次集計再実行
CREATE FUNCTION get_week_schedule(tenant_id, start_date) -- 週カレンダー 1ショット fetch
CREATE FUNCTION get_dispatch_map(tenant_id, date, area, max_distance_km) -- PostGIS 半径クエリ
```

### J-4. 重要原則

- 全新規テーブルに `tenant_id NOT NULL + RLS policy tenant_isolation_<table>` を必須化
- `attendance_punches` / `alcohol_checks` は法令証跡 → updated_at trigger + audit_log 必須連携
- `vehicle_gps_pings`(連続トラッキング、月数十万行想定)は **0017 では見送り、0018 で時系列分割テーブルとして導入**
- Phase 5 既存計画(`tasks` / `attendance_punches` / `work_assignments`)と重複 → 0017 で先行投入する方針(板澤様確認推奨)

---

## まとめ

12 画像から導かれる **新規 / 改修タスク総数: 約 50 タスク**(既存 Phase の詳細化 + 新規 Phase 11/12)

これを MASTER-PLAN.md / PROGRESS.md に統合します(次セクション)。
