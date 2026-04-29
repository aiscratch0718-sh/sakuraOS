"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { UserActionResult } from "@/features/master/schemas-user";

type Profile = {
  id?: string;
  display_name: string;
  role: string;
  hourly_rate_cents: number | null;
  email?: string | null;
};

const ROLE_OPTIONS = [
  { value: "worker", label: "作業員" },
  { value: "leader", label: "現場リーダー" },
  { value: "office", label: "事務" },
  { value: "ceo", label: "経営層" },
];

const initialResult: UserActionResult = { ok: false };

export function UserForm({
  mode,
  initial,
  action,
  submitLabel,
}: {
  mode: "create" | "update";
  initial?: Partial<Profile>;
  action: (
    prev: UserActionResult,
    formData: FormData,
  ) => Promise<UserActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialResult);

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  const initialYen =
    typeof initial?.hourly_rate_cents === "number"
      ? Math.round(initial.hourly_rate_cents / 100).toString()
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
        {mode === "create" && (
          <>
            <Field label="メールアドレス" required error={fieldError("email")}>
              <input
                name="email"
                type="email"
                required
                className="input"
                inputMode="email"
                autoComplete="off"
              />
              <p className="text-[10px] text-ink-3 mt-1">
                ログインに使用します。後から変更はできません。
              </p>
            </Field>

            <Field label="初期パスワード" required error={fieldError("password")}>
              <input
                name="password"
                type="text"
                required
                minLength={8}
                className="input font-mono"
                autoComplete="off"
              />
              <p className="text-[10px] text-ink-3 mt-1">
                8文字以上。本人がログイン後に変更してもらってください。
              </p>
            </Field>
          </>
        )}

        {mode === "update" && initial?.email && (
          <Field label="メールアドレス">
            <div className="input bg-graybg text-ink-2">{initial.email}</div>
            <p className="text-[10px] text-ink-3 mt-1">
              ログインアドレスは変更できません(将来の機能で対応予定)。
            </p>
          </Field>
        )}

        <Field label="表示名" required error={fieldError("displayName")}>
          <input
            name="displayName"
            type="text"
            required
            defaultValue={initial?.display_name ?? ""}
            className="input"
          />
        </Field>

        <Field label="ロール" required error={fieldError("role")}>
          <select
            name="role"
            defaultValue={initial?.role ?? "worker"}
            className="input"
            required
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-ink-3 mt-1">
            作業員/現場リーダーはモバイル UI に、事務/経営層は PC ダッシュボードに振り分けられます。
          </p>
        </Field>

        <Field label="時給(円)" error={fieldError("hourlyRateYen")}>
          <input
            name="hourlyRateYen"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={initialYen}
            className="input"
            placeholder="例: 2500"
          />
          <p className="text-[10px] text-ink-3 mt-1">
            REPORT3 提出時の人件費自動計算に使用されます。空欄なら 0 円扱い。
          </p>
        </Field>
      </div>

      <div className="flex gap-2">
        <Link
          href="/pc/users"
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
