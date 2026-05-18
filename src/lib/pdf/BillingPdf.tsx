"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Rect,
} from "@react-pdf/renderer";
import { ensureJapaneseFonts } from "./fonts";
import type { HankoConfig, StampMode } from "./hanko";

// フォント登録(モジュール load 時に 1 度だけ)
ensureJapaneseFonts();

/* ============================================================
   共通スタイル
   ============================================================ */

const COLOR = {
  primary: "#1d4ed8",
  text: "#0f172a",
  muted: "#64748b",
  border: "#cbd5e1",
  borderLight: "#e2e8f0",
  bgSoft: "#f8fafc",
  red: "#c8102e",
  green: "#047857",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    color: COLOR.text,
    padding: 32,
    backgroundColor: "#ffffff",
  },
  titleBlock: { textAlign: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: 8 },
  docNo: { fontSize: 8, color: COLOR.muted, marginTop: 4 },
  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column" },
  metaBlockLeft: { width: "55%" },
  metaBlockRight: { width: "45%", alignItems: "flex-end", position: "relative" },
  customerName: { fontSize: 14, fontWeight: 700, marginTop: 6 },
  customerHonorific: { fontSize: 12, marginLeft: 4 },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.text,
    marginTop: 6,
    paddingBottom: 1,
  },
  companyBlock: { alignItems: "flex-end", marginTop: 4 },
  companyName: { fontSize: 11, fontWeight: 700 },
  companyLine: { fontSize: 8, color: COLOR.muted, marginTop: 2 },

  subject: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLOR.bgSoft,
    borderRadius: 2,
  },
  subjectLabel: { fontSize: 8, color: COLOR.muted },
  subjectText: { fontSize: 11, fontWeight: 700, marginTop: 2 },

  grandTotalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 2,
    borderBottomColor: COLOR.text,
    paddingBottom: 4,
  },
  grandTotalLabel: { fontSize: 10, fontWeight: 700 },
  grandTotalValue: { fontSize: 20, fontWeight: 700, color: COLOR.primary },

  table: { marginTop: 10 },
  thead: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR.text,
    paddingVertical: 4,
    backgroundColor: COLOR.bgSoft,
  },
  th: { fontSize: 8.5, fontWeight: 700 },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: COLOR.borderLight,
    paddingVertical: 4,
    alignItems: "flex-start",
  },
  td: { fontSize: 8.5 },
  // colspan
  colItem: { width: "44%", paddingHorizontal: 4 },
  colQty: { width: "14%", textAlign: "right", paddingHorizontal: 4 },
  colUnitPrice: { width: "20%", textAlign: "right", paddingHorizontal: 4 },
  colAmount: { width: "22%", textAlign: "right", paddingHorizontal: 4 },

  itemCategory: { fontSize: 7, color: COLOR.muted, marginTop: 1 },

  totalsBlock: {
    marginTop: 8,
    alignSelf: "flex-end",
    width: "45%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsLabel: { fontSize: 9, color: COLOR.muted },
  totalsValue: { fontSize: 9 },
  totalsGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderColor: COLOR.text,
    paddingTop: 4,
    marginTop: 4,
  },
  totalsGrandLabel: { fontSize: 11, fontWeight: 700 },
  totalsGrandValue: { fontSize: 13, fontWeight: 700, color: COLOR.primary },

  noteBox: {
    marginTop: 14,
    padding: 8,
    borderWidth: 0.5,
    borderColor: COLOR.border,
    borderRadius: 2,
    backgroundColor: COLOR.bgSoft,
  },
  noteLabel: { fontSize: 7, fontWeight: 700, color: COLOR.muted },
  noteText: { fontSize: 8.5, marginTop: 2 },

  bankBox: {
    marginTop: 10,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    borderRadius: 2,
  },
  bankLabel: { fontSize: 7, fontWeight: 700, color: "#1e40af" },
  bankText: { fontSize: 9, marginTop: 2, color: "#1e3a8a" },

  // 印鑑配置エリア
  hankoArea: {
    position: "absolute",
    top: 0,
    right: -8,
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  hankoRow: {
    position: "absolute",
    flexDirection: "row",
    gap: 8,
    top: -4,
    right: -4,
  },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COLOR.muted,
    borderTopWidth: 0.5,
    borderColor: COLOR.borderLight,
    paddingTop: 4,
  },
});

/* ============================================================
   型
   ============================================================ */

export type BillingItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type BillingDocType = "estimate" | "invoice";

export type BillingPdfProps = {
  docType: BillingDocType;
  docNo: string;
  title: string;
  customerName: string;
  contactPerson?: string;
  issueDate: string;
  expiryOrDueDate: string;
  items: BillingItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  companyName?: string;
  companyAddress?: string;
  companyTel?: string;
  bankAccount?: string; // 請求書用
  /** 押印モード(none / person / company / both) */
  stampMode: StampMode;
  /** 担当者印 設定 */
  personHanko?: HankoConfig;
  /** 会社印 設定 */
  companyHanko?: HankoConfig;
};

