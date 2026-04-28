# Design System Tokens — SAKURA OS

> **Source of truth**: ワイヤーフレーム mockup
> `C:/Users/liim1/Desktop/ワイヤフレーム確認用/SAKURAOS/ワイヤーフレーム/sakura_mockup_シンプルデザイン.html`
>
> **Code mapping**: `tailwind.config.ts` および `src/app/globals.css`

---

## 適用範囲

### Phase B 以降で使う「基本デザイン言語」(シンプルデザイン)

すべての**業務系画面**(ホーム / REPORT3 / 工事概況表 / 原価管理 / 工具管理 / etc.)で使用。

- **フォント**: `M PLUS Rounded 1c` (Google Fonts、丸ゴシック)
- **背景**: `#e8f0f8`
- **パネル/カード**: `#fff` / 10px radius / `#c8d8e8` border
- **ヘッダー**: navy グラデーション `#1a3a6a → #2a5a9a` + 黄色ダイヤロゴ `#f5d800`
- **アクション色**:
  - blue (`#2568c8`) — primary
  - teal (`#0da870`) — 成功 / 完了 / 提出済
  - amber (`#d88000`) — 警告 / 要承認 / 進行中
  - red (`#e03030`) — エラー / 異常
  - pink (`#d46a88`) — 主要 CTA(モバイル「日報を書く」など)
  - purple (`#7040c8`) — 副次 / KPI 強調

### Phase 4(ゲーム拡張)で使う「ゲーミフィ デザイン言語」(パワプロ風)

ランキング・バッジ・職員能力査定カード画面で使用。

> **Source**: `C:/Users/liim1/Desktop/ワイヤフレーム確認用/SAKURAOS/sakura_wireframe_v9_パワプロ風.html`

- 紙風の背景(`#fffbed` ベース、対角ストライプ)
- 赤縁(`#d93642`)+ 内側白縁の選手カード型
- ランクカラー: S 赤 / A オレンジ / B 緑 / C 青 / D-G ダーク階調
- レーダーチャート、ステータスバー、ポジションバッジ(円形)
- 太字(font-weight: 700-900)、letter-spacing 広め

**Phase 4 着手時に再度確認** — 第1〜3段階(Phase B/Beta)では使わない。

### Phase 4以降「工具管理画面」のデザイン参考

> **Source**: `C:/Users/liim1/Desktop/ワイヤフレーム確認用/SAKURAOS/ワイヤーフレーム/sakura_wireframe_工具管理.html`

シンプルデザインと同じトークンを継承しつつ、地図表示(Google Maps 連携)・QR スキャン UI・操作履歴タイムラインの追加要素あり。Beta(第3段階)で実装。

---

## モバイル用パターン

> **Source**: `C:/Users/liim1/Desktop/ワイヤフレーム確認用/SAKURAOS/ワイヤーフレーム/sakura_mobile_スマホ画面.html`

- ボトムナビ 4 項目(ホーム / 日報 / 書類 / ランク)— Phase B 後半で追加予定
- カード 10px radius、`#fff` 背景、薄いボーダー
- 大ボタン: 14px padding, 15px font, 単色ベタ
- ピルバッジ: pill-green / amber / red / blue
- ステータスバー風(時刻 / 現場名 / シグナル)— ネイティブアプリ感
- アバターは円形、頭文字 1 文字

---

## トークン → コード対応

`tailwind.config.ts` の `theme.extend.colors`:

| トークン | コード上のクラス例 |
|---------|------|
| `#1a3a6a` (navy) | `bg-navy` `text-navy` |
| `#2568c8` (blue) | `bg-blue` `text-blue` `bg-blue-bg` |
| `#0da870` (teal) | `bg-teal` `text-teal` `bg-teal-bg` |
| `#d88000` (amber) | `bg-amber` `text-amber` `bg-amber-bg` |
| `#e03030` (red) | `bg-red` `text-red` `bg-red-bg` |
| `#d46a88` (pink) | `bg-pink` `text-pink` `bg-pink-bg` |
| `#1a2a3a` (text) | `text-ink` `text-ink-2` `text-ink-3` |
| `#c8d8e8` (border) | `border-line` |
| `#f5d800` (logo yellow) | `bg-brand-yellow` |

`globals.css` の `@layer components`:

| クラス | 用途 |
|--------|------|
| `.panel` / `.panel-pad` | 標準カード/パネル(10px radius、薄いボーダー) |
| `.panel-title` | パネルタイトル(navy、bold) |
| `.pill-teal` `.pill-amber` `.pill-red` `.pill-blue` `.pill-purple` | ステータスバッジ |
| `.btn-primary` `.btn-pink` `.btn-teal` `.btn-ghost` | ボタンバリアント |
| `.input` | フォーム入力共通 |
| `.kpi-card` `.kpi-blue` `.kpi-teal` ... | PC ダッシュボードの KPI カード(色付き上部 3px ストライプ) |

---

## 命名規約と禁止事項

- **生の hex は components 内で使わない** — トークン経由でのみ色を参照
- **ゲーミフィの「パワプロ風」要素を業務画面に混ぜない** — 用途を画面ごとに固定
- **font-weight は 400 / 500 / 700 / 800 / 900 のいずれか** — 中間値を使わない
- **モバイルとデスクトップで異なる UI** を許容する(ロール別のホームを `/sp/*` と `/pc/*` で分けているのと同じ思想)
