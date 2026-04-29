"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ToolActionResult } from "@/features/tools/actions";

const initialResult: ToolActionResult = { ok: false };

export function ToolForm({
  action,
}: {
  action: (
    prev: ToolActionResult,
    formData: FormData,
  ) => Promise<ToolActionResult>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialResult);

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {!state.ok && state.formError && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold"
        >
          {state.formError}
        </div>
      )}

      <div className="panel-pad space-y-3">
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            工具コード <span className="text-red ml-1">*</span>
          </label>
          <input
            name="toolCode"
            required
            placeholder="例: TOOL-010"
            className="input"
          />
          {fieldError("toolCode") && (
            <p className="mt-1 text-[11px] text-red font-bold">
              {fieldError("toolCode")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            工具名 <span className="text-red ml-1">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="例: 充電インパクトドライバー"
            className="input"
          />
          {fieldError("name") && (
            <p className="mt-1 text-[11px] text-red font-bold">
              {fieldError("name")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            カテゴリ
          </label>
          <input
            name="category"
            placeholder="例: 電動工具"
            className="input"
          />
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
          href="/pc/tools"
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
  );
}
