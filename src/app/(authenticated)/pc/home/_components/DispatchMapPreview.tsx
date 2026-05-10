import Link from "next/link";
import type { SiteSnapshot } from "@/features/dashboard/queries";

/**
 * 配置マップ プレビュー。地図は Google Maps が未導入のため SVG のプレースホルダ。
 * TODO(P12-01-data): @vis.gl/react-google-maps 導入後、本物の地図 + GPS ピンに差替え。
 */
export function DispatchMapPreview({ sites }: { sites: SiteSnapshot[] }) {
  const top = sites.slice(0, 6);

  return (
    <div className="grid grid-cols-5 gap-3">
      {/* 地図プレースホルダ */}
      <div className="col-span-3 relative rounded-card overflow-hidden border border-line bg-bg min-h-[180px]">
        <svg
          viewBox="0 0 200 140"
          className="w-full h-full"
          aria-label="配置マップ プレビュー(地図機能は実装予定)"
        >
          <rect width="200" height="140" fill="#e8f0f8" />
          {/* 簡易地形 */}
          <path d="M0,80 Q50,60 100,80 T200,70 L200,140 L0,140 Z" fill="#d0e4f5" />
          <path d="M0,100 Q60,90 120,100 T200,95 L200,140 L0,140 Z" fill="#b8d4ee" />
          {/* グリッドライン */}
          <g stroke="#c8d8e8" strokeWidth="0.5" opacity="0.5">
            {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="140" />
            ))}
            {[20, 40, 60, 80, 100, 120].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} />
            ))}
          </g>
          {/* ピン */}
          {top.map((_, i) => {
            const x = 30 + ((i * 47) % 150);
            const y = 30 + ((i * 31) % 80);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6" fill="#e03030" opacity="0.3" />
                <circle cx={x} cy={y} r="3" fill="#e03030" />
              </g>
            );
          })}
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-ink-3 bg-panel/80 px-1.5 py-0.5 rounded">
          Map preview
        </span>
      </div>

      {/* 現場リスト */}
      <ul className="col-span-2 space-y-1.5">
        {top.length === 0 && (
          <li className="text-[11px] text-ink-3">
            稼働中の現場はありません
          </li>
        )}
        {top.map((s) => (
          <li key={s.id}>
            <Link
              href={`/pc/projects/${s.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-btn hover:bg-panel2 transition-colors"
            >
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-red flex-shrink-0"
              />
              <span className="flex-1 text-[11px] text-ink truncate">
                {s.name}
              </span>
              <span className="text-[10px] font-bold text-blue bg-blue-bg px-1.5 py-0.5 rounded">
                {s.attendedToday}名
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
