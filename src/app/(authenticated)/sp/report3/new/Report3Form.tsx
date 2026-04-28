"use client";

import { useActionState, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitReport3 } from "@/features/report3/actions/submit";
import type { Report3Result } from "@/features/report3/schemas";

type Project = { id: string; name: string };
type Classification = {
  l1: string;
  l2: string;
  l3: string;
  display_order: number;
};

type RowDraft = {
  id: string;
  l1: string;
  l2: string;
  l3: string;
  hours: number;
  memo: string;
};

const initialResult: Report3Result = { ok: false };

export function Report3Form({
  projects,
  classifications,
}: {
  projects: Project[];
  classifications: Classification[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitReport3, initialResult);

  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [workDate, setWorkDate] = useState<string>(todayInTokyo());
  const [rows, setRows] = useState<RowDraft[]>([newRow()]);
  const [idempotencyKey] = useState<string>(() => crypto.randomUUID());

  const l1Options = useMemo(
    () => Array.from(new Set(classifications.map((c) => c.l1))),
    [classifications],
  );

  const l2OptionsFor = (l1: string) =>
    Array.from(new Set(classifications.filter((c) => c.l1 === l1).map((c) => c.l2)));

  const l3OptionsFor = (l1: string, l2: string) =>
    classifications.filter((c) => c.l1 === l1 && c.l2 === l2).map((c) => c.l3);

  const totalHours = rows.reduce((s, r) => s + (Number(r.hours) || 0), 0);

  useEffect(() => {
    if (state.ok) {
      router.push("/sp/home");
      router.refresh();
    }
  }, [state, router]);

  function updateRow(id: string, patch: Partial<RowDraft>) {
    setRows((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        if (patch.l1 !== undefined && patch.l1 !== r.l1) {
          next.l2 = "";
          next.l3 = "";
        }
        if (patch.l2 !== undefined && patch.l2 !== r.l2) {
          next.l3 = "";
        }
        return next;
      }),
    );
  }

  function addRow() {
    if (rows.length >= 10) return;
    setRows((rows) => [...rows, newRow()]);
  }

  function removeRow(id: string) {
    setRows((rows) => (rows.length === 1 ? rows : rows.filter((r) => r.id !== id)));
  }

  function handleSubmit(formData: FormData) {
    formData.set("projectId", projectId);
    formData.set("workDate", workDate);
    formData.set("idempotencyKey", idempotencyKey);
    formData.set(
      "rows",
      JSON.stringify(
        rows.map(({ id, ...rest }) => {
          void id;
          return rest;
        }),
      ),
    );
    return formAction(formData);
  }

  if (projects.length === 0) {
    return (
      <div className="panel-pad bg-amber-bg/50 border-amber/30 text-[12px] text-ink-2">
        現場(プロジェクト)が登録されていません。事務にお問い合わせください。
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {!state.ok && state.formError && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold"
        >
          {state.formError}
        </div>
      )}

      {/* 現場 + 日付 */}
      <div className="panel-pad space-y-3">
        <div>
          <label htmlFor="projectId" className="block text-[12px] font-bold text-ink-2 mb-1">
            現場
          </label>
          <select
            id="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input"
            required
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="workDate" className="block text-[12px] font-bold text-ink-2 mb-1">
            作業日
          </label>
          <input
            id="workDate"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>

      {/* 作業行 */}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <fieldset key={row.id} className="panel-pad space-y-3">
            <legend className="px-2 text-[10px] font-bold text-ink-3 tracking-wider">
              行 {idx + 1}
            </legend>

            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">
                大分類
              </label>
              <select
                value={row.l1}
                onChange={(e) => updateRow(row.id, { l1: e.target.value })}
                className="input"
                required
              >
                <option value="">選択してください</option>
                {l1Options.map((l1) => (
                  <option key={l1} value={l1}>
                    {l1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">
                中分類
              </label>
              <select
                value={row.l2}
                onChange={(e) => updateRow(row.id, { l2: e.target.value })}
                className="input"
                disabled={!row.l1}
                required
              >
                <option value="">選択してください</option>
                {row.l1 &&
                  l2OptionsFor(row.l1).map((l2) => (
                    <option key={l2} value={l2}>
                      {l2}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">
                小分類
              </label>
              <select
                value={row.l3}
                onChange={(e) => updateRow(row.id, { l3: e.target.value })}
                className="input"
                disabled={!row.l2}
                required
              >
                <option value="">選択してください</option>
                {row.l1 &&
                  row.l2 &&
                  l3OptionsFor(row.l1, row.l2).map((l3) => (
                    <option key={l3} value={l3}>
                      {l3}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="flex items-center justify-between text-[11px] font-bold text-ink-2 mb-1">
                <span>作業時間</span>
                <span className="text-blue text-[14px]">{row.hours} h</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={row.hours}
                onChange={(e) => updateRow(row.id, { hours: Number(e.target.value) })}
                className="w-full accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">
                メモ(任意)
              </label>
              <textarea
                value={row.memo}
                onChange={(e) => updateRow(row.id, { memo: e.target.value })}
                rows={2}
                className="input"
              />
            </div>

            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="text-[11px] text-red underline font-bold"
              >
                この行を削除
              </button>
            )}
          </fieldset>
        ))}
      </div>

      {rows.length < 10 && (
        <button
          type="button"
          onClick={addRow}
          className="w-full py-2.5 border-2 border-dashed border-line rounded-panel text-[12px] font-bold text-ink-2 hover:border-blue hover:text-blue transition-colors"
        >
          + もう1行追加
        </button>
      )}

      {/* 合計 */}
      <div
        className={`text-[13px] font-bold px-3 py-2 rounded-btn ${
          totalHours > 8 ? "bg-amber-bg text-amber" : "bg-blue-bg text-blue"
        }`}
      >
        合計: {totalHours} 時間
        {totalHours > 8 && (
          <div className="text-[11px] mt-1 font-medium">
            ⚠ 8時間を超えています(現場リーダー承認が必要になります)
          </div>
        )}
      </div>

      <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-[15px]">
        {isPending ? "保存中..." : "提出する"}
      </button>
    </form>
  );
}

function newRow(): RowDraft {
  return {
    id: crypto.randomUUID(),
    l1: "",
    l2: "",
    l3: "",
    hours: 4,
    memo: "",
  };
}

function todayInTokyo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
