# SAKURA OS リビルド 進捗トラッカー

> **更新ルール**: 毎セッション開始時にこのファイルを読む → 作業 → このファイルを更新 → コミット
>
> **必読セット**: `MASTER-PLAN.md`(全体像)+ このファイル(進捗)+ `SESSION-LOG.md`(履歴)

---

## 🎯 現在のステータス

- **進行中フェーズ**: 🔥 **Phase 12(画面準拠化)着手中**
- **完了タスク**: 43 / 約 138(ダッシュボード + REPORT3 入力 PC + 案件管理 PC + 通知 PC + 配置マップ PC + スケジュール PC 完了)
- **最終更新**: 2026-05-14
- **最終セッション ID**: **S16(スケジュール 3-pane 週ビュー新規作成 + 案件×7日カレンダー + 未配置者 + 印刷ボタン)**
- **最新デプロイ**: `0ca20f8`(Vercel deploy 中、スケジュール公開予定)
- **公開 URL**: `https://sakura-os-bice.vercel.app`(Vercel Auth 撤廃済み、外部 share 可)
- **進捗保存ルール**(板澤様確定 2026-05-12):
  - **各タスク完了後**:必ず PROGRESS.md / SESSION-LOG.md を更新してコミット
  - **各タスク着手前**:必ず PROGRESS.md / SESSION-LOG.md を読み込む
  - **各タスク着手前**:ベストプラクティスを事前宣言してから実装着手

### ✅ Phase 12 完了済(ダッシュボード関連 = 1 画面で約 40 コミット)

**S6.6-S6.8(修正セット A/B/C)**: ダッシュボード参照画像準拠化 / 配管業テキスト維持
- 1 画面 fit(中段+下段統合 12 カラム grid)
- KPI カード仕上げ(数値・色・余白)
- 承認待ちカラム拡張 / 配置マップ 5 色ピン / クエストバッジ拡充

**S7 ライトテーマ + コーポレート tone 全面書換え**: 3 specialist 並列
- サイドバー濃紺 → 白ベース、ゲーミフィケーション要素圧縮
- KPI カード left 4px 縦アクセントバー
- 状態 pill パステル化

**S8 配管業 mock + 開発者メニュー条件表示 + 経過時間表記**

**S9 counter-scaling 撤廃**(Codex の 150% 対策を巻き戻し)
- globals.css の `@media` 200 行(`!important` 30+)削除
- 1280×720 CSS pixel を native 基準に再構築
- `transform: scale(0.56)` 廃止でフォント・線シャープに

**S10 viewport 585px 完全 fit + content 密度最適化**(約 20 コミットの試行錯誤)
- 実 viewport が 585px(1280×720 - browser chrome 135px)であることを JS で発見
- 段別 panel 高さ: 中段 180 / 下段 260
- col-span 上段 3/5/4(今日のやること narrow、承認待ち wide、配置マップ medium)
- 下段 4/4/4 等幅
- 売上原価利益(右下)200px、配置マップ(右上)240px(余白を上に移動)

**S11 各 panel 内 content 最適化**
- 承認待ち / 現場別進捗: 7 列 table → card レイアウトと 5 列 table の折衷
- クエスト・バッジ: 2 段構成(XP+Quest 上、Badges 下フル幅)
- 売上原価利益チャート: SVG 月ラベル / Y軸ラベル切れ修正(fontSize 14 + PAD.l 62)

**S12 配置マップ Google Maps iframe 化 + 宮城県統一**
- 配置マップ:自社 SVG → `<iframe src="https://maps.google.com/maps?q=38.27,140.95&z=9...">`
  (API キー不要、後で JS API + 5 色ピンに切替予定 P12-01-map)
- mock データを宮城県の配管現場 5 件に統一(仙台駅前 / 泉中央 / 石巻 / 多賀城 / 名取)
  + lat/lng 座標を保持(将来 JS API 移行用)
- ダッシュボードの 承認待ち / 現場別進捗 も同じ宮城県名に統一

**S12 REPORT3 入力 PC 版新規作成**
- `/pc/report3/new/page.tsx` + `Report3InputForm.tsx`(663 行)
- 5 ステップ Stepper + 2 カラム layout(form 9 / 右 widget 3)
- 基本情報 + 作業内容 + 時刻 + 安全/天候/メモ + 写真添付
- 右サイドバー: 本日の配属現場 card + Tips + 反映先 chips(日報/原価/工事概況/XP)
- アクションバー: 戻る / 一時保存 / 下書き保存 / 送信して反映
- 宮城県配管業向け mock データ(WORK_CATEGORIES、PROJECTS)
- サイドバー nav の「REPORT3入力」を /sp/ → /pc/ に変更

### ✅ S13 で完了済(案件管理画面)

