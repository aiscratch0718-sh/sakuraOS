/**
 * 印鑑(印影)SVG 生成 — 純粋関数。
 *
 * 用途:
 *  - 見積書 / 請求書 / 工事概況表の PDF 出力時に押印
 *  - 画面プレビューでも視覚的に同じ印影を表示
 *
 * 種類:
 *  - round(丸印): 担当者印・代表印など、直径 40-60mm 想定
 *  - square(角印): 会社印、辺 25-30mm 想定
 *
 * 設計思想:
 *  - 印影画像ファイルを管理不要(SVG 動的生成)
 *  - 名前変更・サイズ自由・色変更可
 *  - PDF 内に <Svg> として直接埋め込み可能(react-pdf 互換)
 *  - 朱肉色は #c8102e(伝統的な赤)固定
 *
 * 名前の文字数別の自動配置:
 *  - 1-2 文字: 大きく中央配置
 *  - 3-4 文字: 2x2 グリッド
 *  - 5+ 文字: 2 列縦書き
 *
 * TODO(P-PDF-stamp-image): approval_stamps テーブルから実印影画像 (PNG) を
 * 取得して優先表示する fallback ロジックを追加。
 */

export type HankoType = "round" | "square";

export type HankoConfig = {
  /** 印影に刻まれる名前(姓 / 会社略称 / 役職) */
  name: string;
  /** 印影タイプ */
  type: HankoType;
  /** 印影の物理サイズ(px、SVG viewBox 基準) */
  size?: number;
  /** 朱肉色(デフォルト伝統的な赤) */
  color?: string;
};

const DEFAULT_COLOR = "#c8102e";
const DEFAULT_SIZE = 80;

/**
 * 印鑑 SVG 文字列を生成(react-pdf の <Svg> の中身として直接使用可)。
 */
export function generateHankoSvg(config: HankoConfig): string {
  const { name, type, size = DEFAULT_SIZE, color = DEFAULT_COLOR } = config;

  if (type === "round") {
    return generateRoundHanko(name, size, color);
  }
  return generateSquareHanko(name, size, color);
}

/**
 * 丸印生成(担当者印)。
 * 二重円 + 名前文字
 */
