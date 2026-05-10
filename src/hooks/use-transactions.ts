import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import type { TransactionRow } from "@/lib/supabase-data";

export type Tx = TransactionRow;

interface Options {
  scope: "self" | "all";
}

export function useTransactions({ scope }: Options) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery<Tx[]>({
    queryKey: queryKeys.transactions(scope, userId),
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select(
          "id, file_number, amount, status, sales_rep_id, recorded_by, transaction_date, notes, created_at, updated_at, profiles:sales_rep_id(full_name)",
        )
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (scope === "self" && userId) q = q.eq("sales_rep_id", userId);

      const { data: rows, error } = await q;
      if (error) throw error;
      return (rows ?? []) as unknown as Tx[];
    },
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
  };
}
