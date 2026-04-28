"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rejectReport3 } from "@/features/report3/actions/reject";

/**
 * モバイル(/sp/approvals)向けの差戻しボタン。
 * 折りたたみ式で理由を入力させる。承認ボタンと並列に並ぶ想定。
 */
export function RejectButton({
  entryId,
  className = "",
}: {
  entryId: string;
  className?: string;
}) {
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
        className={`bg-red-bg text-red border border-red/30 py-2 px-3 rounded-btn text-[12px] font-bold ${className}`}
      >
        差戻し
      </button>
    );
  }

  return (
    <div className="panel-pad bg-red-bg/30 border-red/30 mt-2">
      <div className="text-[11px] font-bold text-red mb-1">差戻し理由</div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="例: 作業時間が現場長の記録と異なります。"
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
          className="btn-ghost py-2 px-3 text-[12px] flex-1"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-red text-white px-3 py-2 rounded-btn text-[12px] font-bold flex-1 disabled:opacity-50"
        >
          {isPending ? "..." : "差戻す"}
        </button>
      </div>
    </div>
  );
}