**P12-02 案件管理画面**(commit `51aec65`、3 ファイル、998 行)
- `src/app/(authenticated)/pc/projects/_data/mock-projects.ts`(15 件 mock)
- `src/app/(authenticated)/pc/projects/page.tsx`(Server Component)
- `src/app/(authenticated)/pc/projects/ProjectsListClient.tsx`(2-pane Client)
- 構成:KPI 4 cards + Filter bar + 左 list 8 列 table + 右 detail panel
- 宮城県 15 件 mock(既存 5 件 + 追加 10 件)、lat/lng 含むので将来 Google Maps JS API 連携可
- ステータス pill 4 色(進行中/遅延/完了予定/完了済)、sortable / filterable

### ✅ S14 で完了済(通知画面)

**P12-03 通知画面**(commit `5a3fffa`、3 ファイル、864 行)
- `src/app/(authenticated)/pc/notifications/_data/mock-notifications.ts`(18 件 mock)
- `src/app/(authenticated)/pc/notifications/page.tsx`(Server Component)
- `src/app/(authenticated)/pc/notifications/NotificationsClient.tsx`(2-pane Client)
- 構成:KPI 4 cards(未読/緊急/要対応/既読)+ Filter(検索 + カテゴリ + 優先度 + 状態)
  + 左 list(カテゴリアイコン + タイトル + 詳細 + 関連 + pill + 経過)+ 右 detail panel
- 18 件 mock(配管業 + 宮城県現場向け):
  - カテゴリ 6 種(report3 / approval / qualification / incident / project / system)
  - 優先度 3 段階(urgent / warn / info)
  - 状態 2 種(unread 12 件 / read 6 件)
- 未読 12 件 = サイドバー badge / ダッシュボード 🔔12 と一致
- 案件管理と同じ 2-pane パターン踏襲、コード資産再利用

### ✅ S15 で完了済(配置マップフルページ版)

**P12-04 配置マップ**(commit `44a016d`、2 ファイル、+863 行)
- `src/app/(authenticated)/pc/dispatch-map/page.tsx`(Server Component)
  - ComingSoonPage を実画面に置換
- `src/app/(authenticated)/pc/dispatch-map/DispatchMapClient.tsx`(3-pane Client)
- 構成:3-pane layout(grid 12 col, 3 / 6 / 3)
  - 左 panel(フィルター): 検索 + 日付 + エリア(自動抽出) + 工種 + 状態 checkbox + 稼働状況
  - 中央 panel(マップ): 表示モード切替 + 検索 + Google Maps iframe + 凡例 + ピン chips
  - 右 panel(詳細): Header + 配置作業員 + 案件情報 + 進捗バー + クイックアクション
- MOCK_PROJECTS(15 件、lat/lng 含む)を pc/projects から直接 import 再利用(DRY)
- STATUS_META(4 色)も共有
- 選択案件があれば lat/lng + z=14、無ければ宮城県中心 z=9 で iframe URL を切替
- 状態 pill 4 色多重表現(色 + ドット + テキスト)
- 配置作業員アバター(イニシャル円形 + 役割 + リーダー badge)

### ✅ S16 で完了済(スケジュール画面)

**P12-05 スケジュール**(commit `0ca20f8`、2 ファイル、+762 行)
- `src/app/(authenticated)/pc/schedules/page.tsx`(Server Component、ComingSoonPage 置換)
- `src/app/(authenticated)/pc/schedules/SchedulesClient.tsx`(3-pane Client)
- 構成:3-pane layout + 週ナビゲーター
  - 左 panel(2 col): 検索 + 工種 + 状態 + 工種凡例 + チームコスト mini stats
  - 中央 panel(7 col): 案件 × 週ビュー(8 列 table = 案件 + 7 日)
    - thead に日付 + 曜日、本日青ハイライト、週末グレー
    - セル: 工種色 chip + subType + 日付 + 人数(aria-label 付き)
    - 工期外セルは空、土日は配置なし
  - 右 panel(3 col): 当日 KPI 3 + 案件リスト + 未配置者 3 + 印刷 + 配置マップへ
- MOCK_PROJECTS から週内に工期重なる案件のみ filter
- generateMockAssignment(project, date): 工種別 subType pool + 決定的人数生成

### 🎯 次セッション着手内容(板澤様確定の効率順)

**Phase 2 完了 → Phase 3(金額系)に移行**

**P12-06 見積書画面**(NEXT) ← **次に着手**
- 参照画像: `参照データ/見積書.png`
- Stepper 再利用(REPORT3 入力で使用済)
- MOCK_PROJECTS 連携で見積行生成

**Phase 2(単独実装可能・demo 価値高)**
- P12-03 通知画面(list + filter、シンプル、サイドバー 🔔12 と連動)
- P12-04 配置マップフルページ版(既存 DispatchMapPreview を拡張)
- P12-05 スケジュール画面(案件 × カレンダー)

**Phase 3(金額系)**
- P12-06 見積書画面(Stepper 再利用)
- P12-07 請求書画面(見積書から派生)
- P12-08 原価管理(KpiCard / Chart 再利用)

