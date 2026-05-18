import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
import { useProfilesWithRoles } from "@/hooks/use-profiles";
import { useAuth, type Role } from "@/lib/auth-context";
import {
  computeMetrics,
  efficiencyRatio,
  filterByPeriod,
  monthRange,
  pacingRatio,
} from "@/lib/metrics";
import { currentPeriod } from "@/lib/period";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile, setMonthlyTarget } from "@/lib/supabase-data";
import { errorMessage } from "@/lib/errors";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

interface RepRow {
  id: string;
  full_name: string | null;
  monthly_target: number;
  department_id: string | null;
  roles: Role[];
}

type SortKey = "attainment" | "achievement" | "name";

function TeamPage() {
  return (
    <ProtectedShell allow={["ceo", "dept_head"]}>
      <Inner />
    </ProtectedShell>
  );
}

/** Same semantics as team.$id.tsx — keep in sync. */
function pacingState(ratio: number): "ahead" | "behind" | "onTrack" {
  if (ratio === 0) return "onTrack";
  if (ratio >= 1.05) return "ahead";
  if (ratio <= 0.95) return "behind";
  return "onTrack";
}

interface RowComputed extends RepRow {
  achievement: number;
  attainment: number;
  pacing: number;
  pendingFiles: number;
  cancelledFiles: number;
}

