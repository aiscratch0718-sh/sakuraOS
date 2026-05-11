import Link from "next/link";

type Notice = {
  id: string;
  date: string;
  title: string;
  level: "info" | "important";
};

export function NoticesPanel({ notices }: { notices?: Notice[] }) {
  const data: Notice[] = notices ?? [
    {
      id: "1",
      date: "2026/05/28",
      title: "システムメンテナンスのお知らせ（6/1 22:00〜翌5:00）",
      level: "important",
    },
  ];

  return (
    <div className="flex h-full items-center">
      <ul className="min-w-0 flex-1">
        {data.map((n) => (
          <li key={n.id} className="flex items-center gap-4">
            <span className="w-24 flex-shrink-0 text-[13px] text-slate-500">{n.date}</span>
            {n.level === "important" && (
              <span className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] font-bold text-red-700">
                【重要】
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">{n.title}</span>
          </li>
        ))}
      </ul>
      <Link href="/pc/notices" className="ml-4 flex-shrink-0 text-[12px] font-bold text-blue-700">
        すべてのお知らせを見る ›
      </Link>
    </div>
  );
}
