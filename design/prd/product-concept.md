# Product Concept: SAKURA OS — さくら株式会社業務管理システム

*Created: 2026-04-28*
*Status: Approved (based on architecture diagram v7 + design v2.1, 2026-04-22)*

---

## Elevator Pitch

> 配管工事業の現場で「同じデータを2回入力させない」業務管理 SaaS。作業員が
> 毎日入力する **3階層作業日報(REPORT3)** を唯一の入力点として、原価・概況・
> 顧客別売上・ゲーミフィ・通知へ自動分岐する。会計・請求・給与は
> マネーフォワードに委ねる(変更しない)。

**テスト**: 「現場の作業員がスマホで日報を入れたら、社長のダッシュボードで
原価が動く」 — これが10秒で伝われば成功。

---

## Core Identity

| Aspect | Detail |
|--------|--------|
| **Category** | B2B Vertical SaaS — 建設業(配管工事)業務管理 |
| **Sub-category** | 現場管理 + 経営可視化 + ゲーミフィケーション |
| **Target Customer** | さくら株式会社(まずは自社運用 → 将来的に同業他社へ展開可能性) |
| **Deployment Model** | Multi-tenant SaaS パターン(MVP は自社単一テナント運用、コードは tenant_id スコープ前提で書く) |
| **Buyer Surface Area** | 全社(社長 / 事務 / 現場リーダー / 作業員 すべてが日次利用) |
| **Engagement Cadence** | Daily(打刻 / 日報 / タスク確認は毎日)+ Monthly(締め / 請求 / KPI レビュー) |
| **Revenue Model** | 自社利用が前提。SaaS 化する場合は B2B 月次契約(Stripe 等は導入しない方針) |
| **Estimated Build Scope** | 約 12 ヶ月 / 6 段階(設計 v2 §13) |
| **Comparable Products** | アンドパッド / ダンドリワーク / 現場 Plus(競合) — 既存 SaaS は「ゲーミフィ」「3階層工種マスタ」「マネフォ前提の薄い設計」が無い |

---

## The Hook

> **「入力1回、自動分岐5系統」アーキテクチャ**: 作業員が毎日入れる REPORT3 を
> 単一トランザクションで保存すると、同時に (1) 出来高ゲージ (2) 個人キャリア
> 累計 (3) 現場原価 (4) ランク/XP/SC 付与 (5) 入力漏れ検知 のすべてが自動更新
> される。**同じ情報を二度入力する業務は1つもない**。

The hook の特徴:

- ✅ 一文で説明可能 — "REPORT3 を入れたら全部繋がる"
- ✅ 構造的に新規 — 既存 SaaS は "原価表" "勤怠" "ゲーミフィ" を別々に持つ
- ✅ Core promise との整合 — "入力負担を増やさず可視化する" 約束を守る
- ✅ コピー困難 — 既存ベンダーは現行入力フローを壊さないと真似できない

---

## Job-to-be-Done (JTBD)

### Primary Job Statement

社長の場合:

> **当社の利益が出ているのか / 誰が稼いでいるのかを毎日確認したいときに、**
> **作業員に追加負担をかけずに現場ごとの原価・粗利・職人別の稼働を可視化したい。**
> **そうすれば「勘」ではなく「数字」で現場と人を評価できる。**

作業員の場合:

> **今日やった作業を記録するときに、**
> **タップだけで6工種×中分類×小分類×時間を入れて、**
> **ゲームのように XP/SC が貯まる楽しさで習慣化したい。**
> **そうすれば日報入力が苦痛でなくなり、自分の累計実績(キャリア)も見える。**

事務(秋元様)の場合:

> **月次締め・請求発行・給与連動を行うときに、**
> **同じ数字を Excel に転記し直したくない。**
> **マネーフォワードと連携した状態で、SAKURA OS は「請求発行→工事概況表自動更新」**
> **を担ってほしい。** そうすれば月末の作業時間が半減する。

### Forces of Progress

