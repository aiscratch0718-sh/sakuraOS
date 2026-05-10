"use client";

import { useCallback, useEffect } from "react";

export type StepFooterProps = {
  currentStep: number;
  totalSteps: number;
  onPrev?: () => void;
  onNext?: () => void;
  /** 最終ステップ用の送信ハンドラ。指定された場合 onNext より優先 */
  onSubmit?: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  draftLabel?: string;
  className?: string;
};

/**
 * Stepper 用のフッター操作領域。
 *
 * - 左: 戻る / 下書き保存
 * - 右: 次へ または 送信して確定 (最終ステップ時)
 * - Alt+← で戻る / Alt+→ で次へ (キーボードショートカット)
 * - 送信中は全ボタン無効化 + spinner 表示
 */
export function StepFooter({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  isPrevDisabled = false,
  isNextDisabled = false,
  prevLabel = "← 戻る",
  nextLabel = "次へ →",
  submitLabel = "送信して確定",
  draftLabel = "下書き保存",
  className,
}: StepFooterProps) {
  const isFirst = currentStep <= 0;
  const isLast = currentStep >= totalSteps - 1;

  const prevDisabled = isPrevDisabled || isFirst || isSubmitting;
  const nextDisabled = isNextDisabled || isSubmitting;

  const handlePrev = useCallback(() => {
    if (prevDisabled) return;
    onPrev?.();
  }, [prevDisabled, onPrev]);

  const handleNext = useCallback(() => {
    if (nextDisabled) return;
    if (isLast && onSubmit) {
      onSubmit();
      return;
    }
    onNext?.();
  }, [nextDisabled, isLast, onNext, onSubmit]);

  // Alt + Arrow キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // input/textarea にフォーカス中は無視
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return;
      }
      if (target?.isContentEditable) return;

      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [handlePrev, handleNext]);

  const primaryLabel = isLast && onSubmit ? submitLabel : nextLabel;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-t border-line bg-panel px-4 py-3 rounded-b-card ${className ?? ""}`}
      role="group"
      aria-label="ステップ操作"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={prevDisabled}
          aria-keyshortcuts="Alt+ArrowLeft"
          className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-btn border border-line bg-panel text-[13px] font-bold text-ink hover:bg-graybg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          {prevLabel}
        </button>
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="min-h-[44px] px-4 py-2 rounded-btn border border-line bg-panel2 text-[13px] font-bold text-ink-2 hover:bg-graybg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
          >
            {draftLabel}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-3" aria-live="polite">
          ステップ {currentStep + 1} / {totalSteps}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={nextDisabled}
          aria-keyshortcuts="Alt+ArrowRight"
          className={`min-h-[44px] min-w-[44px] px-5 py-2 rounded-btn text-[13px] font-bold text-white shadow-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
            isLast && onSubmit
              ? "bg-status-done hover:bg-teal-2 focus-visible:ring-status-done"
              : "bg-navy hover:bg-navy-2 focus-visible:ring-blue"
          }`}
        >
          {isSubmitting && <Spinner />}
          <span>{primaryLabel}</span>
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  // motion-safe で回転(prefers-reduced-motion 環境では静的表示)
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
    />
  );
}
