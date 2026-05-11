-- ============================================================================
--  MIGRATION 02 — Department Heads Done Right  (Sprint A)
--
--  Problems this fixes:
--    * dept_head-ness was INFERRED from (role='dept_head') AND the user's own
--      profiles.department_id. If the CEO forgot to set department_id on the
--      head's profile, RLS silently returned zero rows.
--    * There was no way to answer "who heads department X?" in SQL.
--    * A department could have zero OR many silent heads.
--
--  What changes:
--    * departments.head_id    — explicit pointer, nullable, SET NULL on delete
--    * departments.code       — short unique code (e.g. SLS)
--    * departments.is_active  — soft-archive departments
--    * New helper public.get_managed_department(user) — "dept I head", NULL if none
--    * dept_head RLS rewritten to use get_managed_department (not the fragile
--      get_user_department of auth.uid())
--    * Auto-grant trigger: assigning head_id grants dept_head role in one step
--
--  Back-compatible:
--    * get_user_department keeps its original meaning (employee's own dept)
--    * profiles.department_id still drives rep scoping
--    * No data is destroyed; new columns are nullable/defaulted
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns on departments
-- ----------------------------------------------------------------------------
alter table public.departments
  add column if not exists head_id   uuid references public.profiles(id) on delete set null,
  add column if not exists code      text,
  add column if not exists is_active boolean not null default true;

create unique index if not exists uq_departments_code
  on public.departments(code)
  where code is not null;

create index if not exists idx_departments_head
  on public.departments(head_id);

-- ----------------------------------------------------------------------------
-- 2. Helper functions
-- ----------------------------------------------------------------------------

-- Unchanged: the department a user is ASSIGNED TO (rep or head; their own row).
create or replace function public.get_user_department(_user uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select department_id from public.profiles where id = _user;
$$;

-- New: the department a user MANAGES. NULL if they head nothing.
-- Limited to is_active departments so archived depts never leak access.
create or replace function public.get_managed_department(_user uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id
  from public.departments
  where head_id = _user
    and is_active
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- 3. Rewrite dept_head RLS on transactions
-- ----------------------------------------------------------------------------
drop policy if exists "tx_select_dept_head" on public.transactions;
drop policy if exists "tx_insert_dept_head" on public.transactions;
drop policy if exists "tx_update_dept_head" on public.transactions;

create policy "tx_select_dept_head"
  on public.transactions for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(sales_rep_id) = public.get_managed_department(auth.uid())
  );

create policy "tx_insert_dept_head"
  on public.transactions for insert to authenticated
  with check (
    public.has_role(auth.uid(),'dept_head')
    and recorded_by = auth.uid()
    and sales_rep_id is not null
    and transaction_date <= current_date
    and public.get_user_department(sales_rep_id) = public.get_managed_department(auth.uid())
  );

create policy "tx_update_dept_head"
  on public.transactions for update to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and status = 'pending'
    and public.get_user_department(sales_rep_id) = public.get_managed_department(auth.uid())
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(sales_rep_id) = public.get_managed_department(auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 4. Split admin write policies so dept_head is properly scoped
-- ----------------------------------------------------------------------------
-- monthly_targets: CEO touches all; dept_head only their department
drop policy if exists "targets_modify_admins" on public.monthly_targets;

create policy "targets_modify_ceo"
  on public.monthly_targets for all to authenticated
  using      (public.has_role(auth.uid(),'ceo'))
  with check (public.has_role(auth.uid(),'ceo'));

create policy "targets_modify_dept_head"
  on public.monthly_targets for all to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(user_id) = public.get_managed_department(auth.uid())
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and public.get_user_department(user_id) = public.get_managed_department(auth.uid())
  );

-- profiles: CEO can edit any; dept_head only members of their department
drop policy if exists "profiles_update_admins" on public.profiles;

create policy "profiles_update_ceo"
  on public.profiles for update to authenticated
  using      (public.has_role(auth.uid(),'ceo'))
  with check (public.has_role(auth.uid(),'ceo'));

create policy "profiles_update_dept_head"
  on public.profiles for update to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and department_id = public.get_managed_department(auth.uid())
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and department_id = public.get_managed_department(auth.uid())
  );

-- departments: CEO-only modify (unchanged semantically, re-stated for clarity)
-- (already: departments_modify_ceo) — no change required.

-- ----------------------------------------------------------------------------
-- 5. Auto-grant dept_head role when a user becomes a head
--    This way the CEO only has to set departments.head_id; the role follows.
--    Removing a head does NOT revoke the role (they might head another dept or
--    be demoted intentionally — explicit action required to remove the role).
-- ----------------------------------------------------------------------------
create or replace function public.grant_head_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.head_id is not null then
    insert into public.user_roles (user_id, role, granted_by)
      values (new.head_id, 'dept_head', auth.uid())
      on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_grant_head_role on public.departments;
create trigger trg_grant_head_role
  after insert or update of head_id on public.departments
  for each row execute function public.grant_head_role();

-- ----------------------------------------------------------------------------
-- 6. Backfill existing departments with a plausible head (if one exists)
--    For each dept with no head, pick any user who already has dept_head role
--    AND is assigned to that department on their profile.
-- ----------------------------------------------------------------------------
update public.departments d
set head_id = sub.user_id
from (
  select distinct on (p.department_id)
         p.department_id,
         p.id as user_id
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id and ur.role = 'dept_head'
  where p.department_id is not null
  order by p.department_id, p.created_at
) as sub
where d.id = sub.department_id
  and d.head_id is null;
