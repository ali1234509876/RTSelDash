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
