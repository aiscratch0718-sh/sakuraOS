# Systems Index: SAKURA OS

> **Status**: Approved (initial decomposition based on architecture v7 + design v2.1)
> **Created**: 2026-04-28
> **Source Concept**: `design/prd/product-concept.md`

---

## Overview

SAKURA OS は「**入力1回主義**」を核とした建設業(配管工事)向け業務管理 SaaS。
本ドキュメントは図示されたアーキテクチャを 6 つのカテゴリ × 約 20 システムに
分解し、依存関係と設計順序を定める。

設計の核は **REPORT3** — 中央のドメインエンティティで、5系統のデータ派生
(ゲーミフィ・原価・概況・通知・累計)を atomic transaction で実行する。
他のすべてのシステムは REPORT3 の入出力境界で接続される。

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | PRD | Depends On |
|---|-------------|----------|----------|--------|-----|------------|
| 1 | Auth (2FA + Role-based) | Foundation | MVP | Approved (派生) | TBD | — |
| 2 | Org & Users (組織・ユーザー・部署) | Foundation | MVP | Not Started | — | Auth |
| 3 | Audit Log (操作ログ) | Foundation | MVP | Not Started | — | Auth |
| 4 | Multi-tenancy scaffolding | Foundation | MVP | Not Started | — | Auth, Org |
| 5 | **REPORT3 (3階層作業日報)** | Domain Core | MVP | **Approved** | `design/prd/REPORT3.md` | Auth, Project, User, Work-classification master |
| 6 | Work Classification Master (大/中/小分類) | Domain Core | MVP | Not Started | — | — |
| 7 | Project (工事案件マスタ) | Domain Core | MVP | Not Started | — | Customer |
| 8 | Customer (顧客マスタ) | Domain Core | MVP | Not Started | — | — |
| 9 | Schedule (人/案件/車両配置) | Domain Core | Beta | Not Started | — | Project, User, Vehicle |
| 10 | GPS Attendance (出退勤・GPS打刻) | Workflow | MVP | Not Started | — | Auth, User |
| 11 | Notification Dispatcher (LINE WORKS 連携含む) | Workflow | MVP | Not Started | — | Auth, REPORT3 |
| 12 | Gamification (XP / Rank / Badge / Quest / SC) | Workflow | MVP | Not Started | — | REPORT3, User |
| 13 | ししまるナビ (画面案内・通知表示) | Workflow | MVP | Not Started | — | Gamification |
| 14 | Estimate / Invoice / Payment (見積/請求/入金) | Workflow | Beta (第3段階) | Not Started | — | Project, Customer |
| 15 | Vehicle Management (車両運行 + GPS + アルコール) | Workflow | Beta (第3段階) | Not Started | — | User, Schedule, Google Maps |
| 16 | Tool QR Management (電動工具 QR + GPS) | Workflow | Beta (第3段階) | Not Started | — | User, Google Maps |
| 17 | Construction Overview (工事概況表) | Reporting | Beta (第3段階) | Not Started | — | Project, REPORT3, Estimate, Invoice |
| 18 | Per-site Cost Management (現場別原価管理) | Reporting | Beta (第3段階) | Not Started | — | REPORT3, Construction Overview |
| 19 | Customer Sales Report (客先別売上) | Reporting | GA (第5段階) | Not Started | — | Customer, Construction Overview |
| 20 | Drawing & Document Storage (図面・書類) | Reporting | Beta | Not Started | — | Project, Supabase Storage |
| 21 | Department Meeting Folders (部署別会議フォルダ) | Reporting | GA (第5段階) | Not Started | — | Org, Drawing & Document Storage |
| 22 | Money Forward Integration (会計/請求/給与) | Integrations | GA (第5段階) | Not Started | — | Estimate / Invoice, Attendance |
| 23 | Google Maps Integration | Integrations | Beta | Not Started | — | Vehicle, Tool QR |
| 24 | LINE WORKS Integration | Integrations | MVP | Not Started | — | Notification Dispatcher |
| 25 | Cloud Sign Integration (電子契約) | Integrations | GA | Not Started | — | Estimate / Invoice |
| 26 | (Future) Claude AI for ししまる | ML / LLM | Post-GA | Not Started | — | ししまるナビ, Gamification |

---

## Categories

| Category | Description | Systems |
|----------|-------------|---------|
| **Foundation** | 全システム横断の基盤 | Auth, Org & Users, Audit Log, Multi-tenancy scaffolding |
| **Domain Core** | 主要ドメインエンティティと状態 | REPORT3, Work Classification, Project, Customer, Schedule |
| **Workflow** | ユーザー向けの主要フロー | GPS Attendance, Notification, Gamification, ししまるナビ, Estimate/Invoice, Vehicle, Tool QR |
| **Reporting** | 集計・レポート系 | Construction Overview, Per-site Cost, Customer Sales, Drawing/Doc, Meeting Folders |
| **Integrations** | 外部 SaaS 連携(変更しない) | Money Forward, Google Maps, LINE WORKS, Cloud Sign |
| **ML / LLM** | AI を伴うフィーチャ | (Future) Claude AI for ししまる |

---

## Priority Tiers

| Tier | Definition | Target Phase | Design Urgency |
|------|------------|--------------|----------------|
| **MVP (第1〜2段階)** | これが動かないと製品の核が回らない | リリース1 | Design FIRST |
| **Beta (第3段階)** | 全社運用に必要だが、MVP の上に積める | リリース2 | Design SECOND |
| **GA (第4〜6段階)** | 仕上げ・拡張・経理連携 | リリース3+ | Design THIRD |
| **Post-GA / Future** | データ蓄積後に検討 | 未確定 | Design AFTER GA |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. **Auth** — 2FA + role-based、OFF 不可
2. **Multi-tenancy scaffolding** — `tenant_id` 列の前提パターン
3. **Audit Log** — 操作ログ、削除不可
4. **Notification Dispatcher** — domain event を購読する単一 fan-out 層

