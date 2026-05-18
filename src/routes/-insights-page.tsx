import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { useWeeklyInsights, useDailyMetrics, getMondayOfCurrentWeek } from "@/hooks/use-weekly-insights";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { WeeklyInsight, DailyMetricRow } from "@/lib/supabase-data";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function InsightsPage() {
  const { t, lang } = useI18n();
  const { primaryRole, managedDepartmentIds } = useAuth();
  const { data: weeklyInsights, isLoading: weeklyLoading } = useWeeklyInsights();
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const handleToggleWeek = (key: string) => {
    setExpandedWeek(expandedWeek === key ? null : key);
  };

  return (
    <div className="px-10 py-8 max-w-[1800px] mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-light text-foreground">{t("insights.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("insights.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        {weeklyLoading ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : !weeklyInsights || weeklyInsights.length === 0 ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("insights.empty")}</div>
        ) : (
          <div className="divide-y divide-border">
            {weeklyInsights.map((week) => {
              const weekKey = `${week.year}-${week.weekNumber}`;
              const isExpanded = expandedWeek === weekKey;
              return (
                <WeekRow
                  key={weekKey}
                  week={week}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggleWeek(weekKey)}
                  lang={lang}
                  t={t as (k: string) => string}
                  primaryRole={primaryRole}
                  managedDepartmentIds={managedDepartmentIds}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WeekRow({
  week,
  isExpanded,
  onToggle,
  lang,
  t,
  primaryRole,
  managedDepartmentIds,
}: {
  week: WeeklyInsight;
  isExpanded: boolean;
  onToggle: () => void;
  lang: "ar" | "en";
  t: (k: string) => string;
  primaryRole: string | null;
  managedDepartmentIds: string[];
}) {
  const weekStart = new Date(week.weekStart);
  const { data: dailyRows, isLoading: dailyLoading } = useDailyMetrics(isExpanded ? weekStart : new Date(0));

  const filteredRows = primaryRole === "dept_head" && managedDepartmentIds.length > 0
    ? (dailyRows ?? []).filter(r => r.departmentId && managedDepartmentIds.includes(r.departmentId))
    : dailyRows ?? [];

  const groupedByDept = primaryRole === "ceo" || primaryRole === "accountant"
    ? filteredRows.reduce((acc, row) => {
        const deptName = row.departmentName ?? t("dept.none");
        if (!acc.has(deptName)) acc.set(deptName, []);
        acc.get(deptName)!.push(row);
        return acc;
      }, new Map<string, DailyMetricRow[]>())
    : new Map([["", filteredRows]]);

  const weekDates = getWeekDates(weekStart);
  const today = new Date().toISOString().split("T")[0];
  const dailyTotals = weekDates.map(date =>
    filteredRows.reduce((sum, row) => sum + (row.dailyTotals[date] || 0), 0)
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/40 transition-colors text-start"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {t("insights.weekLabel").replace("{{w}}", week.weekNumber.toString()).replace("{{y}}", week.year.toString())}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            {formatDate(week.weekStart, lang)} – {formatDate(week.weekEnd, lang)}
          </span>
          <span className="font-medium text-foreground tabular">
            {formatCurrency(week.totalAmount, lang)} {t("common.currency")}
          </span>
          <span className="text-muted-foreground tabular">
            {week.transactionCount} {t("insights.count")}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          {dailyLoading ? (
            <div className="px-8 py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : filteredRows.length === 0 ? (
            <div className="px-8 py-8 text-center text-sm text-muted-foreground">{t("insights.empty")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-4 py-3 font-semibold text-start sticky left-0 bg-muted/20 z-10 border-r border-border">
                      {t("insights.grid.employee")}
                    </th>
                    {(primaryRole === "ceo" || primaryRole === "accountant") && (
                      <th className="px-4 py-3 font-semibold text-start">{t("insights.grid.department")}</th>
                    )}
                    {DAY_KEYS.map((day) => (
                      <th key={day} className={`px-3 py-3 font-semibold text-end min-w-[100px] ${today === weekDates[DAY_KEYS.indexOf(day)] ? "bg-primary/10" : ""}`}>
                        {t(`insights.grid.${day}`)}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-end min-w-[120px]">{t("insights.grid.weeklyTotal")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from(groupedByDept.entries()).map(([deptName, deptRows]) => (
                    <>
                      {(primaryRole === "ceo" || primaryRole === "accountant") && deptName && (
                        <tr className="bg-muted/50">
                          <td colSpan={8} className="px-4 py-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                            {deptName}
                          </td>
                        </tr>
                      )}
                      {deptRows.map((row) => (
                        <tr key={row.employeeId} className="hover:bg-accent/40 transition-colors">
                          <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-muted/20 z-10 border-r border-border">
                            {row.employeeName}
                          </td>
                          {(primaryRole === "ceo" || primaryRole === "accountant") && (
                            <td className="px-4 py-3 text-sm text-muted-foreground">{row.departmentName ?? "—"}</td>
                          )}
                          {weekDates.map((date) => (
                            <td key={date} className={`px-3 py-3 text-sm tabular text-end ${today === date ? "bg-primary/10" : ""}`}>
                              {row.dailyTotals[date]
                                ? `${formatCurrency(row.dailyTotals[date], lang)} ${t("common.currency")}`
                                : "—"}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-sm tabular text-foreground text-end font-medium">
                            {formatCurrency(row.weeklyTotal, lang)} {t("common.currency")}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                    <td className="px-4 py-3 text-sm text-foreground sticky left-0 bg-muted/30 z-10 border-r border-border">
                      {t("insights.grid.dailyTotal")}
                    </td>
                    {(primaryRole === "ceo" || primaryRole === "accountant") && (
                      <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                    )}
                    {dailyTotals.map((total, i) => (
                      <td key={i} className={`px-3 py-3 text-sm tabular text-foreground text-end ${today === weekDates[i] ? "bg-primary/20" : ""}`}>
                        {total > 0 ? `${formatCurrency(total, lang)} ${t("common.currency")}` : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm tabular text-foreground text-end">
                      {formatCurrency(dailyTotals.reduce((a, b) => a + b, 0), lang)} {t("common.currency")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getWeekDates(weekStart: Date): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
