import { Fragment } from "react";

export type StepperStep = {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
};

export type StepperProps = {
  steps: Array<StepperStep>;
  /** 0-indexed の現在ステップ */
  currentStep: number;
  /** 完了済みステップのインデックス配列 */
  completedSteps?: number[];
  /** ステップクリック時のハンドラ。完了済みのみ発火する */
  onStepClick?: (step: number) => void;
  className?: string;
};

type StepStatus = "done" | "current" | "upcoming";

function statusOf(
  index: number,
  currentStep: number,
  completedSteps: number[],
): StepStatus {
  if (completedSteps.includes(index)) return "done";
  if (index === currentStep) return "current";
  return "upcoming";
}

/**
 * 横並びステッパー。日報 / 見積書 / 請求書フォームの上部 UI 用。
 *
 * - <ol> セマンティクスで「順序のある手順」を表現
 * - 現在ステップに aria-current="step"
 * - 完了済はクリック可能 / 未完成は aria-disabled
 * - 色のみに依存せず、チェック✓ / 数字 でステータス併記
 *
 * 例:
 * <Stepper
 *   steps={[
 *     { id: "basic", label: "基本情報" },
 *     { id: "items", label: "明細", description: "工事内容" },
 *     { id: "review", label: "確認" },
 *   ]}
 *   currentStep={1}
 *   completedSteps={[0]}
 *   onStepClick={(i) => router.push(`?step=${i}`)}
 * />
 */
export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: StepperProps) {
  const total = steps.length;

  return (
    <nav aria-label="進行ステップ" className={className}>
      <ol
        className="flex items-start gap-0 overflow-x-auto px-1 py-2"
        role="list"
      >
        {steps.map((step, index) => {
          const status = statusOf(index, currentStep, completedSteps);
          const isLast = index === total - 1;
          const isClickable = status === "done" && Boolean(onStepClick);

          return (
            <Fragment key={step.id}>
              <li
                className="flex flex-col items-center min-w-[88px] flex-1 shrink-0"
                aria-current={status === "current" ? "step" : undefined}
              >
                <StepIndicator
                  index={index}
                  total={total}
                  status={status}
                  label={step.label}
                  isClickable={isClickable}
                  onClick={
                    isClickable ? () => onStepClick?.(index) : undefined
                  }
                />
                <div className="mt-2 flex flex-col items-center text-center max-w-[120px]">
                  <span
                    className={`text-[12px] font-bold leading-tight ${
                      status === "current"
                        ? "text-navy"
                        : status === "done"
                          ? "text-ink"
                          : "text-ink-3"
                    }`}
                  >
                    {step.label}
                    {step.optional && (
                      <span className="ml-1 text-[10px] font-normal text-ink-3">
                        (任意)
                      </span>
                    )}
                  </span>
                  {step.description && (
                    <span className="mt-0.5 text-[10px] text-ink-3 leading-tight">
                      {step.description}
                    </span>
                  )}
                </div>
              </li>
              {!isLast && (
                <li
                  aria-hidden
                  className="flex-1 min-w-[16px] pt-4 shrink"
                  role="presentation"
                >
                  <div
                    className={`h-[2px] w-full rounded-full transition-colors ${
                      completedSteps.includes(index)
                        ? "bg-status-done"
                        : "bg-line"
                    }`}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

type StepIndicatorProps = {
  index: number;
  total: number;
  status: StepStatus;
  label: string;
  isClickable: boolean;
  onClick?: () => void;
};

function StepIndicator({
  index,
  total,
  status,
  label,
  isClickable,
  onClick,
}: StepIndicatorProps) {
  // 32px 円。色だけに依存しない: 完了=✓ / 現在=数字 + リング / 未完成=数字
  const baseClasses =
    "relative flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-colors motion-safe:animate-fadeIn";

  const stateClasses =
    status === "done"
      ? "bg-status-done text-white"
      : status === "current"
        ? "bg-navy text-white ring-2 ring-blue/30"
        : "bg-graybg text-ink-3";

  // SR 用の文字列(色のみに依存しないため)
  const srStatus =
    status === "done" ? "完了" : status === "current" ? "現在" : "未完成";
  const srText = `ステップ ${index + 1} / ${total}: ${label} (${srStatus})`;

  if (isClickable && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${stateClasses} cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2`}
      >
        <span aria-hidden>{status === "done" ? "✓" : index + 1}</span>
        <span className="sr-only">{srText}</span>
      </button>
    );
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      aria-disabled={status === "upcoming" ? true : undefined}
    >
      <span aria-hidden>{status === "done" ? "✓" : index + 1}</span>
      <span className="sr-only">{srText}</span>
    </div>
  );
}
