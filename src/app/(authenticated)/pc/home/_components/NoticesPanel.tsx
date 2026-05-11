import Link from "next/link";

type Notice = {
  id: string;
  date: string;
  title: string;
  level: "info" | "important";
};

export function NoticesPanel({ notices }: { notices?: Notice[] }) {
  // TODO(P12-01-data): 本実装まで暫定。notices テーブルから取得に置き換える
  const data: Notice[] = notices ?? [
    {
      id: "1",
      date: "2026/05/28",
      title: "システムメンテナンス(6/1 22:00〜翌5:00)",
      level: "important",
    },
    {
      id: "2",
      date: "2026/05/27",
      title: "REPORT3 入力フローの一部改修について",
      level: "info",
    },
    {
      id: "3",
      date: "2026/05/26",
      title: "5月の安全衛生月間 開始のご案内",
      level: "info",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <ul className="min-w-0 flex-1 divide-y divide-slate-100">
        {data.map((n) => (
          <li key={n.id} className="flex items-center gap-2 py-1">
            <span className="w-[68px] flex-shrink-0 text-[10px] text-slate-500">{n.date}</span>
            {n.level === "important" && (
              <span className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-1.5 py-0 text-[10px] font-bold text-red-700">
                【重要】
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-800">
              {n.title}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/pc/notices"
        className="mt-1 self-end text-[10px] font-bold text-blue-700"
      >
        すべてのお知らせを見る ›
      </Link>
    </div>
  );
}
