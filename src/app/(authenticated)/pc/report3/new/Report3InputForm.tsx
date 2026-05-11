"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock,
  Cloud,
  HardHat,
  MapPin,
  Search,
  ShieldCheck,
  Sun,
  Upload,
  Users,
  X,
} from "lucide-react";

const PROJECTS = [
  { id: "p1", name: "仙台駅前ビル給排水改修" },
  { id: "p2", name: "泉中央マンション給湯設備" },
  { id: "p3", name: "石巻市商業施設配管更新" },
  { id: "p4", name: "多賀城市物流倉庫排水工事" },
  { id: "p5", name: "名取市マンション改修工事" },
];

const WORK_CATEGORIES = [
  "給排水工事",
  "給湯設備工事",
  "排水管工事",
  "配管点検工事",
  "改修工事",
  "ガス配管工事",
];

const REST_MINUTES = ["0 分", "30 分", "45 分", "60 分", "90 分"];

const WEATHER_OPTIONS = [
  { value: "sunny", label: "晴れ" },
  { value: "cloudy", label: "曇り" },
  { value: "rainy", label: "雨" },
  { value: "snowy", label: "雪" },
];

const STEPS = [
  { id: 1, title: "現場選択", desc: "現場・案件を選択" },
  { id: 2, title: "作業内容", desc: "作業区分・内容を入力" },
  { id: 3, title: "時間入力", desc: "開始・終了・休憩・人数" },
  { id: 4, title: "写真添付", desc: "現場写真をアップロード" },
  { id: 5, title: "確認", desc: "入力内容を確認して送信" },
];

const MOCK_PHOTOS = [
  { id: "1", name: "配管布設_全景.jpg", color: "#9ec5e6" },
  { id: "2", name: "継手部_仕上げ.jpg", color: "#a4c8a0" },
  { id: "3", name: "圧力試験_作業中.jpg", color: "#f0b48a" },
  { id: "4", name: "搬入材料_配管.jpg", color: "#b8a4d0" },
];

const TIPS = [
  "作業内容は具体的に入力すると、後工程の分析に役立ちます",
  "開始・終了時刻は正確に入力しましょう",
  "写真は工程がわかる角度で撮影しましょう",
  "1回の送信で日報・原価・工事概況・XPに反映されます",
];

const REFLECT_TARGETS = [
  { label: "日報", color: "bg-blue-100 text-blue-700" },
  { label: "原価", color: "bg-orange-100 text-orange-700" },
  { label: "工事概況", color: "bg-red-100 text-red-700" },
  { label: "XP", color: "bg-violet-100 text-violet-700" },
];

