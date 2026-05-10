/**
 * blocks/ — 業務ドメイン共通の構成ブロック(複数機能で再利用される複合コンポーネント)
 *
 * 各サブディレクトリの barrel export を集約。
 *
 * 命名規則:
 * - 単純な UI primitive(Tag/KpiCard 等)→ `components/ui/`
 * - 業務的構成ブロック(Stepper, LineItemTable 等)→ `components/blocks/`
 * - 機能特化(SkillRadarChart 等)→ `components/feature/`
 */
export { Stepper, StepFooter } from "./stepper";
export { LineItemTable } from "./line-item-table";
export type { LineItem, LineItemTableProps } from "./line-item-table";
export { PhotoGrid } from "./photo-grid";
export { DocumentPreview } from "./document-preview";
export { SiteInfoPanel } from "./site-info-panel";
export { QuickTips } from "./quick-tips";