/* ============================================================
   印鑑(View + Svg + Text の合成レイアウト)
   ============================================================

   react-pdf v4 では Svg 内で <Text> が使えないため、印鑑は SVG の枠線と
   <Text> で書く文字を絶対配置でレイヤリングして表現する。
   ============================================================ */

function HankoComposite({
  config,
  rotation = 0,
}: {
  config: HankoConfig;
  rotation?: number;
}) {
  const { name, type, size = 60, color = "#c8102e" } = config;
  if (type === "round") {
    return <HankoCompositeRound name={name} size={size} color={color} rotation={rotation} />;
  }
  return <HankoCompositeSquare name={name} size={size} color={color} rotation={rotation} />;
}

function HankoCompositeRound({
  name,
  size,
  color,
  rotation,
}: {
  name: string;
  size: number;
  color: string;
  rotation: number;
}) {
  const chars = name.slice(0, 4);
  const fontSize =
    chars.length === 1
      ? size * 0.45
      : chars.length === 2
        ? size * 0.36
        : size * 0.28;

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* SVG 円形枠 */}
      <Svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) * 0.94}
          stroke={color}
          strokeWidth={size * 0.045}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) * 0.86}
          stroke={color}
          strokeWidth={size * 0.018}
          fill="none"
        />
      </Svg>
      {/* 文字レイヤー */}
      {chars.length <= 2 ? (
        <Text
          style={{
            position: "absolute",
            top: size / 2 - fontSize * 0.6,
            left: 0,
            width: size,
            textAlign: "center",
            fontSize,
            color,
            fontWeight: 700,
          }}
        >
          {chars}
        </Text>
      ) : (
        <View style={{ position: "absolute", width: size, height: size, padding: size * 0.15 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <Text style={{ fontSize, color, fontWeight: 700 }}>{chars.charAt(1)}</Text>
            <Text style={{ fontSize, color, fontWeight: 700 }}>{chars.charAt(0)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 2 }}>
            <Text style={{ fontSize, color, fontWeight: 700 }}>{chars.charAt(3) || ""}</Text>
            <Text style={{ fontSize, color, fontWeight: 700 }}>{chars.charAt(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function HankoCompositeSquare({
  name,
  size,
  color,
  rotation,
}: {
  name: string;
  size: number;
  color: string;
  rotation: number;
}) {
  const pad = size * 0.06;
  const fontSize = name.length <= 3 ? size * 0.3 : name.length <= 5 ? size * 0.22 : size * 0.17;
  const chars = name.slice(0, 8).split("");
  const cols = chars.length > 6 ? 2 : 1;
  // 縦方向に文字を並べる(各列)
  const charsPerCol = Math.ceil(chars.length / cols);
  const columns: string[][] = Array.from({ length: cols }, (_, c) =>
    chars.slice(c * charsPerCol, (c + 1) * charsPerCol),
  );
  // 印鑑文化:右の列が先(右→左に読む)
  columns.reverse();

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* SVG 角形枠 */}
      <Svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ position: "absolute" }}>
        <Rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          stroke={color}
          strokeWidth={size * 0.045}
          fill="none"
        />
        <Rect
          x={pad * 2.2}
          y={pad * 2.2}
          width={size - pad * 4.4}
          height={size - pad * 4.4}
          stroke={color}
          strokeWidth={size * 0.015}
          fill="none"
        />
      </Svg>
      {/* 文字レイヤー(縦書き) */}
      <View
        style={{
          position: "absolute",
          top: pad * 2.5,
          left: pad * 2.5,
          right: pad * 2.5,
          bottom: pad * 2.5,
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        {columns.map((col, ci) => (
          <View key={ci} style={{ flexDirection: "column", alignItems: "center" }}>
            {col.map((ch, ri) => (
              <Text key={ri} style={{ fontSize, color, fontWeight: 700, lineHeight: 1.05 }}>
                {ch}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ============================================================
   メイン PDF ドキュメント(見積書 / 請求書 共通)
   ============================================================ */

export function BillingPdf(props: BillingPdfProps) {
  const {
    docType,
    docNo,
    title,
    customerName,
    contactPerson,
    issueDate,
    expiryOrDueDate,
    items,
    subtotal,
    tax,
    taxRate,
    grandTotal,
    companyName = "さくら株式会社",
    companyAddress = "宮城県仙台市青葉区〇〇〇〇",
    companyTel = "022-XXX-XXXX",
    bankAccount = "七十七銀行 仙台中央支店 普通 1234567 さくら株式会社",
    stampMode,
    personHanko,
    companyHanko,
  } = props;

  const docLabel = docType === "estimate" ? "御見積書" : "請求書";
  const moneyLabel = docType === "estimate" ? "御見積金額" : "御請求金額";
  const dateLabel2 = docType === "estimate" ? "有効期限" : "支払期日";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{docLabel}</Text>
          <Text style={styles.docNo}>No. {docNo}</Text>
        </View>

        {/* 宛先 + 発行元(印鑑エリア含む) */}
        <View style={styles.rowBetween}>
          {/* 宛先 */}
          <View style={styles.metaBlockLeft}>
            <View style={styles.row}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerHonorific}>御中</Text>
            </View>
            {contactPerson && (
              <Text style={[styles.companyLine, { marginTop: 4 }]}>
                ご担当: {contactPerson} 様
              </Text>
            )}
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.companyLine, { fontSize: 9, color: COLOR.text }]}>
                下記の通り、御{docType === "estimate" ? "見積" : "請求"}申し上げます。
              </Text>
            </View>
          </View>

          {/* 発行元 + 印鑑 */}
          <View style={styles.metaBlockRight}>
            <View style={styles.companyBlock}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.companyLine}>{companyAddress}</Text>
              <Text style={styles.companyLine}>TEL: {companyTel}</Text>
              <Text style={[styles.companyLine, { marginTop: 4 }]}>
                発行日: {issueDate}
              </Text>
              <Text style={styles.companyLine}>
                {dateLabel2}: {expiryOrDueDate}
              </Text>
            </View>
            {/* 印鑑配置(2 つまで横並び) */}
            <View
              style={{
                flexDirection: "row",
                gap: 6,
                marginTop: 10,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {(stampMode === "company" || stampMode === "both") && companyHanko && (
                <HankoComposite config={{ ...companyHanko, size: 56 }} rotation={-6} />
              )}
              {(stampMode === "person" || stampMode === "both") && personHanko && (
                <HankoComposite config={{ ...personHanko, size: 44 }} rotation={4} />
              )}
            </View>
          </View>
        </View>

        {/* 件名 */}
        <View style={styles.subject}>
          <Text style={styles.subjectLabel}>件名:</Text>
          <Text style={styles.subjectText}>{title}</Text>
        </View>

        {/* 合計(大きく上に) */}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>{moneyLabel}(税込)</Text>
          <Text style={styles.grandTotalValue}>¥{grandTotal.toLocaleString()}</Text>
        </View>

        {/* 明細 table */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.colItem]}>項目 / 工種</Text>
            <Text style={[styles.th, styles.colQty]}>数量</Text>
            <Text style={[styles.th, styles.colUnitPrice]}>単価</Text>
            <Text style={[styles.th, styles.colAmount]}>金額</Text>
          </View>
          {items.map((it) => (
            <View key={it.id} style={styles.tr}>
              <View style={styles.colItem}>
                <Text style={styles.td}>{it.description}</Text>
                <Text style={styles.itemCategory}>{it.category}</Text>
              </View>
              <Text style={[styles.td, styles.colQty]}>
                {it.quantity} {it.unit}
              </Text>
              <Text style={[styles.td, styles.colUnitPrice]}>
                ¥{it.unitPrice.toLocaleString()}
              </Text>
              <Text style={[styles.td, styles.colAmount, { fontWeight: 700 }]}>
                ¥{(it.quantity * it.unitPrice).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* 合計ブロック */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>小計</Text>
            <Text style={styles.totalsValue}>¥{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>消費税({taxRate * 100}%)</Text>
            <Text style={styles.totalsValue}>¥{tax.toLocaleString()}</Text>
          </View>
          <View style={styles.totalsGrand}>
            <Text style={styles.totalsGrandLabel}>合計</Text>
            <Text style={styles.totalsGrandValue}>¥{grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* 備考 / お振込先 */}
        {docType === "estimate" ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>備考</Text>
            <Text style={styles.noteText}>
              本見積書の有効期限は発行日より 1 ヶ月とさせていただきます。
              ご質問等ございましたら担当者までご連絡くださいませ。
            </Text>
          </View>
        ) : (
          <View style={styles.bankBox}>
            <Text style={styles.bankLabel}>お振込先</Text>
            <Text style={styles.bankText}>{bankAccount}</Text>
            <Text style={[styles.bankText, { fontSize: 7, color: COLOR.muted, marginTop: 4 }]}>
              恐れ入りますが振込手数料はご負担くださいませ。
            </Text>
          </View>
        )}

        {/* フッター */}
        <View style={styles.footer}>
          <Text>SAKURA OS — {companyName}</Text>
          <Text>{docType === "estimate" ? "Estimate" : "Invoice"} {docNo}</Text>
        </View>
      </Page>
    </Document>
  );
}
