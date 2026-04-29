# SAKURA OS Master Backlog

> **方針**: 設計図 v2(`さくら株式会社 業務管理システム 設計図 v2`)の全機能モジュールを段階的に実装する。
> このファイルは "Single Source of Truth" として、各機能の実装ステータスを管理する。
>
> 各機能の状態:
> - ✅ **完了**(本番デプロイ済み)
> - 🟡 **部分実装**(基本のみ、設計図相当の充実が未完)
> - ⏳ **着手待ち**(優先度判定済み、未実装)
> - 💤 **将来構想**(設計図でも「将来」と扱われている)

## 進捗サマリ(2026-04-29 時点)

全体カバー率: **約 35%** → 目標 **100%**

| 優先 Tier | 内容 | 残件数 |
|---|---|---|
| Tier 1(効率重視/小規模/独立) | 既存基盤の延長で書ける機能群 | 10 |
| Tier 2(中規模/モジュール追加) | 新規テーブル + フォーム + 集計 | 8 |
| Tier 3(大規模/複合機能) | サクラコイン全体・スケジュール一式 | 4 |
| Tier 4(外部連携 Mock) | API Adapter 層の追加 | 4 |
| 将来構想 | スコープ外 | 1 |

---

## 完了済み(参考: 何が出来ているか)

### Phase B(MVP骨格)
- ✅ 認証(Supabase Auth)・ロール別ホーム振り分け(worker/leader/office/ceo/system)
- ✅ 経営ダッシュボード(KPI 4 枚)
- ✅ 3階層 REPORT3 入力(モバイル)・一覧・詳細・承認・差戻し
- ✅ 監査ログ(audit_log)

### Phase 3 拡張
- ✅ REPORT3 自動反映 5 系統(原子 RPC `submit_report3_atomic`):rows / project_cost_aggregates / user_career_totals / gamification_events / audit
- ✅ GPS + 写真添付(Supabase Storage バケット `report3-photos`)
- ✅ ユーザーマスタ CRUD(Edge Function `create-user` + service_role)
- ✅ 見積・請求 CRUD(明細・税率・状態)
- ✅ 印鑑マスタ + PDF 合成(PDFKit + 日本語フォント Bundle)
- ✅ 工事概況サマリ(`/pc/projects/[id]`)
- ✅ 現場マスタ・客先マスタ CRUD

### Phase 4(A〜E)
- ✅ CSV エクスポート(日報 / マネーフォワード会計取込)
- ✅ Excel エクスポート(見積 / 請求書, ExcelJS)
- ✅ ゲーミフィ画面(ランキング / バッジ / クエスト + パワプロ風 SP UI)
- ✅ 工具管理(マスタ + QRトークン + GPS 持出/返却)
- ✅ 車両運行管理(車両マスタ + 運行記録 + アルコールチェック + GPS)

### 横断
- ✅ 開発者 system ロール(`dev@sakura-os.local`、PC/SP 横断ナビ)

---

## ⏳ Tier 1(効率重視・次に実装する塊)

| ID | 機能 | DB 追加 | 規模 | 想定セッション |
|---|---|---|---|---|
| T1-01 | 客先別売上レポート(`/pc/customer-sales`) | 無し(既存 invoices 集計) | 小 | 0.2 |
| T1-02 | 入金管理画面(`/pc/payments`) | 無し(既存 invoices フィルタ) | 小 | 0.2 |
| T1-03 | ヒヤリハット報告 | `incident_reports` | 中 | 0.5 |
| T1-04 | 通知センター | `notifications` | 中 | 0.5 |
| T1-05 | 得意分野マップ(レーダーチャート) | 無し(既存 report3_rows 集計) | 小 | 0.3 |
| T1-06 | 個人プロフィール 成長グラフ | 無し(既存 gamification_events) | 小 | 0.3 |
| T1-07 | 単価マスタ(`price_items`)| `price_items` | 小 | 0.3 |
| T1-08 | 資格マスタ + 個人保有資格 | `qualifications` + `user_qualifications` | 中 | 0.5 |
| T1-09 | 工種マスタ管理画面(既存 work_classifications を CRUD) | 無し | 小 | 0.3 |
| T1-10 | 月次給与勤怠集計 CSV(MF給与) | 無し(既存 user_career_totals + 時給) | 小 | 0.3 |

