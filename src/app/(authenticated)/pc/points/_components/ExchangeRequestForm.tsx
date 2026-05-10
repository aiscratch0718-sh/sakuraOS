"use client";

import { useTransition } from "react";
import { requestExchange } from "@/features/points/actions";

export function ExchangeRequestForm({
  rewardId,
  rewardName,
  canAfford,
  lacking,
}: {
  rewardId: string;
  rewardName: string;
  canAfford: boolean;
  lacking: number;
}) {
  const [pending, startTransition] = useTransition();

  if (!canAfford) {
    return (
      <span className="text-[10px] text-ink-3 font-bold">
        あと {lacking.toLocaleString("ja-JP")}pt
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`「${rewardName}」と交換を申請しますか?`)) return;
        startTransition(async () => {
          const result = await requestExchange(rewardId);
          if (!result.ok) {
            alert(result.error);
          } else {
            alert("申請しました。管理者の承認をお待ちください。");
          }
        });
      }}
      className="px-3 py-1.5 rounded-btn bg-p4 text-white text-[11px] font-bold hover:bg-p4/90 transition-colors disabled:opacity-50"
    >
      {pending ? "送信中…" : "交換申請"}
    </button>
  );
}
