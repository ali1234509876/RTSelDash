import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { a as useQuery, g as getDailyMetrics, b as getWeeklyInsights, P as ProtectedShell } from "./supabase-data-BRA3oWFj.js";
import { u as useI18n, a as useAuth, b as formatDate, f as formatCurrency } from "./router-C21oMGn1.js";
import { C as ChevronDown } from "./chevron-down-CuSiQtmK.js";
import { c as createLucideIcon } from "./button-C5Miz1Tm.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
const QUERY_KEY = ["dailyMetrics"];
const WEEKLY_QUERY_KEY = ["weeklyInsights"];
function getMondayOfCurrentWeek() {
  const d = /* @__PURE__ */ new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function useDailyMetrics(weekStart = getMondayOfCurrentWeek()) {
  return useQuery({
    queryKey: [...QUERY_KEY, weekStart.toISOString()],
    queryFn: () => getDailyMetrics(weekStart)
  });
}
function useWeeklyInsights() {
  return useQuery({
    queryKey: WEEKLY_QUERY_KEY,
    queryFn: getWeeklyInsights
  });
}
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
function InsightsPage() {
  const { t, lang } = useI18n();
  const { primaryRole, managedDepartmentIds } = useAuth();
  const { data: weeklyInsights, isLoading: weeklyLoading } = useWeeklyInsights();
  const [expandedWeek, setExpandedWeek] = reactExports.useState(null);
  const handleToggleWeek = (key) => {
    setExpandedWeek(expandedWeek === key ? null : key);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1800px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("insights.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("insights.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl overflow-hidden", children: weeklyLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-16 text-center text-sm text-muted-foreground", children: t("common.loading") }) : !weeklyInsights || weeklyInsights.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-16 text-center text-sm text-muted-foreground", children: t("insights.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: weeklyInsights.map((week) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const isExpanded = expandedWeek === weekKey;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        WeekRow,
        {
          week,
          isExpanded,
          onToggle: () => handleToggleWeek(weekKey),
          lang,
          t,
          primaryRole,
          managedDepartmentIds
        },
        weekKey
      );
    }) }) })
  ] });
}
function WeekRow({
  week,
  isExpanded,
  onToggle,
  lang,
  t,
  primaryRole,
  managedDepartmentIds
}) {
  const weekStart = new Date(week.weekStart);
  const { data: dailyRows, isLoading: dailyLoading } = useDailyMetrics(weekStart);
  const filteredRows = primaryRole === "dept_head" && managedDepartmentIds.length > 0 ? (dailyRows ?? []).filter((r) => r.departmentId && managedDepartmentIds.includes(r.departmentId)) : dailyRows ?? [];
  const groupedByDept = primaryRole === "ceo" || primaryRole === "accountant" ? filteredRows.reduce((acc, row) => {
    const deptName = row.departmentName ?? t("dept.none");
    if (!acc.has(deptName)) acc.set(deptName, []);
    acc.get(deptName).push(row);
    return acc;
  }, /* @__PURE__ */ new Map()) : /* @__PURE__ */ new Map([["", filteredRows]]);
  const weekDates = getWeekDates(weekStart);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const dailyTotals = weekDates.map(
    (date) => filteredRows.reduce((sum, row) => sum + (row.dailyTotals[date] || 0), 0)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onToggle,
        className: "w-full px-6 py-4 hover:bg-accent/40 transition-colors text-start",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-[200px]", children: [
            isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: t("insights.weekLabel").replace("{{w}}", week.weekNumber.toString()).replace("{{y}}", week.year.toString()) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 text-sm flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground w-[180px]", children: [
              formatDate(week.weekStart, lang),
              " – ",
              formatDate(week.weekEnd, lang)
            ] }),
            dailyTotals.map((total, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-[100px] text-end tabular ${today === weekDates[i] ? "text-primary font-medium" : "text-muted-foreground"}`, children: total > 0 ? formatCurrency(total, lang) : "—" }, i)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-[120px] text-end font-medium text-foreground tabular", children: formatCurrency(week.totalAmount, lang) })
          ] })
        ] })
      }
    ),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border bg-muted/20", children: dailyLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-8 text-center text-sm text-muted-foreground", children: t("common.loading") }) : filteredRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-8 text-center text-sm text-muted-foreground", children: t("insights.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-start border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold text-start sticky left-0 bg-muted/20 z-10 border-r border-border", children: t("insights.grid.employee") }),
        (primaryRole === "ceo" || primaryRole === "accountant") && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold text-start", children: t("insights.grid.department") }),
        DAY_KEYS.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: `px-3 py-3 font-semibold text-end min-w-[100px] ${today === weekDates[DAY_KEYS.indexOf(day)] ? "bg-primary/10" : ""}`, children: t(`insights.grid.${day}`) }, day)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold text-end min-w-[120px]", children: t("insights.grid.weeklyTotal") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        Array.from(groupedByDept.entries()).map(([deptName, deptRows]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          (primaryRole === "ceo" || primaryRole === "accountant") && deptName && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-2 text-xs font-semibold text-foreground uppercase tracking-wider", children: deptName }) }),
          deptRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-muted/20 z-10 border-r border-border", children: row.employeeName }),
            (primaryRole === "ceo" || primaryRole === "accountant") && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: row.departmentName ?? "—" }),
            weekDates.map((date) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-3 text-sm tabular text-end ${today === date ? "bg-primary/10" : ""}`, children: row.dailyTotals[date] ? `${formatCurrency(row.dailyTotals[date], lang)} ${t("common.currency")}` : "—" }, date)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-sm tabular text-foreground text-end font-medium", children: [
              formatCurrency(row.weeklyTotal, lang),
              " ",
              t("common.currency")
            ] })
          ] }, row.employeeId))
        ] })),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/30 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-foreground sticky left-0 bg-muted/30 z-10 border-r border-border", children: t("insights.grid.dailyTotal") }),
          (primaryRole === "ceo" || primaryRole === "accountant") && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: "—" }),
          dailyTotals.map((total, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-3 text-sm tabular text-foreground text-end ${today === weekDates[i] ? "bg-primary/20" : ""}`, children: total > 0 ? `${formatCurrency(total, lang)} ${t("common.currency")}` : "—" }, i)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-sm tabular text-foreground text-end", children: [
            formatCurrency(dailyTotals.reduce((a, b) => a + b, 0), lang),
            " ",
            t("common.currency")
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
function getWeekDates(weekStart) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
function InsightsPageWrapper() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InsightsPage, {}) });
}
export {
  InsightsPageWrapper as component
};
