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
  const { primaryRole, profile } = useAuth();
  const { t } = useI18n();
  if (primaryRole === "ceo") {
    return <ManagerDashboard showDepartmentFilter title={t("ceo.title")} subtitle={t("ceo.subtitle")} />;
  }
  if (primaryRole === "dept_head") {
    return (
      <ManagerDashboard
        fixedDepartmentId={profile?.department_id ?? null}
        title={t("depthead.title")}
        subtitle={t("depthead.subtitle")}
      />
    );
  }
  if (primaryRole === "accountant") return <AccountantDashboard />;
  if (primaryRole === "sales_rep") return <SalesRepDashboard />;
  return <div className="p-10 text-muted-foreground">{t("common.loading")}</div>;
}
