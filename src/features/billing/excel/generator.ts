import ExcelJS from "exceljs";

export type ExcelDocItem = {
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unitPriceYen: number;
  amountYen: number;
};

export type ExcelInput = {
  kind: "quote" | "invoice";
  docNumber: string;
  title: string;
  issueDate: string; // YYYY-MM-DD
  expiryOrDueDate?: string;
  customerName: string;
  customerAddress?: string;
  companyName: string;
  items: ExcelDocItem[];
  subtotalYen: number;
  taxRate: number;
  taxYen: number;
  totalYen: number;
  note?: string;
};

const TITLE = {
  quote: "御 見 積 書",
  invoice: "請 求 書",
};

/**
 * 見積/請求の Excel 1 シートを生成して Buffer で返す。
 * MVP のシンプルなレイアウト(タイトル / メタ / 宛先 / 明細 / 合計 / 備考)。
 */
export async function generateBillingExcel(input: ExcelInput): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = input.companyName;
  wb.created = new Date();

  const ws = wb.addWorksheet(input.kind === "quote" ? "見積書" : "請求書", {
    properties: { tabColor: { argb: "FF1A3A6A" } },
    pageSetup: { paperSize: 9, orientation: "portrait" }, // A4 portrait
  });

  // 列幅設定 (6列)
  ws.columns = [
    { width: 36 }, // 項目
    { width: 8 },  // 数量
    { width: 6 },  // 単位
    { width: 12 }, // 単価
    { width: 14 }, // 金額
    { width: 10 }, // 備考
  ];

  // タイトル(中央2行マージ)
  ws.mergeCells("A1:F2");
  const titleCell = ws.getCell("A1");
  titleCell.value = TITLE[input.kind];
  titleCell.font = { name: "MS Gothic", size: 22, bold: true, color: { argb: "FFC41E3A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // メタ情報
  ws.getCell("A4").value = "発行日";
  ws.getCell("B4").value = input.issueDate;
  ws.getCell("D4").value = "管理番号";
  ws.getCell("E4").value = input.docNumber;
  if (input.expiryOrDueDate) {
    ws.getCell("A5").value = input.kind === "quote" ? "有効期限" : "支払期限";
    ws.getCell("B5").value = input.expiryOrDueDate;
  }

  // 宛先
  ws.mergeCells("A7:C7");
  ws.getCell("A7").value = `${input.customerName}  御中`;
  ws.getCell("A7").font = { name: "MS Gothic", size: 14, bold: true };
  if (input.customerAddress) {
    ws.mergeCells("A8:C8");
    ws.getCell("A8").value = input.customerAddress;
    ws.getCell("A8").font = { name: "MS Gothic", size: 9 };
  }

  // 発行元
  ws.mergeCells("D7:F7");
  ws.getCell("D7").value = input.companyName;
  ws.getCell("D7").font = { name: "MS Gothic", size: 11, bold: true };

  // 件名
  ws.getCell("A10").value = "件名";
  ws.getCell("A10").font = { bold: true, name: "MS Gothic" };
  ws.mergeCells("B10:F10");
  ws.getCell("B10").value = input.title;

  // 明細ヘッダー
  const headerRow = 13;
  const headers = ["項目", "数量", "単位", "単価", "金額", "備考"];
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1);
    cell.value = h;
    cell.font = { bold: true, name: "MS Gothic" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDEEFF" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 明細
  let r = headerRow + 1;
  for (const item of input.items) {
    const desc = item.description ? `\n${item.description}` : "";
    const cells = [
      item.name + desc,
      item.quantity,
      item.unit ?? "",
      item.unitPriceYen,
      item.amountYen,
      "",
    ];
    cells.forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v;
      cell.alignment = {
        wrapText: true,
        vertical: "top",
        horizontal:
          i === 1 || i === 3 || i === 4
            ? "right"
            : i === 2
              ? "center"
              : "left",
      };
      if (i === 3 || i === 4) cell.numFmt = "¥#,##0";
      cell.border = {
        top: { style: "hair" },
        left: { style: "thin" },
        bottom: { style: "hair" },
        right: { style: "thin" },
      };
      cell.font = { name: "MS Gothic", size: 10 };
    });
    r++;
  }

  // 合計欄(右寄せ)
  r++;
  const totalLabelCol = 4; // D
  const totalValueCol = 5; // E

  function writeTotalRow(label: string, value: number, bold = false) {
    const labelCell = ws.getCell(r, totalLabelCol);
    labelCell.value = label;
    labelCell.alignment = { horizontal: "right" };
    labelCell.font = { bold, name: "MS Gothic" };

    const valueCell = ws.getCell(r, totalValueCol);
    valueCell.value = value;
    valueCell.numFmt = "¥#,##0";
    valueCell.alignment = { horizontal: "right" };
    valueCell.font = { bold, name: "MS Gothic", size: bold ? 12 : 10 };

    if (bold) {
      labelCell.fill = valueCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFF5D0" },
      };
      labelCell.border = valueCell.border = {
        top: { style: "medium" },
        bottom: { style: "medium" },
      };
    }
    r++;
  }

  writeTotalRow("小計", input.subtotalYen);
  writeTotalRow(`消費税(${Math.round(input.taxRate * 100)}%)`, input.taxYen);
  writeTotalRow("合計", input.totalYen, true);

  // 備考
  if (input.note && input.note.trim()) {
    r += 2;
    ws.getCell(r, 1).value = "備考";
    ws.getCell(r, 1).font = { bold: true, name: "MS Gothic" };
    r++;
    ws.mergeCells(r, 1, r + 3, 6);
    ws.getCell(r, 1).value = input.note;
    ws.getCell(r, 1).alignment = { wrapText: true, vertical: "top" };
    ws.getCell(r, 1).font = { name: "MS Gothic", size: 10 };
  }

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
