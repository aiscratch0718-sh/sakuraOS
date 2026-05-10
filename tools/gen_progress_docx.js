/**
 * クライアント向け進捗報告書を Word 形式で生成するスクリプト。
 *
 * 出力:
 *   production/打ち合わせ用/2026-05-10_progress-report.docx       (詳細版)
 *   production/打ち合わせ用/2026-05-10_progress-summary-1page.docx (1 枚版)
 *   production/打ち合わせ用/2026-05-10_questions-for-client.docx   (質問票)
 *
 * ベストプラクティス:
 * - A4 サイズ(日本クライアント向け)
 * - 日本語フォント(游ゴシック)を East Asian font に設定
 * - 表は dual width(columnWidths + 各 cell width)
 * - 進捗バー / 状態タグ は Unicode で表現
 * - Heading は outlineLevel 付き(目次対応)
 */
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  TabStopType,
  TabStopPosition,
} = require("docx");

const OUT_DIR = path.join(__dirname, "..", "production", "打ち合わせ用");

// ============ 共通ヘルパー ============

const FONT = { name: "Arial", eastAsia: "游ゴシック" };
const FONT_BOLD = { ...FONT };

const COLOR = {
  navy: "1A3A6A",
  blue: "2568C8",
  red: "D9415A",
  amber: "C47A00",
  green: "0A8F6E",
  purple: "5B3FA8",
  gold: "FFD700",
  ink: "1A2A3A",
  ink2: "4A6080",
  ink3: "7890A8",
  border: "C8D8E8",
  panel: "EBF2FB",
  panel2: "F5F8FC",
  white: "FFFFFF",
};

/**
 * 段落作成ヘルパー
 */
function p(text, opts = {}) {
  return new Paragraph({
    children: Array.isArray(text)
      ? text
      : [new TextRun({ text: text || "", font: FONT, size: opts.size ?? 22, bold: opts.bold, color: opts.color })],
    spacing: opts.spacing ?? { before: 60, after: 60 },
    alignment: opts.alignment,
    heading: opts.heading,
    pageBreakBefore: opts.pageBreakBefore,
    border: opts.border,
    indent: opts.indent,
    numbering: opts.numbering,
  });
}

/**
 * 見出し H1
 */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: COLOR.navy })],
    spacing: { before: 360, after: 180 },
  });
}

/**
 * 見出し H2
 */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: COLOR.navy })],
    spacing: { before: 280, after: 140 },
  });
}

/**
 * 見出し H3
 */
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: COLOR.ink })],
    spacing: { before: 200, after: 100 },
  });
}

/**
 * セルのヘルパー(内部マージン + 標準ボーダー付き)
 */
function tcell(text, opts = {}) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: COLOR.border };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new TableCell({
    borders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.shading
      ? { fill: opts.shading, type: ShadingType.CLEAR, color: "auto" }
      : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: opts.verticalAlign ?? "center",
    children: Array.isArray(text)
      ? text
      : [
          new Paragraph({
            children: [
              new TextRun({
                text: text || "",
                font: FONT,
                size: opts.size ?? 20,
                bold: opts.bold,
                color: opts.color,
              }),
            ],
            alignment: opts.alignment,
            spacing: { before: 0, after: 0 },
          }),
        ],
  });
}

/**
 * シンプル table (header + rows)
 */
function table(headers, rows, columnWidths) {
  const totalWidth = columnWidths.reduce((s, w) => s + w, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          tcell(h, {
            width: columnWidths[i],
            bold: true,
            shading: COLOR.panel,
            color: COLOR.navy,
          }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((c, i) => {
              if (typeof c === "object" && c.text !== undefined) {
                return tcell(c.text, { width: columnWidths[i], ...c });
              }
              return tcell(c, { width: columnWidths[i] });
            }),
          }),
      ),
    ],
  });
}

/**
 * 区切り線(段落として)
 */
function divider() {
  return new Paragraph({
    children: [new TextRun({ text: "" })],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.border, space: 1 },
    },
    spacing: { before: 100, after: 100 },
  });
}

/**
 * 箇条書きヘルパー(bullet)
 */
function bullet(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: opts.level ?? 0 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? 22,
        bold: opts.bold,
        color: opts.color,
      }),
    ],
    spacing: { before: 40, after: 40 },
  });
}

/**
 * 番号付きリストヘルパー
 */
function num(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "numbers", level: opts.level ?? 0 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? 22,
        bold: opts.bold,
        color: opts.color,
      }),
    ],
    spacing: { before: 40, after: 40 },
  });
}

/**
 * 進捗バー(視覚的)
 */
function progressBar(percent, label) {
  const filled = Math.round((percent / 100) * 30);
  const empty = 30 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return new Paragraph({
    children: [
      new TextRun({
        text: bar,
        font: { name: "Consolas" },
        size: 22,
        color: COLOR.navy,
      }),
      new TextRun({
        text: `  ${percent}% ${label || ""}`,
        font: FONT,
        size: 22,
        bold: true,
        color: COLOR.navy,
      }),
    ],
    spacing: { before: 80, after: 80 },
  });
}

/**
 * メタ情報の box(タイトルページ等)
 */
function metaBox(rows) {
  return table(
    ["項目", "内容"],
    rows.map(([k, v]) => [
      { text: k, bold: true, shading: COLOR.panel2 },
      v,
    ]),
    [3000, 6360],
  );
}

// ============ 共通ドキュメント設定 ============

const COMMON_DOC_OPTS = {
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: COLOR.navy },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: COLOR.navy },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, font: FONT, color: COLOR.ink },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "●",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "○",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
};

const A4_PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm
};

