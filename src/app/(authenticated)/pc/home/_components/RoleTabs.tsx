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

export function RoleTabs({ role }: { role: UserRole }) {
  const active = role === "system" ? "ceo" : role;

  return (
    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
      <span>現在のロール：</span>
      <div
        role="tablist"
        aria-label="現在のロール"
        className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        {ORDER.map((r) => {
          const isActive = r === active;
          return (
            <span
              key={r}
              role="tab"
              aria-selected={isActive}
              className={`min-w-[86px] border-r border-slate-200 px-4 py-2 text-center text-[12px] font-bold transition-colors last:border-r-0 ${
                isActive
                  ? "bg-blue-700 text-white shadow-inner"
                  : "cursor-not-allowed bg-white text-slate-700"
              }`}
              title={isActive ? "現在のロール" : "切替は今後実装予定"}
            >
              {ROLE_LABEL[r]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
