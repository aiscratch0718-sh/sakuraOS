"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LineItemsEditor } from "../_components/LineItemsEditor";
import { StampSelector, type StampMaster } from "../_components/StampSelector";
import type {
  BillingActionResult,
  ItemInput,
} from "@/features/billing/schemas";

type Customer = { id: string; name: string };
type Project = { id: string; name: string };

type EstimateInitial = {
  customer_id: string;
  project_id: string | null;
  estimate_no: string | null;
  title: string;
  status: string;
  issue_date: string;
  expiry_date: string | null;
  tax_rate: number;
  note: string | null;
  items: ItemInput[];
  stamps?: Record<string, boolean>;
  print_company_stamp?: boolean;
  print_staff_info?: boolean;
  print_company_contact?: boolean;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "sent", label: "送付済" },
  { value: "accepted", label: "受注" },
  { value: "rejected", label: "失注" },
  { value: "expired", label: "期限切れ" },
];

const initialResult: BillingActionResult = { ok: false };

export function EstimateForm({
  initial,
  customers,
  projects,
  stamps,
  action,
  submitLabel,
}: {
  initial?: Partial<EstimateInitial>;
  customers: Customer[];
  projects: Project[];
  stamps: StampMaster[];
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
  const [stampsJson, setStampsJson] = useState<string>(
    JSON.stringify(initial?.stamps ?? {}),
  );
  const [printOpts, setPrintOpts] = useState({
    printCompanyStamp: initial?.print_company_stamp ?? true,
    printStaffInfo: initial?.print_staff_info ?? true,
    printCompanyContact: initial?.print_company_contact ?? true,
  });

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
            placeholder="例: 〇〇ビル 配管工事 一式"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="見積番号(任意)">
            <input
              name="estimateNo"
              type="text"
              defaultValue={initial?.estimate_no ?? ""}
              placeholder="例: E-2026-001"
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

          <Field label="有効期限(任意)">
            <input
              name="expiryDate"
              type="date"
              defaultValue={initial?.expiry_date ?? ""}
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

      <div className="panel-pad space-y-3">
        <h3 className="text-[13px] font-bold text-navy">印鑑・印刷設定</h3>
        <StampSelector
          stamps={stamps}
          initialSelection={initial?.stamps ?? {}}
          initialPrintOptions={{
            printCompanyStamp: initial?.print_company_stamp ?? true,
            printStaffInfo: initial?.print_staff_info ?? true,
            printCompanyContact: initial?.print_company_contact ?? true,
          }}
          onChangeJson={setStampsJson}
          onChangePrintOptions={setPrintOpts}
        />
        <input type="hidden" name="stamps" value={stampsJson} />
        {/* checkbox の checked 状態を Server Action 側で 'on'/null 判定したいので
            個別の hidden field を出す代わりに、JS 経由で状態同期する小技 */}
        <input
          type="checkbox"
          name="printCompanyStamp"
          checked={printOpts.printCompanyStamp}
          onChange={() => {}}
          className="hidden"
          aria-hidden
        />
        <input
          type="checkbox"
          name="printStaffInfo"
          checked={printOpts.printStaffInfo}
          onChange={() => {}}
          className="hidden"
          aria-hidden
        />
        <input
          type="checkbox"
          name="printCompanyContact"
          checked={printOpts.printCompanyContact}
          onChange={() => {}}
          className="hidden"
          aria-hidden
        />
      </div>

      <div className="panel-pad">
        <Field label="備考(任意)">
          <textarea
            name="note"
            rows={3}
            defaultValue={initial?.note ?? ""}
            className="input"
            placeholder="支払条件・納期などの補足"
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Link
          href="/pc/estimates"
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
