import { Font } from "@react-pdf/renderer";

/**
 * 日本語フォント登録(Noto Sans JP)。
 * react-pdf はデフォルトでは日本語をレンダリングできないため、Google Fonts
 * 経由で Noto Sans JP を URL 登録する。
 *
 * Font.register は idempotent でないため、複数回呼ばれないよう module-level
 * フラグで一度だけ実行する。
 *
 * TODO(P-PDF-fonts): self-hosted フォントに切替(Vercel + Edge での
 * Google Fonts 取得遅延を回避)。
 */

let registered = false;

export function ensureJapaneseFonts() {
  if (registered) return;
  Font.register({
    family: "NotoSansJP",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/noto-sans-jp-otf@1.0.0/NotoSansJP-Regular.otf",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/npm/noto-sans-jp-otf@1.0.0/NotoSansJP-Bold.otf",
        fontWeight: 700,
      },
    ],
  });
  registered = true;
}
