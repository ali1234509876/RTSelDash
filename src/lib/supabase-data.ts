import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Role } from "@/lib/auth-context";
import { currentPeriod } from "@/lib/period";

const KNOWN_ROLES: readonly Role[] = ["ceo", "dept_head", "accountant", "sales_rep"] as const;
function isKnownRole(value: string): value is Role {
  return (KNOWN_ROLES as readonly string[]).includes(value);
}

export type TransactionStatus = Database["public"]["Enums"]["transaction_status"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"] & {
  profiles?: { full_name: string | null } | null;
};

export interface ProfileWithRoles {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
  roles: Role[];
}

export async function getProfilesWithRoles(period: string = currentPeriod()) {
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
    { data: targets, error: targetsError },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, department_id").order("full_name", { ascending: true }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("monthly_targets").select("user_id, amount").eq("period", period),
  ]);

  if (profilesError) throw profilesError;
  if (rolesError) throw rolesError;
  if (targetsError) throw targetsError;

  const targetByUser = new Map((targets ?? []).map((t) => [t.user_id, Number(t.amount)]));

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    monthly_target: targetByUser.get(profile.id) ?? 0,
    department_id: profile.department_id ?? null,
    roles: (roles ?? [])
      .filter((role) => role.user_id === profile.id)
      .map((role) => role.role as string)
      .filter(isKnownRole),
  }));
}

export interface ProfileDetail {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
  phone: string | null;
  hired_at: string | null;
  is_active: boolean;
}

export async function getProfile(
  id: string,
  period: string = currentPeriod(),
): Promise<ProfileDetail | null> {
  const [
    { data, error },
    { data: target, error: targetError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, department_id, phone, hired_at, is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("monthly_targets").select("amount").eq("user_id", id).eq("period", period).maybeSingle(),
  ]);

  if (error) throw error;
  if (targetError) throw targetError;
  if (!data) return null;

  return {
    id: data.id,
    full_name: data.full_name,
    monthly_target: target ? Number(target.amount) : 0,
    department_id: data.department_id ?? null,
    phone: data.phone ?? null,
    hired_at: data.hired_at ?? null,
    is_active: data.is_active,
  };
}

/** Fetch monthly_targets.amount for one user across many periods. */
export async function getMonthlyTargetsHistory(
  userId: string,
  periods: string[],
): Promise<Record<string, number>> {
  if (periods.length === 0) return {};
  const { data, error } = await supabase
    .from("monthly_targets")
    .select("period, amount")
    .eq("user_id", userId)
    .in("period", periods);
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.period] = Number(row.amount);
  return out;
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<ProfileRow, "department_id" | "full_name" | "phone" | "hired_at" | "is_active">>,
) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) throw error;
}

/** Upsert (user_id, period) into monthly_targets. Stamps `set_by` with the current user. */
export async function setMonthlyTarget(
  userId: string,
  amount: number,
  period: string = currentPeriod(),
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { error } = await supabase
    .from("monthly_targets")
    .upsert(
      { user_id: userId, period, amount, set_by: session?.user.id ?? null },
      { onConflict: "user_id,period" },
    );
  if (error) throw error;
}

export async function addTransaction(input: Database["public"]["Tables"]["transactions"]["Insert"]) {
  const { error } = await supabase.from("transactions").insert(input);
  if (error) throw error;
}

/** Soft-delete a transaction by stamping deleted_at. Hard DELETE is blocked
 *  by RLS. The audit trigger captures the UPDATE so we keep a full trail of
 *  who cancelled what and when. */
export async function softDeleteTransaction(id: string) {
  const { error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function addDepartment(input: {
  name: string;
  name_ar: string | null;
  code?: string | null;
}) {
  const { error } = await supabase.from("departments").insert(input);
  if (error) throw error;
}

export async function updateDepartment(
  id: string,
  updates: { name?: string; name_ar?: string | null; code?: string | null; is_active?: boolean },
) {
  const { error } = await supabase.from("departments").update(updates).eq("id", id);
  if (error) throw error;
}

/** Assign or clear the head of a department. The DB trigger auto-grants the
 *  `dept_head` role to the new head (idempotent). Removing a head does NOT
 *  revoke their role — that is an explicit admin action. */
export async function setDepartmentHead(departmentId: string, headId: string | null) {
  const { error } = await supabase
    .from("departments")
    .update({ head_id: headId })
    .eq("id", departmentId);
  if (error) throw error;
}

export async function removeDepartment(id: string) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export type AuditAction = "INSERT" | "UPDATE" | "DELETE";

export interface AuditRow {
  id: number;
  transaction_id: string;
  action: AuditAction;
  actor: string | null;
  changed_at: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  /** Joined display name for `actor` (resolved client-side from a profiles lookup). */
  actor_name: string | null;
  /** File number from before_data/after_data for display in the global feed. */
  file_number: string | null;
}

interface RawAuditRow {
  id: number;
  transaction_id: string;
  action: AuditAction;
  actor: string | null;
  changed_at: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
}

/** Resolve actor user_ids → display names from profiles, batched. */
async function attachActorNames(rows: RawAuditRow[]): Promise<AuditRow[]> {
  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor).filter((id): id is string => !!id)),
  );
  let nameById = new Map<string, string | null>();
  if (actorIds.length > 0) {
    // RLS on profiles already restricts who can see whom; for actors outside
    // the viewer's scope we fall back to "System" / null without surfacing IDs.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    if (error) throw error;
    nameById = new Map((data ?? []).map((p) => [p.id, p.full_name ?? null]));
  }
  return rows.map((r) => {
    const after = r.after_data as { file_number?: string } | null;
    const before = r.before_data as { file_number?: string } | null;
    return {
      ...r,
      actor_name: r.actor ? nameById.get(r.actor) ?? null : null,
      file_number: after?.file_number ?? before?.file_number ?? null,
    };
  });
}

/** Audit entries for one transaction, oldest → newest (so a UI can show a
 *  natural timeline). Server-side RLS scopes visibility per role. */
export async function getTransactionAudit(transactionId: string): Promise<AuditRow[]> {
  const { data, error } = await supabase
    .from("transaction_audit")
    .select("id, transaction_id, action, actor, changed_at, before_data, after_data")
    .eq("transaction_id", transactionId)
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return attachActorNames((data ?? []) as RawAuditRow[]);
}

/** Global audit feed, newest → oldest. Server-side RLS scopes visibility:
 *  CEO / accountant → all; dept_head → own dept's transactions only. */
export async function getAuditFeed(limit = 200): Promise<AuditRow[]> {
  const { data, error } = await supabase
    .from("transaction_audit")
    .select("id, transaction_id, action, actor, changed_at, before_data, after_data")
    .order("changed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachActorNames((data ?? []) as RawAuditRow[]);
}
