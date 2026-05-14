/**
 * 通知画面の Mock データ(配管業向け、宮城県現場の通知 18 件)。
 * 本実装 P12-03-data まで暫定。DB(notifications + 関連エンティティ)から取得に置き換える。
 *
 * 種別:
 *  - report3:    REPORT3 入力関連(提出 / 未入力アラート)
 *  - approval:   承認依頼(原価 / 見積 / 請求 / 残業 / 工具 / 経費)
 *  - qualification: 資格期限関連
 *  - incident:   ヒヤリハット / 安全インシデント
 *  - project:    案件ステータス変更
 *  - system:     システムお知らせ
 *
 * 優先度:
 *  - urgent: 即対応(資格切れ / 重大インシデント / 緊急承認)
 *  - warn:   要対応(承認待ち / 期限近い)
 *  - info:   情報通知
 */

export type NotificationCategory =
  | "report3"
  | "approval"
  | "qualification"
  | "incident"
  | "project"
  | "system";

export type NotificationPriority = "urgent" | "warn" | "info";

export type NotificationStatus = "unread" | "read";

export type NotificationRow = {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  detail: string;
  /** 関連エンティティ(任意。案件名や申請者名など) */
  related?: string;
  /** ISO 8601 / 表示用は elapsed */
  createdAt: string; // YYYY-MM-DD HH:mm
  elapsed: string; // "2 時間前"
  /** 詳細遷移先(クリック時のリンク) */
  href: string;
  /** 関連 アクション可否 */
  actionLabel?: string;
};

