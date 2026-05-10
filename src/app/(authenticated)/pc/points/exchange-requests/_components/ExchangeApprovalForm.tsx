"use client";

import { useTransition } from "react";
import { approveExchange, rejectExchange } from "@/features/points/actions";

export function ExchangeApprovalForm({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("この交換申請を承認します。よろしいですか?")) return;
          startTransition(async () => {
            const result = await approveExchange(requestId);
            if (!result.ok) alert(result.error);
          });
        }}
        className="px-2.5 py-1 rounded-btn bg-p3 text-white text-[10px] font-bold hover:bg-p3/90 disabled:opacity-50"
      >
        承認
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const reason = prompt("却下理由を入力してください");
          if (!reason) return;
          startTransition(async () => {
            const result = await rejectExchange({ requestId, reason });
            if (!result.ok) alert(result.error);
          });
        }}
        className="px-2.5 py-1 rounded-btn bg-graybg border border-line text-p1 text-[10px] font-bold hover:bg-line/40 disabled:opacity-50"
      >
        却下
      </button>
    </div>
  );
}
