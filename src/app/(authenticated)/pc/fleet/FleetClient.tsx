"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Settings,
  MapPin,
  Calendar,
  Clock,
  QrCode,
  ClipboardList,
  Fuel,
  Hammer,
  Plus,
  Search,
  User,
  History,
  Activity,
} from "lucide-react";
import { MetricCard, CardSection, PageHeader } from "@/components/ui";

/* ============================================================
   抽象 MapView 再利用(Leaflet)
   ============================================================ */

const MapView = dynamic(
  () => import("../dispatch-map/_components/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[180px] w-full items-center justify-center bg-slate-50 text-xs text-slate-500">
        マップを読み込み中...
      </div>
    ),
  },
);

/* ============================================================
   型 / 定数
   ============================================================ */

type FleetStatus = "active" | "maintenance" | "idle" | "warning";

const STATUS_META: Record<
  FleetStatus,
  { label: string; pill: string; dot: string; icon: typeof CheckCircle2 }
> = {
  active: {
    label: "稼働中",
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  maintenance: {
    label: "整備中",
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: Wrench,
  },
  idle: {
    label: "待機",
    pill: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    icon: Clock,
  },
  warning: {
    label: "警告",
    pill: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    icon: AlertTriangle,
  },
};

type AssetType = "vehicle" | "tool";

type Vehicle = {
  id: string;
  type: AssetType;
  name: string;
  code: string; // 車両番号 / 工具 No
  category: string; // 車種 / 工具種別
  location: string;
  status: FleetStatus;
  assignedProject?: string;
  assignedTo?: string;
  /** GPS 緯度 */
  lat: number;
  /** GPS 経度 */
  lng: number;
  /** 最終 GPS 更新 */
  gpsUpdatedAt: string;
  /** 走行距離 */
  mileage?: number;
  /** 燃料残量 % */
  fuelPct?: number;
  /** 整備履歴 */
  maintenanceLogs: Array<{ date: string; type: string; note: string }>;
  /** 警告 */
  warnings?: string[];
  /** 工程予定 */
  schedule: Array<{ date: string; project: string; note: string }>;
  /** 画像種別(アイコン色変えに使用) */
  iconColor: string;
};

const MOCK_FLEET: Vehicle[] = [
  {
    id: "v1",
    type: "vehicle",
    name: "ダンプトラック 1 号",
    code: "宮城 100 あ 1234",
    category: "ダンプ・大型",
    location: "仙台駅前ビル給排水改修 現場",
    status: "active",
    assignedProject: "仙台駅前ビル給排水改修",
    assignedTo: "田中 一郎",
    lat: 38.2606,
    lng: 140.8819,
    gpsUpdatedAt: "2026-05-14 16:42",
    mileage: 86_420,
    fuelPct: 72,
    maintenanceLogs: [
      { date: "2026-04-15", type: "オイル交換", note: "通常点検" },
      { date: "2026-02-10", type: "タイヤ交換", note: "夏タイヤへ" },
      { date: "2025-12-05", type: "車検", note: "通過" },
    ],
    warnings: [],
    schedule: [
      { date: "2026-05-15", project: "仙台駅前ビル給排水改修", note: "資材搬入" },
      { date: "2026-05-16", project: "泉中央マンション給湯設備", note: "現場移動" },
      { date: "2026-05-17", project: "整備工場", note: "12 ヶ月点検" },
    ],
    iconColor: "#2563eb",
  },
  {
    id: "v2",
    type: "vehicle",
    name: "ハイエース 2 号",
    code: "宮城 500 い 5678",
    category: "バン・中型",
    location: "石巻市商業施設配管更新 現場",
    status: "active",
    assignedProject: "石巻市商業施設配管更新",
    assignedTo: "高橋 健",
    lat: 38.4346,
    lng: 141.3025,
    gpsUpdatedAt: "2026-05-14 16:38",
    mileage: 124_580,
    fuelPct: 45,
    maintenanceLogs: [
      { date: "2026-03-20", type: "オイル交換", note: "" },
      { date: "2025-11-10", type: "車検", note: "通過" },
    ],
    warnings: ["燃料残量 45% / 給油推奨"],
    schedule: [
      { date: "2026-05-15", project: "石巻市商業施設配管更新", note: "作業継続" },
      { date: "2026-05-20", project: "気仙沼漁港冷凍倉庫排水改修", note: "応援" },
    ],
    iconColor: "#10b981",
  },
  {
    id: "v3",
    type: "vehicle",
    name: "高所作業車",
    code: "宮城 800 う 9012",
    category: "特殊車両",
    location: "整備工場",
    status: "maintenance",
    lat: 38.2682,
    lng: 140.8694,
    gpsUpdatedAt: "2026-05-13 09:00",
    mileage: 42_300,
    fuelPct: 60,
    maintenanceLogs: [
      { date: "2026-05-13", type: "ブーム油圧点検", note: "実施中" },
      { date: "2026-01-22", type: "整備", note: "ブーム伸縮ワイヤー交換" },
    ],
    warnings: ["整備中 / 復帰予定 2026-05-16"],
    schedule: [
      { date: "2026-05-13〜16", project: "整備工場", note: "ブーム点検" },
      { date: "2026-05-17", project: "白石市学校給湯設備更新", note: "高所作業" },
    ],
    iconColor: "#f59e0b",
  },
  {
    id: "v4",
    type: "vehicle",
    name: "軽トラック 3 号",
    code: "宮城 600 え 3456",
    category: "軽トラ",
    location: "多賀城市物流倉庫 現場",
    status: "active",
    assignedProject: "多賀城市物流倉庫排水工事",
    assignedTo: "伊藤 翔太",
    lat: 38.2974,
    lng: 140.989,
    gpsUpdatedAt: "2026-05-14 16:35",
    mileage: 68_100,
    fuelPct: 88,
    maintenanceLogs: [
      { date: "2026-04-05", type: "オイル交換", note: "" },
    ],
    warnings: [],
    schedule: [
      { date: "2026-05-15", project: "多賀城市物流倉庫排水工事", note: "資材運搬" },
    ],
    iconColor: "#7c3aed",
  },
  {
    id: "v5",
    type: "vehicle",
    name: "ローリー車",
    code: "宮城 200 お 7890",
    category: "タンクローリー",
    location: "本社車庫",
    status: "idle",
    lat: 38.27,
    lng: 140.87,
    gpsUpdatedAt: "2026-05-14 08:00",
    mileage: 156_200,
    fuelPct: 95,
    maintenanceLogs: [
      { date: "2026-04-28", type: "車検", note: "通過" },
    ],
    warnings: [],
    schedule: [
      { date: "2026-05-18", project: "気仙沼漁港冷凍倉庫排水改修", note: "燃料補給用" },
    ],
    iconColor: "#ec4899",
  },
  {
    id: "v6",
    type: "vehicle",
    name: "クレーン車",
    code: "宮城 900 か 1122",
    category: "特殊車両",
    location: "本社車庫",
    status: "warning",
    lat: 38.27,
    lng: 140.87,
    gpsUpdatedAt: "2026-05-14 15:00",
    mileage: 78_400,
    fuelPct: 32,
    maintenanceLogs: [
      { date: "2026-03-15", type: "車検", note: "通過" },
      { date: "2026-05-10", type: "異音点検", note: "原因調査中" },
    ],
    warnings: ["油圧異音発生 / 整備手配中", "燃料残量低下"],
    schedule: [
      { date: "2026-05-20", project: "整備工場", note: "油圧系統点検" },
    ],
    iconColor: "#ef4444",
  },
  // 工具
  {
    id: "t1",
    type: "tool",
    name: "パイプレンチ ヘビーデューティー",
    code: "TWL-2025-001",
    category: "手工具",
    location: "仙台駅前ビル給排水改修 現場",
    status: "active",
    assignedProject: "仙台駅前ビル給排水改修",
    assignedTo: "田中 一郎",
    lat: 38.2606,
    lng: 140.8819,
    gpsUpdatedAt: "2026-05-14 12:00",
    maintenanceLogs: [
      { date: "2026-04-01", type: "点検", note: "問題なし" },
    ],
    warnings: [],
    schedule: [
      { date: "2026-05-15〜31", project: "仙台駅前ビル給排水改修", note: "貸出中" },
    ],
    iconColor: "#3b82f6",
  },
  {
    id: "t2",
    type: "tool",
    name: "ガス溶接機 #2",
    code: "TWL-2025-002",
    category: "電動工具",
    location: "本社倉庫",
    status: "idle",
    lat: 38.27,
    lng: 140.87,
    gpsUpdatedAt: "2026-05-13 18:00",
    maintenanceLogs: [
      { date: "2026-03-12", type: "ボンベ交換", note: "通常" },
    ],
    warnings: [],
    schedule: [
      { date: "2026-05-18", project: "大和町工業団地ガス配管", note: "貸出予定" },
    ],
    iconColor: "#ef4444",
  },
  {
    id: "t3",
    type: "tool",
    name: "圧力試験ポンプ",
    code: "TWL-2025-003",
    category: "計測機器",
    location: "整備工場",
    status: "maintenance",
    lat: 38.2682,
    lng: 140.8694,
    gpsUpdatedAt: "2026-05-12 14:30",
    maintenanceLogs: [
      { date: "2026-05-12", type: "校正", note: "実施中" },
    ],
    warnings: ["校正中 / 復帰 2026-05-17"],
    schedule: [
      { date: "2026-05-18", project: "栗原市公共施設配管メンテ", note: "圧力試験" },
    ],
    iconColor: "#10b981",
  },
];

type TabKey = "vehicle" | "process" | "incident";
const TABS: Array<{ key: TabKey; label: string; icon: typeof Truck }> = [
  { key: "vehicle", label: "車両 / 工具管理", icon: Truck },
  { key: "process", label: "工程確認", icon: Calendar },
  { key: "incident", label: "災害履歴", icon: History },
];

/* ============================================================
   メインコンポーネント
   ============================================================ */

export function FleetClient() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | AssetType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | FleetStatus>("all");
  const [activeTab, setActiveTab] = useState<TabKey>("vehicle");
  const [selectedId, setSelectedId] = useState<string>(MOCK_FLEET[0]?.id ?? "");

  const stats = useMemo(() => {
    return {
      active: MOCK_FLEET.filter((f) => f.type === "vehicle" && f.status === "active").length,
      maintenance: MOCK_FLEET.filter((f) => f.status === "maintenance").length,
      tools: MOCK_FLEET.filter((f) => f.type === "tool").length,
      warnings: MOCK_FLEET.filter((f) => f.status === "warning" || (f.warnings && f.warnings.length > 0)).length,
    };
  }, []);

  const filtered = useMemo(() => {
    return MOCK_FLEET.filter((f) => {
      if (filterType !== "all" && f.type !== filterType) return false;
      if (filterStatus !== "all" && f.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${f.name} ${f.code} ${f.category} ${f.assignedProject ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, filterType, filterStatus]);

  const selected =
    filtered.find((f) => f.id === selectedId) ?? filtered[0] ?? MOCK_FLEET[0]!;

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <div>
          <nav className="text-[11px] text-slate-500" aria-label="パンくず">
            <span>SAKURA OS</span>
            <span className="mx-1">/</span>
            <span className="font-medium text-slate-700">車両・工具</span>
          </nav>
          <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-blue-600" />
            車両・工具
            <span className="text-xs font-normal text-slate-500">
              車両 GPS 位置・工具貸出・整備履歴・警告を統合管理
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <QrCode className="h-3.5 w-3.5" />
            QR スキャン
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新規登録
          </button>
        </div>
      </header>

      {/* KPI 4 cards */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="稼働中"
          value={`${stats.active} 台`}
          subText="現場に配置中"
          icon={CheckCircle2}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
        <MetricCard
          label="整備中"
          value={`${stats.maintenance} 台`}
          subText="復帰予定確認中"
          icon={Wrench}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="工具"
          value={`${stats.tools} 個`}
          subText="QR 管理"
          icon={Hammer}
          accent="border-l-blue-500"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="警告"
          value={`${stats.warnings} 件`}
          subText="燃料・整備・異音"
          icon={AlertTriangle}
          accent="border-l-rose-500"
          iconColor="text-rose-600"
        />
      </div>

      {/* タブ */}
      <div role="tablist" aria-label="車両・工具タブ" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* フィルタバー */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="車両番号、工具名、案件名で検索"
            aria-label="車両・工具検索"
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | AssetType)}
          aria-label="種別"
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="all">すべて</option>
          <option value="vehicle">車両</option>
          <option value="tool">工具</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | FleetStatus)}
          aria-label="ステータス"
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="all">すべてのステータス</option>
          {(Object.keys(STATUS_META) as FleetStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-slate-500">{filtered.length} 件</span>
      </div>

      {/* メイン: 左 8 / 右 4 */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 左 panel: list table === */}
        <section className="col-span-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-xs">
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                  <th scope="col" className="px-2 py-2 text-left font-medium">名称 / 種別</th>
                  <th scope="col" className="px-2 py-2 text-left font-medium">番号</th>
                  <th scope="col" className="px-2 py-2 text-left font-medium">所在地</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">ステータス</th>
                  <th scope="col" className="px-2 py-2 text-left font-medium">担当</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">GPS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-500">
                      該当する車両・工具がありません
                    </td>
                  </tr>
                ) : (
                  filtered.map((f) => {
                    const meta = STATUS_META[f.status];
                    const StatusIcon = meta.icon;
                    const isActive = f.id === selected.id;
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedId(f.id)}
                        aria-current={isActive ? "true" : undefined}
                        aria-selected={isActive}
                        className={`cursor-pointer border-b border-slate-100 transition-colors ${
                          isActive ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            {f.type === "vehicle" ? (
                              <Truck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: f.iconColor }} />
                            ) : (
                              <Hammer className="h-3.5 w-3.5 flex-shrink-0" style={{ color: f.iconColor }} />
                            )}
                            <div className="min-w-0">
                              <div className="truncate font-medium text-slate-800">{f.name}</div>
                              <div className="text-[10px] text-slate-500">{f.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 font-mono text-[10px] text-slate-700">{f.code}</td>
                        <td className="px-2 py-2">
                          <div className="truncate text-slate-700">{f.location}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}
                          >
                            <StatusIcon className="h-2.5 w-2.5" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-slate-700">
                          {f.assignedTo ? (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" aria-hidden />
                              <span className="truncate">{f.assignedTo}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <MapPin className="inline h-3.5 w-3.5 text-blue-500" aria-hidden />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* === 右 panel: 詳細 === */}
        <aside className="col-span-4 flex flex-col gap-3">
          <FleetDetailPanel asset={selected} />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */


function FleetDetailPanel({ asset }: { asset: Vehicle }) {
  const meta = STATUS_META[asset.status];
  const StatusIcon = meta.icon;
  return (
    <>
      {/* ヘッダー card */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            {asset.type === "vehicle" ? (
              <Truck className="h-5 w-5" style={{ color: asset.iconColor }} />
            ) : (
              <Hammer className="h-5 w-5" style={{ color: asset.iconColor }} />
            )}
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{asset.name}</h3>
              <div className="text-[10px] font-mono text-slate-500">{asset.code}</div>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}
          >
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>

        {/* 配属案件 */}
        <div className="mt-2 space-y-1">
          <InfoRow icon={ClipboardList} label="配属案件" value={asset.assignedProject ?? "—"} />
          <InfoRow icon={User} label="担当者" value={asset.assignedTo ?? "—"} />
          <InfoRow icon={MapPin} label="所在地" value={asset.location} />
          {asset.mileage !== undefined && (
            <InfoRow icon={Activity} label="走行距離" value={`${asset.mileage.toLocaleString()} km`} />
          )}
          {asset.fuelPct !== undefined && (
            <InfoRow
              icon={Fuel}
              label="燃料残量"
              value={
                <span
                  className={`font-semibold ${
                    asset.fuelPct < 40 ? "text-rose-700" : asset.fuelPct < 60 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {asset.fuelPct}%
                </span>
              }
            />
          )}
        </div>
      </section>

      {/* 警告 */}
      {asset.warnings && asset.warnings.length > 0 && (
        <section className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
          <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            警告({asset.warnings.length} 件)
          </h4>
          <ul className="flex flex-col gap-1">
            {asset.warnings.map((w, i) => (
              <li key={i} className="text-[11px] text-rose-700">
                · {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 工程予定 */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          工程予定
        </h4>
        <ul className="flex flex-col gap-1.5">
          {asset.schedule.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
            >
              <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Clock className="h-2.5 w-2.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium text-blue-700">{s.date}</div>
                <div className="truncate text-[11px] font-medium text-slate-800">{s.project}</div>
                <div className="truncate text-[10px] text-slate-500">{s.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 整備履歴 */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Settings className="h-3.5 w-3.5 text-amber-600" />
          整備履歴
        </h4>
        <ul className="flex flex-col gap-1.5">
          {asset.maintenanceLogs.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px]">
              <Wrench className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-slate-800">{m.type}</span>
                  <span className="text-[10px] text-slate-500">{m.date}</span>
                </div>
                {m.note && <div className="text-[10px] text-slate-500">{m.note}</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* GPS ミニマップ(車両のみ) */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          現在の GPS 位置
          <span className="ml-auto text-[10px] font-normal text-slate-500">
            最終更新: {asset.gpsUpdatedAt}
          </span>
        </h4>
        <div className="h-[180px] overflow-hidden rounded-md border border-slate-200">
          <MapView
            projects={[
              {
                id: asset.id,
                code: asset.code,
                name: asset.name,
                customer: "",
                workType: "",
                progressPct: 0,
                plannedPct: 0,
                startedAt: "",
                dueAt: "",
                contractYen: 0,
                status:
                  asset.status === "active"
                    ? "active"
                    : asset.status === "maintenance"
                      ? "delayed"
                      : asset.status === "warning"
                        ? "delayed"
                        : "upcoming",
                leader: asset.assignedTo ?? "",
                crew: 1,
                lat: asset.lat,
                lng: asset.lng,
                address: asset.location,
              },
            ]}
            selectedId={asset.id}
            onSelect={() => {}}
            center={{ lat: asset.lat, lng: asset.lng }}
            zoom={13}
          />
        </div>
      </section>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <Icon className="h-3 w-3 flex-shrink-0 text-slate-400" aria-hidden />
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span className="ml-auto truncate text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
