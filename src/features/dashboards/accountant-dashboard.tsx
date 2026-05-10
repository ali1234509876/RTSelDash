import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { computeMetrics, filterByPeriod, monthRange } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { TransactionsTable } from "@/components/transactions-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AccountantDashboard() {
  const { t, lang } = useI18n();
  const { data } = useTransactions({ scope: "all" });
  const period = useMemo(() => monthRange(), []);
  const monthRows = useMemo(() => filterByPeriod(data, period), [data, period]);
  const metrics = useMemo(() => computeMetrics(monthRows), [monthRows]);

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-light text-foreground">{t("acc.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("acc.subtitle")}</p>
        </div>
        <Link to="/entry">
          <Button>
            <Plus className="size-4 me-2" />
            {t("tx.add")}
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label={t("kpi.totalAchievement")}
          value={`${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`}
          accent="success"
        />
        <KpiCard label={t("kpi.completedFiles")} value={String(metrics.completedFiles)} accent="primary" />
        <KpiCard label={t("kpi.pendingFiles")} value={String(metrics.pendingFiles)} accent="warning" />
        <KpiCard
          label={t("kpi.avgFileValue")}
          value={`${formatCurrency(metrics.avgFileValue, lang)}`}
          accent="neutral"
        />
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-border">
          <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">{t("tx.all")}</div>
        </div>
        <TransactionsTable rows={data} showRep />
      </div>
    </div>
  );
}
