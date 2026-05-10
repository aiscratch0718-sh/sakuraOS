import Link from "next/link";

export type SakuraShishimaruMood =
  | "celebrate" // 達成率 100%+
  | "great" // 達成率 80%+
  | "happy" // 通常
  | "warning" // 注意事項あり
  | "thinking"; // データ不足

const MOOD_LABEL: Record<SakuraShishimaruMood, string> = {
  celebrate: "🎉 大喜び",
  great: "🔥 ご機嫌",
  happy: "😊 元気",
  warning: "😟 心配",
  thinking: "🤔 考え中",
};

const MOOD_BG: Record<SakuraShishimaruMood, string> = {
  celebrate:
    "linear-gradient(135deg, #FFF7E2 0%, #FFE9B3 50%, #FCD9E8 100%)",
  great: "linear-gradient(135deg, #FFF7E2 0%, #FFE9B3 100%)",
  happy: "linear-gradient(135deg, #FFF9E6 0%, #FEF5E4 100%)",
  warning: "linear-gradient(135deg, #FFF5E1 0%, #FFE2EC 100%)",
  thinking: "linear-gradient(135deg, #F6F9FC 0%, #EBF2FB 100%)",
};

const MOOD_BORDER: Record<SakuraShishimaruMood, string> = {
  celebrate: "border-l-4 border-l-pink",
  great: "border-l-4 border-l-amber",
  happy: "border-l-4 border-l-amber",
  warning: "border-l-4 border-l-pink",
  thinking: "border-l-4 border-l-line",
};

/**
 * さくらししまる — SAKURA OS の公式マスコット & ルールベース AI 助言。
 *
 * デザイン:
 *   - 黄色いライオン本体 + さくらの花びら(ピンク)のたてがみ
 *   - 公式画像(`/mascot/mascot-avatar-circle-512.webp` など)を使用
 *   - mood に応じて背景色 / ラベルを変える(画像は共通)
 *
 * 設計指針(2026-05-10 ベストプラクティス):
 * - 失敗を罰しない(警告でも前向き口調)
 * - クリック可能な提案アクションを 1 つだけ持つ(認知負荷を抑える)
 *
 * 例:
 *   <SakuraShishimaru
 *     mood="warning"
 *     message="承認待ちの日報が5件たまっておるぞ。早めに片付けるとよい。"
 *     suggestion={{ label: "承認待ちを見る", href: "/pc/approvals" }}
 *   />
 */
export function SakuraShishimaru({
  mood = "happy",
  message,
  suggestion,
  size = "md",
  className = "",
}: {
  mood?: SakuraShishimaruMood;
  message: React.ReactNode;
  suggestion?: { label: string; href: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const imgSize =
    size === "sm" ? 56 : size === "lg" ? 96 : 72;
  const padding =
    size === "sm" ? "px-3 py-2.5" : size === "lg" ? "px-5 py-4" : "px-4 py-3.5";

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-line shadow-card ${MOOD_BORDER[mood]} ${className}`}
      style={{ background: MOOD_BG[mood] }}
    >
      <div className={`flex items-center gap-3.5 ${padding}`}>
        {/* マスコット画像 */}
        <picture className="flex-shrink-0 animate-floatSlow select-none" aria-hidden>
          <source
            srcSet="/mascot/mascot-avatar-circle-512.webp"
            type="image/webp"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/mascot-avatar-circle-512.png"
            alt=""
            width={imgSize}
            height={imgSize}
            loading="lazy"
            decoding="async"
            style={{ width: imgSize, height: imgSize }}
          />
        </picture>

        {/* 吹き出し */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-amber">
              さくらししまる
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
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-btn bg-amber text-white text-[11px] font-bold hover:bg-amber-2 transition-colors shadow-p2-glow"
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
