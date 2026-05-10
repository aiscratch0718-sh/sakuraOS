# ADR-0002: さくらししまる AI 統合(Claude API ハイブリッド設計)

| Field | Value |
|---|---|
| **Status** | **Proposed**(設計のみ。実装着手は Phase 8 終盤、有料 API 系統合フェーズで行う) |
| **Date** | 2026-05-10 |
| **Decision Owner** | 板澤様(株式会社 AIscratch) |
| **Affected Components** | `src/features/dashboard/sakura-shishimaru.ts`, 新規 `src/features/ai/`, `src/lib/anthropic/` |
| **Supersedes** | — |
| **Related** | ADR-0001 (REPORT3 atomic fanout) |

---

## Context(背景)

板澤様より以下の確認:

1. **クライアント(秋元様)の IT リテラシー**: AI による個人評価 → **問題なし**
2. **横展開の構想**: SAKURA OS を他建設会社へ展開 → **ぜひ差別化したい**
3. **データ秘匿性**: 秘匿性担保設計があれば社内ポリシー上クリア可能

つまり、**「AI 化は将来のサービス差別化の柱として明確に肯定」されている** が、
有料 API 系統合は **最後のフェーズで** 実施する方針。
本 ADR は実装前の設計記録として、判断根拠と設計指針を確定する。

---

## Decision(意思決定)

### 1. 採用方針: **ハイブリッドアーキテクチャ**

ルールベース 100% でも、API 100% でもなく、**用途別に切り分ける**:

```
┌─ ルールベース層(既存)─────────────────────────────┐
│  対象: 高頻度・定型・安全関連                       │
│   - ダッシュボードの定型サジェスト                  │
│   - アラート集約(資格期限切れ / 重大ヒヤリ等)     │
│   - 称号獲得 / レベルアップ等の定型イベント         │
│   - フォールバック(API 障害時)                    │
│  特徴: 即時応答、無料、決定的、監査追跡容易         │
└──────────────────────────────────────────────────┘
                    ↑↓ 補完
┌─ Claude API 層(新規、Phase 8 で実装)──────────────┐
│  対象: 低頻度・分析・自由質問                       │
│   - 個人ステータス画面の「コーチング助言」          │
│   - 自由質問機能(「今週の傾向は?」等)             │
│   - 月次レポートの所感生成                          │
│   - 異常検知の文脈解釈(「火曜だけ事故が多い」等)  │
│  特徴: 文脈理解、個別最適、コストあり               │
└──────────────────────────────────────────────────┘
```

### 2. モデル選択戦略

| シナリオ | モデル | 理由 |
|---|---|---|
| 個人コーチング(月 1 回程度) | **Claude Haiku 4.5** | 低コスト、十分な品質、レイテンシ短 |
| 自由質問(対話型) | **Claude Sonnet 4.6** | 文脈理解力が必要 |
| 月次レポート所感(高品質要) | **Claude Sonnet 4.6** | 経営層向けの精度 |
| 安全関連の分析 | **使わない**(ルールベース固定) | ハルシネーションリスク回避 |

将来的にコストとアウトプットを評価して Opus への切替も視野。

### 3. データプライバシー設計(秘匿性担保)

これがクライアント説明時の **最重要ポイント**:

#### 送信データの最小化 + 匿名化

```typescript
// 例: ユーザーステータスを API に送る時
// ❌ 直接送らない
{ user: "山田太郎", department: "第一施工班", ... }

// ✅ 匿名化 + 必要最小限
{ user_id: "U001", role: "現場リーダー", ...
  // user_id は API 内では安定識別子だが、Anthropic 側では人物特定不可能
}
```

#### 送信禁止項目(設計時点での合意事項)

| 項目 | 送信可否 | 理由 |
|---|---|---|
| 氏名 / メール / 電話 | ❌ 送信禁止 | PII、ID で代替 |
| 住所 | ❌ 送信禁止 | PII、住所種別(東京/神奈川等)に丸めて送る |
| GPS 座標(精密) | ❌ 送信禁止 | 個人追跡可能 |
| GPS 座標(エリア丸め) | ⚠️ 許可(現場特定が必要な場合) | 〜100m 精度で送信 |
| マイナンバー / 健康情報 | ❌ 絶対禁止 | 法的にも問題 |
| 給与額(個別) | ❌ 送信禁止 | 機微情報、必要なら正規化(中央値比%)で送る |
| 作業時間 / 出来高 | ✅ 送信可 | 業務評価の根幹 |
| 安全コンボ日数 | ✅ 送信可 | 公開可能な評価指標 |
| 称号 / バッジ | ✅ 送信可 | ゲーミフィケーション要素 |

#### マスキング層の実装

