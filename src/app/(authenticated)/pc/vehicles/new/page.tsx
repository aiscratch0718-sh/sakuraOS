"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createVehicle, type VehicleActionResult } from "@/features/vehicles/actions";

const initialResult: VehicleActionResult = { ok: false };

export default function NewVehiclePage() {
  const [state, formAction, isPending] = useActionState(
    createVehicle,
    initialResult,
  );

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/vehicles"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 車両一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-5">車両を新規登録</h1>

      <form action={formAction} className="space-y-4">
        {!state.ok && state.formError && (
          <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
            {state.formError}
          </div>
        )}

        <div className="panel-pad space-y-3">
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              ナンバー <span className="text-red ml-1">*</span>
            </label>
            <input
              name="plateNumber"
              required
              placeholder="例: 品川 500 あ 12-34"
              className="input"
            />
            {fieldError("plateNumber") && (
              <p className="mt-1 text-[11px] text-red font-bold">
                {fieldError("plateNumber")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              車種
            </label>
            <input name="model" placeholder="例: ハイエース" className="input" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              状態
            </label>
            <select name="status" defaultValue="available" className="input">
              <option value="available">利用可</option>
              <option value="in_use">使用中</option>
              <option value="maintenance">整備中</option>
              <option value="retired">廃車</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              備考
            </label>
            <textarea name="note" rows={3} className="input" />
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/pc/vehicles"
            className="btn-ghost py-2.5 px-5 text-[13px] inline-block"
          >
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
