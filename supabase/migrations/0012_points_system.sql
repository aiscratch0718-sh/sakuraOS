-- =========================================
-- 0012_points_system.sql
-- ポイント管理システム(ゲーミフィケーション基盤)
--
-- 設計方針(2026-05-10 ベストプラクティス):
--   1. 実業務 KPI と連動(架空ポイントではなく安全/出来高/期限遵守等の実数値ベース)
--   2. チーム達成も評価対象(class_team_points は将来拡張余地)
--   3. Recognition 中心(報酬は補助、表彰系もここで管理)
--   4. 進捗(自分比較)を主、順位を従
--   5. opt-out 機能(profiles.gamification_opt_out)で表示拒否可能
--   6. 失敗を罰しない(adjust 可能、negative 残高は不可)
--
-- テーブル:
--   - points_balances    (集計済み残高、append-only ledger と整合)
--   - points_ledger      (全トランザクション。append-only)
--   - point_rules        (獲得ルール定義、管理者編集可)
--   - rewards            (報酬カタログ、管理者編集可)
--   - exchange_requests  (報酬交換申請 → 承認/却下/履行ワークフロー)
-- =========================================

-- profiles に opt-out 列を追加(本人がランキング表示を拒否できる)
alter table public.profiles
  add column if not exists gamification_opt_out boolean not null default false;

-- =========================================
-- points_balances: 残高(集計済み、ledger と整合)
-- =========================================
create table public.points_balances (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  tenant_id      uuid not null references public.tenants(id),
  balance        integer not null default 0 check (balance >= 0),
  total_earned   integer not null default 0 check (total_earned >= 0),
  total_spent    integer not null default 0 check (total_spent >= 0),
  updated_at     timestamptz not null default now()
);

create index idx_points_balances_tenant on public.points_balances(tenant_id);

-- =========================================
-- points_ledger: トランザクション履歴(append-only)
-- =========================================
create type point_txn_type as enum ('earn', 'spend', 'bonus', 'adjust', 'refund');

create table public.points_ledger (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references public.tenants(id),
  user_id          uuid not null references public.profiles(id),
  type             point_txn_type not null,
  amount           integer not null,            -- earn/bonus/refund: positive, spend: negative, adjust: any
  balance_after    integer not null check (balance_after >= 0),
  reason           text not null,
  category         text,                         -- '出来高'|'安全'|'称号'|'日報'|'リーダー'|'KY活動'|'交換'|'手動'
  source_table     text,                         -- 'report3_entries'|'titles_granted'|'exchange_requests' etc
  source_id        uuid,
  approved_by      uuid references public.profiles(id),
  created_at       timestamptz not null default now()
);

create index idx_points_ledger_user_created on public.points_ledger(user_id, created_at desc);
create index idx_points_ledger_tenant_created on public.points_ledger(tenant_id, created_at desc);
create index idx_points_ledger_category on public.points_ledger(tenant_id, category);

-- =========================================
-- point_rules: 獲得ルール定義
-- =========================================
create table public.point_rules (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references public.tenants(id),
  category         text not null,                -- '出来高'|'安全'|'称号'|'日報'|'リーダー'|'KY活動'
  display_name     text not null,                -- 「出来高達成ボーナス」
  description      text not null,
  amount_per_unit  integer not null,             -- 10 (= 10pt/㎡)
  unit             text not null,                -- '㎡'|'日'|'回'|'月'|'20日'
  monthly_cap      integer,                      -- 月上限。null = 上限なし
  is_active        boolean not null default true,
  display_order    integer not null default 0,
  updated_by       uuid references public.profiles(id),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, category)
);

create index idx_point_rules_tenant_active on public.point_rules(tenant_id, is_active);

