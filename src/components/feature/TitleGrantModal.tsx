"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Tag, type TagVariant } from "@/components/ui";

import { grantTitle } from "@/features/titles/actions";

export type TitleRarity = "bronze" | "silver" | "gold" | "platinum";

export type TitleOption = {
  id: string;
  display_name: string;
  icon: string;
  rarity: TitleRarity;
  description: string;
  reward_points: number;
  /** 検索用のコード(任意)。display_name と並行して検索対象になる */
  code?: string;
};

export type UserOption = {
  id: string;
  display_name: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  titles: TitleOption[];
  users: UserOption[];
};

const RARITY_LABEL: Record<TitleRarity, string> = {
  bronze: "ブロンズ",
  silver: "シルバー",
  gold: "ゴールド",
  platinum: "プラチナ",
};

const RARITY_TAG: Record<TitleRarity, TagVariant> = {
  bronze: "bronze",
  silver: "silver",
  gold: "gold",
  platinum: "purple",
};

/**
 * 称号レアリティに応じたカード枠スタイル。
 * platinum はグラデ枠で他レアリティより目立たせる。
 */
const RARITY_CARD_CLS: Record<TitleRarity, string> = {
  bronze: "bg-bronze/10 border-bronze/40",
  silver: "bg-silver/20 border-silver/50",
  gold: "bg-gold/15 border-gold/50",
  platinum:
    "bg-gradient-to-br from-[#e5e4e2] via-white to-[#cfd8dc] border-transparent " +
    "[background-clip:padding-box,border-box] " +
    "shadow-[0_0_0_2px_rgba(180,180,200,0.6)]",
};

const REASON_MIN = 10;

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), button:not([disabled]), iframe, ' +
  '[tabindex]:not([tabindex="-1"])';

/**
 * 管理者が社員に称号を付与するためのモーダルダイアログ。
 *
 * - 半透明黒背景クリック / ESC で閉じる
 * - 社員選択(dropdown) + 称号選択(検索可能リスト) + 付与理由(textarea)
 * - 付与時に確認 prompt を出してから server action を呼ぶ(現在はスタブ)
 *
 * Server action `grantTitle` は別ファイルで実装予定のため、本コンポーネント内では
 * TODO コメント付きで呼び出し箇所をスタブ化している。
 */
