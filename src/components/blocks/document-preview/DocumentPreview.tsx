import Decimal from "decimal.js";
import type { LineItem } from "@/components/blocks/line-item-table/LineItemTable";

/**
 * 見積書 / 請求書のライブプレビュー兼 PDF テンプレ用コンポーネント。
 *
 * - HTML プレビュー + PDF 出力で同一 React コンポーネントを使うため、
 *   副作用 / Client API は使わない pure JSX (Server Component で動作)。
 * - 数値は `Intl.NumberFormat('ja-JP', currency JPY)` で統一。
 * - 印影は半透明オーバーレイ + 微回転 (2deg)。画像が無ければデフォルト SVG。
 *
 * 例:
 *   <DocumentPreview type="estimate" ... />
 */

export type DocumentPreviewProps = {
  type: "estimate" | "invoice";
  documentNumber: string;
  issuedAt: string;
  validUntil?: string;
  paymentDueAt?: string;
  client: {
    name: string;
    addressLines?: string[];
    representative?: string;
  };
  issuer: {
    companyName: string;
    addressLines: string[];
    phone?: string;
    representativeName: string;
    sealImageUrl?: string;
  };
  subject: string;
  items: LineItem[];
  taxRate?: number;
  notes?: string;
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  className?: string;
};

const yenFmt = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const numFmt = new Intl.NumberFormat("ja-JP");

const calcAmount = (qty: number, price: number): Decimal =>
  new Decimal(qty || 0).times(price || 0);

/** 印影が無いときのデフォルト SVG (代表者名の頭文字 1 文字を中央に) */
function DefaultSeal({ label }: { label: string }) {
  const ch = label.trim().charAt(0) || "印";
  return (
    <svg
      viewBox="0 0 80 80"
      width={64}
      height={64}
      aria-hidden="true"
      className="select-none"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="#c0392b"
        strokeWidth="3"
      />
      <text
        x="40"
        y="50"
        textAnchor="middle"
        fontSize="28"
        fontWeight="700"
        fill="#c0392b"
        fontFamily="serif"
      >
        {ch}
      </text>
    </svg>
  );
}

