"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createQualification,
  type QualActionResult,
} from "@/features/masters/actions/qualification";

const initial: QualActionResult = { ok: false };

export default function NewQualificationPage() {
  const [state, formAction, isPending] = useActionState(createQualification, initial);
  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/qualifications"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 資格一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-5">資格を新規登録</h1>

      <form action={formAction} className="space-y-4">
        {!state.ok && state.formError && (
          <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
            {state.formError}
          </div>
        )}

        <div className="panel-pad space-y-3">
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              資格名 <span className="text-red ml-1">*</span>
            </label>
            <input name="name" required className="input" placeholder="例: 玉掛け技能講習" />
            {fe("name") && <p className="text-[11px] text-red font-bold mt-1">{fe("name")}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              カテゴリ
            </label>
            <select name="category" className="input">
              <option value="">— 選択しない —</option>
              <option value="国家資格">国家資格</option>
              <option value="民間資格">民間資格</option>
              <option value="社内認定">社内認定</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              説明
            </label>
            <textarea name="description" rows={3} className="input" />
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/pc/qualifications"
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
