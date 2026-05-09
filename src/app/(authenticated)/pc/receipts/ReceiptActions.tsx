"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveReceipt, markReimbursementPaid } from "@/features/receipts/actions";

export function ReceiptActions({
  receiptId,
  isReviewed,
  needsReimbursement,
  reimbursementStatus,
}: {
  receiptId: string;
  isReviewed: boolean;
  needsReimbursement: boolean;
  reimbursementStatus: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function review() {
    startTransition(async () => {
      const fd = new FormData();
      const r = await approveReceipt(receiptId, fd);
      if (r.ok) router.refresh();
    });
  }

  function pay() {
    startTransition(async () => {
      const r = await markReimbursementPaid(receiptId);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      {!isReviewed && (
        <button
          type="button"
          onClick={review}
          disabled={isPending}
          className="text-[10px] bg-teal text-white px-2 py-1 rounded-btn font-bold disabled:opacity-50"
        >
          確認
        </button>
      )}
      {isReviewed && needsReimbursement && reimbursementStatus !== "paid" && (
        <button
          type="button"
          onClick={pay}
          disabled={isPending}
          className="text-[10px] bg-purple text-white px-2 py-1 rounded-btn font-bold disabled:opacity-50"
        >
          精算実行
        </button>
      )}
    </div>
  );
}