export function DocumentPreview({
  type,
  documentNumber,
  issuedAt,
  validUntil,
  paymentDueAt,
  client,
  issuer,
  subject,
  items,
  taxRate = 0.1,
  notes,
  bankAccount,
  className = "",
}: DocumentPreviewProps) {
  const subtotal = items.reduce(
    (acc, it) => acc.plus(calcAmount(it.quantity, it.unitPrice)),
    new Decimal(0),
  );
  const tax = subtotal.times(taxRate).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  const total = subtotal.plus(tax);

  const title = type === "estimate" ? "御見積書" : "御請求書";
  const dueLabel = type === "estimate" ? "見積有効期限" : "お支払期日";
  const dueValue = type === "estimate" ? validUntil : paymentDueAt;

  return (
    <article
      aria-label={`${title}プレビュー`}
      aria-live="polite"
      className={`mx-auto w-full max-w-[210mm] bg-white p-10 text-ink ${className}`}
      style={{ aspectRatio: "210 / 297", fontFamily: "inherit" }}
    >
      {/* 上部: タイトル + 文書番号 */}
      <header className="flex items-start justify-between border-b-2 border-navy pb-4">
        <h1 className="text-3xl font-extrabold tracking-[0.3em] text-navy">
          {title}
        </h1>
        <dl className="text-right text-xs text-ink-2 leading-relaxed">
          <div className="flex justify-end gap-2">
            <dt>文書番号:</dt>
            <dd className="font-mono text-ink">{documentNumber}</dd>
          </div>
          <div className="flex justify-end gap-2">
            <dt>発行日:</dt>
            <dd className="text-ink">{issuedAt}</dd>
          </div>
          {dueValue && (
            <div className="flex justify-end gap-2">
              <dt>{dueLabel}:</dt>
              <dd className="text-ink">{dueValue}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* 顧客 / 自社 ブロック */}
      <section className="mt-6 grid grid-cols-2 gap-6">
        {/* 顧客 (左) */}
        <div>
          <div className="text-lg font-bold text-ink">
            {client.name}
            <span className="ml-1 text-sm font-normal text-ink-2">御中</span>
          </div>
          {client.addressLines?.map((line, i) => (
            <div key={i} className="text-xs text-ink-2">
              {line}
            </div>
          ))}
          {client.representative && (
            <div className="mt-1 text-xs text-ink-2">
              担当: {client.representative}
            </div>
          )}
        </div>

        {/* 自社 (右) + 印影オーバーレイ */}
        <div className="relative">
          <div className="text-sm font-bold text-ink">{issuer.companyName}</div>
          {issuer.addressLines.map((line, i) => (
            <div key={i} className="text-xs text-ink-2">
              {line}
            </div>
          ))}
          {issuer.phone && (
            <div className="text-xs text-ink-2">TEL: {issuer.phone}</div>
          )}
          <div className="mt-1 text-xs text-ink-2">
            代表者: {issuer.representativeName}
          </div>

          {/* 印影 (右上にオーバーレイ) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-2 right-0 opacity-50"
            style={{ transform: "rotate(2deg)" }}
          >
            {issuer.sealImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={issuer.sealImageUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <DefaultSeal label={issuer.representativeName} />
            )}
          </div>
        </div>
      </section>

      {/* 件名 */}
      <section className="mt-6">
        <div className="border-b border-line pb-1 text-xs text-ink-3">件名</div>
        <div className="mt-1 text-base font-bold text-ink">{subject}</div>
      </section>

      {/* 合計 (大きく) */}
      <section className="mt-4 rounded-card bg-graybg px-4 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-ink-3">
            {type === "estimate" ? "御見積金額" : "御請求金額"}
          </span>
          <span className="text-2xl font-extrabold tabular-nums text-navy">
            {yenFmt.format(total.toNumber())}
            <span className="ml-1 text-xs font-normal text-ink-3">(税込)</span>
          </span>
        </div>
      </section>

      {/* 明細テーブル (簡略表示) */}
      <section className="mt-4">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-graybg">
            <tr>
              <th className="w-8 border border-line px-1 py-1 text-center font-medium">
                No
              </th>
              <th className="border border-line px-2 py-1 text-left font-medium">
                項目名
              </th>
              <th className="w-14 border border-line px-1 py-1 text-right font-medium">
                数量
              </th>
              <th className="w-12 border border-line px-1 py-1 text-center font-medium">
                単位
              </th>
              <th className="w-24 border border-line px-1 py-1 text-right font-medium">
                単価
              </th>
              <th className="w-24 border border-line px-1 py-1 text-right font-medium">
                金額
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-line px-2 py-4 text-center text-ink-3"
                >
                  項目がありません
                </td>
              </tr>
            )}
            {items.map((it, idx) => {
              const amount = calcAmount(it.quantity, it.unitPrice).toNumber();
              return (
                <tr key={it.id}>
                  <td className="border border-line px-1 py-1 text-center text-ink-3">
                    {idx + 1}
                  </td>
                  <td className="border border-line px-2 py-1">
                    <div className="text-ink">{it.name || "—"}</div>
                    {it.notes && (
                      <div className="text-[10px] text-ink-3">{it.notes}</div>
                    )}
                  </td>
                  <td className="border border-line px-1 py-1 text-right tabular-nums">
                    {it.quantity ? numFmt.format(it.quantity) : ""}
                  </td>
                  <td className="border border-line px-1 py-1 text-center">
                    {it.unit}
                  </td>
                  <td className="border border-line px-1 py-1 text-right tabular-nums">
                    {it.unitPrice ? yenFmt.format(it.unitPrice) : ""}
                  </td>
                  <td className="border border-line px-1 py-1 text-right tabular-nums">
                    {yenFmt.format(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={5}
                className="border border-line px-2 py-1 text-right font-medium text-ink-2"
              >
                小計
              </td>
              <td className="border border-line px-1 py-1 text-right tabular-nums">
                {yenFmt.format(subtotal.toNumber())}
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="border border-line px-2 py-1 text-right font-medium text-ink-2"
              >
                消費税({Math.round(taxRate * 100)}%)
              </td>
              <td className="border border-line px-1 py-1 text-right tabular-nums">
                {yenFmt.format(tax.toNumber())}
              </td>
            </tr>
            <tr className="bg-graybg">
              <td
                colSpan={5}
                className="border border-line px-2 py-1.5 text-right font-bold text-ink"
              >
                合計
              </td>
              <td className="border border-line px-1 py-1.5 text-right text-sm font-bold tabular-nums text-navy">
                {yenFmt.format(total.toNumber())}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* 備考 */}
      {notes && (
        <section className="mt-4">
          <div className="border-b border-line pb-1 text-xs text-ink-3">備考</div>
          <p className="mt-1 whitespace-pre-wrap text-xs text-ink-2">{notes}</p>
        </section>
      )}

      {/* 振込先 (invoice のみ) */}
      {type === "invoice" && bankAccount && (
        <section className="mt-4 rounded-card border border-line p-3">
          <div className="text-xs font-bold text-ink">お振込先</div>
          <dl className="mt-1 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-0.5 text-xs text-ink-2">
            <dt>銀行名</dt>
            <dd className="text-ink">{bankAccount.bankName}</dd>
            <dt>支店名</dt>
            <dd className="text-ink">{bankAccount.branchName}</dd>
            <dt>口座種別</dt>
            <dd className="text-ink">{bankAccount.accountType}</dd>
            <dt>口座番号</dt>
            <dd className="font-mono text-ink">{bankAccount.accountNumber}</dd>
            <dt>口座名義</dt>
            <dd className="text-ink">{bankAccount.accountHolder}</dd>
          </dl>
        </section>
      )}
    </article>
  );
}

export default DocumentPreview;
