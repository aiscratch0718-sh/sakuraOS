"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rejectReport3 } from "@/features/report3/actions/reject";

export function RejectButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!reason.trim()) {
      setError("差戻し理由を入力してください。");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectReport3(entryId, reason.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-red font-bold underline"
      >
        差戻し
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-10 w-72 panel-pad bg-white shadow-cardHover">
      <div className="text-[11px] font-bold text-ink-2 mb-1">差戻し理由</div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="例: 作業時間が現場長の確認と合いません。修正してください。"
        className="input text-[12px]"
      />
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red font-bold">
          {error}
        </p>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason("");
            setError(null);
          }}
          className="btn-ghost py-1 px-3 text-[11px] flex-1"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-red text-white px-3 py-1 rounded-btn text-[11px] font-bold flex-1 disabled:opacity-50"
        >
          {isPending ? "..." : "差戻す"}
        </button>
      </div>
    </div>
  );
}
