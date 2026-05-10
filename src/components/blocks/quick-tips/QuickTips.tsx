/**
 * REPORT3 入力画面右パネル「入力ガイド Quick Tips」用コンポーネント。
 *
 * - 各 tip = 絵文字 + タイトル + 説明文
 * - `highlight=true` は amber 背景 + 左ボーダー amber で強調 (現在ステップに対応)
 * - Server Component で OK
 */

export type Tip = {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
};

export type QuickTipsProps = {
  tips: Tip[];
  className?: string;
};

export function QuickTips({ tips, className = "" }: QuickTipsProps) {
  return (
    <section
      aria-label="入力ガイド Quick Tips"
      className={`rounded-cardLg border border-line bg-panel shadow-card ${className}`}
    >
      <header className="px-4 py-3 text-sm font-bold text-ink border-b border-line">
        💡 入力ガイド Quick Tips
      </header>
      <ul className="divide-y divide-line/60">
        {tips.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-ink-3">
            ヒントはありません
          </li>
        )}
        {tips.map((tip) => (
          <li
            key={tip.id}
            className={
              tip.highlight
                ? "border-l-4 border-l-amber bg-amber-bg/60 px-4 py-3"
                : "px-4 py-3"
            }
          >
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-graybg text-base"
              >
                {tip.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-bold ${
                    tip.highlight ? "text-amber" : "text-ink"
                  }`}
                >
                  {tip.title}
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-2">
                  {tip.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default QuickTips;
