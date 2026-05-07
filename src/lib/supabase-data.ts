import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Role } from "@/lib/auth-context";

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

export async function getProfilesWithRoles() {
  const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, monthly_target, department_id").order("full_name", { ascending: true }),
    supabase.from("user_roles").select("user_id, role"),
  ]);

  if (profilesError) throw profilesError;
  if (rolesError) throw rolesError;

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    monthly_target: Number(profile.monthly_target),
    department_id: profile.department_id ?? null,
    roles: (roles ?? []).filter((role) => role.user_id === profile.id).map((role) => role.role as Role),
  }));
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, monthly_target, department_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    full_name: data.full_name,
    monthly_target: Number(data.monthly_target),
    department_id: data.department_id ?? null,
  };
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<ProfileRow, "monthly_target" | "department_id" | "full_name">>,
) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
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