function generateRoundHanko(name: string, size: number, color: string): string {
  const center = size / 2;
  const outerR = (size / 2) * 0.94;
  const innerR = (size / 2) * 0.86;
  const chars = name.slice(0, 4); // 最大 4 文字
  const fontSize = chars.length === 1 ? size * 0.45 : chars.length === 2 ? size * 0.36 : size * 0.28;

  // 文字配置(1-2 文字は横、3-4 文字は 2x2)
  let textElements = "";
  if (chars.length <= 2) {
    textElements = `<text x="${center}" y="${center + fontSize * 0.35}" font-size="${fontSize}" fill="${color}" text-anchor="middle" font-weight="bold">${chars}</text>`;
  } else {
    // 2x2 グリッド(右上→左上→右下→左下、印鑑文化準拠)
    const offset = fontSize * 0.55;
    const positions = [
      { x: center + offset, y: center - offset * 0.4 },
      { x: center - offset, y: center - offset * 0.4 },
      { x: center + offset, y: center + offset * 1.0 },
      { x: center - offset, y: center + offset * 1.0 },
    ];
    chars.split("").forEach((ch, i) => {
      const p = positions[i]!;
      textElements += `<text x="${p.x}" y="${p.y}" font-size="${fontSize}" fill="${color}" text-anchor="middle" font-weight="bold">${ch}</text>`;
    });
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} 印影">
      <circle cx="${center}" cy="${center}" r="${outerR}" fill="none" stroke="${color}" stroke-width="${size * 0.045}" />
      <circle cx="${center}" cy="${center}" r="${innerR}" fill="none" stroke="${color}" stroke-width="${size * 0.018}" />
      ${textElements}
    </svg>
  `.trim();
}

/**
 * 角印生成(会社印)。
 * 二重正方形 + 名前(複数行)
 */
function generateSquareHanko(name: string, size: number, color: string): string {
  const pad = size * 0.06;
  const innerPad = size * 0.12;
  const fontSize = name.length <= 3 ? size * 0.32 : name.length <= 5 ? size * 0.24 : size * 0.18;
  const lineHeight = fontSize * 1.05;

  // 縦書き風(各文字を縦に積む)
  const chars = name.slice(0, 8).split("");
  // 6 文字以下なら 1 列、7-8 文字なら 2 列
  const cols = chars.length > 6 ? 2 : 1;
  const colWidth = (size - innerPad * 2) / cols;

  let textElements = "";
  chars.forEach((ch, i) => {
    const col = cols === 2 ? Math.floor(i / Math.ceil(chars.length / 2)) : 0;
    const row = cols === 2 ? i % Math.ceil(chars.length / 2) : i;
    const x = innerPad + colWidth * (cols - col - 0.5);
    const y = innerPad + lineHeight * (row + 0.85);
    textElements += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" text-anchor="middle" font-weight="bold">${ch}</text>`;
  });

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} 社印">
      <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" fill="none" stroke="${color}" stroke-width="${size * 0.045}" />
      <rect x="${pad * 2.2}" y="${pad * 2.2}" width="${size - pad * 4.4}" height="${size - pad * 4.4}" fill="none" stroke="${color}" stroke-width="${size * 0.015}" />
      ${textElements}
    </svg>
  `.trim();
}

/**
 * SVG 文字列を data: URL に変換(画面プレビューの <img src="..."> 用)。
 */
export function hankoToDataUrl(svg: string): string {
  // Base64 経由のほうがブラウザ間互換性が高い + 日本語 SVG でも安定
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

/* ============================================================
   押印モード設定(旧仕様、互換性のため残置)
   ============================================================ */

export type StampMode = "none" | "person" | "company" | "both";

export const STAMP_MODE_META: Record<
  StampMode,
  { label: string; description: string }
> = {
  none: { label: "未押印", description: "印影なし(下書き / 検討中)" },
  person: { label: "担当者印", description: "丸印のみ押印" },
  company: { label: "会社印", description: "角印のみ押印" },
  both: { label: "両方押印", description: "担当者印 + 会社印" },
};

/* ============================================================
   実印影画像レジストリ(新仕様、2026-05-18)
   ============================================================

   public/stamps/ に配置された実際の印影画像を登録する。
   会社印は常時利用可能、担当者印は複数選択(checkbox)。

   TODO(P-PDF-stamp-upload): Supabase Storage 連携 + 印影アップロード UI、
   approval_stamps テーブルから取得。
*/

export type CompanyStamp = {
  id: "company";
  label: string;
  type: "square";
  url: string;
};

export type PersonStamp = {
  id: string;
  /** 表示名 */
  label: string;
  /** 役職 */
  role: string;
  type: "round";
  url: string;
};

export const COMPANY_STAMP: CompanyStamp = {
  id: "company",
  label: "さくら株式会社 角印",
  type: "square",
  url: "/stamps/company.jpg",
};

export const PERSON_STAMPS: PersonStamp[] = [
  {
    id: "shacho",
    label: "高橋(社長)",
    role: "代表取締役",
    type: "round",
    url: "/stamps/shacho.jpg",
  },
  {
    id: "senmu",
    label: "専務",
    role: "専務取締役",
    type: "round",
    url: "/stamps/senmu.jpg",
  },
  {
    id: "terasawa",
    label: "寺澤",
    role: "現場主任",
    type: "round",
    url: "/stamps/terasawa.jpg",
  },
  {
    id: "hayashi",
    label: "林",
    role: "事務",
    type: "round",
    url: "/stamps/hayashi.jpg",
  },
  {
    id: "shirai",
    label: "白井",
    role: "営業",
    type: "round",
    url: "/stamps/shirai.png",
  },
];

/** 押印設定(新仕様)*/
export type StampConfig = {
  /** 会社印を押すか(デフォルト true) */
  companyOn: boolean;
  /** 押印する担当者 ID 配列(複数選択可) */
  personIds: string[];
};

export const DEFAULT_STAMP_CONFIG: StampConfig = {
  companyOn: true,
  personIds: [],
};

/** id → PersonStamp の lookup */
export function findPersonStamp(id: string): PersonStamp | undefined {
  return PERSON_STAMPS.find((p) => p.id === id);
}
