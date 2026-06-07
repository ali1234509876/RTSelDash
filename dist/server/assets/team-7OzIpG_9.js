import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry-LGGiUUMr.js";
import { u as useI18n, a as useAuth, c as currentPeriod, L as Link, f as formatCurrency, t as toast } from "./router-C21oMGn1.js";
import { P as ProtectedShell, u as updateProfile, s as setMonthlyTarget } from "./supabase-data-BRA3oWFj.js";
import { u as useTransactions } from "./use-transactions-BQFnBqnq.js";
import { u as useDepartments, d as departmentLabel } from "./use-departments-6m5zH-f5.js";
import { u as useProfilesWithRoles } from "./use-profiles-fTwdOUvA.js";
import { m as monthRange, f as filterByPeriod, c as computeMetrics, p as pacingRatio, e as efficiencyRatio } from "./metrics-BdRbdHws.js";
import { B as Button } from "./button-C5Miz1Tm.js";
import { I as Input } from "./input-B-lpk3am.js";
import { e as errorMessage } from "./errors-NNkPaikQ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function TeamPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { allow: ["ceo", "dept_head"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Inner, {}) });
}
function pacingState(ratio) {
  if (ratio === 0) return "onTrack";
  if (ratio >= 1.05) return "ahead";
  if (ratio <= 0.95) return "behind";
  return "onTrack";
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
    data: allTxs,
    loading: txLoading
  } = useTransactions({
    scope: "all"
  });
  const {
    data: departments,
    loading: departmentsLoading
  } = useDepartments();
  const period = reactExports.useMemo(() => monthRange(), []);
  const periodKey = reactExports.useMemo(() => currentPeriod(), []);
  const txs = reactExports.useMemo(() => filterByPeriod(allTxs, period), [allTxs, period]);
  const {
    data: profiles,
    loading: profilesLoading,
    reload: reloadProfiles
  } = useProfilesWithRoles();
  const [drafts, setDrafts] = reactExports.useState({});
  const [sortKey, setSortKey] = reactExports.useState("attainment");
  const canAssignDept = primaryRole === "ceo";
  const reps = reactExports.useMemo(() => profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    monthly_target: Number(p.monthly_target),
    department_id: p.department_id ?? null,
    roles: p.roles
  })), [profiles]);
  const visibleReps = reactExports.useMemo(() => {
    if (primaryRole === "dept_head") {
      if (managedDepartmentIds.length === 0) return [];
      const allowed = new Set(managedDepartmentIds);
      return reps.filter((r) => r.department_id && allowed.has(r.department_id));
    }
    return reps;
  }, [reps, primaryRole, managedDepartmentIds]);
  const computed = reactExports.useMemo(() => visibleReps.map((rep) => {
    const repTxs = txs.filter((tx) => tx.sales_rep_id === rep.id);
    const m = computeMetrics(repTxs);
    return {
      ...rep,
      achievement: m.totalAchievement,
      attainment: efficiencyRatio(m.totalAchievement, rep.monthly_target),
      pacing: pacingRatio(m.totalAchievement, rep.monthly_target, periodKey),
      pendingFiles: m.pendingFiles,
      cancelledFiles: m.cancelledFiles
    };
  }), [visibleReps, txs, periodKey]);
  const sorted = reactExports.useMemo(() => {
    const arr = [...computed];
    if (sortKey === "attainment") arr.sort((a, b) => b.attainment - a.attainment);
    else if (sortKey === "achievement") arr.sort((a, b) => b.achievement - a.achievement);
    else arr.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
    return arr;
  }, [computed, sortKey]);
  const saveTarget = async (id) => {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0) {
      toast.error(t("common.error"));
      return;
    }
    try {
      await setMonthlyTarget(id, value);
      toast.success(t("manager.targetSaved"));
      setDrafts((d) => ({
        ...d,
        [id]: ""
      }));
      reloadProfiles();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team] saveTarget failed:", err);
    }
  };
  const updateDepartment = async (id, deptId) => {
    const value = deptId === "__none__" ? null : deptId;
    try {
      await updateProfile(id, {
        department_id: value
      });
      reloadProfiles();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[team] updateDepartment failed:", err);
    }
  };
  const deptName = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    departments.forEach((d) => m.set(d.id, departmentLabel(d, lang)));
    return m;
  }, [departments, lang]);
  const scopeLabel = primaryRole === "dept_head" ? managedDepartmentIds.length > 0 ? managedDepartmentIds.map((id) => deptName.get(id) ?? "—").join(" · ") : t("auth.noManagedDept") : t("manager.scopeOrg");
  if (primaryRole === "dept_head" && managedDepartmentIds.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-16 max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-2", children: t("nav.team") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("depthead.noDeptTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: t("depthead.noDeptHint") })
    ] });
  }
  const isLoading = profilesLoading || txLoading || departmentsLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8 flex items-end justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("nav.team") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("manager.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card px-4 py-2 rounded-lg text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            t("manager.scope"),
            ": "
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: scopeLabel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[180px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5", children: t("manager.sortBy") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sortKey, onChange: (e) => setSortKey(e.target.value), className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "attainment", children: t("manager.sort.attainment") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "achievement", children: t("manager.sort.achievement") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name", children: t("manager.sort.name") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold text-start", children: t("tx.salesRep") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("dept.label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("kpi.totalAchievement") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("kpi.monthlyTarget") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("kpi.efficiencyRatio") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("kpi.pacing") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("manager.pending") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold text-end", children: t("manager.setTarget") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-sm text-muted-foreground", children: t("common.loading") }) }),
        !isLoading && sorted.map((rep) => {
          const pState = pacingState(rep.pacing);
          const pacingClass = pState === "ahead" ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : pState === "behind" ? "border-destructive/40 text-destructive bg-destructive/10" : "border-border text-muted-foreground bg-muted/40";
          const pacingText = rep.monthly_target > 0 ? pState === "ahead" ? t("kpi.pacing.ahead") : pState === "behind" ? t("kpi.pacing.behind") : t("kpi.pacing.onTrack") : "—";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/team/$id", params: {
                id: rep.id
              }, className: "text-sm font-medium text-foreground hover:text-primary transition-colors", children: rep.full_name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5", children: rep.roles.map((r) => t(`role.${r}`)).join(" · ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: canAssignDept ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: rep.department_id ?? "__none__", onChange: (e) => updateDepartment(rep.id, e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__none__", children: t("dept.none") }),
              departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d.id, children: departmentLabel(d, lang) }, d.id))
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: rep.department_id ? deptName.get(rep.department_id) : t("dept.none") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4 text-sm tabular text-foreground", children: [
              formatCurrency(rep.achievement, lang),
              " ",
              t("common.currency")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4 text-sm tabular text-foreground", children: [
              formatCurrency(rep.monthly_target, lang),
              " ",
              t("common.currency")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4 text-sm tabular text-primary", children: [
              rep.attainment.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${pacingClass}`, children: pacingText }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-sm tabular text-muted-foreground", children: rep.pendingFiles }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", className: "w-32 h-9", placeholder: String(rep.monthly_target), value: drafts[rep.id] ?? "", onChange: (e) => setDrafts((d) => ({
                ...d,
                [rep.id]: e.target.value
              })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => saveTarget(rep.id), disabled: !drafts[rep.id], children: t("tx.save") })
            ] }) })
          ] }, rep.id);
        }),
        !isLoading && sorted.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-sm text-muted-foreground", children: t("tx.empty") }) })
      ] })
    ] }) })
  ] });
}
export {
  TeamPage as component
};
