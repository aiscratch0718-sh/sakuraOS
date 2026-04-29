"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createPriceItem,
  type PriceItemActionResult,
} from "@/features/masters/actions/price-item";

const initial: PriceItemActionResult = { ok: false };

export default function NewPriceItemPage() {
  const [state, formAction, isPending] = useActionState(createPriceItem, initial);
  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link href="/pc/price-items" className="inline-block text-[12px] text-blue underline mb-3">
        ← 単価一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-5">単価を新規登録</h1>

      <form action={formAction} className="space-y-4">
        {!state.ok && state.formError && (
          <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
            {state.formError}
          </div>
        )}

        <div className="panel-pad space-y-3">
          <Field label="カテゴリ" hint="例: 配管工事 / 保温 / 溶接 / 足場">
            <input name="category" className="input" placeholder="任意" />
          </Field>
          <Field label="品名" required err={fe("name")}>
            <input name="name" required className="input" placeholder="例: 配管工事(配管工)" />
          </Field>
          <Field label="単位" required>
            <select name="unit" defaultValue="式" className="input" required>
              {["式", "工", "時間", "個", "m", "m²", "kg"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
          <Field label="標準単価(円)" required err={fe("standardPriceYen")}>
            <input
              name="standardPriceYen"
              type="number"
              inputMode="numeric"
              min={0}
              required
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="下限価格(円、任意)">
              <input name="minPriceYen" type="number" min={0} className="input" />
            </Field>
            <Field label="上限価格(円、任意)">
              <input name="maxPriceYen" type="number" min={0} className="input" />
            </Field>
          </div>
          <Field label="備考">
            <textarea name="note" rows={2} className="input" />
          </Field>
        </div>

        <div className="flex gap-2">
          <Link href="/pc/price-items" className="btn-ghost py-2.5 px-5 text-[13px] inline-block">
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary py-2.5 px-6 text-[13px] flex-1"
          >
            {isPending ? "保存中..." : "登録する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  err,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  err?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-ink-2 mb-1">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-ink-3 mt-1">{hint}</p>}
      {err && <p role="alert" className="text-[11px] text-red font-bold mt-1">{err}</p>}
    </div>
  );
}
