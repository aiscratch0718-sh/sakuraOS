"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveReport3 } from "@/features/report3/actions/approve";

export function ApproveButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await approveReport3(entryId);
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
        className="btn-teal w-full py-2.5 text-[13px] font-bold"
      >
        {isPending ? "処理中..." : "承認する"}
      </button>
      {error && (
        <div role="alert" className="mt-2 text-[11px] text-red font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
