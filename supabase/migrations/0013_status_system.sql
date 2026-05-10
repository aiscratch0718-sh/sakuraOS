-- =========================================
-- 0013_status_system.sql
-- パワプロ風ステータス画面 — 称号 / スキル / 特殊能力
--
-- 出典: docs/rebuild/MASTER-PLAN.md Phase 3-B-01
--
-- 設計方針:
--   1. 称号 / 特殊能力は tenant ごとに独立(SaaS 化を想定し tenant_id を必須に)
--   2. titles_granted / user_abilities は append-only (取り消しは別マイグレーションで導入予定)
--   3. skill_parameters は集計テーブル。書き込みは server-side の
--      security definer 関数 (recalculate_skill_parameters) 経由のみ。
--      RLS policy は SELECT のみ提供し、UPDATE/INSERT は authenticated に開放しない。
--   4. rarity は title / ability で再利用可能な共通 enum (rarity_tier) に統一。
--      title は 4段階 (bronze..platinum)、ability は MASTER-PLAN 上 3段階だが
--      将来 platinum を追加する余地を残すため共通 enum を採用。
--   5. updated_at trigger はマスタテーブル (title_definitions / special_abilities) のみ。
--      titles_granted / user_abilities は append-only、skill_parameters は
--      recalculated_at を関数内で明示更新するため不要。
--
-- 既存依存:
--   - public.tenants / public.profiles
--   - public.user_tenant_id() / public.user_role()
--   - public.tg_set_updated_at()
--   - (将来参照) public.report3_entries / public.incident_reports / public.user_qualifications
-- =========================================

-- =========================================
-- Enums
-- =========================================
-- title と special_ability で共有する稀少度。
-- ability で platinum を使わないケースは アプリ側 / シード で制御する。
create type rarity_tier as enum ('bronze', 'silver', 'gold', 'platinum');

-- =========================================
-- title_definitions: 称号マスタ
-- =========================================
create table public.title_definitions (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references public.tenants(id),
  code              text not null,                       -- '現場復旧の神' 等の安定識別子
  display_name      text not null,
  icon              text not null,                       -- 絵文字 or アイコン名
  description       text not null,
  rarity            rarity_tier not null,
  unlock_condition  text,                                -- 自然言語(構造化は将来)
  reward_points     integer not null default 0 check (reward_points >= 0),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, code)
);

-- 報酬画面 / 図鑑表示: 「アクティブな称号を rarity 順に並べる」が主クエリ
create index idx_title_definitions_tenant_active_rarity
  on public.title_definitions(tenant_id, is_active, rarity);

-- =========================================
-- titles_granted: 称号付与履歴
-- =========================================
create table public.titles_granted (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id),
  user_id     uuid not null references public.profiles(id),
  title_id    uuid not null references public.title_definitions(id),
  granted_by  uuid not null references public.profiles(id),  -- 付与者(必須)
  granted_at  timestamptz not null default now(),
  reason      text,
  unique (user_id, title_id)                                  -- 同一称号は1人1回まで
);

-- ダッシュボード「今月の称号付与数」(MASTER-PLAN P2-02 参照)で使用
create index idx_titles_granted_tenant_granted_at
  on public.titles_granted(tenant_id, granted_at desc);

-- 個人プロフィールでの「自分の称号一覧」取得用
create index idx_titles_granted_user
  on public.titles_granted(user_id, granted_at desc);

-- title 別の付与人数集計用(管理者画面で使用想定)
create index idx_titles_granted_title
  on public.titles_granted(title_id);