// =================================================================
// ① 詳細版: progress-report.docx
// =================================================================
function makeProgressReport() {
  const children = [];

  // タイトル
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "SAKURA OS 開発進捗ご報告",
          font: FONT,
          size: 40,
          bold: true,
          color: COLOR.navy,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "さくら株式会社 秋元様",
          font: FONT,
          size: 24,
          color: COLOR.ink2,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
    }),
  );

  // メタ情報
  children.push(
    metaBox([
      ["報告日", "2026年5月10日"],
      ["報告者", "株式会社AIscratch / 板澤"],
      ["システム名", "SAKURA OS(さくら株式会社 専用 統合業務管理システム)"],
      ["バージョン", "開発中(本番デプロイ環境にて随時更新)"],
    ]),
  );

  children.push(divider());

  // ============ 1. エグゼクティブサマリー ============
  children.push(h1("1. エグゼクティブサマリー(全体像)"));

  children.push(h2("進捗"));
  children.push(progressBar(30, "完了(全 120 タスク中 26 完了)"));
  children.push(
    p(
      "機能ボリュームベースの主観値です。基盤(認証・データベース・REPORT3)はほぼ完成、ご評価いただいたデモ画面の見た目に近づける作業も大きく進んでいます。",
      { color: COLOR.ink2, size: 20 },
    ),
  );

  children.push(h2("直近の達成事項(過去 1 週間)"));
  [
    "業務基盤の完成 — 日報(REPORT3)、見積、請求、領収書、仕入先請求書、経費管理、工具管理、車両管理、安全書類、各種マスタ管理がすべて稼働可能な状態に到達",
    "ダッシュボードの全面刷新 — ご評価いただいたデモ版 v4.0 のテイストに近い見た目で、本物のデータが流れる構成に",
    "ゲーミフィケーション基盤の構築 — ポイント管理、ランキング、報酬交換、パワプロ風ステータス画面、称号システムを実装",
    "公式マスコット「さくらししまる」を導入 — ご提供いただいたイラスト素材を全画面に統合",
    "マイグレーション(DB スキーマ)0012 / 0013 をすべて Supabase 本番環境に適用済み",
  ].forEach((t, i) => children.push(num(t)));

  children.push(h2("次の重要マイルストーン"));
  children.push(
    table(
      ["時期目安", "マイルストーン"],
      [
        ["5月中旬", "現場マップ画面(マリオ風 + 従業員配置)完成"],
        ["5月下旬", "ボスHPモニター + 幹部育成画面 完成"],
        ["6月上旬", "TASK / スケジュール / 専用打刻 機能 完成"],
        ["6月中旬", "工事概況表(GAIKYO)+ 現場別原価管理 完成"],
        ["6月下旬〜7月", "外部サービス連携(LINE WORKS / マネーフォワード / Cloud Sign / Google Maps)"],
        ["7月以降", "ファイル管理(Google ドライブ風)・AI 高度化"],
      ],
      [2000, 7360],
    ),
  );

  children.push(h2("秋元様にご確認いただきたい事項(後述で詳細)"));
  [
    { color: COLOR.blue, text: "🔵 A. 現場マップのステージ番号採番ルール(マリオ風の「1-1, 1-2」をどう割当てるか)" },
    { color: COLOR.blue, text: "🔵 B. 従業員配置データの取得タイミング(日報提出ベース vs 朝のスケジュール予約)" },
    { color: COLOR.amber, text: "🟡 C. 外部サービス連携の認証情報入手(LINE WORKS / マネーフォワード / Cloud Sign / Google Maps)" },
    { color: COLOR.amber, text: "🟡 D. AI 機能(さくらししまる Claude API 連携)導入時の従業員説明・同意取得方針" },
    { color: COLOR.green, text: "🟢 E. ヒアリングログ(SAKURAOS_ヒアリング項目.xlsx)に未回答の項目" },
  ].forEach((item) => children.push(bullet(item.text, { color: item.color, bold: true })));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ============ 2. 完成済み機能 ============
  children.push(h1("2. 完成済み機能一覧(本日時点で稼働可能)"));

  const COMPLETED_SECTIONS = [
    {
      title: "2-1. 認証・権限管理",
      rows: [
        ["ユーザー登録・サインイン", "✅ 完成"],
        ["5ロール別アクセス制御(作業員 / 現場リーダー / 事務 / 経営層 / システム管理)", "✅ 完成"],
        ["データベースレベルでのテナント分離(セキュリティ強化)", "✅ 完成"],
        ["監査ログ(誰が何を操作したか追跡)", "✅ 完成"],
      ],
    },
    {
      title: "2-2. 日報(REPORT3)— 設計図の核",
      rows: [
        ["モバイルからの日報入力(GPS 取得付き)", "✅ 完成"],
        ["1 回の入力で 5 系統(日報・原価・工事概況・経歴・XP)に同時反映", "✅ 完成"],
        ["原子性保証(途中で失敗したら全部巻き戻る設計)", "✅ 完成"],
        ["二重提出防止(同じデータが 2 回反映されない冪等性保証)", "✅ 完成"],
        ["8 時間超の場合は現場リーダー承認必須", "✅ 完成"],
        ["写真添付(Supabase Storage に保存)", "✅ 完成"],
      ],
    },
    {
      title: "2-3. 営業・売上管理",
      rows: [
        ["見積作成 + PDF 出力", "✅ 完成"],
        ["請求書作成 + PDF 出力 + Excel 出力", "✅ 完成"],
        ["入金管理", "✅ 完成"],
        ["客先別売上集計", "✅ 完成"],
      ],
    },
    {
      title: "2-4. 経費・原価管理",
      rows: [
        ["領収書管理(モバイル撮影 + GPS 付き)", "✅ 完成"],
        ["仕入先請求書管理", "✅ 完成"],
        ["経費管理表", "✅ 完成"],
        ["現場別累計人件費(REPORT3 から自動集計)", "✅ 完成"],
      ],
    },
    {
      title: "2-5. 設備・安全管理",
      rows: [
        ["工具管理(持出 / 返却 / GPS 位置記録)", "✅ 完成"],
        ["車両運行管理(GPS + アルコールチェック必須)", "✅ 完成"],
        ["ヒヤリハット報告(モバイル + GPS)", "✅ 完成"],
        ["安全書類管理(現場ごとに保管)", "✅ 完成"],
        ["元請テンプレート保管(次回流用)", "✅ 完成"],
        ["資格マスタ + 期限切れ間近の自動アラート", "✅ 完成"],
      ],
    },
    {
      title: "2-6. マスタ管理",
      rows: [
        ["現場マスタ", "✅ 完成"],
        ["客先マスタ", "✅ 完成"],
        ["ユーザー管理(ロール / 部署 / 役職)", "✅ 完成"],
        ["単価マスタ", "✅ 完成"],
        ["工種マスタ", "✅ 完成"],
        ["部署マスタ / 役職マスタ", "✅ 完成"],
      ],
    },
    {
      title: "2-7. ダッシュボード(事務・経営層向けホーム画面)",
      rows: [
        ["🦁 さくらししまるサジェスト(状況に応じた助言、現状ルールベース)", "✅ 完成"],
        ["KPI 4 枚(本日の日報提出 / 出勤数 / 安全コンボ日数 / 累計時間+人件費)", "✅ 完成"],
        ["要対応アラート(期限切れ間近資格 / 承認待ち日報 / 重大ヒヤリハット未対応)", "✅ 完成"],
        ["本日の稼働現場(現場ごとの出勤数・進捗・状態を一覧)", "✅ 完成"],
        ["承認・処理キュー(管理者がすぐ対応すべきものをワンクリックで遷移)", "✅ 完成"],
        ["今日の活動タイムライン(監査ログから時系列で表示)", "✅ 完成"],
      ],
    },
    {
      title: "2-8. ゲーミフィケーション",
      rows: [
        ["ポイント管理(/pc/points)", "✅ 完成"],
        ["今月のランキング(プライバシー配慮で匿名化対応)", "✅ 完成"],
        ["報酬交換所(カフェギフト / 有給 / 社長ランチ等)", "✅ 完成"],
        ["報酬交換の承認ワークフロー(申請 → 承認 → 履行)", "✅ 完成"],
        ["獲得ルール管理(管理者編集可)", "✅ 完成"],
        ["パワプロ風ステータス画面(6 軸レーダーチャート)", "✅ 完成"],
        ["称号システム(全 12 種、レアリティ別)", "✅ 完成"],
        ["特殊能力(全 8 種)", "✅ 完成"],
        ["称号付与モーダル(管理者用)", "✅ 完成"],
        ["称号獲得時の演出(フルスクリーンオーバーレイ)", "✅ 完成"],
      ],
    },
    {
      title: "2-9. さくらししまる(公式マスコット)",
      rows: [
        ["秋元様ご提供の公式イラスト導入", "✅ 完成"],
        ["ダッシュボードに表示(浮遊アニメ付き)", "✅ 完成"],
        ["ステータス画面のアドバイス役として配置", "✅ 完成"],
        ["5 つの感情(大喜び / ご機嫌 / 元気 / 心配 / 考え中)", "✅ 完成"],
        ["口調の統一(現代口語、機能と乖離した文言は廃止)", "✅ 完成"],
      ],
    },
  ];

  COMPLETED_SECTIONS.forEach((section) => {
    children.push(h2(section.title));
    children.push(
      table(
        ["機能", "状態"],
        section.rows.map((r) => [
          r[0],
          { text: r[1], bold: true, color: COLOR.green, alignment: AlignmentType.CENTER },
        ]),
        [7560, 1800],
      ),
    );
  });

  children.push(
    p(
      "なお、さくらししまるは現状はルールベース(if-else 判定)で動いています。Claude AI(Anthropic 社)との連携による高度化は Phase 8(最終フェーズ)で行う予定です。",
      { color: COLOR.ink2, size: 20 },
    ),
  );

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ============ 3. 進行中・予定 ============
  children.push(h1("3. 進行中・予定の機能(これから実装する内容)"));
  children.push(
    p(
      "全 120 タスクの予定です。フェーズごとにご説明します。",
      { color: COLOR.ink2 },
    ),
  );

  children.push(h2("Phase 3-C: 現場マップ画面(マリオ風)— 次に着手予定"));
  children.push(
    p(
      "目玉機能の 1 つ。ご評価いただいたデモ版にあった現場マップを本物のデータで実装します。",
      { bold: true },
    ),
  );
  children.push(
    table(
      ["要素", "内容"],
      [
        ["マップ全体", "マリオのワールドマップ風の見た目(雲・パイプ・ブロック等の装飾)"],
        ["ステージ表記", "「1-1: 〇〇マンション新築」「1-2: 桜ヶ丘リフォーム」のように WORLD-STAGE 番号 + 現場名"],
        ["エリア分け", "WORLD = エリア(東京 / 神奈川 / 埼玉 等)単位でタブ切替"],
        ["進捗別配色", "順調(緑) / 注意(黄) / 遅延(赤・点滅) / 未着手(点線)"],
        [{ text: "🆕 従業員配置レイヤー", bold: true, color: COLOR.red }, { text: "「誰が今どの現場にいるか」をマップ上で確認可能(3 モード切替: 進捗 / 配置 / 班別)", bold: true }],
        ["自分の現在地", "さくらししまるアイコンで「自分が今いる現場」を表示"],
        ["現場詳細ポップアップ", "クリックで進捗 / 配置メンバー / 出来高 / 安全コンボ / 残工期 を表示"],
        ["マップエディタ", "管理者がドラッグ&ドロップで現場の位置とステージ番号を設定可能"],
        ["モバイル版 /sp/map", "縦スクロールに最適化"],
      ],
      [2200, 7160],
    ),
  );

  const FUTURE_PHASES = [
    {
      title: "Phase 3-D: ボスHPモニター(TV 用フルスクリーン画面)",
      desc: "事務所の TV モニターに大きく表示する用の画面。",
      bullets: [
        "現場ごとの「今日の達成 ÷ 目標」を巨大な HP ゲージで表示",
        "LIVE バッジ + 安全コンボ日数 + 本日の TOP3 + さくらししまる",
        "自動更新でリアルタイム表示",
        "認証なしの共有閲覧トークン経由でアクセス可能(キオスク表示用)",
      ],
    },
    {
      title: "Phase 3-E: 幹部育成スキルツリー",
      desc: "次世代リーダーの育成計画を可視化。",
      bullets: [
        "各社員ごとのキャリアパス",
        "必要な資格・スキル・経験を「スキルツリー」で表示",
        "育成進捗の管理",
      ],
    },
    {
      title: "Phase 4: 演出仕上げ",
      desc: "",
      bullets: [
        "数値が滑らかにカウントアップする演出",
        "各カードがふわっと表示されるアニメーション",
        "モバイル(/sp/*)版主要画面の最適化",
      ],
    },
    {
      title: "Phase 5: 業務基盤の補強(TASK / SCH / 専用打刻)",
      desc: "ご評価いただいたデモ版にあって今は無い機能を追加。",
      bullets: [
        "TASK 管理: 案件配下のタスクを Kanban ボード風に管理(REPORT3 への入口)",
        "スケジュール / 配車表: 週間ビュー、ドラッグ&ドロップで人員配置編集",
        "専用打刻機能: GPS 付き出退勤打刻(モバイルから)",
        "「今日の予定」画面: 朝一番に作業員が見る画面",
      ],
    },
    {
      title: "Phase 6: 工事概況表(GAIKYO)+ 現場別原価詳細",
      desc: "設計図の核の 1 つ。売上 → 請求 → 原価 → 利益 が数字でつながる。",
      bullets: [
        "現場ごとの原価内訳(人件費 / 材料費 / 外注費 / 車両費 / 雑費)を円グラフ + 月次推移",
        "全社の工事概況表(売上・原価・利益・進捗を一覧)",
        "PDF 出力対応",
      ],
    },
    {
      title: "Phase 7: 外部サービス連携",
      desc: "⚠️ このフェーズには認証情報の入手が必須(後述「ご確認事項 C」)。",
      bullets: [
        "LINE WORKS 通知: 入力遅れ・期限切れ・承認依頼を LINE WORKS グループに自動配信",
        "マネーフォワード連携: 仕訳・請求・給与データを自動連携(連携ログ + 再送機能付き)",
        "Cloud Sign 連携: 見積承認 → 契約書を電子署名で送信 → 締結 PDF を自動保管",
        "Google Maps 連携: 現場住所を実地図で表示、配車ルート確認",
      ],
    },
    {
      title: "Phase 8: ゲーミフィケーション完成 + AI 高度化",
      desc: "",
      bullets: [
        "バッジ画面(図鑑形式) / クエスト画面 / クエスト達成判定バッチ",
        "ランクアップ通知 + 演出",
        "さくらししまる AI ナビ(状況察知エンジン): 全画面右下にフローティング、状況に応じて声かけ",
        "Claude AI 連携(高度化): 個人コーチング / 経営層向け自由質問 / 月次レポート所感",
        "⚠️ 詳細なメリット・デメリット・リスクは着手直前に再度ご説明します(後述「ご確認事項 D」)",
      ],
    },
    {
      title: "Phase 9: 全画面のロール別表示制御の徹底",
      desc: "「マスタ更新は事務ロールのみ」原則を全画面で履行。",
      bullets: [
        "事務ロールしか見えない画面が一般作業員に表示されない設計の徹底",
        "全画面を Playwright(自動テスト)で巡回テスト",
      ],
    },
    {
      title: "Phase 10: 汎用ファイル管理(Google ドライブ風)— 板澤様 追加要件",
      desc: "設計図の DOC モジュール + 板澤様の追加要件 を実装。",
      bullets: [
        "フォルダ階層管理(Google ドライブのような操作感)",
        "ロール別アクセス制御(役職別 / ユーザー別 / 部署別)",
        "ドラッグ&ドロップでアップロード",
        "ファイルのバージョン管理(同名再アップロードで履歴保持)",
        "監査ログ(誰がいつ何を view/download したか追跡)",
        "既存の安全書類・元請テンプレート・領収書写真は段階的にこの汎用システムに統合",
      ],
    },
  ];

  FUTURE_PHASES.forEach((phase) => {
    children.push(h2(phase.title));
    if (phase.desc) children.push(p(phase.desc));
    phase.bullets.forEach((b) => children.push(bullet(b)));
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ============ 4. ご確認事項 ============
  children.push(h1("4. 秋元様にご確認いただきたい事項"));

  // A
  children.push(h2("🔵 A. 現場マップのステージ番号採番ルール(優先度: 高)"));
  children.push(p("Phase 3-C 着手前にご確認ください。", { bold: true }));
  children.push(p("例えば「東京エリアに 5 現場、神奈川エリアに 3 現場」がある場合:"));
  children.push(p("選択肢 1: 完全自動採番 / WORLD = エリアで自動、STAGE = 同 WORLD 内で連番自動"));
  children.push(p("選択肢 2: 管理者が手動採番 / 「これは WORLD 2 のステージ 3」と現場登録時に手動で番号を入れる(重要な現場をボスステージにできる)"));
  children.push(p("選択肢 3: ハイブリッド / WORLD 番号は手動、STAGE 番号(同 WORLD 内の連番)は自動"));
  children.push(p("▶ どの方式がお好みですか?", { bold: true, color: COLOR.blue }));

  // B
  children.push(h2("🔵 B. 従業員配置データの取得タイミング(優先度: 高)"));
  children.push(p("「マップ上で誰が今どの現場にいるか」を表示する場合のデータソース:"));
  children.push(p("選択肢 1: 日報提出ベース(現状の実装方針)"));
  children.push(bullet("利点: 確定データ、追加入力不要", { level: 1 }));
  children.push(bullet("欠点: 日中はリアルタイムに分からない(夕方以降にしか正確に分からない)", { level: 1 }));
  children.push(p("選択肢 2: 朝のスケジュール予約ベース"));
  children.push(bullet("利点: 朝から「今日の配置」が一覧できる", { level: 1 }));
  children.push(bullet("欠点: 入力の追加負担、変更時の更新漏れリスク", { level: 1 }));
  children.push(p("選択肢 3: ハイブリッド(推奨)"));
  children.push(bullet("朝はスケジュール、夕方以降は日報で確定", { level: 1 }));
  children.push(p("▶ さくら株式会社様の実運用ではどれが現実的ですか?", { bold: true, color: COLOR.blue }));

  // C
  children.push(h2("🟡 C. 外部サービス連携の認証情報入手(優先度: 中、Phase 7 着手前)"));
  children.push(p("Phase 7 着手のために以下が必要です。各社のアカウント管理者と調整いただけますか?"));
  children.push(
    table(
      ["サービス", "必要なもの", "用途"],
      [
        ["LINE WORKS", "Bot ID / API キー / グループ ID 一覧", "通知配信"],
        ["マネーフォワード", "OAuth クライアント ID / シークレット", "仕訳・請求・給与連携"],
        ["Cloud Sign", "API キー / Webhook URL 設定権限", "電子契約"],
        ["Google Maps", "API キー(ブラウザ用 / サーバー用 2 種)", "地図表示・ルート計算"],
      ],
      [2400, 4500, 2460],
    ),
  );
  children.push(p("▶ 入手スケジュールの目安はありますか?", { bold: true, color: COLOR.amber }));

  // D
  children.push(h2("🟡 D. AI 機能導入時の従業員説明・同意取得方針(優先度: 中、Phase 8 P8-09 着手前)"));
  children.push(p("Phase 8 で「さくらししまる」が Claude AI(Anthropic 社)で個別コーチング助言する機能を導入予定です。"));
  children.push(p("設計時点で確定している秘匿性担保:", { bold: true }));
  [
    "氏名・メール・電話・住所(精密)・マイナンバー・健康情報・給与額・精密 GPS 座標は送信しません",
    "専用の匿名化レイヤーが機械的に送信を制御",
    "API データは Anthropic の学習に使われない契約",
    "テナント単位で機能 ON/OFF 可能、ユーザー個別オプトアウトも可能",
    "月予算上限を設定可能",
  ].forEach((b) => children.push(bullet(b)));
  children.push(
    p(
      "導入着手前(Phase 8 P8-09 直前)に、私(板澤)から再度詳細なメリット・デメリット・リスク範囲をご説明します。",
      { bold: true, color: COLOR.amber },
    ),
  );
  children.push(p("その時点で、AI 機能を使う場合の従業員への事前説明文(案)、同意書のフォーマット(案)、AI が提示する評価への異議申立フローを事務局様と協議させてください。"));
  children.push(p("▶ 現時点で「ここは特に丁寧に従業員に説明したい」という観点はありますか?", { bold: true, color: COLOR.amber }));

  // E
  children.push(h2("🟢 E. ヒアリングログの未回答項目(優先度: 低・継続的に)"));
  children.push(p("SAKURAOS_ヒアリング項目.xlsx に未回答の項目が残っています:"));
  [
    "Q6-1, Q6-3: 松竹梅判定 / 単価タイミング(社長ご確認待ち)",
    "Q8: REPORT3 4-tier 分類(社長ご確認中)",
    "Q3-2: 工事経歴書 Excel テンプレート(共有待ち)",
    "Q13-Q15: メニュー表示の縦/横、カテゴリ分けの好み(現状はカテゴリ別ツリー暫定実装中)",
  ].forEach((b) => children.push(bullet(b)));
  children.push(p("▶ お時間あるときにご回答いただければ実装に反映します。", { bold: true, color: COLOR.green }));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ============ 5. リスク・前提条件 ============
  children.push(h1("5. リスク・前提条件"));

  children.push(h2("5-1. 現状特定されているリスク"));
  children.push(
    table(
      ["リスク", "影響", "対応状況"],
      [
        ["API キー入手の遅れ", "Phase 7(外部連携)着手が遅延", "早めに調整いただきたい"],
        ["AI 機能の従業員受容度", "Phase 8 後半の導入可否", "事前説明・同意取得フローを設計予定"],
        ["マスコット画像の著作権・商用利用範囲", "プロジェクト全体", "秋元様ご提供素材の使用権を確認させてください"],
        ["Supabase 無料枠の上限到達", "本番運用開始時", "データ量が増えたら有料プランへ移行(月 ¥3,500 程度)"],
      ],
      [3000, 3000, 3360],
    ),
  );

  children.push(h2("5-2. 設計上の前提条件"));
  [
    "マネーフォワード本体は変更しない(API / CSV 連携のみ)",
    "会計・給与は SAKURA OS 内で完結させない(マネーフォワードに必ず最終データを送る)",
    "法的に必要な書類(雇用契約、就業規則等)は別途人事マターで対応",
    "バックアップは Supabase 自動 + 月次論理バックアップ運用(Phase 10)",
  ].forEach((b) => children.push(bullet(b)));

  // ============ 6. アクセス情報 ============
  children.push(h1("6. アクセス情報"));
  children.push(h2("デモ・本番確認用 URL"));
  children.push(
    table(
      ["種別", "URL"],
      [
        ["本番デプロイ環境", "Vercel ダッシュボードでご確認、別途ご連絡"],
        ["ソースコード(参考)", "https://github.com/aiscratch0718-sh/sakuraOS"],
      ],
      [2400, 6960],
    ),
  );
  children.push(h2("ログイン用テストアカウント"));
  children.push(p("板澤よりメッセージで別途お送りします(本資料には記載しません)。"));

  children.push(h2("動作確認推奨環境"));
  children.push(
    table(
      ["端末", "OS", "ブラウザ"],
      [
        ["PC", "Windows 10 / 11 / macOS", "Chrome / Edge(最新)"],
        ["モバイル", "iOS 16+ / Android 12+", "Safari / Chrome"],
      ],
      [2000, 4000, 3360],
    ),
  );

  // ============ 7. スケジュール ============
  children.push(h1("7. 想定スケジュール(全体俯瞰)"));
  children.push(
    table(
      ["月", "予定内容"],
      [
        ["2026-05", "Phase 3-C / 3-D / 3-E 完成"],
        ["2026-06", "Phase 4 / 5 完成"],
        ["2026-07", "Phase 6 / 7 開始"],
        ["2026-08", "Phase 7 完成、Phase 8 開始"],
        ["2026-09", "Phase 8 / 9 / 10 完成"],
        ["2026-10", "本番リリース準備"],
      ],
      [1600, 7760],
    ),
  );
  children.push(
    p(
      "※ あくまで現時点での見込みです。Phase 7(外部連携)は API キー入手次第、Phase 8(AI 機能)は秋元様の従業員ご説明と同意取得のタイミングに依存します。",
      { color: COLOR.ink2, size: 20 },
    ),
  );

  // ============ 8. 次回ご報告 ============
  children.push(h1("8. 次回ご報告"));
  children.push(
    table(
      ["報告タイミング", "内容"],
      [
        ["5月中旬", "Phase 3-C(現場マップ)完成のご報告"],
        ["5月下旬", "Phase 4 までの完成のご報告"],
        ["6月上旬", "Phase 5 完成 + Phase 6 着手のご報告"],
        ["7月以降", "月次定例化を提案させてください"],
      ],
      [2400, 6960],
    ),
  );
  children.push(p("ご不明な点・追加のご要望は随時お知らせください。", { bold: true }));

  children.push(divider());
  children.push(
    p("株式会社AIscratch / 板澤", {
      bold: true,
      alignment: AlignmentType.RIGHT,
      color: COLOR.navy,
    }),
  );

  return new Document({
    ...COMMON_DOC_OPTS,
    sections: [
      {
        properties: { page: A4_PAGE },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SAKURA OS 開発進捗ご報告",
                    font: FONT,
                    size: 18,
                    color: COLOR.ink3,
                  }),
                  new TextRun({ text: "\t" }),
                  new TextRun({
                    text: "2026-05-10 / 株式会社AIscratch",
                    font: FONT,
                    size: 18,
                    color: COLOR.ink3,
                  }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", font: FONT, size: 18, color: COLOR.ink3 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: COLOR.ink3 }),
                  new TextRun({ text: " / ", font: FONT, size: 18, color: COLOR.ink3 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: COLOR.ink3 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

// =================================================================
// ② 1 枚版: progress-summary-1page.docx
// =================================================================
function makeSummary() {
  const children = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "SAKURA OS 進捗ご報告(1 枚版)",
          font: FONT,
          size: 36,
          bold: true,
          color: COLOR.navy,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "さくら株式会社 秋元様 / 2026年5月10日 / 株式会社AIscratch 板澤",
          font: FONT,
          size: 20,
          color: COLOR.ink2,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  );

  children.push(divider());

  children.push(h2("全体進捗:約 30% 完了"));
  children.push(progressBar(30, "全 120 タスク中 26 完了"));

  children.push(h2("完成しているもの(本日時点で稼働可能)"));
  [
    "業務基盤(認証 / RBAC / 多テナント分離 / 監査ログ)",
    "REPORT3(日報): 1 回入力で 5 系統反映、原子性保証 + 二重提出防止",
    "見積 / 請求 / 入金 / 客先別売上(PDF・Excel 出力対応)",
    "領収書・仕入先請求書・経費管理(モバイル + GPS)",
    "工具 / 車両 / アルコールチェック / ヒヤリハット",
    "安全書類 / 元請テンプレート / 各種マスタ",
    "ダッシュボード(KPI 4 + さくらししまる + 要対応アラート + 本日の稼働現場)",
    "ゲーミフィケーション:ポイント / ランキング / 報酬交換 / 6軸パワプロ風ステータス / 称号 12 種 / 特殊能力 8 種 / 称号獲得演出",
    "公式マスコット「さくらししまる」全画面導入",
  ].forEach((b) => children.push(bullet(b, { color: COLOR.green, bold: true })));

  children.push(h2("次に進める内容"));
  children.push(
    table(
      ["時期目安", "内容"],
      [
        ["5月中旬", "現場マップ画面(マリオ風 + 従業員配置)"],
        ["5月下旬", "ボスHPモニター + 幹部育成スキルツリー + 演出仕上げ"],
        ["6月", "TASK / スケジュール / 専用打刻 + 工事概況表(GAIKYO)"],
        ["7月", "外部連携(LINE WORKS / マネーフォワード / Cloud Sign / Google Maps)"],
        ["8月以降", "バッジ画面・クエスト・AI 高度化、ロール別画面ガード、ファイル管理(Google ドライブ風)"],
      ],
      [1800, 7560],
    ),
  );

  children.push(h2("秋元様にご確認いただきたい 5 点"));
  children.push(
    table(
      ["#", "内容", "優先度"],
      [
        ["A", "現場マップのステージ番号採番ルール(自動 / 手動 / ハイブリッド)", { text: "🔵 高", bold: true, color: COLOR.blue, alignment: AlignmentType.CENTER }],
        ["B", "従業員配置データの取得タイミング(日報ベース / 朝の予約 / 両方)", { text: "🔵 高", bold: true, color: COLOR.blue, alignment: AlignmentType.CENTER }],
        ["C", "LINE WORKS / マネーフォワード / Cloud Sign / Google Maps の API キー入手調整", { text: "🟡 中", bold: true, color: COLOR.amber, alignment: AlignmentType.CENTER }],
        ["D", "AI 機能(Claude API)導入時の従業員説明・同意取得方針", { text: "🟡 中", bold: true, color: COLOR.amber, alignment: AlignmentType.CENTER }],
        ["E", "ヒアリングログ未回答項目(松竹梅 / 4-tier 分類 / 工事経歴書テンプレ 等)", { text: "🟢 低", bold: true, color: COLOR.green, alignment: AlignmentType.CENTER }],
      ],
      [600, 7000, 1760],
    ),
  );

  children.push(divider());
  children.push(
    p(
      "詳細は別資料(2026-05-10_progress-report.docx)にてご確認ください。",
      { color: COLOR.ink2, size: 20, alignment: AlignmentType.CENTER },
    ),
  );

  return new Document({
    ...COMMON_DOC_OPTS,
    sections: [
      {
        properties: { page: A4_PAGE },
        children,
      },
    ],
  });
}

// =================================================================
// ③ 質問票: questions-for-client.docx
// =================================================================
function makeQuestions() {
  const children = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "進捗報告に伴うご確認事項",
          font: FONT,
          size: 36,
          bold: true,
          color: COLOR.navy,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "(秋元様ご記入用)",
          font: FONT,
          size: 24,
          color: COLOR.ink2,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
  );

  children.push(p("2026年5月10日 / さくら株式会社 秋元様", { color: COLOR.ink2 }));
  children.push(
    p(
      "進捗報告書の中で「ご確認いただきたい事項」として挙げた 5 点について、ご回答をいただきたく、回答シートをお送りします。お手すきの際にご記入ください。",
    ),
  );

  children.push(divider());

  // A
  children.push(h1("🔵 A. 現場マップのステージ番号採番ルール(優先度: 高)"));
  children.push(
    p('ご評価いただいたデモ版にあった「マリオ風ステージ番号(1-1, 1-2…)」の運用方式について。'),
  );
  [
    "[ ] A-1. 完全自動採番(WORLD = エリアで自動、STAGE = 同 WORLD 内で連番自動)",
    "[ ] A-2. 完全手動採番(管理者が現場登録時に「これは WORLD 2 のステージ 3」と手入力 → 重要な現場をボスステージにできる)",
    "[ ] A-3. ハイブリッド(WORLD は手動、STAGE は自動)",
    "[ ] A-4. その他(自由記述)",
  ].forEach((b) => children.push(p(b)));
  children.push(p("自由記述欄:"));
  for (let i = 0; i < 3; i++) children.push(p("____________________________________________________________________"));

  children.push(p("補足要望:", { bold: true }));
  for (let i = 0; i < 2; i++) children.push(p("____________________________________________________________________"));

  children.push(divider());

  // B
  children.push(h1("🔵 B. 従業員配置データの取得タイミング(優先度: 高)"));
  children.push(p("「マップ上で誰が今どの現場にいるか」を表示する場合、どのデータをソースにするか。"));
  [
    "[ ] B-1. 日報提出ベース(夕方以降に確定) / 入力負担なし、リアルタイム性なし",
    "[ ] B-2. 朝のスケジュール予約ベース / 朝から配置可視化可能、入力負担あり",
    "[ ] B-3. ハイブリッド(朝はスケジュール、夕方以降は日報で確定) / 推奨案。運用フロー設計が必要",
    "[ ] B-4. その他",
  ].forEach((b) => children.push(p(b)));
  for (let i = 0; i < 2; i++) children.push(p("____________________________________________________________________"));

  children.push(p("朝の入力は誰がやる想定でしょうか?", { bold: true }));
  [
    "[ ] 各従業員が自分で入力",
    "[ ] 班リーダーが班員分まとめて入力",
    "[ ] 管理者が一括入力",
  ].forEach((b) => children.push(p(b)));

  children.push(divider());

  // C
  children.push(h1("🟡 C. 外部サービス連携の認証情報入手スケジュール(優先度: 中)"));
  children.push(p("Phase 7(外部連携)着手のために必要です。各サービスのアカウント管理者と調整いただける時期の目安をご記入ください。"));
  children.push(
    table(
      ["サービス", "必要なもの", "入手目安"],
      [
        ["LINE WORKS", "Bot ID / API キー / グループ ID 一覧", "____月____日頃"],
        ["マネーフォワード", "OAuth クライアント ID / シークレット", "____月____日頃"],
        ["Cloud Sign", "API キー / Webhook 設定権限", "____月____日頃"],
        ["Google Maps Platform", "API キー(2 種:ブラウザ用 / サーバー用)", "____月____日頃"],
      ],
      [2400, 4500, 2460],
    ),
  );
  children.push(p("ご懸念:", { bold: true }));
  for (let i = 0; i < 3; i++) children.push(p("____________________________________________________________________"));

  children.push(divider());

  // D
  children.push(h1("🟡 D. AI 機能導入時の従業員説明・同意取得方針(優先度: 中)"));
  children.push(p("Phase 8 後半で「さくらししまる」が Claude AI と連携してパーソナライズされた助言を提供する機能を導入予定です。"));
  children.push(p("設計時点で確定している秘匿性担保(再掲):", { bold: true }));
  [
    "個人を特定できる情報(氏名・電話・住所・マイナンバー・健康情報・給与額・精密 GPS)は API に送信しない",
    "機械的に送信制御するレイヤー実装済み",
    "API データは Anthropic の学習に使われない契約",
    "機能ごとに ON/OFF 切替可能、ユーザー個別オプトアウト可能",
  ].forEach((b) => children.push(bullet(b)));

  children.push(p("D-1. 従業員への事前説明はどなたが担当されますか?", { bold: true }));
  ["[ ] 社長", "[ ] 事務局", "[ ] 板澤(株式会社AIscratch)から説明会開催"].forEach((b) => children.push(p(b)));

  children.push(p("D-2. AI による評価の異議申立フローは必要ですか?", { bold: true }));
  ["[ ] 必要(具体的な仕組みを設計)", "[ ] 不要(社長判断で十分)"].forEach((b) => children.push(p(b)));

  children.push(p("D-3. 特に丁寧に説明したい観点があれば:", { bold: true }));
  for (let i = 0; i < 3; i++) children.push(p("____________________________________________________________________"));

  children.push(p("D-4. AI 機能を最初から ON にしますか?それともテスト期間後に判断しますか?", { bold: true }));
  [
    "[ ] 最初から ON",
    "[ ] テスト期間(1 ヶ月程度)後に判断",
    "[ ] パイロットメンバー数名でテスト後、全社展開",
  ].forEach((b) => children.push(p(b)));

  children.push(divider());

  // E
  children.push(h1("🟢 E. ヒアリングログ未回答項目(優先度: 低・継続的に)"));
  children.push(p("SAKURAOS_ヒアリング項目.xlsx の以下が未回答です。お時間あるときにご回答ください。"));

  children.push(h2("Q6-1, Q6-3: 松竹梅判定 / 単価タイミング(社長判断項目)"));
  for (let i = 0; i < 3; i++) children.push(p("____________________________________________________________________"));

  children.push(h2("Q8: REPORT3 4-tier 分類(社長ご確認中)"));
  for (let i = 0; i < 3; i++) children.push(p("____________________________________________________________________"));

  children.push(h2("Q3-2: 工事経歴書 Excel テンプレート"));
  ["[ ] 別途共有予定 / 共有時期: ____________", "[ ] 既存テンプレートなし、新規作成希望"].forEach((b) => children.push(p(b)));

  children.push(h2("Q13-Q15: メニュー表示の好み"));
  children.push(p("現状は「カテゴリ別ツリー形式(縦)」で暫定実装中です。"));
  [
    "[ ] 現状の縦表示で OK",
    "[ ] 横表示に変更したい",
    "[ ] アコーディオン式に変更したい",
    "[ ] 大きく変更不要 / その他要望:",
  ].forEach((b) => children.push(p(b)));
  for (let i = 0; i < 2; i++) children.push(p("____________________________________________________________________"));

  children.push(h2("その他、追加でご要望があれば"));
  for (let i = 0; i < 5; i++) children.push(p("____________________________________________________________________"));

  children.push(divider());
  children.push(
    p("ご記入ありがとうございます。", {
      bold: true,
      alignment: AlignmentType.CENTER,
      color: COLOR.navy,
    }),
  );
  children.push(
    p("ご返送先: 板澤(株式会社AIscratch)", {
      alignment: AlignmentType.CENTER,
      color: COLOR.ink2,
    }),
  );

  return new Document({
    ...COMMON_DOC_OPTS,
    sections: [
      {
        properties: { page: A4_PAGE },
        children,
      },
    ],
  });
}

// =================================================================
// 実行
// =================================================================
async function main() {
  const tasks = [
    {
      name: "詳細版",
      doc: makeProgressReport(),
      file: "2026-05-10_progress-report.docx",
    },
    {
      name: "1 枚版",
      doc: makeSummary(),
      file: "2026-05-10_progress-summary-1page.docx",
    },
    {
      name: "質問票",
      doc: makeQuestions(),
      file: "2026-05-10_questions-for-client.docx",
    },
  ];

  for (const task of tasks) {
    const buffer = await Packer.toBuffer(task.doc);
    const out = path.join(OUT_DIR, task.file);
    fs.writeFileSync(out, buffer);
    const stats = fs.statSync(out);
    console.log(`✅ ${task.name}: ${task.file} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
  console.log("\n全 3 ファイル生成完了。");
}

main().catch((err) => {
  console.error("❌ 生成エラー:", err);
  process.exit(1);
});
