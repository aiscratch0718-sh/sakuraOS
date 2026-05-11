import Link from "next/link";
import type { SiteSnapshot } from "@/features/dashboard/queries";

const COLORS = ["#16a34a", "#2563eb", "#f97316", "#7c3aed", "#ec4899", "#0f766e"];
const PIN_POSITIONS: Array<[number, number]> = [
  [124, 64],
  [218, 96],
  [50, 96],
  [146, 130],
  [94, 158],
];
const FALLBACK_NAMES = [
  "駅前ビル給排水改修",
  "マンション給湯設備工事",
  "商業施設配管更新",
  "物流倉庫排水工事",
  "マンション改修工事",
];

export function DispatchMapPreview({ sites }: { sites: SiteSnapshot[] }) {
  const top = (sites.length > 0 ? sites : []).slice(0, 5);
  const rows =
    top.length > 0
      ? top.map((s, i) => ({
          id: s.id,
          name: s.name,
          attendedToday: s.attendedToday,
          color: COLORS[i],
        }))
      : FALLBACK_NAMES.map((name, i) => ({
          id: `fallback-${i}`,
          name,
          attendedToday: [12, 8, 15, 7, 6][i],
          color: COLORS[i],
        }));

  return (
    <div className="dashboard-map-preview grid h-full grid-cols-2 gap-2">
      {/* 地図: Google Maps iframe 埋込(API キー不要)
          TODO(P12-01-map): 本実装で Google Maps JavaScript API + 自社 5 色ピン
          (各 site の座標で実描画)に切替。現状はクライアントデモ用の見栄え重視。 */}
      <div className="dashboard-map-canvas relative col-span-1 h-full overflow-hidden rounded-md border border-slate-200">
        <iframe
          title="配置マップ(東京エリア)"
          src="https://maps.google.com/maps?q=Tokyo+Station&t=&z=11&ie=UTF8&iwloc=&output=embed"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* レガシー SVG プレビュー(iframe 読込中のフォールバック背景には使わず、
            今後 API キー実装時に削除予定の参考コードとして下記コメントブロック保持) */}
        {false && (
        <svg
          viewBox="0 0 280 250"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          role="img"
          aria-label="配置マッププレビュー"
        >
          {/* 地図の基底色(用紙風ベージュ) */}
          <rect width="280" height="250" fill="#f3f0e7" />

          {/* 公園/緑地(柔らかい緑エリア) */}
          <path d="M0 0 L75 0 L70 38 L55 60 L25 70 L0 65 Z" fill="#dfeacd" opacity="0.85" />
          <path d="M195 165 L255 175 L268 215 L240 245 L200 240 L195 200 Z" fill="#dfeacd" opacity="0.85" />

          {/* 河川(柔らかい青、緩いカーブ) */}
          <path
            d="M-10 195 C 60 170 110 220 165 195 C 215 175 260 215 295 195 L 295 220 C 260 240 215 200 165 220 C 110 245 60 195 -10 220 Z"
            fill="#cfe2f3"
            opacity="0.85"
          />

          {/* ブロック(建物区画、薄いグレー矩形) */}
          <g fill="#e6e1d4" opacity="0.7">
            <rect x="20" y="20" width="40" height="22" rx="1" />
            <rect x="68" y="20" width="32" height="22" rx="1" />
            <rect x="108" y="20" width="44" height="22" rx="1" />
            <rect x="160" y="20" width="36" height="22" rx="1" />
            <rect x="204" y="20" width="56" height="22" rx="1" />

            <rect x="20" y="50" width="32" height="28" rx="1" />
            <rect x="60" y="50" width="44" height="28" rx="1" />
            <rect x="160" y="50" width="50" height="28" rx="1" />
            <rect x="220" y="50" width="40" height="28" rx="1" />

            <rect x="20" y="88" width="40" height="32" rx="1" />
            <rect x="68" y="88" width="32" height="20" rx="1" />
            <rect x="108" y="88" width="50" height="32" rx="1" />
            <rect x="220" y="88" width="40" height="32" rx="1" />

            <rect x="20" y="130" width="32" height="40" rx="1" />
            <rect x="60" y="130" width="44" height="24" rx="1" />
            <rect x="112" y="130" width="40" height="40" rx="1" />
            <rect x="160" y="130" width="36" height="24" rx="1" />
            <rect x="220" y="130" width="40" height="28" rx="1" />
          </g>

          {/* 街路グリッド(主要道路、白) */}
          <g stroke="#ffffff" strokeWidth="4" fill="none">
            {/* 横方向の主要道 */}
            <line x1="0" y1="46" x2="280" y2="46" />
            <line x1="0" y1="82" x2="280" y2="82" />
            <line x1="0" y1="124" x2="280" y2="124" />
            <line x1="0" y1="174" x2="280" y2="174" />
            {/* 縦方向の主要道 */}
            <line x1="62" y1="0" x2="62" y2="250" />
            <line x1="106" y1="0" x2="106" y2="250" />
            <line x1="156" y1="0" x2="156" y2="250" />
            <line x1="214" y1="0" x2="214" y2="250" />
          </g>

          {/* 街路グリッド外周線(薄いグレーで道のエッジ表現) */}
          <g stroke="#d4cfc1" strokeWidth="0.5" fill="none" opacity="0.7">
            <line x1="0" y1="44" x2="280" y2="44" />
            <line x1="0" y1="48" x2="280" y2="48" />
            <line x1="0" y1="80" x2="280" y2="80" />
            <line x1="0" y1="84" x2="280" y2="84" />
            <line x1="0" y1="122" x2="280" y2="122" />
            <line x1="0" y1="126" x2="280" y2="126" />
            <line x1="60" y1="0" x2="60" y2="250" />
            <line x1="64" y1="0" x2="64" y2="250" />
            <line x1="104" y1="0" x2="104" y2="250" />
            <line x1="108" y1="0" x2="108" y2="250" />
            <line x1="154" y1="0" x2="154" y2="250" />
            <line x1="158" y1="0" x2="158" y2="250" />
            <line x1="212" y1="0" x2="212" y2="250" />
            <line x1="216" y1="0" x2="216" y2="250" />
          </g>

          {/* 細街路(細い白の小路) */}
          <g stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8">
            <line x1="0" y1="62" x2="280" y2="62" />
            <line x1="0" y1="100" x2="280" y2="100" />
            <line x1="0" y1="148" x2="280" y2="148" />
            <line x1="86" y1="0" x2="86" y2="250" />
            <line x1="184" y1="0" x2="184" y2="250" />
            <line x1="240" y1="0" x2="240" y2="250" />
          </g>

          {/* ピン(現場マーカー、Google Maps 風) */}
          {rows.map((r, i) => {
            const [x, y] = PIN_POSITIONS[i] ?? [40 + i * 34, 70 + i * 18];
            return (
              <g
                key={r.id}
                filter="drop-shadow(0 2px 2px rgba(15,23,42,.22))"
              >
                {/* ピンの形:しずく */}
                <path
                  d={`M${x} ${y + 16} C${x - 13} ${y + 2}, ${x - 10} ${y - 14}, ${x} ${y - 14} C${x + 10} ${y - 14}, ${x + 13} ${y + 2}, ${x} ${y + 16}Z`}
                  fill={r.color}
                />
                {/* 中央の白丸 */}
                <circle cx={x} cy={y - 4} r="4.5" fill="#fff" />
              </g>
            );
          })}
        </svg>
        )}
      </div>

      {/* 右側: 現場一覧 */}
      <ul className="col-span-1 divide-y divide-slate-100">
        {rows.map((s) => (
          <li key={s.id}>
            <Link
              href={
                s.id.startsWith("fallback")
                  ? "/pc/projects"
                  : `/pc/projects/${s.id}`
              }
              className="flex min-h-[24px] items-center gap-2 rounded-md px-1 transition-colors hover:bg-slate-50"
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-700">
                {s.name}
              </span>
              <span className="whitespace-nowrap text-[11px] text-slate-600">
                {s.attendedToday}名
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
