# ADR-0001: REPORT3 Atomic Fanout

## Status

**Accepted** — 2026-04-28

## Context

SAKURA OS の中核コンセプト「**入力1回主義**」を成立させるためには、REPORT3
の保存処理が次の **5系統** を**全て成功するか、全て rollback するか**の二択で
完了する必要がある。

5系統:

1. `report3_entries` への新規行挿入(行明細)
2. `user_career_totals` の累計時間更新(工種別)
3. `project_cost_aggregates` の現場原価再計算
4. `gamification_events` の XP / SC イベント発行
5. `audit_log` の監査エントリ記録

部分コミットは絶対に許容できない。例えば「キャリア累計だけ更新されたが原価が
更新されていない」状態は、社長ダッシュボードと作業員のキャリアシートに **一貫
性のない数字** を表示し、本製品の核となる信頼性を破壊する。

加えて:

- ネットワーク切断時の再送(`idempotency_key` による重複防止)
- ゲーミフィの「ランクアップ通知」がコミット失敗時に表示されてしまうと、
  作業員に「+10XP 獲得しました」と言ったのに記録されていない事態が発生する

## Decision

**Postgres の単一トランザクション + Server Action 内で5系統すべてを実行する。**
通知の発火はトランザクション **コミット後** にのみ行う。

### 実装パターン

```typescript
// src/features/report3/actions/submit.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { domainEvents } from "@/server/lib/events";
import { Report3InputSchema, type Report3Result } from "../schemas";

export async function submitReport3(
  _prev: Report3Result,
  formData: FormData,
): Promise<Report3Result> {
  const session = await auth();
  if (!session) return { ok: false, formError: "サインインが必要です" };

  const parsed = Report3InputSchema.safeParse({
    projectId: formData.get("projectId"),
    rows: JSON.parse(formData.get("rows") as string),
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // === atomic fanout — all 5 streams in ONE transaction ===
  const result = await db.$transaction(async (tx) => {
    // (0) Idempotency check — short-circuit if duplicate
    const existing = await tx.report3IdempotencyLog.findUnique({
      where: { idempotencyKey: parsed.data.idempotencyKey },
    });
    if (existing) return { reportId: existing.reportId, deduped: true };

    // (1) report3_entries — insert the report and its rows
    const report = await tx.report3Entry.create({
      data: {
        userId: session.userId,
        projectId: parsed.data.projectId,
        submittedAt: new Date(),
        rows: { create: parsed.data.rows },
        requiresLeaderApproval: parsed.data.totalHours > 8,
      },
    });

    // (2) user_career_totals — increment per (大分類, 中分類, 小分類)
    for (const row of parsed.data.rows) {
      await tx.userCareerTotal.upsert({
        where: {
          userId_l1_l2_l3: {
            userId: session.userId,
            l1: row.l1,
            l2: row.l2,
            l3: row.l3,
          },
        },
        update: { totalHours: { increment: row.hours } },
        create: { userId: session.userId, ...row, totalHours: row.hours },
      });
    }

    // (3) project_cost_aggregates — recalc per project
    const totalHoursForProject = parsed.data.rows.reduce((s, r) => s + r.hours, 0);
    const userRate = await tx.userPayRate.findUnique({
      where: { userId: session.userId },
    });
    await tx.projectCostAggregate.upsert({
      where: { projectId: parsed.data.projectId },
      update: {
        laborCostCents: {
          increment: Math.round(totalHoursForProject * (userRate?.hourlyCents ?? 0)),
        },
        laborHours: { increment: totalHoursForProject },
      },
      create: { /* ... */ },
    });

    // (4) gamification_events — XP / SC
    const xp = 10 + (parsed.data.rows.length > 1 ? 5 : 0); // +5 for variety
    const sc = 5;
    await tx.gamificationEvent.create({
      data: {
        userId: session.userId,
        kind: "report3.submitted",
        xpDelta: xp,
        scDelta: sc,
        sourceReportId: report.id,
      },
    });

    // (5) audit_log — same transaction
    await tx.auditLog.create({
      data: {
        actorId: session.userId,
        action: "report3.submitted",
        targetType: "report3_entry",
        targetId: report.id,
        diff: { rows: parsed.data.rows },
      },
    });

    // (0b) Record the idempotency key
    await tx.report3IdempotencyLog.create({
      data: {
        idempotencyKey: parsed.data.idempotencyKey,
        reportId: report.id,
      },
    });

    return { reportId: report.id, deduped: false, xp, sc };
  });

  // === post-commit-only side effects ===
  // (these run ONLY if the transaction committed)
  domainEvents.emit("report3.submitted", {
    userId: session.userId,
    reportId: result.reportId,
    xp: result.xp ?? 0,
    sc: result.sc ?? 0,
  });

  revalidatePath("/sp/home");
  revalidatePath(`/pc/projects/${parsed.data.projectId}/cost`);

  return { ok: true, xp: result.xp ?? 0, sc: result.sc ?? 0 };
}
```

