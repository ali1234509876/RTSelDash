import { useQuery } from "@tanstack/react-query";
import { getDailyMetrics, getWeeklyInsights, type DailyMetricRow, type WeeklyInsight } from "@/lib/supabase-data";

const QUERY_KEY = ["dailyMetrics"] as const;
const WEEKLY_QUERY_KEY = ["weeklyInsights"] as const;

// Helper: get Monday of current week
function getMondayOfCurrentWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useDailyMetrics(weekStart: Date = getMondayOfCurrentWeek()) {
  return useQuery<DailyMetricRow[]>({
    queryKey: [...QUERY_KEY, weekStart.toISOString()],
    queryFn: () => getDailyMetrics(weekStart),
  });
}

export function useWeeklyInsights() {
  return useQuery<WeeklyInsight[]>({
    queryKey: WEEKLY_QUERY_KEY,
    queryFn: getWeeklyInsights,
  });
}

export { QUERY_KEY as queryKeysDailyMetrics, getMondayOfCurrentWeek };
