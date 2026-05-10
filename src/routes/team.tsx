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
import { computeMetrics, efficiencyRatio, filterByPeriod, monthRange } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/supabase-data";
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

function TeamPage() {
  return (
    <ProtectedShell allow={["ceo", "dept_head"]}>
      <Inner />
    </ProtectedShell>
  );
}

function Inner() {
  const { t, lang } = useI18n();
  const { primaryRole } = useAuth();
  const { data: allTxs, loading: txLoading } = useTransactions({ scope: "all" });
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const period = useMemo(() => monthRange(), []);
  const txs = useMemo(() => filterByPeriod(allTxs, period), [allTxs, period]);
  const { data: profiles, loading: profilesLoading, reload: reloadProfiles } = useProfilesWithRoles();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const canAssignDept = primaryRole === "ceo" || primaryRole === "dept_head";

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

  const saveTarget = async (id: string) => {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0) {
      toast.error(t("common.error"));
      return;
    }
    try {
      await updateProfile(id, { monthly_target: value });
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

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("nav.team")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("manager.subtitle")}</p>
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
              <th className="px-6 py-4 font-semibold text-end">{t("manager.setTarget")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(profilesLoading || txLoading || departmentsLoading) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!profilesLoading && !txLoading && !departmentsLoading && reps.map((rep) => {
              const repTxs = txs.filter((tx) => tx.sales_rep_id === rep.id);
              const m = computeMetrics(repTxs);
              const ratio = efficiencyRatio(m.totalAchievement, rep.monthly_target);
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
                    {formatCurrency(m.totalAchievement, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-foreground">
                    {formatCurrency(rep.monthly_target, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-primary">{ratio.toFixed(1)}%</td>
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
            {!profilesLoading && !txLoading && !departmentsLoading && reps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
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
