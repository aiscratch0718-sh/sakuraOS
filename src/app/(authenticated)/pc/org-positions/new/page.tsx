"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPosition, type OrgActionResult } from "@/features/org/actions";

const initial: OrgActionResult = { ok: false };

export default function NewPositionPage() {
  const [state, formAction, isPending] = useActionState(createPosition, initial);
  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link href="/pc/org-positions" className="inline-block text-[12px] text-blue underline mb-3">
        ← 役職一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-5">役職を新規登録</h1>
      <form action={formAction} className="space-y-4">
        {!state.ok && state.formError && (
          <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
            {state.formError}
          </div>
        )}
        <div className="panel-pad space-y-3">
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              役職名 <span className="text-red ml-1">*</span>
            </label>
            <input name="name" required className="input" placeholder="例: 主任" />
            {fe("name") && <p className="text-[11px] text-red mt-1 font-bold">{fe("name")}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">序列(数字大きいほど上位)</label>
            <input name="rank" type="number" defaultValue={10} className="input" />
            <p className="text-[10px] text-ink-3 mt-1">例: 社長=100, 部長=80, 課長=70, 主任=60, 一般=10</p>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">表示順</label>
            <input name="sortOrder" type="number" defaultValue={0} className="input" />
          </div>
          <label className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" name="isVisibleToAll" defaultChecked className="w-4 h-4 accent-blue" />
            <span className="font-bold text-ink-2">全社員に公開する</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Link href="/pc/org-positions" className="btn-ghost py-2.5 px-5 text-[13px] inline-block">
            キャンセル
          </Link>
          <button type="submit" disabled={isPending} className="btn-primary py-2.5 px-6 text-[13px] flex-1">
            {isPending ? "保存中..." : "登録する"}
          </button>
        </div>
      </form>
    </div>
  );
}
