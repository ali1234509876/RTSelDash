import { U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { P as ProtectedShell } from "./supabase-data-BRA3oWFj.js";
import { u as useI18n, a as useAuth } from "./router-C21oMGn1.js";
import { u as useTransactions } from "./use-transactions-BQFnBqnq.js";
import { u as useDepartments, d as departmentLabel } from "./use-departments-6m5zH-f5.js";
import { T as TransactionsTable } from "./transactions-table-qdn3KNkL.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-C5Miz1Tm.js";
import "./errors-NNkPaikQ.js";
import "./badge-BHfBEM7x.js";
import "./index-Bwo-7ceS.js";
function TransactionsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Inner, {}) });
}
function Inner() {
  const {
    t,
    lang
  } = useI18n();
  const {
    primaryRole,
    managedDepartmentIds
  } = useAuth();
  const {
    data: departments
  } = useDepartments();
  const scope = primaryRole === "sales_rep" ? "self" : "all";
  const {
    data
  } = useTransactions({
    scope
  });
  if (primaryRole === "dept_head" && managedDepartmentIds.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-16 max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-2", children: t("nav.transactions") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("depthead.noDeptTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: t("depthead.noDeptHint") })
    ] });
  }
  const subtitle = primaryRole === "dept_head" ? managedDepartmentIds.length > 0 ? `${t("dept.label")}: ${managedDepartmentIds.map((id) => {
    const d = departments.find((dep) => dep.id === id);
    return d ? departmentLabel(d, lang) : "—";
  }).join(" · ")}` : t("depthead.noDeptTitle") : t("acc.subtitle");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("nav.transactions") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionsTable, { rows: data, showRep: scope === "all" }) })
  ] });
}
export {
  TransactionsPage as component
};