-- =========================================
-- skill_parameters: スキルパラメータ集計
-- =========================================
-- user_id を PK とする upsert スタイルのテーブル。
-- 全パラメータに 0..100 の CHECK を入れて、不正な算出値の侵入を DB レイヤで弾く。
create table public.skill_parameters (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  tenant_id        uuid not null references public.tenants(id),
  technical        integer not null default 0 check (technical between 0 and 100),       -- 技術力
  judgment         integer not null default 0 check (judgment between 0 and 100),        -- 判断力
  safety           integer not null default 0 check (safety between 0 and 100),          -- 安全
  communication    integer not null default 0 check (communication between 0 and 100),   -- 報連相
  stamina          integer not null default 0 check (stamina between 0 and 100),         -- 体力
  responsibility   integer not null default 0 check (responsibility between 0 and 100),  -- 責任感
  level            integer not null default 1 check (level >= 1),
  exp              integer not null default 0 check (exp >= 0),
  exp_to_next      integer not null default 1000 check (exp_to_next > 0),
  recalculated_at  timestamptz not null default now()
);

-- ランキング / テナント全体の平均算出用
create index idx_skill_parameters_tenant
  on public.skill_parameters(tenant_id);

-- =========================================
-- special_abilities: 特殊能力マスタ
-- =========================================
create table public.special_abilities (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references public.tenants(id),
  code          text not null,
  display_name  text not null,
  icon          text not null,
  description   text not null,
  rarity        rarity_tier not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, code)
);

-- 図鑑画面 / 一覧画面で active のみを rarity 順表示
create index idx_special_abilities_tenant_active_rarity
  on public.special_abilities(tenant_id, is_active, rarity);

-- =========================================
-- user_abilities: ユーザー保有特殊能力
-- =========================================
-- 複合 PK で同一能力の重複付与を防止。tenant_id を持たないのは
-- profiles → tenants が一意のため。RLS は profiles 経由で評価する。
create table public.user_abilities (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  ability_id  uuid not null references public.special_abilities(id),
  granted_at  timestamptz not null default now(),
  granted_by  uuid references public.profiles(id),
  primary key (user_id, ability_id)
);

-- ability 別保有人数の集計用 (titles と同様、管理者画面で使用想定)
create index idx_user_abilities_ability
  on public.user_abilities(ability_id);

-- =========================================
-- updated_at triggers — マスタテーブルのみ
-- =========================================
create trigger title_definitions_updated_at
  before update on public.title_definitions
  for each row execute function public.tg_set_updated_at();

create trigger special_abilities_updated_at
  before update on public.special_abilities
  for each row execute function public.tg_set_updated_at();

-- =========================================
-- RLS 有効化
-- =========================================
alter table public.title_definitions  enable row level security;
alter table public.titles_granted     enable row level security;
alter table public.skill_parameters   enable row level security;
alter table public.special_abilities  enable row level security;
alter table public.user_abilities     enable row level security;

-- =========================================
-- Policies — title_definitions
-- 全員閲覧可、編集は office+ のみ
-- =========================================
create policy "tenant members can read title_definitions"
  on public.title_definitions for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can manage title_definitions"
  on public.title_definitions for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

-- =========================================
-- Policies — titles_granted
-- 全員閲覧可(同テナント)、INSERT は office+ のみ
-- 取り消し(DELETE)は将来の管理者専用機能で別途扱うため現状ポリシー無し
-- =========================================
create policy "tenant members can read titles_granted"
  on public.titles_granted for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can grant titles"
  on public.titles_granted for insert
  with check (
    tenant_id = public.user_tenant_id()
    and public.user_role() in ('office', 'ceo', 'system')
    and granted_by = auth.uid()
  );

-- =========================================
-- Policies — skill_parameters
-- 同テナントは閲覧可。INSERT/UPDATE は server-side の security definer 関数経由のみ。
-- (UI から直接 update を許可するとパラメータ偽装が可能になるため明示的に拒否)
-- =========================================
create policy "tenant members can read skill_parameters"
  on public.skill_parameters for select
  using (tenant_id = public.user_tenant_id());

-- =========================================
-- Policies — special_abilities
-- 全員閲覧可、編集は office+ のみ
-- =========================================
create policy "tenant members can read special_abilities"
  on public.special_abilities for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can manage special_abilities"
  on public.special_abilities for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

