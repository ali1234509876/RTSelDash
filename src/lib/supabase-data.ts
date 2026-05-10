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

export async function getProfile(id: string, period: string = currentPeriod()) {
  const [
    { data, error },
    { data: target, error: targetError },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, department_id").eq("id", id).maybeSingle(),
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
  };
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<ProfileRow, "department_id" | "full_name">>,
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

export async function addDepartment(input: Pick<DepartmentRow, "name" | "name_ar">) {
  const { error } = await supabase.from("departments").insert(input);
  if (error) throw error;
}

export async function removeDepartment(id: string) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}