export function Report3InputForm() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")} (${"日月火水木金土"[today.getDay()]})`;

  const [date, setDate] = useState(todayStr);
  const [projectId, setProjectId] = useState(PROJECTS[0]?.id ?? "");
  const [siteId, setSiteId] = useState(PROJECTS[0]?.id ?? "");
  const [category, setCategory] = useState<string>(WORK_CATEGORIES[0] ?? "給排水工事");
  const [content, setContent] = useState("給水管布設および継手部の組立");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [rest, setRest] = useState("60 分");
  const [crew, setCrew] = useState(4);
  const [safety, setSafety] = useState<"done" | "pending">("done");
  const [weather, setWeather] = useState<string>("sunny");
  const [memo, setMemo] = useState(
    "給水主管の本設および分岐部の継手作業を実施。明日は圧力試験予定。",
  );

  const projectName =
    PROJECTS.find((p) => p.id === projectId)?.name ?? PROJECTS[0]!.name;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      {/* ─── ヘッダー(パンくず + タイトル + ロール切替 + アイコン群) ─── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1 px-6 pt-2 text-[12px] text-slate-500">
          <Link href="/pc/home" className="hover:underline">
            ホーム
          </Link>
          <span>›</span>
          <span className="text-slate-700">REPORT3入力</span>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-1">
          <div className="min-w-0">
            <h1 className="text-[22px] font-black leading-tight text-slate-950">
              REPORT3入力
            </h1>
            <p className="mt-0.5 text-[12px] text-slate-600">
              現場での作業内容や時間、写真を入力し、日報・原価・工事概況・XP に反映します。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[12px] text-slate-500">
              現在のロール:
              <div className="ml-1 flex items-center rounded-md border border-slate-200 bg-white p-0.5 text-[11px] font-bold">
                <span className="rounded bg-blue-700 px-2 py-1 text-white">管理者</span>
                <span className="px-2 py-1 text-slate-700">事務</span>
                <span className="px-2 py-1 text-slate-700">現場リーダー</span>
                <span className="px-2 py-1 text-slate-700">作業員</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="検索"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <Search className="h-5 w-5 text-slate-700" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="ヘルプ"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <CircleHelp className="h-5 w-5 text-slate-700" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="通知"
              className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <Bell className="h-5 w-5 text-slate-700" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
                12
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-6 py-3">
        {/* ─── 5 ステップ Stepper ─── */}
        <ol className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {STEPS.map((s, idx) => {
            const isCurrent = idx === 0;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    isCurrent
                      ? "bg-blue-700 text-white shadow-sm ring-2 ring-blue-200"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {s.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[11px] font-bold ${
                      isCurrent ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">{s.desc}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="h-px flex-1 bg-slate-200" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        {/* ─── メイン: 2 カラム(form + 右サイドバー) ─── */}
        <div className="grid grid-cols-12 gap-3">
          {/* ─── 左: メインフォーム ─── */}
          <div className="col-span-12 flex flex-col gap-3 lg:col-span-9">
            {/* 基本情報 */}
            <section
              aria-labelledby="basic-info"
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-3 flex items-center gap-2">
                <h2 id="basic-info" className="text-[14px] font-black text-slate-950">
                  基本情報
                </h2>
                <RequiredBadge />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Field label="日付" required>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </Field>
                <Field label="案件名" required>
                  <Select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Field>
                <Field label="現場" required>
                  <Select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Field>
                <Field label="作業区分" required>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={WORK_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="作業内容" required>
                  <select
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-input"
                  >
                    <option>給水管布設および継手部の組立</option>
                    <option>給湯配管 ガス溶接接合</option>
                    <option>排水管更新 既存撤去 + 新設</option>
                    <option>配管点検 圧力試験 + 漏れチェック</option>
                  </select>
                </Field>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Field label="開始時刻" required icon={<Clock className="h-4 w-4 text-slate-400" />}>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                  />
                </Field>
                <Field label="終了時刻" required icon={<Clock className="h-4 w-4 text-slate-400" />}>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input"
                  />
                </Field>
                <Field label="休憩" optional>
                  <Select
                    value={rest}
                    onChange={(e) => setRest(e.target.value)}
                    options={REST_MINUTES.map((r) => ({ value: r, label: r }))}
                  />
                </Field>
                <Field label="作業人数" required icon={<Users className="h-4 w-4 text-slate-400" />}>
                  <input
                    type="number"
                    min={1}
                    value={crew}
                    onChange={(e) => setCrew(Number(e.target.value))}
                    className="form-input"
                  />
                </Field>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <Field label="安全確認" required>
                  <Select
                    value={safety}
                    onChange={(e) => setSafety(e.target.value as "done" | "pending")}
                    options={[
                      { value: "done", label: "実施済み" },
                      { value: "pending", label: "未実施" },
                    ]}
                    leadingIcon={
                      <ShieldCheck
                        className={`h-4 w-4 ${safety === "done" ? "text-emerald-600" : "text-amber-500"}`}
                      />
                    }
                  />
                </Field>
                <Field label="天候" optional>
                  <Select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    options={WEATHER_OPTIONS}
                    leadingIcon={<Sun className="h-4 w-4 text-amber-500" />}
                  />
                </Field>
                <Field label="メモ" optional>
                  <div className="relative">
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      maxLength={200}
                      rows={2}
                      className="form-input resize-none"
                    />
                    <div className="absolute bottom-1 right-2 text-[10px] text-slate-400">
                      {memo.length} / 200
                    </div>
                  </div>
                </Field>
              </div>
            </section>

            {/* 写真添付 */}
            <section
              aria-labelledby="photo-attach"
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <h2 id="photo-attach" className="text-[14px] font-black text-slate-950">
                  写真添付
                </h2>
                <OptionalBadge />
                <p className="ml-2 text-[11px] text-slate-500">
                  現場の進捗や作業状況がわかる写真を添付してください。最大10枚まで(1枚あたり10MBまで)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                {MOCK_PHOTOS.map((p) => (
                  <PhotoThumbnail key={p.id} name={p.name} color={p.color} />
                ))}
                <button
                  type="button"
                  className="flex h-[112px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Upload className="h-5 w-5" aria-hidden />
                  <span className="text-[12px] font-bold">写真を追加</span>
                  <span className="text-[10px]">またはドラッグ&ドロップ</span>
                </button>
              </div>
            </section>
          </div>

          {/* ─── 右: サイドバー(本日の配属現場 + Tips + 反映先) ─── */}
          <aside className="col-span-12 flex flex-col gap-3 lg:col-span-3">
            {/* 本日の配属現場 */}
            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-black text-slate-950">本日の配属現場</h2>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  作業中
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-200 to-blue-400 text-white">
                  <Building2 className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-slate-900">
                    {projectName}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">
                    宮城県仙台市青葉区中央〇丁目〇番〇号
                  </div>
                </div>
              </div>
              <dl className="mt-2 space-y-1.5 text-[11px]">
                <SiteInfoRow
                  icon={<HardHat className="h-3.5 w-3.5 text-slate-400" />}
                  label="現場リーダー"
                  value="田中 一郎"
                />
                <SiteInfoRow
                  icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                  label="作業区分"
                  value={category}
                />
                <SiteInfoRow
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />}
                  label="予定作業"
                  value="給水管布設・継手"
                />
                <SiteInfoRow
                  icon={<Users className="h-3.5 w-3.5 text-slate-400" />}
                  label="作業人数(予定)"
                  value="4 名"
                />
                <SiteInfoRow
                  icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                  label="作業時間(予定)"
                  value="08:00 - 17:00"
                />
              </dl>
            </section>

            {/* 入力のコツ */}
            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h2 className="mb-2 flex items-center gap-1 text-[13px] font-black text-slate-950">
                <span aria-hidden>💡</span> 入力のコツ・クイックTips
              </h2>
              <ul className="space-y-1.5 text-[11px] text-slate-700">
                {TIPS.map((t) => (
                  <li key={t} className="flex items-start gap-1.5">
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 反映先 */}
            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h2 className="mb-2 flex items-center gap-1 text-[13px] font-black text-slate-950">
                <Cloud className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                1回の送信で一括反映されます
              </h2>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {REFLECT_TARGETS.map((r) => (
                  <span
                    key={r.label}
                    className={`rounded-md px-2 py-1 text-[11px] font-bold ${r.color}`}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                ※ 送信後は各サービスに最新データが反映されます。
              </p>
            </section>
          </aside>
        </div>

        {/* ─── アクションバー ─── */}
        <div className="sticky bottom-0 z-10 mt-2 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
          <Link
            href="/pc/home"
            className="rounded-md border border-slate-300 px-4 py-2 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            ‹ 戻る
          </Link>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <span className="hidden md:inline">
              送信すると、日報・原価・工事概況・XP にデータが反映されます。
            </span>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              一時保存
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              下書き保存
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-md bg-blue-700 px-5 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              <Upload className="h-4 w-4" aria-hidden />
              送信して反映
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 6px;
          border: 1px solid rgb(203 213 225);
          background-color: white;
          padding: 6px 10px;
          font-size: 12px;
          color: rgb(15 23 42);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: rgb(29 78 216);
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
        }
      `}</style>
    </div>
  );
}

function RequiredBadge() {
  return (
    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
      必須
    </span>
  );
}

function OptionalBadge() {
  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
      任意
    </span>
  );
}

function Field({
  label,
  required,
  optional,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-700">{label}</span>
        {required && <RequiredBadge />}
        {optional && <OptionalBadge />}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <div className={icon ? "[&_input]:pl-7 [&_select]:pl-7" : ""}>{children}</div>
      </div>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  leadingIcon,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  leadingIcon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
          {leadingIcon}
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`form-input appearance-none ${leadingIcon ? "pl-7" : ""}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PhotoThumbnail({ name, color }: { name: string; color: string }) {
  return (
    <div className="group relative">
      <div
        className="flex h-[112px] items-center justify-center overflow-hidden rounded-lg border border-slate-200"
        style={{
          background: `linear-gradient(135deg, ${color}, #e2e8f0)`,
        }}
      >
        <svg viewBox="0 0 80 60" className="h-12 w-12 text-white/80" aria-hidden>
          <rect x="10" y="20" width="60" height="32" rx="2" fill="currentColor" />
          <circle cx="28" cy="32" r="4" fill="white" />
          <path d="M40 48 L52 36 L66 48 Z" fill="white" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="写真を削除"
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-90 transition-opacity hover:bg-slate-900"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
      <div className="mt-1 truncate text-center text-[10px] text-slate-600" title={name}>
        {name}
      </div>
    </div>
  );
}

function SiteInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {icon}
        <span className="truncate text-slate-500">{label}</span>
      </div>
      <span className="truncate font-bold text-slate-900">{value}</span>
    </div>
  );
}
