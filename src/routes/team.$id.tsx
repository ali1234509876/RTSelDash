import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Phone, Calendar, Clock, Power, Building2 } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
import { useProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/lib/auth-context";
import {
  computeMetrics,
  efficiencyRatio,
  filterByPeriod,
  monthRangeOf,
  monthlyTrend,
  pacingRatio,
} from "@/lib/metrics";
import {
  currentPeriod,
  lastNPeriods,
  monthLabel,
  periodToDate,
} from "@/lib/period";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/kpi-card";
import { RadialProgress } from "@/components/radial-progress";
import { TransactionsTable } from "@/components/transactions-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMonthlyTargetsHistory,
  setMonthlyTarget,
  updateProfile,
} from "@/lib/supabase-data";
import { errorMessage } from "@/lib/errors";

export const Route = createFileRoute("/team/$id")({
  component: EmployeeDetailPage,
});

function EmployeeDetailPage() {
  return (
    <ProtectedShell allow={["ceo", "dept_head"]}>
      <Inner />
    </ProtectedShell>
  );
}

/** Compose tenure ("2y 3m") from a hire date string and now. */
function tenureLabel(
  hiredAt: string | null,
  yearsLabel: string,
  monthsLabel: string,
): string {
  if (!hiredAt) return "—";
  const start = new Date(hiredAt);
  if (Number.isNaN(start.getTime())) return "—";
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}${monthsLabel}`;
  if (m === 0) return `${y}${yearsLabel}`;
  return `${y}${yearsLabel} ${m}${monthsLabel}`;
}

/** "ahead" if pacing > 1.05, "behind" if < 0.95, else "onTrack". */
function pacingState(ratio: number): "ahead" | "behind" | "onTrack" {
  if (ratio === 0) return "onTrack";
  if (ratio >= 1.05) return "ahead";
  if (ratio <= 0.95) return "behind";
  return "onTrack";
}

function Inner() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { primaryRole } = useAuth();
  const isCeo = primaryRole === "ceo";

  // Period picker — defaults to current month, persisted in component state.
  const [period, setPeriod] = useState<string>(() => currentPeriod());
  // Period as YYYY-MM for the <input type="month"> control.
  const periodMonth = period.slice(0, 7);

  const { data: txs } = useTransactions({ scope: "all" });
  const { data: departments } = useDepartments();
  const { data: profile, loading, reload: reloadProfile } = useProfile(id, period);

  const empTxs = useMemo(() => txs.filter((tx) => tx.sales_rep_id === id), [txs, id]);
  const range = useMemo(() => monthRangeOf(period), [period]);
  const empMonthTxs = useMemo(() => filterByPeriod(empTxs, range), [empTxs, range]);
  const metrics = useMemo(() => computeMetrics(empMonthTxs), [empMonthTxs]);

  const target = profile?.monthly_target ?? 0;
  const ratio = efficiencyRatio(metrics.totalAchievement, target);
  const variance = metrics.totalAchievement - target;
  const pacing = pacingRatio(metrics.totalAchievement, target, period);
  const dept = departments.find((d) => d.id === profile?.department_id);

  // 6-month trend: targets fetched separately because they live in monthly_targets.
  const trendPeriods = useMemo(() => lastNPeriods(6, periodToDate(period)), [period]);
  const trendKey = useMemo(() => trendPeriods.join(","), [trendPeriods]);
  const { data: targetsHistory = {} } = useQuery({
    queryKey: ["monthly_targets_history", id, trendKey],
    queryFn: () => getMonthlyTargetsHistory(id, trendPeriods),
    enabled: !!id,
  });
  const trend = useMemo(
    () => monthlyTrend(empTxs, trendPeriods, targetsHistory),
    [empTxs, trendPeriods, targetsHistory],
  );
  const trendData = useMemo(
    () =>
      trend.map((p) => ({
        period: p.period,
        label: monthLabel(p.period, lang),
        achievement: p.achievement,
        target: p.target,
      })),
    [trend, lang],
  );

  // Inline target editor.
  const [targetDraft, setTargetDraft] = useState<string>("");

  const saveTarget = async () => {
    const value = Number(targetDraft);
    if (Number.isNaN(value) || value < 0) {
      toast.error(t("common.error"));
      return;
    }
    try {
      await setMonthlyTarget(id, value, period);
      toast.success(t("emp.detail.targetSaved"));
      setTargetDraft("");
      reloadProfile();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team.$id] saveTarget failed:", err);
    }
  };

  const updateDepartment = async (newId: string) => {
    const value = newId === "__none__" ? null : newId;
    try {
      await updateProfile(id, { department_id: value });
      reloadProfile();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team.$id] updateDepartment failed:", err);
    }
  };

  const toggleActive = async () => {
    if (!profile) return;
    try {
      await updateProfile(id, { is_active: !profile.is_active });
      reloadProfile();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team.$id] toggleActive failed:", err);
    }
  };

  if (loading) {
    return <div className="px-10 py-8 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!profile) {
    return (
      <div className="px-10 py-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/team" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("emp.detail.back")}
        </button>
        <div className="mt-10 text-center text-muted-foreground">{t("emp.detail.notFound")}</div>
      </div>
    );
  }

  const pState = pacingState(pacing);
  const pacingLabel =
    pState === "ahead"
      ? t("kpi.pacing.ahead")
      : pState === "behind"
        ? t("kpi.pacing.behind")
        : t("kpi.pacing.onTrack");

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <button
        type="button"
        onClick={() => navigate({ to: "/team" })}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        {t("emp.detail.back")}
      </button>

      <header className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-accent border border-border-strong flex items-center justify-center text-base font-semibold text-foreground">
            {(profile.full_name ?? "·").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              {t("emp.detail.title")}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  profile.is_active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-muted/40 text-muted-foreground border border-border"
                }`}
              >
                <Power className="size-2.5" />
                {profile.is_active ? t("emp.detail.active") : t("emp.detail.inactive")}
              </span>
            </div>
            <h1 className="text-2xl font-light text-foreground mt-0.5">{profile.full_name ?? "—"}</h1>
            <div className="text-xs text-muted-foreground mt-1">
              {dept ? departmentLabel(dept, lang) : t("dept.none")}
            </div>
          </div>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="min-w-[160px]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              {t("emp.detail.period")}
            </div>
            <Input
              type="month"
              value={periodMonth}
              onChange={(e) => {
                const v = e.target.value;
                if (v) setPeriod(`${v}-01`);
              }}
              className="h-9"
            />
          </div>
          <div className="min-w-[200px]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              {t("dept.assign")}
            </div>
            <select
              value={profile.department_id ?? "__none__"}
              onChange={(e) => updateDepartment(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="__none__">{t("dept.none")}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {departmentLabel(d, lang)}
                </option>
              ))}
            </select>
          </div>
          {isCeo && (
            <Button
              size="sm"
              variant={profile.is_active ? "outline" : "default"}
              onClick={toggleActive}
              className="h-9"
            >
              <Power className="size-3.5 me-2" />
              {profile.is_active ? t("emp.detail.deactivate") : t("emp.detail.activate")}
            </Button>
          )}
        </div>
      </header>

      {/* Metadata strip */}
      <div className="glass-card rounded-2xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <MetaItem
          icon={<Phone className="size-3.5" />}
          label={t("emp.detail.phone")}
          value={profile.phone ?? t("emp.detail.notSet")}
          dim={!profile.phone}
        />
        <MetaItem
          icon={<Calendar className="size-3.5" />}
          label={t("emp.detail.hired")}
          value={profile.hired_at ? formatDate(profile.hired_at, lang) : t("emp.detail.notSet")}
          dim={!profile.hired_at}
        />
        <MetaItem
          icon={<Clock className="size-3.5" />}
          label={t("emp.detail.tenure")}
          value={tenureLabel(
            profile.hired_at,
            t("emp.detail.tenureYears"),
            t("emp.detail.tenureMonths"),
          )}
          dim={!profile.hired_at}
        />
        <MetaItem
          icon={<Building2 className="size-3.5" />}
          label={t("dept.label")}
          value={dept ? departmentLabel(dept, lang) : t("dept.none")}
          dim={!dept}
        />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label={t("kpi.totalAchievement")}
          value={`${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`}
          accent="success"
        />
        <KpiCard
          label={t("kpi.monthlyTarget")}
          labelSecondary={monthLabel(period, lang)}
          value={
            target > 0
              ? `${formatCurrency(target, lang)} ${t("common.currency")}`
              : t("emp.detail.noTarget")
          }
          accent="primary"
          hint={
            <span className={variance >= 0 ? "text-success" : "text-destructive"}>
              {variance >= 0 ? "+" : ""}
              {formatCurrency(variance, lang)} {t("common.currency")}
            </span>
          }
        />
        <KpiCard
          label={t("kpi.efficiencyRatio")}
          value={`${ratio.toFixed(1)}%`}
          accent="primary"
          hint={
            target > 0 ? (
              <span
                className={
                  pState === "ahead"
                    ? "text-success"
                    : pState === "behind"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }
              >
                {pacingLabel} · {pacing.toFixed(2)}×
              </span>
            ) : null
          }
        />
        <KpiCard
          label={t("kpi.closeRate")}
          value={`${metrics.closeRate.toFixed(1)}%`}
          accent={metrics.cancelledFiles > 0 ? "warning" : "neutral"}
          hint={
            metrics.cancelledFiles > 0 ? (
              <span className="text-warning">
                {metrics.cancelledFiles} {t("kpi.cancelledFiles")} · {formatCurrency(metrics.cancelledValue, lang)}{" "}
                {t("common.currency")}
              </span>
            ) : null
          }
        />
      </div>

      {/* Inline target editor */}
      <div className="glass-card rounded-2xl p-5 mb-8 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {t("emp.detail.editTarget")} · {monthLabel(period, lang)}
          </div>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder={String(target)}
            value={targetDraft}
            onChange={(e) => setTargetDraft(e.target.value)}
            className="h-9"
          />
        </div>
        <Button onClick={saveTarget} disabled={!targetDraft}>
          {t("tx.save")}
        </Button>
      </div>

      {/* Radial + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8">
            {t("kpi.progressToTarget")}
          </div>
          <RadialProgress value={ratio} size={220} />
          <div className="mt-8 w-full grid grid-cols-3 gap-3">
            <CountChip label={t("kpi.completedFiles")} value={metrics.completedFiles} accent="success" />
            <CountChip label={t("kpi.pendingFiles")} value={metrics.pendingFiles} accent="primary" />
            <CountChip
              label={t("kpi.cancelledFiles")}
              value={metrics.cancelledFiles}
              accent={metrics.cancelledFiles > 0 ? "warning" : "neutral"}
            />
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">
              {t("emp.detail.recent")}
            </div>
          </div>
          <TransactionsTable rows={empMonthTxs.slice(0, 12)} />
        </div>
      </div>

      {/* 6-month trend chart */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex items-baseline justify-between">
          <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">
            {t("emp.detail.trend")}
          </div>
          <div className="text-xs text-muted-foreground">{t("emp.detail.trendSubtitle")}</div>
        </div>
        <div className="p-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCurrency(v, lang)}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `${formatCurrency(value, lang)} ${t("common.currency")}`,
                  name === "achievement" ? t("kpi.totalAchievement") : t("kpi.monthlyTarget"),
                ]}
              />
              <Bar dataKey="achievement" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface MetaItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  dim?: boolean;
}

function MetaItem({ icon, label, value, dim }: MetaItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`text-sm mt-0.5 truncate ${dim ? "text-muted-foreground" : "text-foreground"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

interface CountChipProps {
  label: string;
  value: number;
  accent: "primary" | "success" | "warning" | "neutral";
}

function CountChip({ label, value, accent }: CountChipProps) {
  const accentClass =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : accent === "primary"
          ? "text-primary"
          : "text-muted-foreground";
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-lg font-light tabular mt-1 ${accentClass}`}>{value}</div>
    </div>
  );
}
