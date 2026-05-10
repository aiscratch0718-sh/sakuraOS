/**
 * サイドバー左下に常駐するチームレベル + ユーザー情報ウィジェット。
 *
 * 参照画像で全画面共通に表示されている要素を再現:
 *   - 上段: 「チームレベル ⚡」+ Lv.N + 達成率% 進捗バー (緑→黄→赤の grad)
 *   - 中段: 「安全度 N%」(任意)
 *   - 下段: アバター ◯ + 名前 + ロール
 *
 * Server Component。dark sidebar (navy-rich) 上で読みやすいダークテーマ前提。
 *
 * --------------------------------------------------------------------------
 * 既存 Sidebar への統合手順:
 *
 * `src/app/(authenticated)/pc/_components/Sidebar.tsx` の最下部にある
 * 「下部: ユーザー情報」ブロック (現状: w-9 h-9 rounded-full ... の div)
 * を、このコンポーネントに置換する。
 *
 *   import { SidebarFooterWidget } from "@/components/feature/SidebarFooterWidget";
 *
 *   // (Sidebar 内の最下部 — </nav> の直後)
 *   <SidebarFooterWidget
 *     user={{ displayName, role: roleLabel }}
 *     team={team}
 *   />
 *
 * `team` は親 (layout) で取得した値を Sidebar に Props として追加してから
 * 流し込む。team が undefined の場合はチームレベル行が消えてアバターのみ
 * 表示されるため、段階的にロールアウト可能。
 * --------------------------------------------------------------------------
 */

export type SidebarFooterWidgetProps = {
  user: {
    displayName: string;
    role: string;
    avatarText?: string;
    avatarColor?: string;
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

  return (
    <div
      className={`border-t border-white/10 px-3 py-3 flex flex-col gap-3 shrink-0 ${className}`}
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

      {/* 下段: アバター + 名前 + ロール */}
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
}

/**
 * チーム進捗バー。緑 → 黄 → 赤の grad で達成率を視覚化。
 * (低い値ほど赤=注意、高い値ほど緑=順調 を示す)
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
