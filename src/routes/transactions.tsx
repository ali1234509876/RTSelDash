import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/lib/auth-context";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
import { TransactionsTable } from "@/components/transactions-table";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <ProtectedShell>
      <Inner />
    </ProtectedShell>
  );
}

function Inner() {
  const { t, lang } = useI18n();
  const { primaryRole, managedDepartmentIds } = useAuth();
  const { data: departments } = useDepartments();
  const scope = primaryRole === "sales_rep" ? "self" : "all";
  const { data } = useTransactions({ scope });

  // U7: dept_head with no managed department gets an explicit empty state
  // instead of an empty list that looks like a bug.
  if (primaryRole === "dept_head" && managedDepartmentIds.length === 0) {
    return (
      <div className="px-10 py-16 max-w-2xl mx-auto text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          {t("nav.transactions")}
        </div>
        <h1 className="text-2xl font-light text-foreground">{t("depthead.noDeptTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-3">{t("depthead.noDeptHint")}</p>
      </div>
    );
  }

  // U5: title reflects the actual scope. dept_head sees only their depts'
  // transactions (RLS enforces it) so the page should say so.
  // Multi-dept-head safe — joins all managed department names.
  const subtitle =
    primaryRole === "dept_head"
      ? managedDepartmentIds.length > 0
        ? `${t("dept.label")}: ${managedDepartmentIds
            .map((id) => {
              const d = departments.find((dep) => dep.id === id);
              return d ? departmentLabel(d, lang) : "—";
            })
            .join(" · ")}`
        : t("depthead.noDeptTitle")
      : t("acc.subtitle");

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("nav.transactions")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        <TransactionsTable rows={data} showRep={scope === "all"} />
      </div>
    </div>
  );
}
