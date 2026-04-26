import type { Tx } from "@/hooks/use-transactions";

export interface Metrics {
  totalAchievement: number;
  completedFiles: number;
  pendingFiles: number;
  uniqueFiles: number;
  avgFileValue: number;
}

export function computeMetrics(rows: Tx[]): Metrics {
  const completed = rows.filter((r) => r.status === "completed");
  const pending = rows.filter((r) => r.status === "pending");
  const totalAchievement = completed.reduce((s, r) => s + Number(r.amount), 0);
  const uniqueFiles = new Set(completed.map((r) => r.file_number)).size;
  const avgFileValue = uniqueFiles > 0 ? totalAchievement / uniqueFiles : 0;
  return {
    totalAchievement,
    completedFiles: completed.length,
    pendingFiles: pending.length,
    uniqueFiles,
    avgFileValue,
  };
}

export function efficiencyRatio(achievement: number, target: number): number {
  if (target <= 0) return 0;
  return (achievement / target) * 100;
}
