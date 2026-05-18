"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  Eye,
  Wallet,
  Plus,
  Trash2,
  Save,
  Send,
  Printer,
  Download,
  Mail,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleDashed,
  Clock,
  AlertTriangle,
  Banknote,
  Calendar,
  TrendingUp,
  Stamp,
  Loader2,
} from "lucide-react";
import {
  generateHankoSvg,
  hankoToDataUrl,
  type StampMode,
  STAMP_MODE_META,
  type HankoConfig,
} from "@/lib/pdf/hanko";
import { downloadBillingPdf } from "@/lib/pdf/downloadBillingPdf";
import { MetricCard, CardSection, PageHeader } from "@/components/ui";
import type { ProjectRow } from "../../projects/_data/mock-projects";

/* ============================================================
   定数 / 型
   ============================================================ */

const TAX_RATE = 0.1;

const WORK_TYPE_UNIT_PRICE: Record<string, number> = {
  給排水工事: 12_000,
  給湯設備工事: 18_000,
  排水管工事: 14_500,
  配管点検工事: 8_000,
  改修工事: 22_000,
  ガス配管工事: 16_500,
};

type InvoiceItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue";

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; pill: string; dot: string; icon: typeof CircleDashed }
> = {
  draft: {
    label: "下書き",
    pill: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    icon: CircleDashed,
  },
  sent: {
    label: "送付済",
    pill: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    icon: Send,
  },
  partial: {
    label: "一部入金",
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: Clock,
  },
  paid: {
    label: "入金済",
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  overdue: {
    label: "期日超過",
    pill: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    icon: AlertTriangle,
  },
};

const STATUS_PROGRESSION: InvoiceStatus[] = ["draft", "sent", "partial", "paid"];

type Payment = {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: "振込" | "現金" | "手形" | "その他";
  note?: string;
};

type TabKey = "info" | "items" | "preview" | "payment";

const TABS: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: "info", label: "請求情報", icon: FileText },
  { key: "items", label: "明細入力", icon: Layers },
  { key: "preview", label: "プレビュー", icon: Eye },
  { key: "payment", label: "入金管理", icon: Wallet },
];

/* ============================================================
   メインクライアントコンポーネント
   ============================================================ */

