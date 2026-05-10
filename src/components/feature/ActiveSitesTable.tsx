import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SiteSnapshot } from "@/features/dashboard/queries";

const STATUS_META: Record<
  SiteSnapshot["status"],
  { label: string; variant: "p1" | "p2" | "p3" | "neutral" }
> = {
  on_track: { label: "順調", variant: "p3" },
  caution: { label: "注意", variant: "p2" },
  delayed: { label: "遅延", variant: "p1" },
  no_activity: { label: "未着手", variant: "neutral" },
};

/**
 * 本日稼働している現場の一覧テーブル。ダッシュボード用。
 */
export function ActiveSitesTable({ sites }: { sites: SiteSnapshot[] }) {
  if (sites.length === 0) {
    return (
      <p className="text-[12px] text-ink-3 py-8 text-center">
        本日まだ稼働している現場はありません。
      </p>
    );
  }

  // 月次時間の最大を 100% とした相対進捗
  const maxHours = Math.max(...sites.map((s) => s.monthHours), 40);

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>現場</th>
            <th>客先</th>
            <th className="text-right">本日出勤</th>
            <th>月次稼働</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <tr key={s.id}>
                <td className="font-bold">
                  <Link
                    href={`/pc/projects/${s.id}`}
                    className="hover:underline"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="text-[11px] text-ink-2">
                  {s.customerName ?? "—"}
                </td>
                <td className="text-right font-bold text-p3">
                  {s.attendedToday}
                  <span className="text-[10px] text-ink-3 ml-0.5">名</span>
                </td>
                <td className="min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ProgressBar
                        value={s.monthHours}
                        max={maxHours}
                        size="sm"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-ink-2 whitespace-nowrap">
                      {s.monthHours.toFixed(1)}h
                    </span>
                  </div>
                </td>
                <td>
                  <Tag variant={meta.variant}>{meta.label}</Tag>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
