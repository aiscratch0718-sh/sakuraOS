-- =====================================================================
-- SAKURA OS — Phase B (Minimum Spine) Initial Schema
-- =====================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- after the project is provisioned.
--
-- This schema covers:
--   - tenants (single-tenant for MVP, structure ready for multi-tenant)
--   - profiles (extends auth.users with role + tenant_id)
--   - customers, projects (master data)
--   - work_classifications (3-tier 大/中/小分類)
--   - report3_entries / report3_rows (REPORT3 main tables)
--   - report3_idempotency_log (ADR-0001 atomic fanout)
--   - audit_log (operation audit)
-- =====================================================================

-- =========================================
-- Extensions
-- =========================================
create extension if not exists "uuid-ossp";

-- =========================================
-- Enums
-- =========================================
create type user_role as enum ('worker', 'leader', 'office', 'ceo', 'system');

-- =========================================
-- Tables
-- =========================================

-- Tenants (single row for SAKURA in MVP, ready for multi-tenant later)
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Profile data extending Supabase auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id),
  display_name text not null,
  role user_role not null default 'worker',
  hourly_rate_cents integer,  -- For cost calculations (TR-RPT-010 stream 3)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Customers (顧客マスタ)
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  created_at timestamptz not null default now()
);

-- Projects (工事案件マスタ)
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid references public.customers(id),
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  contract_amount_cents bigint,
  created_at timestamptz not null default now()
);

-- 3-tier work classification (大分類 → 中分類 → 小分類)
create table public.work_classifications (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  l1 text not null,        -- 大分類: 配管 / 保温 / 足場 / 機器設置 / 溶接 / その他
  l2 text not null,        -- 中分類: 冷媒 / 冷却水 / ...
  l3 text not null,        -- 小分類: サポート製作 / 塩ビ配管 / ...
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(tenant_id, l1, l2, l3)
);

-- REPORT3 header (ADR-0001 stream 1 of 5)
create table public.report3_entries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references public.profiles(id),
  project_id uuid not null references public.projects(id),
  work_date date not null,
  submitted_at timestamptz not null default now(),
  requires_leader_approval boolean not null default false,  -- True when total > 8h
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- REPORT3 line items
create table public.report3_rows (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references public.report3_entries(id) on delete cascade,
  l1 text not null,
  l2 text not null,
  l3 text not null,
  hours numeric(4,2) not null check (hours >= 0.5 and hours <= 24),
  memo text,
  photo_url text,           -- Supabase Storage URL
  photo_lat numeric(9,6),   -- GPS lat (TR-RPT-006)
  photo_lng numeric(9,6),   -- GPS lng
  photo_taken_at timestamptz,
  created_at timestamptz not null default now()
);