| Force | What's pulling the customer? |
|-------|------------------------------|
| **Push of the situation** | 現状: 紙の日報・Excel・口頭報告で現場原価がリアルタイムに見えない。社長は「勘」で経営判断するしかない。 |
| **Pull of the new solution** | 入力1回で全自動。社長は毎朝ダッシュボードで前日の進捗・原価・粗利を確認できる。 |
| **Anxiety of the new solution** | 作業員(特にベテラン): スマホ入力に抵抗。"覚える操作" が増えると反発。 → ゲーミフィ + ししまるナビでオンボーディング負担を最小化。 |
| **Inertia of the existing habit** | Excel の月次集計に20年慣れた事務。 → マネフォは継続(変更しない)で安心感を担保。SAKURA OS は "入力を1ヶ所に集める" 役割に徹する。 |

---

## Target Users & Buyers

### Daily User: 職人・見習い

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | 配管工(職人 / 見習い) |
| **Seniority** | 18歳〜60代まで広く |
| **Spent in product** | スマホで朝の打刻 1分 / 昼休み・夕方に日報 3分 / 工具スキャン都度 5秒 |
| **Tools they use today** | LINE / 紙の日報 / 一部 Excel |
| **Unmet need** | 自分の実績(累計工種別時間)が一切見えない。評価軸が不透明 |
| **Dealbreakers** | 入力が3分超かかる / 操作を毎回考えないといけない UI |

### Daily User: 現場リーダー・職長

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | 現場リーダー / 職長 |
| **Spent in product** | 朝のチーム配置確認 5分 / 日報承認 10分 / 原価確認 5分 |
| **Unmet need** | 現場の原価がリアルタイムで分からない / 工具の所在不明 |
| **Dealbreakers** | 日報承認に1人あたり1分以上かかる UI |

### Economic Buyer: 社長

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | 代表取締役 |
| **What they care about** | 利益が出ているか / 誰が稼いでいるか / 異常があるか(無申請欠勤・原価超過・アルコール検査異常など) |
| **Approval threshold** | 自社内開発のため意思決定は即決可 |
| **Procurement requirements** | マネーフォワードを変更しない・既存業務を壊さない |
| **Reference customers** | (将来 SaaS 化時) 同業の知り合い経営者 |

### Champion: 事務(秋元様)

| Attribute | Detail |
|-----------|--------|
| **Role / Title** | 総務・経理 |
| **What's in it for them** | 月末作業の半減 / マネーフォワードへの連携が自動化 |
| **What they need from us** | 操作マニュアル / 月次締めフローの再設計 |

### IT / Security Reviewer

| Attribute | Detail |
|-----------|--------|
| **What they need** | 2段階認証 / 操作ログ / アルコール検査記録の1年保管(法令対応) |
| **Likely objections** | スマホ GPS の常時送信に対する作業員のプライバシー懸念 → 業務時間内のみ取得・取得目的の明示で対応 |

---

## Core Workflow

### The Daily Loop (作業員 / 5–10 minutes)

1. 朝、現場到着 → スマホで GPS 打刻(2タップ)
2. 業務開始前 → アルコール検査 → スマホで結果入力(該当者のみ)
3. 工具を取りに行く → QR スキャン → 持出登録(1タップ + 自動 GPS)
4. 業務終了 → REPORT3 入力(3 タップ + スライダー数本)
   - 大分類 → 中分類 → 小分類 → 時間
   - 写真添付(任意 / 自動 GPS スタンプ)
5. 工具返却 → QR スキャン → 返却登録
6. ししまるナビが「+10XP / +5SC」を表示 → ランク確認

### The Daily Loop (現場リーダー / 15 minutes)

1. 朝、チーム配置を確認 → スケジュール画面
2. 終業後、チームの日報を承認 → 一括承認 + コメント
3. 現場原価を確認 → ゲージで進捗確認 / ししまるが警告

### The Daily Loop (社長 / 5 minutes)

1. 朝、ダッシュボードを開く
2. 前日の進捗・原価・粗利・異常(LINE WORKS で push)を確認
3. 必要に応じて現場リーダーへ LINE WORKS で連絡

### The Monthly Loop (事務 / 数時間 → 1時間)

1. 月初に前月分の日報承認状況を確認(99%以上承認済みが理想)
2. 工事概況表 → 請求書発行 → クラウドサインで送付
3. 入金確認 → 工事概況表に反映
4. マネーフォワードへ仕訳・請求書・給与データを連携

