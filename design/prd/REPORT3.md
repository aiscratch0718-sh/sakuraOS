# PRD: REPORT3 — 3階層作業日報システム

> **Status**: Draft v1 (本セッションで起草)
> **Owner**: product-manager
> **Last Updated**: 2026-04-28
> **Related Concept**: `design/prd/product-concept.md`
> **Related ADRs**: ADR-0001 (REPORT3 atomic fanout)
> **Priority**: MVP (第2段階)

---

## 1. Overview

REPORT3 は SAKURA OS の **唯一の主要入力点**。配管工事業の作業員が毎日入力
する 3 階層構造(大分類→中分類→小分類)+作業時間の日報。一回の保存で:

1. 個人キャリア累計(工種別の累計時間)を更新
2. 出来高ゲージ(ゲーミフィ)を反映
3. 現場原価(時間×職種別単価)を再計算
4. ランク/XP/SC を自動付与
5. 入力漏れ検知の対象を更新

これらを **単一トランザクション** で実行する(ADR-0001 で詳細)。

---

## 2. Target User & Job

### Persona

**配管工事の職人(20代見習い〜60代ベテラン)**。スマホ操作に得意・不得意が
混在。日報の意義は理解しているが、紙ベースの現状でも面倒さで未提出が発生。

### Job-to-be-Done

> **業務を終えて道具を片付け帰り支度をしているときに、**
> **今日やった工種を3タップ程度で記録したい。**
> **そうすれば自分の累計実績が伸びる楽しさを感じつつ、**
> **会社にも「やったこと」が正確に伝わる。**

### Trigger / Evidence

- **Trigger**: 業務終了時(日没頃 / 17時前後) — スマホで `sp/report3` を開く
- **Evidence (現状の Pain)**:
  - 紙の日報は字が読めない事案あり / 紛失リスク
  - 作業員ごとに記入粒度がバラつき、原価計算に使えない
  - 月末の集計に事務(秋元様)が大きな時間を費やしている

---

## 3. User Journey

### Happy Path (作業員 / 3分)

1. 業務終了 → スマホで `sp/report3/new` を開く
2. **現場名**: 今日の配置から自動セット(タップで変更可)
3. **大分類**: 6つのアイコン(配管/保温/足場/機器設置/溶接/その他)からタップ
4. **中分類**: 大分類で絞り込まれた選択肢から1タップ
5. **小分類**: 中分類で絞り込まれた選択肢から1タップ
6. **作業時間**: スライダー(0.5h 刻み)or 数値入力
7. **写真**(任意): カメラ起動 / ギャラリー → 自動 GPS+タイムスタンプ
8. **メモ**(任意): 自由記述
9. **+もう1行**(複数工種を組み合わせた日に限り): 上記繰り返し
10. **保存** → 「+10XP / +5SC を獲得しました!」とししまるナビが表示
11. ホーム画面の出来高ゲージが更新されている

### Alternative Paths

- **A1. 朝に予定を確認 → 終業時に思い出して入力**: 同じ画面、同じフロー。
- **A2. 一日に複数現場を移動**: 「+もう1行」で現場名を切り替えて記録。
- **A3. 入力途中で電波切断**: ローカル保存 → 復帰時に自動同期。
- **A4. 写真を後から追加**: 提出済みでも当日中なら写真追加可(翌日以降は不可)。

### Failure Paths

- **F1. 業務時間外なのに残作業発生 → 当日の工数合計が8時間超過**: 警告ダイアログ
  「8時間を超えていますが続行しますか?」 → 続行可能だが「現場リーダー承認必須」
  フラグが立つ
- **F2. 業務終了時刻を過ぎても未入力**: 23:00 に LINE WORKS で本人へリマインド
  通知 → それでも未入力なら翌朝 7:00 に再通知 + 現場リーダーへも通知
- **F3. 有給/特別休暇申請がある日の自動スキップ**: スケジュール側で「不在」
  ステータスならREPORT3 入力義務なし(入力漏れ検知から除外)
- **F4. 保存時に DB エラー**: 5系統 fanout すべて rollback、ローカルストレージに
  保持してリトライ可能(ADR-0001)

---

## 4. Functional Requirements

### Input

- **TR-RPT-001**: SHALL 作業員ロール以上のユーザーがログインしているとき
  `/sp/report3/new` ページにアクセスできる
