"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertEstimateToInvoice } from "@/features/billing/actions/estimate";

export function ConvertToInvoiceButton({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !confirm(
        "この見積を請求書に変換します。\n明細と金額が請求書側にコピーされ、見積は「受注」になります。よろしいですか?",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await convertEstimateToInvoice(estimateId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/pc/invoices/${result.invoiceId}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn-teal py-2 px-4 text-[12px]"
      >
        {isPending ? "変換中..." : "🧾 請求書に変換"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
