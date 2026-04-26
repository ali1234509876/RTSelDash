import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { StatusBadge } from "./status-badge";
import type { Database } from "@/integrations/supabase/types";

export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"] & {
  profiles?: { full_name: string | null } | null;
};

interface Props {
  rows: TransactionRow[];
  showRep?: boolean;
  emptyLabel?: string;
}

export function TransactionsTable({ rows, showRep = false, emptyLabel }: Props) {
  const { t, lang } = useI18n();

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
            <th className="px-6 py-4 font-semibold text-end">{t("tx.status")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="group hover:bg-accent/40 transition-colors">
              <td className="px-6 py-4 text-sm tabular text-primary font-medium">#{r.file_number}</td>
              {showRep && (
                <td className="px-4 py-4 text-sm text-foreground">{r.profiles?.full_name ?? "—"}</td>
              )}
              <td className="px-4 py-4 text-sm tabular text-foreground">
                {formatCurrency(Number(r.amount), lang)} {t("common.currency")}
              </td>
              <td className="px-4 py-4 text-sm tabular text-muted-foreground">{formatDate(r.transaction_date, lang)}</td>
              <td className="px-6 py-4 text-end">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
