/** Centralized react-query keys so invalidations stay consistent. */
export const queryKeys = {
  transactions: (scope: "self" | "all", userId: string | null) =>
    ["transactions", scope, userId] as const,
  transactionsAll: ["transactions"] as const,
  departments: ["departments"] as const,
  profiles: ["profiles"] as const,
  profile: (id: string) => ["profile", id] as const,
};
