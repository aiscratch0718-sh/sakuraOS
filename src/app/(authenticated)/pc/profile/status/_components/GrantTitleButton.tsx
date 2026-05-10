"use client";

import { useEffect, useState } from "react";
import { TitleGrantModal } from "@/components/feature/TitleGrantModal";
import { createClient } from "@/lib/supabase/client";

type TitleOption = {
  id: string;
  display_name: string;
  icon: string;
  rarity: "bronze" | "silver" | "gold" | "platinum";
  description: string;
  reward_points: number;
};

type UserOption = {
  id: string;
  display_name: string;
};

/**
 * 管理者向け: 称号付与モーダルを開くボタン。
 * 表示中の対象ユーザーが targetUserId で指定されている場合は、
 * 自動的にそのユーザーが選択された状態でモーダルが開く。
 */
export function GrantTitleButton({ targetUserId }: { targetUserId?: string }) {
  const [open, setOpen] = useState(false);
  const [titles, setTitles] = useState<TitleOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  // 初回開く時にデータをロード
  useEffect(() => {
    if (!open || titles.length > 0) return;
    setLoading(true);
    const sb = createClient();
    Promise.all([
      sb
        .from("title_definitions")
        .select("id, code, display_name, icon, description, rarity, reward_points")
        .eq("is_active", true),
      sb.from("profiles").select("id, display_name").order("display_name"),
    ]).then(([titlesRes, usersRes]) => {
      setTitles(
        ((titlesRes.data ?? []) as Array<{
          id: string;
          display_name: string;
          icon: string;
          rarity: TitleOption["rarity"];
          description: string;
          reward_points: number;
        }>).map((t) => ({
          id: t.id,
          display_name: t.display_name,
          icon: t.icon,
          rarity: t.rarity,
          description: t.description,
          reward_points: t.reward_points,
        })),
      );
      setUsers((usersRes.data ?? []) as UserOption[]);
      setLoading(false);
    });
  }, [open, titles.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-btn bg-p4 text-white text-[11px] font-bold hover:bg-p4/90 transition-colors shadow-p4-glow"
      >
        🏅 称号を付与
      </button>
      {loading && open && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-panel px-6 py-4 text-[13px] font-bold">
            読み込み中…
          </div>
        </div>
      )}
      {!loading && (
        <TitleGrantModal
          isOpen={open}
          onClose={() => setOpen(false)}
          titles={titles}
          users={users}
        />
      )}
    </>
  );
}
