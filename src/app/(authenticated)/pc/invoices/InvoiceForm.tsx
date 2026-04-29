"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LineItemsEditor } from "../_components/LineItemsEditor";
import type {
  BillingActionResult,
  ItemInput,
} from "@/features/billing/schemas";

type Customer = { id: string; name: string };
type Project = { id: string; name: string };

type InvoiceInitial = {
  customer_id: string;
  project_id: string | null;
  estimate_id: string | null;
  invoice_no: string | null;
  title: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  tax_rate: number;
  note: string | null;
  items: ItemInput[];
};

const STATUS_OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "issued", label: "発行済" },
  { value: "paid", label: "支払済" },
  { value: "overdue", label: "期限超過" },
  { value: "voided", label: "無効" },
];

const initialResult: BillingActionResult = { ok: false };

export function InvoiceForm({
  initial,
  customers,
  projects,
  action,
  submitLabel,
}: {
  initial?: Partial<InvoiceInitial>;
  customers: Customer[];
  projects: Project[];
  action: (
    prev: BillingActionResult,
    formData: FormData,
  ) => Promise<BillingActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialResult);
  const [taxRate, setTaxRate] = useState<number>(initial?.tax_rate ?? 0.1);
  const [itemsJson, setItemsJson] = useState<string>(
    JSON.stringify(initial?.items ?? []),
  );

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  const today = new Date().toISOString().slice(0, 10);

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

      <input
        type="hidden"
        name="estimateId"
        value={initial?.estimate_id ?? ""}
      />

      <div className="panel-pad space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="客先" required error={fieldError("customerId")}>
            <select
              name="customerId"
              defaultValue={initial?.customer_id ?? ""}
              className="input"
              required
            >
              <option value="">— 選択してください —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="関連現場(任意)">
            <select
              name="projectId"
              defaultValue={initial?.project_id ?? ""}
              className="input"
            >
              <option value="">— 選択しない —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="件名" required error={fieldError("title")}>
          <input
            name="title"
            type="text"
            required
            defaultValue={initial?.title ?? ""}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="請求番号(任意)">
            <input
              name="invoiceNo"
              type="text"
              defaultValue={initial?.invoice_no ?? ""}
              placeholder="例: I-2026-001"
              className="input"
            />
          </Field>

          <Field label="状態" required>
            <select
              name="status"
              defaultValue={initial?.status ?? "draft"}
              className="input"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="税率">
            <select
              name="taxRate"
              value={String(taxRate)}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="input"
            >
              <option value="0.1">10%</option>
              <option value="0.08">8%(軽減)</option>
              <option value="0">非課税</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="発行日" required error={fieldError("issueDate")}>
            <input
              name="issueDate"
              type="date"
              required
              defaultValue={initial?.issue_date ?? today}
              className="input"
            />
          </Field>

          <Field label="支払期限(任意)">
            <input
              name="dueDate"
              type="date"
              defaultValue={initial?.due_date ?? ""}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="panel-pad space-y-3">
        <h3 className="text-[13px] font-bold text-navy">明細</h3>
        <LineItemsEditor
          initial={initial?.items}
          taxRate={taxRate}
          onChangeJson={setItemsJson}
        />
        <input type="hidden" name="items" value={itemsJson} />
      </div>

      <div className="panel-pad">
        <Field label="備考(任意)">
          <textarea
            name="note"
            rows={3}
            defaultValue={initial?.note ?? ""}
            className="input"
            placeholder="振込先・支払条件などの補足"
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Link
          href="/pc/invoices"
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

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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
