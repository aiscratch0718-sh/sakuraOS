import type { ActivityItem } from "@/features/dashboard/queries";

const ACCENT_DOT: Record<ActivityItem["accent"], string> = {
  p1: "bg-p1",
  p2: "bg-p2",
  p3: "bg-p3",
  p4: "bg-p4",
  blue: "bg-blue",
};

/**
 * audit_log ベースの活動タイムライン。
 * 縦線 + 色付きドット + タイトル + サブテキスト + 時刻。
 */
export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-[12px] text-ink-3 py-6 text-center">
        まだ活動の記録はありません。
      </p>
    );
  }

  return (
    <div className="relative">
      {/* 縦線 */}
      <div
        aria-hidden
        className="absolute top-2 bottom-2 left-[7px] w-px bg-line"
      />
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="relative pl-6">
            {/* ドット */}
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-panel ${ACCENT_DOT[it.accent]}`}
            />
            <div className="text-[12px] font-bold text-ink leading-tight">
              {it.title}
            </div>
            <div className="text-[10px] text-ink-3 mt-0.5 leading-tight">
              {it.detail}
            </div>
            <time className="text-[10px] text-ink-3 mt-0.5 block">
              {formatRelative(it.occurredAt)}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRelative(iso: string): string {
  const dt = new Date(iso);
  const diffMs = Date.now() - dt.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "今しがた";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}日前`;
  return dt.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
