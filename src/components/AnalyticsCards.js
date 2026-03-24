// src/components/AnalyticsCards.js
// Plain JS (no JSX) — avoids oxc's broken < > parsing in JSX attributes

import React from 'react';

const e = React.createElement;
const fmt = (n) => '$' + n.toFixed(2);

// ── TrendBadge ────────────────────────────────────────────────────────────────
function TrendBadge({ direction, value }) {
  if (!direction || direction === 'stable') {
    return e('span', { className: 'text-purple-500 text-xs' }, '-');
  }
  const up = direction === 'up';
  const cls = up
    ? 'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold border bg-red-500/15 text-red-300 border-red-500/25'
    : 'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold border bg-green-500/15 text-green-300 border-green-500/25';
  const arrow = up ? '↑' : '↓';
  return e('span', { className: cls }, arrow, ' ', value !== null ? (Math.abs(value).toFixed(1) + '%') : '-');
}

// ── CategoryPatternsCard ──────────────────────────────────────────────────────
export function CategoryPatternsCard({
  topCategories, pagedCats, grandTotal,
  categoryPage, totalCatPages,
  onPrev, onNext,
  onCategoryClick, selectedYear,
  filteredExpenses,
  Card, SectionHeader, PieChart,
}) {
  // Bar chart rows
  const bars = topCategories.map(function(entry) {
    var cat  = entry[0];
    var data = entry[1];
    var w    = topCategories[0][1].total > 0 ? (data.total / topCategories[0][1].total) * 100 : 0;
    var cls  = onCategoryClick
      ? 'group rounded-lg px-2 py-1.5 -mx-2 transition-colors cursor-pointer hover:bg-white/8'
      : 'group rounded-lg px-2 py-1.5 -mx-2 transition-colors';

    return e('div', { key: cat, className: cls, onClick: function() { onCategoryClick && onCategoryClick(cat, selectedYear); } },
      e('div', { className: 'flex items-center justify-between mb-1' },
        e('div', { className: 'flex items-center gap-1 min-w-0' },
          e('span', { className: 'text-white text-sm font-medium truncate' }, cat),
          onCategoryClick && e('span', { className: 'text-purple-600 text-xs ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' }, 'drill down')
        ),
        e('div', { className: 'flex items-center gap-2 shrink-0 ml-2' },
          e('span', { className: 'text-purple-300 text-xs' }, fmt(data.total)),
          e(TrendBadge, { direction: data.trendDirection, value: data.trendPercent })
        )
      ),
      e('div', { className: 'h-2 bg-white/8 rounded-full overflow-hidden' },
        e('div', { className: 'h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500', style: { width: w + '%' } })
      )
    );
  });

  // Table headers
  const headers = ['Category', 'Total', 'Count', 'Yearly Avg', 'Per Trans', '% Total', 'Trend'];
  const thRow = e('tr', { className: 'border-b border-white/15' },
    headers.map(function(h) {
      var cls = 'py-2 text-purple-300 font-semibold text-xs ' +
        (h === 'Category' ? 'text-left pr-4' : h === 'Trend' ? 'text-center px-2' : 'text-right px-2');
      return e('th', { key: h, className: cls }, h);
    })
  );

  // Table rows
  const tableRows = pagedCats.map(function(entry) {
    var cat  = entry[0];
    var data = entry[1];
    var pct  = grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) : '0.0';
    return e('tr', { key: cat, className: 'border-b border-white/8 hover:bg-white/5 transition-colors' },
      e('td', { className: 'py-2 pr-4 text-white font-medium' }, cat),
      e('td', { className: 'py-2 px-2 text-white font-semibold text-right' }, fmt(data.total)),
      e('td', { className: 'py-2 px-2 text-purple-300 text-right' }, data.count),
      e('td', { className: 'py-2 px-2 text-white text-right' }, fmt(data.yearlyAverage)),
      e('td', { className: 'py-2 px-2 text-white text-right' }, fmt(data.monthlyAverage)),
      e('td', { className: 'py-2 px-2 text-purple-300 text-right' }, pct + '%'),
      e('td', { className: 'py-2 px-2 text-center' }, e(TrendBadge, { direction: data.trendDirection, value: data.trendPercent }))
    );
  });

  // Pagination
  var prevDis = categoryPage === 1;
  var nextDis = categoryPage === totalCatPages;
  var btnBase = 'px-2 py-1 rounded text-xs bg-white/10 text-white hover:bg-white/20 transition-all';
  var pagination = totalCatPages > 1
    ? e('div', { className: 'flex items-center gap-2' },
        e('button', { onClick: onPrev, className: btnBase + (prevDis ? ' opacity-30 pointer-events-none' : '') }, 'Prev'),
        e('span', { className: 'text-purple-400 text-xs' }, categoryPage + ' / ' + totalCatPages),
        e('button', { onClick: onNext, className: btnBase + (nextDis ? ' opacity-30 pointer-events-none' : '') }, 'Next')
      )
    : null;

  var headerRight = e('span', { className: 'text-purple-400 text-xs' }, filteredExpenses.length + ' transactions');

  return e(Card, { className: 'p-5' },
    e(SectionHeader, {
      icon: PieChart, iconColor: 'text-green-400',
      title: 'Category Spending Patterns',
      sub: topCategories.length + ' categories tracked',
      right: headerRight,
    }),
    e('div', { className: 'space-y-2 mb-5' }, ...bars),
    e('div', { className: 'border-t border-white/10 pt-4' },
      e('div', { className: 'flex items-center justify-between mb-3' },
        e('p', { className: 'text-purple-300 text-xs font-semibold uppercase tracking-wide' }, 'Detailed Breakdown'),
        pagination
      ),
      e('div', { className: 'overflow-x-auto' },
        e('table', { className: 'w-full text-sm' },
          e('thead', null, thRow),
          e('tbody', null, ...tableRows)
        )
      )
    )
  );
}

