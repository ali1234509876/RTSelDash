import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/use-transactions";
import { computeMetrics, efficiencyRatio } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { RadialProgress } from "@/components/radial-progress";

interface RepRow {
  id: string;
  full_name: string | null;
  monthly_target: number;
}

export function ManagerDashboard() {
  const { t, lang } = useI18n();
  const { data: txs } = useTransactions({ scope: "all" });
  const [reps, setReps] = useState<RepRow[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, monthly_target")
      .then(({ data }) => {
        setReps(
          (data ?? []).map((p) => ({
            id: p.id,
            full_name: p.full_name,
            monthly_target: Number(p.monthly_target),
          })),
        );
      });
  }, []);

  const overall = useMemo(() => computeMetrics(txs), [txs]);
  const totalTarget = reps.reduce((s, r) => s + r.monthly_target, 0);
  const teamRatio = efficiencyRatio(overall.totalAchievement, totalTarget);

  const repBreakdown = useMemo(() => {
    return reps
      .map((rep) => {
        const repTxs = txs.filter((t) => t.sales_rep_id === rep.id);
        const m = computeMetrics(repTxs);
        return {
          ...rep,
          achievement: m.totalAchievement,
          ratio: efficiencyRatio(m.totalAchievement, rep.monthly_target),
          completed: m.completedFiles,
        };
      })
      .sort((a, b) => b.achievement - a.achievement);
  }, [reps, txs]);

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-10">
        <h1 className="text-2xl font-light text-foreground">{t("manager.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("manager.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label={t("kpi.teamAchievement")}
          value={`${formatCurrency(overall.totalAchievement, lang)} ${t("common.currency")}`}
          accent="success"
        />
        <KpiCard
          label={t("kpi.monthlyTarget")}
          value={`${formatCurrency(totalTarget, lang)} ${t("common.currency")}`}
          accent="primary"
        />
        <KpiCard label={t("kpi.efficiencyRatio")} value={`${teamRatio.toFixed(1)}%`} accent="primary" />
        <KpiCard label={t("kpi.activeReps")} value={String(reps.length)} accent="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8">
            {t("kpi.progressToTarget")}
          </div>
          <RadialProgress value={teamRatio} size={220} />
          <div className="mt-8 w-full grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("kpi.completedFiles")}
              </div>
              <div className="text-lg font-light tabular mt-1">{overall.completedFiles}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("kpi.avgFileValue")}
              </div>
              <div className="text-lg font-light tabular mt-1">{formatCurrency(overall.avgFileValue, lang)}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">
              {t("manager.repBreakdown")}
            </div>
          </div>
          <div className="divide-y divide-border">
            {repBreakdown.map((rep) => (
              <div key={rep.id} className="px-8 py-5 flex items-center gap-6">
                <div className="size-10 rounded-full bg-accent border border-border-strong flex items-center justify-center text-xs font-semibold">
                  {(rep.full_name ?? "·").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{rep.full_name ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground tabular mt-0.5">
                    {formatCurrency(rep.achievement, lang)} / {formatCurrency(rep.monthly_target, lang)}{" "}
                    {t("common.currency")}
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-1.5 bg-border-strong rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, rep.ratio)}%`,
                        background: "var(--gradient-primary)",
                      }}
                    />
                  </div>
                </div>
                <div className="w-14 text-end text-sm tabular font-medium text-foreground">
                  {rep.ratio.toFixed(0)}%
                </div>
              </div>
            ))}
            {repBreakdown.length === 0 && (
              <div className="px-8 py-10 text-center text-sm text-muted-foreground">{t("tx.empty")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
