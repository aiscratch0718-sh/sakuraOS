import Link from "next/link";
import type { SiteSnapshot } from "@/features/dashboard/queries";

type DotState = "順調" | "進行中" | "注意" | "計画" | "遅延";

const DOT_STYLE: Record<DotState, { dot: string; fill: string; label: string }> = {
  順調: { dot: "bg-green-500", fill: "#22c55e", label: "順調" },
  進行中: { dot: "bg-blue-500", fill: "#3b82f6", label: "進行中" },
  注意: { dot: "bg-amber-500", fill: "#f59e0b", label: "注意" },
  計画: { dot: "bg-purple-500", fill: "#a855f7", label: "計画" },
  遅延: { dot: "bg-red-500", fill: "#ef4444", label: "遅延" },
};

/**
 * 進捗ステータスから 5 色のドットへマッピング。
 * SiteSnapshot.status (DB enum) + attendedToday から決定。
 */
function resolveDotState(s: SiteSnapshot): DotState {
  switch (s.status) {
    case "on_track":
      return s.monthHours >= 80 ? "順調" : "進行中";
    case "caution":
      return "注意";
    case "delayed":
      return "遅延";
    case "no_activity":
    default:
      return "計画";
  }
}

/**
 * 配置マップ プレビュー。地図は Google Maps が未導入のため SVG のプレースホルダ。
 * 現場ドットはステータス別に 5 色(順調=緑/進行中=青/注意=黄/計画=紫/遅延=赤)。
 * TODO(P12-01-data): @vis.gl/react-google-maps 導入後、本物の地図 + GPS ピンに差替え。
 */
export function DispatchMapPreview({ sites }: { sites: SiteSnapshot[] }) {
  const top = sites.slice(0, 6);
  const states: DotState[] = top.map(resolveDotState);

  return (
    <div className="grid grid-cols-5 gap-3">
      {/* 地図プレースホルダ */}
      <div className="col-span-3 relative rounded-lg overflow-hidden border border-gray-100 bg-slate-50 min-h-[180px]">
        <svg
          viewBox="0 0 200 140"
          className="w-full h-full"
          aria-label="配置マップ プレビュー(地図機能は実装予定)"
        >
          <rect width="200" height="140" fill="#f1f5f9" />
          {/* 簡易地形 */}
          <path d="M0,80 Q50,60 100,80 T200,70 L200,140 L0,140 Z" fill="#e2e8f0" />
          <path d="M0,100 Q60,90 120,100 T200,95 L200,140 L0,140 Z" fill="#cbd5e1" />
          {/* グリッドライン */}
          <g stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5">
            {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="140" />
            ))}
            {[20, 40, 60, 80, 100, 120].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} />
            ))}
          </g>
          {/* ピン (5 色) */}
          {top.map((s, i) => {
            const x = 30 + ((i * 47) % 150);
            const y = 30 + ((i * 31) % 80);
            const state = states[i] ?? resolveDotState(s);
            const fill = DOT_STYLE[state].fill;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6" fill={fill} opacity="0.25" />
                <circle cx={x} cy={y} r="3" fill={fill} />
              </g>
            );
          })}
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
          Map preview
        </span>
      </div>

      {/* 現場リスト */}
      <ul className="col-span-2 divide-y divide-gray-100">
        {top.length === 0 && (
          <li className="text-[11px] text-gray-400 py-2">
            稼働中の現場はありません
          </li>
        )}
        {top.map((s, i) => {
          const state = states[i] ?? resolveDotState(s);
          const style = DOT_STYLE[state];
          return (
            <li key={s.id}>
              <Link
                href={`/pc/projects/${s.id}`}
                className="flex items-center gap-2 px-1 py-2 hover:bg-gray-50 transition-colors"
              >
                <span
                  aria-hidden
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}
                />
                <span className="flex-1 text-[12px] text-gray-700 truncate">
                  {s.name}
                </span>
                <span
                  className="text-[10px] text-gray-400 whitespace-nowrap"
                  aria-label={`ステータス: ${style.label}`}
                >
                  {style.label}
                </span>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {s.attendedToday}名
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
