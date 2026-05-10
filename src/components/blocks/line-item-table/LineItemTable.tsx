"use client";

import Decimal from "decimal.js";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export type LineItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes?: string;
};

export type LineItemTableProps = {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  readOnly?: boolean;
  showTotal?: boolean;
  taxRate?: number;
  showSubTotal?: boolean;
  showTax?: boolean;
  className?: string;
};

const yenFmt = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const numFmt = new Intl.NumberFormat("ja-JP");

/** 行金額(decimal.js による精度保証) */
const calcAmount = (qty: number, price: number): Decimal =>
  new Decimal(qty || 0).times(price || 0);

const createEmptyItem = (): LineItem => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tmp-${Math.random().toString(36).slice(2)}-${Date.now()}`,
  name: "",
  quantity: 0,
  unit: "式",
  unitPrice: 0,
});

const isItemEmpty = (it: LineItem): boolean =>
  !it.name.trim() &&
  !it.unit.trim() &&
  !it.notes?.trim() &&
  (it.quantity === 0 || Number.isNaN(it.quantity)) &&
  (it.unitPrice === 0 || Number.isNaN(it.unitPrice));

type EditableCellProps = {
  value: string | number;
  type?: "text" | "number";
  onCommit: (next: string) => void;
  ariaLabel: string;
  align?: "left" | "right" | "center";
  readOnly?: boolean;
  format?: (v: string | number) => string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
};

const EditableCell = memo(function EditableCell({
  value,
  type = "text",
  onCommit,
  ariaLabel,
  align = "left",
  readOnly,
  format,
  onKeyDown,
  inputRef,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const localRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value ?? ""));
  }, [value, editing]);

  const display = format ? format(value) : String(value ?? "");
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  if (readOnly) {
    return <span className={`block px-2 py-1 ${alignClass}`}>{display}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`block w-full rounded px-2 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 ${alignClass}`}
        aria-label={ariaLabel}
        onClick={() => setEditing(true)}
        onFocus={() => setEditing(true)}
      >
        {display || <span className="text-gray-400">—</span>}
      </button>
    );
  }

  return (
    <input
      ref={(el) => {
        localRef.current = el;
        inputRef?.(el);
        if (el && document.activeElement !== el) el.focus();
      }}
      type={type}
      inputMode={type === "number" ? "decimal" : "text"}
      value={draft}
      aria-label={ariaLabel}
      className={`block w-full rounded border border-pink-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400 ${alignClass}`}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== String(value ?? "")) onCommit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(String(value ?? ""));
          setEditing(false);
        }
        onKeyDown?.(e);
      }}
    />
  );
});

function LineItemTableBase({
  items,
  onChange,
  readOnly = false,
  showTotal = true,
  taxRate = 0.1,
  showSubTotal = true,
  showTax = true,
  className,
}: LineItemTableProps) {
  /** 5秒間 取り消し可能な「ペンディング削除」 */
  const [pendingDelete, setPendingDelete] = useState<{
    item: LineItem;
    index: number;
  } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  /** 小計・消費税・合計 */
  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (acc, it) => acc.plus(calcAmount(it.quantity, it.unitPrice)),
      new Decimal(0),
    );
    const tax = subtotal.times(taxRate).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
    const total = subtotal.plus(tax);
    return {
      subtotal: subtotal.toNumber(),
      tax: tax.toNumber(),
      total: total.toNumber(),
    };
  }, [items, taxRate]);

  const updateItem = useCallback(
    (index: number, patch: Partial<LineItem>) => {
      const next = items.map((it, i) => (i === index ? { ...it, ...patch } : it));
      onChange(next);
    },
    [items, onChange],
  );

  const addRow = useCallback(() => {
    const next = [...items, createEmptyItem()];
    onChange(next);
    // 追加直後に最初の入力へフォーカス
    requestAnimationFrame(() => {
      const last = next[next.length - 1];
      if (!last) return;
      const el = cellRefs.current.get(`${last.id}:name`);
      el?.focus();
    });
  }, [items, onChange]);

  const removeRow = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      const next = items.filter((_, i) => i !== index);
      onChange(next);
      setPendingDelete({ item, index });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setPendingDelete(null), 5000);
    },
    [items, onChange],
  );

  const undoDelete = useCallback(() => {
    if (!pendingDelete) return;
    const next = [...items];
    next.splice(pendingDelete.index, 0, pendingDelete.item);
    onChange(next);
    setPendingDelete(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, [pendingDelete, items, onChange]);

  const registerRef =
    (key: string) =>
    (el: HTMLInputElement | null): void => {
      if (el) cellRefs.current.set(key, el);
      else cellRefs.current.delete(key);
    };

  const handleLastColKey = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && index === items.length - 1) {
        e.preventDefault();
        addRow();
      }
    },
    [items.length, addRow],
  );

  const handleNameKey = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        const it = items[index];
        if (it && isItemEmpty(it) && items.length > 1) {
          e.preventDefault();
          removeRow(index);
        }
      }
    },
    [items, removeRow],
  );

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table role="table" className="w-full border-collapse text-sm">
          <thead className="bg-pink-50">
            <tr>
              <th
                scope="col"
                className="w-12 border-b border-gray-200 px-2 py-2 text-center font-medium text-gray-700"
              >
                No
              </th>
              <th
                scope="col"
                className="border-b border-gray-200 px-2 py-2 text-left font-medium text-gray-700"
              >
                項目名
              </th>
              <th
                scope="col"
                className="w-20 border-b border-gray-200 px-2 py-2 text-right font-medium text-gray-700"
              >
                数量
              </th>
              <th
                scope="col"
                className="w-20 border-b border-gray-200 px-2 py-2 text-center font-medium text-gray-700"
              >
                単位
              </th>
              <th
                scope="col"
                className="w-32 border-b border-gray-200 px-2 py-2 text-right font-medium text-gray-700"
              >
                単価
              </th>
              <th
                scope="col"
                className="w-32 border-b border-gray-200 px-2 py-2 text-right font-medium text-gray-700"
              >
                金額
              </th>
              {!readOnly && (
                <th
                  scope="col"
                  className="w-12 border-b border-gray-200 px-2 py-2 text-center font-medium text-gray-700"
                >
                  <span className="sr-only">削除</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 6 : 7}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  項目がありません
                </td>
              </tr>
            )}
            {items.map((it, idx) => {
              const amount = calcAmount(it.quantity, it.unitPrice).toNumber();
              return (
                <tr
                  key={it.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-2 py-1 text-center text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell
                      ariaLabel={`${idx + 1}行目 項目名`}
                      value={it.name}
                      readOnly={readOnly}
                      onCommit={(v) => updateItem(idx, { name: v })}
                      onKeyDown={handleNameKey(idx)}
                      inputRef={registerRef(`${it.id}:name`)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell
                      ariaLabel={`${idx + 1}行目 数量`}
                      value={it.quantity}
                      type="number"
                      align="right"
                      readOnly={readOnly}
                      format={(v) =>
                        v === 0 || v === "" || v === "0"
                          ? ""
                          : numFmt.format(Number(v))
                      }
                      onCommit={(v) => {
                        const n = Number(v);
                        updateItem(idx, {
                          quantity: Number.isFinite(n) ? n : 0,
                        });
                      }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell
                      ariaLabel={`${idx + 1}行目 単位`}
                      value={it.unit}
                      align="center"
                      readOnly={readOnly}
                      onCommit={(v) => updateItem(idx, { unit: v })}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell
                      ariaLabel={`${idx + 1}行目 単価`}
                      value={it.unitPrice}
                      type="number"
                      align="right"
                      readOnly={readOnly}
                      format={(v) =>
                        v === 0 || v === "" || v === "0"
                          ? ""
                          : yenFmt.format(Number(v))
                      }
                      onCommit={(v) => {
                        const n = Number(v);
                        updateItem(idx, {
                          unitPrice: Number.isFinite(n) ? n : 0,
                        });
                      }}
                      onKeyDown={readOnly ? undefined : handleLastColKey(idx)}
                    />
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {yenFmt.format(amount)}
                  </td>
                  {!readOnly && (
                    <td className="px-1 py-1 text-center">
                      <button
                        type="button"
                        aria-label={`${idx + 1}行目を削除`}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => removeRow(idx)}
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          {(showSubTotal || showTax || showTotal) && (
            <tfoot
              className="bg-gray-50"
              aria-live="polite"
              aria-atomic="true"
            >
              {showSubTotal && (
                <tr>
                  <td
                    colSpan={readOnly ? 5 : 5}
                    className="px-2 py-2 text-right font-medium text-gray-700"
                  >
                    小計
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {yenFmt.format(totals.subtotal)}
                  </td>
                  {!readOnly && <td />}
                </tr>
              )}
              {showTax && (
                <tr>
                  <td
                    colSpan={readOnly ? 5 : 5}
                    className="px-2 py-2 text-right font-medium text-gray-700"
                  >
                    消費税({Math.round(taxRate * 100)}%)
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {yenFmt.format(totals.tax)}
                  </td>
                  {!readOnly && <td />}
                </tr>
              )}
              {showTotal && (
                <tr className="border-t-2 border-pink-300">
                  <td
                    colSpan={readOnly ? 5 : 5}
                    className="px-2 py-2 text-right font-bold text-gray-900"
                  >
                    合計
                  </td>
                  <td className="px-2 py-2 text-right text-base font-bold tabular-nums text-gray-900">
                    {yenFmt.format(totals.total)}
                  </td>
                  {!readOnly && <td />}
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>

      {!readOnly && (
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-pink-300 bg-white px-3 py-1.5 text-sm font-medium text-pink-700 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            + 行を追加
          </button>
          {pendingDelete && (
            <span
              role="status"
              className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800"
            >
              「{pendingDelete.item.name || "(無題)"}」を削除しました
              <button
                type="button"
                onClick={undoDelete}
                className="font-medium text-amber-900 underline hover:text-amber-700"
              >
                ⤴ 取り消し
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const LineItemTable = memo(LineItemTableBase);
export default LineItemTable;
