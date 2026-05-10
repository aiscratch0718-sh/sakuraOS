import Link from "next/link";

type Notice = {
  id: string;
  date: string;
  title: string;
  level: "info" | "important";
};

/**
 * お知らせパネル。
 * TODO(P12-01-data): notices テーブル + 既読管理。現状は暫定モック。
 */
export function NoticesPanel({ notices }: { notices?: Notice[] }) {
  const data: Notice[] = notices ?? [
    {
      id: "1",
      date: "2026-05-09",
      title: "【重要】システムメンテナンスのお知らせ(6/1 22:00〜翌5:00)",
      level: "important",
    },
    {
      id: "2",
      date: "2026-05-07",
      title: "REPORT3 入力フローの更新について",
      level: "info",
    },
    {
      id: "3",
      date: "2026-05-02",
      title: "5月の安全衛生月間 開始のご案内",
      level: "info",
    },
  ];

  return (
    <div>
      <ul className="divide-y divide-line">
        {data.map((n) => (
          <li key={n.id} className="py-2 flex items-center gap-2">
            <span className="text-[10px] text-ink-3 tabular-nums w-20 flex-shrink-0">
              {n.date}
            </span>
            {n.level === "important" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-bg text-red flex-shrink-0">
                重要
              </span>
            )}
            <span className="flex-1 text-[12px] text-ink truncate">
              {n.title}
            </span>
          </li>
        ))}
      </ul>
      <div className="text-right pt-1">
        <Link
          href="/pc/notices"
          className="text-[11px] text-blue hover:underline"
        >
          すべてのお知らせを見る →
        </Link>
      </div>
    </div>
  );
}
