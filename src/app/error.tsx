"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side log hook would go here in production.
    // For Phase B we just surface to the developer console.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-md panel-pad">
        <div className="text-[11px] text-red font-bold tracking-wider mb-1">
          ERROR
        </div>
        <h1 className="text-base font-extrabold text-navy mb-2">
          画面の読み込みに失敗しました
        </h1>
        <p className="text-[12px] text-ink-2 mb-4">
          一時的な問題の可能性があります。再読み込みしても解消しない場合は、事務にお問い合わせください。
        </p>
        {error.digest && (
          <p className="text-[10px] text-ink-3 font-mono mb-4 break-all">
            ID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="btn-primary w-full py-2.5"
        >
          もう一度試す
        </button>
      </div>
    </main>
  );
}
