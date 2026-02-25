import React, { useEffect, useState } from 'react';
import {
  Calendar, TrendingUp, TrendingDown, Download, Upload,
  Home, Wifi, Zap, Trash as TrashIcon, Building2, Droplet,
  Phone, Tv, DollarSign, Wrench, Package, Fuel, ShoppingCart,
  Eye, EyeOff, Award
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL  = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

// ─── Sparkline (pure SVG inline bar chart) ───────────────────────────────────
const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const H = 44, totalW = 176;
  const gap = 2;
  const barW = Math.floor((totalW - gap * (data.length - 1)) / data.length);

  return (
    <svg width={totalW} height={H} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * H, d.value > 0 ? 3 : 0);
        const x = i * (barW + gap);
        return (
          <g key={i}>
            <rect
              x={x} y={H - barH} width={barW} height={barH}
              rx={2}
              fill={d.isCurrent ? '#34d399' : '#a78bfa'}
              opacity={d.isCurrent ? 1 : 0.5}
            />
            <title>{d.label}: ${d.value.toFixed(2)}</title>
            <rect x={x} y={0} width={barW} height={H} fill="transparent" />
          </g>
        );
      })}
    </svg>
  );
};

// ─── Small insight chip ───────────────────────────────────────────────────────
const InsightCard = ({ icon, label, value, sub, accentClass }) => (
  <div className={`rounded-lg p-3 border bg-white/5 ${accentClass} flex items-start gap-2`}>
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-purple-400 text-xs mb-0.5">{label}</p>
      <p className="text-white font-semibold text-sm truncate">{value}</p>
      {sub && <p className="text-purple-300 text-xs mt-0.5 leading-tight">{sub}</p>}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const Summary = ({
  expenses,
  categories,
  nonRecurringCategories,
  filterYear,
  setFilterYear,
  availableYears,
  getCategorySummary,
  getYearlyTotal,
  getPendingAndOverdueExpenses,
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV
}) => {
  const [hideZero, setHideZero] = useState(true);

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    if (filterYear === 'All' && availableYears.includes(parseInt(currentYear))) {
      setFilterYear(currentYear);
    }
  }, []);

  const now           = new Date();
  const currentMonth  = now.getMonth();
  const currentYear   = now.getFullYear();

  // If viewing a past year, anchor insights to Dec of that year.
  // If viewing current year (or All), anchor to today's month.
  const selectedYear  = filterYear === 'All' ? currentYear : parseInt(filterYear);
  const isPastYear    = selectedYear < currentYear;
  const thisMonth     = isPastYear ? 11 : currentMonth;   // Dec for past years
  const thisYear      = selectedYear;
  const lastMonth     = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMoYear    = thisMonth === 0 ? thisYear - 1 : thisYear;

  // ── Pure helpers ──────────────────────────────────────────────────────────
  const filterByYear = (list, year) =>
    list.filter(exp => {
      const y = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
      return (year === 'All' || y === year) && exp.status === 'PAID';
    });

  const sumForMonth = (list, m, y) =>
    list
      .filter(exp => {
        const d = new Date(exp.date + 'T00:00:00Z');
        return d.getUTCMonth() === m && d.getUTCFullYear() === y && exp.status === 'PAID';
      })
      .reduce((s, e) => s + e.amount, 0);

  // 12-month average spend per category across all years
  const buildCategoryAverages = (list) => {
    const monthlyMap = {}; // category -> { monthKey -> total }
    list.forEach(exp => {
      if (exp.status !== 'PAID') return;
      const d = new Date(exp.date + 'T00:00:00Z');
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (!monthlyMap[exp.category]) monthlyMap[exp.category] = {};
      monthlyMap[exp.category][key] = (monthlyMap[exp.category][key] || 0) + exp.amount;
    });
    const averages = {};
    Object.entries(monthlyMap).forEach(([cat, months]) => {
      const vals = Object.values(months);
      averages[cat] = vals.reduce((s, v) => s + v, 0) / vals.length;
    });
    return averages;
  };

  // Returns Tailwind color classes based on amount vs 12-month average
  // >20% above avg → red, within 20% → yellow, below avg → green, no history → neutral
  const getCategoryColor = (category, amount, averages) => {
    const avg = averages[category];
    if (avg === undefined || avg === 0) return {
      border: 'border-white/10',
      bg: 'bg-white/5',
      badge: null,
    };
    const ratio = amount / avg;
    if (ratio > 1.2) return {
      border: 'border-red-500/40',
      bg: 'bg-red-500/10',
      badge: { label: `+${((ratio - 1) * 100).toFixed(0)}% vs avg`, color: 'text-red-400' },
    };
    if (ratio > 0.8) return {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/5',
      badge: { label: `≈ avg`, color: 'text-yellow-400' },
    };
    return {
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      badge: { label: `-${((1 - ratio) * 100).toFixed(0)}% vs avg`, color: 'text-green-400' },
    };
  };

  // Sparkline: for current year show rolling last 12 months,
  // for a past year show all 12 months of that year (Jan–Dec).
  const buildSparkline = (list) => {
    if (isPastYear) {
      return Array.from({ length: 12 }, (_, i) => ({
        label    : MONTH_SHORT[i],
        value    : sumForMonth(list, i, thisYear),
        isCurrent: i === 11, // highlight Dec as the "reference" month
      }));
    }
    // Rolling last 12 months up to today
    return Array.from({ length: 12 }, (_, i) => {
      const offset   = currentMonth - 11 + i;
      const monthIdx = ((offset % 12) + 12) % 12;
      const yr       = offset < 0 ? currentYear - 1 : currentYear;
      return {
        label    : MONTH_SHORT[monthIdx],
        value    : sumForMonth(list, monthIdx, yr),
        isCurrent: monthIdx === currentMonth && yr === currentYear,
      };
    });
  };

  // Top category this month
  const topCategoryThisMonth = (list) => {
    const map = {};
    list.forEach(exp => {
      if (exp.status !== 'PAID') return;
      const d = new Date(exp.date + 'T00:00:00Z');
      if (d.getUTCMonth() === thisMonth && d.getUTCFullYear() === thisYear)
        map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    if (!Object.keys(map).length) return null;
    const [cat, amt] = Object.entries(map).sort(([,a],[,b]) => b - a)[0];
    return { category: cat, amount: amt };
  };

  // Biggest month-over-month change by category
  const biggestCategoryChange = (list) => {
    const map = {};
    list.forEach(exp => {
      if (exp.status !== 'PAID') return;
      const d = new Date(exp.date + 'T00:00:00Z');
      const m = d.getUTCMonth(), y = d.getUTCFullYear();
      if (!map[exp.category]) map[exp.category] = { cur: 0, prev: 0 };
      if (m === thisMonth && y === thisYear)   map[exp.category].cur  += exp.amount;
      if (m === lastMonth  && y === lastMoYear) map[exp.category].prev += exp.amount;
    });
    let best = null, bestDelta = 0;
    Object.entries(map).forEach(([cat, { cur, prev }]) => {
      const delta = Math.abs(cur - prev);
      if (delta > bestDelta) {
        bestDelta = delta;
        best = { category: cat, current: cur, previous: prev, delta, increased: cur > prev };
      }
    });
    return best;
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const recurringList    = expenses.filter(e => e.type === 'Recurring');
  const nonRecurringList = expenses.filter(e => e.type === 'Non-Recurring');

  const recurringAverages    = buildCategoryAverages(recurringList);
  const nonRecurringAverages = buildCategoryAverages(nonRecurringList);

  const recurringTotal    = filterByYear(recurringList,    filterYear).reduce((s, e) => s + e.amount, 0);
  const nonRecurringTotal = filterByYear(nonRecurringList, filterYear).reduce((s, e) => s + e.amount, 0);

  const recThisMonth  = sumForMonth(recurringList,    thisMonth, thisYear);
  const recLastMonth  = sumForMonth(recurringList,    lastMonth, lastMoYear);
  const nonThisMonth  = sumForMonth(nonRecurringList, thisMonth, thisYear);
  const nonLastMonth  = sumForMonth(nonRecurringList, lastMonth, lastMoYear);

  const recDiffPct = recLastMonth  > 0 ? ((recThisMonth  - recLastMonth)  / recLastMonth)  * 100 : null;
  const nonDiffPct = nonLastMonth  > 0 ? ((nonThisMonth  - nonLastMonth)  / nonLastMonth)  * 100 : null;

  // ── Small reusable pieces ─────────────────────────────────────────────────
  const getCategoryIcon = (category) => {
    const m = {
      Mortgage: <Home className="w-4 h-4" />, Rent: <Building2 className="w-4 h-4" />,
      Internet: <Wifi className="w-4 h-4" />, Electricity: <Zap className="w-4 h-4" />,
      Trash: <TrashIcon className="w-4 h-4" />, HOA: <Building2 className="w-4 h-4" />,
      Water: <Droplet className="w-4 h-4" />, 'Phone Bill': <Phone className="w-4 h-4" />,
      Subscription: <Tv className="w-4 h-4" />, Handyman: <Wrench className="w-4 h-4" />,
      'Home Improvement': <Home className="w-4 h-4" />, Gas: <Fuel className="w-4 h-4" />,
      Costco: <ShoppingCart className="w-4 h-4" />, Amazon: <Package className="w-4 h-4" />,
    };
    return m[category] || <DollarSign className="w-4 h-4" />;
  };

  const DiffBadge = ({ pct }) => {
    if (pct === null) return <span className="text-purple-500 text-xs">No prior data</span>;
    const up = pct > 0;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
      <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-red-400' : 'text-green-400'}`}>
        <Icon className="w-3 h-3" />
        {Math.abs(pct).toFixed(1)}% vs {MONTH_SHORT[lastMonth]}
      </span>
    );
  };

  const YearSelect = () => (
    <select
      value={filterYear}
      onChange={e => setFilterYear(e.target.value)}
      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
    >
      <option value="All">All Years</option>
      {availableYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
    </select>
  );

  const CategoryGrid = ({ type, total, averages }) => {
    const entries = Object.entries(getCategorySummary(type))
      .sort(([, a], [, b]) => b - a)
      .filter(([, amt]) => !hideZero || amt > 0);
    if (!entries.length)
      return <p className="text-purple-400 text-sm">No paid expenses for this period.</p>;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map(([category, amount]) => {
          const pct   = total > 0 ? (amount / total) * 100 : 0;
          const color = getCategoryColor(category, amount, averages);
          return (
            <div key={category} className={`rounded-lg p-3 border transition-all hover:brightness-110 ${color.bg} ${color.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-purple-300">{getCategoryIcon(category)}</div>
                <h3 className="text-purple-200 text-xs truncate flex-1">{category}</h3>
                <span className="text-purple-400 text-xs font-medium shrink-0">{pct.toFixed(1)}%</span>
              </div>
              <p className="text-lg font-bold text-white">${amount.toFixed(2)}</p>
              {/* vs-average badge */}
              {color.badge && (
                <p className={`text-xs font-semibold mt-1 ${color.badge.color}`}>
                  {color.badge.label}
                </p>
              )}
              {/* % of total bar */}
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    color.badge
                      ? color.badge.color.includes('red')    ? 'bg-gradient-to-r from-red-400 to-red-600'
                      : color.badge.color.includes('yellow') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      :                                        'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-purple-400 to-pink-400'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // The enriched left-side total card
  const TotalCard = ({ label, total, iconEl, iconColor, thisMonthAmt, diffPct, sparkData, expList, isPastYear }) => {
    const topCat   = topCategoryThisMonth(expList);
    const bigChg   = biggestCategoryChange(expList);
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 h-full flex flex-col gap-4">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {React.cloneElement(iconEl, { className: `w-5 h-5 ${iconColor}` })}
            <h3 className="text-purple-200 text-xs font-semibold">{label}</h3>
          </div>
          <p className="text-3xl font-bold text-white">${total.toFixed(2)}</p>
          <p className="text-purple-400 text-xs mt-1">
            {filterYear === 'All' ? 'All Years' : `Year ${filterYear}`}
          </p>
        </div>

        {/* ── This month vs last ── */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-purple-300 text-xs mb-0.5">
            {MONTH_FULL[thisMonth]}{isPastYear ? ` ${thisYear}` : ''} spend
          </p>
          <p className="text-white font-bold text-xl">${thisMonthAmt.toFixed(2)}</p>
          <div className="mt-1"><DiffBadge pct={diffPct} /></div>
        </div>

        {/* ── Sparkline ── */}
        <div>
          <p className="text-purple-400 text-xs mb-2">
            Last 12 months &nbsp;
            <span className="text-green-400">■</span>
            <span className="text-purple-500"> current month</span>
          </p>
          <Sparkline data={sparkData} />
          <div className="flex justify-between mt-1">
            <span className="text-purple-500 text-xs">{sparkData[0]?.label}</span>
            <span className="text-purple-500 text-xs">{sparkData[sparkData.length - 1]?.label}</span>
          </div>
        </div>

        {/* ── Insights ── */}
        <div className="flex flex-col gap-2">
          {topCat ? (
            <InsightCard
              icon={<Award className="w-4 h-4 text-yellow-400" />}
              label={`Top category · ${MONTH_SHORT[thisMonth]}${isPastYear ? ` ${thisYear}` : ''}`}
              value={topCat.category}
              sub={`$${topCat.amount.toFixed(2)}`}
              accentClass="border-yellow-500/30"
            />
          ) : (
            <p className="text-purple-500 text-xs">No {MONTH_FULL[thisMonth]}{isPastYear ? ` ${thisYear}` : ''} data yet.</p>
          )}

          {bigChg && (
            <InsightCard
              icon={bigChg.increased
                ? <TrendingUp className="w-4 h-4 text-red-400" />
                : <TrendingDown className="w-4 h-4 text-green-400" />}
              label={`Biggest MoM change · vs ${MONTH_SHORT[lastMonth]}`}
              value={bigChg.category}
              sub={`${bigChg.increased ? '▲' : '▼'} $${bigChg.delta.toFixed(2)}  (${MONTH_SHORT[lastMonth]} $${bigChg.previous.toFixed(2)} → ${MONTH_SHORT[thisMonth]} $${bigChg.current.toFixed(2)})`}
              accentClass={bigChg.increased ? 'border-red-500/30' : 'border-green-500/30'}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Recurring Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-4">
          <TotalCard
            label="Total Recurring (Paid)"
            total={recurringTotal}
            iconEl={<Calendar />}
            iconColor="text-green-300"
            thisMonthAmt={recThisMonth}
            diffPct={recDiffPct}
            sparkData={buildSparkline(recurringList)}
            expList={recurringList}
            isPastYear={isPastYear}
          />
        </div>
        <div className="lg:col-span-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 h-full">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-white">Recurring Expenses Summary</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHideZero(!hideZero)}
                  className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white transition-colors"
                >
                  {hideZero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {hideZero ? 'Show $0' : 'Hide $0'}
                </button>
                <YearSelect />
              </div>
            </div>
            <p className="text-purple-200 text-xs mb-3">
              Total Paid for {filterYear === 'All' ? 'All Years' : filterYear}:{' '}
              <span className="text-white font-bold text-base">${getYearlyTotal('Recurring').toFixed(2)}</span>
            </p>
            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Above avg (&gt;20%)</span>
              <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>Near avg (±20%)</span>
              <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Below avg</span>
              <span className="flex items-center gap-1.5 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/>No history</span>
            </div>
            <CategoryGrid type="Recurring" total={recurringTotal} averages={recurringAverages} />
          </div>
        </div>
      </div>

      {/* ── Non-Recurring Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-4">
          <TotalCard
            label="Total Non-Recurring (Paid)"
            total={nonRecurringTotal}
            iconEl={<TrendingUp />}
            iconColor="text-blue-300"
            thisMonthAmt={nonThisMonth}
            diffPct={nonDiffPct}
            sparkData={buildSparkline(nonRecurringList)}
            expList={nonRecurringList}
            isPastYear={isPastYear}
          />
        </div>
        <div className="lg:col-span-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 h-full">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-white">Non-Recurring Expenses Summary</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHideZero(!hideZero)}
                  className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white transition-colors"
                >
                  {hideZero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {hideZero ? 'Show $0' : 'Hide $0'}
                </button>
                <YearSelect />
              </div>
            </div>
            <p className="text-purple-200 text-xs mb-3">
              Total Paid for {filterYear === 'All' ? 'All Years' : filterYear}:{' '}
              <span className="text-white font-bold text-base">${getYearlyTotal('Non-Recurring').toFixed(2)}</span>
            </p>
            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Above avg (&gt;20%)</span>
              <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>Near avg (±20%)</span>
              <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Below avg</span>
              <span className="flex items-center gap-1.5 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/>No history</span>
            </div>
            <CategoryGrid type="Non-Recurring" total={nonRecurringTotal} averages={nonRecurringAverages} />
          </div>
        </div>
      </div>

      {/* ── Data Management ────────────────────────────────────────────────── */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportToJSON} className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <label className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" /> Import JSON
            <input type="file" accept=".json" onChange={importFromJSON} className="hidden" />
          </label>
          <label className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
          </label>
        </div>
      </div>
    </>
  );
};

export default Summary;