"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { ProjectRow, ProjectStatus } from "../../projects/_data/mock-projects";
import { STATUS_META } from "../../projects/_data/mock-projects";

/* ============================================================
   抽象 MapView コンポーネント
   ============================================================

   将来 Google Maps JavaScript API に移行する場合、このファイルだけ
   書き換えれば呼び出し側(DispatchMapClient.tsx)は無変更で動作する。

   現在の実装: Leaflet + OpenStreetMap タイル(API キー不要、完全無料)

   移行時に行うこと:
   1. このファイルの内部実装を @vis.gl/react-google-maps に書き換え
   2. props (MapViewProps) は変更不要
   3. DispatchMapClient.tsx の <MapView /> 呼び出しも変更不要
   ============================================================ */

/** マップピン色(状態に基づく)— 配置マップ凡例と一致 */
export const PIN_COLOR_BY_STATUS: Record<ProjectStatus, string> = {
  active: "#2563eb", // 青(進行中)
  delayed: "#ef4444", // 赤(遅延)
  upcoming: "#f59e0b", // 橙(完了予定)
  completed: "#10b981", // 緑(完了済)
};

export type MapViewProps = {
  /** 表示する案件 (フィルター済) */
  projects: ProjectRow[];
  /** 選択中の案件 id */
  selectedId: string;
  /** ピンクリック時のコールバック */
  onSelect: (id: string) => void;
  /** マップ中心 lat / lng(初期表示) */
  center: { lat: number; lng: number };
  /** ズームレベル(初期表示) */
  zoom: number;
};

/**
 * Leaflet マップ本体(react-leaflet 5 + OpenStreetMap タイル)
 *
 * Leaflet は window を参照するため SSR では描画できない。
 * 呼び出し側で `next/dynamic({ ssr: false })` でラップして使用すること。
 */
export default function MapView({
  projects,
  selectedId,
  onSelect,
  center,
  zoom,
}: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: 460 }}
      aria-label="配置マップ(宮城県、案件ピン)"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={createPinIcon(PIN_COLOR_BY_STATUS[p.status], selectedId === p.id)}
          eventHandlers={{
            click: () => onSelect(p.id),
            keypress: (e: { originalEvent: KeyboardEvent }) => {
              if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") {
                onSelect(p.id);
              }
            },
          }}
          alt={`${p.name}(${STATUS_META[p.status].label})`}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-500">{p.workType}</div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIN_COLOR_BY_STATUS[p.status] }}
                />
                <span className="text-xs font-medium text-slate-700">
                  {STATUS_META[p.status].label}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                {p.address.replace(/^宮城県/, "")}
              </div>
              <div className="text-[10px] text-slate-600">
                {p.leader} / {p.crew}名 / 進捗 {p.progressPct}%
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 選択中の案件にマップを追従させる(別案件選択時にスムーズパン) */}
      <RecenterOnSelect projects={projects} selectedId={selectedId} />
    </MapContainer>
  );
}

/* ============================================================
   ヘルパー: 色付きしずく型ピンアイコンの生成
   ============================================================ */

/**
 * Google Maps 風のしずく型 + 中央白丸 SVG ピン。
 * 選択中はサイズを 1.3 倍 + 影を強くする。
 */
function createPinIcon(color: string, isActive: boolean): L.DivIcon {
  const w = isActive ? 36 : 28;
  const h = isActive ? 48 : 38;
  const shadow = isActive ? "0 6px 8px rgba(0,0,0,0.35)" : "0 3px 4px rgba(0,0,0,0.25)";
  const html = `
    <div style="
      width:${w}px;height:${h}px;
      filter: drop-shadow(${shadow});
      position:relative;
      transition: transform 0.15s ease-out;
      ${isActive ? "transform: scale(1.05);" : ""}
    ">
      <svg width="${w}" height="${h}" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 36 C2 22, 0 14, 0 11 A14 14 0 1 1 28 11 C28 14, 26 22, 14 36 Z"
          fill="${color}"
          stroke="#ffffff"
          stroke-width="2"
        />
        <circle cx="14" cy="12" r="5" fill="#ffffff" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "sakura-map-pin",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 8],
  });
}

/* ============================================================
   選択案件が変わった時にマップ中心を追従させる内部コンポーネント
   ============================================================ */

function RecenterOnSelect({
  projects,
  selectedId,
}: {
  projects: ProjectRow[];
  selectedId: string;
}) {
  const map = useMap();
  const prevIdRef = useRef<string>("");

  useEffect(() => {
    if (!selectedId || selectedId === prevIdRef.current) return;
    const target = projects.find((p) => p.id === selectedId);
    if (!target) return;
    prevIdRef.current = selectedId;
    // ズーム維持で中心移動(ユーザーが引いて見ていれば引いたまま)
    map.panTo([target.lat, target.lng], { animate: true, duration: 0.6 });
  }, [selectedId, projects, map]);

  return null;
}
