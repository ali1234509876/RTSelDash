import { useQuery } from "@tanstack/react-query";
import { getWeeklyInsights, type WeeklyInsight } from "@/lib/supabase-data";

const QUERY_KEY = ["weeklyInsights"] as const;

export function useWeeklyInsights() {
  return useQuery<WeeklyInsight[]>({
    queryKey: QUERY_KEY,
    queryFn: getWeeklyInsights,
  });
}

export { QUERY_KEY as queryKeysWeeklyInsights };