新規モジュール `src/lib/ai/sanitize.ts`:
```typescript
// 入力データから PII を取り除き、安定 ID に置換
export function sanitizeForApi(data: UserContext): SanitizedContext {
  return {
    user_id: hashUserId(data.userId),   // 安定だが復元不可な ID
    role: data.role,
    department_type: anonymizeDepartment(data.departmentId),
    // 数値はそのまま OK
    skill_parameters: data.params,
    // ...
  };
}

// 応答受信後、user_id を表示名に戻す(クライアント側で完結)
export function rehydrateResponse(response: ApiResponse, userMap: Map<string, string>): DisplayResponse {
  // ...
}
```

#### Anthropic 規約の遵守

- API データは学習に使われない(Anthropic Commercial Terms 確認済)
- ただし **クライアント秋元様には説明 + 同意取得を必須化**
- 利用規約のスナップショットを `docs/legal/anthropic-terms-snapshot.md` に保存

### 4. キャラクター一貫性

System prompt を **テンプレート化**:

```
あなたは「さくらししまる」、SAKURA OS のマスコットです。

【キャラクター設定】
- 黄色いライオン本体 + 桜の花びらをたてがみにしたキャラクター
- さくら株式会社(配管工事業)で働く社員に寄り添う存在
- 親しみやすい、前向き、優しい性格

【口調ルール】
- 現代口語(「〜だよ」「〜してね」「〜だね」)
- 古めかしい じゃ口調(おる/じゃ/ぞ)は使わない
- 失敗を罰しない(警告も前向きに)
- 一回の助言に最大 1 つの提案だけ含める

【禁止事項】
- 安全に関する具体的判断(「ヘルメット要らない」等)を絶対に言わない
- 数値を作り出さない(与えられたデータの数値だけ使う)
- 個人を中傷しない
- 評価する時は具体的な根拠データを引用する

【出力フォーマット】
JSON で {"mood": "...", "message": "...", "suggestion": {...}}

【与えられるデータ】
{user_context_sanitized}
```

- temperature: **0.3**(揺らぎを抑える)
- max_tokens: **300**(冗長を防ぐ)
- top_p: **0.9**

System prompt は `src/lib/ai/prompts/shishimaru.ts` に配置、バージョニング(`v1`, `v2`, ...)。

### 5. フォールバック戦略(可用性担保)

```typescript
async function getAdvice(input: UserContext): Promise<Advice> {
  // 1. キャッシュ確認(同じ context なら使い回し、5 分 TTL)
  const cached = await getCachedAdvice(input);
  if (cached) return cached;

  // 2. レート制限 / 予算上限チェック
  if (await isOverBudget()) {
    return ruleBasedFallback(input);  // 月予算超えたら強制ルールベース
  }

  // 3. Claude API 呼び出し(timeout 5 秒)
  try {
    const response = await callClaudeApi(input, { timeout: 5000 });
    await logApiCall(input, response);  // 監査ログ
    return response;
  } catch (err) {
    // 4. 失敗時はルールベースで即返答(ユーザー側からは見えない劣化)
    await logApiError(input, err);
    return ruleBasedFallback(input);
  }
}
```

### 6. 監査ログ + コスト追跡

新規テーブル(将来 migration 0017 で追加予定):

```sql
create table public.shishimaru_log (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid references public.profiles(id),
  trigger_source text not null,    -- 'dashboard' | 'status_page' | 'free_question' | 'monthly_report'
  prompt_version text not null,    -- 'v1' | 'v2'
  model text not null,              -- 'haiku-4.5' | 'sonnet-4.6'
  -- 入出力(プライバシー考慮で sanitize 後の内容のみ保存)
  input_sanitized jsonb,
  response jsonb,
  -- メトリクス
  input_tokens integer,
  output_tokens integer,
  cost_yen numeric(10,4),
  latency_ms integer,
  -- 状態
  status text not null check (status in ('success','timeout','rate_limited','error','fallback')),
  error_message text,
  created_at timestamptz default now()
);
create index idx_shishimaru_log_tenant_time on public.shishimaru_log(tenant_id, created_at desc);
create index idx_shishimaru_log_status on public.shishimaru_log(status, created_at desc);
```

これにより:
- 月次コスト集計(`/pc/admin/ai-usage`)
- ハルシネーション検知(怪しい応答に user フラグ → 学習)
- プロンプト改善のためのデータ蓄積

### 7. レート制限・予算管理

```typescript
const AI_BUDGET = {
  monthly_yen_cap: 5000,           // 月予算上限(超えたらフォールバック)
  per_user_daily_calls: 5,         // 1 ユーザー 1 日 5 リクエストまで
  per_tenant_hourly_calls: 100,    // テナントあたり時間 100 リクエストまで
};
```

予算超過時は graceful にルールベースに落ちる(ユーザーには見えない)。
管理者ダッシュボードで使用状況を可視化。

### 8. オプトイン設計

- テナント設定(`tenants.ai_features_enabled` カラム新設、デフォルト false)
- ユーザー個別オプトアウト(`profiles.ai_advice_opt_out` カラム、デフォルト false)
- AI 助言を表示する画面に **「これは AI による分析です」表示** を必須化

