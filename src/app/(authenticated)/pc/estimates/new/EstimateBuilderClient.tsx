"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  Eye,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Send,
  Printer,
  Download,
  ArrowLeft,
  Building2,
  CheckCircle2,
  TrendingUp,
  XCircle,
  DollarSign,
} from "lucide-react";
import type { ProjectRow } from "../../projects/_data/mock-projects";

/* ============================================================
   定数 / 型
   ============================================================ */

const TAX_RATE = 0.1; // 消費税 10%

const WORK_TYPE_UNIT_PRICE: Record<string, number> = {
  給排水工事: 12_000,
  給湯設備工事: 18_000,
  排水管工事: 14_500,
  配管点検工事: 8_000,
  改修工事: 22_000,
  ガス配管工事: 16_500,
};

type EstimateItem = {
  id: string;
  category: string; // 工種
  description: string; // 項目名
  quantity: number;
  unit: string; // 単位(式/m/ヶ所/日)
  unitPrice: number; // 単価(円)
};

type TabKey = "basic" | "items" | "preview" | "approval";

const TABS: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: "basic", label: "基本情報", icon: FileText },
  { key: "items", label: "明細", icon: Layers },
  { key: "preview", label: "プレビュー", icon: Eye },
  { key: "approval", label: "承認フロー", icon: CheckSquare },
];

/* ============================================================
   メインクライアントコンポーネント
   ============================================================ */

