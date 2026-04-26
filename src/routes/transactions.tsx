import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/lib/auth-context";
import { TransactionsTable } from "@/components/transactions-table";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <ProtectedShell>
      <Inner />
    </ProtectedShell>
  );
}

function Inner() {
  const { t } = useI18n();
  const { primaryRole } = useAuth();
  const scope = primaryRole === "sales_rep" ? "self" : "all";
  const { data } = useTransactions({ scope });

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("nav.transactions")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("acc.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        <TransactionsTable rows={data} showRep={scope === "all"} />
      </div>
    </div>
  );
}