-- =========================================
-- rewards: 報酬カタログ
-- =========================================
create table public.rewards (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references public.tenants(id),
  name             text not null,                -- 「カフェギフトカード 500円」
  icon             text,                         -- 絵文字 '☕'
  cost_points      integer not null check (cost_points > 0),
  description      text,
  is_rare          boolean not null default false,
  is_active        boolean not null default true,
  display_order    integer not null default 0,
  total_redeemed   integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_rewards_tenant_active on public.rewards(tenant_id, is_active, display_order);

-- =========================================
-- exchange_requests: 交換申請 + 承認ワークフロー
-- =========================================
create type exchange_status as enum ('pending', 'approved', 'rejected', 'fulfilled', 'cancelled');

create table public.exchange_requests (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references public.tenants(id),
  user_id           uuid not null references public.profiles(id),
  reward_id         uuid not null references public.rewards(id),
  cost_points       integer not null check (cost_points > 0),
  status            exchange_status not null default 'pending',
  approved_by       uuid references public.profiles(id),
  approved_at       timestamptz,
  rejected_at       timestamptz,
  rejection_reason  text,
  fulfilled_at      timestamptz,
  ledger_id         uuid references public.points_ledger(id),  -- 承認時に作成される spend ledger
  created_at        timestamptz not null default now()
);

create index idx_exchange_requests_user on public.exchange_requests(user_id, created_at desc);
create index idx_exchange_requests_tenant_status on public.exchange_requests(tenant_id, status, created_at desc);

-- =========================================
-- updated_at triggers
-- =========================================
create trigger points_balances_updated_at
  before update on public.points_balances
  for each row execute function public.tg_set_updated_at();

create trigger point_rules_updated_at
  before update on public.point_rules
  for each row execute function public.tg_set_updated_at();

create trigger rewards_updated_at
  before update on public.rewards
  for each row execute function public.tg_set_updated_at();

-- =========================================
-- RLS
-- =========================================
alter table public.points_balances    enable row level security;
alter table public.points_ledger      enable row level security;
alter table public.point_rules        enable row level security;
alter table public.rewards            enable row level security;
alter table public.exchange_requests  enable row level security;

-- points_balances: 同テナントは閲覧可、書込みは server-side(security definer 関数経由)のみ
create policy "tenant members can read balances"
  on public.points_balances for select
  using (tenant_id = public.user_tenant_id());

-- points_ledger: 同テナントは閲覧可、insert は server-side のみ
create policy "tenant members can read ledger"
  on public.points_ledger for select
  using (tenant_id = public.user_tenant_id());

-- point_rules: 全員閲覧可、編集は office+ のみ
create policy "tenant members can read point_rules"
  on public.point_rules for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can manage point_rules"
  on public.point_rules for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id());

-- rewards: 全員閲覧可、編集は office+ のみ
create policy "tenant members can read rewards"
  on public.rewards for select
  using (tenant_id = public.user_tenant_id() and is_active = true);

create policy "office and ceo can manage rewards"
  on public.rewards for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id());

-- exchange_requests: 自分の申請は閲覧可、テナント全体は office+ が閲覧可
create policy "users can read own exchange requests"
  on public.exchange_requests for select
  using (user_id = auth.uid());

create policy "office and ceo can read all exchange requests in tenant"
  on public.exchange_requests for select
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

create policy "users can create own exchange requests"
  on public.exchange_requests for insert
  with check (user_id = auth.uid() and tenant_id = public.user_tenant_id());

create policy "users can cancel own pending exchange requests"
  on public.exchange_requests for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status in ('pending', 'cancelled'));

create policy "office and ceo can update exchange requests"
  on public.exchange_requests for update
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id());

-- =========================================
-- 残高更新を保証する関数(server actions から呼ぶ)
-- 1 トランザクション内で ledger insert + balance upsert を実行
-- =========================================
create or replace function public.award_points(
  p_user_id      uuid,
  p_amount       integer,
  p_type         point_txn_type,
  p_reason       text,
  p_category     text default null,
  p_source_table text default null,
  p_source_id    uuid default null,
  p_approved_by  uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id      uuid;
  v_current_balance integer;
  v_new_balance    integer;
  v_ledger_id      uuid;
begin
  -- 対象ユーザーのテナントを取得
  select tenant_id into v_tenant_id from public.profiles where id = p_user_id;
  if v_tenant_id is null then
    raise exception 'user not found: %', p_user_id;
  end if;

  -- 現残高をロック付き取得(同時更新時の競合回避)
  select balance into v_current_balance
    from public.points_balances
    where user_id = p_user_id
    for update;

  if v_current_balance is null then
    -- 初回 → 新規作成
    v_current_balance := 0;
    insert into public.points_balances (user_id, tenant_id, balance, total_earned, total_spent)
      values (p_user_id, v_tenant_id, 0, 0, 0);
  end if;

  v_new_balance := v_current_balance + p_amount;
  if v_new_balance < 0 then
    raise exception 'insufficient points: balance=%, attempt=%', v_current_balance, p_amount;
  end if;

  -- ledger に append
  insert into public.points_ledger
    (tenant_id, user_id, type, amount, balance_after, reason, category, source_table, source_id, approved_by)
  values
    (v_tenant_id, p_user_id, p_type, p_amount, v_new_balance, p_reason, p_category, p_source_table, p_source_id, p_approved_by)
  returning id into v_ledger_id;

  -- balances 更新
  update public.points_balances
    set balance = v_new_balance,
        total_earned = total_earned + greatest(p_amount, 0),
        total_spent = total_spent + greatest(-p_amount, 0)
    where user_id = p_user_id;

  return v_ledger_id;
end;
$$;

grant execute on function public.award_points to authenticated;

-- =========================================
-- comments
-- =========================================
comment on table public.points_balances is '集計済みポイント残高。points_ledger と整合性を保つ。';
comment on table public.points_ledger is 'ポイント増減の全履歴。append-only。';
comment on table public.point_rules is 'ポイント獲得ルール定義。管理者が編集可能。';
comment on table public.rewards is '報酬カタログ。管理者が追加・編集可能。';
comment on table public.exchange_requests is '報酬交換申請。pending → approved/rejected → fulfilled のワークフロー。';
comment on function public.award_points is 'ポイント付与/消費を 1 トランザクションで実行。balance + ledger を整合的に更新。';
