import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { computeMetrics, efficiencyRatio, filterByPeriod, monthRange } from "@/lib/metrics";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
import { useProfilesWithRoles } from "@/hooks/use-profiles";
import { KpiCard } from "@/components/kpi-card";
import { RadialProgress } from "@/components/radial-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepRow {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
}

interface Props {
  /** When provided, locks the view to this department (used by dept_head). */
  fixedDepartmentId?: string | null;
  /** When true, shows the department filter dropdown (used by CEO). */
  showDepartmentFilter?: boolean;
  title?: string;
  subtitle?: string;
}

export function ManagerDashboard({
  fixedDepartmentId,
  showDepartmentFilter = false,
  title,
  subtitle,
}: Props = {}) {
  const { t, lang } = useI18n();
  const { data: allTxs } = useTransactions({ scope: "all" });
  const { data: departments } = useDepartments();
  const { data: profiles } = useProfilesWithRoles();
  const [filterDept, setFilterDept] = useState<string>("__all__");

  // KPIs compare against monthly_target, so scope transactions to current month.
  const period = useMemo(() => monthRange(), []);
  const txs = useMemo(() => filterByPeriod(allTxs, period), [allTxs, period]);
  const reps = useMemo<RepRow[]>(
    () =>
      profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        monthly_target: Number(p.monthly_target),
        department_id: p.department_id ?? null,
      })),
    [profiles],
  );

  // Resolve the active department filter:
  const activeDept =
    fixedDepartmentId !== undefined
      ? fixedDepartmentId
      : filterDept === "__all__"
        ? null
        : filterDept;

  const filteredReps = useMemo(
    () => (activeDept ? reps.filter((r) => r.department_id === activeDept) : reps),
    [reps, activeDept],
  );
  const filteredRepIds = useMemo(() => new Set(filteredReps.map((r) => r.id)), [filteredReps]);
  const filteredTxs = useMemo(
    () => (activeDept ? txs.filter((tx) => tx.sales_rep_id && filteredRepIds.has(tx.sales_rep_id)) : txs),
    [txs, activeDept, filteredRepIds],
  );

  const overall = useMemo(() => computeMetrics(filteredTxs), [filteredTxs]);
  const totalTarget = filteredReps.reduce((s, r) => s + r.monthly_target, 0);
  const teamRatio = efficiencyRatio(overall.totalAchievement, totalTarget);

  const repBreakdown = useMemo(() => {
    return filteredReps
      .map((rep) => {
        const repTxs = filteredTxs.filter((tt) => tt.sales_rep_id === rep.id);
        const m = computeMetrics(repTxs);
        return {
          ...rep,
          achievement: m.totalAchievement,
          ratio: efficiencyRatio(m.totalAchievement, rep.monthly_target),
          completed: m.completedFiles,
        };
      })
      .sort((a, b) => b.achievement - a.achievement);
  }, [filteredReps, filteredTxs]);

  // Department breakdown (CEO only, when looking at "All")
  const deptBreakdown = useMemo(() => {
    if (!showDepartmentFilter || activeDept) return [];
    return departments
      .map((d) => {
        const dReps = reps.filter((r) => r.department_id === d.id);
        const dRepIds = new Set(dReps.map((r) => r.id));
        const dTxs = txs.filter((tx) => tx.sales_rep_id && dRepIds.has(tx.sales_rep_id));
        const m = computeMetrics(dTxs);
        const target = dReps.reduce((s, r) => s + r.monthly_target, 0);
        return {
          id: d.id,
          name: departmentLabel(d, lang),
          headcount: dReps.length,
          achievement: m.totalAchievement,
          target,
          ratio: efficiencyRatio(m.totalAchievement, target),
        };
      })
      .sort((a, b) => b.achievement - a.achievement);
  }, [departments, reps, txs, lang, showDepartmentFilter, activeDept]);

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-light text-foreground">{title ?? t("manager.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle ?? t("manager.subtitle")}</p>
        </div>
        {showDepartmentFilter && (
          <div className="min-w-[220px]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              {t("dept.filter")}
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("dept.all")}</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {departmentLabel(d, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
        <KpiCard label={t("kpi.activeReps")} value={String(filteredReps.length)} accent="neutral" />
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
              <Link
                key={rep.id}
                to="/team/$id"
                params={{ id: rep.id }}
                className="px-8 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors"
              >
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
              </Link>
            ))}
            {repBreakdown.length === 0 && (
              <div className="px-8 py-10 text-center text-sm text-muted-foreground">{t("tx.empty")}</div>
            )}
          </div>
        </div>
      </div>

      {showDepartmentFilter && !activeDept && deptBreakdown.length > 0 && (
        <div className="mt-8 glass-card rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">
              {t("ceo.deptBreakdown")}
            </div>
          </div>
          <div className="divide-y divide-border">
            {deptBreakdown.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setFilterDept(d.id)}
                className="w-full px-8 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors text-start"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground tabular mt-0.5">
                    {d.headcount} · {formatCurrency(d.achievement, lang)} / {formatCurrency(d.target, lang)}{" "}
                    {t("common.currency")}
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-1.5 bg-border-strong rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, d.ratio)}%`,
                        background: "var(--gradient-primary)",
                      }}
                    />
                  </div>
                </div>
                <div className="w-14 text-end text-sm tabular font-medium text-foreground">
                  {d.ratio.toFixed(0)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
