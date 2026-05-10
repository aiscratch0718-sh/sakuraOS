# テンプレート由来ファイル アーカイブ

このフォルダには **「Claude Code Web Studio テンプレート」由来で、SAKURA OS の本体実装には使わないが、参考のため保管しているファイル群** が入っています。

ルートディレクトリの混雑を解消するために、SAKURA OS と直接関係ない汎用文書を
ここへ集約しました。**消しても SAKURA OS 本体は動作します**。

## 中身

| ファイル | 元の場所 | 内容 |
|---|---|---|
| `README-template.md` | ルート | テンプレートの汎用 README(SAKURA OS の README は別途存在) |
| `REBRAND-SUMMARY.md` | ルート | ゲーム開発テンプレ → B2B Web 開発テンプレへのリブランド記録(2026-04 頃) |
| `UPGRADING.md` | ルート | テンプレートのアップグレード手順書(SAKURA OS には無関係) |
| `COLLABORATIVE-DESIGN-PRINCIPLE.md` | `docs/` | テンプレート教科書: 協調設計の原則 |
| `WORKFLOW-GUIDE.md` | `docs/` | テンプレート教科書: ワークフロー全般ガイド |
| `examples/` | `docs/` | セッション例(B2B 一般、SAKURA OS 固有ではない) |
| `registry/` | `docs/` | テンプレートの汎用用語集(SAKURA OS の用語集は `design/registry/entities.yaml`) |

## 残してある理由

- 後で「テンプレート時代どうなっていたっけ?」を参照したい時のため
- 別プロジェクトを別フォルダで立ち上げる際に、ここからコピーして再利用するため
- 完全削除すると `git log` でしか辿れなくなるため、視覚的に残す

## 削除してよいか?

YES、消しても SAKURA OS には影響ありません。
ただし `git log` を見ればいつでも復元できるので、急いで消す必要はありません。
