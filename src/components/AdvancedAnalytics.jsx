// src/components/AdvancedAnalytics.jsx

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Calendar, DollarSign,
  BarChart3, PieChart, Target, Activity, Minus,
  AlertCircle, Award, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import MonthlyDrillDownModal from './MonthlyDrillDownModal';
import { CategoryPatternsCard, MonthlyTotalsCard } from './AnalyticsCards';
import SpendingTimeline from './SpendingTimeline';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const fmt = (n) => '$' + n.toFixed(2);
const pct = (a, b) => b > 0 ? ((a - b) / b) * 100 : null;

const Card = ({ children, className }) => (
  <div className={'bg-white/10 backdrop-blur-lg rounded-xl border border-white/15 ' + (className || '')}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, iconColor, title, sub, right }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="bg-white/10 p-2 rounded-lg shrink-0">
        <Icon className={'w-4 h-4 ' + (iconColor || 'text-purple-400')} />
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
  if (direction === 'stable' || value === null) {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2 py-0.5 rounded text-xs font-semibold">
        <Minus className="w-3 h-3" /> Stable
      </span>
    );
  }
  const up = direction === 'up';
  const cls = up
    ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border bg-red-500/15 text-red-300 border-red-500/25'
    : 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border bg-green-500/15 text-green-300 border-green-500/25';
  const arrow = up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  const label = value !== null ? (Math.abs(value).toFixed(1) + '%') : '-';
  return <span className={cls}>{arrow}{label}</span>;
};

