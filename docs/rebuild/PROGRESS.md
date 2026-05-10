# SAKURA OS リビルド 進捗トラッカー

> **更新ルール**: 毎セッション開始時にこのファイルを読む → 作業 → このファイルを更新 → コミット
>
> **必読セット**: `MASTER-PLAN.md`(全体像)+ このファイル(進捗)+ `SESSION-LOG.md`(履歴)

---

## 🎯 現在のステータス

- **進行中フェーズ**: Phase 3-B(ほぼ完了) → Phase 3-C へ移行予定
- **次に着手するタスク**: **P3-C-01** マイグレーション 0014 (現場マップ用カラム追加) + **P3-B-08** users ページ強化(残作業)
- **完了タスク**: 26 / 43
- **最終更新**: 2026-05-10
- **最終セッション ID**: S4
- **🔥 specialist 起動成功: S4 で 3 つの specialist を並列起動 ✅**

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

### Phase 3-C: 現場マップ

- ⬜ **P3-C-01** マイグレーション 0014
- ⬜ **P3-C-02** `/pc/projects/map` ページ
- ⬜ **P3-C-03** ししまるキャラマーカー
- ⬜ **P3-C-04** 現場詳細ポップアップ
- ⬜ **P3-C-05** マップエディタ

### Phase 3-D: ボスHPモニター

- ⬜ **P3-D-01** `/display/site/[id]` ルート
- ⬜ **P3-D-02** BOSS HP メガゲージ
- ⬜ **P3-D-03** TOP3 + 安全コンボ + ししまる
- ⬜ **P3-D-04** ティッカー

### Phase 3-E: 幹部育成

- ⬜ **P3-E-01** マイグレーション 0015
- ⬜ **P3-E-02** `/pc/training` 一覧
- ⬜ **P3-E-03** スキルツリー画面

### Phase 4: 演出仕上げ

- ⬜ **P4-01** 数値カウントアップアニメ
- ⬜ **P4-02** entry アニメ
- ⬜ **P4-03** ししまる float アニメ
- ⬜ **P4-04** モバイル版主要画面

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
