import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
import { computeMetrics, efficiencyRatio } from "@/lib/metrics";
import { KpiCard } from "@/components/kpi-card";
import { RadialProgress } from "@/components/radial-progress";
import { TransactionsTable } from "@/components/transactions-table";
import { getProfile, updateProfile } from "@/lib/supabase-data";

export const Route = createFileRoute("/team/$id")({
  component: EmployeeDetailPage,
});

interface EmployeeProfile {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
}

function EmployeeDetailPage() {
  return (
    <ProtectedShell allow={["ceo", "dept_head", "manager"]}>
      <Inner />
    </ProtectedShell>
  );
}

function Inner() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { data: txs } = useTransactions({ scope: "all" });
  const { data: departments } = useDepartments();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getProfile(id);
      setProfile(
        data
          ? {
              id: data.id,
              full_name: data.full_name,
              monthly_target: Number(data.monthly_target),
              department_id: data.department_id ?? null,
            }
          : null,
      );
      setLoading(false);
    };
    load();
  }, [id]);

  const empTxs = useMemo(() => txs.filter((tx) => tx.sales_rep_id === id), [txs, id]);
  const metrics = useMemo(() => computeMetrics(empTxs), [empTxs]);
  const target = profile?.monthly_target ?? 0;
  const ratio = efficiencyRatio(metrics.totalAchievement, target);
  const variance = metrics.totalAchievement - target;
  const dept = departments.find((d) => d.id === profile?.department_id);

  if (loading) {
    return <div className="px-10 py-8 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!profile) {
    return (
      <div className="px-10 py-8">
        <Link to="/team" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t("emp.detail.back")}
        </Link>
        <div className="mt-10 text-center text-muted-foreground">{t("emp.detail.notFound")}</div>
      </div>
    );
  }

  const updateDepartment = async (newId: string) => {
    const value = newId === "__none__" ? null : newId;
    await updateProfile(id, { department_id: value });
    setProfile((p) => (p ? { ...p, department_id: value } : p));
  };

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

      <header className="mb-10 flex items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-accent border border-border-strong flex items-center justify-center text-base font-semibold text-foreground">
            {(profile.full_name ?? "·").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("emp.detail.title")}
            </div>
            <h1 className="text-2xl font-light text-foreground mt-0.5">{profile.full_name ?? "—"}</h1>
            <div className="text-xs text-muted-foreground mt-1">
              {dept ? departmentLabel(dept, lang) : t("dept.none")}
            </div>
          </div>
        </div>

        <div className="min-w-[220px]">
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
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label={t("kpi.totalAchievement")}
          value={`${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`}
          accent="success"
        />
        <KpiCard
          label={t("kpi.monthlyTarget")}
          value={`${formatCurrency(target, lang)} ${t("common.currency")}`}
          accent="primary"
        />
        <KpiCard
          label={t("kpi.targetVariance")}
          value={`${variance >= 0 ? "+" : ""}${formatCurrency(variance, lang)}`}
          accent={variance >= 0 ? "success" : "destructive"}
        />
        <KpiCard label={t("kpi.efficiencyRatio")} value={`${ratio.toFixed(1)}%`} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8">
            {t("kpi.progressToTarget")}
          </div>
          <RadialProgress value={ratio} size={220} />
          <div className="mt-8 w-full grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("kpi.completedFiles")}
              </div>
              <div className="text-lg font-light tabular mt-1">{metrics.completedFiles}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("kpi.pendingFiles")}
              </div>
              <div className="text-lg font-light tabular mt-1">{metrics.pendingFiles}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-bold">
              {t("emp.detail.recent")}
            </div>
          </div>
          <TransactionsTable rows={empTxs.slice(0, 12)} />
        </div>
      </div>
    </div>
  );
}