// MoM table - extracted to avoid complex JSX
const MoMTable = ({ expenses, analysisType, selectedYear }) => {
  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';
  const paid = expenses.filter(e => {
    const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear().toString();
    return e.type === typeLabel && e.status === 'PAID'
      && (selectedYear === 'All' || yr === selectedYear);
  });

  const allYears = [...new Set(paid.map(e =>
    new Date(e.date + 'T00:00:00Z').getUTCFullYear()
  ))].sort((a, b) => b - a);

  const currentYear = selectedYear !== 'All' ? parseInt(selectedYear) : allYears[0];
  const prevYear = allYears.find(y => y < currentYear) || null;

  const cats = [...new Set(paid.map(e => e.category))].sort();
  const grid = {};
  cats.forEach(cat => {
    grid[cat] = {};
    MONTHS_SHORT.forEach(m => { grid[cat][m] = {}; });
  });
  paid.forEach(e => {
    const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
    const mo = MONTHS_SHORT[new Date(e.date + 'T00:00:00Z').getUTCMonth()];
    if (!grid[e.category]) return;
    if (!grid[e.category][mo]) grid[e.category][mo] = {};
    grid[e.category][mo][yr] = (grid[e.category][mo][yr] || 0) + e.amount;
  });

  const activeMos = MONTHS_SHORT.filter(m => cats.some(c => (grid[c]?.[m]?.[currentYear] || 0) > 0));

  if (cats.length === 0 || activeMos.length === 0) {
    return <p className="text-purple-400 text-sm text-center py-6">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto mom-table">
      <table className="w-full text-xs min-w-max">
        <thead>
          <tr className="border-b border-white/15">
            <th className="text-left text-purple-300 font-semibold py-2 px-4 sticky left-0 bg-slate-900 z-10 whitespace-nowrap min-w-[140px]">
              Category
            </th>
            {activeMos.map(m => (
              <th key={m} className="text-center text-purple-300 font-semibold py-2 px-3 whitespace-nowrap">{m}</th>
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
                  const cur = grid[cat]?.[m]?.[currentYear] || 0;
                  const prevMo = mi > 0 ? activeMos[mi - 1] : null;
                  const prevMoV = prevMo ? (grid[cat]?.[prevMo]?.[currentYear] || 0) : null;
                  const delta = prevMoV !== null ? cur - prevMoV : null;
                  const deltaUp = delta !== null && delta > 0;
                  const deltaCls = deltaUp
                    ? 'text-[9px] font-bold flex items-center gap-0.5 text-red-400'
                    : 'text-[9px] font-bold flex items-center gap-0.5 text-green-400';
                  return (
                    <td key={m} className="py-2 px-2 text-center">
                      {cur > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-white font-semibold">{'$'}{Math.round(cur)}</span>
                          {delta !== null && delta !== 0 && (
                            <span className={deltaCls}>
                              {deltaUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                              {'$'}{Math.abs(Math.round(delta))}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/15">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 pl-4 text-right text-white font-bold whitespace-nowrap">{fmt(rowTotal)}</td>
              </tr>
            );
          })}
          <tr className="border-t border-white/20 bg-white/5">
            <td className="py-2 px-4 text-purple-200 font-bold sticky left-0 bg-slate-900 z-10 min-w-[140px]">Total</td>
            {activeMos.map(m => {
              const total = cats.reduce((s, c) => s + (grid[c]?.[m]?.[currentYear] || 0), 0);
              const totalStr = total > 0 ? ('$' + Math.round(total)) : '-';
              return (
                <td key={m} className="py-2 px-2 text-center text-purple-200 font-bold">{totalStr}</td>
              );
            })}
            <td className="py-2 pl-4 text-right text-white font-bold">
              {fmt(cats.reduce((s, c) => s + activeMos.reduce((ms, m) => ms + (grid[c]?.[m]?.[currentYear] || 0), 0), 0))}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-purple-500 text-xs mt-2">
        {'Up/down arrows: change vs prior month - showing ' + currentYear}
        {prevYear ? ' (' + prevYear + ' data available)' : ''}
      </p>
    </div>
  );
};

const BiggestExpenseCallout = ({ expenses, analysisType }) => {
  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';
  const paid = expenses.filter(e => e.type === typeLabel && e.status === 'PAID');
  if (!paid.length) return null;
  const biggest = paid.reduce((max, e) => e.amount > max.amount ? e : max, paid[0]);
  const avg = paid.reduce((s, e) => s + e.amount, 0) / paid.length;
  const pctAbove = ((biggest.amount - avg) / avg * 100).toFixed(0);
  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-900/20 p-5">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
      <div className="flex items-start gap-4">
        <div className="bg-yellow-500/20 border border-yellow-500/30 p-2.5 rounded-xl shrink-0">
          <Award className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">
            {'Largest Single ' + typeLabel + ' Expense'}
          </p>
          <p className="text-white font-bold text-3xl leading-none mb-1">{fmt(biggest.amount)}</p>
          <p className="text-purple-200 text-sm font-medium truncate">{biggest.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">{biggest.category}</span>
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">{biggest.date}</span>
            <span className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">{biggest.paymentType || 'N/A'}</span>
            <span className="bg-red-500/20 text-red-300 border border-red-500/25 text-xs px-2 py-0.5 rounded-full font-semibold">
              {pctAbove + '% above avg'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdvancedAnalytics = ({ expenses = [], categories = [], nonRecurringCategories = [], onCategoryClick }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [analysisType, setAnalysisType] = useState('recurring');
  const [categoryPage, setCategoryPage] = useState(1);
  const [drillMonth,   setDrillMonth]   = useState(null);
  const CATS_PER_PAGE = 5;

  const availableYears = useMemo(() => {
    const s = new Set();
    expenses.forEach(e => s.add(new Date(e.date + 'T00:00:00Z').getUTCFullYear()));
    return [...s].sort((a, b) => b - a);
  }, [expenses]);

  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';

  const allYearExpenses = useMemo(() =>
    expenses.filter(e => e.type === typeLabel && e.status === 'PAID'),
  [expenses, analysisType]);

  const filteredExpenses = useMemo(() =>
    allYearExpenses.filter(e => {
      const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear().toString();
      return selectedYear === 'All' || yr === selectedYear;
    }),
  [allYearExpenses, selectedYear]);

  const yearOverYearData = useMemo(() => {
    const map = {};
    allYearExpenses.forEach(e => {
      const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
      if (!map[yr]) map[yr] = { total: 0, count: 0 };
      map[yr].total += e.amount;
      map[yr].count += 1;
    });
    return map;
  }, [allYearExpenses]);

  const yoyGrowth = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    return years.slice(1).map((yr, i) => {
      const cur  = yearOverYearData[yr].total;
      const prev = yearOverYearData[years[i]].total;
      return { year: yr, current: cur, previous: prev, growth: pct(cur, prev) };
    });
  }, [yearOverYearData]);

  const categoryPatterns = useMemo(() => {
    const p = {};
    filteredExpenses.forEach(e => {
      if (!p[e.category]) p[e.category] = { total: 0, count: 0, byYear: {}, byMonth: {} };
      p[e.category].total += e.amount;
      p[e.category].count += 1;
      const yr  = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
      const mok = yr + '-' + new Date(e.date + 'T00:00:00Z').getUTCMonth();
      p[e.category].byYear[yr]   = (p[e.category].byYear[yr]   || 0) + e.amount;
      p[e.category].byMonth[mok] = (p[e.category].byMonth[mok] || 0) + e.amount;
    });
    Object.values(p).forEach(d => {
      const yrs = Object.keys(d.byYear).length;
      d.yearlyAverage  = yrs > 0 ? d.total / yrs : 0;
      d.monthlyAverage = d.count > 0 ? d.total / d.count : 0;
      const mkeys = Object.keys(d.byMonth).sort();
      const last6 = mkeys.slice(-6).map(k => d.byMonth[k]);
      if (last6.length >= 2) {
        const half = Math.floor(last6.length / 2);
        const avgA = last6.slice(0, half).reduce((s, v) => s + v, 0) / half;
        const avgB = last6.slice(half).reduce((s, v) => s + v, 0) / (last6.length - half);
        d.trendDirection = avgB > avgA ? 'up' : avgB < avgA ? 'down' : 'stable';
        d.trendPercent   = avgA > 0 ? ((avgB - avgA) / avgA) * 100 : 0;
      } else {
        d.trendDirection = 'stable'; d.trendPercent = 0;
      }
    });
    return p;
  }, [filteredExpenses]);

  const monthlyTotals = useMemo(() => {
    const data = Array(12).fill(null).map(() => ({ total: 0, count: 0 }));
    filteredExpenses.forEach(e => {
      const m = new Date(e.date + 'T00:00:00Z').getUTCMonth();
      data[m].total += e.amount; data[m].count += 1;
    });
    return MONTHS_SHORT.map((month, i) => ({ month, ...data[i] }));
  }, [filteredExpenses]);

  const forecast = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    if (years.length < 2) return null;
    const pts = years.map((y, i) => ({ x: i, y: yearOverYearData[y].total }));
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p.x, 0);
    const sy = pts.reduce((s, p) => s + p.y, 0);
    const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sx2 = pts.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sx2 - sx * sx;
    const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
    const intercept = (sy - slope * sx) / n;
    const predicted = Math.max(0, slope * n + intercept);
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const nextYear = parseInt(years[years.length - 1]) + 1;
    return { nextYear, predicted, trend };
  }, [yearOverYearData]);

  const topCategories = useMemo(() =>
    Object.entries(categoryPatterns).sort((a, b) => b[1].total - a[1].total),
  [categoryPatterns]);

  const grandTotal    = topCategories.reduce((s, e) => s + e[1].total, 0);
  const totalCatPages = Math.ceil(topCategories.length / CATS_PER_PAGE);
  const pagedCats     = topCategories.slice((categoryPage - 1) * CATS_PER_PAGE, categoryPage * CATS_PER_PAGE);
  const maxMonthly    = Math.max(...monthlyTotals.map(m => m.total), 1);
  const lowestMonth   = monthlyTotals.filter(m => m.total > 0).sort((a, b) => a.total - b.total)[0];
  const highestMonth  = monthlyTotals.reduce((mx, m) => m.total > mx.total ? m : mx, monthlyTotals[0]);
  const monthlyAvg    = monthlyTotals.reduce((s, m) => s + m.total, 0) / 12;

  const handlePrevPage = () => setCategoryPage(p => p > 1 ? p - 1 : 1);
  const handleNextPage = () => setCategoryPage(p => p < totalCatPages ? p + 1 : totalCatPages);
  const handleDrillMonth = (idx, label) => setDrillMonth({ idx, label });
  const handleCloseDrill = () => setDrillMonth(null);

  if (!expenses.length) return (
    <Card className="p-12 text-center">
      <AlertCircle className="w-10 h-10 text-purple-400 mx-auto mb-4" />
      <p className="text-white font-bold text-lg mb-2">No expense data yet</p>
      <p className="text-purple-400 text-sm">Add some expenses to see analytics.</p>
    </Card>
  );

  const handleTypeChange = (e) => { setAnalysisType(e.target.value); setCategoryPage(1); };
  const handleYearChange = (e) => setSelectedYear(e.target.value);

  const selectCls = "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400";

  if (!filteredExpenses.length) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-purple-400 text-xs mt-0.5">Deep insights into your spending patterns</p>
        </div>
        <select value={analysisType} onChange={handleTypeChange} className={selectCls}>
          <option value="recurring">Recurring</option>
          <option value="non-recurring">Non-Recurring</option>
        </select>
      </div>
      <Card className="p-12 text-center">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-4" />
        <p className="text-white font-bold text-lg mb-2">{'No paid ' + typeLabel + ' expenses'}</p>
        <p className="text-purple-400 text-sm">Only PAID expenses are included in analytics.</p>
      </Card>
    </div>
  );

  const summaryLine = typeLabel + ' - ' + filteredExpenses.length + ' paid expenses - ' + fmt(grandTotal) + ' total';

  const forecastSub = forecast
    ? 'Predicted ' + typeLabel + ' spend for ' + forecast.nextYear + ' based on historical trend'
    : '';

  const forecastTrend = forecast
    ? (forecast.trend === 'increasing' ? 'up' : forecast.trend === 'decreasing' ? 'down' : 'stable')
    : 'stable';

  return (
    <React.Fragment>
      <div className="space-y-5">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Advanced Analytics</h1>
            <p className="text-purple-400 text-xs mt-0.5">{summaryLine}</p>
          </div>
          <div className="flex gap-2">
            <select value={analysisType} onChange={handleTypeChange} className={selectCls}>
              <option value="recurring">Recurring</option>
              <option value="non-recurring">Non-Recurring</option>
            </select>
            <select value={selectedYear} onChange={handleYearChange} className={selectCls}>
              <option value="All">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <BiggestExpenseCallout expenses={allYearExpenses} analysisType={analysisType} />

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
              {yoyGrowth.map(item => {
                const growthDir = item.growth !== null && item.growth > 0 ? 'up' : 'down';
                return (
                  <div key={item.year} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                    <div>
                      <p className="text-white font-semibold text-sm">{item.year + ' vs ' + (parseInt(item.year) - 1)}</p>
                      <p className="text-purple-400 text-xs">{fmt(item.current) + ' vs ' + fmt(item.previous)}</p>
                    </div>
                    <TrendBadge direction={growthDir} value={item.growth} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {forecast && (
          <Card className="p-5">
            <SectionHeader icon={Target} iconColor="text-purple-400" title="Spending Forecast" sub={forecastSub} />
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4">
              <div>
                <p className="text-purple-400 text-xs mb-1">{'Predicted for ' + forecast.nextYear}</p>
                <p className="text-white font-bold text-3xl">{fmt(forecast.predicted)}</p>
              </div>
              <TrendBadge direction={forecastTrend} value={null} />
            </div>
          </Card>
        )}

        <Card className="p-5">
          <SectionHeader
            icon={BarChart3}
            iconColor="text-pink-400"
            title="Spending Timeline"
            sub={'All-time ' + typeLabel + ' spend by month - hover bars for details'}
          />
          <SpendingTimeline expenses={expenses} analysisType={analysisType} />
        </Card>

        <Card className="p-5">
          <SectionHeader
            icon={BarChart3}
            iconColor="text-cyan-400"
            title="Month-over-Month Breakdown"
            sub={typeLabel + ' spend per category per month - arrows show change vs prior month'}
          />
          <MoMTable expenses={expenses} analysisType={analysisType} selectedYear={selectedYear} />
        </Card>

        <CategoryPatternsCard
          topCategories={topCategories}
          pagedCats={pagedCats}
          grandTotal={grandTotal}
          categoryPage={categoryPage}
          totalCatPages={totalCatPages}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          onCategoryClick={onCategoryClick}
          selectedYear={selectedYear}
          filteredExpenses={filteredExpenses}
          Card={Card}
          SectionHeader={SectionHeader}
          PieChart={PieChart}
        />

        <MonthlyTotalsCard
          monthlyTotals={monthlyTotals}
          maxMonthly={maxMonthly}
          MONTHS_FULL={MONTHS_FULL}
          lowestMonth={lowestMonth}
          highestMonth={highestMonth}
          monthlyAvg={monthlyAvg}
          onDrillMonth={handleDrillMonth}
          Card={Card}
          SectionHeader={SectionHeader}
          Activity={Activity}
          DollarSign={DollarSign}
          TrendingDown={TrendingDown}
          TrendingUp={TrendingUp}
        />

      </div>

      <MonthlyDrillDownModal
        isOpen={drillMonth !== null}
        onClose={handleCloseDrill}
        monthLabel={drillMonth ? drillMonth.label : ''}
        monthIdx={drillMonth ? drillMonth.idx : null}
        selectedYear={selectedYear}
        expenses={expenses}
        analysisType={analysisType}
      />
    </React.Fragment>
  );
};

export default AdvancedAnalytics;