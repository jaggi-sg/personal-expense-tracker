// src/components/SpendingTimeline.jsx

import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtAmt = (n) => {
  if (n >= 10000) return '$' + (n / 1000).toFixed(0) + 'k';
  if (n >= 1000)  return '$' + (n / 1000).toFixed(1) + 'k';
  return '$' + n.toFixed(0);
};

const SpendingTimeline = ({ expenses, analysisType }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mousePos,   setMousePos]   = useState({ x: 0, y: 0 });
  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';

  const paid = useMemo(() =>
    expenses.filter(e => e.type === typeLabel && e.status === 'PAID'),
  [expenses, analysisType]);

  const buckets = useMemo(() => {
    const map = {};
    paid.forEach(e => {
      const d   = new Date(e.date + 'T00:00:00Z');
      const key = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
      if (!map[key]) map[key] = { key, year: d.getUTCFullYear(), month: d.getUTCMonth(), total: 0, count: 0 };
      map[key].total += e.amount;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [paid]);

  if (buckets.length === 0) {
    return <p className="text-purple-400 text-sm text-center py-6">No paid data to display timeline.</p>;
  }

  const maxTotal = Math.max(...buckets.map(b => b.total));
  const avgTotal = buckets.reduce((s, b) => s + b.total, 0) / buckets.length;

  const CHART_H   = 160; // px - height of bar area
  const BAR_W     = 44;  // px per bar
  const GAP       = 6;   // px gap between bars
  const TOOLTIP_H = 140; // px reserved above chart for tooltips

  const getBarColor = (b) => {
    if (b.total > avgTotal * 1.5) return 'from-red-500 to-orange-400';   // spike
    if (b.total < avgTotal * 0.5 && b.total > 0) return 'from-slate-500 to-slate-400'; // dip
    return 'from-violet-500 to-purple-400'; // normal
  };

  const spikes = buckets.filter(b => b.total > avgTotal * 1.5);

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs text-purple-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-violet-500" />
            Normal spend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-red-500" />
            Spike (150%+ avg)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-slate-500" />
            Low month
          </span>
          <span className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
            <span className="w-6 border-t border-dashed border-purple-400/60 inline-block" />
            Avg {fmtAmt(avgTotal)}
          </span>
        </div>
        <span className="text-purple-500 text-xs">{buckets.length} months</span>
      </div>

      {/* Chart — centered, no overflow clipping */}
      <div className="flex justify-center" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="relative" style={{ width: buckets.length * (BAR_W + GAP) + 'px', height: (CHART_H + 40) + 'px', marginTop: TOOLTIP_H + 'px' }}>

          {/* Average dashed line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-purple-400/40 pointer-events-none"
            style={{ top: (CHART_H - (avgTotal / maxTotal) * CHART_H) + 'px', zIndex: 1 }}
          />

          {buckets.map((b, i) => {
            const barH    = maxTotal > 0 ? Math.max((b.total / maxTotal) * CHART_H, b.total > 0 ? 4 : 0) : 0;
            const barTop  = CHART_H - barH;
            const prev    = i > 0 ? buckets[i - 1].total : null;
            const change  = prev !== null && prev > 0 ? ((b.total - prev) / prev) * 100 : null;
            const isNew   = i === 0 || b.year !== buckets[i - 1].year;
            const barLeft = i * (BAR_W + GAP);
            const isHov   = hoveredIdx === i;
            const barCls  = 'absolute bottom-0 rounded-t transition-all duration-200 bg-gradient-to-t ' + getBarColor(b)
              + (isHov ? ' brightness-125 ring-1 ring-white/30' : '');

            return (
              <div key={b.key}
                style={{ position: 'absolute', left: barLeft + 'px', top: 0, width: BAR_W + 'px', height: CHART_H + 'px' }}
                onMouseEnter={(ev) => { setHoveredIdx(i); setMousePos({ x: ev.clientX, y: ev.clientY }); }}
                onMouseMove={(ev)  => setMousePos({ x: ev.clientX, y: ev.clientY })}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Year label */}
                {isNew && (
                  <div className="absolute text-[10px] font-bold text-purple-500 whitespace-nowrap"
                    style={{ top: '-18px', left: 0 }}>
                    {b.year}
                  </div>
                )}
                {/* Bar */}
                <div className={barCls} style={{ width: '100%', height: barH + 'px' }} />
              </div>
            );
          })}

          {/* Month labels row */}
          <div className="absolute left-0 right-0" style={{ top: CHART_H + 4 + 'px' }}>
            {buckets.map((b, i) => (
              <div key={b.key}
                className="absolute text-[10px] text-purple-500 text-center"
                style={{ left: i * (BAR_W + GAP) + 'px', width: BAR_W + 'px' }}>
                {MONTHS[b.month]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed tooltip rendered via portal — never clipped by any container */}
      {hoveredIdx !== null && buckets[hoveredIdx] && ReactDOM.createPortal(
        (() => {
          const b      = buckets[hoveredIdx];
          const prev   = hoveredIdx > 0 ? buckets[hoveredIdx - 1].total : null;
          const change = prev !== null && prev > 0 ? ((b.total - prev) / prev) * 100 : null;
          const isSpk  = b.total > avgTotal * 1.5;
          const left   = mousePos.x + 16;
          const top    = mousePos.y - 20;
          return (
            <div style={{ position: 'fixed', left: left + 'px', top: top + 'px', zIndex: 9999, pointerEvents: 'none', minWidth: '150px' }}
              className="bg-slate-900 border border-white/20 rounded-xl p-3 shadow-2xl">
              <p className="text-white font-bold text-base leading-none mb-1">{fmtAmt(b.total)}</p>
              <p className="text-purple-400 text-xs mb-1">{MONTHS[b.month] + ' ' + b.year}</p>
              <p className="text-purple-500 text-xs">{b.count + ' expense' + (b.count !== 1 ? 's' : '')}</p>
              {change !== null && (
                <div className={'flex items-center gap-1 mt-1.5 text-xs font-semibold ' + (change > 0 ? 'text-red-400' : 'text-green-400')}>
                  {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {(change > 0 ? '+' : '') + change.toFixed(1) + '% vs prev'}
                </div>
              )}
              {isSpk && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-orange-400 font-semibold">
                  <Zap className="w-3 h-3" /> Spending spike
                </div>
              )}
            </div>
          );
        })(),
        document.body
      )}

      {/* Spending spikes section */}
      {spikes.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Spending Spikes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {spikes.map(b => {
              const pctAbove = ((b.total / avgTotal - 1) * 100).toFixed(0);
              return (
                <div key={b.key} className="bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                  <span className="text-red-300 font-semibold">{MONTHS[b.month] + ' ' + b.year}</span>
                  <span className="text-orange-300 font-bold">{fmtAmt(b.total)}</span>
                  <span className="text-purple-500">{'+' + pctAbove + '% above avg'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingTimeline;