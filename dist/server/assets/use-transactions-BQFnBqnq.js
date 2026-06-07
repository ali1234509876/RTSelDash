import { a as useQuery, q as queryKeys } from "./supabase-data-BRA3oWFj.js";
import { a as useAuth, s as supabase } from "./router-C21oMGn1.js";
function useTransactions({ scope }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const query = useQuery({
    queryKey: queryKeys.transactions(scope, userId),
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase.from("transactions").select(
        "id, file_number, amount, status, sales_rep_id, recorded_by, transaction_date, notes, deleted_at, created_at, updated_at, profiles:sales_rep_id(full_name)"
      ).is("deleted_at", null).order("transaction_date", { ascending: false }).order("created_at", { ascending: false });
      if (scope === "self" && userId) q = q.eq("sales_rep_id", userId);
      const { data: rows, error } = await q;
      if (error) throw error;
      return rows ?? [];
    }
  });
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error
  };
}
export {
  useTransactions as u
};
