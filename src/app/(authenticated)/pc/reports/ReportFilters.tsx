"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Project = { id: string; name: string };
type Worker = { id: string; display_name: string };

export type ReportStatus = "all" | "pending" | "approved" | "rejected" | "submitted";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済" },
  { value: "rejected", label: "差戻し" },
  { value: "submitted", label: "通常提出" },
];

export function ReportFilters({
  projects,
  workers,
}: {
  projects: Project[];
  workers: Worker[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get("from") ?? defaultFrom());
  const [to, setTo] = useState(params.get("to") ?? defaultTo());
  const [projectId, setProjectId] = useState(params.get("project") ?? "");
  const [userId, setUserId] = useState(params.get("user") ?? "");
  const [status, setStatus] = useState<ReportStatus>(
    (params.get("status") as ReportStatus) ?? "all",
  );

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (projectId) next.set("project", projectId);
    if (userId) next.set("user", userId);
    if (status && status !== "all") next.set("status", status);
    router.push(`/pc/reports${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function reset() {
    setFrom(defaultFrom());
    setTo(defaultTo());
    setProjectId("");
    setUserId("");
    setStatus("all");
    router.push("/pc/reports");
  }

  return (
    <form
      onSubmit={apply}
      className="panel-pad grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-4"
    >
      <Field label="開始日">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="終了日">
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="現場">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input"
        >
          <option value="">全て</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="作業員">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="input"
        >
          <option value="">全て</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.display_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="ステータス">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus)}
          className="input"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary py-2 px-4 text-[12px] flex-1">
          絞り込む
        </button>
        <button
          type="button"
          onClick={reset}
          className="btn-ghost py-2 px-3 text-[12px]"
        >
          リセット
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-ink-2 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function defaultFrom(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function defaultTo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
