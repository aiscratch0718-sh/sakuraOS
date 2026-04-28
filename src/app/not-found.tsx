import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-md panel-pad text-center">
        <div className="text-[11px] text-ink-3 font-bold tracking-wider mb-1">
          404
        </div>
        <h1 className="text-base font-extrabold text-navy mb-2">
          ページが見つかりません
        </h1>
        <p className="text-[12px] text-ink-2 mb-5">
          URL が変更されたか、削除された可能性があります。
        </p>
        <Link href="/" className="btn-primary inline-block py-2.5 px-6">
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