### The Outcome (what changes for the customer)

- **社長**: 原価可視化(リアルタイム) — "勘" → "数字"
- **作業員**: 自分のキャリア累計が見える → 評価が透明化 + ゲームの楽しさ
- **事務**: 月末作業時間が半減 — 紙→Excel→マネフォの転記が消える
- **現場リーダー**: 工具の所在 / チームの稼働 / 現場原価がスマホで見える

---

## Product Pillars (preview)

詳細は `design/prd/product-pillars.md` で確定。

### Pillar 1: 入力1回主義

REPORT3・マスタ更新画面・見積/請求画面の3つを除いて、**人間が入力する画面は
作らない**。すべての他のデータは自動派生。

*Decision test*: 「この機能、新しい入力画面が必要?」 → Yes なら設計を疑う。

### Pillar 2: マネフォを変えない

会計・請求・給与は **マネーフォワードに任せる**。SAKURA OS はマネフォへ
データを送る側であり、マネフォ機能を再実装しない。

*Decision test*: 「この機能、マネフォと重複してない?」 → 重複なら作らない。

### Pillar 3: ゲーミフィは習慣化のため、評価のためではない

XP / SC / バッジは **入力習慣を作るため**。**人事評価には累計実績データを
使う**(XP/ランクは使わない)。

*Decision test*: 「この機能、ゲーム要素が業務評価に直結してない?」 → 評価に
混ぜたら設計から外す。

### Pillar 4: 法令対応は構造で守る

アルコール検査1年保管・2段階認証・操作ログは **OFF 不可** で実装。

*Decision test*: 「この機能、法令で必須の項目を任意設定にしてない?」 → 任意
設定不可。

### Anti-Pillars (What This Product Is NOT)

- **NOT 会計ソフト**: マネーフォワードを置き換えない
- **NOT 工程管理ツール単体**: 工程はあくまで原価/概況の集計軸として存在
- **NOT 一般 SaaS**: 配管工事業に最適化した3階層工種マスタが核(汎用ガントは作らない)
- **NOT リアルタイムチャットツール**: LINE WORKS を置き換えない

---

## Competitive Landscape

| Competitor | What They Do Well | Where They Fall Short | How We Win |
|------------|-------------------|------------------------|------------|
| アンドパッド | 業界シェア1位、機能網羅 | 入力箇所が分散(写真・日報・工程それぞれ別画面)。マネフォ連携が弱い | REPORT3 一点入力 + マネフォ前提設計 |
| ダンドリワーク | 安価、施工管理に特化 | ゲーミフィ・キャリア可視化なし。3階層工種無し | 累計可視化 + ししまるで習慣化 |
| 紙 + Excel(現状) | 慣れている / コストゼロ | リアルタイム性ゼロ / 集計に膨大な人手 | 入力負担を増やさず原価をリアルタイム化 |

---

## Technical Considerations

| Consideration | Assessment |
|---------------|------------|
| **Recommended Framework Family** | Next.js 15 (App Router) + Supabase (Postgres + Auth + Storage + Realtime) |
| **Key Technical Challenges** | (1) REPORT3 atomicity — 5系統 fanout を確実にコミットする / (2) GPS バックグラウンド送信の電池消費最適化 / (3) ロール別ホーム同URL + RBAC |
| **Data Model Complexity** | 中〜高(3階層工種マスタ + 工事概況の派生計算 + ゲーミフィ集計) |
| **Integration Surface** | Money Forward(会計/請求/給与)、Google Maps、LINE WORKS、クラウドサイン |
| **Compliance Requirements** | アルコール検査1年保管(改正道路交通法)、2段階認証、操作ログ |
| **Realtime Needs** | ソフトリアルタイム — ダッシュボードは 30秒〜5分の auto-refresh で十分。push が必要なのは LINE WORKS 側 |
| **Estimated Data Volume** | 作業員 約30人 × 日報 1件/日 × 12ヶ月 ≈ 11,000 件/年。中規模 |
| **Search / Reporting** | 工事概況表・客先別売上・原価サマリ — 集計頻度は日次で十分(リアルタイム集計は不要) |