-- Idempotency log (ADR-0001) — prevents double-apply on retry
create table public.report3_idempotency_log (
  idempotency_key text primary key,
  entry_id uuid not null references public.report3_entries(id),
  user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Audit log (ADR-0001 stream 5 of 5) — written in same transaction as the change
create table public.audit_log (
  id bigserial primary key,
  tenant_id uuid not null references public.tenants(id),
  actor_id uuid references public.profiles(id),
  action text not null,                -- e.g. 'report3.submitted'
  target_type text not null,           -- e.g. 'report3_entry'
  target_id uuid,
  diff jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

-- =========================================
-- Indexes
-- =========================================
create index idx_profiles_tenant on public.profiles(tenant_id);
create index idx_profiles_role on public.profiles(tenant_id, role);
create index idx_customers_tenant on public.customers(tenant_id);
create index idx_projects_tenant on public.projects(tenant_id, status);
create index idx_projects_customer on public.projects(customer_id);
create index idx_work_classifications_tenant_l1 on public.work_classifications(tenant_id, l1, l2, display_order);

create index idx_report3_entries_tenant_date on public.report3_entries(tenant_id, work_date desc);
create index idx_report3_entries_user_date on public.report3_entries(user_id, work_date desc);
create index idx_report3_entries_project on public.report3_entries(project_id);
create index idx_report3_rows_entry on public.report3_rows(entry_id);
create index idx_report3_rows_classification on public.report3_rows(l1, l2, l3);

create index idx_audit_log_tenant_created on public.audit_log(tenant_id, created_at desc);
create index idx_audit_log_actor on public.audit_log(actor_id, created_at desc);
create index idx_audit_log_target on public.audit_log(target_type, target_id);

-- =========================================
-- Helper Functions (used in RLS policies)
-- =========================================

create or replace function public.user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- =========================================
-- updated_at trigger
-- =========================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- =========================================
-- Row Level Security — enable on all tables
-- =========================================
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.work_classifications enable row level security;
alter table public.report3_entries enable row level security;
alter table public.report3_rows enable row level security;
alter table public.report3_idempotency_log enable row level security;
alter table public.audit_log enable row level security;

-- =========================================
-- Policies
-- =========================================

-- Tenants: read by members only
create policy "tenant members can read own tenant"
  on public.tenants for select
  using (id = public.user_tenant_id());

-- Profiles: read same-tenant; users edit own non-role fields
create policy "users can read profiles in same tenant"
  on public.profiles for select
  using (tenant_id = public.user_tenant_id());

create policy "users can update own profile (non-role fields)"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "office and ceo can update profiles"
  on public.profiles for update
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id());

-- Customers
create policy "tenant members can read customers"
  on public.customers for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can write customers"
  on public.customers for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

-- Projects
create policy "tenant members can read projects"
  on public.projects for select
  using (tenant_id = public.user_tenant_id());

create policy "office and ceo can write projects"
  on public.projects for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

-- Work classifications: all members read, office writes
create policy "tenant members can read work_classifications"
  on public.work_classifications for select
  using (tenant_id = public.user_tenant_id());

create policy "office can write work_classifications"
  on public.work_classifications for all
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'system'))
  with check (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'system'));

-- REPORT3 entries
create policy "users can read own report3 entries"
  on public.report3_entries for select
  using (user_id = auth.uid());

create policy "leader/office/ceo can read tenant report3 entries"
  on public.report3_entries for select
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('leader', 'office', 'ceo', 'system'));

create policy "users can insert own report3 entries"
  on public.report3_entries for insert
  with check (user_id = auth.uid() and tenant_id = public.user_tenant_id());

create policy "office can update report3 entries (corrections)"
  on public.report3_entries for update
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'))
  with check (tenant_id = public.user_tenant_id());

-- REPORT3 rows
create policy "users can read report3 rows for accessible entries"
  on public.report3_rows for select
  using (
    exists (
      select 1 from public.report3_entries e
      where e.id = report3_rows.entry_id
        and (e.user_id = auth.uid() or public.user_role() in ('leader', 'office', 'ceo', 'system'))
        and e.tenant_id = public.user_tenant_id()
    )
  );

create policy "users can insert report3 rows for own entries"
  on public.report3_rows for insert
  with check (
    exists (
      select 1 from public.report3_entries e
      where e.id = report3_rows.entry_id
        and e.user_id = auth.uid()
    )
  );

-- Idempotency log: insert/read by owner of the entry
create policy "users can insert own idempotency log"
  on public.report3_idempotency_log for insert
  with check (user_id = auth.uid());

create policy "users can read own idempotency log"
  on public.report3_idempotency_log for select
  using (user_id = auth.uid());

-- Audit log: tenant-scoped read for office/ceo, insert allowed for any tenant member (server actions write here)
create policy "office and ceo can read audit log"
  on public.audit_log for select
  using (tenant_id = public.user_tenant_id() and public.user_role() in ('office', 'ceo', 'system'));

create policy "tenant members can insert audit log entries"
  on public.audit_log for insert
  with check (tenant_id = public.user_tenant_id());

-- =========================================
-- Done
-- =========================================
-- Next: run supabase/seed/0001_seed_sakura.sql to insert the SAKURA tenant
-- and the 3-tier work classification master data.