### Key Design Choices

1. **Postgres native transaction(`db.$transaction(async (tx) => {})` Prisma)**
   — Outbox pattern や Saga は採用しない。5系統すべて同じ Postgres インスタンス
   内のテーブルなので、ローカル ACID で十分。
2. **Idempotency key はトランザクション内で記録** — コミット失敗時にキーも
   ロールバックされ、リトライが正常に動く。
3. **通知 / revalidate はコミット後のみ** — トランザクションのスコープ外。
   ししまるナビの「ランクアップ通知」が空振りすることはない。
4. **`domainEvents.emit("report3.submitted", ...)`** — `notifications` システムが
   この event を購読し、LINE WORKS 通知を別途キューイングする。通知配信失敗で
   REPORT3 の保存が失敗することはない(逆方向の依存禁止)。
5. **`revalidatePath`** — Next.js App Router の RSC キャッシュを更新。社長
   ダッシュボードと作業員のホームが次回読み込みで最新化される。

### What's Inside the Transaction vs Outside

| Operation | Inside | Outside (post-commit) |
|-----------|--------|------------------------|
| `report3_entries` 行追加 | ✅ | |
| `user_career_totals` 更新 | ✅ | |
| `project_cost_aggregates` 更新 | ✅ | |
| `gamification_events` 発行 | ✅ | |
| `audit_log` 記録 | ✅ | |
| `idempotency_log` 記録 | ✅ | |
| LINE WORKS 通知送信 | | ✅ (event subscriber) |
| ししまるナビトースト表示 | | ✅ (Server Action return → Client) |
| `revalidatePath` | | ✅ |
| Money Forward への転送(月次集計) | | ✅ (別の cron / batch) |

### Failure Modes

| Failure | Behavior |
|---------|----------|
| (1)〜(5) のいずれかの DB エラー | `db.$transaction` 全体が rollback。Server Action は `{ ok: false, formError: "保存に失敗しました" }` を返す。クライアントはローカル下書きを保持して再試行可能。 |
| トランザクションコミット **直後** に LINE WORKS 通知が失敗 | REPORT3 の保存は成功状態。通知の再試行は notifications システムの責務(指数バックオフ、デッドレターキュー)。 |
| 同じ `idempotency_key` での再送 | (0) のチェックでヒット → 既存の `reportId` を返す。重複適用なし。 |
| トランザクション内でロック競合(同じ `project_cost_aggregates` 行を別ユーザーが同時更新) | Postgres のシリアライザブル分離で 1 つは serialization failure → 自動リトライ(`@retry-on-serialization-failure` ライブラリ or 手動) |

## Consequences

### Positive

- **データ一貫性が構造で保証される** — 「ゲージは進んだのに原価が反映されていない」事態が発生不能
- **再送が安全** — `idempotency_key` で確実に重複防止
- **Outbox / Saga の運用負荷ゼロ** — メッセージブローカー不要、デバッグ容易
- **監査ログが同一トランザクション** — 「コミット成功したのに監査ログが無い」がない
- **テストが書きやすい** — トランザクション 1 つのテストで 5 系統を一括検証

