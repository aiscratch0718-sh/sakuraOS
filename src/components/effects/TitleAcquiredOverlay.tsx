"use client";

/**
 * TitleAcquiredOverlay
 * ────────────────────
 * 称号獲得時の全画面お祝いオーバーレイ。
 *
 * - 黒半透明 + backdrop-blur 背景
 * - アイコン: bounce + rotate(-180→0) でドラマティック登場
 * - 称号名 / 説明 / レアリティバッジ を時間差で表示
 * - 周囲に sparkle ring が拡散(scale 0→3, opacity 1→0)を 1 秒間隔 × 2 回
 *
 * 終了経路: クリック / ESC / 5 秒タイマーのいずれか。
 * prefers-reduced-motion: 全アニメ瞬時化、5秒タイマーは維持。
 *
 * tailwind.config.ts の keyframes(fadeIn / countUp / pulseSoft / glowPulse 等)
 * は薄い演出用に使い、強い overshoot バウンスや sparkle 拡散は
 * コンポーネント内 <style jsx global> でローカル定義する。
 */

import { useEffect, useRef, useState } from "react";

type Rarity = "bronze" | "silver" | "gold" | "platinum";

type Props = {
  title: {
    icon: string; // 絵文字 "🔥"
    name: string; // "現場復旧の神"
    description: string; // "トラブル解決速度 全社No.1 ×3回"
    rarity: Rarity;
  };
  onClose: () => void;
};

/** レアリティ別配色 (CSS variables を意識した色値). */
const RARITY_STYLE: Record<
  Rarity,
  {
    /** バッジ背景 (純色 or グラデ) */
    badgeBackground: string;
    /** バッジ文字色 */
    badgeColor: string;
    /** アイコン外周のグロー (box-shadow) */
    glow: string;
    /** sparkle ring の border 色 */
    ringBorder: string;
    /** バッジ表示ラベル */
    label: string;
  }
> = {
  bronze: {
    badgeBackground: "#CD7F32",
    badgeColor: "#1a1208",
    glow: "0 0 60px rgba(205,127,50,0.55), 0 0 120px rgba(205,127,50,0.3)",
    ringBorder: "rgba(205,127,50,0.85)",
    label: "BRONZE",
  },
  silver: {
    badgeBackground: "#C0C0C0",
    badgeColor: "#1a1a1a",
    glow: "0 0 60px rgba(192,192,192,0.55), 0 0 120px rgba(192,192,192,0.3)",
    ringBorder: "rgba(192,192,192,0.9)",
    label: "SILVER",
  },
  gold: {
    badgeBackground: "#FFD700",
    badgeColor: "#3a2a00",
    glow: "0 0 60px rgba(255,215,0,0.65), 0 0 120px rgba(255,215,0,0.35)",
    ringBorder: "rgba(255,215,0,0.95)",
    label: "GOLD",
  },
  platinum: {
    // silver から白へのグラデ
    badgeBackground:
      "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #FFFFFF 100%)",
    badgeColor: "#1a1a1a",
    glow: "0 0 60px rgba(255,255,255,0.7), 0 0 120px rgba(192,192,192,0.4)",
    ringBorder: "rgba(240,240,255,0.95)",
    label: "PLATINUM",
  },
};

const AUTO_CLOSE_MS = 5000;
const NAME_ID = "title-acquired-name";

