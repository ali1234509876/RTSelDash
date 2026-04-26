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
  const { primaryRole } = useAuth();
  const { t } = useI18n();
  if (primaryRole === "manager") return <ManagerDashboard />;
  if (primaryRole === "accountant") return <AccountantDashboard />;
  if (primaryRole === "sales_rep") return <SalesRepDashboard />;
  return <div className="p-10 text-muted-foreground">{t("common.loading")}</div>;
}