---

## Commercial Hypothesis

| Aspect | Detail |
|--------|--------|
| **Pricing model** | 自社利用 — 社内開発として位置付け |
| **(将来 SaaS 化時)** | 月額固定 — 1テナント月額 ¥X (要決定) |
| **Time to first value** | 第2段階完了時(約2.5ヶ月後) — REPORT3 と GPS 打刻が動けば日次の価値が出る |

> **注**: この製品は基本的に自社業務改善ツール。SaaS 化は将来的選択肢として
> アーキテクチャに含めるが、MVP では商用化しない。

---

## Risks & Open Questions

### Product Risks

- 作業員(特に高齢層)が REPORT3 のスマホ入力を嫌がるリスク → ししまるナビ + ゲーミフィ + 入力時間 3分以内に収める設計で対応
- 3階層工種マスタの粒度が現場感覚と合わないリスク → 第1段階で社長と検証、マスタは事務ロールで随時編集可能

### Technical Risks

- **Supabase Realtime のスケール**: 30人規模なら問題なし。SaaS 化時は再評価
- **GPS 常時取得の電池**: バックグラウンド送信を業務時間内に限定 + ユーザー設定で調整可能に
- **マネフォ連携の仕様変更**: API バージョンを技術スタックに pin、`docs/framework-reference/` 相当の参照ドキュメントを別途整備

### Compliance / Legal Risks

- アルコール検査記録の1年保管は **構造で必須化**(削除不可、エクスポート可能)
- GPS 位置情報は労務管理法令の範囲内で運用 — 業務時間外は取得しない
- 給与に関わるデータ(SC のギフト券交換など)は税務上3パターンの運用方針を要決定 → 事務(秋元様)と税理士の確認が前提

### Open Questions

- SC ギフト券交換の税務処理(福利厚生 / 現物給与 / 経費) → 税理士確認後決定
- ししまる AI 化(Claude API 連携)の優先度 → 第1〜6段階完了後に再評価

---

## MVP Definition

**Core hypothesis**: 「作業員が毎日 REPORT3 をスマホで入力し、社長がダッシュ
ボードで原価をリアルタイムで確認できる」 — これが回るなら、残りは段階的に
追加可能。

**Required for MVP** (第1段階 + 第2段階 = 約2.5ヶ月):

1. ログイン + 2段階認証 + ロール別ホーム
2. GPS 打刻
3. **REPORT3 (3階層日報)** — 入力 + atomicity 保証 + 出来高ゲージ自動反映
4. 入力漏れ検知 + LINE WORKS 通知
5. ししまるナビ(基本案内のみ)

**Explicitly NOT in MVP**:

- 工事概況表(第3段階)
- 現場原価管理表(第3段階)
- 車両運行管理 + アルコール検査(第3段階)
- 工具 QR 管理(第3段階)
- マネーフォワード連携(第5段階)
- ゲーミフィの拡張(クエスト・師弟制度・MVP 表彰など — 第4段階)

### Scope Tiers

| Tier | Functional Coverage | Polish Level | Timeline |
|------|---------------------|--------------|----------|
| **MVP (第1〜2段階)** | ログイン / 打刻 / REPORT3 / 通知 | Functional, polished critical paths | 約2.5ヶ月 |
| **Beta (第3段階)** | + 工事概況 / 原価 / 車両 / 工具 | Polished + accessibility | 約3ヶ月追加 |
| **GA (第4〜6段階)** | + ゲーミフィ拡張 / マネフォ / レポート | Production polished | 約5.5ヶ月追加 |

---

## Next Steps

- [x] 製品コンセプト確定
- [ ] `/design-review design/prd/product-concept.md` で別セッション検証
- [ ] `/map-systems` でシステム分解 → `design/prd/systems-index.md` を生成
- [ ] `/design-system REPORT3` で中核 PRD を作成(本セッションで実施)
- [ ] `/architecture-decision` で ADR-0001(REPORT3 atomic fanout)を起票(本セッションで実施)
- [ ] `/sprint-plan new` で MVP 第1スプリントを計画
