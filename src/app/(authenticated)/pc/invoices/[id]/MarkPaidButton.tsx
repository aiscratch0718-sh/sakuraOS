"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markInvoicePaid } from "@/features/billing/actions/invoice";

export function MarkPaidButton({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === "paid") {
    return null;
  }

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await markInvoicePaid(invoiceId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
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
        {isPending ? "..." : "💴 入金確認"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