export function InvoiceBuilderClient({ projects }: { projects: ProjectRow[] }) {
  const firstProject = projects[0];

  // タブ state
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // 基本情報
  const [invoiceNo] = useState(
    `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  );
  const [projectId, setProjectId] = useState(firstProject?.id ?? "");
  const [customerName, setCustomerName] = useState(firstProject?.customer ?? "");
  const [title, setTitle] = useState(
    firstProject ? `${firstProject.name} 請求書` : "御請求書",
  );
  const [issueDate, setIssueDate] = useState("2026-05-14");
  const [dueDate, setDueDate] = useState("2026-06-15");
  const [status, setStatus] = useState<InvoiceStatus>("sent");

  // 押印モード + 印鑑(担当者名 = 仮、本実装で session.displayName 連携)
  const [stampMode, setStampMode] = useState<StampMode>("none");
  const [pdfBusy, setPdfBusy] = useState(false);

  const personHanko: HankoConfig = { name: "山田", type: "round", size: 80 };
  const companyHanko: HankoConfig = { name: "さくら", type: "square", size: 80 };

  const personHankoUrl = useMemo(
    () => hankoToDataUrl(generateHankoSvg(personHanko)),
    [personHanko.name],
  );
  const companyHankoUrl = useMemo(
    () => hankoToDataUrl(generateHankoSvg(companyHanko)),
    [companyHanko.name],
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? firstProject,
    [projects, projectId, firstProject],
  );

  // 明細
  const [items, setItems] = useState<InvoiceItem[]>(() =>
    generateMockItems(firstProject),
  );

  // 入金履歴
  const [payments, setPayments] = useState<Payment[]>([
    { id: "pay-1", amount: 2_000_000, date: "2026-05-12", method: "振込", note: "前金" },
    { id: "pay-2", amount: 4_613_120, date: "2026-05-30", method: "振込", note: "中間金" },
  ]);

  const handleProjectChange = (newId: string) => {
    setProjectId(newId);
    const proj = projects.find((p) => p.id === newId);
    if (proj) {
      setCustomerName(proj.customer);
      setTitle(`${proj.name} 請求書`);
      setItems(generateMockItems(proj));
    }
  };

  // 合計計算(純粋関数)
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items],
  );
  const tax = useMemo(() => Math.floor(subtotal * TAX_RATE), [subtotal]);
  const grandTotal = subtotal + tax;

  // 入金集計
  const paymentSummary = useMemo(
    () => calculatePaymentSummary(grandTotal, payments),
    [grandTotal, payments],
  );

  // ステータス自動推論(残高に応じて再評価)
  const inferredStatus = useMemo<InvoiceStatus>(() => {
    if (paymentSummary.paidAmount === 0) return status === "draft" ? "draft" : "sent";
    if (paymentSummary.remaining <= 0) return "paid";
    if (paymentSummary.paidAmount > 0) return "partial";
    return status;
  }, [paymentSummary, status]);

  // 明細操作
  const addItem = () => {
    const workType = selectedProject?.workType ?? "給排水工事";
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      category: workType,
      description: "新規項目",
      quantity: 1,
      unit: "式",
      unitPrice: WORK_TYPE_UNIT_PRICE[workType] ?? 10000,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = <K extends keyof InvoiceItem>(
    id: string,
    key: K,
    value: InvoiceItem[K],
  ) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  // 入金登録(モック:UI のみ、本実装は Server Action)
  const addPayment = () => {
    const remaining = paymentSummary.remaining;
    if (remaining <= 0) return;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      amount: remaining,
      date: new Date().toISOString().slice(0, 10),
      method: "振込",
      note: "残金",
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const removePayment = (id: string) =>
    setPayments((prev) => prev.filter((p) => p.id !== id));

  // PDF 出力(請求書)
  const handlePdfDownload = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadBillingPdf({
        docType: "invoice",
        docNo: invoiceNo,
        title,
        customerName,
        issueDate,
        expiryOrDueDate: dueDate,
        items: items.map((it) => ({
          id: it.id,
          category: it.category,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
        })),
        subtotal,
        tax,
        taxRate: TAX_RATE,
        grandTotal,
        stampMode,
        personHanko,
        companyHanko,
      });
    } catch (err) {
      console.error("PDF 出力に失敗しました", err);
      alert("PDF 出力に失敗しました。コンソールをご確認ください。");
    } finally {
      setPdfBusy(false);
    }
  };

  const meta = STATUS_META[inferredStatus];
  const StatusIcon = meta.icon;

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <PageHeader
        breadcrumbs={[
          { label: "請求書一覧", href: "/pc/invoices" },
          { label: "新規発行" },
        ]}
        icon={FileText}
        title="請求書発行"
        subtitle="請求情報・明細・入金状況を一画面で管理できます"
        actions={
          <>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${meta.pill}`}
              aria-live="polite"
            >
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Save className="h-3.5 w-3.5" />
              保存
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Mail className="h-3.5 w-3.5" />
              メール送信
            </button>
          </>
        }
      />

      {/* タブ */}
      <div role="tablist" aria-label="請求書セクション切替" className="flex gap-1 border-b border-slate-200">
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
        <MetricCard
          label="請求額(税込)"
          value={`¥${grandTotal.toLocaleString()}`}
          subText={`No. ${invoiceNo}`}
          icon={FileText}
          accent="border-l-blue-500"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="支払期日"
          value={dueDate}
          subText={`発行日 ${issueDate}`}
          icon={Calendar}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="入金済"
          value={`¥${paymentSummary.paidAmount.toLocaleString()}`}
          subText={`${paymentSummary.paidRatePct}%`}
          icon={Banknote}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
        <MetricCard
          label="残高"
          value={`¥${paymentSummary.remaining.toLocaleString()}`}
          subText={paymentSummary.remaining <= 0 ? "完済" : "未入金"}
          icon={TrendingUp}
          accent={paymentSummary.remaining <= 0 ? "border-l-emerald-500" : "border-l-rose-500"}
          iconColor={paymentSummary.remaining <= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      {/* 2-pane: 左フォーム / 右プレビュー */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 左 panel: 編集 === */}
        <section className="col-span-7 flex flex-col gap-3">
          {/* 請求情報 */}
          <CardSection
            title="請求情報"
            icon={Building2}
            visible={activeTab === "info" || activeTab === "items"}
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField label="請求書番号">
                <input type="text" value={invoiceNo} readOnly className="form-input bg-slate-50" />
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
              <FormField label="顧客名" required>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
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
              <FormField label="支払期日">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="ステータス">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="form-input"
                >
                  {(Object.keys(STATUS_META) as InvoiceStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </CardSection>

          {/* 明細入力 */}
          <CardSection
            title="明細入力"
            icon={Layers}
            visible={activeTab === "items" || activeTab === "info"}
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
                <span className="text-xs font-semibold text-slate-700">請求金額</span>
                <span className="text-lg font-bold text-blue-700">
                  ¥{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </CardSection>

          {/* 入金管理(タブ表示時) */}
          {activeTab === "payment" && (
            <CardSection
              title="入金履歴"
              icon={Wallet}
              visible
              headerRight={
                <button
                  type="button"
                  onClick={addPayment}
                  disabled={paymentSummary.remaining <= 0}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus className="h-3 w-3" />
                  入金を登録
                </button>
              }
            >
              <ul className="flex flex-col gap-1.5">
                {payments.length === 0 ? (
                  <li className="rounded-md bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                    まだ入金がありません
                  </li>
                ) : (
                  payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-2 rounded-md border border-slate-100 bg-emerald-50/30 px-3 py-2"
                    >
                      <Banknote className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            ¥{p.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500">({p.method})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p.date} {p.note && `· ${p.note}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePayment(p.id)}
                        aria-label="入金記録を削除"
                        className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </CardSection>
          )}
        </section>

        {/* === 右 panel === */}
        <aside className="col-span-5 flex flex-col gap-3">
          {/* 押印モード */}
          <StampModeSelector
            mode={stampMode}
            onChange={setStampMode}
            personHankoUrl={personHankoUrl}
            companyHankoUrl={companyHankoUrl}
            personName={personHanko.name}
            companyName={companyHanko.name}
          />

          {/* プレビュー */}
          <CardSection title="請求書プレビュー" icon={Eye} visible sticky={false}>
            <InvoicePreview
              invoiceNo={invoiceNo}
              customerName={customerName}
              title={title}
              issueDate={issueDate}
              dueDate={dueDate}
              items={items}
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
              stampMode={stampMode}
              personHankoUrl={personHankoUrl}
              companyHankoUrl={companyHankoUrl}
            />
          </CardSection>

          {/* 入金タイムライン(常時表示) */}
          <CardSection title="入金タイムライン" icon={Clock} visible>
            <PaymentTimeline
              payments={payments}
              dueDate={dueDate}
              grandTotal={grandTotal}
              paidAmount={paymentSummary.paidAmount}
            />
          </CardSection>
        </aside>
      </div>

      {/* 下段:入金ステータスバー */}
      <PaymentStatusBar
        grandTotal={grandTotal}
        paymentSummary={paymentSummary}
        currentStatus={inferredStatus}
      />

      {/* 下端アクションバー */}
      <footer className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 shadow-sm">
        <Link
          href="/pc/invoices"
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
            onClick={handlePdfDownload}
            disabled={pdfBusy}
            aria-label="請求書を PDF で出力"
            className="inline-flex items-center gap-1 rounded-md border border-blue-500 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {pdfBusy ? "生成中..." : "PDF 出力"}
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
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Send className="h-3.5 w-3.5" />
            メール送信
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */



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

function InvoicePreview({
  invoiceNo,
  customerName,
  title,
  issueDate,
  dueDate,
  items,
  subtotal,
  tax,
  grandTotal,
  stampMode,
  personHankoUrl,
  companyHankoUrl,
}: {
  invoiceNo: string;
  customerName: string;
  title: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  stampMode: StampMode;
  personHankoUrl: string;
  companyHankoUrl: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-[11px] text-slate-700 shadow-sm">
      <div className="text-center">
        <h3 className="text-base font-bold tracking-widest text-slate-900">請 求 書</h3>
        <div className="mt-1 text-[10px] text-slate-500">No. {invoiceNo}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <div className="font-semibold text-slate-800">宛先</div>
          <div className="mt-0.5 text-slate-700">{customerName} 御中</div>
        </div>
        <div className="relative text-right">
          <div className="font-semibold text-slate-800">さくら株式会社</div>
          <div className="mt-0.5 text-slate-500">宮城県仙台市青葉区〇〇〇〇</div>
          <div className="text-slate-500">TEL: 022-XXX-XXXX</div>
          <div className="mt-0.5 text-slate-500">発行日: {issueDate}</div>
          <div className="text-slate-500">支払期日: {dueDate}</div>
          <HankoOverlay
            stampMode={stampMode}
            personHankoUrl={personHankoUrl}
            companyHankoUrl={companyHankoUrl}
          />
        </div>
      </div>

      <div className="mt-3 rounded-md bg-slate-50 px-2 py-1.5 text-[11px]">
        <span className="text-slate-500">件名:</span>{" "}
        <span className="font-semibold text-slate-900">{title}</span>
      </div>

      <div className="mt-3 flex items-baseline justify-between border-b-2 border-slate-300 pb-1">
        <span className="text-[10px] font-medium text-slate-600">御請求金額(税込)</span>
        <span className="text-lg font-bold text-blue-700">¥{grandTotal.toLocaleString()}</span>
      </div>

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
          {items.slice(0, 6).map((it) => (
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
          {items.length > 6 && (
            <tr>
              <td colSpan={4} className="py-1 text-center text-[9px] text-slate-500">
                ...他 {items.length - 6} 明細
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

      <div className="mt-3 rounded bg-blue-50 px-2 py-1.5 text-[9px] text-blue-900">
        <span className="font-semibold">お振込先:</span>{" "}
        七十七銀行 仙台中央支店 普通 1234567 さくら株式会社
      </div>
    </div>
  );
}

function PaymentTimeline({
  payments,
  dueDate,
  grandTotal,
  paidAmount,
}: {
  payments: Payment[];
  dueDate: string;
  grandTotal: number;
  paidAmount: number;
}) {
  const sorted = [...payments].sort((a, b) => (a.date < b.date ? -1 : 1));
  return (
    <ul className="flex flex-col gap-2">
      {sorted.length === 0 ? (
        <li className="rounded-md bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-500">
          入金記録はまだありません
        </li>
      ) : (
        sorted.map((p) => (
          <li key={p.id} className="flex items-start gap-2">
            <div
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
              aria-hidden
            >
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-slate-800">
                ¥{p.amount.toLocaleString()}{" "}
                <span className="text-[9px] font-normal text-slate-500">({p.method})</span>
              </div>
              <div className="text-[9px] text-slate-500">
                {p.date} {p.note && `· ${p.note}`}
              </div>
            </div>
          </li>
        ))
      )}
      {paidAmount < grandTotal && (
        <li className="flex items-start gap-2 border-t border-dashed border-slate-200 pt-2">
          <div
            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"
            aria-hidden
          >
            <Clock className="h-3 w-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-amber-700">
              残金 ¥{(grandTotal - paidAmount).toLocaleString()} 入金待ち
            </div>
            <div className="text-[9px] text-slate-500">期日: {dueDate}</div>
          </div>
        </li>
      )}
    </ul>
  );
}

function PaymentStatusBar({
  grandTotal,
  paymentSummary,
  currentStatus,
}: {
  grandTotal: number;
  paymentSummary: ReturnType<typeof calculatePaymentSummary>;
  currentStatus: InvoiceStatus;
}) {
  const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">入金ステータス</h2>
        <span className="text-[11px] text-slate-500">
          {paymentSummary.paidRatePct}% 入金済
        </span>
      </div>

      {/* 入金率プログレスバー */}
      <div
        className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={paymentSummary.paidRatePct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`入金率 ${paymentSummary.paidRatePct}%`}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${paymentSummary.paidRatePct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-medium text-slate-500">請求額</div>
          <div className="mt-0.5 text-base font-bold text-slate-900">
            ¥{grandTotal.toLocaleString()}
          </div>
        </div>
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2">
          <div className="text-[10px] font-medium text-emerald-700">入金額</div>
          <div className="mt-0.5 text-base font-bold text-emerald-700">
            ¥{paymentSummary.paidAmount.toLocaleString()}
          </div>
        </div>
        <div
          className={`rounded-md border px-3 py-2 ${
            paymentSummary.remaining <= 0
              ? "border-emerald-100 bg-emerald-50"
              : "border-rose-100 bg-rose-50"
          }`}
        >
          <div
            className={`text-[10px] font-medium ${
              paymentSummary.remaining <= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            残高
          </div>
          <div
            className={`mt-0.5 text-base font-bold ${
              paymentSummary.remaining <= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            ¥{Math.max(0, paymentSummary.remaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ステータス進行(4 段) */}
      <ol className="mt-3 flex items-center" aria-label="入金ステータスの進行">
        {STATUS_PROGRESSION.map((s, i) => {
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li key={s} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrent
                        ? `${meta.pill} ring-2 ring-blue-500`
                        : "bg-slate-100 text-slate-400"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`mt-0.5 text-[10px] ${
                    isDone || isCurrent ? "font-medium text-slate-700" : "text-slate-400"
                  }`}
                >
                  {meta.label}
                </span>
              </div>
              {i < STATUS_PROGRESSION.length - 1 && (
                <div
                  className={`h-0.5 w-full ${isDone ? "bg-emerald-300" : "bg-slate-200"}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ============================================================
   純粋関数: 入金集計
   ============================================================ */

function calculatePaymentSummary(
  grandTotal: number,
  payments: Payment[],
): {
  paidAmount: number;
  remaining: number;
  paidRatePct: number;
} {
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = grandTotal - paidAmount;
  const paidRatePct =
    grandTotal > 0 ? Math.min(100, Math.round((paidAmount / grandTotal) * 100)) : 0;
  return { paidAmount, remaining, paidRatePct };
}

/* ============================================================
   ヘルパー: モック明細生成(見積書と同型ロジック、共有可能だが
   将来の差別化に備え個別保持)
   ============================================================ */

function generateMockItems(project: ProjectRow | undefined): InvoiceItem[] {
  if (!project) return [];
  const workType = project.workType;
  const unitPrice = WORK_TYPE_UNIT_PRICE[workType] ?? 10000;

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

/* ============================================================
   押印モード切替 + 印影プレビュー(見積書と同型 / 共通化候補)
   ============================================================ */

function StampModeSelector({
  mode,
  onChange,
  personHankoUrl,
  companyHankoUrl,
  personName,
  companyName,
}: {
  mode: StampMode;
  onChange: (m: StampMode) => void;
  personHankoUrl: string;
  companyHankoUrl: string;
  personName: string;
  companyName: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Stamp className="h-3.5 w-3.5 text-rose-600" />
          押印モード
        </h2>
        <span className="text-[10px] text-slate-500">PDF 出力時に反映</span>
      </div>

      <div role="radiogroup" aria-label="押印モード" className="grid grid-cols-2 gap-1.5">
        {(Object.keys(STAMP_MODE_META) as StampMode[]).map((m) => {
          const meta = STAMP_MODE_META[m];
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m)}
              className={`flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors ${
                active
                  ? "border-rose-500 bg-rose-50 text-rose-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-[11px] font-semibold">{meta.label}</span>
              <span className="text-[9px] leading-tight text-slate-500">{meta.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <HankoPreview label="担当者印(丸印)" name={personName} url={personHankoUrl} active={mode === "person" || mode === "both"} />
        <HankoPreview label="会社印(角印)" name={companyName} url={companyHankoUrl} active={mode === "company" || mode === "both"} />
      </div>
    </section>
  );
}

function HankoPreview({
  label,
  name,
  url,
  active,
}: {
  label: string;
  name: string;
  url: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border p-2 transition-opacity ${
        active ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-slate-50 opacity-50"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`${name} 印影`} className="h-12 w-12 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] font-semibold text-slate-700">{label}</div>
        <div className="truncate text-[9px] text-slate-500">{name}</div>
        {active && (
          <div className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1 py-0 text-[9px] font-medium text-rose-700">
            <CheckCircle2 className="h-2.5 w-2.5" />
            押印
          </div>
        )}
      </div>
    </div>
  );
}

function HankoOverlay({
  stampMode,
  personHankoUrl,
  companyHankoUrl,
}: {
  stampMode: StampMode;
  personHankoUrl: string;
  companyHankoUrl: string;
}) {
  if (stampMode === "none") return null;
  return (
    <div
      className="pointer-events-none absolute -top-2 right-2 flex items-center gap-1"
      aria-hidden
    >
      {(stampMode === "company" || stampMode === "both") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={companyHankoUrl}
          alt=""
          className="h-12 w-12"
          style={{ transform: "rotate(-6deg)" }}
        />
      )}
      {(stampMode === "person" || stampMode === "both") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={personHankoUrl}
          alt=""
          className="h-9 w-9"
          style={{ transform: "rotate(4deg)" }}
        />
      )}
    </div>
  );
}
