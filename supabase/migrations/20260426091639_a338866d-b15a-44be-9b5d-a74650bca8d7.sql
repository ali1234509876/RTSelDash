-- Roles enum
create type public.app_role as enum ('manager', 'accountant', 'sales_rep');

-- Transaction status enum
create type public.transaction_status as enum ('completed', 'pending', 'cancelled');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_target numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- User roles (separate table — never store on profiles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security-definer role checker
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  file_number text not null unique,
  amount numeric(14,2) not null check (amount >= 0),
  status public.transaction_status not null default 'pending',
  sales_rep_id uuid not null references auth.users(id) on delete restrict,
  recorded_by uuid references auth.users(id) on delete set null,
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create index idx_transactions_sales_rep on public.transactions(sales_rep_id);
create index idx_transactions_date on public.transactions(transaction_date desc);
create index idx_transactions_status on public.transactions(status);

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Auto-create profile + default sales_rep role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  insert into public.user_roles (user_id, role)
  values (new.id, 'sales_rep');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== RLS POLICIES =====

-- profiles
create policy "Users view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Managers view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'manager'));

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Managers update all profiles"
  on public.profiles for update
  to authenticated
  using (public.has_role(auth.uid(), 'manager'));

-- user_roles
create policy "Users view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Managers view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'manager'));

create policy "Managers manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'manager'))
  with check (public.has_role(auth.uid(), 'manager'));

-- transactions
create policy "Sales reps view own transactions"
  on public.transactions for select
  to authenticated
  using (auth.uid() = sales_rep_id);

create policy "Accountants and managers view all transactions"
  on public.transactions for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'accountant')
    or public.has_role(auth.uid(), 'manager')
  );

create policy "Accountants and managers insert transactions"
  on public.transactions for insert
  to authenticated
  with check (
    public.has_role(auth.uid(), 'accountant')
    or public.has_role(auth.uid(), 'manager')
  );

create policy "Accountants and managers update transactions"
  on public.transactions for update
  to authenticated
  using (
    public.has_role(auth.uid(), 'accountant')
    or public.has_role(auth.uid(), 'manager')
  );

create policy "Managers delete transactions"
  on public.transactions for delete
  to authenticated
  using (public.has_role(auth.uid(), 'manager'));

-- Enable realtime on transactions
alter publication supabase_realtime add table public.transactions;
alter table public.transactions replica identity full;