export const MOCK_NOTIFICATIONS: NotificationRow[] = [
  {
    id: "n1",
    category: "report3",
    priority: "info",
    status: "unread",
    title: "REPORT3 が入力されました",
    detail: "田中 一郎 さんが「仙台駅前ビル給排水改修」の本日分 REPORT3 を提出しました。",
    related: "仙台駅前ビル給排水改修",
    createdAt: "2026-05-12 17:08",
    elapsed: "12 分前",
    href: "/pc/report3/new",
    actionLabel: "REPORT3 を見る",
  },
  {
    id: "n2",
    category: "qualification",
    priority: "urgent",
    status: "unread",
    title: "資格期限切れの警告",
    detail: "高橋 健 さんの「玉掛け技能講習修了証」が 2026-05-31 で失効します。",
    related: "高橋 健 / 玉掛け技能講習",
    createdAt: "2026-05-12 16:42",
    elapsed: "38 分前",
    href: "/pc/qualifications",
    actionLabel: "資格を更新する",
  },
  {
    id: "n3",
    category: "approval",
    priority: "warn",
    status: "unread",
    title: "原価承認のリクエスト",
    detail: "「石巻市商業施設配管更新」の原価 ¥320,000 が承認待ちです。",
    related: "石巻市商業施設配管更新 / 田中 現場主任",
    createdAt: "2026-05-12 14:30",
    elapsed: "2 時間前",
    href: "/pc/approvals",
    actionLabel: "承認画面へ",
  },
  {
    id: "n4",
    category: "incident",
    priority: "urgent",
    status: "unread",
    title: "ヒヤリハット報告(重大)",
    detail: "「気仙沼漁港冷凍倉庫排水改修」現場で高所作業中の安全帯未装着が報告されました。",
    related: "気仙沼漁港冷凍倉庫排水改修",
    createdAt: "2026-05-12 13:55",
    elapsed: "3 時間前",
    href: "/pc/incidents",
    actionLabel: "詳細を確認",
  },
  {
    id: "n5",
    category: "approval",
    priority: "warn",
    status: "unread",
    title: "残業申請の承認待ち",
    detail: "鈴木 健太 さんから「泉中央マンション給湯設備」の残業 2 時間が申請されました。",
    related: "泉中央マンション給湯設備 / 鈴木 健太",
    createdAt: "2026-05-12 12:40",
    elapsed: "4 時間前",
    href: "/pc/approvals",
    actionLabel: "承認画面へ",
  },
  {
    id: "n6",
    category: "project",
    priority: "info",
    status: "unread",
    title: "案件進捗が更新されました",
    detail: "「名取市マンション改修工事」の進捗が 88% に到達しました(予定 80% 超過)。",
    related: "名取市マンション改修工事",
    createdAt: "2026-05-12 11:20",
    elapsed: "5 時間前",
    href: "/pc/projects",
    actionLabel: "案件を見る",
  },
  {
    id: "n7",
    category: "report3",
    priority: "warn",
    status: "unread",
    title: "REPORT3 未入力のアラート",
    detail: "「大和町工業団地ガス配管」の本日分 REPORT3 が 17:00 時点で未提出です。",
    related: "大和町工業団地ガス配管",
    createdAt: "2026-05-12 17:05",
    elapsed: "15 分前",
    href: "/pc/report3/new",
    actionLabel: "REPORT3 を入力",
  },
  {
    id: "n8",
    category: "approval",
    priority: "warn",
    status: "unread",
    title: "工具購入の承認リクエスト",
    detail: "高橋 リーダー から「工場排水管更新」用パイプレンチ ¥45,000 の購入申請。",
    related: "工場排水管更新 / 高橋 リーダー",
    createdAt: "2026-05-12 10:15",
    elapsed: "6 時間前",
    href: "/pc/approvals",
    actionLabel: "承認画面へ",
  },
  {
    id: "n9",
    category: "approval",
    priority: "warn",
    status: "unread",
    title: "見積承認のリクエスト",
    detail: "渡辺 営業 から「集合住宅給水設備」の見積 ¥1,250,000 が提出されました。",
    related: "集合住宅給水設備 / 渡辺 営業",
    createdAt: "2026-05-12 09:48",
    elapsed: "7 時間前",
    href: "/pc/approvals",
    actionLabel: "承認画面へ",
  },
  {
    id: "n10",
    category: "qualification",
    priority: "warn",
    status: "unread",
    title: "資格期限のアラート",
    detail: "斎藤 拓也 さんの「高所作業車運転技能講習」が 14 日以内に期限を迎えます。",
    related: "斎藤 拓也",
    createdAt: "2026-05-12 09:00",
    elapsed: "8 時間前",
    href: "/pc/qualifications",
    actionLabel: "資格一覧へ",
  },
  {
    id: "n11",
    category: "system",
    priority: "info",
    status: "unread",
    title: "システムメンテナンスのお知らせ",
    detail: "6/1(月) 22:00 〜 翌 5:00、定期メンテナンスを実施します。期間中は利用不可。",
    createdAt: "2026-05-12 08:30",
    elapsed: "8 時間前",
    href: "/pc/notices",
    actionLabel: "詳細を見る",
  },
  {
    id: "n12",
    category: "approval",
    priority: "warn",
    status: "unread",
    title: "経費精算の承認待ち",
    detail: "伊藤 事務 から「商業施設配管点検」の経費 ¥12,500 が提出されました。",
    related: "商業施設配管点検 / 伊藤 事務",
    createdAt: "2026-05-11 18:20",
    elapsed: "23 時間前",
    href: "/pc/approvals",
    actionLabel: "承認画面へ",
  },
  {
    id: "n13",
    category: "project",
    priority: "urgent",
    status: "read",
    title: "案件遅延の警告",
    detail: "「気仙沼漁港冷凍倉庫排水改修」が予定進捗 25% に対して実績 15% で遅延中。",
    related: "気仙沼漁港冷凍倉庫排水改修",
    createdAt: "2026-05-11 14:10",
    elapsed: "1 日前",
    href: "/pc/projects",
    actionLabel: "案件を見る",
  },
  {
    id: "n14",
    category: "report3",
    priority: "info",
    status: "read",
    title: "REPORT3 入力完了の確認",
    detail: "本日の REPORT3 提出が 39 / 50 件です(目標達成率 78%)。",
    createdAt: "2026-05-11 17:00",
    elapsed: "1 日前",
    href: "/pc/reports",
    actionLabel: "日報集計を見る",
  },
  {
    id: "n15",
    category: "incident",
    priority: "warn",
    status: "read",
    title: "ヒヤリハット報告(軽微)",
    detail: "「物流倉庫排水工事」現場で工具の落下が報告されました。負傷者なし。",
    related: "多賀城市物流倉庫排水工事",
    createdAt: "2026-05-11 10:45",
    elapsed: "1 日前",
    href: "/pc/incidents",
    actionLabel: "詳細を確認",
  },
  {
    id: "n16",
    category: "project",
    priority: "info",
    status: "read",
    title: "案件完了の通知",
    detail: "「古川中央クリニック給水設備」が完了しました。請求書発行を確認してください。",
    related: "古川中央クリニック給水設備",
    createdAt: "2026-05-10 16:30",
    elapsed: "2 日前",
    href: "/pc/invoices",
    actionLabel: "請求書へ",
  },
  {
    id: "n17",
    category: "system",
    priority: "info",
    status: "read",
    title: "新機能リリースのお知らせ",
    detail: "配置マップに Google マップが組み込まれました。実位置でピン表示が可能です。",
    createdAt: "2026-05-10 09:00",
    elapsed: "2 日前",
    href: "/pc/dispatch-map",
    actionLabel: "配置マップを見る",
  },
  {
    id: "n18",
    category: "approval",
    priority: "info",
    status: "read",
    title: "承認完了のお知らせ",
    detail: "あなたが申請した「車両整備費」¥18,000 が事務部により承認されました。",
    related: "車両整備費",
    createdAt: "2026-05-09 14:00",
    elapsed: "3 日前",
    href: "/pc/approvals",
    actionLabel: "履歴を見る",
  },
];

/** 優先度 → 表示メタ */
export const PRIORITY_META: Record<
  NotificationPriority,
  { label: string; pill: string; dot: string }
> = {
  urgent: {
    label: "緊急",
    pill: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  warn: {
    label: "要対応",
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  info: {
    label: "情報",
    pill: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
};

/** カテゴリ → 表示ラベル + アイコン色 */
export const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; iconColor: string; bg: string }
> = {
  report3: { label: "REPORT3", iconColor: "text-blue-600", bg: "bg-blue-50" },
  approval: { label: "承認", iconColor: "text-amber-600", bg: "bg-amber-50" },
  qualification: { label: "資格", iconColor: "text-red-600", bg: "bg-red-50" },
  incident: { label: "安全", iconColor: "text-rose-600", bg: "bg-rose-50" },
  project: { label: "案件", iconColor: "text-emerald-600", bg: "bg-emerald-50" },
  system: { label: "システム", iconColor: "text-slate-600", bg: "bg-slate-100" },
};
