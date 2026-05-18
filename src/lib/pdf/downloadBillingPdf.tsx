"use client";

/**
 * 見積書 / 請求書 PDF をクライアント側で生成し Blob ダウンロードする helper。
 *
 * 設計:
 *  - @react-pdf/renderer の pdf(<Document>).toBlob() を使用
 *  - 大きな Document コンポーネント本体は dynamic import で初回呼び出し時
 *    のみ読み込まれる(初期 JS bundle に乗らない)
 *  - ファイル名は <docType>_<docNo>_<date>.pdf 形式
 */

import type { BillingPdfProps } from "./BillingPdf";

export async function downloadBillingPdf(props: BillingPdfProps): Promise<void> {
  // @react-pdf/renderer は client-only (window 依存)、動的 import
  const [{ pdf }, { BillingPdf }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./BillingPdf"),
  ]);

  const blob = await pdf(<BillingPdf {...props} />).toBlob();
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `${props.docType === "estimate" ? "estimate" : "invoice"}_${props.docNo}_${today}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // 5 秒後に URL を解放(短すぎるとブラウザがダウンロード完了前に revoke)
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
