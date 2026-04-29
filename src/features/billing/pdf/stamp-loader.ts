import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * 印鑑キーから PNG バイト列を読み込む。public/stamps 配下のファイルを参照。
 * 存在しない場合は null を返す(PDF 生成側で警告ログを記録、欠損は致命扱いしない)。
 */
export function loadStampImage(imagePath: string): Buffer | null {
  // imagePath は "/stamps/company.png" のような形式 → process.cwd() の public/ を起点に解決
  const relative = imagePath.replace(/^\//, "");
  const fullPath = join(process.cwd(), "public", relative);
  try {
    if (!existsSync(fullPath)) return null;
    return readFileSync(fullPath);
  } catch {
    return null;
  }
}

let cachedFont: Buffer | null = null;

/**
 * 日本語フォント(Noto Sans JP Regular)を読み込む。
 * Vercel の Lambda にも outputFileTracingIncludes で含めてある。
 */
export function loadJapaneseFont(): Buffer {
  if (cachedFont) return cachedFont;
  const fontPath = join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansJP-Regular.ttf",
  );
  cachedFont = readFileSync(fontPath);
  return cachedFont;
}
