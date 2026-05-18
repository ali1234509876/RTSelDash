-- ============================================================================
--  MIGRATION 04 — Auto-revoke stale dept_head role  (Sprint C3)
--
--  Problem this fixes:
--    Migration 02 added trg_grant_head_role: setting departments.head_id grants
--    the dept_head role automatically. By design it did NOT revoke when a user
--    stopped being a head, on the theory that "they might head another dept or
--    be demoted intentionally." In practice this leaves orphan dept_head rows
--    in user_roles. The auth-context picks dept_head as primaryRole and the
--    user gets stuck on a manager dashboard with the "no managed department"
--    empty state — even though they are actively a sales_rep.
--
--  What changes:
--    * Backfill: delete every dept_head row whose user heads no active dept.
--    * Trigger: on departments UPDATE of head_id/is_active OR DELETE, drop
--      the dept_head role from anyone affected who no longer heads any active
--      department. Symmetric to trg_grant_head_role.
--    * INSERT path is unchanged (handled by trg_grant_head_role).
--
--  Notes:
--    * The frontend (auth-context.tsx) also defensively demotes a stale
--      dept_head primaryRole when managedDepartmentIds is empty, so a single
--      backfill is sufficient even if a future reverts this trigger.
--    * Idempotent: re-runnable.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. One-shot backfill — clean up existing orphan rows
-- ----------------------------------------------------------------------------
delete from public.user_roles ur
where ur.role = 'dept_head'
  and not exists (
    select 1
    from public.departments d
    where d.head_id = ur.user_id
      and d.is_active
  );

-- ----------------------------------------------------------------------------
-- 2. Sync function — revoke dept_head from users who no longer head any
--    active department after a relevant change.
-- ----------------------------------------------------------------------------
create or replace function public.sync_revoke_dept_head_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidates uuid[];
begin
  -- Collect users whose head-status may have changed by this row event.
  if tg_op = 'UPDATE' then
    candidates := array_remove(array[old.head_id, new.head_id], null);
  elsif tg_op = 'DELETE' then
    candidates := array_remove(array[old.head_id], null);
  else
    -- INSERT cannot orphan an existing role.
    return null;
  end if;

  if array_length(candidates, 1) is null then
    return null;
  end if;

  -- Revoke dept_head from any candidate who heads zero active departments.
  delete from public.user_roles ur
  where ur.role = 'dept_head'
    and ur.user_id = any(candidates)
    and not exists (
      select 1
      from public.departments d
      where d.head_id = ur.user_id
        and d.is_active
    );

  return null; -- AFTER trigger, return value ignored
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Bind trigger to departments
-- ----------------------------------------------------------------------------
drop trigger if exists trg_sync_revoke_dept_head_role on public.departments;
create trigger trg_sync_revoke_dept_head_role
  after update of head_id, is_active or delete on public.departments
  for each row execute function public.sync_revoke_dept_head_role();
