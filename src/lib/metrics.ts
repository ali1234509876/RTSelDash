import type { Tx } from "@/hooks/use-transactions";
import { daysElapsed, daysInMonth, periodToDate } from "@/lib/period";

export interface Metrics {
  totalAchievement: number;
  completedFiles: number;
  pendingFiles: number;
  cancelledFiles: number;
  cancelledValue: number;
  /** completed / (completed + cancelled) × 100. 0 when neither exists. */
  closeRate: number;
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

/** Period from a YYYY-MM-01 string. */
export function monthRangeOf(period: string): Period {
  return monthRange(periodToDate(period));
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
  const cancelled = rows.filter((r) => r.status === "cancelled");
  const totalAchievement = completed.reduce((s, r) => s + Number(r.amount), 0);
  const cancelledValue = cancelled.reduce((s, r) => s + Number(r.amount), 0);
  const completedFiles = completed.length;
  const cancelledFiles = cancelled.length;
  const avgFileValue = completedFiles > 0 ? totalAchievement / completedFiles : 0;
  const decided = completedFiles + cancelledFiles;
  const closeRate = decided > 0 ? (completedFiles / decided) * 100 : 0;
  return {
    totalAchievement,
    completedFiles,
    pendingFiles: pending.length,
    cancelledFiles,
    cancelledValue,
    closeRate,
    uniqueFiles: completedFiles,
    avgFileValue,
  };
}

export function efficiencyRatio(achievement: number, target: number): number {
  if (target <= 0) return 0;
  return (achievement / target) * 100;
}

/**
 * Pacing ratio: 1.0 = exactly on track, > 1 = ahead, < 1 = behind.
 * (achievement / target) / (daysElapsed / daysInMonth).
 * Returns 0 if target ≤ 0 (caller should hide the chip in that case).
 */
export function pacingRatio(
  achievement: number,
  target: number,
  period: string,
  ref: Date = new Date(),
): number {
  if (target <= 0) return 0;
  const total = daysInMonth(period);
  const elapsed = daysElapsed(period, ref);
  if (elapsed <= 0) return 0;
  return (achievement / target) / (elapsed / total);
}

export interface MonthlyTrendPoint {
  period: string;
  achievement: number;
  completedFiles: number;
  target: number;
}

/**
 * Monthly aggregates over the supplied `periods` (oldest first), filtered to
 * the supplied (already-rep-scoped) transactions. Targets must be supplied
 * separately since they live in `monthly_targets`, not on transactions.
 */
export function monthlyTrend(
  txs: Tx[],
  periods: string[],
  targetsByPeriod: Record<string, number>,
): MonthlyTrendPoint[] {
  return periods.map((p) => {
    const range = monthRangeOf(p);
    const m = computeMetrics(filterByPeriod(txs, range));
    return {
      period: p,
      achievement: m.totalAchievement,
      completedFiles: m.completedFiles,
      target: targetsByPeriod[p] ?? 0,
    };
  });
}
