import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, History } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { softDeleteTransaction } from "@/lib/supabase-data";
import { errorMessage } from "@/lib/errors";
import { StatusBadge } from "./status-badge";
import { AuditHistoryModal } from "./audit-history-modal";
import type { TransactionRow as SupabaseTransactionRow } from "@/lib/supabase-data";

export type TransactionRow = SupabaseTransactionRow;

interface Props {
  rows: TransactionRow[];
  showRep?: boolean;
  emptyLabel?: string;
}

export function TransactionsTable({ rows, showRep = false, emptyLabel }: Props) {
  const { t, lang } = useI18n();
  const { primaryRole } = useAuth();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [historyTxId, setHistoryTxId] = useState<string | null>(null);

  // Authorization for the Cancel action mirrors the RLS in 20260510110000_initial_schema.sql:
  //   - CEO + accountant: can cancel any transaction.
  //   - dept_head: can cancel only `pending` transactions in their department
  //     (RLS enforces the dept check, we only gate by status here so the
  //     button doesn't appear on rows the DB would reject).
  //   - sales_rep: cannot cancel.
  const canSeeAudit =
    primaryRole === "ceo" || primaryRole === "accountant" || primaryRole === "dept_head";
  const canCancelRow = (row: TransactionRow) => {
    if (row.deleted_at) return false;
    if (primaryRole === "ceo" || primaryRole === "accountant") return true;
    if (primaryRole === "dept_head") return row.status === "pending";
    return false;
  };
  const showActions = canSeeAudit; // sales_rep sees neither column nor buttons

  const handleCancel = async (row: TransactionRow) => {
    if (!window.confirm(t("tx.cancelConfirm"))) return;
    setBusyId(row.id);
    try {
      await softDeleteTransaction(row.id);
      toast.success(t("tx.cancelled"));
      // Invalidate every list / dashboard that reads transactions.
      qc.invalidateQueries({ queryKey: queryKeysTransactionsAll });
      qc.invalidateQueries({ queryKey: ["audit"] });
    } catch (err) {
      console.error("[TransactionsTable] cancel failed:", err);
      toast.error(errorMessage(err, t("tx.cancelFailed")));
    } finally {
      setBusyId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="px-8 py-16 text-center text-sm text-muted-foreground">{emptyLabel ?? t("tx.empty")}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-start border-collapse">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
            <th className="px-6 py-4 font-semibold text-start">{t("tx.fileNumber")}</th>
            {showRep && <th className="px-4 py-4 font-semibold text-start">{t("tx.salesRep")}</th>}
            <th className="px-4 py-4 font-semibold text-start">{t("tx.amount")}</th>
            <th className="px-4 py-4 font-semibold text-start">{t("tx.date")}</th>
            <th className="px-4 py-4 font-semibold text-start">{t("tx.status")}</th>
            {showActions && (
              <th className="px-6 py-4 font-semibold text-end">{t("common.actions")}</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const allowed = canCancelRow(r);
            const isBusy = busyId === r.id;
            return (
              <tr key={r.id} className="group hover:bg-accent/40 transition-colors">
                <td className="px-6 py-4 text-sm tabular text-primary font-medium">#{r.file_number}</td>
                {showRep && (
                  <td className="px-4 py-4 text-sm text-foreground">{r.profiles?.full_name ?? "—"}</td>
                )}
                <td className="px-4 py-4 text-sm tabular text-foreground">
                  {formatCurrency(Number(r.amount), lang)} {t("common.currency")}
                </td>
                <td className="px-4 py-4 text-sm tabular text-muted-foreground">{formatDate(r.transaction_date, lang)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={r.status} />
                </td>
                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {canSeeAudit && (
                        <button
                          type="button"
                          onClick={() => setHistoryTxId(r.id)}
                          title={t("tx.history")}
                          aria-label={t("tx.history")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      )}
                      {allowed && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCancel(r)}
                          title={t("tx.cancelAction")}
                          aria-label={t("tx.cancelAction")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <AuditHistoryModal
        transactionId={historyTxId}
        open={historyTxId !== null}
        onClose={() => setHistoryTxId(null)}
      />
    </div>
  );
}

// Inlined here to avoid a circular import with query-keys (keeps the module
// dependency graph one-directional).
const queryKeysTransactionsAll = ["transactions"] as const;