**Phase 4(Polish)**
- P12-09 クエスト・バッジフルページ版
- P12-10 車両・工具
- P12-11 モバイル版 /sp/* 最適化

### 📑 関連監査レポート(必読)
- `docs/rebuild/audit-reports/2026-05-11_S5_reference-data-audit.md`(参照画像 12 枚分析)
- `docs/rebuild/audit-reports/2026-05-11_S6.5_dashboard-comparison.md`

---

## 📋 タスク進捗一覧

凡例: ⬜ 未着手 / 🔄 進行中 / ✅ 完了 / ⏭️ スキップ(理由要記載)

### Phase 1: ビジュアル基盤

- ✅ **P1-01** Tailwind config にデザイントークン追加
- ✅ **P1-02** グローバル CSS 変数の整備
- ✅ **P1-03** `<KpiCard>` コンポーネント
- ✅ **P1-04** `<AlertCard>` `<AlertItem>` コンポーネント
- ✅ **P1-05** `<ProgressBar>` `<HpBar>` コンポーネント
- ✅ **P1-06** `<DataTable>` `<DataTableBasic>` + `.data-table` クラス
- ✅ **P1-07** `<Tag>` コンポーネント + pill-p1〜p4 / pill-gold/silver/bronze
- 🔄 **P1-08** 既存ページの段階的差し替え(P2-01 と並行で実施)

### Phase 2: ダッシュボード再構成 + ししまる

- ✅ **P2-01** ダッシュボードレイアウト刷新
- ✅ **P2-02** KPI クエリ実装
- ✅ **P2-03** アラート集約クエリ
- ✅ **P2-04** 本日の稼働現場テーブル
- ✅ **P2-05** タイムライン(audit_log ベース)
- ✅ **P2-06** 🦁 ししまるサジェスト(ルールベース)
- ✅ **P2-07** 🦁 ししまるの表情ロジック(5 mood)
- ⬜ **P2-08** 通知ドロップダウン(P4 で実施予定 — 後回し)
- ⬜ **P2-09** 既存ランキングページ位置づけ整理(P3-A 着手時に判断)

### Phase 3-A: ポイント管理

- ✅ **P3-A-01** マイグレーション 0012(全 5 テーブル + award_points 関数 + RLS)
- ✅ **P3-A-02** シード(point_rules 6件 + rewards 6件)
- ✅ **P3-A-03** Server Actions(award/request/approve/reject/fulfill/optOut)
- ⏭️ **P3-A-04** 自動付与バッチ(pg_cron)→ Phase 4 へ延期
- ✅ **P3-A-05** `/pc/points` ページ
- ✅ **P3-A-06** `/pc/points/rules` ページ
- ✅ **P3-A-07** `/pc/points/exchange-requests` ページ

### Phase 3-B: パワプロ風ステータス

- ✅ **P3-B-01** マイグレーション 0013(orm-specialist 起動)
- ✅ **P3-B-02** シード(称号 12 件 + 特殊能力 8 件)
- ⏭️ **P3-B-03** スキルパラメータ算出ロジック → 後回し(placeholder で動作確認可)
- ✅ **P3-B-04** `/pc/profile/status` ページ
- ✅ **P3-B-05** SVG レーダーチャート(react-specialist 起動)
- ✅ **P3-B-06** 称号付与モーダル(interaction-designer 起動)
- ✅ **P3-B-07** 称号獲得演出オーバーレイ(css-animation-specialist 起動)
- ⬜ **P3-B-08** 全社員一覧ページ強化 → S5 に持ち越し

### ~~Phase 3-C: 現場マップ(マリオ風)~~ — **廃止(2026-05-11、板澤様判断)**

参照画像に存在しないため廃止。配車マップは Phase 12-04(実地理 Google Maps)で代替。

- ⏭️ ~~P3-C-01〜08~~ 廃止

### ~~Phase 3-D: ボスHPモニター~~ — **廃止(2026-05-11、板澤様判断)**

参照画像に存在しないため廃止。

- ⏭️ ~~P3-D-01〜04~~ 廃止

### Phase 3-E: 幹部育成

- ⬜ **P3-E-01** マイグレーション 0015
- ⬜ **P3-E-02** `/pc/training` 一覧
- ⬜ **P3-E-03** スキルツリー画面

### Phase 4: 演出仕上げ

- ⬜ **P4-01** 数値カウントアップアニメ
- ⬜ **P4-02** entry アニメ
- ⬜ **P4-03** ししまる float アニメ
- ⬜ **P4-04** モバイル版主要画面

### Phase 5: CORE 業務補完(TASK / SCH / ATT 専用打刻)

- ⬜ **P5-01** マイグレーション 0014(tasks / schedules / attendance_punches)
- ⬜ **P5-02** REPORT3 fanout に tasks.actual_hours 加算を追加
- ⬜ **P5-03** `/pc/projects/[id]/tasks` Kanban ボード
- ⬜ **P5-04** `/sp/tasks` モバイル: 自分のタスク一覧
- ⬜ **P5-05** `/pc/schedules` 配車表(週間ビュー)
- ⬜ **P5-06** `/pc/schedules/edit` スケジュール編集
- ⬜ **P5-07** `/sp/today` 今日の予定 + タスク
- ⬜ **P5-08** ATT 打刻 server action(GPS 取得)
- ⬜ **P5-09** `/pc/attendance` 勤怠一覧(管理者)
- ⬜ **P5-10** スケジュール → REPORT3 の予選定
- ⬜ **P5-11** タスク差戻し / 連動の通知
- ⬜ **P5-12** TASK / SCH / ATT のロール別画面ガード

### Phase 6: GENKA 詳細 + GAIKYO

- ⬜ **P6-01** マイグレーション 0015(project_cost_breakdown view + construction_overview)
- ⬜ **P6-02** 集計再計算関数 recalculate_construction_overview
- ⬜ **P6-03** `/pc/projects/[id]/cost` 現場別 原価管理表
- ⬜ **P6-04** `/pc/gaikyo` 工事概況表(全社)
- ⬜ **P6-05** `/pc/gaikyo/[projectId]` 現場別工事概況詳細
- ⬜ **P6-06** `/pc/customer-sales` 既存ページ強化
- ⬜ **P6-07** REPORT3 / supplier_invoice / vehicle_run / invoice の overview 再計算 trigger
- ⬜ **P6-08** PDF 出力 — 工事概況表

### Phase 7: 外部 SaaS 連携

- ⬜ **P7-01** 環境変数 + `/pc/settings/integrations` 接続状態
- ⬜ **P7-02** LINE WORKS — 通知送信モジュール
- ⬜ **P7-03** LINE WORKS — グループマッピングテーブル + UI
- ⬜ **P7-04** LINE WORKS — 通知ルーティング server action
- ⬜ **P7-05** LINE WORKS — 異常検知 + 入力遅れ通知バッチ
- ⬜ **P7-06** Money Forward — OAuth2 認証フロー
- ⬜ **P7-07** Money Forward — 仕訳 CSV 生成 + 連携
- ⬜ **P7-08** Money Forward — 給与連携
- ⬜ **P7-09** Money Forward — 連携ログ + 再送機能
- ⬜ **P7-10** Cloud Sign — 契約書送信 server action
- ⬜ **P7-11** Cloud Sign — 締結ステータス webhook 受信
- ⬜ **P7-12** Cloud Sign — 締結済み PDF を Storage に保存
- ⬜ **P7-13** Google Maps — 案件住所からマップ表示
- ⬜ **P7-14** Google Maps — 配車ルート表示
- ⬜ **P7-15** Google Maps — 現場マップ実地理マップ統合(P3-C と統合)
- ⬜ **P7-16** 連携テスト + フェイルセーフ

### Phase 8: ゲーミフィケーション完成 + AI 統合

- ⬜ **P8-01** バッジ画面 `/pc/badges` `/sp/badges`(図鑑形式)
- ⬜ **P8-02** クエスト画面 `/pc/quests` `/sp/quests`
- ⬜ **P8-03** クエスト達成判定バッチ
- ⬜ **P8-04** XP 自動付与拡張(称号/連続出勤/KY/バッジ)
- ⬜ **P8-05** ランクアップ通知 + 演出
- ⬜ **P8-06** 称号自動付与ロジック evaluate_titles_for_user
- ⬜ **P8-07** さくらししまる AI ナビ — 状況察知エンジン
- ⬜ **P8-08** `<SakuraShishimaruNavi>` 全画面右下フローティング
- 📐 **P8-09** Claude API ハイブリッド統合(ADR-0002 で設計確定済、実装は最後)
  - ⬜ P8-09a PII 匿名化レイヤー(`src/lib/ai/sanitize.ts`)
  - ⬜ P8-09b Claude API クライアント + system prompt 整備
  - ⬜ P8-09c フォールバック構造 + 監査ログ(migration 0017)
  - ⬜ P8-09d コーチング機能(ステータス画面)
  - ⬜ P8-09e 自由質問機能(`/pc/ai-assistant`、office+ のみ)
  - ⬜ P8-09f 月次レポート所感(月次バッチ)
  - ⬜ P8-09g AI 利用ダッシュボード(`/pc/admin/ai-usage`)
  - ⏸️ P8-09h **クライアント説明資料の再提示(P8-09a 着手直前マイルストーン)**

### Phase 9: ロール別画面ガード徹底

- ⬜ **P9-01** ガード対象の網羅監査
- ⬜ **P9-02** 中央ガード関数 requireRole(allowed) 実装
- ⬜ **P9-03** 全マスタ画面に requireRole 適用
- ⬜ **P9-04** Sidebar / `<RoleGate>` で UI レベル隠蔽
- ⬜ **P9-05** ロール別 Playwright テスト

### Phase 10: 汎用ファイル管理(Google Drive 風) + ロール別アクセス制御 + バックアップ + 履歴

- ⬜ **P10-01** マイグレーション 0016(file_folders / files / file_access_grants / file_access_log)
- ⬜ **P10-02** can_access_file() アクセス可否判定関数
- ⬜ **P10-03** Storage バケット `files` + RLS ポリシー
- ⬜ **P10-04** `/pc/files` ルートエクスプローラ
- ⬜ **P10-05** `/pc/files/[folderId]` フォルダ詳細
- ⬜ **P10-06** `<FileUploadDialog>` ドラッグ&ドロップ
- ⬜ **P10-07** `<FolderTree>` 仮想スクロール
- ⬜ **P10-08** `<FilePreview>` 画像/PDF/Office
- ⬜ **P10-09** `<FileAccessControlDialog>` 権限管理 UI
- ⬜ **P10-10** 既存 safety_documents / contractor_templates / receipts.photo_url の段階的統合
- ⬜ **P10-11** 履歴管理 + バージョニング
- ⬜ **P10-12** 論理バックアップ + 監査ログエクスポート

### Phase 11: REPORT3 ステップウィザード化 + 共通レイアウトパターン整備(S5 参照画像監査由来)

- ✅ **P11-01** デザイントークン拡張(brand.report3 グラデ + status セマンティック + radius card/cardLg + pill-active/done/warn/urgent)
- ✅ **P11-02** 共通 `<Stepper>` `<StepFooter>` コンポーネント(react-specialist a4b0、約 280 行)
- ✅ **P11-03** 共通 `<LineItemTable>` (react-specialist ae46、約 430 行、decimal.js)
- ✅ **P11-04** 共通 `<DocumentPreview type="estimate|invoice">` (react-specialist a5ac、約 280 行、A4 縦比率、印影 SVG fallback)
- ✅ **P11-05** `<PhotoGrid>` (component-library-specialist a30f、約 240 行、camera capture)
- ✅ **P11-06** `<SiteInfoPanel>` `<QuickTips>` (react-specialist a5ac、175 + 75 行、details 折りたたみ)
- ✅ **P11-07** `<SidebarFooterWidget>` (component-library-specialist a30f、約 130 行、ダーク用)
- ✅ **P11-14**(部分実施) KpiCard / AlertCard リファイン(数値 32px / 左バー 6px / status セマンティック使用)
- 🔄 **P11-08** REPORT3 入力 6 ステップウィザード化(/sp/report3/new 全面改修 + /pc/report3/new 新規)
- 🔄 **P11-09** REPORT3 下書き保存機能 + 一覧画面
- ⬜ **P11-10** ステップ間バリデーション + エラー表示の精緻化(P11-08/09 と統合)
- ⬜ **P11-11** REPORT3 クイック入力 RPC + モバイル簡易入力 UI
- ✅ **P11-12** REPORT3 ロゴ運用統一(全 PC 画面サイドバー上部固定、acfd specialist)
- ✅ **P11-13** アイコン体系の Lucide 統一(全 13 メニュー、acfd specialist)
- ⬜ **P11-14**(残作業) Tag セマンティック追加 + 既存ページの新コンポーネント差し替え
- ⬜ **P11-15** 角丸 / シャドウのトーン揃え(各既存ページ)

### Phase 12: 画面密度の参照画像準拠化(9 画面の大幅改修 + 補助タスク)

- ✅ **P12-01** ダッシュボード再構成(配車マップ埋込 / 月次グラフ / クエストサマリー / 今日タスク等、a40a specialist 83k tokens、10 補助コンポーネント新規)
- ⬜ **P12-02** 案件管理 2-pane 化(/pc/projects 全面改修)
- ⬜ **P12-03** スケジュール画面新設(/pc/schedules、DnD + キーボード fallback)
- ⬜ **P12-04** 配車マップ新設(/pc/dispatch-map、Google Maps + PostGIS)
- ⬜ **P12-05** 原価管理画面新設(/pc/cost、Materialized View + 月次再集計 + PDF)
- ⬜ **P12-06** 見積書 2-pane + 4 ステッパー化(クラウドサイン送信ボタン)
- ⬜ **P12-07** 請求書 2-pane + 4 ステッパー化 + 入金ランキング
- ⬜ **P12-08** 通知 2-pane 化(severity 列追加 + notification_actions)
- ⬜ **P12-09** クエスト・バッジ画面新設(/pc/quests-badges、teams テーブル新設)
- ⬜ **P12-10** 車両・工具統合(/pc/fleet、alcohol_checks 等 4 法令テーブル新設)
- ⬜ **P12-11** モバイル ホーム画面改修(/sp/home、出退勤大ボタン + クイック入力)
- ⬜ **P12-12** migration 0017(11 新規テーブル + 4 既存拡張 + 5 ビュー + 5 関数)
- ⬜ **P12-13** ステータスタグセマンティック化(pill-active / pill-done)
- ⬜ **P12-14** チームレベルゲージのデータソース整備(team_progress_view)
- ⬜ **P12-15** KpiCard リファイン(数値 32px、アイコン横並び)
- ⬜ **P12-16** AlertCard リファイン(左バー 6px)
- ⬜ **P12-17** ダッシュボード「今日のタスク」テーブル
- ⬜ **P12-18** ダッシュボード「直近の通知」カード
- ⬜ **P12-19** ダッシュボード「稼働状況」棒グラフ
- ⬜ **P12-20** ダッシュボード「売上/原価/利益月次」3 系列グラフ
- ⬜ **P12-21** ダッシュボード「よく使うアクション」フッター
- ⬜ **P12-22** マリオ風 vs 実地理マップ併存設計の実装(別メニュー化)

---

## 🚀 次セッション(S5)でやること

### 開始前チェック
1. このファイル(`PROGRESS.md`)を最初に読む
2. `MASTER-PLAN.md` で **P3-C**(現場マップ画面)の詳細を確認
3. `SESSION-LOG.md` の S4 を確認
4. `git status` で前回未コミットがないか確認

### ✅ migration 0012 / 0013 + seed は Supabase に適用済み

2026-05-10 S4 終了後、Supabase MCP コネクタ経由で適用完了:
- migration 0012 (points_system) ✅
- seed 0012 (point_rules 6件 + rewards 6件) ✅
- migration 0013 (status_system) ✅
- seed 0013 (title_definitions 12件 + special_abilities 8件) ✅

`/pc/points` `/pc/profile/status` 共に DB エラーなく動作可能。

### S5 でやること(Phase 3-C: 現場マップ画面)

**目玉機能の 1 つ**。デモ v4.0 の Mario 風 WORLD MAP を本番データで再現。

1. **P3-C-01**: マイグレーション 0014(`projects` に `area_group` / `is_boss_stage` / `map_position_x/y` / `icon` カラム追加)
2. **P3-C-02**: `/pc/projects/map` ページ
3. **P3-C-03**: ししまるキャラマーカー(SVG レイヤー)
4. **P3-C-04**: 現場詳細ポップアップ
5. **P3-C-05**: マップエディタ(管理者用、編集画面)

**並列 specialist 化の機会**:
- map ページの SVG ノード描画 → react-specialist
- ポップアップ UI → interaction-designer
- エディタ(ドラッグ&ドロップ位置設定)→ react-specialist

### 持ち越しタスク
- **P3-B-08**: `/pc/users` 一覧に Lv / 主要称号 / 今月pt 列を追加
- **P3-B-03**: スキルパラメータ算出ロジック(現状 placeholder)

### S5 完了の目安
- マイグレーション 0014 が Supabase に適用される
- `/pc/projects/map` が表示される(WORLD タブ + ノード + 進捗別配色)
- ノードクリック → 現場詳細ポップアップ
- 管理者向けマップエディタで現場の位置を設定可能
- ビルド通過 + PROGRESS.md / SESSION-LOG.md 更新 + コミット

---

## 旧: 次セッション(S4)でやること【完了済み・参考保存】

### 開始前チェック
1. このファイル(`PROGRESS.md`)を最初に読む
2. `MASTER-PLAN.md` で **P3-B**(パワプロ風ステータス画面)の詳細を確認
3. `SESSION-LOG.md` の S3 を確認
4. `git status` で前回未コミットがないか確認

### ⚠️ 重要: 次セッション開始時にやること

**マイグレーション 0012 (ポイント管理)を Supabase に適用する**。
ローカルに `supabase/migrations/0012_points_system.sql` を作成済み。
適用方法は 2 通り:

**方法 A. Supabase Dashboard SQL Editor 経由(手動、確実)**
1. https://supabase.com/dashboard/project/{your-project-id}/sql で
   `0012_points_system.sql` の中身を貼り付けて実行
2. 続いて `seed/0012_seed_points.sql` を実行(初期データ投入)

**方法 B. Supabase CLI(自動、推奨)**
```bash
supabase db push
```

適用しないと `/pc/points` でテーブル不在エラーになります。

### S4 でやること(Phase 3-B: パワプロ風ステータス画面)

ゲーミフィケーションの目玉機能。最も視覚的インパクトが大きい。

1. **P3-B-01**: マイグレーション 0013(称号・スキル関連)
   - `title_definitions` / `titles_granted` / `skill_parameters` / `special_abilities` / `user_abilities`
2. **P3-B-02**: シード(称号 12件 + 特殊能力 8件)
3. **P3-B-03**: スキルパラメータ算出ロジック
   - 6 軸: 技術力 / 判断力 / 安全 / 報連相 / 体力 / 責任感
   - 既存 DB から計算可能なものから先に実装、不足は固定値で許容
4. **P3-B-04**: `/pc/profile/status` ページ(パワプロ風画面)
5. **P3-B-05**: SVG レーダーチャートコンポーネント
6. **P3-B-06**: 称号付与モーダル(管理者用)
7. **P3-B-07**: 称号獲得演出オーバーレイ
8. **P3-B-08**: 全社員一覧ページ強化(Lv / 称号 / 今月pt 列追加)

### S4 完了の目安
- マイグレーション 0013 が Supabase に適用される
- `/pc/profile/status` でキャラ画面が表示される
- レーダーチャートが滑らかに描画される
- 既存 `/pc/profile` から「ステータス画面を見る」リンクで遷移可能
- ビルド通過 + PROGRESS.md / SESSION-LOG.md 更新 + コミット

---

## 🛠️ 直近の作業詳細

### 最終セッション: S1(Phase 1 ビジュアル基盤)— 2026-05-10
完了タスク: P1-01 〜 P1-07(7タスク)

**変更ファイル**:
- `tailwind.config.ts` — `p1-p4`/`gold/silver/bronze` カラー、glow shadow、keyframes、animations 追加
- `src/app/globals.css` — `:root` トークン、`.pill-p*`、`.data-table`、`.wf-note`、`prefers-reduced-motion` 対応追加
- `src/components/ui/KpiCard.tsx` — 新規(左4pxバー + 角アイコン + 値 + trend)
- `src/components/ui/AlertCard.tsx` — 新規(0件で null, 横並びアラート)
- `src/components/ui/ProgressBar.tsx` — 新規(auto配色対応)
- `src/components/ui/HpBar.tsx` — 新規(進捗率で色変化、低残量パルス)
- `src/components/ui/DataTable.tsx` — 新規(汎用ラッパー + columns ベースの簡易版)
- `src/components/ui/Tag.tsx` — 新規(p1-p4/gold/silver/bronze + 既存系の variant)
- `src/components/ui/index.ts` — barrel export

**動作確認**: `npm run build` 通過 ✅

### S0(計画策定)— 2026-05-10
- リビルド計画ファイル一式作成

---

## 📝 Decisions Log

| 日付 | 内容 | 影響タスク |
|---|---|---|
| 2026-05-10 | 全フェーズ完全実装で進める(板澤様 D 案) | 全 |
| 2026-05-10 | ししまる AI はルールベース → 必要に応じて Claude API 連携(P2-06) | P2-06 |
| 2026-05-10 | ゲーミフィケーションは現時点でのベストプラクティスで実装。クライアント確認後に大幅修正可能性あり。**設計指針**: ①実業務KPIと連動(架空ポイントではなく安全・出来高・期限遵守等の実数値)②個人ランキングだけでなくチーム達成を強調③表彰・承認による Recognition を中心(金銭報酬は補助的)④進捗(自分比較)を主、順位を従⑤opt-out 機能を全ユーザーに付与⑥失敗を罰しない設計(コンボ途切れの「赦し」期間 etc) | P3-A 全般 / P3-B 全般 |
| 2026-05-10 | P1-08(既存ページ差し替え)は P2 と並行で実施。ダッシュボードを新コンポーネントで作ることが他ページのリファレンスになる。 | P1-08 |
| 2026-05-10 | Phase 3 から疑似 specialist 化を導入(Task subagent_type: general-purpose に `.claude/agents/*.md` の役割を演じさせる)。Phase 1〜2 は単独実装で継続。 | P3 全般 |
| 2026-05-10 | フォルダリネーム実行(`Claude-Code-Game-Studios` → `sakuraOSシステム開発用`)+ テンプレ由来ファイルを `docs/_template-archive/` へ集約。 | 全(パス参照のみ) |
| 2026-05-10 | **設計図 12 項目の照合監査を実施**。Phase 5(CORE 業務補完)/ Phase 6(GENKA + GAIKYO)/ Phase 7(外部 SaaS 連携)/ Phase 8(ゲーミフィケーション完成)/ Phase 9(ロール別画面ガード徹底)/ Phase 10(汎用ファイル管理 + ロール別アクセス制御)を MASTER-PLAN.md に追加。総タスク 43 → 約 110 に拡張。**A 案: 全面拡張で進める**(板澤様確認済)。 | 全 |
| 2026-05-10 | **ファイル管理は Google Drive 風(フォルダ階層 + ロール別アクセス制御)で実装**。既存の安全書類 / 元請テンプレート / 領収書写真は段階的に汎用ファイル管理へ統合する方針。バージョニング + 監査ログも必須(板澤様要件)。 | Phase 10 |
| 2026-05-10 | **現場マップにマリオ風ステージナンバリング(1-1, 1-2)+ 従業員配置レイヤーを必須化**。WORLD = area_group / STAGE = 同 area 内の連番。従業員がどの案件に配置されているかを地図で俯瞰できることが本要件のキー。詳細仕様はクライアント秋元様と詰めるが、導入確定。モバイル版マップ(`/sp/map`)も必須。Phase 3-C を 5 → 8 タスクに拡張。 | Phase 3-C |
| 2026-05-10 | **🔥 全作業の必須プロセス**: タスク着手前に毎回「これがベストプラクティスか?」を確認すること。実装方式 / 命名 / セキュリティ / アクセシビリティ / パフォーマンス / 保守性 を毎タスクのサブ AC として組み込む。`.claude/agents/*.md` を読んで該当 specialist の規律を当てる時も同様。 | 全タスク |
| 2026-05-11 | **参照データ画像 12 枚 監査(S5)**。板澤様より「全 PNG を読み取って UI/UX/デザイン/システム構造を全部模倣せよ、エージェントフル稼働可、トークン惜しまず」の指示。4 specialist(brand-director/interaction-designer/screen-designer/systems-analyst)を並列起動、172k tokens 消費、本格的な設計分析完了。**Phase 11(REPORT3 ステップウィザード化 + 共通レイアウトパターン整備、15 タスク)** と **Phase 12(画面密度の参照画像準拠化、22 タスク)** を追加。総タスク数 120 → 約 147。 | 全 |
| 2026-05-11 | **マリオ風 STAGE マップ vs 実地理 Google Maps を別画面として併存**。マリオ風(Phase 3-C)= ゲーミフィケーション装飾、実地理(Phase 12-04)= 配車業務オペレーション。両者のメニュー分離。 | Phase 3-C / Phase 12 |
| 2026-05-11 | **見積書 / 請求書を 2-pane + 4 ステッパー + ライブプレビューに大改修**。共通の `<DocumentPreview>` `<LineItemTable>` を抽出して 1 ソース化(HTML プレビュー + PDF テンプレ統一)。 | Phase 12-06/07 |
| 2026-05-11 | **車両 + 工具を統合した /pc/fleet 新画面**(既存の /pc/vehicles + /pc/tools は redirect で残す)。alcohol_checks(道交法準拠)/ vehicle_inspections / disaster_response_kits / vehicle_radio_logs の 4 法令テーブルを新設。 | Phase 12-10 |
| 2026-05-11 | **migration 0017 計画**: 11 新規テーブル + 4 既存拡張 + 5 ビュー + 5 関数。Phase 5 既存計画の tasks / attendance_punches / work_assignments を 0017 で先行投入する方針。 | Phase 12-12 |
| 2026-05-11 | **🔥 重大方針確定: 参照画像 12 枚への完全準拠を最優先方針とする**。<br>**廃止: Phase 3-C(マリオ風 STAGE マップ)/ Phase 3-D(ボスHPモニター TV 画面)** — 参照画像にないため。<br>**保持: Phase 3-E(幹部育成スキルツリー)** — 板澤様判断で残す。<br>**実装戦略**: 既存ページを直接書換え(B 案、本番に随時反映)、並走実装は不要。<br>**着手順序**: Phase 11 共通基盤先行(P11-01〜07 を最初のセッションで)→ Phase 11 後半 → Phase 12 各画面 → Phase 7/9/10/8。<br>**クライアント報告**: 方針変更通知は一旦不要(進捗良ければ次回打ち合わせで自然に説明)。<br>**実装方針**: エージェントフル活用、トークン惜しまず、specialist 並列起動。 | 全タスク |
| 2026-05-10 | **さくらししまるの口調を「現代口語(〜だよ / 〜してね)」に統一**。旧 じゃ口調(おる/じゃ/ぞ)を全面廃止。**機能と乖離した文言は使わない**(例:「現場が動き出したら教えてくれるかの」は削除 — システムは日報提出を自動検知するため、ユーザーに「教える」アクションは不要だった誤解誘発フレーズ)。**さくらししまるは現状ルールベースのみで Claude API 未統合**であることも CLAUDE.md / コメントに明記。 | Phase 2 / 4 / 8 |
| 2026-05-10 | **Claude API 統合の設計のみ確定(ADR-0002 策定)**。実装は有料 API 系統合フェーズ(全 110 タスクの最後)で行う。板澤様の確認:①AI 個人評価 OK、②横展開差別化に強い意志あり、③秘匿性担保設計で社内ポリシークリア可能。**ハイブリッド設計**(ルールベース層 + Claude API 層)を採用、PII 匿名化レイヤー必須、フォールバック必須、月予算上限あり。**P8-09 着手直前にクライアント説明資料を Claude が再提示する義務**(P8-09h)。詳細は `docs/architecture/adr-0002-shishimaru-ai-integration.md`。 | Phase 8 P8-09 |

---

## 🚨 ブロッカー / 未解決事項

- [x] ~~**フォルダリネーム未実施**~~ → **2026-05-10 S1.6 で実施済み**。
  `Claude-Code-Game-Studios` → `sakuraOSシステム開発用` に変更。あわせてテンプレ由来
  ファイルを `docs/_template-archive/` へ集約済み。詳細は `docs/rebuild/FOLDER-RENAME.md`。
- [ ] **GitHub PAT のローテーション** — `git remote -v` で確認した remote URL に
  Personal Access Token が埋め込まれていた。漏洩リスクがあるため、GitHub > Settings >
  Developer settings から該当 PAT を revoke + 再生成 + remote 更新を推奨。

---

## 🔗 参考デモ

クライアント評価済みデモのソース:
- HTML: `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\index.html`
- CSS: `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\css\base.css`(他 pawapro.css / screens.css)

各タスク着手時に該当部分のコードを参考にしつつ、本番アーキテクチャ(Server Components + Server Actions + RLS)に合わせて移植する。
