import { useI18n } from "@/lib/i18n-context";
import { formatDate, formatCurrency } from "@/lib/i18n";
import { useWeeklyInsights } from "@/hooks/use-weekly-insights";
import type { WeeklyInsight } from "@/lib/supabase-data";

export function InsightsPage() {
  const { t, lang } = useI18n();
  const { data: insights, isLoading } = useWeeklyInsights();

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("insights.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("insights.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : !insights || insights.length === 0 ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("insights.empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="px-6 py-4 font-semibold text-start">{t("insights.week")}</th>
                  <th className="px-4 py-4 font-semibold text-start">{t("insights.period")}</th>
                  <th className="px-4 py-4 font-semibold text-end">{t("insights.amount")}</th>
                  <th className="px-4 py-4 font-semibold text-end">{t("insights.count")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {insights.map((row) => (
                  <tr key={`${row.year}-${row.weekNumber}`} className="hover:bg-accent/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {t("insights.weekLabel").replace("{{w}}", row.weekNumber.toString()).replace("{{y}}", row.year.toString())}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(row.weekStart, lang)} – {formatDate(row.weekEnd, lang)}
                    </td>
                    <td className="px-4 py-4 text-sm tabular text-foreground text-end font-medium">
                      {formatCurrency(row.totalAmount, lang)} {t("common.currency")}
                    </td>
                    <td className="px-4 py-4 text-sm tabular text-muted-foreground text-end">
                      {row.transactionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