### Negative

- **トランザクションが長くなり得る** — 各テーブルがロックされる時間が伸びる。
  特に `project_cost_aggregates` への upsert は同一プロジェクトの REPORT3
  並行送信でロック競合が発生し得る。**Mitigation**: 各 REPORT3 は p95 で 50ms 以内にコミットする目標。並行送信は serialization failure を再試行で吸収。
- **5系統すべてが Postgres に乗っている前提** — 将来 `gamification_events` を
  別 DB(専用 ranking DB 等)に移したくなった場合、Outbox pattern への移行が
  必要。**Mitigation**: それが必要になったら別 ADR を起票して再設計する(YAGNI)。
- **Prisma の `$transaction` は interactive transaction で性能オーバーヘッドあり** — 1 つのリクエスト内で 6〜7 ラウンドトリップ。SQL 直書きの方が速いが、可読性とのトレードオフ。**Mitigation**: ベンチマーク後、ホットパスのみ raw SQL で書き直す余地を残す。

### Neutral / Notes

- 5系統がすべて同じ Postgres にあるという前提は、Supabase 単一インスタンス前提と整合する。
- `domainEvents.emit` の実装は **同一プロセス内のシンプルな event emitter** で十分(現フェーズ)。将来 microservice 化したら NATS / Redis Streams に置き換える余地あり。
- 5系統のうち (3) `project_cost_aggregates` のみが「再計算」(他は INSERT または increment-only)。これは upsert + increment で実装する。

## ADR Dependencies

- なし(これは MVP の最初の ADR)

## Framework Compatibility

- **Next.js**: Server Actions 必須。Pages Router の API ルートでも実装可だが、
  App Router + Server Actions の方が progressive enhancement と型推論で優位。
- **Prisma**: `db.$transaction(async (tx) => {})` の interactive transaction を使用。
  **TypeORM / Drizzle** に変更する場合、本 ADR を再評価。
- **Supabase**: Postgres は Supabase 提供。RLS は本トランザクション内で正しく
  動作する(`session.userId` を使ったポリシーが `tx` クライアントにも適用される)。
- **想定 Next.js 版**: 15.x(最新安定版)以降を前提。13 系は `revalidatePath` の挙動が異なるため対象外。

## PRD Requirements Addressed

- `TR-RPT-010`: 5系統 atomic fanout → 本 ADR の core
- `TR-RPT-011`: 失敗時の rollback → 本 ADR の Failure Modes
- `TR-RPT-012`: idempotency key → 本 ADR の (0) (0b)
- `TR-RPT-013`: 通知はコミット後のみ → 本 ADR の post-commit side effects

## Implementation Guidelines (programmer 向けの抜粋)

- **必須**: `submitReport3` Server Action は単一の `db.$transaction` 内で 5系統すべてを実行
- **必須**: `domainEvents.emit` は `db.$transaction` の **外側** で呼ぶ
- **必須**: `idempotency_key` のチェックは transaction の最初で行う
- **必須**: テストは 5系統すべてが rollback するシナリオを E2E で検証
- **禁止**: REPORT3 保存の途中で外部 API(Money Forward, LINE WORKS, Google Maps)を直接叩かない — すべて domain event 経由で非同期化
- **禁止**: Server Action の中で `setTimeout` / `setInterval` を使った遅延処理 — 必要なら queue へ

## Validation

- [x] PRD `design/prd/REPORT3.md` の TR-RPT-010〜013 と整合
- [ ] `/architecture-review` で他 ADR との整合確認(本 ADR が初なので n/a)
- [ ] PoC として 5系統すべての rollback テストを実装(MVP 開発の最初のスプリント)
- [ ] パフォーマンスベンチ(p95 ≤ 50ms / トランザクションコミット時間)を CI に組み込む