-- =========================================
-- Policies — user_abilities
-- 同テナントは閲覧可、INSERT は office+ のみ
-- =========================================
create policy "tenant members can read user_abilities"
  on public.user_abilities for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = user_abilities.user_id
        and p.tenant_id = public.user_tenant_id()
    )
  );

create policy "office and ceo can grant user_abilities"
  on public.user_abilities for insert
  with check (
    public.user_role() in ('office', 'ceo', 'system')
    and exists (
      select 1 from public.profiles p
      where p.id = user_abilities.user_id
        and p.tenant_id = public.user_tenant_id()
    )
  );

-- =========================================
-- recalculate_skill_parameters(p_user_id uuid)
-- スキルパラメータ再計算 (security definer)
--
-- 現状はスケルトン: 全パラメータを 0 にした placeholder upsert。
-- P3-B-03 で MASTER-PLAN 記載の式に差し替える予定:
--   - 技術力: AVG(work_evaluations.quality) + certifications.count*2
--   - 判断力: AVG(incident_responses.speed_score)
--   - 安全:   safety_combo_days / 2 + ky_completion_rate*50
--   - 報連相: report3_entries 提出率*60 + meeting_evaluations*40
--   - 体力:   出勤率*80 + (1-残業率)*20
--   - 責任感: 期限達成率*60 + peer_evaluations*40
--
-- 参照予定テーブル: report3_entries / incident_reports / user_qualifications 等
-- =========================================
create or replace function public.recalculate_skill_parameters(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  -- 対象ユーザーのテナントを取得 (存在しない場合は早期リターン)
  select tenant_id into v_tenant_id
    from public.profiles
    where id = p_user_id;

  if v_tenant_id is null then
    raise exception 'user not found: %', p_user_id;
  end if;

  -- TODO(P3-B-03): 実際の算出ロジックを実装
  -- 現状は 0 placeholder で upsert (将来差し替え)
  insert into public.skill_parameters
    (user_id, tenant_id, technical, judgment, safety, communication, stamina, responsibility,
     level, exp, exp_to_next, recalculated_at)
  values
    (p_user_id, v_tenant_id, 0, 0, 0, 0, 0, 0, 1, 0, 1000, now())
  on conflict (user_id) do update set
    tenant_id        = excluded.tenant_id,
    technical        = excluded.technical,
    judgment         = excluded.judgment,
    safety           = excluded.safety,
    communication    = excluded.communication,
    stamina          = excluded.stamina,
    responsibility   = excluded.responsibility,
    -- level / exp / exp_to_next は別ロジックで進化させるため
    -- placeholder では既存値を保持する (初回 insert 時のみ default が入る)
    recalculated_at  = excluded.recalculated_at;
end;
$$;

grant execute on function public.recalculate_skill_parameters(uuid) to authenticated;

-- =========================================
-- comments
-- =========================================
comment on table public.title_definitions is 'パワプロ風称号マスタ。tenant ごとに code でユニーク。office+ が編集。';
comment on table public.titles_granted    is '称号付与履歴 (append-only)。同一称号は 1 ユーザー 1 回のみ。';
comment on table public.skill_parameters  is 'スキルパラメータ集計値 (0..100)。書き込みは recalculate_skill_parameters 関数経由のみ。';
comment on table public.special_abilities is '特殊能力マスタ。tenant ごとに code でユニーク。office+ が編集。';
comment on table public.user_abilities    is 'ユーザー保有特殊能力 (append-only)。複合 PK で重複付与を防止。';

comment on type rarity_tier is '称号 / 特殊能力で共有する稀少度 enum (bronze..platinum)。';

comment on function public.recalculate_skill_parameters(uuid) is
  'スキルパラメータを再計算し skill_parameters に upsert。現状は placeholder (P3-B-03 で差し替え)。security definer で UI 直接更新を防止。';
