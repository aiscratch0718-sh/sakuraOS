# 🌸 SAKURA OS

**さくら株式会社 専用 統合業務管理システム**

---

## このフォルダは何?

**SAKURA OS** = さくら株式会社(配管工事業)向けに開発中の B2B SaaS。

| 項目 | 内容 |
|---|---|
| **クライアント** | さくら株式会社(秋元様 / 板澤様 経由) |
| **開発元** | 株式会社 AIscratch |
| **GitHub** | `aiscratch0718-sh/sakuraOS` |
| **package.json name** | `sakura-os` |
| **本番ドメイン** | (Vercel / 設定後追記) |
| **想定フォルダ名** | `sakura-os` または `sakuraOS` |

---

## 重要: フォルダ名について

このフォルダの **本来の名前は `sakura-os`** ですが、過去の経緯で
`Claude-Code-Game-Studios` という汎用テンプレート名のまま運用されていた
時期があります。

**新規にローカル環境を構築する場合 / 別 PC でクローンする場合は、必ず
`sakura-os` で clone してください**:

```bash
git clone https://github.com/aiscratch0718-sh/sakuraOS.git sakura-os
cd sakura-os
```

既存環境を `Claude-Code-Game-Studios` から `sakura-os` にリネームする
手順は `docs/rebuild/FOLDER-RENAME.md` を参照。

---

## 主な機能ドメイン

- 認証 / RBAC(worker / leader / office / ceo / system)
- REPORT3(日報3系統一元入力 + 5系統 atomic fanout)
- 見積 / 請求 / 入金管理
- 領収書 / 仕入先請求書 / 経費管理
- 工具 / 車両管理 + GPS
- 安全書類 / 元請テンプレート保管
- 各種マスタ(現場 / 客先 / 単価 / 資格 / 工種 / 部署 / 役職)
- ゲーミフィケーション(リビルド進行中、`docs/rebuild/` 参照)

---

## ディレクトリの読み方

| パス | 役割 |
|---|---|
| `src/app/` | Next.js App Router(`(authenticated)/pc/*` `(authenticated)/sp/*`) |
| `src/features/` | 業務ドメインごとの Server Actions / クエリ |
| `src/components/ui/` | 共通 UI コンポーネント(KpiCard / AlertCard 等) |
| `src/server/` | 認証・DB クライアント・監査ログ |
| `supabase/migrations/` | DB スキーマ(0001 〜) |
| `design/prd/` | 仕様書 / ヒアリング記録 / 質問票 |
| `docs/rebuild/` | デモ v4.0 ベースの全面リビルド計画 + 進捗 |
| `docs/architecture/` | ADR(意思決定記録) |
| `production/` | スプリント / マイルストーン / リリース管理 |
| `.claude/` | Claude Code(SDK)テンプレート設定 |
| `tools/` | スクリプト(Excel 生成等) |

---

## 関連リソース

- クライアント評価済みデモ:
  `C:\Users\liim1\Desktop\システム開発関連\sakura_os_v4\sakura-os-vercel\public\index.html`
- ヒアリングログ Excel:
  `design/prd/feedback/2026-05-08_hearing-log.xlsx`
- リビルド計画一式:
  `docs/rebuild/MASTER-PLAN.md` + `docs/rebuild/PROGRESS.md`
