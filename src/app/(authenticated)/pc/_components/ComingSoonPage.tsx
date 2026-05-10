import Link from "next/link";

/**
 * 未実装画面用のプレースホルダ。
 * Phase 12 の各画面実装が完了するまで暫定で表示する。
 *
 * 例: <ComingSoonPage title="原価管理" phaseId="P12-05" estimatedDate="2026年6月" />
 */
export function ComingSoonPage({
  title,
  description,
  phaseId,
  estimatedDate,
  backHref = "/pc/home",
}: {
  title: string;
  description?: string;
  phaseId?: string;
  estimatedDate?: string;
  backHref?: string;
}) {
  return (
    <div className="px-8 py-12 max-w-3xl mx-auto">
      <div className="bg-panel border border-line rounded-cardLg shadow-card p-10 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--report3-from, #e8516a) 0%, var(--report3-to, #f5a45a) 100%)",
          }}
          aria-hidden
        >
          <span className="text-white text-[28px]">🚧</span>
        </div>
        <h1 className="text-[20px] font-extrabold text-navy mb-2">
          {title}
          <span className="ml-2 text-[12px] font-medium text-ink-3">
            (準備中)
          </span>
        </h1>
        {description && (
          <p className="text-[13px] text-ink-2 mb-4">{description}</p>
        )}
        <div className="flex items-center justify-center gap-3 text-[11px] text-ink-3 mb-6">
          {phaseId && (
            <span className="px-2 py-0.5 rounded-pill bg-graybg font-mono">
              {phaseId}
            </span>
          )}
          {estimatedDate && <span>リリース予定: {estimatedDate}</span>}
        </div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-btn bg-navy text-white text-[13px] font-bold hover:bg-navy-2 transition-colors"
        >
          ← ホームに戻る
        </Link>
      </div>
    </div>
  );
}
