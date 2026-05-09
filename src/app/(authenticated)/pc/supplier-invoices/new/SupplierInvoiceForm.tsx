"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createSupplierInvoice, type SIActionResult } from "@/features/supplier-invoices/actions";

type Project = { id: string; name: string };
const initial: SIActionResult = { ok: false };

export function SupplierInvoiceForm({ projects }: { projects: Project[] }) {
  const [state, formAction, isPending] = useActionState(createSupplierInvoice, initial);
  const [type, setType] = useState<string>("material");
  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  return (
    <form action={formAction} className="space-y-4">
      {!state.ok && state.formError && (
        <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
          {state.formError}
        </div>
      )}
      <div className="panel-pad space-y-3">
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">種別 <span className="text-red">*</span></label>
          <select name="invoiceType" value={type} onChange={(e) => setType(e.target.value)} className="input">
            <option value="material">仕入(材料)</option>
            <option value="lease">リース</option>
            <option value="subcontractor">協力会社</option>
            <option value="misc">その他</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">仕入先名 <span className="text-red">*</span></label>
          <input name="supplierName" required className="input" placeholder="例: 〇〇商事" />
          {fe("supplierName") && <p className="text-[11px] text-red mt-1 font-bold">{fe("supplierName")}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">請求日 <span className="text-red">*</span></label>
            <input name="invoiceDate" type="date" required className="input" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">請求書番号</label>
            <input name="invoiceNumber" className="input" placeholder="任意" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">関連現場</label>
          <select name="projectId" className="input">
            <option value="">— 選択しない —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">金額(税抜・円) <span className="text-red">*</span></label>
          <input name="amountYen" type="number" inputMode="numeric" required min={0} className="input" />
        </div>
        {type === "subcontractor" && (
          <div className="grid grid-cols-2 gap-3 panel-pad bg-amber-bg/20">
            <div>
              <label className="block text-[11px] font-bold text-amber mb-1">人工数</label>
              <input name="manhours" type="number" step="0.1" min={0} className="input" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-amber mb-1">残業時間</label>
              <input name="overtimeHours" type="number" step="0.1" min={0} className="input" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">備考</label>
          <textarea name="note" rows={2} className="input" />
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/pc/supplier-invoices" className="btn-ghost py-2.5 px-5 text-[13px] inline-block">キャンセル</Link>
        <button type="submit" disabled={isPending} className="btn-primary py-2.5 px-6 text-[13px] flex-1">
          {isPending ? "保存中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
