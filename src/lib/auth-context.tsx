import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { currentPeriod } from "@/lib/period";

export type Role = "ceo" | "dept_head" | "accountant" | "sales_rep";

const KNOWN_ROLES: readonly Role[] = ["ceo", "dept_head", "accountant", "sales_rep"] as const;

function isKnownRole(value: string): value is Role {
  return (KNOWN_ROLES as readonly string[]).includes(value);
}

export interface Profile {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: Role[];
  loading: boolean;
  primaryRole: Role | null;
  /** First department this user is HEAD of (via departments.head_id), null if none. Kept for backward compat. */
  managedDepartmentId: string | null;
  /** All active departments this user is HEAD of. Empty array if none. */
  managedDepartmentIds: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_PRIORITY: Role[] = ["ceo", "dept_head", "accountant", "sales_rep"];
export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managedDepartmentIds, setManagedDepartmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (currentUser: User) => {
    const period = currentPeriod();
    const [
      { data: profileData, error: profileError },
      { data: roleData, error: roleError },
      { data: targetData, error: targetError },
      { data: managedDepts, error: managedDeptError },
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, department_id").eq("id", currentUser.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", currentUser.id),
      supabase
        .from("monthly_targets")
        .select("amount")
        .eq("user_id", currentUser.id)
        .eq("period", period)
        .maybeSingle(),
      // Multi-dept-head safe: do NOT use .maybeSingle() — Migration 03 allows a user to head several departments.
      supabase
        .from("departments")
        .select("id")
        .eq("head_id", currentUser.id)
        .eq("is_active", true),
    ]);

    if (profileError) throw profileError;
    if (roleError) throw roleError;
    if (targetError) throw targetError;
    if (managedDeptError) throw managedDeptError;

    setProfile(
      profileData
        ? {
            id: profileData.id,
            full_name: profileData.full_name,
            monthly_target: targetData ? Number(targetData.amount) : 0,
            department_id: profileData.department_id ?? null,
          }
        : null,
    );
    setRoles(
      (roleData ?? [])
        .map((r) => r.role as string)
        .filter(isKnownRole),
    );
    setManagedDepartmentIds((managedDepts ?? []).map((d) => d.id));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadUserData(data.session.user).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) loadUserData(nextSession.user);
      else {
        setProfile(null);
        setRoles([]);
        setManagedDepartmentIds([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setManagedDepartmentIds([]);
    qc.clear();
  };

  const refreshProfile = async () => {
    if (user) await loadUserData(user);
  };

  // Demote stale `dept_head`: if the user has the role in user_roles but heads no active department,
  // pick the next eligible role instead (typically `sales_rep`, which every user has by signup trigger).
  // This prevents users from being locked into the manager dashboard with an empty state.
  const isRoleActive = (r: Role) => r !== "dept_head" || managedDepartmentIds.length > 0;
  const primaryRole =
    ROLE_PRIORITY.find((r) => roles.includes(r) && isRoleActive(r)) ??
    ROLE_PRIORITY.find((r) => roles.includes(r)) ??
    null;

  const managedDepartmentId = managedDepartmentIds[0] ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        primaryRole,
        managedDepartmentId,
        managedDepartmentIds,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
