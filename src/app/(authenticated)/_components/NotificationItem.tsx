"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/features/notifications/actions";

const CATEGORY_META: Record<string, { icon: string; cls: string }> = {
  approval: { icon: "✓", cls: "border-amber" },
  incident: { icon: "⚠", cls: "border-red" },
  coin: { icon: "🪙", cls: "border-teal" },
  reminder: { icon: "🔔", cls: "border-blue" },
  system: { icon: "⚙️", cls: "border-purple" },
};

export function NotificationItem({
  id,
  category,
  title,
  body,
  linkUrl,
  readAt,
  createdAt,
}: {
  id: string;
  category: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const meta = CATEGORY_META[category] ?? CATEGORY_META.system;
  const isRead = !!readAt;

  function handleClick(e: React.MouseEvent) {
    if (!isRead) {
      // 既読化(楽観的)
      startTransition(async () => {
        await markNotificationRead(id);
      });
    }
    if (!linkUrl) {
      e.preventDefault();
    }
  }

  const Inner = (
    <div
      className={`panel-pad border-l-4 ${meta?.cls ?? "border-line"} ${
        isRead ? "opacity-60" : ""
      } ${linkUrl ? "hover:bg-blue-bg/30 cursor-pointer transition-colors" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-[18px]" aria-hidden>
          {meta?.icon ?? "ℹ"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[13px] font-bold truncate">{title}</div>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-blue inline-block ml-2 shrink-0" />
            )}
          </div>
          {body && (
            <div className="text-[12px] text-ink-2 line-clamp-2">{body}</div>
          )}
          <div className="text-[10px] text-ink-3 mt-1">
            {new Date(createdAt).toLocaleString("ja-JP")}
          </div>
        </div>
      </div>
    </div>
  );

  if (linkUrl) {
    return (
      <Link href={linkUrl} onClick={handleClick} prefetch={false}>
        {Inner}
      </Link>
    );
  }
  void isPending;
  void router;
  return <div onClick={handleClick}>{Inner}</div>;
}