function Inner() {
  const { t, lang } = useI18n();
  const { primaryRole, managedDepartmentId } = useAuth();
  const { data: allTxs, loading: txLoading } = useTransactions({ scope: "all" });
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const period = useMemo(() => monthRange(), []);
  const periodKey = useMemo(() => currentPeriod(), []);
  const txs = useMemo(() => filterByPeriod(allTxs, period), [allTxs, period]);
  const { data: profiles, loading: profilesLoading, reload: reloadProfiles } = useProfilesWithRoles();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<SortKey>("attainment");

  // U4: dept_head reassign would always fail RLS WITH CHECK (cross-dept move
  // is structurally blocked). Only the CEO sees the dropdown.
  const canAssignDept = primaryRole === "ceo";

  const reps = useMemo<RepRow[]>(
    () =>
      profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        monthly_target: Number(p.monthly_target),
        department_id: p.department_id ?? null,
        roles: p.roles,
      })),
    [profiles],
  );

  // U1: dept_head only sees their managed dept's reps. Belt-and-suspenders
  // alongside the new RLS — keeps the roster clean even if a profile leaks
  // through (e.g. a peer in a different dept).
  const visibleReps = useMemo(() => {
    if (primaryRole === "dept_head") {
      return managedDepartmentId
        ? reps.filter((r) => r.department_id === managedDepartmentId)
        : [];
    }
    return reps;
  }, [reps, primaryRole, managedDepartmentId]);

  const computed = useMemo<RowComputed[]>(
    () =>
      visibleReps.map((rep) => {
        const repTxs = txs.filter((tx) => tx.sales_rep_id === rep.id);
        const m = computeMetrics(repTxs);
        return {
          ...rep,
          achievement: m.totalAchievement,
          attainment: efficiencyRatio(m.totalAchievement, rep.monthly_target),
          pacing: pacingRatio(m.totalAchievement, rep.monthly_target, periodKey),
          pendingFiles: m.pendingFiles,
          cancelledFiles: m.cancelledFiles,
        };
      }),
    [visibleReps, txs, periodKey],
  );

  const sorted = useMemo<RowComputed[]>(() => {
    const arr = [...computed];
    if (sortKey === "attainment") arr.sort((a, b) => b.attainment - a.attainment);
    else if (sortKey === "achievement") arr.sort((a, b) => b.achievement - a.achievement);
    else arr.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
    return arr;
  }, [computed, sortKey]);

  const saveTarget = async (id: string) => {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0) {
      toast.error(t("common.error"));
      return;
    }
    try {
      await setMonthlyTarget(id, value);
      toast.success(t("manager.targetSaved"));
      setDrafts((d) => ({ ...d, [id]: "" }));
      reloadProfiles();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team] saveTarget failed:", err);
    }
  };

  const updateDepartment = async (id: string, deptId: string) => {
    const value = deptId === "__none__" ? null : deptId;
    try {
      await updateProfile(id, { department_id: value });
      reloadProfiles();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team] updateDepartment failed:", err);
    }
  };

  const deptName = useMemo(() => {
    const m = new Map<string, string>();
    departments.forEach((d) => m.set(d.id, departmentLabel(d, lang)));
    return m;
  }, [departments, lang]);

  const scopeLabel =
    primaryRole === "dept_head"
      ? managedDepartmentId
        ? (deptName.get(managedDepartmentId) ?? "—")
        : t("auth.noManagedDept")
      : t("manager.scopeOrg");

  // U7: dept_head with no managed department gets an explicit empty state
  // instead of a confusing zero-row table.
  if (primaryRole === "dept_head" && !managedDepartmentId) {
    return (
      <div className="px-10 py-16 max-w-2xl mx-auto text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          {t("nav.team")}
        </div>
        <h1 className="text-2xl font-light text-foreground">{t("depthead.noDeptTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-3">{t("depthead.noDeptHint")}</p>
      </div>
    );
  }

  const isLoading = profilesLoading || txLoading || departmentsLoading;

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light text-foreground">{t("nav.team")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("manager.subtitle")}</p>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="glass-card px-4 py-2 rounded-lg text-xs font-medium">
            <span className="text-muted-foreground">{t("manager.scope")}: </span>
            <span className="text-foreground">{scopeLabel}</span>
          </div>
          <div className="min-w-[180px]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              {t("manager.sortBy")}
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="attainment">{t("manager.sort.attainment")}</option>
              <option value="achievement">{t("manager.sort.achievement")}</option>
              <option value="name">{t("manager.sort.name")}</option>
            </select>
          </div>
        </div>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="px-6 py-4 font-semibold text-start">{t("tx.salesRep")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("dept.label")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.totalAchievement")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.monthlyTarget")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.efficiencyRatio")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.pacing")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("manager.pending")}</th>
              <th className="px-6 py-4 font-semibold text-end">{t("manager.setTarget")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!isLoading && sorted.map((rep) => {
              const pState = pacingState(rep.pacing);
              const pacingClass =
                pState === "ahead"
                  ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : pState === "behind"
                    ? "border-destructive/40 text-destructive bg-destructive/10"
                    : "border-border text-muted-foreground bg-muted/40";
              const pacingText =
                rep.monthly_target > 0
                  ? pState === "ahead"
                    ? t("kpi.pacing.ahead")
                    : pState === "behind"
                      ? t("kpi.pacing.behind")
                      : t("kpi.pacing.onTrack")
                  : "—";
              return (
                <tr key={rep.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to="/team/$id"
                      params={{ id: rep.id }}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {rep.full_name ?? "—"}
                    </Link>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {rep.roles.map((r) => t(`role.${r}` as const)).join(" · ")}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {canAssignDept ? (
                      <select
                        value={rep.department_id ?? "__none__"}
                        onChange={(e) => updateDepartment(rep.id, e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="__none__">{t("dept.none")}</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {departmentLabel(d, lang)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {rep.department_id ? deptName.get(rep.department_id) : t("dept.none")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-foreground">
                    {formatCurrency(rep.achievement, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-foreground">
                    {formatCurrency(rep.monthly_target, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-primary">
                    {rep.attainment.toFixed(1)}%
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${pacingClass}`}
                    >
                      {pacingText}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-muted-foreground">
                    {rep.pendingFiles}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32 h-9"
                        placeholder={String(rep.monthly_target)}
                        value={drafts[rep.id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [rep.id]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => saveTarget(rep.id)} disabled={!drafts[rep.id]}>
                        {t("tx.save")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("tx.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
