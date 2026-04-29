import PDFDocument from "pdfkit";
import { loadJapaneseFont, loadStampImage } from "./stamp-loader";

// =====================================================================
// 共通型
// =====================================================================

export type StampDef = {
  stampKey: string;
  displayName: string;
  roleName: string;
  imagePath: string;
  isCompanyStamp: boolean;
};

export type DocItem = {
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unitPriceYen: number;
  amountYen: number;
};

export type CompanyInfo = {
  name: string;
  registrationNumber?: string;
  postalCode?: string;
  address?: string;
  tel?: string;
  fax?: string;
  staffName?: string;
  staffTel?: string;
  staffEmail?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
};

export type CustomerInfo = {
  name: string;
  honorific?: string; // 御中
  postalCode?: string;
  address?: string;
  phone?: string;
  contactPerson?: string;
};

export type CommonInput = {
  docNumber: string;
  title: string;
  issueDate: string; // YYYY-MM-DD
  customer: CustomerInfo;
  company: CompanyInfo;
  items: DocItem[];
  subtotalYen: number;
  taxRate: number;
  taxYen: number;
  totalYen: number;
  note?: string;
  selectedStamps: StampDef[]; // 既にチェック済みの印鑑だけが渡される
  printCompanyStamp: boolean;
  printStaffInfo: boolean;
  printCompanyContact: boolean;
};

export type QuoteInput = CommonInput & {
  expiryDate?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
};

export type InvoiceInput = CommonInput & {
  dueDate?: string;
};

export type GenerationWarning = { type: string; message: string };

// =====================================================================
// 共通ユーティリティ
// =====================================================================

const COLOR = {
  black: "#000000",
  red: "#c41e3a",
  navy: "#1a3a6a",
  lightGray: "#f5f5f5",
  border: "#888888",
};

const FONT_NAME = "NotoSansJP";

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

function formatJpDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// =====================================================================
// PDF 生成本体
// =====================================================================

export async function generateQuotePdf(
  input: QuoteInput,
): Promise<{ buffer: Buffer; warnings: GenerationWarning[] }> {
  return generatePdfDocument(input, "quote");
}

export async function generateInvoicePdf(
  input: InvoiceInput,
): Promise<{ buffer: Buffer; warnings: GenerationWarning[] }> {
  return generatePdfDocument(input, "invoice");
}

