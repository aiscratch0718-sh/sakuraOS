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
      <div className="dashboard-map-canvas relative col-span-1 h-full overflow-hidden rounded-md border border-slate-200 bg-[#eef3ee]">
        <svg viewBox="0 0 280 190" className="h-full w-full" role="img" aria-label="配置マッププレビュー">
          <rect width="280" height="190" fill="#eef3ee" />
          <g opacity="0.45">
            <path d="M0,142 C48,126 84,142 130,132 C184,120 218,132 280,108 L280,190 L0,190 Z" fill="#dbe7df" />
            <path d="M0,52 C46,42 83,56 128,45 C180,32 224,38 280,24 L280,0 L0,0 Z" fill="#f5efe4" />
          </g>
          <g stroke="#ccd9d2" strokeWidth="1" opacity="0.75">
            {[20, 46, 72, 98, 124, 150, 176, 202, 228, 254].map((x) => (
              <path key={`v${x}`} d={`M${x} -8 C${x - 8} 38 ${x + 9} 74 ${x - 3} 116 C${x - 12} 146 ${x + 4} 170 ${x} 202`} />
            ))}
            {[20, 44, 68, 92, 116, 140, 164].map((y) => (
              <path key={`h${y}`} d={`M-10 ${y} C54 ${y - 9} 94 ${y + 12} 146 ${y + 2} C200 ${y - 9} 236 ${y + 2} 292 ${y - 5}`} />
            ))}
          </g>
          <g stroke="#ffffff" strokeWidth="5" opacity="0.95">
            <path d="M-20 42 C42 34 70 74 128 65 C190 54 216 24 302 28" />
            <path d="M-10 116 C42 84 86 98 132 122 C174 144 225 131 294 98" />
            <path d="M64 -10 C74 43 64 78 92 114 C118 148 116 164 108 206" />
            <path d="M178 -12 C159 34 164 70 190 98 C214 124 220 151 212 202" />
          </g>
          <g stroke="#c6d2d6" strokeWidth="1.2" opacity="0.85">
            <path d="M30 0 L120 190" />
            <path d="M0 154 L280 44" />
          </g>
          {rows.map((r, i) => {
            const [x, y] = PIN_POSITIONS[i] ?? [40 + i * 34, 70 + i * 18];
            return (
              <g key={r.id} filter="drop-shadow(0 3px 3px rgba(15,23,42,.18))">
                <path
                  d={`M${x} ${y + 18} C${x - 14} ${y + 2}, ${x - 10} ${y - 16}, ${x} ${y - 16} C${x + 10} ${y - 16}, ${x + 14} ${y + 2}, ${x} ${y + 18}Z`}
                  fill={r.color}
                />
                <circle cx={x} cy={y - 4} r="5" fill="#fff" />
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="col-span-1 divide-y divide-slate-100">
        {rows.map((s) => (
          <li key={s.id}>
            <Link
              href={s.id.startsWith("fallback") ? "/pc/projects" : `/pc/projects/${s.id}`}
              className="flex min-h-[24px] items-center gap-2 rounded-md px-1 transition-colors hover:bg-slate-50"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-700">
                {s.name}
              </span>
              <span className="whitespace-nowrap text-[12px] text-slate-600">
                {s.attendedToday}名
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
