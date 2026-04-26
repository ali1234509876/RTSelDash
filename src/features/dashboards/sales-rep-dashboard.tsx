import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { computeMetrics, efficiencyRatio } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { RadialProgress } from "@/components/radial-progress";
import { TransactionsTable } from "@/components/transactions-table";

export function SalesRepDashboard() {
  const { profile } = useAuth();
  const { t, lang } = useI18n();
  const { data, loading } = useTransactions({ scope: "self" });

  const metrics = useMemo(() => computeMetrics(data), [data]);
  const target = profile?.monthly_target ?? 0;
  const ratio = efficiencyRatio(metrics.totalAchievement, target);
  const variance = metrics.totalAchievement - target;

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-light text-foreground">
            {t("rep.welcome")} <span className="text-gradient-primary font-semibold">{profile?.full_name ?? ""}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("rep.subtitle")}</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg text-xs font-medium">
          <span className="text-success">●</span>{" "}
          <span className="text-muted-foreground">{t("kpi.monthlyTarget")}: </span>
          <span className="tabular text-foreground">
            {formatCurrency(target, lang)} {t("common.currency")}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label={t("kpi.totalAchievement")}
          value={`${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`}
          accent="success"
          hint={loading ? "…" : `${metrics.completedFiles} ${t("kpi.completedFiles")}`}
        />
        <KpiCard
          label={t("kpi.targetVariance")}
          value={`${variance >= 0 ? "+" : ""}${formatCurrency(variance, lang)}`}
          accent={variance >= 0 ? "success" : "destructive"}
        />
        <KpiCard
          label={t("kpi.efficiencyRatio")}
          value={`${ratio.toFixed(1)}%`}
          accent="primary"
        />
        <KpiCard
          label={t("kpi.avgFileValue")}
          value={`${formatCurrency(metrics.avgFileValue, lang)}`}
          accent="neutral"
          hint={`${metrics.uniqueFiles} ${t("kpi.completedFiles")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, oklch(from var(--primary) l c h / 0.08), transparent)" }}
          />
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8 relative">
            {t("kpi.progressToTarget")}
          </div>
          <div className="relative">
            <RadialProgress value={ratio} size={220} />
          </div>
          <div className="mt-8 w-full grid grid-cols-2 gap-4 relative">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("kpi.completedFiles")}</div>
              <div className="text-lg font-light tabular text-foreground mt-1">{metrics.completedFiles}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("kpi.pendingFiles")}</div>
              <div className="text-lg font-light tabular text-foreground mt-1">{metrics.pendingFiles}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border flex justify-between items-center">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">{t("tx.recent")}</div>
          </div>
          <TransactionsTable rows={data.slice(0, 8)} />
        </div>
      </div>
    </div>
  );
}
