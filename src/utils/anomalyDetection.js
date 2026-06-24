// src/utils/anomalyDetection.js
// Detects categories where current month spend is significantly above historical average

/**
 * Returns anomalous categories for the current month.
 * A category is anomalous if current month spend > threshold * historical monthly average.
 */
export function detectAnomalies(expenses, threshold = 2.0, minMonths = 2) {
  const now       = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const paid = expenses.filter(e => e.status === 'PAID');

  // Group by category → by year-month key
  const byCategory = {};
  paid.forEach(e => {
    const d   = new Date(e.date + 'T00:00:00Z');
    const yr  = d.getUTCFullYear();
    const mo  = d.getUTCMonth();
    const key = yr + '-' + mo;
    const cat = e.category;
    if (!byCategory[cat]) byCategory[cat] = {};
    if (!byCategory[cat][key]) byCategory[cat][key] = 0;
    byCategory[cat][key] += e.amount;
  });

  const anomalies = [];
  const thisKey = thisYear + '-' + thisMonth;

  for (const [cat, months] of Object.entries(byCategory)) {
    const currentSpend = months[thisKey] || 0;
    if (currentSpend === 0) continue;

    // Historical months (exclude current)
    const historical = Object.entries(months)
      .filter(([k]) => k !== thisKey)
      .map(([, v]) => v);

    if (historical.length < minMonths) continue;

    const avg = historical.reduce((s, v) => s + v, 0) / historical.length;
    if (avg === 0) continue;

    const ratio = currentSpend / avg;
    if (ratio >= threshold) {
      anomalies.push({
        category:     cat,
        currentSpend,
        historicalAvg: avg,
        ratio,
        pctAbove:     Math.round((ratio - 1) * 100),
      });
    }
  }

  return anomalies.sort((a, b) => b.ratio - a.ratio);
}