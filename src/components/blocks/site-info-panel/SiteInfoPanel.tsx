import { Tag } from "@/components/ui/Tag";

/**
 * REPORT3 入力画面右パネル「現場情報」用コンポーネント。
 *
 * - 現場名・住所・工種・班リーダー・メンバー・予定工数・安全コンボ日数を表示
 * - `collapsible` 指定時は `<details>` でモバイル折りたたみ可能 (キーボード対応)
 * - Server Component で OK (副作用なし)
 */

type Member = {
  id: string;
  name: string;
  avatarText?: string;
};

export type SiteInfoPanelProps = {
  site: {
    name: string;
    address?: string;
    workType?: string;
    leaderName?: string;
    teamMembers?: Member[];
    expectedHours?: number;
    safetyComboDays?: number;
  };
  className?: string;
  collapsible?: boolean;
};

const MAX_AVATARS = 5;

function avatarInitial(name: string, override?: string): string {
  if (override && override.trim()) return override.trim().slice(0, 2);
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // 日本語名は先頭1文字、英字なら頭文字 (せいぜい 2 文字)
  return trimmed.slice(0, 1);
}

function Avatar({
  member,
  size = "md",
}: {
  member: { name: string; avatarText?: string };
  size?: "sm" | "md";
}) {
  const sizeCls = size === "sm" ? "w-7 h-7 text-[11px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-blue-bg font-bold text-blue ring-2 ring-white ${sizeCls}`}
      aria-hidden="true"
    >
      {avatarInitial(member.name, member.avatarText)}
    </div>
  );
}

function PanelBody({
  site,
}: {
  site: SiteInfoPanelProps["site"];
}) {
  const members = site.teamMembers ?? [];
  const visibleMembers = members.slice(0, MAX_AVATARS);
  const overflowCount = members.length - visibleMembers.length;

  return (
    <div className="space-y-3 px-4 pb-4 pt-2">
      {/* 現場名 */}
      <div>
        <div className="text-[11px] text-ink-3">現場名</div>
        <div className="text-base font-bold text-ink">{site.name}</div>
      </div>

      {/* 住所 + 工種 */}
      {(site.address || site.workType) && (
        <div className="space-y-1.5">
          {site.address && (
            <div className="text-xs text-ink-2">
              <span className="text-ink-3">📍 </span>
              {site.address}
            </div>
          )}
          {site.workType && (
            <div>
              <Tag variant="blue" size="sm">
                {site.workType}
              </Tag>
            </div>
          )}
        </div>
      )}

      {/* 班リーダー */}
      {site.leaderName && (
        <div>
          <div className="text-[11px] text-ink-3 mb-1">班リーダー</div>
          <div className="flex items-center gap-2">
            <Avatar member={{ name: site.leaderName }} />
            <span className="text-sm font-medium text-ink">
              {site.leaderName}
            </span>
          </div>
        </div>
      )}

      {/* メンバー */}
      {members.length > 0 && (
        <div>
          <div className="text-[11px] text-ink-3 mb-1">
            メンバー ({members.length}名)
          </div>
          <div className="flex items-center -space-x-2">
            {visibleMembers.map((m) => (
              <Avatar key={m.id} member={m} size="sm" />
            ))}
            {overflowCount > 0 && (
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-graybg text-[11px] font-bold text-ink-2 ring-2 ring-white">
                +{overflowCount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI 行 */}
      {(site.expectedHours !== undefined ||
        site.safetyComboDays !== undefined) && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          {site.expectedHours !== undefined && (
            <div className="rounded-card bg-graybg px-3 py-2">
              <div className="text-[10px] text-ink-3">予定工数</div>
              <div className="text-base font-extrabold text-ink">
                {site.expectedHours}
                <span className="ml-0.5 text-[11px] font-bold">h</span>
              </div>
            </div>
          )}
          {site.safetyComboDays !== undefined && (
            <div className="rounded-card bg-teal-bg px-3 py-2">
              <div className="text-[10px] text-teal">安全コンボ</div>
              <div className="text-base font-extrabold text-teal">
                {site.safetyComboDays}
                <span className="ml-0.5 text-[11px] font-bold">日</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SiteInfoPanel({
  site,
  className = "",
  collapsible = false,
}: SiteInfoPanelProps) {
  const headerLabel = "📌 本日の現場情報";
  const baseCardCls = `rounded-cardLg border border-line bg-panel shadow-card ${className}`;

  if (collapsible) {
    return (
      <details className={`group ${baseCardCls}`} open>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-ink">
          <span>{headerLabel}</span>
          <span
            aria-hidden="true"
            className="text-ink-3 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <PanelBody site={site} />
      </details>
    );
  }

  return (
    <section
      aria-label="本日の現場情報"
      className={baseCardCls}
    >
      <header className="px-4 py-3 text-sm font-bold text-ink border-b border-line">
        {headerLabel}
      </header>
      <PanelBody site={site} />
    </section>
  );
}

export default SiteInfoPanel;