export function EstimateBuilderClient({ projects }: { projects: ProjectRow[] }) {
  // タブ state
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // 基本情報
  const firstProject = projects[0];
  const [customerName, setCustomerName] = useState(firstProject?.customer ?? "");
  const [projectId, setProjectId] = useState(firstProject?.id ?? "");
  const [contactPerson, setContactPerson] = useState("田中 一郎");
  const [issueDate, setIssueDate] = useState("2026-05-14");
  const [expiryDate, setExpiryDate] = useState("2026-06-14");
  const [title, setTitle] = useState(
    firstProject ? `${firstProject.name} 見積書` : "御見積書",
  );

  // 選択中の案件
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? firstProject,
    [projects, projectId, firstProject],
  );

  // 見積明細(初期値は選択案件から自動生成)
  const [items, setItems] = useState<EstimateItem[]>(() =>
    generateMockItems(firstProject),
  );

  // 案件が切り替わったら明細も自動生成
  const handleProjectChange = (newId: string) => {
    setProjectId(newId);
    const newProj = projects.find((p) => p.id === newId);
    if (newProj) {
      setCustomerName(newProj.customer);
      setTitle(`${newProj.name} 見積書`);
      setItems(generateMockItems(newProj));
    }
  };

  // 合計計算
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items],
  );
  const tax = useMemo(() => Math.floor(subtotal * TAX_RATE), [subtotal]);
  const grandTotal = subtotal + tax;

  // 明細操作
  const addItem = () => {
    const workType = selectedProject?.workType ?? "給排水工事";
    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      category: workType,
      description: "新規項目",
      quantity: 1,
      unit: "式",
      unitPrice: WORK_TYPE_UNIT_PRICE[workType] ?? 10000,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = <K extends keyof EstimateItem>(
    id: string,
    key: K,
    value: EstimateItem[K],
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <div>
          <nav className="text-[11px] text-slate-500" aria-label="パンくず">
            <Link href="/pc/estimates" className="hover:underline">
              見積一覧
            </Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-slate-700">新規作成</span>
          </nav>
          <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-blue-600" />
            見積書作成
            <span className="text-xs font-normal text-slate-500">
              案件・顧客を選択し明細を入力すると、合計とプレビューが自動更新されます
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" />
            一時保存
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Send className="h-3.5 w-3.5" />
            承認申請
          </button>
        </div>
      </header>

      {/* タブ */}
      <div role="tablist" aria-label="見積書セクション切替" className="flex gap-1 border-b border-slate-200">
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

      {/* KPI 4 cards */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="進行中"
          value="8"
          subText="承認待ち 3 件"
          icon={TrendingUp}
          accent="border-l-blue-500"
          iconColor="text-blue-600"
        />
        <KpiCard
          label="受注済み"
          value="24"
          subText="今月 +5"
          icon={CheckCircle2}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
        <KpiCard
          label="失注"
          value="3"
          subText="勝率 88.9%"
          icon={XCircle}
          accent="border-l-rose-500"
          iconColor="text-rose-600"
        />
        <KpiCard
          label="売上(承認済)"
          value={`¥${(9_650_000).toLocaleString()}`}
          subText="今月分"
          icon={DollarSign}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
      </div>

      {/* 2-pane: 左フォーム / 右プレビュー */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 左 panel: 編集 === */}
        <section className="col-span-7 flex flex-col gap-3">
          {/* 基本情報 card */}
          <CardSection
            title="基本情報"
            icon={Building2}
            visible={activeTab === "basic" || activeTab === "items"}
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField label="顧客名" required>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="案件" required>
                <select
                  value={projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="form-input"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="担当者">
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="件名">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="発行日">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="有効期限">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>
          </CardSection>

          {/* 見積明細 */}
          <CardSection
            title="見積明細"
            icon={Layers}
            visible={activeTab === "items" || activeTab === "basic"}
            headerRight={
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-md border border-blue-500 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-3 w-3" />
                明細追加
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs">
                <colgroup>
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">項目</th>
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">工種</th>
                    <th scope="col" className="px-1 py-1.5 text-right font-medium">数量</th>
                    <th scope="col" className="px-1 py-1.5 text-center font-medium">単位</th>
                    <th scope="col" className="px-1 py-1.5 text-right font-medium">単価</th>
                    <th scope="col" className="px-1 py-1.5 text-right font-medium">金額</th>
                    <th scope="col" className="px-1 py-1.5 text-center font-medium" aria-label="操作"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-500">
                        明細を追加してください
                      </td>
                    </tr>
                  ) : (
                    items.map((it, i) => (
                      <tr key={it.id} className="border-b border-slate-100 align-middle hover:bg-slate-50/50">
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => updateItem(it.id, "description", e.target.value)}
                            aria-label={`明細 ${i + 1} 項目`}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={it.category}
                            onChange={(e) => updateItem(it.id, "category", e.target.value)}
                            aria-label={`明細 ${i + 1} 工種`}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none"
                          >
                            {Object.keys(WORK_TYPE_UNIT_PRICE).map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            value={it.quantity}
                            min={0}
                            onChange={(e) => updateItem(it.id, "quantity", Number(e.target.value))}
                            aria-label={`明細 ${i + 1} 数量`}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-right text-xs hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <select
                            value={it.unit}
                            onChange={(e) => updateItem(it.id, "unit", e.target.value)}
                            aria-label={`明細 ${i + 1} 単位`}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-center text-xs hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none"
                          >
                            <option value="式">式</option>
                            <option value="m">m</option>
                            <option value="ヶ所">ヶ所</option>
                            <option value="日">日</option>
                            <option value="個">個</option>
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            value={it.unitPrice}
                            min={0}
                            onChange={(e) => updateItem(it.id, "unitPrice", Number(e.target.value))}
                            aria-label={`明細 ${i + 1} 単価`}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-right text-xs hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="px-1 py-1.5 text-right font-semibold text-slate-900">
                          ¥{(it.quantity * it.unitPrice).toLocaleString()}
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            aria-label={`明細 ${i + 1} を削除`}
                            className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 合計 */}
            <div className="mt-3 ml-auto w-72 rounded-md border border-slate-200 bg-slate-50 p-3">
              <SummaryRow label="小計" value={subtotal} />
              <SummaryRow label={`消費税(${TAX_RATE * 100}%)`} value={tax} />
              <div
                className="mt-1 flex items-baseline justify-between border-t border-slate-300 pt-2"
                aria-live="polite"
              >
                <span className="text-xs font-semibold text-slate-700">合計金額</span>
                <span className="text-lg font-bold text-blue-700">
                  ¥{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </CardSection>

          {/* 承認フロー(タブ表示時のみ) */}
          {activeTab === "approval" && (
            <CardSection title="承認フロー" icon={CheckSquare} visible>
              <ApprovalFlowDiagram />
            </CardSection>
          )}
        </section>

        {/* === 右 panel: プレビュー === */}
        <aside className="col-span-5">
          <CardSection title="御見積書プレビュー" icon={Eye} visible sticky>
            <EstimatePreview
              customerName={customerName}
              title={title}
              issueDate={issueDate}
              expiryDate={expiryDate}
              items={items}
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
              contactPerson={contactPerson}
            />
          </CardSection>
        </aside>
      </div>

      {/* 下端アクションバー */}
      <footer className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 shadow-sm">
        <Link
          href="/pc/estimates"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          戻る
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            下書き保存
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            PDF 出力
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            印刷
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            クラウドサイン送信
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Send className="h-3.5 w-3.5" />
            承認申請
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */

function KpiCard({
  label,
  value,
  subText,
  icon: Icon,
  accent,
  iconColor,
}: {
  label: string;
  value: string;
  subText: string;
  icon: typeof FileText;
  accent: string;
  iconColor: string;
}) {
  return (
    <div className={`flex h-[88px] flex-col rounded-lg border border-slate-200 bg-white p-3 border-l-4 ${accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="mt-1 text-lg font-bold leading-none text-slate-900">{value}</div>
      <div className="mt-auto text-[10px] text-slate-500">{subText}</div>
    </div>
  );
}

function CardSection({
  title,
  icon: Icon,
  children,
  headerRight,
  visible,
  sticky = false,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  visible: boolean;
  sticky?: boolean;
}) {
  if (!visible) return null;
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-3 ${
        sticky ? "sticky top-3" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Icon className="h-3.5 w-3.5 text-blue-600" />
          {title}
        </h2>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-1 inline-block rounded-full bg-rose-50 px-1 py-0 text-[9px] font-medium text-rose-700">
            必須
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between py-0.5 text-[11px]">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-800">¥{value.toLocaleString()}</span>
    </div>
  );
}

function EstimatePreview({
  customerName,
  title,
  issueDate,
  expiryDate,
  items,
  subtotal,
  tax,
  grandTotal,
  contactPerson,
}: {
  customerName: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  contactPerson: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-[11px] text-slate-700 shadow-sm">
      {/* タイトル */}
      <div className="text-center">
        <h3 className="text-base font-bold tracking-widest text-slate-900">御 見 積 書</h3>
        <div className="mt-1 text-[10px] text-slate-500">No. EST-2026-{String(Date.now()).slice(-5)}</div>
      </div>

      {/* 宛先 + 発行元 */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <div className="font-semibold text-slate-800">宛先</div>
          <div className="mt-0.5 text-slate-700">{customerName} 御中</div>
          <div className="text-slate-500">担当: {contactPerson} 様</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-slate-800">さくら株式会社</div>
          <div className="mt-0.5 text-slate-500">宮城県仙台市青葉区〇〇〇〇</div>
          <div className="text-slate-500">TEL: 022-XXX-XXXX</div>
          <div className="mt-0.5 text-slate-500">発行日: {issueDate}</div>
          <div className="text-slate-500">有効期限: {expiryDate}</div>
        </div>
      </div>

      {/* 件名 */}
      <div className="mt-3 rounded-md bg-slate-50 px-2 py-1.5 text-[11px]">
        <span className="text-slate-500">件名:</span>{" "}
        <span className="font-semibold text-slate-900">{title}</span>
      </div>

      {/* 合計金額(プレビュー上部) */}
      <div className="mt-3 flex items-baseline justify-between border-b-2 border-slate-300 pb-1">
        <span className="text-[10px] font-medium text-slate-600">御見積金額(税込)</span>
        <span className="text-lg font-bold text-blue-700">¥{grandTotal.toLocaleString()}</span>
      </div>

      {/* 明細表 */}
      <table className="mt-2 w-full text-[10px]">
        <thead>
          <tr className="border-b border-slate-300 text-slate-600">
            <th className="py-1 text-left font-medium">項目</th>
            <th className="py-1 text-right font-medium">数量</th>
            <th className="py-1 text-right font-medium">単価</th>
            <th className="py-1 text-right font-medium">金額</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 8).map((it) => (
            <tr key={it.id} className="border-b border-slate-100">
              <td className="py-1">
                <div className="font-medium text-slate-800">{it.description}</div>
                <div className="text-[9px] text-slate-500">{it.category}</div>
              </td>
              <td className="py-1 text-right">{it.quantity} {it.unit}</td>
              <td className="py-1 text-right">¥{it.unitPrice.toLocaleString()}</td>
              <td className="py-1 text-right font-semibold">
                ¥{(it.quantity * it.unitPrice).toLocaleString()}
              </td>
            </tr>
          ))}
          {items.length > 8 && (
            <tr>
              <td colSpan={4} className="py-1 text-center text-[9px] text-slate-500">
                ...他 {items.length - 8} 明細
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="py-1 text-right text-slate-600">小計</td>
            <td className="py-1 text-right">¥{subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 text-right text-slate-600">消費税</td>
            <td className="py-1 text-right">¥{tax.toLocaleString()}</td>
          </tr>
          <tr className="border-t-2 border-slate-300">
            <td colSpan={3} className="py-1.5 text-right font-semibold">合計</td>
            <td className="py-1.5 text-right font-bold text-blue-700">¥{grandTotal.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* 備考 */}
      <div className="mt-2 rounded bg-slate-50 px-2 py-1.5 text-[9px] text-slate-600">
        <span className="font-semibold">備考:</span>{" "}
        本見積書の有効期限は発行日より 1 ヶ月とさせていただきます。
      </div>
    </div>
  );
}

function ApprovalFlowDiagram() {
  const stages = [
    { name: "申請者", role: "営業担当", status: "done" },
    { name: "現場主任", role: "技術確認", status: "current" },
    { name: "事務部", role: "原価確認", status: "pending" },
    { name: "社長", role: "最終承認", status: "pending" },
  ];

  return (
    <div className="flex items-center justify-between gap-2">
      {stages.map((s, i) => (
        <div key={s.name} className="flex flex-1 items-center">
          <div className="flex-1 text-center">
            <div
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                s.status === "done"
                  ? "bg-emerald-100 text-emerald-700"
                  : s.status === "current"
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                    : "bg-slate-100 text-slate-500"
              }`}
              aria-current={s.status === "current" ? "step" : undefined}
            >
              {i + 1}
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-800">{s.name}</div>
            <div className="text-[9px] text-slate-500">{s.role}</div>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-0.5 w-full ${
                s.status === "done" ? "bg-emerald-300" : "bg-slate-200"
              }`}
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ヘルパー: モック見積明細生成
   ============================================================ */

function generateMockItems(project: ProjectRow | undefined): EstimateItem[] {
  if (!project) return [];
  const workType = project.workType;
  const unitPrice = WORK_TYPE_UNIT_PRICE[workType] ?? 10000;

  // 工種別の明細テンプレート
  const templates: Record<string, Array<{ description: string; unit: string; quantity: number }>> = {
    給排水工事: [
      { description: "給水管布設工事", unit: "m", quantity: 80 },
      { description: "排水管接続工事", unit: "ヶ所", quantity: 12 },
      { description: "止水栓・継手部材", unit: "式", quantity: 1 },
      { description: "現場諸経費", unit: "式", quantity: 1 },
    ],
    給湯設備工事: [
      { description: "給湯配管敷設", unit: "m", quantity: 45 },
      { description: "給湯器設置工事", unit: "ヶ所", quantity: 6 },
      { description: "保温材施工", unit: "m", quantity: 45 },
      { description: "現場諸経費", unit: "式", quantity: 1 },
    ],
    排水管工事: [
      { description: "管路掘削工事", unit: "m", quantity: 30 },
      { description: "管渠敷設", unit: "m", quantity: 30 },
      { description: "舗装復旧工事", unit: "m", quantity: 30 },
      { description: "現場諸経費", unit: "式", quantity: 1 },
    ],
    配管点検工事: [
      { description: "圧力試験", unit: "ヶ所", quantity: 8 },
      { description: "点検報告書作成", unit: "式", quantity: 1 },
      { description: "立会い費用", unit: "日", quantity: 2 },
    ],
    改修工事: [
      { description: "既設配管撤去", unit: "m", quantity: 20 },
      { description: "新設配管工事", unit: "m", quantity: 25 },
      { description: "復旧工事", unit: "式", quantity: 1 },
      { description: "産業廃棄物処理", unit: "式", quantity: 1 },
    ],
    ガス配管工事: [
      { description: "ガス管敷設", unit: "m", quantity: 35 },
      { description: "気密試験", unit: "ヶ所", quantity: 4 },
      { description: "接続工事", unit: "ヶ所", quantity: 6 },
      { description: "現場諸経費", unit: "式", quantity: 1 },
    ],
  };

  const template = templates[workType] ?? templates.給排水工事!;
  return template.map((t, i) => ({
    id: `item-${project.id}-${i}`,
    category: workType,
    description: t.description,
    quantity: t.quantity,
    unit: t.unit,
    unitPrice:
      t.description.includes("諸経費") || t.description.includes("立会い")
        ? Math.floor(unitPrice * 0.6)
        : unitPrice,
  }));
}
