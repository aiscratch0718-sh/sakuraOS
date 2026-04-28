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
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn-teal py-1.5 px-3 text-[12px] font-bold"
      >
        {isPending ? "..." : "承認"}
      </button>
      {error && (
        <span role="alert" className="mt-1 text-[10px] text-red font-bold">
          {error}
        </span>
      )}
    </span>
  );
}