- **TR-RPT-002**: SHALL 大分類 → 中分類 → 小分類 の階層関係を `work_classification`
  マスタから読み込み、選択を絞り込む(API ではなく Server Component で事前取得)
- **TR-RPT-003**: SHALL 1件のレポートに **複数行(複数の工種×時間ペア)** を含める
  ことができる(最低1行、最大10行)
- **TR-RPT-004**: SHALL 各行は (大分類, 中分類, 小分類, 作業時間[0.5h刻み], 写真任意, メモ任意) を持つ
- **TR-RPT-005**: SHALL 同一日内の合計作業時間が 8時間を超える場合、
  警告ダイアログを表示する(続行可能だが `requires_leader_approval` フラグ)
- **TR-RPT-006**: SHALL 写真添付時は GPS 座標 + タイムスタンプを EXIF または
  メタデータカラムに記録する
- **TR-RPT-007**: SHALL 入力途中の状態をブラウザの `localStorage` に保存し、
  ネットワーク復帰後に自動同期する
- **TR-RPT-008**: SHALL 提出済みレポートの **当日中** の写真追加を許可する
  (翌日以降は事務ロールでない限り編集不可)

### Atomicity (ADR-0001)

- **TR-RPT-010**: SHALL `submitReport3` Server Action は以下5系統の更新を
  単一の Postgres トランザクションで実行する:
  1. `report3_entries` への新規行挿入
  2. `user_career_totals` の累計時間更新(工種別)
  3. `project_cost_aggregates` の現場原価再計算
  4. `gamification_events` への XP / SC イベント発行
  5. `audit_log` への監査エントリ記録
- **TR-RPT-011**: SHALL 上記5系統のいずれかが失敗した場合、すべて rollback し、
  ユーザーには「保存に失敗しました。再試行してください」エラーを表示する
- **TR-RPT-012**: SHALL 提出時に `idempotency_key`(クライアント生成 UUID v4)を
  受け取り、再送時に重複適用しない
- **TR-RPT-013**: SHALL ゲーミフィ通知(ししまるナビ表示)は **トランザクション
  コミット後** に発火する(コミット失敗時に通知が出ない保証)

### Validation

- **TR-RPT-014**: SHALL 各行の作業時間は 0.5h 刻み、最小 0.5h、最大 24h で検証する
- **TR-RPT-015**: SHALL 大分類・中分類・小分類の組み合わせはマスタ上で有効な
  3階層パスである場合のみ受け付ける(不正組合せは 422 エラー)
- **TR-RPT-016**: SHALL 当日 23:59 を超えたレポートは「翌日扱い」または「過去日扱い」を
  ユーザーに確認(タイムゾーン: Asia/Tokyo)
- **TR-RPT-017**: SHALL 過去日付の入力は事務ロール以上のみに許可する(作業員は当日のみ)

### Display

- **TR-RPT-018**: SHALL 提出後にししまるナビが「+XP / +SC / ランクアップ(該当時)」を
  3秒間トースト表示する
- **TR-RPT-019**: SHALL 作業員のホーム画面に直近7日間の提出状況をミニカレンダーで表示する
- **TR-RPT-020**: SHALL 現場リーダーの承認画面で、自分のチームの当日 REPORT3 を一覧表示し、
  一括承認できる

### Notification

- **TR-RPT-021**: SHALL 23:00 までに当日 REPORT3 が未提出かつ休暇申請なしの場合、
  本人の LINE WORKS 個人チャットへリマインド送信する(`/notifications/check-missing-report3` cron)
- **TR-RPT-022**: SHALL 翌朝 7:00 にも未提出が続いている場合、本人 + 現場リーダーへ通知する

---

## 5. Edge Cases & Failure Modes

| Edge Case | Behavior |
|-----------|----------|
| **Empty (新規作業員、初回)** | サンプル付きの空フォーム。ししまるナビが「最初の入力で +20XP ボーナス」案内 |
| **Loading(マスタ取得中)** | スケルトン表示(form fields のみ静的、選択肢ドロップダウンが skeleton) |
| **Error (atomic fanout 失敗)** | 「保存に失敗しました。電波状態を確認して再試行してください」+ ローカル保持 + 自動リトライ(指数バックオフ最大3回) |
| **Partial data(行を1〜2行入れた状態で離脱)** | localStorage に保存 → 次回開始時「下書きがあります。続行しますか?」 |
| **Permission-denied(他人の REPORT3 編集試行)** | 403 表示。事務ロール以外は他人のレポート閲覧/編集 不可 |
| **Network failure(送信中切断)** | 行頭で送信前にローカル保存。ネットワーク復帰時に自動再送 + idempotency key で重複防止 |
| **Concurrent edit(同一日2回提出)** | 既存レポートに「+もう1行」追記する形に正規化(別レコードを作らない) |
| **タイムゾーン跨ぎ(深夜0時跨ぎの作業)** | 「業務開始日」基準で記録(例: 23時開始→翌1時終了 → 開始日のレポート) |
| **写真サイズ制限超過(>10MB)** | クライアント側で自動圧縮 → 失敗時にユーザーへ「写真サイズを縮小してください」 |

