/**
 * Helpers for working with the `monthly_targets.period` column,
 * which is always the first day of a calendar month (YYYY-MM-01).
 */

/** First-of-month ISO date string (YYYY-MM-01) for the supplied date or now. */
export function currentPeriod(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Parse a YYYY-MM-01 period string back into a local Date at midnight. */
export function periodToDate(period: string): Date {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
}

/** Number of days in the calendar month of `period`. */
export function daysInMonth(period: string): number {
  const d = periodToDate(period);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Days elapsed within the period as of `ref` (default: now).
 * Clamped to [1, daysInMonth(period)] so pacing math is well-defined for
 * past/future periods (past = full month elapsed, future = day 1).
 */
export function daysElapsed(period: string, ref: Date = new Date()): number {
  const total = daysInMonth(period);
  const start = periodToDate(period);
  const end = new Date(start.getFullYear(), start.getMonth(), total);
  if (ref < start) return 1;
  if (ref >= end) return total;
  return ref.getDate();
}

/** Shift a period by `delta` whole months (negative = past). */
export function addMonths(period: string, delta: number): string {
  const d = periodToDate(period);
  d.setMonth(d.getMonth() + delta);
  return currentPeriod(d);
}

/** Last `n` periods ending at `ref`'s month, oldest first. */
export function lastNPeriods(n: number, ref: Date = new Date()): string[] {
  const end = currentPeriod(ref);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addMonths(end, -i));
  return out;
}

/** "Mar 2026" / "مارس 2026" — locale-aware short month label. */
export function monthLabel(period: string, lang: "ar" | "en"): string {
  const d = periodToDate(period);
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    year: "numeric",
  });
}