// ── MonthlyTotalsCard ─────────────────────────────────────────────────────────
export function MonthlyTotalsCard({
  monthlyTotals, maxMonthly, MONTHS_FULL,
  lowestMonth, highestMonth, monthlyAvg,
  onDrillMonth,
  Card, SectionHeader, Activity, DollarSign, TrendingDown, TrendingUp,
}) {
  var fmt2 = fmt;

  var bars = monthlyTotals.map(function(data, idx) {
    var hasData  = data.total > 0;
    var cls      = hasData ? 'flex items-center gap-3 group cursor-pointer' : 'flex items-center gap-3 group';
    var barCls   = hasData
      ? 'h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 bg-gradient-to-r from-violet-500 to-pink-500'
      : 'h-full';
    var barW     = maxMonthly > 0 ? (data.total / maxMonthly) * 100 : 0;
    var minW     = hasData ? 56 : 0;
    var handleCl = hasData ? function() { onDrillMonth(idx, MONTHS_FULL[idx]); } : undefined;

    return e('div', { key: data.month, className: cls, onClick: handleCl },
      e('span', { className: 'w-9 text-purple-300 text-xs font-semibold shrink-0' }, data.month),
      e('div', { className: 'flex-1 bg-white/8 rounded-full h-7 overflow-hidden relative' },
        e('div', { className: barCls, style: { width: barW + '%', minWidth: minW } },
          hasData && e('span', { className: 'text-white text-xs font-bold whitespace-nowrap' }, fmt2(data.total))
        )
      ),
      e('span', { className: 'text-purple-500 text-xs w-14 text-right shrink-0' },
        data.count > 0 ? (data.count + ' txns') : '-'
      )
    );
  });

  var totalSpend = monthlyTotals.reduce(function(s, m) { return s + m.total; }, 0);
  var stats = [
    { label: 'Total Spend',   value: fmt2(totalSpend),            icon: DollarSign,  color: 'border-l-violet-500', sub: 'all months' },
    { label: 'Lowest Month',  value: lowestMonth  ? lowestMonth.month  : '-', icon: TrendingDown, color: 'border-l-green-500',  sub: lowestMonth  ? fmt2(lowestMonth.total)  : '' },
    { label: 'Highest Month', value: highestMonth ? highestMonth.month : '-', icon: TrendingUp,   color: 'border-l-red-500',    sub: highestMonth ? fmt2(highestMonth.total) : '' },
    { label: 'Monthly Avg',   value: fmt2(monthlyAvg),            icon: Activity,    color: 'border-l-blue-500',   sub: 'per month' },
  ];

  var statCards = stats.map(function(s) {
    return e('div', { key: s.label, className: 'bg-white/5 border border-white/10 border-l-4 ' + s.color + ' rounded-lg p-3' },
      e('div', { className: 'flex items-center gap-1.5 mb-1' },
        e(s.icon, { className: 'w-3.5 h-3.5 text-purple-400' }),
        e('p', { className: 'text-purple-400 text-xs' }, s.label)
      ),
      e('p', { className: 'text-white font-bold text-lg leading-none' }, s.value),
      s.sub && e('p', { className: 'text-purple-500 text-xs mt-1' }, s.sub)
    );
  });

  return e(Card, { className: 'p-5' },
    e(SectionHeader, {
      icon: Activity, iconColor: 'text-orange-400',
      title: 'Monthly Spending Totals',
      sub: 'Total paid per month - click a bar to drill down',
    }),
    e('div', { className: 'space-y-2 mb-5' }, ...bars),
    e('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-4' }, ...statCards)
  );
}