---

## 6. Out of Scope

| Item | Rationale |
|------|-----------|
| **個人キャリアシート画面** | 別 PRD `gamification.md` で定義(REPORT3 はデータを書き込むだけ) |
| **現場原価管理表** | 別 PRD `per-site-cost-management.md` で定義(REPORT3 はデータを書き込むだけ) |
| **工事概況表への反映** | 別 PRD `construction-overview.md` で定義 |
| **マネーフォワードへの給与連携** | 別 PRD `attendance-payroll.md` で定義(REPORT3 はソースデータのみ提供) |
| **音声入力対応** | Future(Phase 6 以降) |
| **AI による工種自動推測** | Future(ししまる AI 化と合わせて検討) |

---

## 7. Acceptance Criteria

### AC-1: 基本フロー(TR-RPT-001〜007)

- **Given**: 作業員ロールでログイン済み、当日の現場が割り当て済み
- **When**: `/sp/report3/new` を開いて 1 行(配管/冷媒/塩ビ配管/4h)を入れて保存
- **Then**:
  - データベースの `report3_entries` に 1 行追加
  - `user_career_totals` の (配管/冷媒/塩ビ配管) 累計が +4h
  - `project_cost_aggregates` の当該現場の人件費が +4h × 単価
  - `gamification_events` に (+10XP, +5SC) イベント
  - `audit_log` に対応するエントリ
  - すべてが同一の `transaction_id` でリンクされている

### AC-2: Atomicity(TR-RPT-010〜013)

- **Given**: AC-1 の前提
- **When**: `gamification_events` 挿入時に意図的に DB エラーを発生させる
- **Then**:
  - 5系統すべての挿入が rollback
  - ユーザーには「保存に失敗しました」エラー
  - 監査ログに失敗イベントが残る
  - 再試行時、`idempotency_key` が同じならば重複適用なし

### AC-3: 8時間超過警告(TR-RPT-005)

- **Given**: 同一作業員・同一日に既に 6h 入っている
- **When**: 追加で 3h を入れて保存(合計 9h)
- **Then**: 警告ダイアログ → 続行選択時、`requires_leader_approval = true` で保存

### AC-4: 入力漏れ検知 + LINE 通知(TR-RPT-021〜022)

- **Given**: 作業員 A が当日 23:00 までに REPORT3 未提出 / 休暇申請なし
- **When**: 23:00 のスケジュールジョブが実行
- **Then**:
  - LINE WORKS の作業員 A 個人チャットにリマインドメッセージ
  - 翌朝 7:00 でも未提出なら本人 + 現場リーダーへ通知

### AC-5: 過去日入力の権限分離(TR-RPT-017)

- **Given**: 作業員ロールで過去日の REPORT3 入力を試行
- **When**: フォーム submit
- **Then**: 403 エラー / 「過去日入力は事務へ依頼してください」メッセージ

### AC-6: 写真の GPS スタンプ(TR-RPT-006)

- **Given**: 作業員が写真添付して保存
- **When**: 保存処理
- **Then**:
  - `report3_photos` に GPS 座標 + タイムスタンプが保存される
  - 元画像の EXIF も保持

---

## 8. Success Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| **日報提出率(全作業員 / 月平均)** | ≥ 95% | 月次集計 from `report3_entries` |
| **入力時間(p75)** | ≤ 3 分 | クライアント計測(画面開く→保存) |
| **atomicity 失敗率** | < 0.1% | エラーログ集計 / 月次 |
| **LINE 通知 → 提出転換率** | ≥ 70%(通知から24時間以内に提出) | 通知ログ + REPORT3 タイムスタンプ突合 |
| **作業員の体感満足度(NPS 相当)** | ≥ +20 | リリース60日後アンケート |
| **月次集計に事務(秋元様)が使う時間** | リリース前比 50% 削減 | 月末締め作業の自己計測 |

