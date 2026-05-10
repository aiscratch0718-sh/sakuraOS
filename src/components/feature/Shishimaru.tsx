import Link from "next/link";

export type ShishimaruMood =
  | "celebrate" // 達成率 100%+
  | "great" // 達成率 80%+
  | "happy" // 通常
  | "warning" // 注意事項あり
  | "thinking"; // データ不足

const MOOD_LABEL: Record<ShishimaruMood, string> = {
  celebrate: "🎉 大喜び",
  great: "🔥 ご機嫌",
  happy: "😊 元気",
  warning: "😟 心配",
  thinking: "🤔 考え中",
};

const MOOD_BG: Record<ShishimaruMood, string> = {
  celebrate: "linear-gradient(135deg, #FFF9E6 0%, #FFEAB0 100%)",
  great: "linear-gradient(135deg, #FFF9E6 0%, #FEF5E4 100%)",
  happy: "linear-gradient(135deg, #FFF9E6 0%, #FEF5E4 100%)",
  warning: "linear-gradient(135deg, #FEF5E4 0%, #FDEEF1 100%)",
  thinking: "linear-gradient(135deg, #F6F9FC 0%, #EBF2FB 100%)",
};

const MOOD_BORDER: Record<ShishimaruMood, string> = {
  celebrate: "border-l-gold border-l-4",
  great: "border-l-p2 border-l-4",
  happy: "border-l-p2 border-l-4",
  warning: "border-l-p1 border-l-4",
  thinking: "border-l-line border-l-4",
};

/**
 * さくら獅子丸 — マスコット & ルールベース AI 助言。
 *
 * 設計指針(2026-05-10 ベストプラクティス):
 * - 失敗を罰しない(警告でも前向き口調)
 * - 達成率に応じて mood 切替 — 配色/ラベルでさり気なく表現
 * - クリック可能な提案アクション(href / ラベル)を1つ持てる
 *
 * 例:
 *   <Shishimaru
 *     mood="warning"
 *     message="承認待ちの日報が5件たまっておるぞ。早めに片付けるとよい。"
 *     suggestion={{ label: "承認待ちを見る", href: "/pc/approvals" }}
 *   />
 */
export function Shishimaru({
  mood = "happy",
  message,
  suggestion,
  size = "md",
  className = "",
}: {
  mood?: ShishimaruMood;
  message: React.ReactNode;
  suggestion?: { label: string; href: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const faceSize =
    size === "sm" ? "text-[36px]" : size === "lg" ? "text-[64px]" : "text-[48px]";
  const padding =
    size === "sm" ? "px-3 py-2.5" : size === "lg" ? "px-5 py-4" : "px-4 py-3.5";

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-line shadow-card ${MOOD_BORDER[mood]} ${className}`}
      style={{ background: MOOD_BG[mood] }}
    >
      <div className={`flex items-center gap-3.5 ${padding}`}>
        {/* 顔 */}
        <div
          className={`${faceSize} flex-shrink-0 leading-none animate-floatSlow select-none`}
          aria-hidden
        >
          🦁
        </div>

        {/* 吹き出し */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-p2">
              さくら獅子丸
            </span>
            <span className="text-[9px] text-ink-3 font-semibold">
              {MOOD_LABEL[mood]}
            </span>
          </div>
          <div
            className={`${size === "sm" ? "text-[11px]" : "text-[13px]"} text-ink leading-relaxed font-medium`}
          >
            {message}
          </div>
          {suggestion && (
            <Link
              href={suggestion.href}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-btn bg-p2 text-white text-[11px] font-bold hover:bg-p2/90 transition-colors shadow-p2-glow"
            >
              {suggestion.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