async function generatePdfDocument(
  input: QuoteInput | InvoiceInput,
  kind: "quote" | "invoice",
): Promise<{ buffer: Buffer; warnings: GenerationWarning[] }> {
  const warnings: GenerationWarning[] = [];

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: {
      Title: input.title,
      Author: input.company.name,
      Subject: kind === "quote" ? "御見積書" : "請求書",
    },
  });

  // 日本語フォント登録
  try {
    const fontBuffer = loadJapaneseFont();
    doc.registerFont(FONT_NAME, fontBuffer);
    doc.font(FONT_NAME);
  } catch (e) {
    warnings.push({
      type: "font_missing",
      message: `日本語フォントの読み込みに失敗: ${e instanceof Error ? e.message : String(e)}`,
    });
  }

  const buffers: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => buffers.push(chunk));
  const finished = new Promise<void>((resolve) => {
    doc.on("end", () => resolve());
  });

  // ===== ページレイアウト定数 =====
  const PAGE_W = doc.page.width;
  const MARGIN = 40;
  const LEFT = MARGIN;
  const RIGHT = PAGE_W - MARGIN;

  // ============= ヘッダー =============
  // タイトル(右上)
  const titleText = kind === "quote" ? "御 見 積 書" : "請 求 書";
  doc
    .fontSize(28)
    .fillColor(COLOR.red)
    .text(titleText, RIGHT - 220, 50, { width: 220, align: "center" });
  doc.rect(RIGHT - 220, 45, 220, 50).stroke(COLOR.red);
  doc.fillColor(COLOR.black);

  // 発行日 / 番号(タイトル下)
  doc.fontSize(10);
  let metaY = 105;
  if (kind === "quote") {
    doc.text(
      `発行日: ${formatJpDate(input.issueDate)}`,
      RIGHT - 220,
      metaY,
      { width: 220, align: "right" },
    );
    metaY += 14;
    doc.text(`管理番号: ${input.docNumber}`, RIGHT - 220, metaY, {
      width: 220,
      align: "right",
    });
    if ((input as QuoteInput).expiryDate) {
      metaY += 14;
      doc.text(
        `有効期限: ${formatJpDate((input as QuoteInput).expiryDate)}`,
        RIGHT - 220,
        metaY,
        { width: 220, align: "right" },
      );
    }
  } else {
    doc.text(
      `締切日: ${formatJpDate(input.issueDate)}`,
      RIGHT - 220,
      metaY,
      { width: 220, align: "right" },
    );
    metaY += 14;
    doc.text(`管理番号: ${input.docNumber}`, RIGHT - 220, metaY, {
      width: 220,
      align: "right",
    });
    if ((input as InvoiceInput).dueDate) {
      metaY += 14;
      doc.text(
        `支払期限: ${formatJpDate((input as InvoiceInput).dueDate)}`,
        RIGHT - 220,
        metaY,
        { width: 220, align: "right" },
      );
    }
  }

  // 宛先(左上)
  let addrY = 60;
  doc.fontSize(9).fillColor(COLOR.black);
  if (input.customer.postalCode) {
    doc.text(`〒${input.customer.postalCode}`, LEFT, addrY);
    addrY += 12;
  }
  if (input.customer.address) {
    doc.fontSize(9).text(input.customer.address, LEFT, addrY, { width: 280 });
    addrY += 24;
  }
  if (input.customer.phone) {
    doc.text(`TEL: ${input.customer.phone}`, LEFT, addrY);
    addrY += 12;
  }
  doc
    .fontSize(16)
    .fillColor(COLOR.black)
    .text(
      `${input.customer.name} ${input.customer.honorific ?? "御中"}`,
      LEFT,
      addrY + 8,
      { width: 320 },
    );

  // 挨拶文(quote のみ)
  let bodyY = 180;
  if (kind === "quote") {
    doc.fontSize(10).text("下記の通り御見積り申し上げます。", LEFT, bodyY);
    bodyY += 24;
  } else {
    bodyY = 175;
  }

  // 件名・条件ボックス(左)+ 発行元情報(右)
  const conditionsBoxX = LEFT;
  const conditionsBoxY = bodyY;
  const conditionsBoxW = 280;
  const issuerBoxX = LEFT + conditionsBoxW + 20;
  const issuerBoxW = RIGHT - issuerBoxX;

  // 条件テーブル
  const conditions: { label: string; value: string }[] = [
    { label: "件名", value: input.title },
  ];

  if (kind === "quote") {
    const q = input as QuoteInput;
    if (q.deliveryDate) conditions.push({ label: "納入期日", value: formatJpDate(q.deliveryDate) });
    if (q.paymentTerms) conditions.push({ label: "取引方法", value: q.paymentTerms });
    if (q.expiryDate) conditions.push({ label: "有効期限", value: formatJpDate(q.expiryDate) });
    if (q.deliveryLocation) conditions.push({ label: "受取場所", value: q.deliveryLocation });
  } else {
    if (input.company.bankName) {
      const bank = [
        input.company.bankName,
        input.company.bankBranch,
        input.company.bankAccountType,
        input.company.bankAccountNumber,
        input.company.bankAccountHolder,
      ]
        .filter(Boolean)
        .join(" ");
      conditions.push({ label: "お支払先", value: bank });
    }
  }

  doc.fontSize(10);
  let condY = conditionsBoxY;
  const labelW = 60;
  for (const cond of conditions) {
    const rowH = Math.max(
      18,
      doc.heightOfString(cond.value, { width: conditionsBoxW - labelW - 8 }) + 4,
    );
    doc.rect(conditionsBoxX, condY, labelW, rowH).fillAndStroke(COLOR.lightGray, COLOR.border);
    doc.fillColor(COLOR.black);
    doc
      .rect(conditionsBoxX + labelW, condY, conditionsBoxW - labelW, rowH)
      .stroke(COLOR.border);
    doc.text(cond.label, conditionsBoxX + 4, condY + 4, {
      width: labelW - 8,
    });
    doc.text(cond.value, conditionsBoxX + labelW + 4, condY + 4, {
      width: conditionsBoxW - labelW - 8,
    });
    condY += rowH;
  }

  // 発行元情報(右ボックス)
  let issuerY = conditionsBoxY;
  doc.fontSize(11).text(input.company.name, issuerBoxX, issuerY, {
    width: issuerBoxW,
  });
  issuerY += 16;
  doc.fontSize(8);
  if (input.printCompanyContact) {
    if (input.company.registrationNumber) {
      doc.text(`登録番号: ${input.company.registrationNumber}`, issuerBoxX, issuerY);
      issuerY += 11;
    }
    if (input.company.postalCode) {
      doc.text(`〒${input.company.postalCode}`, issuerBoxX, issuerY);
      issuerY += 11;
    }
    if (input.company.address) {
      doc.text(input.company.address, issuerBoxX, issuerY, { width: issuerBoxW });
      issuerY += 22;
    }
    if (input.company.tel || input.company.fax) {
      doc.text(
        `TEL: ${input.company.tel ?? "-"}  FAX: ${input.company.fax ?? "-"}`,
        issuerBoxX,
        issuerY,
      );
      issuerY += 11;
    }
  }
  if (input.printStaffInfo && input.company.staffName) {
    issuerY += 4;
    doc.text(`担当: ${input.company.staffName}`, issuerBoxX, issuerY);
    issuerY += 11;
    if (input.company.staffTel) {
      doc.text(`TEL: ${input.company.staffTel}`, issuerBoxX, issuerY);
      issuerY += 11;
    }
    if (input.company.staffEmail) {
      doc.text(`Email: ${input.company.staffEmail}`, issuerBoxX, issuerY);
      issuerY += 11;
    }
  }

  // 印鑑を発行元情報の右側に並べる(チェック済みのみ、印影サイズ 50x50)
  const stampW = 50;
  const stampGap = 6;
  const stampsToPrint = input.selectedStamps.filter((s) =>
    input.printCompanyStamp ? true : !s.isCompanyStamp,
  );
  let stampX = RIGHT - stampW * stampsToPrint.length - stampGap * (stampsToPrint.length - 1);
  if (stampX < issuerBoxX + 80) stampX = issuerBoxX + 80;
  const stampY = conditionsBoxY;
  for (const stamp of stampsToPrint) {
    const buf = loadStampImage(stamp.imagePath);
    if (!buf) {
      warnings.push({
        type: "stamp_missing",
        message: `印鑑画像が見つかりません: ${stamp.stampKey} (${stamp.imagePath})`,
      });
      // 空枠だけ描く
      doc.rect(stampX, stampY, stampW, stampW).stroke(COLOR.border);
      doc.fontSize(7).text(stamp.roleName, stampX, stampY + stampW / 2 - 4, {
        width: stampW,
        align: "center",
      });
    } else {
      try {
        doc.image(buf, stampX, stampY, { fit: [stampW, stampW], align: "center" });
      } catch (e) {
        warnings.push({
          type: "stamp_render_failed",
          message: `印鑑描画失敗: ${stamp.stampKey} - ${e instanceof Error ? e.message : String(e)}`,
        });
      }
      doc.fontSize(7).text(stamp.roleName, stampX, stampY + stampW + 2, {
        width: stampW,
        align: "center",
      });
    }
    stampX += stampW + stampGap;
  }

  // ============= 金額サマリー =============
  const summaryY = Math.max(condY, issuerY) + 30;
  doc.fontSize(11).text("合計金額(税込)", LEFT, summaryY);
  doc.fontSize(20).fillColor(COLOR.black);
  doc.text(
    `¥ ${formatYen(input.totalYen)}`,
    LEFT + 100,
    summaryY - 4,
    { width: 240 },
  );

  // ============= 明細テーブル =============
  const tableY = summaryY + 36;
  const tableHeaderH = 22;
  const cols = [
    { label: "項目", width: 200, align: "left" as const },
    { label: "数量", width: 50, align: "right" as const },
    { label: "単位", width: 40, align: "center" as const },
    { label: "単価", width: 80, align: "right" as const },
    { label: "金額", width: 90, align: "right" as const },
    { label: "備考", width: 55, align: "left" as const },
  ];
  const tableW = cols.reduce((s, c) => s + c.width, 0);
  let cx = LEFT;
  for (const col of cols) {
    doc
      .rect(cx, tableY, col.width, tableHeaderH)
      .fillAndStroke(COLOR.lightGray, COLOR.border);
    doc.fillColor(COLOR.black);
    doc.fontSize(9).text(col.label, cx + 2, tableY + 6, {
      width: col.width - 4,
      align: col.align,
    });
    cx += col.width;
  }

  let rowY = tableY + tableHeaderH;
  doc.fontSize(9);
  for (const item of input.items) {
    const desc = item.description ? `\n${item.description}` : "";
    const itemText = item.name + desc;
    const rowH = Math.max(
      20,
      doc.heightOfString(itemText, { width: cols[0]!.width - 4 }) + 6,
    );

    cx = LEFT;
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]!;
      doc.rect(cx, rowY, col.width, rowH).stroke(COLOR.border);
      let text = "";
      let align: "left" | "center" | "right" = col.align;
      if (i === 0) text = itemText;
      else if (i === 1) text = String(item.quantity);
      else if (i === 2) text = item.unit ?? "";
      else if (i === 3) text = formatYen(Math.round(item.unitPriceYen));
      else if (i === 4) text = formatYen(Math.round(item.amountYen));
      else text = "";
      doc.text(text, cx + 2, rowY + 4, { width: col.width - 4, align });
      cx += col.width;
    }
    rowY += rowH;

    if (rowY > doc.page.height - 200) {
      doc.addPage();
      rowY = 60;
    }
  }

  // ============= 合計欄 =============
  const totalRows: { label: string; value: string }[] = [
    { label: "小計", value: `¥${formatYen(input.subtotalYen)}` },
    {
      label: `消費税(${Math.round(input.taxRate * 100)}%)`,
      value: `¥${formatYen(input.taxYen)}`,
    },
    { label: "合計", value: `¥${formatYen(input.totalYen)}` },
  ];
  const totalsW = 240;
  const totalsX = LEFT + tableW - totalsW;
  rowY += 8;
  for (const row of totalRows) {
    const isFinal = row.label === "合計";
    const h = isFinal ? 26 : 20;
    doc
      .rect(totalsX, rowY, totalsW, h)
      .fillAndStroke(isFinal ? "#fff5d0" : COLOR.lightGray, COLOR.border);
    doc.fillColor(COLOR.black);
    doc.fontSize(isFinal ? 12 : 9).text(row.label, totalsX + 8, rowY + 6, {
      width: totalsW / 2 - 8,
    });
    doc.text(row.value, totalsX + totalsW / 2, rowY + 6, {
      width: totalsW / 2 - 8,
      align: "right",
    });
    rowY += h;
  }

  // ============= 備考 =============
  if (input.note && input.note.trim()) {
    rowY += 16;
    doc.fontSize(9).fillColor(COLOR.black).text("備考", LEFT, rowY);
    rowY += 12;
    doc
      .rect(LEFT, rowY, tableW, 60)
      .stroke(COLOR.border);
    doc.text(input.note, LEFT + 4, rowY + 4, {
      width: tableW - 8,
    });
  }

  doc.end();
  await finished;
  const buffer = Buffer.concat(buffers);

  return { buffer, warnings };
}