### Domain Core Layer (depends on Foundation)

1. **Org & Users** — depends on: Auth
2. **Customer** — depends on: Org & Users
3. **Project** — depends on: Customer, Org & Users
4. **Work Classification Master** — depends on: (none — pure 参照マスタ)
5. **Vehicle (master only)** — depends on: Org & Users
6. **Schedule** — depends on: Project, User, Vehicle

### Workflow Layer (depends on Domain Core)

1. **REPORT3** ⭐ — depends on: Auth, Project, Schedule, Work Classification, User
2. **GPS Attendance** — depends on: Auth, User
3. **Gamification** — depends on: REPORT3, User
4. **ししまるナビ** — depends on: Gamification, Notification Dispatcher
5. **Estimate / Invoice / Payment** — depends on: Project, Customer
6. **Vehicle Management** — depends on: Vehicle master, Schedule, GPS, Google Maps
7. **Tool QR Management** — depends on: User, Google Maps
8. **Drawing & Document Storage** — depends on: Project

### Reporting Layer (depends on Workflow)

1. **Construction Overview (工事概況表)** — depends on: Project, Estimate / Invoice, REPORT3 → cost
2. **Per-site Cost Management** — depends on: REPORT3, Project, (manual material/外注 input)
3. **Customer Sales Report** — depends on: Construction Overview, Customer
4. **Department Meeting Folders** — depends on: Org & Users, Drawing & Document Storage

### Integrations Layer (peripheral, depends on Workflow / Reporting)

1. **Money Forward** — Estimate / Invoice / Attendance → 会計仕訳・請求書・給与
2. **Google Maps** — Vehicle / Tool QR → 位置情報表示・ルート
3. **LINE WORKS** — Notification Dispatcher → 通知配信
4. **Cloud Sign** — Estimate / Invoice → 電子契約

### Future Layer

1. **Claude AI for ししまる** — depends on: 全 Workflow / Reporting データの蓄積

---

## Recommended Design Order

| Order | System | Tier | Layer | Primary Agent | Effort |
|-------|--------|------|-------|---------------|--------|
| 1 | Auth + Multi-tenancy + Audit Log | MVP | Foundation | systems-analyst | M |
| 2 | Org & Users | MVP | Foundation / Core | product-manager | S |
| 3 | Customer | MVP | Core | product-manager | S |
| 4 | Project | MVP | Core | product-manager | M |
| 5 | Work Classification Master | MVP | Core | systems-analyst | S |
| 6 | **REPORT3** ⭐ | MVP | Workflow (linchpin) | product-manager + systems-analyst | L |
| 7 | GPS Attendance | MVP | Workflow | product-manager | S |
| 8 | Gamification (基本のみ — XP / Rank / SC) | MVP | Workflow | product-manager + business-analyst (SC 税務) | M |
| 9 | Notification Dispatcher (LINE WORKS) | MVP | Workflow | product-manager + api-engineer | M |
| 10 | ししまるナビ(基本案内) | MVP | Workflow | interaction-designer + content-writer | M |
| --- MVP cut --- |
| 11 | Schedule | Beta | Core | product-manager | M |
| 12 | Estimate / Invoice / Payment | Beta | Workflow | product-manager + business-analyst | L |
| 13 | Vehicle + Alcohol Check | Beta | Workflow | product-manager + security-engineer (法令) | M |
| 14 | Tool QR Management | Beta | Workflow | product-manager | M |
| 15 | Construction Overview | Beta | Reporting | systems-analyst + screen-designer | L |
| 16 | Per-site Cost Management | Beta | Reporting | systems-analyst + screen-designer | M |

(GA 以降は Beta 完了後に詳細化)

---

## Circular Dependencies

- **None found**. アーキテクチャは綺麗な依存階層になっている(REPORT3 が中心ハブだが、上方向の依存のみ)。

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| **REPORT3** | Technical | atomic fanout の失敗時挙動(部分コミット禁止)を確実に実装 | ADR-0001 で transaction 設計を確定 / E2E テストで rollback 検証 |
| **GPS Attendance / Vehicle GPS** | Privacy + Battery | 作業員の位置情報常時送信 → プライバシー懸念 + 電池消費 | 業務時間内のみ取得(明示同意ベース)/ バックグラウンド送信間隔を調整可能に |
| **Money Forward Integration** | External dependency | API 仕様変更 / 一時障害で会計連携停止 | リトライ + デッドレター + 月次手動同期パスを残す |
| **Alcohol Check 1年保管** | Compliance | 法令違反は事業停止リスク | 構造で削除不可・エクスポート可能を強制 |
| **SC ギフト券の税務処理** | Compliance | 税務上3パターンの誤分類 | 税理士確認 → 業務分析者(business-analyst)で運用方針を固める前にローンチしない |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 26 |
| PRDs started | 1 (REPORT3 — 本セッションで作成) |
| PRDs reviewed | 0 |
| PRDs approved | 0 |
| MVP systems designed | 1 / 10 |

---

## Next Steps

- [x] このシステム索引を承認
- [ ] MVP 第1優先(Auth + Multi-tenancy + Audit Log)から PRD 作成 → `/design-system auth`
- [x] **REPORT3 PRD は本セッションで先行作成**(中核仕様の早期確定)
- [ ] 各 PRD 完成後に `/design-review`
- [ ] MVP 全 PRD 完了後に `/review-all-prds` で横断チェック
- [ ] `/gate-check pre-production` で MVP の Pre-Production gate 通過確認
- [ ] (将来) MVP 完了後に Beta 段階の PRD を順次設計
