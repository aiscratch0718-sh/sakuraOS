"use client";

import { useActionState, useEffect, useState } from "react";
import { createIncident, type IncidentActionResult } from "@/features/incidents/actions";

type Project = { id: string; name: string };

const initialResult: IncidentActionResult = { ok: false };

const SEVERITIES: { value: string; label: string; cls: string }[] = [
  { value: "low", label: "低", cls: "border-blue text-blue" },
  { value: "medium", label: "中", cls: "border-amber text-amber" },
  { value: "high", label: "高", cls: "border-red text-red" },
  { value: "critical", label: "緊急", cls: "border-red text-red bg-red-bg/30" },
];

const CATEGORIES = [
  "転倒・墜落",
  "工具・機械",
  "車両",
  "電気",
  "高所作業",
  "重量物",
  "化学物質",
  "その他",
];

export function IncidentForm({ projects }: { projects: Project[] }) {
  const [state, formAction, isPending] = useActionState(
    createIncident,
    initialResult,
  );
  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({});

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  const fieldError = (n: string) =>
    !state.ok ? state.fieldErrors?.[n]?.[0] : undefined;

  const nowIso = (() => {
    const tokyo = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
    );
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${tokyo.getFullYear()}-${pad(tokyo.getMonth() + 1)}-${pad(tokyo.getDate())}T${pad(tokyo.getHours())}:${pad(tokyo.getMinutes())}`;
  })();

  return (
    <form action={formAction} className="space-y-3">
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
            発生日時 <span className="text-red ml-1">*</span>
          </label>
          <input
            name="occurredAt"
            type="datetime-local"
            required
            defaultValue={nowIso}
            className="input"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            危険度 <span className="text-red ml-1">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SEVERITIES.map((s, i) => (
              <label
                key={s.value}
                className={`flex items-center justify-center p-2 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${s.cls}`}
              >
                <input
                  type="radio"
                  name="severity"
                  value={s.value}
                  defaultChecked={i === 1}
                  className="mr-1.5 accent-blue"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            現場(任意)
          </label>
          <select name="projectId" className="input">
            <option value="">— 選択しない —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            カテゴリ
          </label>
          <select name="category" className="input">
            <option value="">— 選択しない —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel-pad space-y-3">
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            何が起こりそうになったか <span className="text-red ml-1">*</span>
          </label>
          <textarea
            name="whatHappened"
            rows={4}
            required
            placeholder="例: 足場の上で工具を取り損ねて落としそうになった"
            className="input"
          />
          {fieldError("whatHappened") && (
            <p className="mt-1 text-[11px] text-red font-bold">
              {fieldError("whatHappened")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            なぜ起こりそうになったか
          </label>
          <textarea
            name="whyHappened"
            rows={3}
            placeholder="例: 工具をベルトに固定していなかった"
            className="input"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            今後の対策
          </label>
          <textarea
            name="countermeasure"
            rows={3}
            placeholder="例: 高所では工具にストラップを付ける運用を徹底する"
            className="input"
          />
        </div>
      </div>

      {gps.lat != null && (
        <>
          <input type="hidden" name="photoLat" value={gps.lat} />
          <input type="hidden" name="photoLng" value={gps.lng ?? ""} />
        </>
      )}
      <p className="text-[10px] text-ink-3">
        {gps.lat != null
          ? `📍 GPS 取得済 (${gps.lat.toFixed(4)}, ${gps.lng?.toFixed(4)})`
          : "📍 GPS 未取得(保存は可能)"}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-3 text-[15px]"
      >
        {isPending ? "送信中..." : "報告する(+30 XP)"}
      </button>
    </form>
  );
}
