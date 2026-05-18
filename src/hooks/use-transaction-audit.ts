import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getTransactionAudit, getAuditFeed, type AuditRow } from "@/lib/supabase-data";
import { queryKeys } from "@/lib/query-keys";

/** Audit history for a single transaction. Pass `null` to disable.
 *  Visibility is enforced by RLS (CEO/accountant: all; dept_head: own dept). */
export function useTransactionAudit(transactionId: string | null) {
  const { primaryRole } = useAuth();
  const enabled =
    !!transactionId && (primaryRole === "ceo" || primaryRole === "accountant" || primaryRole === "dept_head");

  const query = useQuery<AuditRow[]>({
    queryKey: transactionId ? queryKeys.auditByTx(transactionId) : ["audit", "tx", "disabled"],
    enabled,
    queryFn: () => getTransactionAudit(transactionId as string),
  });

  return { data: query.data ?? [], loading: query.isLoading, error: query.error };
}

/** Global audit feed for the dedicated /audit page.
 *  RLS scopes per role; sales_rep returns nothing. */
export function useAuditFeed() {
  const { primaryRole } = useAuth();
  const enabled =
    primaryRole === "ceo" || primaryRole === "accountant" || primaryRole === "dept_head";

  const query = useQuery<AuditRow[]>({
    queryKey: queryKeys.auditFeed,
    enabled,
    queryFn: () => getAuditFeed(),
  });

  return { data: query.data ?? [], loading: query.isLoading, error: query.error };
}
