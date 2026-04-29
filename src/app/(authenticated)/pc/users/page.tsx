import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  worker: "作業員",
  leader: "現場リーダー",
  office: "事務",
  ceo: "経営層",
  system: "システム",
};

export default async function PcUsersPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, role, hourly_rate_cents, created_at")
    .order("role", { ascending: true })
    .order("display_name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">ユーザー一覧</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            作業員・リーダー・事務・経営層のユーザー管理。新規登録時にメールアドレスとパスワードを発行します。
          </p>
        </div>
        <Link
          href="/pc/users/new"
          className="btn-primary py-2 px-4 text-[13px]"
        >
          + 新規登録
        </Link>
      </div>

      <section className="panel-pad">
        {!profiles || profiles.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだユーザーが登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">表示名</th>
                  <th className="py-2 px-3 font-bold">ロール</th>
                  <th className="py-2 px-3 font-bold text-right">時給</th>
                  <th className="py-2 px-3 font-bold">登録日</th>
                  <th className="py-2 px-3 font-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const rateYen =
                    typeof p.hourly_rate_cents === "number"
                      ? Math.round(p.hourly_rate_cents / 100)
                      : null;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-bold">{p.display_name}</td>
                      <td className="py-2 px-3">
                        <RoleBadge role={p.role} />
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[12px] whitespace-nowrap">
                        {rateYen !== null
                          ? `¥${rateYen.toLocaleString("ja-JP")} / h`
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-ink-2 text-[11px] whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Link
                          href={`/pc/users/${p.id}`}
                          className="text-[11px] text-blue underline"
                        >
                          編集
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const className: Record<string, string> = {
    worker: "pill-blue",
    leader: "pill-amber",
    office: "pill-teal",
    ceo: "pill-purple",
    system: "pill-red",
  };
  return (
    <span className={className[role] ?? "pill-blue"}>
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}