### Instrumentation Requirements

- すべての REPORT3 提出イベントに `client_render_ms`(画面表示〜送信完了の時間)を記録
- atomicity 失敗時は失敗系統(どのテーブル更新で失敗したか)を audit_log に明記
- LINE 通知ログを `notification_dispatch_log` に保存し、24時間以内の提出と突合

---

## 9. UI Requirements (handoff to /ux-design)

> **📌 UX Flag — REPORT3**: This system has UI requirements. Run
> `/ux-design report3-input` next to create the screen-level UX spec.

主要画面:

- `sp/report3/new` — 新規入力フォーム(モバイル最適化、タップ主体)
- `sp/report3/draft` — ローカル下書き継続
- `sp/home` 内のミニカレンダー(直近7日)
- `sp/leader/approve` — 現場リーダー一括承認画面
- `pc/back-office/report3-history` — 事務ロール用の閲覧・編集画面(過去日入力可)

UI Specs to author:

1. `design/ux/sp-report3-new.md`
2. `design/ux/sp-report3-leader-approve.md`
3. `design/ux/pc-report3-back-office.md`

すべて `design/prd/design-system-bible.md` の token + コンポーネント
カタログ準拠で実装。アクセシビリティ tier: **Standard**(WCAG 2.1 AA)。

---

## 10. Visual / Audio Requirements

> 詳細は design-director に Task 委譲(本セッションは PRD のみ)

主要なフィードバック演出:

- 保存成功時のししまるトースト: 240ms ease-in-out + うっすらピンクのフラッシュ
- ランクアップ時: 全画面オーバーレイで2秒(skip 可、`prefers-reduced-motion`
  尊重)
- エラー時: トーストではなく inline error(画面遷移しない)

写真添付の UI: モバイル iOS / Android のネイティブカメラを呼び出す
(`<input type="file" accept="image/*" capture="environment" />`)

---

## 11. Open Questions

| Question | Owner | Resolution Deadline |
|----------|-------|---------------------|
| 8時間超過警告は何時間刻みで再警告すべきか?(9h, 10h, ...) | product-manager | Pre-Production gate 前 |
| 写真添付の最大枚数 / 1行 / 1日 | product-manager + business-analyst (storage cost) | Pre-Production gate 前 |
| 音声入力対応の優先度(Future の中での順位) | product-director | Phase 6 完了後 |
| ローカル下書きの保持期間(7日 / 30日?) | product-manager | Pre-Production gate 前 |
| `requires_leader_approval` が立った日報の処理フロー | product-manager + qa-lead | Pre-Production gate 前 |

---

## Cross-System Dependencies

| Depends On | Why |
|------------|-----|
| Auth + Multi-tenancy | ログイン・ロール判定・テナントスコープ |
| User & Org | 作業員のユーザー情報、所属チーム |
| Project | 現場名・現場ID(`project_id`) |
| Schedule | 当日の現場割当(自動セット用) |
| Work Classification Master | 大/中/小分類の階層マスタ |
| Notification Dispatcher | LINE WORKS 通知 |

| Depended On By | Why |
|-----------------|-----|
| Gamification | XP/SC/ランクの源泉データ |
| Per-site Cost Management | 工数(時間×単価)の源泉データ |
| Construction Overview | 原価累計の源泉データ |
| Career Sheet (個人キャリア) | 工種別累計時間の源泉データ |
| Notification Dispatcher | 入力漏れ検知 |

---

## Validation Plan

- [ ] `/design-review design/prd/REPORT3.md` で別セッション検証
- [ ] `/consistency-check` で他 PRD(systems-index 経由で参照される側)と矛盾がないか確認
- [ ] 第1段階完了時に社長 + 秋元様 + 現場リーダー 1名で UAT
- [ ] PoC: ADR-0001 の atomic fanout を 5系統 mock で end-to-end テスト

---

## Next Steps

- [x] 本 PRD を執筆
- [ ] `/design-review` で別セッション検証
- [ ] `/architecture-decision` で ADR-0001 (atomic fanout) を起票 — **本セッションで実施**
- [ ] `/ux-design report3-input` でスマホ入力フォームの UX 仕様
- [ ] `/create-epics` で MVP エピック分解 → REPORT3 関連エピックを生成
- [ ] `/create-stories billing` で(MVP に Billing は無いので)REPORT3 のストーリー分解
