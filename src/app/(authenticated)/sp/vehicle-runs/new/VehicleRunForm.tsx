"use client";

import { useActionState, useEffect, useState } from "react";
import { createVehicleRun } from "@/features/vehicles/actions";
import type { VehicleActionResult } from "@/features/vehicles/actions";

type Vehicle = { id: string; plate_number: string; model: string | null };
type Project = { id: string; name: string };

const initialResult: VehicleActionResult = { ok: false };

export function VehicleRunForm({
  vehicles,
  projects,
}: {
  vehicles: Vehicle[];
  projects: Project[];
}) {
  const [state, formAction, isPending] = useActionState(
    createVehicleRun,
    initialResult,
  );

  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({});
  const [gpsState, setGpsState] = useState<"idle" | "fetching" | "ok" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsState("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsState("ok");
      },
      () => setGpsState("error"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const todayJp = (() => {
    const tokyo = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
    );
    return `${tokyo.getFullYear()}-${String(tokyo.getMonth() + 1).padStart(2, "0")}-${String(tokyo.getDate()).padStart(2, "0")}`;
  })();

  const fieldError = (name: string): string | undefined =>
    !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

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
            車両 <span className="text-red ml-1">*</span>
          </label>
          <select name="vehicleId" required className="input">
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate_number} {v.model ?? ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            運行日 <span className="text-red ml-1">*</span>
          </label>
          <input
            name="runDate"
            type="date"
            required
            defaultValue={todayJp}
            className="input"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            関連現場(任意)
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
            走行距離 (km) <span className="text-red ml-1">*</span>
          </label>
          <input
            name="distanceKm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            required
            placeholder="例: 32.5"
            className="input"
          />
        </div>
      </div>

      <div className="panel-pad space-y-3 bg-amber-bg/20">
        <h3 className="text-[12px] font-bold text-amber">
          🍺 アルコールチェック
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">
            結果 <span className="text-red ml-1">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <RadioCard name="alcoholResult" value="ok" label="OK" defaultChecked />
            <RadioCard name="alcoholResult" value="warning" label="警告" />
            <RadioCard name="alcoholResult" value="ng" label="NG(乗務不可)" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">
            測定値 (mg/L 任意)
          </label>
          <input
            name="alcoholValue"
            type="number"
            inputMode="decimal"
            step="0.001"
            min="0"
            placeholder="0.000"
            className="input"
          />
        </div>
      </div>

      <div className="panel-pad space-y-3">
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            異常報告(任意)
          </label>
          <textarea
            name="abnormal"
            rows={2}
            className="input"
            placeholder="例: 後部タイヤから異音"
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            備考(任意)
          </label>
          <textarea name="note" rows={2} className="input" />
        </div>

        {fieldError("distanceKm") && (
          <p className="text-[11px] text-red font-bold">
            走行距離: {fieldError("distanceKm")}
          </p>
        )}
      </div>

      {/* GPS hidden 自動取得 */}
      {gps.lat != null && gps.lng != null && (
        <>
          <input type="hidden" name="startLat" value={gps.lat} />
          <input type="hidden" name="startLng" value={gps.lng} />
        </>
      )}
      <p className="text-[10px] text-ink-3">
        GPS:{" "}
        {gpsState === "ok" && gps.lat != null
          ? `${gps.lat.toFixed(4)}, ${gps.lng?.toFixed(4)}`
          : gpsState === "fetching"
            ? "取得中..."
            : gpsState === "error"
              ? "取得失敗(保存は可能)"
              : "未取得"}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-3 text-[15px]"
      >
        {isPending ? "保存中..." : "記録する"}
      </button>
    </form>
  );
}

function RadioCard({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-center p-2 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${
        value === "ng" ? "text-red" : value === "warning" ? "text-amber" : "text-teal"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mr-1.5 accent-blue"
      />
      {label}
    </label>
  );
}
