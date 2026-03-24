// src/components/Visualizations.jsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { TrendingUp, PieChart, BarChart3, Activity, Calendar } from 'lucide-react';

Chart.register(...registerables);

// ── App-coherent palette ──────────────────────────────────────────────────────
const PALETTE = [
  '#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#f97316', '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6',
];

const CHART_DEFAULTS = {
  legend: (pos = 'bottom') => ({
    position: pos,
    labels: { color: 'rgba(216,180,254,0.85)', padding: 16, font: { size: 12 }, boxWidth: 12, boxHeight: 12 },
  }),
  tooltip: (fmt) => ({
    backgroundColor: 'rgba(15,10,30,0.92)',
    titleColor: '#e9d5ff',
    bodyColor: '#c4b5fd',
    borderColor: 'rgba(139,92,246,0.3)',
    borderWidth: 1,
    padding: 10,
    callbacks: fmt || {},
  }),
  gridColor: 'rgba(255,255,255,0.06)',
  tickColor: 'rgba(196,165,253,0.7)',
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Section wrapper ───────────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/15 ${className}`}>
    {children}
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, sub, iconColor = 'text-purple-400' }) => (
  <div className="flex items-center gap-3 mb-1">
    <div className={`bg-white/10 p-2 rounded-lg`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div>
      <h2 className="text-white font-bold text-base leading-none">{title}</h2>
      {sub && <p className="text-purple-400 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Inline doughnut legend ────────────────────────────────────────────────────
const DonutLegend = ({ data, total, colors, onCategoryClick }) => (
  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] pr-1">
    {data.map(([cat, amt], i) => {
      const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : '0.0';
      return (
        <div
          key={cat}
          onClick={() => onCategoryClick?.(cat, filterYear)}
          className={`flex items-center gap-2 group rounded-lg px-1.5 py-1 -mx-1.5 transition-colors
            ${onCategoryClick ? 'cursor-pointer hover:bg-white/10' : ''}`}
        >
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colors[i] }} />
          <span className="text-purple-200 text-xs flex-1 truncate group-hover:text-white transition-colors">{cat}</span>
          <div className="text-right shrink-0">
            <span className="text-white text-xs font-semibold">${amt.toFixed(0)}</span>
            <span className="text-purple-500 text-xs ml-1">{pct}%</span>
          </div>
          {onCategoryClick && (
            <span className="text-purple-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          )}
        </div>
      );
    })}
  </div>
);

// ── Spend Heatmap (pure SVG/div, no Chart.js) ─────────────────────────────────
const SpendHeatmap = ({ expenses, filterYear }) => {
  const filtered = expenses.filter(e => {
    const y = new Date(e.date + 'T00:00:00Z').getUTCFullYear().toString();
    return (filterYear === 'All' || y === filterYear) && e.status === 'PAID';
  });

  // Build month × type grid
  const grid = MONTHS_FULL.map(month => ({
    month,
    recurring:    filtered.filter(e => e.month === month && e.type === 'Recurring').reduce((s, e) => s + e.amount, 0),
    nonRecurring: filtered.filter(e => e.month === month && e.type === 'Non-Recurring').reduce((s, e) => s + e.amount, 0),
    total:        filtered.filter(e => e.month === month).reduce((s, e) => s + e.amount, 0),
  }));

  const maxVal = Math.max(...grid.map(g => g.total), 1);

  const heatColor = (val) => {
    const intensity = val / maxVal;
    if (intensity === 0) return 'rgba(255,255,255,0.04)';
    if (intensity < 0.25) return 'rgba(124,58,237,0.25)';
    if (intensity < 0.5)  return 'rgba(124,58,237,0.45)';
    if (intensity < 0.75) return 'rgba(109,40,217,0.65)';
    return 'rgba(109,40,217,0.88)';
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-2 mb-3 justify-end">
        <span className="text-purple-500 text-xs">Low</span>
        {['rgba(255,255,255,0.04)', 'rgba(124,58,237,0.25)', 'rgba(124,58,237,0.45)', 'rgba(109,40,217,0.65)', 'rgba(109,40,217,0.88)'].map((c, i) => (
          <div key={i} className="w-5 h-3 rounded-sm border border-white/10" style={{ background: c }} />
        ))}
        <span className="text-purple-500 text-xs">High</span>
      </div>

      {/* Grid: 12 months × 2 rows */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'auto repeat(12, 1fr)' }}>
        {/* Column headers */}
        <div />
        {MONTHS_SHORT.map(m => (
          <div key={m} className="text-purple-400 text-xs text-center font-medium pb-1">{m}</div>
        ))}

        {/* Recurring row */}
        <div className="text-purple-400 text-xs font-medium self-center pr-2 whitespace-nowrap">Recurring</div>
        {grid.map(({ month, recurring }) => (
          <div
            key={month}
            title={`${month} Recurring: $${recurring.toFixed(2)}`}
            className="h-8 rounded-md border border-white/10 flex items-center justify-center cursor-default transition-all hover:scale-105 hover:border-purple-400/50"
            style={{ background: heatColor(recurring) }}
          >
            {recurring > 0 && (
              <span className="text-white/70 text-[9px] font-medium">${Math.round(recurring / 1000) > 0 ? Math.round(recurring / 1000) + 'k' : Math.round(recurring)}</span>
            )}
          </div>
        ))}

        {/* Non-Recurring row */}
        <div className="text-purple-400 text-xs font-medium self-center pr-2 whitespace-nowrap">Non-Rec</div>
        {grid.map(({ month, nonRecurring }) => (
          <div
            key={month}
            title={`${month} Non-Recurring: $${nonRecurring.toFixed(2)}`}
            className="h-8 rounded-md border border-white/10 flex items-center justify-center cursor-default transition-all hover:scale-105 hover:border-blue-400/50"
            style={{ background: heatColor(nonRecurring) }}
          >
            {nonRecurring > 0 && (
              <span className="text-white/70 text-[9px] font-medium">${Math.round(nonRecurring / 1000) > 0 ? Math.round(nonRecurring / 1000) + 'k' : Math.round(nonRecurring)}</span>
            )}
          </div>
        ))}

        {/* Total row */}
        <div className="text-purple-400 text-xs font-medium self-center pr-2">Total</div>
        {grid.map(({ month, total }) => (
          <div
            key={month}
            title={`${month} Total: $${total.toFixed(2)}`}
            className="h-8 rounded-md border border-white/10 flex items-center justify-center cursor-default transition-all hover:scale-105 hover:border-white/30"
            style={{ background: heatColor(total) }}
          >
            {total > 0 && (
              <span className="text-white/80 text-[9px] font-bold">${Math.round(total / 1000) > 0 ? Math.round(total / 1000) + 'k' : Math.round(total)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Visualizations = ({ expenses, filterYear, setFilterYear, availableYears, onCategoryClick }) => {
  const mixedRef          = useRef(null);
  const cumulativeRef     = useRef(null);
  const recurDonutRef     = useRef(null);
  const nonRecurDonutRef  = useRef(null);
  const mixedInst         = useRef(null);
  const cumulativeInst    = useRef(null);
  const recurDonutInst    = useRef(null);
  const nonRecurDonutInst = useRef(null);

  // ── Derived data ────────────────────────────────────────────────────────────
  const yearFiltered = expenses.filter(e => {
    const y = new Date(e.date + 'T00:00:00Z').getUTCFullYear().toString();
    return filterYear === 'All' || y === filterYear;
  });

  const recurPaid    = yearFiltered.filter(e => e.type === 'Recurring'    && e.status === 'PAID');
  const nonRecurPaid = yearFiltered.filter(e => e.type === 'Non-Recurring' && e.status === 'PAID');

  const recurTotal    = recurPaid.reduce((s, e) => s + e.amount, 0);
  const nonRecurTotal = nonRecurPaid.reduce((s, e) => s + e.amount, 0);
  const grandTotal    = recurTotal + nonRecurTotal;

  const monthlyRec    = MONTHS_FULL.map(m => recurPaid.filter(e => e.month === m).reduce((s, e) => s + e.amount, 0));
  const monthlyNonRec = MONTHS_FULL.map(m => nonRecurPaid.filter(e => e.month === m).reduce((s, e) => s + e.amount, 0));

  // Cumulative totals
  let cumRec = 0, cumNon = 0;
  const cumulativeRec    = monthlyRec.map(v    => (cumRec += v));
  const cumulativeNonRec = monthlyNonRec.map(v => (cumNon += v));
  const cumulativeTotal  = cumulativeRec.map((v, i) => v + cumulativeNonRec[i]);

  // Category tables
  const buildCatData = (list) => {
    const map = {};
    list.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort(([,a],[,b]) => b - a).slice(0, 10);
  };
  const recurCatData    = buildCatData(recurPaid);
  const nonRecurCatData = buildCatData(nonRecurPaid);

  // ── Charts ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Destroy old
    [mixedInst, cumulativeInst, recurDonutInst, nonRecurDonutInst].forEach(r => {
      if (r.current) { r.current.destroy(); r.current = null; }
    });

    const axisOpts = {
      ticks: { color: CHART_DEFAULTS.tickColor, font: { size: 11 } },
      grid:  { color: CHART_DEFAULTS.gridColor },
    };

    // Mixed bar + trend line
    if (mixedRef.current) {
      mixedInst.current = new Chart(mixedRef.current, {
        type: 'bar',
        data: {
          labels: MONTHS_SHORT,
          datasets: [
            {
              type: 'line', label: 'Total Trend',
              data: monthlyRec.map((r, i) => r + monthlyNonRec[i]),
              borderColor: '#f472b6', backgroundColor: 'rgba(244,114,182,0.08)',
              borderWidth: 2.5, tension: 0.45, fill: true, pointRadius: 3,
              pointBackgroundColor: '#f472b6', yAxisID: 'y',
            },
            {
              type: 'bar', label: 'Recurring',
              data: monthlyRec, backgroundColor: 'rgba(124,58,237,0.75)',
              borderRadius: 4, yAxisID: 'y',
            },
            {
              type: 'bar', label: 'Non-Recurring',
              data: monthlyNonRec, backgroundColor: 'rgba(59,130,246,0.75)',
              borderRadius: 4, yAxisID: 'y',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: CHART_DEFAULTS.legend(),
            tooltip: CHART_DEFAULTS.tooltip({
              label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
            }),
          },
          scales: {
            y: { ...axisOpts, beginAtZero: true, ticks: { ...axisOpts.ticks, callback: v => '$' + v } },
            x: axisOpts,
          },
        },
      });
    }

    // Cumulative line
    if (cumulativeRef.current) {
      cumulativeInst.current = new Chart(cumulativeRef.current, {
        type: 'line',
        data: {
          labels: MONTHS_SHORT,
          datasets: [
            {
              label: 'Total', data: cumulativeTotal,
              borderColor: '#f472b6', backgroundColor: 'rgba(244,114,182,0.07)',
              borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3,
              pointBackgroundColor: '#f472b6',
            },
            {
              label: 'Recurring', data: cumulativeRec,
              borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.06)',
              borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3,
              pointBackgroundColor: '#7c3aed',
            },
            {
              label: 'Non-Recurring', data: cumulativeNonRec,
              borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)',
              borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3,
              pointBackgroundColor: '#3b82f6',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: CHART_DEFAULTS.legend(),
            tooltip: CHART_DEFAULTS.tooltip({
              label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
            }),
          },
          scales: {
            y: { ...axisOpts, beginAtZero: true, ticks: { ...axisOpts.ticks, callback: v => '$' + v } },
            x: axisOpts,
          },
        },
      });
    }

    // Recurring donut
    if (recurDonutRef.current && recurCatData.length > 0) {
      recurDonutInst.current = new Chart(recurDonutRef.current, {
        type: 'doughnut',
        data: {
          labels: recurCatData.map(([c]) => c),
          datasets: [{ data: recurCatData.map(([,v]) => v), backgroundColor: PALETTE, borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: CHART_DEFAULTS.tooltip({
              label: ctx => {
                const t = ctx.dataset.data.reduce((a,b) => a+b, 0);
                return `${ctx.label}: $${ctx.parsed.toFixed(2)} (${((ctx.parsed/t)*100).toFixed(1)}%)`;
              },
            }),
          },
        },
      });
    }

    // Non-recurring donut
    if (nonRecurDonutRef.current && nonRecurCatData.length > 0) {
      nonRecurDonutInst.current = new Chart(nonRecurDonutRef.current, {
        type: 'doughnut',
        data: {
          labels: nonRecurCatData.map(([c]) => c),
          datasets: [{ data: nonRecurCatData.map(([,v]) => v), backgroundColor: PALETTE, borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: CHART_DEFAULTS.tooltip({
              label: ctx => {
                const t = ctx.dataset.data.reduce((a,b) => a+b, 0);
                return `${ctx.label}: $${ctx.parsed.toFixed(2)} (${((ctx.parsed/t)*100).toFixed(1)}%)`;
              },
            }),
          },
        },
      });
    }

    return () => {
      [mixedInst, cumulativeInst, recurDonutInst, nonRecurDonutInst].forEach(r => {
        if (r.current) { r.current.destroy(); r.current = null; }
      });
    };
  }, [expenses, filterYear]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header + year selector ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Visualizations</h2>
          <p className="text-purple-400 text-xs mt-0.5">
            {filterYear === 'All' ? 'Showing all years' : `Showing ${filterYear}`}
            {' · '}{yearFiltered.length} expenses
          </p>
        </div>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
        >
          <option value="All">All Years</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Recurring',     value: `$${recurTotal.toFixed(2)}`,    color: 'border-l-violet-500', sub: `${recurPaid.length} entries` },
          { label: 'Non-Recurring', value: `$${nonRecurTotal.toFixed(2)}`, color: 'border-l-blue-500',   sub: `${nonRecurPaid.length} entries` },
          { label: 'Grand Total',   value: `$${grandTotal.toFixed(2)}`,    color: 'border-l-pink-500',   sub: 'all paid expenses' },
          { label: 'Categories',    value: new Set([...recurPaid, ...nonRecurPaid].map(e => e.category)).size, color: 'border-l-cyan-500', sub: 'unique categories' },
        ].map(s => (
          <Card key={s.label} className={`p-4 border-l-4 ${s.color}`}>
            <p className="text-purple-400 text-xs uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-white font-bold text-xl leading-none">{s.value}</p>
            <p className="text-purple-500 text-xs mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Monthly trend bar + line ─────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon={BarChart3} title="Monthly Expense Trends" sub="Recurring vs non-recurring with total trend line" iconColor="text-violet-400" />
        <div className="mt-4" style={{ height: 340 }}>
          <canvas ref={mixedRef} />
        </div>
      </Card>

      {/* ── Cumulative spend ────────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon={TrendingUp} title="Cumulative Spend" sub="Running total across the year" iconColor="text-pink-400" />
        <div className="mt-4" style={{ height: 300 }}>
          <canvas ref={cumulativeRef} />
        </div>
      </Card>

      {/* ── Heatmap ─────────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon={Calendar} title="Monthly Spend Heatmap" sub="Darker = higher spend · hover for exact amount" iconColor="text-cyan-400" />
        <div className="mt-4 overflow-x-auto">
          <SpendHeatmap expenses={expenses} filterYear={filterYear} />
        </div>
      </Card>

      {/* ── Doughnut charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recurring */}
        <Card className="p-5">
          <SectionHeader icon={PieChart} title="Recurring by Category" sub={`Top ${recurCatData.length} categories · $${recurTotal.toFixed(2)} total`} iconColor="text-violet-400" />
          <div className="mt-4 grid grid-cols-2 gap-4 items-center">
            <div style={{ height: 220 }}>
              <canvas ref={recurDonutRef} />
            </div>
            <DonutLegend data={recurCatData} total={recurTotal} colors={PALETTE} onCategoryClick={onCategoryClick} />
          </div>
        </Card>

        {/* Non-Recurring */}
        <Card className="p-5">
          <SectionHeader icon={PieChart} title="Non-Recurring by Category" sub={`Top ${nonRecurCatData.length} categories · $${nonRecurTotal.toFixed(2)} total`} iconColor="text-blue-400" />
          <div className="mt-4 grid grid-cols-2 gap-4 items-center">
            <div style={{ height: 220 }}>
              <canvas ref={nonRecurDonutRef} />
            </div>
            <DonutLegend data={nonRecurCatData} total={nonRecurTotal} colors={PALETTE} onCategoryClick={onCategoryClick} />
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Visualizations;