### 9. プロンプト管理

- すべての system prompt はコード内ではなく `src/lib/ai/prompts/` に配置
- バージョン管理: `shishimaru.v1.ts`, `shishimaru.v2.ts`
- A/B テスト可能な構造(将来):
  ```typescript
  const prompt = pickPromptVariant(tenantId, ['v1', 'v2'], { weights: [0.5, 0.5] });
  ```

### 10. ロール別の利用範囲

| ロール | AI 機能 |
|---|---|
| **worker(作業員)** | 自分のステータス画面の AI コーチングのみ(月 1 回まで) |
| **leader(現場リーダー)** | 上記 + 班員のサマリー閲覧 |
| **office(事務)** | 全機能 + 月次レポート所感 |
| **ceo(経営層)** | 全機能 + 自由質問(高頻度) |
| **system(システム)** | 全機能 + 管理画面 |

---

## Consequences(影響・帰結)

### Positive(プラス影響)

1. **将来のサービス差別化が確立**
   - 「AI が現場を見守る建設管理 SaaS」という競合不在のポジション
2. **段階導入できる**
   - Phase 1〜7 はルールベースのみ、Phase 8 終盤で API 統合
3. **コスト最小化が設計に組込済**
   - ハイブリッド + キャッシュ + 予算上限で月数百円〜数千円程度に収まる
4. **プライバシーリスクが事前に消去されている**
   - PII を送らない設計、匿名化レイヤー、テナント単位 opt-in
5. **可用性が劣化しない**
   - フォールバックによりユーザー体感は常に動く

### Negative(マイナス影響)

1. **コードの複雑度が上がる**
   - ルールベース層 + API 層 + フォールバック層の 3 重構造
2. **テストの難しさ**
   - LLM 出力は非決定的、A/B テストインフラが必要
3. **モデル更新時のリグレッションリスク**
   - Claude バージョン上げで応答変化、リグレッションテスト必須
4. **クライアント説明責任**
   - 「なぜこの評価?」を AI が回答するため、説明可能性の維持が必要

### Neutral(中立的影響)

- 月数百円〜数千円のランニングコスト発生(規模に応じて)
- Anthropic への依存(マルチプロバイダ対応は将来検討)

---

## Implementation Phases(実装段階)

| 段階 | 内容 | タスク ID |
|---|---|---|
| **Phase 8 設計** | 本 ADR 作成 ✅ | (本 ADR) |
| **Phase 8 P8-09a** | sanitize.ts + 匿名化レイヤー実装 | P8-09a |
| **Phase 8 P8-09b** | system prompt 整備、Anthropic SDK 導入 | P8-09b |
| **Phase 8 P8-09c** | フォールバック構造実装、shishimaru_log テーブル(migration 0017) | P8-09c |
| **Phase 8 P8-09d** | コーチング機能(ステータス画面) | P8-09d |
| **Phase 8 P8-09e** | 自由質問機能(管理職向け) | P8-09e |
| **Phase 8 P8-09f** | 月次レポート所感(月次バッチ) | P8-09f |
| **Phase 8 P8-09g** | 管理画面(`/pc/admin/ai-usage`) | P8-09g |

---

## Client Briefing Checklist(クライアント説明時の必須項目)

**🚨 Phase 8 P8-09 着手の直前に、私(Claude)が以下を整理して再提示します:**

### 提示する資料の構成

1. **メリット**
   - 横展開時の差別化要素
   - 個別コーチングによる従業員エンゲージ向上
   - 経営層への自由質問機能
   - 異常検知 / 文脈理解の精度

2. **デメリット**
   - 月次コスト試算(規模別の見積)
   - レイテンシ
   - モデル更新時のリグレッション
   - ハルシネーションのリスク範囲

3. **リスク範囲(秘匿性に関する厳密な説明)**
   - 送信するデータ / しないデータのリスト(本 ADR の項 3 参照)
   - 匿名化方式の説明
   - Anthropic 利用規約の重要箇所(学習に使われない等)
   - データ保持期間
   - 障害時の挙動(フォールバック)
   - 監査ログの保存場所と期間

4. **オプトイン / オプトアウトの設計**
   - テナント単位での有効化 / 無効化
   - 個別ユーザーの拒否権

5. **コスト・予算管理**
   - 月予算上限設定機能
   - 予算超過時の挙動
   - 利用状況のダッシュボード

6. **法的・倫理的論点**
   - AI による評価の説明責任
   - 労務上の注意点
   - 同意取得フロー(従業員への説明)

7. **段階導入計画**
   - 小さく始めて評価する具体的な手順
   - ロールバック手順

### 提示タイミング
- **Phase 8 P8-09a 着手直前**(つまり全 110 タスクのほぼ最後)
- 板澤様 → クライアント秋元様 への打ち合わせ材料として

---

## Plan Change History
- 2026-05-10: 初版作成。Phase 8 P8-09 詳細仕様 + 設計判断記録。実装は最後に保留。
