# フォルダリネーム手順 — `Claude-Code-Game-Studios` → `sakura-os`

## なぜリネームするのか

- このリポジトリは **SAKURA OS**(さくら株式会社の業務管理システム)で、
  GitHub repo 名は既に `sakuraOS`、`package.json` の name は `sakura-os` です
- 一方ローカルフォルダだけ `Claude-Code-Game-Studios`(B2B Web/SaaS テンプレート由来の
  汎用名)のまま残っており、後から見ると何のプロジェクトか直感的に分かりません
- `sakura-os` にリネームすることで、Explorer / VS Code / ターミナルのどこから見ても
  プロジェクトが識別可能になります

---

## ⚠️ 事前確認

リネーム前に以下を **必ず** 確認してください:

- [ ] 未コミットの変更がないか: `git status` でクリーンであること
- [ ] 未プッシュのコミットがないか: `git log origin/main..HEAD` で空であること
- [ ] 開いている VS Code / Cursor / IDE の該当ウィンドウを **すべて閉じる**
- [ ] このフォルダで動いている dev server / その他プロセスを停止する
- [ ] 起動中の Claude Code セッションを終了する
  (このセッションも、このドキュメントを最後まで読んだら一度終了してください)

---

## 手順 — Windows

### 方法 A: PowerShell でリネーム(推奨)

```powershell
# 親フォルダへ移動
cd "C:\Users\liim1\Desktop\エージェント会社"

# リネーム実行
Rename-Item -Path "Claude-Code-Game-Studios" -NewName "sakura-os"

# 確認
ls "C:\Users\liim1\Desktop\エージェント会社\sakura-os"
```

### 方法 B: エクスプローラーで操作

1. `C:\Users\liim1\Desktop\エージェント会社\` を開く
2. `Claude-Code-Game-Studios` フォルダを右クリック → 「名前の変更」
3. `sakura-os` と入力して Enter

---

## リネーム後にやること

1. **VS Code / Cursor で新しいパスで開き直す**
   - `C:\Users\liim1\Desktop\エージェント会社\sakura-os\`

2. **依存関係の再構築は不要**(node_modules はそのまま使える)

3. **Claude Code セッションを新しいパスで起動**
   ```powershell
   cd "C:\Users\liim1\Desktop\エージェント会社\sakura-os"
   claude  # または claude code
   ```

4. **動作確認**:
   ```powershell
   git status
   git remote -v   # remote が sakuraOS.git のままであることを確認
   npm run build   # ビルドが通ることを確認
   ```

5. **ブックマーク / ショートカットの更新**(該当があれば)

---

## リネームによる影響(なし or 軽微)

| 項目 | 影響 |
|---|---|
| Git リポジトリ | **無影響**(.git の中身はパスに依存しない) |
| GitHub remote | **無影響**(URL は変わらない) |
| Vercel デプロイ | **無影響**(GitHub から自動デプロイのため) |
| Supabase 接続 | **無影響**(`.env.local` の値はパスに依存しない) |
| node_modules | **無影響**(新環境なら再 install 不要) |
| package.json | **無影響**(name は既に `sakura-os`) |

---

## トラブル時の戻し方

```powershell
cd "C:\Users\liim1\Desktop\エージェント会社"
Rename-Item -Path "sakura-os" -NewName "Claude-Code-Game-Studios"
```

git の中身は変わっていないので、いつでも元に戻せます。

---

## 完了チェック

- [ ] ローカルフォルダ名が `sakura-os` になっている
- [ ] VS Code / Cursor で新パスで開けた
- [ ] `git status` がエラーなく動く
- [ ] `npm run build` が通る
- [ ] `claude` コマンドが新パスから起動できる
- [ ] Vercel デプロイが正常に継続している(直近の Push がデプロイされていれば OK)

完了したら、次の Claude セッションで `docs/rebuild/PROGRESS.md` を更新して
「フォルダリネーム完了」を記録してください。
