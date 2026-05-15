# 2026-05-14 S24 デザイン総点検 監査レポート

> **トリガー**: Phase 12 完了後の畠中様確定「デザイン総点検と統一化」
> **目的**: 11 画面で実装したパターンを共通化し、視覚的・コード的に統一する

---

## 🔍 検出された差異

### 1. KpiCard の 2 系統重複(8 ファイルで重複定義)

#### 系統 A(5 画面、後発、洗練)
- **画面**: cost / estimates / fleet / gamification / invoices
- **signature**: `{ label, value: string, subText, icon, accent, iconColor }`
- **構造**: 高さ 88px、`border-l-4` アクセント、icon 右上
- **柔軟性**: accent / iconColor は Tailwind クラス文字列で自由

#### 系統 B(2 画面、初期実装、シンプル)
- **画面**: notifications / projects
- **signature**: `{ accent: 'blue'|'red'|'amber'|'emerald', label, value: number|string, unit?, sub? }`
- **構造**: lookup テーブルで色変換
- **制約**: 4 色固定 enum

**→ 統一方針**: 系統 A に統一(柔軟性高、Lucide icon component 直渡しが便利)

---

### 2. CardSection の重複(4 ファイル)

- **画面**: cost / estimates / gamification / invoices
- **signature**: `{ title, icon, children, headerRight?, visible?, sticky? }`
- 構造はほぼ同一(border-b 区切り + h2 + 右側スロット)
- 他画面でも `<section>` 直書きで同等パターンを使用

**→ 統一方針**: `src/components/ui/CardSection.tsx` に集約

---

### 3. PageHeader パターン(5+ 画面で重複)

```tsx
<header className="flex items-center justify-between">
  <div>
    <nav className="text-[11px] text-slate-500" aria-label="パンくず">
      <span>SAKURA OS</span>
      <span className="mx-1">/</span>
      <span className="font-medium text-slate-700">画面名</span>
    </nav>
    <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
      <Icon className="h-4 w-4 text-blue-600" />
      画面名
      <span className="text-xs font-normal text-slate-500">サブテキスト</span>
    </h1>
  </div>
  <div>{/* 右側アクション */}</div>
</header>
```

- **画面**: cost / dispatch-map / fleet / gamification / schedules、+ notifications / projects / estimates / invoices に類似形
- 微妙に異なる:notifications はパンくずなし、projects はサブテキストなし 等

**→ 統一方針**: `src/components/ui/PageHeader.tsx` で props 化

---

### 4. アイコン色アクセントの不揃い

- 主アイコン色:`text-blue-600`(8 画面)/ `text-amber-500`(gamification の Trophy)/ `text-rose-500`(notifications の Megaphone)
- 一貫性あるが、ページの主題色で変えている

**→ 統一方針**: 維持(意図あり)、ただし `PageHeader` props の `iconColor` で明示

---

### 5. CSS クラスの細かなブレ

| パターン | 出現箇所 |
|---------|---------|
| `text-[11px] text-slate-500` パンくず | 5 画面 |
| `text-base font-semibold text-slate-900` h1 | 5 画面 |
| `text-xs font-normal text-slate-500` サブ | 5 画面 |
| `border-l-4 ${accent}` KPI 縦バー | 5 画面 |
| `h-[88px]` KPI 高さ | 5 画面 |

すべて統一されているが、共通化されていない(コピペで広がった)。

---

## 📐 統一化計画

### Step 1: 共通プリミティブ作成(新規 3 ファイル)
1. **`src/components/ui/PageHeader.tsx`**
   - props: `breadcrumbs` / `icon` / `iconColor` / `title` / `subtitle` / `actions` (slot)
2. **`src/components/ui/KpiCard.tsx`**(系統 A 互換)
   - props: `label` / `value` (string|number) / `subText?` / `icon` / `accent` / `iconColor`
3. **`src/components/ui/CardSection.tsx`**
   - props: `title` / `icon` / `headerRight?` / `sticky?` / `children`

### Step 2: 既存重複削除 + import 置換(11 画面)
- 系統 A の 5 画面:local KpiCard / CardSection を削除 → `@/components/ui/*` から import
- 系統 B の 2 画面(notifications / projects):呼び出し側を系統 A 形式に書換
- PageHeader パターン使用 5+ 画面:`<PageHeader>` に置換

### Step 3: デザイントークン整理(globals.css)
- 既存トークン確認のみ(色 / 余白 / radius)、不足あれば追記

### Step 4: ナビゲーション + 文言整合確認
- サイドバー nav リンク先と各画面パスの整合
- 表記揺れチェック:「案件」 vs 「現場」 vs 「プロジェクト」

### Step 5: ビルド + デプロイ + Chrome 検証
- 11 画面すべて表示崩れがないことを確認

---

## 📊 影響範囲試算

| 変更内容 | ファイル数 | 削減行数(目安)|
|---------|-----------|---------------|
| 共通 KpiCard 化 | +1 / -8 重複 | -200 行(8 画面 × 25 行)|
| 共通 CardSection 化 | +1 / -4 重複 | -80 行(4 画面 × 20 行)|
| 共通 PageHeader 化 | +1 / -9 重複 | -180 行(9 画面 × 20 行)|
| 系統 B → A 書換 | 2 画面 | +/-0(同等機能、引数変更のみ)|
| **合計** | +3 新規 / 11 編集 | **約 -460 行削減** |

---

## ✅ 完了基準

- [ ] 3 共通プリミティブが `src/components/ui/` に配置
- [ ] 11 画面すべてが共通プリミティブを import 使用
- [ ] `npm run build` 成功 / TypeScript エラーなし
- [ ] 全画面の見た目に変化なし(視覚的回帰なし)
- [ ] Chrome で 11 画面アクセス確認

---

## 🎯 想定セッション分割

- **S24-a**: 共通プリミティブ 3 ファイル作成 + 系統 A 5 画面置換
- **S24-b**: 系統 B 2 画面の書換 + PageHeader 全画面適用
- **S24-c**: 検証 + docs 更新 + Vercel 公開

(1 セッションで完結を目指す)
