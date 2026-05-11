import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/protected-shell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { ManagerDashboard } from "@/features/dashboards/manager-dashboard";
import { AccountantDashboard } from "@/features/dashboards/accountant-dashboard";
import { SalesRepDashboard } from "@/features/dashboards/sales-rep-dashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ProtectedShell>
      <DashboardRouter />
    </ProtectedShell>
  );
}

function DashboardRouter() {
  const { primaryRole, managedDepartmentId } = useAuth();
  const { t } = useI18n();
  if (primaryRole === "ceo") {
    return <ManagerDashboard showDepartmentFilter title={t("ceo.title")} subtitle={t("ceo.subtitle")} />;
  }
  if (primaryRole === "dept_head") {
    // Scope is the department this user HEADS (departments.head_id = me),
    // not their own profiles.department_id. If they head no department,
    // show an explicit empty state so the CEO can fix it.
    if (!managedDepartmentId) {
      return (
        <div className="px-10 py-16 max-w-2xl mx-auto text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t("depthead.title")}
          </div>
          <h1 className="text-2xl font-light text-foreground">{t("depthead.noDeptTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-3">{t("depthead.noDeptHint")}</p>
        </div>
      );
    }
    return (
      <ManagerDashboard
        fixedDepartmentId={managedDepartmentId}
        title={t("depthead.title")}
        subtitle={t("depthead.subtitle")}
      />
    );
  }
  if (primaryRole === "accountant") return <AccountantDashboard />;
  if (primaryRole === "sales_rep") return <SalesRepDashboard />;
  return <div className="p-10 text-muted-foreground">{t("common.loading")}</div>;
}
