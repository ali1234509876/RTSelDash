-- ============================================================================
--  INITIAL SCHEMA — Sales / Files Tracker (v2)
--  Designed to fix every weakness identified in v1:
--    * Historical monthly targets (per period) instead of a scalar on profiles
--    * Append-only audit log on transactions
--    * Hardened RLS (no recorded_by spoofing, no NULL sales_rep_id,
--      no future-dated rows, immutable audit columns)
--    * Soft delete (deleted_at) instead of hard delete
--    * Currency column with ISO-format CHECK
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------

create type public.app_role as enum (
  'ceo',
  'dept_head',
  'accountant',
  'sales_rep'
);

create type public.transaction_status as enum (
  'pending',
  'completed',
  'cancelled'
);

-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- 2a. departments -------------------------------------------------------------
create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  name_ar     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.departments enable row level security;

-- 2b. profiles (1:1 with auth.users) ----------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  department_id   uuid references public.departments(id) on delete set null,
  hired_at        date,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.profiles enable row level security;
create index idx_profiles_department on public.profiles(department_id);

-- 2c. user_roles --------------------------------------------------------------
create table public.user_roles (
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.app_role not null,
  granted_at  timestamptz not null default now(),
  granted_by  uuid references auth.users(id) on delete set null,
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;

-- 2d. monthly_targets ---------------------------------------------------------
-- One target per (user, calendar month). Editing a target no longer rewrites
-- past efficiency reports because each month has its own row.
create table public.monthly_targets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  period      date not null,
  amount      numeric(15,2) not null check (amount >= 0),
  set_by      uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, period),
  check (extract(day from period) = 1)  -- always first-of-month
);
alter table public.monthly_targets enable row level security;
create index idx_targets_user_period on public.monthly_targets(user_id, period desc);

-- 2e. transactions ------------------------------------------------------------
create table public.transactions (
  id                uuid primary key default gen_random_uuid(),
  file_number       text not null unique
                    check (length(file_number) between 1 and 64),
  amount            numeric(15,2) not null check (amount >= 0),
  currency          char(3) not null default 'EGP'
                    check (currency ~ '^[A-Z]{3}$'),
  status            public.transaction_status not null default 'pending',
  sales_rep_id      uuid not null references public.profiles(id) on delete restrict,
  recorded_by       uuid not null references auth.users(id) on delete restrict,
  transaction_date  date not null
                    check (transaction_date >= date '2000-01-01'),
  notes             text,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.transactions enable row level security;
create index idx_tx_sales_rep    on public.transactions(sales_rep_id);
create index idx_tx_date         on public.transactions(transaction_date desc);
create index idx_tx_status_live  on public.transactions(status) where deleted_at is null;
create index idx_tx_recorded_by  on public.transactions(recorded_by);

-- 2f. transaction_audit (append-only) ----------------------------------------
create table public.transaction_audit (
  id              bigserial primary key,
  transaction_id  uuid not null,
  action          text not null check (action in ('INSERT','UPDATE','DELETE')),
  actor           uuid,
  changed_at      timestamptz not null default now(),
  before_data     jsonb,
  after_data      jsonb
);
alter table public.transaction_audit enable row level security;
create index idx_audit_tx on public.transaction_audit(transaction_id, changed_at desc);

-- ----------------------------------------------------------------------------
-- 3. FUNCTIONS
-- ----------------------------------------------------------------------------

-- 3a. has_role ---------------------------------------------------------------
create or replace function public.has_role(_user uuid, _role public.app_role)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user and role = _role
  );
$$;

