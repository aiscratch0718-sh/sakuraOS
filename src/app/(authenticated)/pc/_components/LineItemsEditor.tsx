"use client";

import { useState, useEffect } from "react";
import type { ItemInput } from "@/features/billing/schemas";

type Item = ItemInput & { id: string };

function newItem(): Item {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    quantity: 1,
    unit: "式",
    unitPriceYen: 0,
  };
}

export function LineItemsEditor({
  initial,
  taxRate,
  onChangeJson,
}: {
  initial?: ItemInput[];
  taxRate: number;
  onChangeJson?: (json: string) => void;
}) {
  const [items, setItems] = useState<Item[]>(() => {
    const seed = initial && initial.length > 0 ? initial : [newItem()];
    return seed.map((it) => ({ ...it, id: crypto.randomUUID() }));
  });

  const subtotalYen = items.reduce(
    (s, it) => s + Number(it.quantity || 0) * Number(it.unitPriceYen || 0),
    0,
  );
  const taxYen = Math.round(subtotalYen * taxRate);
  const totalYen = subtotalYen + taxYen;

  // フォーム送信用の hidden field を更新
  useEffect(() => {
    const payload = items.map(({ id, ...rest }) => {
      void id;
      return {
        name: rest.name,
        description: rest.description || "",
        quantity: Number(rest.quantity) || 0,
        unit: rest.unit || "",
        unitPriceYen: Number(rest.unitPriceYen) || 0,
      };
    });
    onChangeJson?.(JSON.stringify(payload));
  }, [items, onChangeJson]);

  function update(id: string, patch: Partial<Item>) {
    setItems((items) =>
      items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function add() {
    if (items.length >= 50) return;
    setItems((items) => [...items, newItem()]);
  }

  function remove(id: string) {
    setItems((items) =>
      items.length === 1 ? items : items.filter((it) => it.id !== id),
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] text-navy bg-blue-bg">
              <th className="py-2 px-2 font-bold">品名 *</th>
              <th className="py-2 px-2 font-bold w-16">数量</th>
              <th className="py-2 px-2 font-bold w-16">単位</th>
              <th className="py-2 px-2 font-bold w-32 text-right">単価(円)</th>
              <th className="py-2 px-2 font-bold w-32 text-right">金額</th>
              <th className="py-2 px-2 font-bold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const amount = Math.round(
                Number(it.quantity || 0) * Number(it.unitPriceYen || 0),
              );
              return (
                <tr key={it.id} className="border-b border-line align-top">
                  <td className="py-1 px-1">
                    <input
                      value={it.name}
                      onChange={(e) => update(it.id, { name: e.target.value })}
                      placeholder="例: 配管工事"
                      className="input text-[12px] py-1"
                      required
                    />
                    <input
                      value={it.description ?? ""}
                      onChange={(e) =>
                        update(it.id, { description: e.target.value })
                      }
                      placeholder="補足(任意)"
                      className="input text-[11px] py-1 mt-1 text-ink-2"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      step={0.01}
                      min={0}
                      value={it.quantity}
                      onChange={(e) =>
                        update(it.id, { quantity: Number(e.target.value) })
                      }
                      className="input text-[12px] py-1"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      value={it.unit ?? ""}
                      onChange={(e) => update(it.id, { unit: e.target.value })}
                      className="input text-[12px] py-1"
                      placeholder="式"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      step={1}
                      min={0}
                      value={it.unitPriceYen}
                      onChange={(e) =>
                        update(it.id, {
                          unitPriceYen: Number(e.target.value),
                        })
                      }
                      className="input text-[12px] py-1 text-right font-mono"
                    />
                  </td>
                  <td className="py-1 px-1 text-right font-mono whitespace-nowrap pt-2">
                    ¥{amount.toLocaleString("ja-JP")}
                  </td>
                  <td className="py-1 px-1 text-center pt-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        className="text-red text-[14px] font-bold"
                        aria-label="この行を削除"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length < 50 && (
        <button
          type="button"
          onClick={add}
          className="text-[11px] text-blue underline font-bold"
        >
          + 行を追加
        </button>
      )}

      <div className="bg-graybg rounded-btn p-3 text-[12px] mt-3 space-y-1 max-w-xs ml-auto">
        <div className="flex justify-between">
          <span className="text-ink-2">小計</span>
          <span className="font-mono">¥{subtotalYen.toLocaleString("ja-JP")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-2">消費税({Math.round(taxRate * 100)}%)</span>
          <span className="font-mono">¥{taxYen.toLocaleString("ja-JP")}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-1 mt-1 text-[14px] font-bold">
          <span>合計</span>
          <span className="font-mono text-navy">
            ¥{totalYen.toLocaleString("ja-JP")}
          </span>
        </div>
      </div>
    </div>
  );
}
