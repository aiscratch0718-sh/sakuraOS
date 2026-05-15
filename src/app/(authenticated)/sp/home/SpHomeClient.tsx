"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  MapPin,
  Calendar,
  User,
  Phone,
  Clock,
  LogIn,
  LogOut,
  ClipboardEdit,
  CheckSquare,
  Square,
  Send,
  TrendingUp,
  Trophy,
  Star,
  Users,
  Megaphone,
  ChevronRight,
  Shield,
  Wrench,
  ClipboardCheck,
} from "lucide-react";
import type { ProjectRow } from "../../pc/projects/_data/mock-projects";

/* ============================================================
   モック / 定数
   ============================================================ */

type Task = {
  id: string;
  title: string;
  done: boolean;
  time?: string;
};

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "朝礼・KY 活動への参加", done: true, time: "08:00" },
  { id: "t2", title: "現場の安全確認", done: true, time: "08:30" },
  { id: "t3", title: "給水管布設(継手部 12 箇所)", done: false, time: "09:00" },
  { id: "t4", title: "REPORT3 提出", done: false, time: "17:00" },
];

const RECENT_BADGES = [
  { id: "b1", icon: ClipboardCheck, color: "#d97706", label: "REPORT3 マスター" },
  { id: "b2", icon: Shield, color: "#2563eb", label: "安全管理士" },
  { id: "b3", icon: Wrench, color: "#7c3aed", label: "配管職人" },
];

const NOTIFICATIONS_PREVIEW = [
  { id: "n1", title: "REPORT3 が承認されました", time: "2 時間前", isUrgent: false },
  { id: "n2", title: "明日の現場変更のお知らせ", time: "4 時間前", isUrgent: true },
  { id: "n3", title: "ヒヤリハット報告 → 改善案", time: "昨日", isUrgent: false },
];

/* ============================================================
   メインコンポーネント
   ============================================================ */

