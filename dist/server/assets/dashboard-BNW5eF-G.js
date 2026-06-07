import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { P as ProtectedShell } from "./supabase-data-BRA3oWFj.js";
import { u as useI18n, f as formatCurrency, L as Link, a as useAuth } from "./router-C21oMGn1.js";
import { u as useTransactions } from "./use-transactions-BQFnBqnq.js";
import { m as monthRange, f as filterByPeriod, c as computeMetrics, e as efficiencyRatio } from "./metrics-BdRbdHws.js";
import { u as useDepartments, d as departmentLabel } from "./use-departments-6m5zH-f5.js";
import { u as useProfilesWithRoles } from "./use-profiles-fTwdOUvA.js";
import { K as KpiCard, R as RadialProgress } from "./radial-progress-bmzfUeQi.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CwBKop_M.js";
import { T as TransactionsTable } from "./transactions-table-qdn3KNkL.js";
import { B as Button } from "./button-C5Miz1Tm.js";
import { P as Plus } from "./plus-BVtooVXg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Bwo-7ceS.js";
import "./chevron-down-CuSiQtmK.js";
import "./errors-NNkPaikQ.js";
import "./badge-BHfBEM7x.js";
function ManagerDashboard({
  fixedDepartmentId,
  showDepartmentFilter = false,
  title,
  subtitle
} = {}) {
  const { t, lang } = useI18n();
  const { data: allTxs } = useTransactions({ scope: "all" });
  const { data: departments } = useDepartments();
  const { data: profiles } = useProfilesWithRoles();
  const [filterDept, setFilterDept] = reactExports.useState("__all__");
  const period = reactExports.useMemo(() => monthRange(), []);
  const txs = reactExports.useMemo(() => filterByPeriod(allTxs, period), [allTxs, period]);
  const reps = reactExports.useMemo(
    () => profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      monthly_target: Number(p.monthly_target),
      department_id: p.department_id ?? null
    })),
    [profiles]
  );
  const activeDept = fixedDepartmentId !== void 0 ? fixedDepartmentId : filterDept === "__all__" ? null : filterDept;
  const filteredReps = reactExports.useMemo(
    () => activeDept ? reps.filter((r) => r.department_id === activeDept) : reps,
    [reps, activeDept]
  );
  const filteredRepIds = reactExports.useMemo(() => new Set(filteredReps.map((r) => r.id)), [filteredReps]);
  const filteredTxs = reactExports.useMemo(
    () => activeDept ? txs.filter((tx) => tx.sales_rep_id && filteredRepIds.has(tx.sales_rep_id)) : txs,
    [txs, activeDept, filteredRepIds]
  );
  const overall = reactExports.useMemo(() => computeMetrics(filteredTxs), [filteredTxs]);
  const totalTarget = filteredReps.reduce((s, r) => s + r.monthly_target, 0);
  const teamRatio = efficiencyRatio(overall.totalAchievement, totalTarget);
  const repBreakdown = reactExports.useMemo(() => {
    return filteredReps.map((rep) => {
      const repTxs = filteredTxs.filter((tt) => tt.sales_rep_id === rep.id);
      const m = computeMetrics(repTxs);
      return {
        ...rep,
        achievement: m.totalAchievement,
        ratio: efficiencyRatio(m.totalAchievement, rep.monthly_target),
        completed: m.completedFiles
      };
    }).sort((a, b) => b.achievement - a.achievement);
  }, [filteredReps, filteredTxs]);
  const deptBreakdown = reactExports.useMemo(() => {
    if (!showDepartmentFilter || activeDept) return [];
    return departments.map((d) => {
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
        ratio: efficiencyRatio(m.totalAchievement, target)
      };
    }).sort((a, b) => b.achievement - a.achievement);
  }, [departments, reps, txs, lang, showDepartmentFilter, activeDept]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 flex items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: title ?? t("manager.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle ?? t("manager.subtitle") })
      ] }),
      showDepartmentFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5", children: t("dept.filter") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterDept, onValueChange: setFilterDept, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: t("dept.all") }),
            departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: departmentLabel(d, lang) }, d.id))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.teamAchievement"),
          value: `${formatCurrency(overall.totalAchievement, lang)} ${t("common.currency")}`,
          accent: "success"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.monthlyTarget"),
          value: `${formatCurrency(totalTarget, lang)} ${t("common.currency")}`,
          accent: "primary"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: t("kpi.efficiencyRatio"), value: `${teamRatio.toFixed(1)}%`, accent: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: t("kpi.activeReps"), value: String(filteredReps.length), accent: "neutral" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-8 rounded-3xl flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8", children: t("kpi.progressToTarget") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RadialProgress, { value: teamRatio, size: 220 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 w-full grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("kpi.completedFiles") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-light tabular mt-1", children: overall.completedFiles })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("kpi.avgFileValue") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-light tabular mt-1", children: formatCurrency(overall.avgFileValue, lang) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 glass-card rounded-3xl overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-5 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-foreground font-bold", children: t("manager.repBreakdown") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border", children: [
          repBreakdown.map((rep) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/team/$id",
              params: { id: rep.id },
              className: "px-8 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full bg-accent border border-border-strong flex items-center justify-center text-xs font-semibold", children: (rep.full_name ?? "·").slice(0, 2).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground truncate", children: rep.full_name ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground tabular mt-0.5", children: [
                    formatCurrency(rep.achievement, lang),
                    " / ",
                    formatCurrency(rep.monthly_target, lang),
                    " ",
                    t("common.currency")
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-border-strong rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full rounded-full",
                    style: {
                      width: `${Math.min(100, rep.ratio)}%`,
                      background: "var(--gradient-primary)"
                    }
                  }
                ) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-14 text-end text-sm tabular font-medium text-foreground", children: [
                  rep.ratio.toFixed(0),
                  "%"
                ] })
              ]
            },
            rep.id
          )),
          repBreakdown.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-10 text-center text-sm text-muted-foreground", children: t("tx.empty") })
        ] })
      ] })
    ] }),
    showDepartmentFilter && !activeDept && deptBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 glass-card rounded-3xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-5 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-foreground font-bold", children: t("ceo.deptBreakdown") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: deptBreakdown.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setFilterDept(d.id),
          className: "w-full px-8 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors text-start",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground truncate", children: d.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground tabular mt-0.5", children: [
                d.headcount,
                " · ",
                formatCurrency(d.achievement, lang),
                " / ",
                formatCurrency(d.target, lang),
                " ",
                t("common.currency")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-border-strong rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full rounded-full",
                style: {
                  width: `${Math.min(100, d.ratio)}%`,
                  background: "var(--gradient-primary)"
                }
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-14 text-end text-sm tabular font-medium text-foreground", children: [
              d.ratio.toFixed(0),
              "%"
            ] })
          ]
        },
        d.id
      )) })
    ] })
  ] });
}
function AccountantDashboard() {
  const { t, lang } = useI18n();
  const { data } = useTransactions({ scope: "all" });
  const period = reactExports.useMemo(() => monthRange(), []);
  const monthRows = reactExports.useMemo(() => filterByPeriod(data, period), [data, period]);
  const metrics = reactExports.useMemo(() => computeMetrics(monthRows), [monthRows]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between items-end mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("acc.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("acc.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/entry", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 me-2" }),
        t("tx.add")
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.totalAchievement"),
          value: `${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`,
          accent: "success"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: t("kpi.completedFiles"), value: String(metrics.completedFiles), accent: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: t("kpi.pendingFiles"), value: String(metrics.pendingFiles), accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.avgFileValue"),
          value: `${formatCurrency(metrics.avgFileValue, lang)}`,
          accent: "neutral"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card rounded-3xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-5 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-foreground font-bold", children: t("tx.all") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionsTable, { rows: data, showRep: true })
    ] })
  ] });
}
function SalesRepDashboard() {
  const { profile } = useAuth();
  const { t, lang } = useI18n();
  const { data, loading } = useTransactions({ scope: "self" });
  const period = reactExports.useMemo(() => monthRange(), []);
  const monthRows = reactExports.useMemo(() => filterByPeriod(data, period), [data, period]);
  const metrics = reactExports.useMemo(() => computeMetrics(monthRows), [monthRows]);
  const target = profile?.monthly_target ?? 0;
  const ratio = efficiencyRatio(metrics.totalAchievement, target);
  const variance = metrics.totalAchievement - target;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between items-end mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-light text-foreground", children: [
          t("rep.welcome"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-primary font-semibold", children: profile?.full_name ?? "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("rep.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card px-4 py-2 rounded-lg text-xs font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success", children: "●" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          t("kpi.monthlyTarget"),
          ": "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular text-foreground", children: [
          formatCurrency(target, lang),
          " ",
          t("common.currency")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.totalAchievement"),
          value: `${formatCurrency(metrics.totalAchievement, lang)} ${t("common.currency")}`,
          accent: "success",
          hint: loading ? "…" : `${metrics.completedFiles} ${t("kpi.completedFiles")}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.targetVariance"),
          value: `${variance >= 0 ? "+" : ""}${formatCurrency(variance, lang)}`,
          accent: variance >= 0 ? "success" : "destructive"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.efficiencyRatio"),
          value: `${ratio.toFixed(1)}%`,
          accent: "primary"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: t("kpi.avgFileValue"),
          value: `${formatCurrency(metrics.avgFileValue, lang)}`,
          accent: "neutral",
          hint: `${metrics.uniqueFiles} ${t("kpi.completedFiles")}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-8 rounded-3xl flex flex-col items-center relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 pointer-events-none",
            style: { background: "linear-gradient(180deg, oklch(from var(--primary) l c h / 0.08), transparent)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-8 relative", children: t("kpi.progressToTarget") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadialProgress, { value: ratio, size: 220 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 w-full grid grid-cols-2 gap-4 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("kpi.completedFiles") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-light tabular text-foreground mt-1", children: metrics.completedFiles })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("kpi.pendingFiles") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-light tabular text-foreground mt-1", children: metrics.pendingFiles })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 glass-card rounded-3xl overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-5 border-b border-border flex justify-between items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-foreground font-bold", children: t("tx.recent") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionsTable, { rows: data.slice(0, 8) })
      ] })
    ] })
  ] });
}
function DashboardPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRouter, {}) });
}
function DashboardRouter() {
  const {
    primaryRole,
    managedDepartmentId
  } = useAuth();
  const {
    t
  } = useI18n();
  if (primaryRole === "ceo") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ManagerDashboard, { showDepartmentFilter: true, title: t("ceo.title"), subtitle: t("ceo.subtitle") });
  }
  if (primaryRole === "dept_head") {
    if (!managedDepartmentId) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-16 max-w-2xl mx-auto text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-2", children: t("depthead.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("depthead.noDeptTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: t("depthead.noDeptHint") })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ManagerDashboard, { fixedDepartmentId: managedDepartmentId, title: t("depthead.title"), subtitle: t("depthead.subtitle") });
  }
  if (primaryRole === "accountant") return /* @__PURE__ */ jsxRuntimeExports.jsx(AccountantDashboard, {});
  if (primaryRole === "sales_rep") return /* @__PURE__ */ jsxRuntimeExports.jsx(SalesRepDashboard, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-muted-foreground", children: t("common.loading") });
}
export {
  DashboardPage as component
};
