import type { Tx } from "@/hooks/use-transactions";

export interface Metrics {
  totalAchievement: number;
  completedFiles: number;
  pendingFiles: number;
  /** Count of completed files. file_number is UNIQUE at the DB, so this
   *  equals completedFiles — retained for API compatibility. */
  uniqueFiles: number;
  avgFileValue: number;
}

export interface Period {
  /** ISO date, inclusive. */
  from: string;
  /** ISO date, inclusive. */
  to: string;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** First and last day of the given month (defaults to today's month). */
export function monthRange(ref: Date = new Date()): Period {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { from: toIsoDate(start), to: toIsoDate(end) };
}

/** Keep only transactions whose transaction_date is within [from, to]. */
export function filterByPeriod<T extends { transaction_date: string }>(
  rows: T[],
  period: Period,
): T[] {
  return rows.filter(
    (r) => r.transaction_date >= period.from && r.transaction_date <= period.to,
  );
}

export function computeMetrics(rows: Tx[]): Metrics {
  const completed = rows.filter((r) => r.status === "completed");
  const pending = rows.filter((r) => r.status === "pending");
  const totalAchievement = completed.reduce((s, r) => s + Number(r.amount), 0);
  const completedFiles = completed.length;
  const avgFileValue = completedFiles > 0 ? totalAchievement / completedFiles : 0;
  return {
    totalAchievement,
    completedFiles,
    pendingFiles: pending.length,
    uniqueFiles: completedFiles,
    avgFileValue,
  };
}

export function efficiencyRatio(achievement: number, target: number): number {
  if (target <= 0) return 0;
  return (achievement / target) * 100;
}
