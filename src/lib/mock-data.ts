import type { Role } from "@/lib/auth-context";

export type TransactionStatus = "completed" | "pending" | "cancelled";

export interface MockDepartment {
  id: string;
  name: string;
  name_ar: string | null;
}

export interface MockProfile {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
}

export interface MockTransaction {
  id: string;
  file_number: string;
  amount: number;
  status: TransactionStatus;
  sales_rep_id: string | null;
  recorded_by: string | null;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null } | null;
}

export interface MockUserRole {
  user_id: string;
  role: Role;
}

interface MockState {
  departments: MockDepartment[];
  profiles: MockProfile[];
  roles: MockUserRole[];
  transactions: MockTransaction[];
}

const STORE_KEY = "numeric-zenith-local-demo-data";
const listeners = new Set<() => void>();

const departments: MockDepartment[] = [
  { id: "dept-sales", name: "Sales", name_ar: "المبيعات" },
  { id: "dept-enterprise", name: "Enterprise", name_ar: "الشركات" },
  { id: "dept-operations", name: "Operations", name_ar: "العمليات" },
];

const profiles: MockProfile[] = [
  { id: "user-ceo", full_name: "Aisha Morgan", monthly_target: 0, department_id: null },
  { id: "user-manager", full_name: "Omar Haddad", monthly_target: 0, department_id: "dept-sales" },
  { id: "user-accountant", full_name: "Nora Patel", monthly_target: 0, department_id: "dept-operations" },
  { id: "rep-layla", full_name: "Layla Hassan", monthly_target: 185000, department_id: "dept-sales" },
  { id: "rep-yousef", full_name: "Yousef Karim", monthly_target: 165000, department_id: "dept-sales" },
  { id: "rep-maya", full_name: "Maya Chen", monthly_target: 210000, department_id: "dept-enterprise" },
  { id: "rep-samir", full_name: "Samir Khan", monthly_target: 145000, department_id: "dept-enterprise" },
  { id: "rep-dana", full_name: "Dana Saleh", monthly_target: 125000, department_id: "dept-operations" },
];

const roles: MockUserRole[] = [
  { user_id: "user-ceo", role: "ceo" },
  { user_id: "user-manager", role: "manager" },
  { user_id: "user-accountant", role: "accountant" },
  { user_id: "rep-layla", role: "sales_rep" },
  { user_id: "rep-yousef", role: "sales_rep" },
  { user_id: "rep-maya", role: "sales_rep" },
  { user_id: "rep-samir", role: "sales_rep" },
  { user_id: "rep-dana", role: "sales_rep" },
];

const repIds = profiles.filter((p) => p.id.startsWith("rep-")).map((p) => p.id);
const statuses: TransactionStatus[] = ["completed", "completed", "completed", "pending", "cancelled"];

function createTransactions(): MockTransaction[] {
  const now = new Date();
  return Array.from({ length: 34 }, (_, index) => {
    const repId = repIds[index % repIds.length];
    const date = new Date(now);
    date.setDate(now.getDate() - index * 2);
    const status = statuses[index % statuses.length];
    const amount = [18500, 27500, 42000, 63000, 31500, 52000, 76000][index % 7] + index * 850;
    return {
      id: `tx-${index + 1}`,
      file_number: `NZ-${String(2400 + index).padStart(4, "0")}`,
      amount,
      status,
      sales_rep_id: repId,
      recorded_by: "user-accountant",
      transaction_date: date.toISOString().slice(0, 10),
      notes: status === "pending" ? "Awaiting final approval" : null,
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    };
  });
}

const initialState: MockState = {
  departments,
  profiles,
  roles,
  transactions: createTransactions(),
};

function readState(): MockState {
  if (typeof window === "undefined") return initialState;
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initialState));
    return initialState;
  }
}

function writeState(updater: (state: MockState) => MockState) {
  const next = updater(readState());
  window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribeMockData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMockState() {
  return readState();
}

export function getProfilesWithRoles() {
  const state = readState();
  return state.profiles.map((profile) => ({
    ...profile,
    roles: state.roles.filter((role) => role.user_id === profile.id).map((role) => role.role),
  }));
}

export function getTransactions(scope: "self" | "all", userId?: string | null) {
  const state = readState();
  const profileMap = new Map(state.profiles.map((profile) => [profile.id, profile.full_name]));
  return state.transactions
    .filter((tx) => scope === "all" || tx.sales_rep_id === userId)
    .map((tx) => ({ ...tx, profiles: { full_name: tx.sales_rep_id ? (profileMap.get(tx.sales_rep_id) ?? null) : null } }))
    .sort((a, b) => `${b.transaction_date}${b.created_at}`.localeCompare(`${a.transaction_date}${a.created_at}`));
}

export function addTransaction(input: Omit<MockTransaction, "id" | "created_at" | "updated_at" | "profiles">) {
  const timestamp = new Date().toISOString();
  writeState((state) => ({
    ...state,
    transactions: [{ ...input, id: `tx-${crypto.randomUUID()}`, created_at: timestamp, updated_at: timestamp }, ...state.transactions],
  }));
}

export function updateProfile(id: string, updates: Partial<Pick<MockProfile, "monthly_target" | "department_id" | "full_name">>) {
  writeState((state) => ({
    ...state,
    profiles: state.profiles.map((profile) => (profile.id === id ? { ...profile, ...updates } : profile)),
  }));
}

export function addDepartment(input: Pick<MockDepartment, "name" | "name_ar">) {
  writeState((state) => ({
    ...state,
    departments: [...state.departments, { id: `dept-${crypto.randomUUID()}`, ...input }],
  }));
}

export function removeDepartment(id: string) {
  writeState((state) => ({
    ...state,
    departments: state.departments.filter((department) => department.id !== id),
    profiles: state.profiles.map((profile) => profile.department_id === id ? { ...profile, department_id: null } : profile),
  }));
}

export function ensureDemoUser(email: string, fullName?: string) {
  const lower = email.toLowerCase();
  if (lower.includes("account")) return profiles[2];
  if (lower.includes("sales") || lower.includes("rep")) return profiles[3];
  if (lower.includes("manager")) return profiles[1];
  if (lower.includes("ceo") || !fullName) return profiles[0];
  const id = `user-${crypto.randomUUID()}`;
  const profile: MockProfile = { id, full_name: fullName, monthly_target: 150000, department_id: "dept-sales" };
  writeState((state) => ({
    ...state,
    profiles: [...state.profiles, profile],
    roles: [...state.roles, { user_id: id, role: "ceo" }],
  }));
  return profile;
}
