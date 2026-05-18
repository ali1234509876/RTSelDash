-- ============================================================================
--  MIGRATION 03 — Tighten RLS + Audit Access  (Sprint C1)
--
--  Closes the authorization issues identified in the audit:
--    A1  — profiles SELECT was global → scope to self / admins / dept_head / peers
--    A2  — monthly_targets SELECT was global → scope to self / admins / dept_head
--    A3  — user_roles SELECT was global → scope to self / admins / dept_head
--    A4  — transaction_audit invisible to dept_head → add scoped SELECT
--    A11 — get_managed_department was LIMIT 1 (multi-dept-head footgun) →
--          add is_managing_department(_user, _dept) helper and rewrite every
--          dept_head policy to use it. Multi-dept heads now work at the DB
--          layer. (UI layer still assumes single dept; future enhancement.)
--
--  Documented (explicit no-op, by design):
--    A8  — accountant transaction UPDATE remains unscoped (trusted role;
--          mitigated by future audit-log surfacing UI).
--    A9  — dept_head UPDATE remains restricted to status='pending' (preserves
--          "completed = closed" semantic; CEO/accountant retain override).
--    A10 — sales_rep cannot INSERT transactions (accountant-driven workflow).
--    A12 — departments table fully readable (org-structure transparency).
--    A13 — no DELETE policy anywhere (soft-delete only via deleted_at). ✅
--
--  Back-compat:
--    * get_managed_department() is retained (callers still in use), but every
--      dept_head policy is rewritten to use the new is_managing_department.
--    * No data destroyed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. is_managing_department(user, dept) — multi-dept-head safe
-- ----------------------------------------------------------------------------
create or replace function public.is_managing_department(_user uuid, _dept uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.departments
    where head_id = _user
      and id = _dept
      and is_active
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. profiles SELECT  (A1)
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_authed" on public.profiles;

-- Always: see your own row.
create policy "profiles_select_self"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- CEO + accountant: see everyone (operational requirement).
create policy "profiles_select_admins"
  on public.profiles for select to authenticated
  using (
    public.has_role(auth.uid(),'ceo')
    or public.has_role(auth.uid(),'accountant')
  );

-- Dept head: see members of any department they actively head.
create policy "profiles_select_dept_head"
  on public.profiles for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and department_id is not null
    and public.is_managing_department(auth.uid(), department_id)
  );

-- Any user: see colleagues in their own department (team roster / leaderboard).
-- Sensitive fields (targets, roles, transactions) stay protected by their own
-- policies — this only exposes profile metadata.
create policy "profiles_select_dept_peer"
  on public.profiles for select to authenticated
  using (
    department_id is not null
    and department_id = public.get_user_department(auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 3. monthly_targets SELECT  (A2)
-- ----------------------------------------------------------------------------
drop policy if exists "targets_select_authed" on public.monthly_targets;

create policy "targets_select_self"
  on public.monthly_targets for select to authenticated
  using (user_id = auth.uid());

create policy "targets_select_admins"
  on public.monthly_targets for select to authenticated
  using (
    public.has_role(auth.uid(),'ceo')
    or public.has_role(auth.uid(),'accountant')
  );

create policy "targets_select_dept_head"
  on public.monthly_targets for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(user_id)
    )
  );

-- ----------------------------------------------------------------------------
-- 4. user_roles SELECT  (A3)
-- ----------------------------------------------------------------------------
drop policy if exists "user_roles_select_authed" on public.user_roles;

create policy "user_roles_select_self"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

create policy "user_roles_select_admins"
  on public.user_roles for select to authenticated
  using (
    public.has_role(auth.uid(),'ceo')
    or public.has_role(auth.uid(),'accountant')
  );

create policy "user_roles_select_dept_head"
  on public.user_roles for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(user_id)
    )
  );

-- ----------------------------------------------------------------------------
-- 5. transaction_audit SELECT — let dept_head audit their own dept  (A4)
-- ----------------------------------------------------------------------------
create policy "audit_select_dept_head"
  on public.transaction_audit for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and exists (
      select 1
      from public.transactions t
      where t.id = transaction_audit.transaction_id
        and public.is_managing_department(
          auth.uid(),
          public.get_user_department(t.sales_rep_id)
        )
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Rewrite every dept_head policy to use is_managing_department  (A11)
--    The previous version called get_managed_department(self) which returns
--    LIMIT 1 — if anyone heads two departments the second silently disappears.
--    is_managing_department(self, dept_of_subject) is symmetric and supports
--    any number of managed departments per user.
-- ----------------------------------------------------------------------------

-- 6a. transactions
drop policy if exists "tx_select_dept_head" on public.transactions;
drop policy if exists "tx_insert_dept_head" on public.transactions;
drop policy if exists "tx_update_dept_head" on public.transactions;

create policy "tx_select_dept_head"
  on public.transactions for select to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(sales_rep_id)
    )
  );

create policy "tx_insert_dept_head"
  on public.transactions for insert to authenticated
  with check (
    public.has_role(auth.uid(),'dept_head')
    and recorded_by = auth.uid()
    and sales_rep_id is not null
    and transaction_date <= current_date
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(sales_rep_id)
    )
  );

create policy "tx_update_dept_head"
  on public.transactions for update to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and status = 'pending'
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(sales_rep_id)
    )
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(sales_rep_id)
    )
  );

-- 6b. monthly_targets modify
drop policy if exists "targets_modify_dept_head" on public.monthly_targets;

create policy "targets_modify_dept_head"
  on public.monthly_targets for all to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(user_id)
    )
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and public.is_managing_department(
      auth.uid(),
      public.get_user_department(user_id)
    )
  );

-- 6c. profiles UPDATE
drop policy if exists "profiles_update_dept_head" on public.profiles;

create policy "profiles_update_dept_head"
  on public.profiles for update to authenticated
  using (
    public.has_role(auth.uid(),'dept_head')
    and department_id is not null
    and public.is_managing_department(auth.uid(), department_id)
  )
  with check (
    public.has_role(auth.uid(),'dept_head')
    and department_id is not null
    and public.is_managing_department(auth.uid(), department_id)
  );
