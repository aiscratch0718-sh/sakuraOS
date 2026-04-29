import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { NotificationItem } from "../../_components/NotificationItem";
import { MarkAllReadButton } from "../../_components/MarkAllReadButton";

export const dynamic = "force-dynamic";

export default async function SpNotificationsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: notifs } = await supabase
    .from("notifications")
    .select("id, category, title, body, link_url, read_at, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const unread = (notifs ?? []).filter((n) => !n.read_at).length;

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-extrabold text-navy">通知</h1>
        <MarkAllReadButton disabled={unread === 0} />
      </div>
      <p className="text-[11px] text-ink-3 mb-3">
        未読 {unread} 件
      </p>

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
