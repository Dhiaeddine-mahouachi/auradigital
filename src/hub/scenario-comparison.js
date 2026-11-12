// Pure presentation data for the Growth Simulator. Financial calculations remain
// centralized in src/growth-engine.js and never depend on chart appearance.
export const scenarioComparisonMetrics = Object.freeze([
  { key: 'additionalRevenue', label: 'revenue', money: true },
  { key: 'netMonthly', label: 'net', money: true },
  { key: 'firstYearROI', label: 'roi', money: false },
]);

export function scenarioComparison(result) {
  const scenarios = Array.isArray(result?.scenarios) ? result.scenarios : [];
  if (!scenarios.length) return [];

  return scenarioComparisonMetrics.map(metric => {
    const values = scenarios.map(s => {
      const raw = s?.[metric.key];
      return {
        name: String(s?.name ?? ''),
        value: typeof raw === 'number' && Number.isFinite(raw) ? raw : null,
      };
    });
    const maximum = Math.max(0, ...values.map(v => Math.abs(v.value ?? 0)));
    return {
      ...metric,
      values: values.map(v => ({
        ...v,
        direction: v.value === null ? 'missing' : v.value > 0 ? 'positive' : v.value < 0 ? 'negative' : 'zero',
        // Half the rail is reserved for each sign, with zero always centered.
        // Widths are percentages of the full rail and safe to interpolate into CSS.
        width: maximum === 0 || v.value === null ? 0 : Math.min(50, Math.round(Math.abs(v.value) / maximum * 5000) / 100),
      })),
    };
  });
}
