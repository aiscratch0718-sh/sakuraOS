"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ProjectActionResult } from "@/features/master/schemas";

type Project = {
  id?: string;
  code: string | null;
  name: string;
  customer_id: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  contract_amount_cents: number | null;
  note: string | null;
};

type Customer = { id: string; name: string };

const initialResult: ProjectActionResult = { ok: false };

export function ProjectForm({
  initial,
  customers,
  action,
  submitLabel,
}: {
  initial?: Partial<Project>;
  customers: Customer[];
  action: (
    prev: ProjectActionResult,
    formData: FormData,
  ) => Promise<ProjectActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialResult);

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  const initialAmountYen =
    typeof initial?.contract_amount_cents === "number"
      ? Math.round(initial.contract_amount_cents / 100).toString()
      : "";

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
        <div className="grid grid-cols-3 gap-3">
          <Field label="現場コード" error={fieldError("code")}>
            <input
              name="code"
              type="text"
              defaultValue={initial?.code ?? ""}
              placeholder="例: 2026-001"
              className="input"
            />
          </Field>

          <Field
            label="現場名"
            required
            className="col-span-2"
            error={fieldError("name")}
          >
            <input
              name="name"
              type="text"
              required
              defaultValue={initial?.name ?? ""}
              className="input"
            />
          </Field>
        </div>

        <Field label="客先" error={fieldError("customerId")}>
          <select
            name="customerId"
            defaultValue={initial?.customer_id ?? ""}
            className="input"
          >
            <option value="">— 選択しない —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="状態" required error={fieldError("status")}>
            <select
              name="status"
              defaultValue={initial?.status ?? "active"}
              className="input"
              required
            >
              <option value="active">稼働中</option>
              <option value="completed">完了</option>
              <option value="archived">アーカイブ</option>
            </select>
          </Field>

          <Field label="開始日" error={fieldError("startedAt")}>
            <input
              name="startedAt"
              type="date"
              defaultValue={initial?.started_at ?? ""}
              className="input"
            />
          </Field>

          <Field label="終了日" error={fieldError("endedAt")}>
            <input
              name="endedAt"
              type="date"
              defaultValue={initial?.ended_at ?? ""}
              className="input"
            />
          </Field>
        </div>

        <Field
          label="契約金額(円)"
          error={fieldError("contractAmountCents")}
        >
          <ContractAmountInput defaultYen={initialAmountYen} />
          <p className="text-[10px] text-ink-3 mt-1">
            DB には税抜きの「銭(cents)」単位で保存されます。
          </p>
        </Field>

        <Field label="備考" error={fieldError("note")}>
          <textarea
            name="note"
            rows={3}
            defaultValue={initial?.note ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Link
          href="/pc/projects"
          className="btn-ghost py-2.5 px-5 text-[13px] inline-block"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary py-2.5 px-6 text-[13px] flex-1"
        >
          {isPending ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/**
 * 円(yen)で入力された値を Server Action へ送る前に「銭(cents = yen × 100)」に
 * 変換する隠しフィールドを伴うラッパー。
 */
function ContractAmountInput({ defaultYen }: { defaultYen: string }) {
  return (
    <>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        defaultValue={defaultYen}
        className="input"
        onChange={(e) => {
          const yen = Number(e.target.value || 0);
          const hidden = e.currentTarget.form?.querySelector<HTMLInputElement>(
            'input[name="contractAmountCents"]',
          );
          if (hidden) hidden.value = String(Math.max(0, Math.round(yen * 100)));
        }}
      />
      <input
        type="hidden"
        name="contractAmountCents"
        defaultValue={
          defaultYen === "" ? "" : String(Math.round(Number(defaultYen) * 100))
        }
      />
    </>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-bold text-ink-2 mb-1">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
