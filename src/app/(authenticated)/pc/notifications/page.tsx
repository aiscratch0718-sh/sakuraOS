import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { NotificationItem } from "../../_components/NotificationItem";
import { MarkAllReadButton } from "../../_components/MarkAllReadButton";

export const dynamic = "force-dynamic";

export default async function PcNotificationsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: notifs } = await supabase
    .from("notifications")
    .select("id, category, title, body, link_url, read_at, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const unread = (notifs ?? []).filter((n) => !n.read_at).length;

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">通知</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            未読 {unread} 件 / 直近 100 件
          </p>
        </div>
        <MarkAllReadButton disabled={unread === 0} />
      </div>

      {!notifs || notifs.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-8">
          通知はまだありません。
        </div>
      ) : (
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li key={n.id}>
              <NotificationItem
                id={n.id}
                category={n.category}
                title={n.title}
                body={n.body}
                linkUrl={n.link_url}
                readAt={n.read_at}
                createdAt={n.created_at}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