-- 3b. get_user_department ----------------------------------------------------
create or replace function public.get_user_department(_user uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select department_id from public.profiles where id = _user;
$$;

-- 3c. handle_new_user --------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name')
    on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
    values (new.id, 'sales_rep')
    on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3d. audit_transactions -----------------------------------------------------
create or replace function public.audit_transactions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.transaction_audit (transaction_id, action, actor, before_data, after_data)
  values (
    coalesce(new.id, old.id),
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_audit_transactions
  after insert or update or delete on public.transactions
  for each row execute function public.audit_transactions();

-- 3e. touch_updated_at -------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_touch_departments
  before update on public.departments
  for each row execute function public.touch_updated_at();

create trigger trg_touch_profiles
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger trg_touch_targets
  before update on public.monthly_targets
  for each row execute function public.touch_updated_at();

create trigger trg_touch_transactions
  before update on public.transactions
  for each row execute function public.touch_updated_at();

-- 3f. guard_transaction_immutables ------------------------------------------
-- Once a transaction is created, recorded_by / sales_rep_id / file_number are
-- locked. Mistakes are corrected via cancel + re-enter, preserving the audit
-- trail.
create or replace function public.guard_transaction_immutables()
returns trigger
language plpgsql
as $$
begin
  if new.recorded_by is distinct from old.recorded_by then
    raise exception 'recorded_by is immutable';
  end if;
  if new.sales_rep_id is distinct from old.sales_rep_id then
    raise exception 'sales_rep_id is immutable';
  end if;
  if new.file_number is distinct from old.file_number then
    raise exception 'file_number is immutable';
  end if;
  return new;
end;
$$;

create trigger trg_guard_tx_immutables
  before update on public.transactions
  for each row execute function public.guard_transaction_immutables();

-- ----------------------------------------------------------------------------
-- 4. RLS POLICIES
-- ----------------------------------------------------------------------------

-- 4a. departments ------------------------------------------------------------
create policy "departments_select_authed"
  on public.departments for select to authenticated using (true);

create policy "departments_modify_ceo"
  on public.departments for all to authenticated
  using      (public.has_role(auth.uid(),'ceo'))
  with check (public.has_role(auth.uid(),'ceo'));

-- 4b. profiles ---------------------------------------------------------------
create policy "profiles_select_authed"
  on public.profiles for select to authenticated using (true);

create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using      (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admins"
  on public.profiles for update to authenticated
  using      (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'dept_head'))
  with check (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'dept_head'));

-- 4c. user_roles -------------------------------------------------------------
create policy "user_roles_select_authed"
  on public.user_roles for select to authenticated using (true);

create policy "user_roles_modify_ceo"
  on public.user_roles for all to authenticated
  using      (public.has_role(auth.uid(),'ceo'))
  with check (public.has_role(auth.uid(),'ceo'));

-- 4d. monthly_targets --------------------------------------------------------
create policy "targets_select_authed"
  on public.monthly_targets for select to authenticated using (true);

create policy "targets_modify_admins"
  on public.monthly_targets for all to authenticated
  using      (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'dept_head'))
  with check (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'dept_head'));

-- 4e. transactions: SELECT ---------------------------------------------------
create policy "tx_select_admins"
  on public.transactions for select to authenticated
  using (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'accountant'));

create policy "tx_select_dept_head"
  on public.transactions for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

create policy "tx_select_self"
  on public.transactions for select to authenticated
  using (sales_rep_id = auth.uid());

-- 4f. transactions: INSERT --------------------------------------------------
create policy "tx_insert_admins"
  on public.transactions for insert to authenticated
  with check (
    (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'accountant'))
    and recorded_by = auth.uid()
    and sales_rep_id is not null
    and transaction_date <= current_date
  );

create policy "tx_insert_dept_head"
  on public.transactions for insert to authenticated
  with check (
    public.has_role(auth.uid(),'dept_head')
    and recorded_by = auth.uid()
    and sales_rep_id is not null
    and transaction_date <= current_date
    and public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

-- 4g. transactions: UPDATE --------------------------------------------------
create policy "tx_update_ceo"
  on public.transactions for update to authenticated
  using      (public.has_role(auth.uid(),'ceo'))
  with check (public.has_role(auth.uid(),'ceo'));

create policy "tx_update_accountant"
  on public.transactions for update to authenticated
  using      (public.has_role(auth.uid(),'accountant'))
  with check (public.has_role(auth.uid(),'accountant'));

create policy "tx_update_dept_head"
  on public.transactions for update to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and status = 'pending'
    and public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

-- 4h. transactions: DELETE — intentionally NO policy, so authenticated users
--     cannot hard-delete. Use soft-delete (set deleted_at) instead.

-- 4i. transaction_audit: read-only for admins ------------------------------
create policy "audit_select_admins"
  on public.transaction_audit for select to authenticated
  using (public.has_role(auth.uid(),'ceo') or public.has_role(auth.uid(),'accountant'));

-- ----------------------------------------------------------------------------
-- 5. REALTIME
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.transactions;

-- ----------------------------------------------------------------------------
-- 6. SEED DATA
-- ----------------------------------------------------------------------------
insert into public.departments (name, name_ar) values
  ('Sales',      'المبيعات'),
  ('Operations', 'العمليات'),
  ('Finance',    'المالية');