export function SpHomeClient({
  userName,
  project,
}: {
  userName: string;
  project: ProjectRow | null;
}) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [clockState, setClockState] = useState<"out" | "in">("out");
  const [report3Start, setReport3Start] = useState("08:00");
  const [report3End, setReport3End] = useState("17:00");

  const completedTasks = tasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedTasks / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-6 pt-4">
      {/* ヘッダー: 挨拶 + 通知 */}
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-base font-bold text-white shadow-sm"
            aria-hidden
          >
            {userName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{userName} さん</div>
            <div className="text-[11px] text-slate-500">今日も頑張りましょう!</div>
          </div>
        </div>
        <Link
          href="/sp/notifications"
          aria-label="通知一覧へ"
          className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <Bell className="h-5 w-5 text-slate-700" aria-hidden />
          <span
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white"
            aria-label="未読 3 件"
          >
            3
          </span>
        </Link>
      </header>

      {/* 本日の現場 card */}
      {project && (
        <section className="mb-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-blue-700">
            <Building2 className="h-3 w-3" />
            本日の現場
          </div>
          <h2 className="text-base font-bold leading-tight text-slate-900">
            {project.name}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
            <Wrench className="h-3 w-3" />
            {project.workType}
          </div>

          {/* 進捗バー */}
          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between text-[11px]">
              <span className="text-slate-600">進捗</span>
              <span className="font-bold text-blue-700">
                {project.progressPct}% / 予定 {project.plannedPct}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={project.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`案件進捗 ${project.progressPct}%`}
            >
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${project.progressPct}%` }}
              />
            </div>
          </div>

          {/* メタ情報 */}
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
            <li className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="truncate text-slate-600">
                {project.address.replace(/^宮城県/, "").substring(0, 12)}…
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="text-slate-600">{project.dueAt}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="truncate text-slate-600">{project.leader}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-slate-400" aria-hidden />
              <Link
                href="tel:022-XXX-XXXX"
                className="text-blue-600 underline"
                aria-label="現場に電話"
              >
                022-XXX-XXXX
              </Link>
            </li>
          </ul>
        </section>
      )}

      {/* 大型 3 ボタン: 出勤 / 退勤 / REPORT3 */}
      <section className="mb-3 grid grid-cols-3 gap-2" aria-label="クイックアクション">
        <QuickActionButton
          icon={LogIn}
          label="出勤"
          subText={clockState === "in" ? "打刻済" : "未打刻"}
          color="emerald"
          active={clockState === "in"}
          onClick={() => setClockState("in")}
        />
        <QuickActionButton
          icon={LogOut}
          label="退勤"
          subText={clockState === "out" ? "未打刻" : "出勤中"}
          color="rose"
          active={false}
          onClick={() => setClockState("out")}
        />
        <Link
          href="/sp/report3/new"
          className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 py-3 text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
          aria-label="REPORT3 入力画面へ"
        >
          <ClipboardEdit className="h-6 w-6" aria-hidden />
          <span className="text-xs font-bold">REPORT3</span>
          <span className="text-[10px]">入力する</span>
        </Link>
      </section>

      {/* 今日のタスク card */}
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            今日のタスク
          </h3>
          <span className="text-[11px] font-semibold text-slate-600" aria-live="polite">
            {completedTasks} / {tasks.length}
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => toggleTask(t.id)}
                aria-pressed={t.done}
                className={`flex w-full min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  t.done
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {t.done ? (
                  <CheckSquare
                    className="h-5 w-5 flex-shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Square className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden />
                )}
                <span
                  className={`flex-1 text-[13px] ${
                    t.done ? "text-slate-500 line-through" : "text-slate-800"
                  }`}
                >
                  {t.title}
                </span>
                {t.time && (
                  <span className="flex-shrink-0 text-[10px] text-slate-500">
                    {t.time}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/sp/report3/new"
          className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-[11px] text-slate-600 hover:bg-slate-100"
        >
          すべてのタスクを表示
          <ChevronRight className="h-3 w-3" />
        </Link>
      </section>

      {/* REPORT3 クイック入力 */}
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Clock className="h-4 w-4 text-blue-600" />
          REPORT3 クイック入力
        </h3>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500">開始時刻</span>
            <input
              type="time"
              value={report3Start}
              onChange={(e) => setReport3Start(e.target.value)}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="REPORT3 開始時刻"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500">終了時刻</span>
            <input
              type="time"
              value={report3End}
              onChange={(e) => setReport3End(e.target.value)}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="REPORT3 終了時刻"
            />
          </label>
        </div>
        <Link
          href="/sp/report3/new"
          className="flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
          詳細入力へ進む
        </Link>
      </section>

      {/* 本日の進捗統計 */}
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          本日の進捗
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="REPORT3" value="1" sub="件提出" color="text-blue-600" />
          <Stat label="タスク" value={`${completedTasks}`} sub={`/ ${tasks.length} 完了`} color="text-emerald-600" />
          <Stat label="進捗" value={`${progressPct}%`} sub="達成" color="text-amber-600" />
        </div>
      </section>

      {/* ゲーミフィケーション card */}
      <section className="mb-3 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-amber-50 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            ゲーミフィケーション
          </h3>
          <Link
            href="/sp/gamification"
            className="text-[11px] text-blue-600 hover:underline"
          >
            すべて見る ›
          </Link>
        </div>

        {/* Lv + XP */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-base font-bold text-white shadow-md">
            12
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900">Lv. 12</span>
              <span className="text-[10px] text-slate-500">+120 XP 今日</span>
            </div>
            <div
              className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-violet-100"
              role="progressbar"
              aria-valuenow={64}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="次レベルまで 64%"
            >
              <div className="h-full bg-gradient-to-r from-violet-500 to-amber-500" style={{ width: "64%" }} />
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              Lv. 13 まで 360 XP
            </div>
          </div>
        </div>

        {/* 獲得バッジ */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-white/60 px-3 py-2">
          <span className="text-[11px] font-medium text-slate-600">最近のバッジ</span>
          <div className="flex items-center gap-1.5">
            {RECENT_BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
                  aria-label={b.label}
                >
                  <Icon className="h-4 w-4" style={{ color: b.color }} aria-hidden />
                </div>
              );
            })}
            <Star className="h-4 w-4 text-slate-300" aria-hidden />
          </div>
        </div>
      </section>

      {/* チームクエスト */}
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Users className="h-4 w-4 text-blue-600" />
          チームクエスト
        </h3>
        <div className="mb-1 text-[12px] font-medium text-slate-800">
          チーム全員 REPORT3 連続提出
        </div>
        <div className="mb-2 text-[10px] text-slate-500">期限: 2026-05-20</div>
        <div className="mb-1 flex items-baseline justify-between text-[11px]">
          <span className="text-slate-600">3 / 5 名</span>
          <span className="font-bold text-blue-700">72%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={72}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="チームクエスト進捗 72%"
        >
          <div className="h-full bg-blue-500" style={{ width: "72%" }} />
        </div>
      </section>

      {/* お知らせ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Megaphone className="h-4 w-4 text-rose-500" />
            お知らせ
          </h3>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            未読 3 件
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {NOTIFICATIONS_PREVIEW.map((n) => (
            <li key={n.id}>
              <Link
                href="/sp/notifications"
                className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  n.isUrgent
                    ? "border-rose-200 bg-rose-50/40 hover:bg-rose-50"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${
                    n.isUrgent ? "bg-rose-500" : "bg-blue-400"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-slate-800">
                    {n.title}
                  </div>
                  <div className="text-[10px] text-slate-500">{n.time}</div>
                </div>
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */

function QuickActionButton({
  icon: Icon,
  label,
  subText,
  color,
  active,
  onClick,
}: {
  icon: typeof LogIn;
  label: string;
  subText: string;
  color: "emerald" | "rose" | "blue";
  active: boolean;
  onClick: () => void;
}) {
  const colorClasses: Record<typeof color, { bg: string; text: string; activeBg: string; activeText: string }> = {
    emerald: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      activeBg: "bg-emerald-600 border-emerald-600",
      activeText: "text-white",
    },
    rose: {
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-700",
      activeBg: "bg-rose-600 border-rose-600",
      activeText: "text-white",
    },
    blue: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      activeBg: "bg-blue-600 border-blue-600",
      activeText: "text-white",
    },
  };
  const c = colorClasses[color];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 transition-colors ${
        active ? `${c.activeBg} ${c.activeText}` : `${c.bg} ${c.text}`
      }`}
    >
      <Icon className="h-6 w-6" aria-hidden />
      <span className="text-xs font-bold">{label}</span>
      <span className={`text-[10px] ${active ? "text-white/90" : "text-slate-500"}`}>
        {subText}
      </span>
    </button>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-2 text-center">
      <div className="text-[10px] font-medium text-slate-500">{label}</div>
      <div className={`mt-0.5 text-xl font-bold leading-none ${color}`}>{value}</div>
      <div className="mt-0.5 text-[9px] text-slate-500">{sub}</div>
    </div>
  );
}
