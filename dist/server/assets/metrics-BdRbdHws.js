import { h as daysInMonth, i as daysElapsed, p as periodToDate } from "./router-C21oMGn1.js";
function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}
function monthRange(ref = /* @__PURE__ */ new Date()) {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { from: toIsoDate(start), to: toIsoDate(end) };
}
function monthRangeOf(period) {
  return monthRange(periodToDate(period));
}
function filterByPeriod(rows, period) {
  return rows.filter(
    (r) => r.transaction_date >= period.from && r.transaction_date <= period.to
  );
}
function computeMetrics(rows) {
  const completed = rows.filter((r) => r.status === "completed");
  const pending = rows.filter((r) => r.status === "pending");
  const cancelled = rows.filter((r) => r.status === "cancelled");
  const totalAchievement = completed.reduce((s, r) => s + Number(r.amount), 0);
  const cancelledValue = cancelled.reduce((s, r) => s + Number(r.amount), 0);
  const completedFiles = completed.length;
  const cancelledFiles = cancelled.length;
  const avgFileValue = completedFiles > 0 ? totalAchievement / completedFiles : 0;
  const decided = completedFiles + cancelledFiles;
  const closeRate = decided > 0 ? completedFiles / decided * 100 : 0;
  return {
    totalAchievement,
    completedFiles,
    pendingFiles: pending.length,
    cancelledFiles,
    cancelledValue,
    closeRate,
    uniqueFiles: completedFiles,
    avgFileValue
  };
}
function efficiencyRatio(achievement, target) {
  if (target <= 0) return 0;
  return achievement / target * 100;
}
function pacingRatio(achievement, target, period, ref = /* @__PURE__ */ new Date()) {
  if (target <= 0) return 0;
  const total = daysInMonth(period);
  const elapsed = daysElapsed(period, ref);
  if (elapsed <= 0) return 0;
  return achievement / target / (elapsed / total);
}
function monthlyTrend(txs, periods, targetsByPeriod) {
  return periods.map((p) => {
    const range = monthRangeOf(p);
    const m = computeMetrics(filterByPeriod(txs, range));
    return {
      period: p,
      achievement: m.totalAchievement,
      completedFiles: m.completedFiles,
      target: targetsByPeriod[p] ?? 0
    };
  });
}
export {
  monthRangeOf as a,
  monthlyTrend as b,
  computeMetrics as c,
  efficiencyRatio as e,
  filterByPeriod as f,
  monthRange as m,
  pacingRatio as p
};