export function TitleGrantModal({ isOpen, onClose, titles, users }: Props) {
  const titleId = useId();
  const userSelectId = useId();
  const searchId = useId();
  const reasonId = useId();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTitleId, setSelectedTitleId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLSelectElement | null>(null);

  // モーダルが閉じたら state をリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("");
      setSelectedTitleId("");
      setSearch("");
      setReason("");
    }
  }, [isOpen]);

  // モーダル開放時に最初の入力へフォーカス
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // ESC で閉じる + 簡易フォーカストラップ
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !containerRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const filteredTitles = useMemo<TitleOption[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return titles;
    return titles.filter((t) => {
      const name = t.display_name.toLowerCase();
      const code = (t.code ?? "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [titles, search]);

  const selectedTitle = useMemo<TitleOption | undefined>(
    () => titles.find((t) => t.id === selectedTitleId),
    [titles, selectedTitleId],
  );
  const selectedUser = useMemo<UserOption | undefined>(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const reasonTrimmed = reason.trim();
  const isReasonValid = reasonTrimmed.length >= REASON_MIN;
  const isFormValid =
    selectedUserId !== "" && selectedTitleId !== "" && isReasonValid;
  const canSubmit = isFormValid && !isPending;

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      // カード内クリックでは閉じない
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // カード自体の click が backdrop に伝播しないように。
  const stopPropagation = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    [],
  );

  const handleTitleCardKey = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedTitleId(id);
      }
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedUser || !selectedTitle) return;

    const ok = window.confirm(
      `${selectedUser.display_name} さんに「${selectedTitle.display_name}」を付与します。よろしいですか?`,
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        const result = await grantTitle({
          userId: selectedUser.id,
          titleId: selectedTitle.id,
          reason: reasonTrimmed,
        });
        if (!result.ok) throw new Error(result.error ?? "付与に失敗しました");
        onClose();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "付与に失敗しました";
        window.alert(`称号の付与に失敗しました: ${message}`);
      }
    });
  }, [canSubmit, selectedUser, selectedTitle, reasonTrimmed, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      aria-hidden={false}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={stopPropagation}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-cardLg flex flex-col"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-graybg sticky top-0 bg-white rounded-t-2xl">
          <h2 id={titleId} className="text-base font-bold text-ink-1">
            <span aria-hidden="true">🏅 </span>称号を付与
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-ink-3 hover:bg-graybg hover:text-ink-1 transition-colors focus:outline-none focus:ring-2 focus:ring-p3"
            aria-label="閉じる"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* 入力エリア */}
        <div className="px-6 py-5 space-y-5">
          {/* 社員選択 */}
          <div>
            <label
              htmlFor={userSelectId}
              className="block text-[12px] font-bold text-ink-2 mb-1.5"
            >
              社員 <span className="text-p1">*</span>
            </label>
            <select
              id={userSelectId}
              ref={firstFieldRef}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-graybg rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent"
            >
              <option value="">— 社員を選択 —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* 称号選択(検索可能リスト) */}
          <div>
            <label
              htmlFor={searchId}
              className="block text-[12px] font-bold text-ink-2 mb-1.5"
            >
              称号 <span className="text-p1">*</span>
            </label>
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="称号名 / コードで検索…"
              className="w-full px-3 py-2 text-[13px] border border-graybg rounded-md bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent"
              aria-controls={`${searchId}-list`}
            />
            <div
              id={`${searchId}-list`}
              role="listbox"
              aria-label="称号一覧"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1"
            >
              {filteredTitles.length === 0 ? (
                <p className="text-[12px] text-ink-3 col-span-full py-6 text-center">
                  該当する称号がありません。
                </p>
              ) : (
                filteredTitles.map((t) => {
                  const isSelected = t.id === selectedTitleId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedTitleId(t.id)}
                      onKeyDown={(e) => handleTitleCardKey(e, t.id)}
                      className={[
                        "text-left p-3 rounded-lg border-2 transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-p3",
                        RARITY_CARD_CLS[t.rarity],
                        isSelected
                          ? "ring-2 ring-p3 ring-offset-2 scale-[1.01]"
                          : "hover:brightness-95",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="text-2xl leading-none shrink-0"
                          aria-hidden="true"
                        >
                          {t.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[13px] text-ink-1 truncate">
                              {t.display_name}
                            </span>
                            <Tag variant={RARITY_TAG[t.rarity]} size="sm">
                              {RARITY_LABEL[t.rarity]}
                            </Tag>
                          </div>
                          <p className="text-[11px] text-ink-2 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                          <p className="text-[11px] font-mono text-ink-2 mt-1">
                            +{t.reward_points.toLocaleString()} pt
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 付与理由 */}
          <div>
            <label
              htmlFor={reasonId}
              className="block text-[12px] font-bold text-ink-2 mb-1.5"
            >
              付与理由 <span className="text-p1">*</span>
              <span className="ml-2 text-[11px] font-normal text-ink-3">
                ({REASON_MIN} 文字以上)
              </span>
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="例: 〇〇現場で安全管理を徹底し、無事故で完工に貢献した"
              className="w-full px-3 py-2 text-[13px] border border-graybg rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-p3 focus:border-transparent resize-y"
              aria-invalid={!isReasonValid && reason.length > 0}
              aria-describedby={`${reasonId}-help`}
            />
            <p
              id={`${reasonId}-help`}
              className={`mt-1 text-[11px] ${
                reasonTrimmed.length > 0 && !isReasonValid
                  ? "text-p1"
                  : "text-ink-3"
              }`}
            >
              {reasonTrimmed.length} / {REASON_MIN} 文字
              {reasonTrimmed.length > 0 && !isReasonValid
                ? ` — あと ${REASON_MIN - reasonTrimmed.length} 文字必要です`
                : ""}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-graybg sticky bottom-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-ghost text-[13px] px-4 py-2 rounded-md text-ink-2 hover:bg-graybg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-p3"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="btn-primary text-[13px] px-4 py-2 rounded-md bg-p3 text-white font-bold hover:bg-p3/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-p3 focus:ring-offset-2"
          >
            {isPending ? "付与中…" : "付与する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TitleGrantModal;
