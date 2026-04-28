"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { CustomerActionResult } from "@/features/master/schemas";

type Customer = {
  id?: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  is_active: boolean;
};

const initialResult: CustomerActionResult = { ok: false };

export function CustomerForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: Partial<Customer>;
  action: (
    prev: CustomerActionResult,
    formData: FormData,
  ) => Promise<CustomerActionResult>;
  submitLabel: string;
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
        <Field label="客先名" required error={fieldError("name")}>
          <input
            name="name"
            type="text"
            required
            defaultValue={initial?.name ?? ""}
            className="input"
          />
        </Field>

        <Field label="担当者" error={fieldError("contactPerson")}>
          <input
            name="contactPerson"
            type="text"
            defaultValue={initial?.contact_person ?? ""}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="電話番号" error={fieldError("phone")}>
            <input
              name="phone"
              type="tel"
              defaultValue={initial?.phone ?? ""}
              className="input"
              inputMode="tel"
            />
          </Field>

          <Field label="メールアドレス" error={fieldError("email")}>
            <input
              name="email"
              type="email"
              defaultValue={initial?.email ?? ""}
              className="input"
              inputMode="email"
            />
          </Field>
        </div>

        <Field label="住所" error={fieldError("address")}>
          <input
            name="address"
            type="text"
            defaultValue={initial?.address ?? ""}
            className="input"
          />
        </Field>

        <Field label="備考" error={fieldError("note")}>
          <textarea
            name="note"
            rows={3}
            defaultValue={initial?.note ?? ""}
            className="input"
          />
        </Field>

        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial?.is_active ?? true}
            className="w-4 h-4 accent-blue"
          />
          <span className="font-bold text-ink-2">アクティブ(現場登録時に選択肢に表示)</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Link
          href="/pc/customers"
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