**合計**: 約 3〜4 セッション分。本セッションで T1-01〜T1-08 の主要を着手。

---

## ⏳ Tier 2(中規模・モジュール追加)

| ID | 機能 | DB 追加 | 規模 | 備考 |
|---|---|---|---|---|
| T2-01 | 勤怠系一式(GPS打刻 / 出退勤管理 / 修正申請 / 月末締め) | `attendance` `leave_requests` `attendance_corrections` `monthly_close` | 大 | 設計図 第2段階の基本機能 |
| T2-02 | 図面・書類アップロード(案件別) | `documents` + Supabase Storage | 中 | 既存 photo upload 流用 |
| T2-03 | 部署別会議フォルダ | `meeting_folders` `meeting_notes` | 中 | 専務要望 |
| T2-04 | 2段階認証(TOTP) | Supabase Auth MFA | 中 | UI 設定画面 + ログインフロー拡張 |
| T2-05 | 残業・有休・特別休暇申請ワークフロー | `leave_requests` 拡張 | 中 | 月末締め連動 |
| T2-06 | LINE WORKS 通知 Mock(キュー + 送信ログ) | `notification_queue` `notification_log` | 中 | T1-04 と連動 |
| T2-07 | ヒヤリハット / 入力漏れ検知の自動 LINE 通知 | T2-06 を流用 | 小 | T1-03 完了後 |
| T2-08 | 個人プロフィール詳細(資格・育成・成長履歴) | T1-08 連動 | 中 | レーダー + バッジ + 履歴 |

---

## ⏳ Tier 3(大規模・複合機能)

| ID | 機能 | DB 追加 | 規模 | 備考 |
|---|---|---|---|---|
| T3-01 | **サクラコイン(SC)全体** | `coin_balances` `coin_transactions` `coin_items` `coin_redemptions` `coin_rules` | 大 | 8 サブ機能。獲得エンジン(設計図 第10章)+ 交換ショップ + 申請フロー + 在庫予算管理 + ルール設定 |
| T3-02 | **スケジュール + 配車表 + ガントチャート** | `project_schedules` 拡張 + `vehicle_schedules` + `personal_schedules` | 大 | 大型 Calendar UI。Drag&Drop。週/月切替 |
| T3-03 | **ししまるナビ演出** | `navi_messages`(状況分岐スクリプト) | 中 | キャラクターアセット + セリフ + 状況判定。Phase 4 デザイントークンの「パワプロ風」延長 |
| T3-04 | チームクエスト / 師弟制度 / 親方ツリー / サンクス機能 / 無事故記録 / デイリークエスト / 技能士名鑑 / 現場制覇マップ | 各々独立テーブル | 中〜大 | ゲーム要素の残り 8 機能 |

---

## ⏳ Tier 4(外部連携 Mock / 実装)

| ID | サービス | 用途 | 状況 |
|---|---|---|---|
| T4-01 | Google Maps Platform | 車両ルート / GPS 地図埋め込み | 現状リンクのみ。`<iframe>` または mapbox-style 埋め込みへ |
| T4-02 | LINE WORKS | 通知 / リマインド配信 Adapter | T2-06 と統合。実 API は将来 |
| T4-03 | クラウドサイン | 電子契約 Adapter | 見積 → 契約データ生成 Mock |
| T4-04 | Google Calendar | 予定同期 | T3-02 と連動 |

---

## 💤 将来構想(設計図でも「将来」扱い)

- ししまるの **AI アシスタント化**(Claude API 統合):データ参照層 / アクション実行層 / チャット UI 層の 3 層。現フェーズでは扱わない(設計図明記)。

---

## 実装順方針

「**実装効率順**」=「既存基盤の流用度 × 独立性 × 業務インパクト」で並べた結果:

1. **Tier 1**(全て)→ 基盤を埋める。本セッションで主要を着手。
2. **Tier 2**(順序: T2-01 勤怠 → T2-04 2FA → T2-02 図面 → 残り)→ 業務の骨格完成。
3. **Tier 3**(順序: T3-01 サクラコイン → T3-02 スケジュール → T3-03 ししまる → T3-04 ゲーム拡張)
4. **Tier 4**(必要に応じて随時、Tier 3 と並行可)

各 Tier 完了時に再度カバー率を測定し、本ファイルを更新する。

---

## 更新履歴

- 2026-04-29: 初版作成。設計図 v2 を Single Source of Truth として登録。
