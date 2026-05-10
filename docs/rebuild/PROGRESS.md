# SAKURA OS リビルド 進捗トラッカー

> **更新ルール**: 毎セッション開始時にこのファイルを読む → 作業 → このファイルを更新 → コミット
>
> **必読セット**: `MASTER-PLAN.md`(全体像)+ このファイル(進捗)+ `SESSION-LOG.md`(履歴)

---

## 🎯 現在のステータス

- **進行中フェーズ**: Phase 1 → Phase 2(移行中)
- **次に着手するタスク**: **P1-08 + P2-01** ダッシュボード(`/pc/home`)を新コンポーネントで再構成
- **完了タスク**: 7 / 43
- **最終更新**: 2026-05-10
- **最終セッション ID**: S1

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

### Phase 2: ダッシュボード再構成 + 獅子丸

- ⬜ **P2-01** ダッシュボードレイアウト刷新
- ⬜ **P2-02** KPI クエリ実装
- ⬜ **P2-03** アラート集約クエリ
- ⬜ **P2-04** 本日の稼働現場テーブル
- ⬜ **P2-05** タイムライン
- ⬜ **P2-06** 🦁 獅子丸サジェスト(ルールベース)
- ⬜ **P2-07** 🦁 獅子丸の表情ロジック
- ⬜ **P2-08** 通知ドロップダウン
- ⬜ **P2-09** 既存ランキングページ位置づけ整理

### Phase 3-A: ポイント管理

- ⬜ **P3-A-01** マイグレーション 0012
- ⬜ **P3-A-02** シード投入
- ⬜ **P3-A-03** Server Actions
- ⬜ **P3-A-04** 自動付与バッチ(pg_cron)
- ⬜ **P3-A-05** `/pc/points` ページ
- ⬜ **P3-A-06** `/pc/points/rules` ページ
- ⬜ **P3-A-07** `/pc/points/exchange-requests` ページ

### Phase 3-B: パワプロ風ステータス

- ⬜ **P3-B-01** マイグレーション 0013
- ⬜ **P3-B-02** シード(称号 + 特殊能力)
- ⬜ **P3-B-03** スキルパラメータ算出ロジック
- ⬜ **P3-B-04** `/pc/profile/status` ページ
- ⬜ **P3-B-05** SVG レーダーチャート
- ⬜ **P3-B-06** 称号付与モーダル
- ⬜ **P3-B-07** 称号獲得演出オーバーレイ
- ⬜ **P3-B-08** 全社員一覧ページ強化

### Phase 3-C: 現場マップ

- ⬜ **P3-C-01** マイグレーション 0014
- ⬜ **P3-C-02** `/pc/projects/map` ページ
- ⬜ **P3-C-03** 獅子丸キャラマーカー
- ⬜ **P3-C-04** 現場詳細ポップアップ
- ⬜ **P3-C-05** マップエディタ

### Phase 3-D: ボスHPモニター

- ⬜ **P3-D-01** `/display/site/[id]` ルート
- ⬜ **P3-D-02** BOSS HP メガゲージ
- ⬜ **P3-D-03** TOP3 + 安全コンボ + 獅子丸
- ⬜ **P3-D-04** ティッカー

### Phase 3-E: 幹部育成

- ⬜ **P3-E-01** マイグレーション 0015
- ⬜ **P3-E-02** `/pc/training` 一覧
- ⬜ **P3-E-03** スキルツリー画面

### Phase 4: 演出仕上げ

- ⬜ **P4-01** 数値カウントアップアニメ
- ⬜ **P4-02** entry アニメ
- ⬜ **P4-03** 獅子丸 float アニメ
- ⬜ **P4-04** モバイル版主要画面

---

## 🚀 次セッション(S2)でやること

### 開始前チェック
1. このファイル(`PROGRESS.md`)を最初に読む
2. `MASTER-PLAN.md` で次タスクの詳細(P2-01〜P2-07 周辺)を確認
3. `SESSION-LOG.md` の S1 を確認
4. `git status` で前回未コミットがないか確認

### S2 でやること(優先順)

**メイン: ダッシュボード(`/pc/home`)を完全再構成**

1. **P2-01**: 新レイアウト適用
   - 既存の `/pc/home/page.tsx` を新コンポーネント(`KpiCard` / `AlertCard` / `HpBar` / `Tag` / `DataTable`)で置き換え
   - 構成: KPI 4枚 → 獅子丸サジェスト → 要対応アラート → 本日の稼働現場 → グリッド2列(進行中現場 / 今日の活動)

