"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkoutTool, returnTool } from "@/features/tools/actions";

type Project = { id: string; name: string };

export function ToolActionButtons({
  toolId,
  status,
  isMine,
  projects,
}: {
  toolId: string;
  status: string;
  isMine: boolean;
  projects: Project[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showProject, setShowProject] = useState(false);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");

  async function tryGetGps(): Promise<{ lat?: number; lng?: number }> {
    if (!navigator.geolocation) return {};
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({}),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    });
  }

  function doCheckout() {
    setError(null);
    startTransition(async () => {
      const gps = await tryGetGps();
      const fd = new FormData();
      if (projectId) fd.set("projectId", projectId);
      if (gps.lat != null) fd.set("lat", String(gps.lat));
      if (gps.lng != null) fd.set("lng", String(gps.lng));
      const result = await checkoutTool(toolId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowProject(false);
      router.refresh();
    });
  }

  function doReturn() {
    setError(null);
    startTransition(async () => {
      const gps = await tryGetGps();
      const fd = new FormData();
      if (gps.lat != null) fd.set("lat", String(gps.lat));
      if (gps.lng != null) fd.set("lng", String(gps.lng));
      const result = await returnTool(toolId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (status === "in_warehouse") {
    return (
      <div className="space-y-2">
        {showProject ? (
          <div className="space-y-2">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input text-[12px]"
            >
              <option value="">— 現場を選択(任意) —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProject(false)}
                className="btn-ghost py-1.5 px-3 text-[11px] flex-1"
              >
                キャンセル
              </button>
              <button
                onClick={doCheckout}
                disabled={isPending}
                className="btn-primary py-1.5 px-3 text-[11px] flex-1"
              >
                {isPending ? "..." : "持出する"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowProject(true)}
            className="btn-primary w-full py-2 text-[12px]"
          >
            🛠️ 持出
          </button>
        )}
        {error && (
          <p role="alert" className="text-[10px] text-red font-bold">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (status === "checked_out" && isMine) {
    return (
      <div>
        <button
          onClick={doReturn}
          disabled={isPending}
          className="btn-teal w-full py-2 text-[12px]"
        >
          {isPending ? "..." : "↩ 返却する"}
        </button>
        {error && (
          <p role="alert" className="text-[10px] text-red font-bold mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className="text-[10px] text-ink-3">
      {status === "checked_out" ? "他の人が持出中" : "操作不可"}
    </span>
  );
}
