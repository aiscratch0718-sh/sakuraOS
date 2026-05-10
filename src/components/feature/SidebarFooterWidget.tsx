"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

/**
 * サイドバー左下に常駐するチームレベル + ユーザー情報ウィジェット。
 *
 * 参照画像で全画面共通に表示されている要素を再現:
 *   - 上段: 「チームレベル ⚡」+ Lv.N + 達成率% 進捗バー (緑→黄→赤の grad)
 *   - 中段: 「安全度 N%」(任意)
 *   - 下段: アバター ◯ + 名前 + ロール
 *   - アバタークリックでメニュー展開(プロフィール / 外観設定 / サインアウト)
 *
 * Client Component(メニュー開閉のため)。dark sidebar (navy-rich) 上で読みやすい
 * ダークテーマ前提。
 */

export type SidebarFooterWidgetProps = {
  user: {
    displayName: string;
    role: string;
    avatarText?: string;
    avatarColor?: string;
    canEditBranding?: boolean; // office/ceo/system のみ外観設定リンク表示
  };
  team?: {
    name: string;
    progressPercent: number;
    safetyScore?: number;
    xpLevel?: number;
  };
  className?: string;
};

export function SidebarFooterWidget({
  user,
  team,
  className = "",
}: SidebarFooterWidgetProps) {
  const initial =
    user.avatarText ?? user.displayName.slice(0, 1).toUpperCase();
  const avatarBg = user.avatarColor ?? "rgba(255,255,255,0.15)";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // クリック外で閉じる
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Esc で閉じる
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      className={`relative border-t border-white/10 px-3 py-3 flex flex-col gap-3 shrink-0 ${className}`}
    >
      {/* 上段: チームレベル + 進捗バー */}
      {team && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-white/60">
            <span className="flex items-center gap-1">
              <span aria-hidden>⚡</span>
              <span>チームレベル</span>
            </span>
            {typeof team.xpLevel === "number" && (
              <span className="text-amber tabular-nums">Lv.{team.xpLevel}</span>
            )}
          </div>

          <TeamProgressBar
            value={team.progressPercent}
            label={`${team.name} の達成率`}
          />

          {/* 中段: 安全度 */}
          {typeof team.safetyScore === "number" && (
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-white/55">安全度</span>
              <span
                className={`font-bold tabular-nums ${
                  team.safetyScore >= 80
                    ? "text-status-done"
                    : team.safetyScore >= 60
                      ? "text-amber"
                      : "text-red-400"
                }`}
              >
                {Math.round(team.safetyScore)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* 下段: アバター + 名前 + ロール(クリックでメニュー) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${user.displayName} のアカウントメニュー`}
        className="flex items-center gap-3 -mx-1 px-1 py-1 rounded-card hover:bg-white/5 transition-colors text-left"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0 ring-1 ring-white/20"
          style={{ background: avatarBg }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-white truncate">
            {user.displayName}
          </div>
          <div className="text-[10px] text-white/60 truncate">{user.role}</div>
        </div>
        <span aria-hidden className="text-white/40 text-[10px]">
          {menuOpen ? "▾" : "▸"}
        </span>
      </button>

      {/* アバターメニュー */}
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute bottom-full left-3 right-3 mb-1 rounded-card border border-white/10 bg-[#1a2a3a] shadow-cardLg overflow-hidden"
        >
          <Link
            href="/pc/profile"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
            className="block px-3 py-2.5 text-[12px] text-white hover:bg-white/10 transition-colors"
          >
            👤 プロフィール
          </Link>
          {user.canEditBranding && (
            <Link
              href="/pc/settings/branding"
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              className="block px-3 py-2.5 text-[12px] text-white hover:bg-white/10 transition-colors border-t border-white/5"
            >
              🎨 外観設定
            </Link>
          )}
          <form
            action="/sign-out"
            method="POST"
            className="border-t border-white/5"
          >
            <button
              type="submit"
              role="menuitem"
              className="block w-full text-left px-3 py-2.5 text-[12px] text-red-300 hover:bg-red-500/20 transition-colors"
            >
              ⏏ サインアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * チーム進捗バー。緑 → 黄 → 赤の grad で達成率を視覚化。
 */
function TeamProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out motion-reduce:transition-none"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)",
          }}
        />
      </div>
      <span className="text-[10px] font-bold text-white tabular-nums w-9 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