2. **P2-02**: KPI クエリ実装
   - 「本日の出来高達成率」: `report3_entries` の hours 集計 ÷ projects.daily_target(daily_target 列が無ければ追加 or 暫定で出勤者数×8h で代用)
   - 「出勤中」: `report3_entries.work_date = today` の `count(distinct user_id)` / `profiles where is_active`
   - 「安全コンボ」: 連続無事故日数(`incidents` テーブル無発生連続)
   - 「今月の称号付与数」: 暫定 0(P3-B-01 で `titles_granted` テーブル追加後に対応)

3. **P2-03**: アラート集約
   - 期限切れ資格: `user_qualifications.expiry_date <= now() + interval '14 days'`
   - 承認待ち: `report3_entries.requires_leader_approval = true and approved_at is null`
   - 日報未提出: 出勤予定だが今日の `report3_entries` 無し
   - サーバー関数 `getDashboardAlerts(tenantId)` で集約

4. **P2-04**: 本日の稼働現場テーブル
   - `projects` × `report3_entries` (today)
   - 列: 現場名 / 担当 / 出勤 / 進捗 / 状態 / KY実施(safety_checks があれば、無ければ仮置き)

5. **P2-06 + P2-07**: 獅子丸 サジェスト + 表情
   - `<Shishimaru>` コンポーネント作成: `mood: "happy" | "warning" | "great" | "celebrate"`
   - ルールベース `generateShishimaruAdvice(tenantId)`:
     - 承認待ち > 5件 → "決裁が滞っておるじゃろ。早く片付けるとよいぞ" (warning)
     - 期限切れ資格 > 0 → "資格更新の期限が迫っておる" (warning)
     - 達成率 ≥ 100% → "本日も完璧じゃ!" (celebrate)
     - 達成率 ≥ 80% → "順調じゃな" (great)
     - その他 → "今日も頑張ろう" (happy)

6. **P1-08 並行**: ダッシュボード以外で目立つページ(`/pc/reports`、`/pc/projects`)も新カードに差し替え

### S2 完了の目安
- `/pc/home` がデモ v4.0 に近い見た目になる
- ビルド通過 + 既存テスト破壊なし
- PROGRESS.md / SESSION-LOG.md 更新 + コミット

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
| 2026-05-10 | 獅子丸 AI はルールベース → 必要に応じて Claude API 連携(P2-06) | P2-06 |
| 2026-05-10 | ゲーミフィケーションは現時点でのベストプラクティスで実装。クライアント確認後に大幅修正可能性あり。**設計指針**: ①実業務KPIと連動(架空ポイントではなく安全・出来高・期限遵守等の実数値)②個人ランキングだけでなくチーム達成を強調③表彰・承認による Recognition を中心(金銭報酬は補助的)④進捗(自分比較)を主、順位を従⑤opt-out 機能を全ユーザーに付与⑥失敗を罰しない設計(コンボ途切れの「赦し」期間 etc) | P3-A 全般 / P3-B 全般 |
| 2026-05-10 | P1-08(既存ページ差し替え)は P2 と並行で実施。ダッシュボードを新コンポーネントで作ることが他ページのリファレンスになる。 | P1-08 |

---

## 🚨 ブロッカー / 未解決事項

- [ ] **フォルダリネーム未実施** — 現在のローカルフォルダ名は `Claude-Code-Game-Studios`
  (テンプレート由来の汎用名)のまま。`sakura-os` にリネームすべき。手順は
  `docs/rebuild/FOLDER-RENAME.md`。Claude セッションをいったん終了する必要があるため、
  ユーザー側で実施してもらう。次セッション開始時に完了を確認。
- [ ] **GitHub PAT のローテーション** — `git remote -v` で確認した remote URL に
  Personal Access Token が埋め込まれていた。漏洩リスクがあるため、GitHub > Settings >
  Developer settings から該当 PAT を revoke + 再生成 + remote 更新を推奨。

---

## 🔗 参考デモ

クライアント評価済みデモのソース:
- HTML: `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\index.html`
- CSS: `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\css\base.css`(他 pawapro.css / screens.css)

各タスク着手時に該当部分のコードを参考にしつつ、本番アーキテクチャ(Server Components + Server Actions + RLS)に合わせて移植する。
