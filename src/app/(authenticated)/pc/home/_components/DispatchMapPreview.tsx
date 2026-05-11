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
    <div className="grid grid-cols-5 gap-4">
      <div className="relative col-span-3 min-h-[190px] overflow-hidden rounded-md border border-slate-200 bg-[#eef3ee]">
        <svg viewBox="0 0 280 190" className="h-full w-full" role="img" aria-label="配置マッププレビュー">
          <rect width="280" height="190" fill="#eef3ee" />
          <g stroke="#d5ded8" strokeWidth="2">
            <path d="M-20 42 C42 34 70 74 128 65 C190 54 216 24 302 28" />
            <path d="M-10 116 C42 84 86 98 132 122 C174 144 225 131 294 98" />
            <path d="M64 -10 C74 43 64 78 92 114 C118 148 116 164 108 206" />
            <path d="M178 -12 C159 34 164 70 190 98 C214 124 220 151 212 202" />
          </g>
          <g stroke="#ffffff" strokeWidth="5" opacity="0.85">
            <path d="M30 0 L120 190" />
            <path d="M0 154 L280 44" />
          </g>
          {rows.map((r, i) => {
            const [x, y] = PIN_POSITIONS[i] ?? [40 + i * 34, 70 + i * 18];
            return (
              <g key={r.id}>
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

      <ul className="col-span-2 divide-y divide-slate-100">
        {rows.map((s) => (
          <li key={s.id}>
            <Link
              href={s.id.startsWith("fallback") ? "/pc/projects" : `/pc/projects/${s.id}`}
              className="flex min-h-[37px] items-center gap-2 rounded-md px-1 transition-colors hover:bg-slate-50"
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
