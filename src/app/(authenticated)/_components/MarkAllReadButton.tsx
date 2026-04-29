"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/features/notifications/actions";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsRead();
          router.refresh();
        })
      }
      className="btn-ghost py-1.5 px-3 text-[11px] disabled:opacity-50"
    >
      {isPending ? "..." : "全て既読にする"}
    </button>
  );
}
