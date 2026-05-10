import type { UserRole } from "@/server/auth/session";

const ROLE_LABEL: Record<Exclude<UserRole, "system">, string> = {
  ceo: "管理者",
  office: "事務",
  leader: "現場リーダー",
  worker: "作業員",
};

const ORDER: Array<Exclude<UserRole, "system">> = [
  "ceo",
  "office",
  "leader",
  "worker",
];

/**
 * 現在のロール表示タブ。セッション値で選択状態を切替。
 * TODO(P12-02-role-switch): system ロール限定の擬似ロール切替を有効化。
 */
export function RoleTabs({ role }: { role: UserRole }) {
  // system は管理者扱いで表示
  const active = role === "system" ? "ceo" : role;
  return (
    <div
      role="tablist"
      aria-label="現在のロール"
      className="inline-flex items-center gap-1 p-1 rounded-pill bg-graybg"
    >
      {ORDER.map((r) => {
        const isActive = r === active;
        return (
          <span
            key={r}
            role="tab"
            aria-selected={isActive}
            className={`px-3 py-1 rounded-pill text-[11px] font-bold transition-colors ${
              isActive
                ? "bg-navy text-white"
                : "text-ink-3 cursor-not-allowed"
            }`}
            title={isActive ? "現在のロール" : "切替は将来実装予定"}
          >
            {ROLE_LABEL[r]}
          </span>
        );
      })}
    </div>
  );
}
