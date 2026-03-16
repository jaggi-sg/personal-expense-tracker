// src/components/AdvancedAnalytics.jsx

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Calendar, DollarSign,
  BarChart3, PieChart, Target, Activity, Minus,
  AlertCircle, Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ── Shared helpers ────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const fmt  = (n) => `$${n.toFixed(2)}`;
const pct  = (a, b) => b > 0 ? ((a - b) / b) * 100 : null;

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/15 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, iconColor = 'text-purple-400', title, sub, right }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="bg-white/10 p-2 rounded-lg shrink-0">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-white font-bold text-base leading-none">{title}</h2>
        {sub && <p className="text-purple-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

const TrendBadge = ({ direction, value }) => {
  if (direction === 'stable' || value === null) return (
    <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2 py-0.5 rounded text-xs font-semibold">
      <Minus className="w-3 h-3" /> Stable
    </span>
  );
  const up = direction === 'up';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border
      ${up ? 'bg-red-500/15 text-red-300 border-red-500/25' : 'bg-green-500/15 text-green-300 border-green-500/25'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value !== null ? `${Math.abs(value).toFixed(1)}%` : '—'}
    </span>
  );
};

// ── Month-over-Month Table ─────────────────────────────────────────────────────
const MoMTable = ({ expenses, analysisType }) => {
  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';
  const paid = expenses.filter(e => e.type === typeLabel && e.status === 'PAID');

  // Get all years present
  const years = [...new Set(paid.map(e =>
    new Date(e.date + 'T00:00:00Z').getUTCFullYear()
  ))].sort((a, b) => b - a).slice(0, 2); // show latest 2 years

  // All categories
  const cats = [...new Set(paid.map(e => e.category))].sort();

  // Build grid: cat → month → total
  const grid = {};
  cats.forEach(cat => {
    grid[cat] = {};
    MONTHS_SHORT.forEach(m => { grid[cat][m] = {}; });
  });

  paid.forEach(e => {
    const yr  = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
    const mo  = MONTHS_SHORT[new Date(e.date + 'T00:00:00Z').getUTCMonth()];
    if (!grid[e.category]) return;
    if (!grid[e.category][mo]) grid[e.category][mo] = {};
    grid[e.category][mo][yr] = (grid[e.category][mo][yr] || 0) + e.amount;
  });

  // Only show the most recent year's months that have any data
  const currentYear = years[0];
  const prevYear    = years[1];

  // Which months have data?
  const activeMos = MONTHS_SHORT.filter(m =>
    cats.some(c => (grid[c]?.[m]?.[currentYear] || 0) > 0)
  );

  if (cats.length === 0 || activeMos.length === 0) {
    return <p className="text-purple-400 text-sm text-center py-6">No data available for the selected type.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-max">
        <thead>
          <tr className="border-b border-white/15">
            <th className="text-left text-purple-300 font-semibold py-2 px-4 sticky left-0 bg-slate-900 z-10 whitespace-nowrap min-w-[140px]">
              Category
            </th>
            {activeMos.map(m => (
              <th key={m} className="text-center text-purple-300 font-semibold py-2 px-3 whitespace-nowrap">
                {m}
              </th>
            ))}
            <th className="text-right text-purple-300 font-semibold py-2 px-4 whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(cat => {
            const rowTotal = activeMos.reduce((s, m) => s + (grid[cat]?.[m]?.[currentYear] || 0), 0);
            if (rowTotal === 0) return null;
            return (
              <tr key={cat} className="border-b border-white/8 hover:bg-white/5 transition-colors group">
                <td className="py-2 px-4 text-white font-medium sticky left-0 bg-slate-900 z-10 whitespace-nowrap group-hover:bg-slate-800 min-w-[140px]">
                  {cat}
                </td>
                {activeMos.map((m, mi) => {
                  const cur  = grid[cat]?.[m]?.[currentYear] || 0;
                  const prev = grid[cat]?.[m]?.[prevYear]    || 0;
                  // MoM = compare to previous calendar month
                  const prevMo  = mi > 0 ? activeMos[mi - 1] : null;
                  const prevMoV = prevMo ? (grid[cat]?.[prevMo]?.[currentYear] || 0) : null;
                  const delta   = prevMoV !== null ? cur - prevMoV : null;

                  return (
                    <td key={m} className="py-2 px-2 text-center">
                      {cur > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-white font-semibold">${Math.round(cur)}</span>
                          {delta !== null && delta !== 0 && (
                            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {delta > 0
                                ? <ArrowUpRight className="w-2.5 h-2.5" />
                                : <ArrowDownRight className="w-2.5 h-2.5" />}
                              ${Math.abs(Math.round(delta))}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/15">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 pl-4 text-right text-white font-bold whitespace-nowrap">
                  {fmt(rowTotal)}
                </td>
              </tr>
            );
          })}
          {/* Totals row */}
          <tr className="border-t border-white/20 bg-white/5">
            <td className="py-2 px-4 text-purple-200 font-bold sticky left-0 bg-slate-900 z-10 min-w-[140px]">Total</td>
            {activeMos.map(m => {
              const total = cats.reduce((s, c) => s + (grid[c]?.[m]?.[currentYear] || 0), 0);
              return (
                <td key={m} className="py-2 px-2 text-center text-purple-200 font-bold">
                  {total > 0 ? `$${Math.round(total)}` : '—'}
                </td>
              );
            })}
            <td className="py-2 pl-4 text-right text-white font-bold">
              {fmt(cats.reduce((s, c) => s + activeMos.reduce((ms, m) => ms + (grid[c]?.[m]?.[currentYear] || 0), 0), 0))}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-purple-500 text-xs mt-2">
        ↑↓ arrows show change vs previous month · showing {currentYear}
        {prevYear ? ` (${prevYear} data available in hover)` : ''}
      </p>
    </div>
  );
};

// ── Biggest Expense Callout ───────────────────────────────────────────────────
const BiggestExpenseCallout = ({ expenses, analysisType }) => {
  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';
  const paid = expenses.filter(e => e.type === typeLabel && e.status === 'PAID');
  if (!paid.length) return null;

  const biggest = paid.reduce((max, e) => e.amount > max.amount ? e : max, paid[0]);
  const avg     = paid.reduce((s, e) => s + e.amount, 0) / paid.length;
  const pctAbove = ((biggest.amount - avg) / avg * 100).toFixed(0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-900/20 p-5">
      {/* Glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="bg-yellow-500/20 border border-yellow-500/30 p-2.5 rounded-xl shrink-0">
          <Award className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">
            Largest Single {typeLabel} Expense
          </p>
          <p className="text-white font-bold text-3xl leading-none mb-1">
            {fmt(biggest.amount)}
          </p>
          <p className="text-purple-200 text-sm font-medium truncate">{biggest.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">
              {biggest.category}
            </span>
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">
              {biggest.date}
            </span>
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">
              {biggest.paymentType || 'N/A'}
            </span>
            <span className="bg-red-500/20 text-red-300 border border-red-500/25 text-xs px-2 py-0.5 rounded-full font-semibold">
              {pctAbove}% above avg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdvancedAnalytics = ({ expenses = [], categories = [], nonRecurringCategories = [], onCategoryClick }) => {
  const [selectedYear,  setSelectedYear]  = useState('All');
  const [analysisType,  setAnalysisType]  = useState('recurring');
  const [categoryPage,  setCategoryPage]  = useState(1);
  const CATS_PER_PAGE = 5;

  // ── Derived ─────────────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const s = new Set();
    expenses.forEach(e => s.add(new Date(e.date + 'T00:00:00Z').getUTCFullYear()));
    return [...s].sort((a, b) => b - a);
  }, [expenses]);

  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => e.type === typeLabel && e.status === 'PAID'),
  [expenses, analysisType]);

  // Year-over-year
  const yearOverYearData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
      if (!map[yr]) map[yr] = { total: 0, count: 0 };
      map[yr].total += e.amount;
      map[yr].count += 1;
    });
    return map;
  }, [filteredExpenses]);

  const yoyGrowth = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    return years.slice(1).map((yr, i) => {
      const cur  = yearOverYearData[yr].total;
      const prev = yearOverYearData[years[i]].total;
      return { year: yr, current: cur, previous: prev, growth: pct(cur, prev) };
    });
  }, [yearOverYearData]);

  // Category patterns
  const categoryPatterns = useMemo(() => {
    const p = {};
    filteredExpenses.forEach(e => {
      if (!p[e.category]) p[e.category] = { total: 0, count: 0, byYear: {}, byMonth: {} };
      p[e.category].total += e.amount;
      p[e.category].count += 1;
      const yr  = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
      const mok = `${yr}-${new Date(e.date + 'T00:00:00Z').getUTCMonth()}`;
      p[e.category].byYear[yr]  = (p[e.category].byYear[yr]  || 0) + e.amount;
      p[e.category].byMonth[mok] = (p[e.category].byMonth[mok] || 0) + e.amount;
    });

    Object.values(p).forEach(d => {
      const yrs = Object.keys(d.byYear).length;
      d.yearlyAverage   = yrs > 0 ? d.total / yrs : 0;
      d.monthlyAverage  = d.count > 0 ? d.total / d.count : 0;
      const mkeys       = Object.keys(d.byMonth).sort();
      const last6       = mkeys.slice(-6).map(k => d.byMonth[k]);
      if (last6.length >= 2) {
        const half  = Math.floor(last6.length / 2);
        const avgA  = last6.slice(0, half).reduce((s, v) => s + v, 0) / half;
        const avgB  = last6.slice(half).reduce((s, v) => s + v, 0) / (last6.length - half);
        d.trendDirection = avgB > avgA ? 'up' : avgB < avgA ? 'down' : 'stable';
        d.trendPercent   = avgA > 0 ? ((avgB - avgA) / avgA) * 100 : 0;
      } else {
        d.trendDirection = 'stable'; d.trendPercent = 0;
      }
    });
    return p;
  }, [filteredExpenses]);

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    const data = Array(12).fill(null).map(() => ({ total: 0, count: 0 }));
    filteredExpenses.forEach(e => {
      const m = new Date(e.date + 'T00:00:00Z').getUTCMonth();
      data[m].total += e.amount; data[m].count += 1;
    });
    return MONTHS_SHORT.map((month, i) => ({ month, ...data[i] }));
  }, [filteredExpenses]);

  // Forecast
  const forecast = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    if (years.length < 2) return null;
    const pts = years.map((y, i) => ({ x: i, y: yearOverYearData[y].total }));
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p.x, 0);
    const sy = pts.reduce((s, p) => s + p.y, 0);
    const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sx2 = pts.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const intercept = (sy - slope * sx) / n;
    return {
      nextYear: parseInt(years[years.length - 1]) + 1,
      predicted: Math.max(0, slope * n + intercept),
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    };
  }, [yearOverYearData]);

  const topCategories = useMemo(() =>
    Object.entries(categoryPatterns).sort((a, b) => b[1].total - a[1].total),
  [categoryPatterns]);

  const grandTotal     = topCategories.reduce((s, [, d]) => s + d.total, 0);
  const totalCatPages  = Math.ceil(topCategories.length / CATS_PER_PAGE);
  const pagedCats      = topCategories.slice((categoryPage - 1) * CATS_PER_PAGE, categoryPage * CATS_PER_PAGE);
  const maxMonthly     = Math.max(...monthlyTotals.map(m => m.total), 1);

  // Monthly stat callouts
  const lowestMonth  = monthlyTotals.filter(m => m.total > 0).sort((a, b) => a.total - b.total)[0];
  const highestMonth = monthlyTotals.reduce((mx, m) => m.total > mx.total ? m : mx, monthlyTotals[0]);
  const monthlyAvg   = monthlyTotals.reduce((s, m) => s + m.total, 0) / 12;

  // ── Empty states ─────────────────────────────────────────────────────────────
  if (!expenses.length) return (
    <Card className="p-12 text-center">
      <AlertCircle className="w-10 h-10 text-purple-400 mx-auto mb-4" />
      <p className="text-white font-bold text-lg mb-2">No expense data yet</p>
      <p className="text-purple-400 text-sm">Add some expenses to see analytics and insights.</p>
    </Card>
  );

  if (!filteredExpenses.length) return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-purple-400 text-xs mt-0.5">Deep insights into your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <select value={analysisType} onChange={e => { setAnalysisType(e.target.value); setCategoryPage(1); }}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
            <option value="recurring">Recurring</option>
            <option value="non-recurring">Non-Recurring</option>
          </select>
        </div>
      </div>
      <Card className="p-12 text-center">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-4" />
        <p className="text-white font-bold text-lg mb-2">No paid {typeLabel} expenses</p>
        <p className="text-purple-400 text-sm">Only PAID expenses are included in analytics.</p>
      </Card>
    </div>
  );

  // ── Full render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header + controls ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-purple-400 text-xs mt-0.5">
            {typeLabel} · {filteredExpenses.length} paid expenses · {fmt(grandTotal)} total
          </p>
        </div>
        <div className="flex gap-2">
          <select value={analysisType} onChange={e => { setAnalysisType(e.target.value); setCategoryPage(1); }}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
            <option value="recurring">Recurring</option>
            <option value="non-recurring">Non-Recurring</option>
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
            <option value="All">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Biggest expense callout ────────────────────────────────────────── */}
      <BiggestExpenseCallout expenses={expenses} analysisType={analysisType} />

      {/* ── YoY cards ─────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon={Calendar} iconColor="text-blue-400" title="Year-over-Year Comparison" sub="Total paid spend per year" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {Object.entries(yearOverYearData).sort((a, b) => b[0] - a[0]).map(([yr, data]) => (
            <div key={yr} className="bg-white/5 border border-white/10 border-l-4 border-l-violet-500 rounded-lg p-3">
              <p className="text-purple-400 text-xs mb-1">{yr}</p>
              <p className="text-white font-bold text-xl leading-none">{fmt(data.total)}</p>
              <p className="text-purple-500 text-xs mt-1">{data.count} transactions</p>
            </div>
          ))}
        </div>

        {yoyGrowth.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-3">Growth Analysis</p>
            {yoyGrowth.map(item => (
              <div key={item.year} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                <div>
                  <p className="text-white font-semibold text-sm">{item.year} vs {parseInt(item.year) - 1}</p>
                  <p className="text-purple-400 text-xs">{fmt(item.current)} vs {fmt(item.previous)}</p>
                </div>
                <TrendBadge direction={item.growth > 0 ? 'up' : 'down'} value={item.growth} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Forecast ──────────────────────────────────────────────────────── */}
      {forecast && (
        <Card className="p-5">
          <SectionHeader icon={Target} iconColor="text-purple-400" title="Spending Forecast" sub={`Predicted ${typeLabel} spend for ${forecast.nextYear} based on historical trend`} />
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4">
            <div>
              <p className="text-purple-400 text-xs mb-1">Predicted for {forecast.nextYear}</p>
              <p className="text-white font-bold text-3xl">{fmt(forecast.predicted)}</p>
            </div>
            <TrendBadge
              direction={forecast.trend === 'increasing' ? 'up' : forecast.trend === 'decreasing' ? 'down' : 'stable'}
              value={null}
            />
          </div>
        </Card>
      )}

      {/* ── Month-over-Month table ─────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader
          icon={BarChart3} iconColor="text-cyan-400"
          title="Month-over-Month Breakdown"
          sub={`${typeLabel} spend per category per month · arrows show change vs prior month`}
        />
        <MoMTable expenses={expenses} analysisType={analysisType} />
      </Card>

      {/* ── Category patterns ─────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader
          icon={PieChart} iconColor="text-green-400"
          title="Category Spending Patterns"
          sub={`${topCategories.length} categories tracked`}
          right={
            <span className="text-purple-400 text-xs">{filteredExpenses.length} transactions</span>
          }
        />

        {/* Bar chart */}
        <div className="space-y-2 mb-5">
          {topCategories.map(([cat, data]) => {
            const w = (data.total / topCategories[0][1].total) * 100;
            return (
              <div
                key={cat}
                onClick={() => onCategoryClick?.(cat)}
                className={`group rounded-lg px-2 py-1.5 -mx-2 transition-colors
                  ${onCategoryClick ? 'cursor-pointer hover:bg-white/8' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium group-hover:text-purple-200 transition-colors">
                    {cat}
                    {onCategoryClick && <span className="text-purple-600 text-xs ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">→ drill down</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 text-xs">{fmt(data.total)}</span>
                    <TrendBadge direction={data.trendDirection} value={data.trendPercent} />
                  </div>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed table with pagination */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Detailed Breakdown</p>
            {totalCatPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setCategoryPage(p => Math.max(1, p - 1))} disabled={categoryPage === 1}
                  className="px-2 py-1 rounded text-xs bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all">‹</button>
                <span className="text-purple-400 text-xs">{categoryPage} / {totalCatPages}</span>
                <button onClick={() => setCategoryPage(p => Math.min(totalCatPages, p + 1))} disabled={categoryPage === totalCatPages}
                  className="px-2 py-1 rounded text-xs bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all">›</button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/15">
                  {['Category','Total','Count','Yearly Avg','Per Trans','% Total','Trend'].map(h => (
                    <th key={h} className={`py-2 text-purple-300 font-semibold text-xs ${h === 'Category' ? 'text-left pr-4' : 'text-right px-2'} ${h === 'Trend' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedCats.map(([cat, data]) => (
                  <tr key={cat} className="border-b border-white/8 hover:bg-white/5 transition-colors">
                    <td className="py-2 pr-4 text-white font-medium">{cat}</td>
                    <td className="py-2 px-2 text-white font-semibold text-right">{fmt(data.total)}</td>
                    <td className="py-2 px-2 text-purple-300 text-right">{data.count}</td>
                    <td className="py-2 px-2 text-white text-right">{fmt(data.yearlyAverage)}</td>
                    <td className="py-2 px-2 text-white text-right">{fmt(data.monthlyAverage)}</td>
                    <td className="py-2 px-2 text-purple-300 text-right">{((data.total / grandTotal) * 100).toFixed(1)}%</td>
                    <td className="py-2 px-2 text-center">
                      <TrendBadge direction={data.trendDirection} value={data.trendPercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Monthly totals ─────────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon={Activity} iconColor="text-orange-400" title="Monthly Spending Totals" sub="Total paid per month across all categories" />

        <div className="space-y-2 mb-5">
          {monthlyTotals.map(data => (
            <div key={data.month} className="flex items-center gap-3 group">
              <span className="w-9 text-purple-300 text-xs font-semibold shrink-0">{data.month}</span>
              <div className="flex-1 bg-white/8 rounded-full h-7 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500 flex items-center justify-end pr-3 group-hover:brightness-110"
                  style={{ width: `${(data.total / maxMonthly) * 100}%`, minWidth: data.total > 0 ? 56 : 0 }}
                >
                  {data.total > 0 && (
                    <span className="text-white text-xs font-bold whitespace-nowrap">{fmt(data.total)}</span>
                  )}
                </div>
              </div>
              <span className="text-purple-500 text-xs w-14 text-right shrink-0">{data.count} txns</span>
            </div>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-4">
          {[
            { label: 'Total Spend',    value: fmt(monthlyTotals.reduce((s,m) => s+m.total, 0)), icon: DollarSign,   color: 'border-l-violet-500', sub: 'all months' },
            { label: 'Lowest Month',   value: lowestMonth?.month  || '—', icon: TrendingDown, color: 'border-l-green-500',  sub: lowestMonth  ? fmt(lowestMonth.total)  : '' },
            { label: 'Highest Month',  value: highestMonth?.month || '—', icon: TrendingUp,   color: 'border-l-red-500',    sub: highestMonth ? fmt(highestMonth.total) : '' },
            { label: 'Monthly Avg',    value: fmt(monthlyAvg),             icon: Activity,     color: 'border-l-blue-500',   sub: 'per month' },
          ].map(s => (
            <div key={s.label} className={`bg-white/5 border border-white/10 border-l-4 ${s.color} rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-purple-400 text-xs">{s.label}</p>
              </div>
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              {s.sub && <p className="text-purple-500 text-xs mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default AdvancedAnalytics;