export function TitleAcquiredOverlay({ title, onClose }: Props) {
  const palette = RARITY_STYLE[title.rarity];
  const [reducedMotion, setReducedMotion] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // prefers-reduced-motion を検知
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // 5秒で自動クローズ + ESC リスナー
  useEffect(() => {
    const timer = window.setTimeout(onClose, AUTO_CLOSE_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // フォーカストラップ: マウント時に閉じるボタンへフォーカス
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // クリック処理: オーバーレイ自体 or 閉じるボタン
  const handleOverlayClick = () => {
    onClose();
  };

  // reducedMotion 時は全 delay を 0 にしてアニメ秒数を 0 に
  const dur = (ms: number) => (reducedMotion ? "0ms" : `${ms}ms`);
  const delay = (ms: number) => (reducedMotion ? "0ms" : `${ms}ms`);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={NAME_ID}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md cursor-pointer"
      style={{
        animation: reducedMotion
          ? "none"
          : "tao_overlayFade 300ms cubic-bezier(0.4,0,0.2,1) both",
      }}
    >
      {/* sparkle rings (装飾なので aria-hidden) */}
      {!reducedMotion && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-[200px] w-[200px] rounded-full"
            style={{
              border: `3px solid ${palette.ringBorder}`,
              animation:
                "tao_sparkleRing 1000ms cubic-bezier(0.2,0.6,0.2,1) 200ms 2 both",
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-[200px] w-[200px] rounded-full"
            style={{
              border: `2px solid ${palette.ringBorder}`,
              animation:
                "tao_sparkleRing 1000ms cubic-bezier(0.2,0.6,0.2,1) 700ms 2 both",
            }}
          />
        </>
      )}

      {/* 中央コンテンツ - クリック貫通させて閉じるためバブリングはそのまま */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-[90vw]">
        {/* TITLE GET! ラベル */}
        <p
          className="text-sm font-bold tracking-[0.4em] text-white/80 mb-4"
          style={{
            animation: `tao_fadeIn ${dur(300)} cubic-bezier(0.4,0,0.2,1) ${delay(0)} both`,
          }}
        >
          TITLE GET!
        </p>

        {/* アイコン (絵文字) — bounce + rotate */}
        <div
          aria-hidden="true"
          className="text-[100px] leading-none mb-4 select-none"
          style={{
            filter: `drop-shadow(${palette.glow})`,
            animation: `tao_iconBounce ${dur(800)} cubic-bezier(0.34,1.56,0.64,1) ${delay(200)} both`,
          }}
        >
          {title.icon}
        </div>

        {/* 称号名 — 下から slide-in */}
        <h2
          id={NAME_ID}
          className="text-[36px] font-extrabold text-white leading-tight mb-2 drop-shadow-lg"
          style={{
            animation: `tao_slideUp ${dur(500)} cubic-bezier(0.4,0,0.2,1) ${delay(500)} both`,
          }}
        >
          {title.name}
        </h2>

        {/* description — fade-in */}
        <p
          className="text-[14px] text-white/75 mb-6 max-w-[480px]"
          style={{
            animation: `tao_fadeIn ${dur(400)} cubic-bezier(0.4,0,0.2,1) ${delay(700)} both`,
          }}
        >
          {title.description}
        </p>

        {/* レアリティバッジ — fade-in */}
        <span
          className="inline-block px-6 py-2 rounded-pill text-sm font-extrabold tracking-[0.2em]"
          style={{
            background: palette.badgeBackground,
            color: palette.badgeColor,
            boxShadow: palette.glow,
            animation: `tao_fadeIn ${dur(400)} cubic-bezier(0.4,0,0.2,1) ${delay(900)} both`,
          }}
        >
          {palette.label}
        </span>

        {/* 閉じるボタン (フォーカストラップ用 + 明示の閉じ操作) */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="mt-8 px-5 py-2 rounded-pill text-xs font-bold tracking-[0.2em] text-white/90 bg-white/10 border border-white/30 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="称号獲得通知を閉じる"
          style={{
            animation: `tao_fadeIn ${dur(400)} cubic-bezier(0.4,0,0.2,1) ${delay(1100)} both`,
          }}
        >
          CLOSE (ESC)
        </button>
      </div>

      {/* ローカル keyframes (overshoot バウンス・sparkle ring・fade variants) */}
      <style jsx global>{`
        @keyframes tao_overlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes tao_fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tao_slideUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tao_iconBounce {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.2) rotate(10deg);
          }
          80% {
            transform: scale(0.92) rotate(-4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes tao_sparkleRing {
          0% {
            opacity: 1;
            transform: scale(0);
          }
          100% {
            opacity: 0;
            transform: scale(3);
          }
        }
      `}</style>
    </div>
  );
}

export default TitleAcquiredOverlay;
