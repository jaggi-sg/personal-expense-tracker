// src/components/expenses/SummaryCards.jsx

import React from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useChartTheme } from '../../hooks/useChartTheme';

const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n) => n >= 10000 ? '$' + (n / 1000).toFixed(1) + 'k' : fmt(n);

const SummaryCards = ({
  totalAmount,
  totalEntries,
  filteredTotal,
  filterDescription,
  type = 'Recurring',
  expenses = [],
}) => {
  const { theme } = useChartTheme();
  const typeList    = expenses.filter(e => e.type === type);
  const paidList    = typeList.filter(e => e.status === 'PAID');
  const pendingList = typeList.filter(e => e.status === 'PENDING');
  const overdueList = typeList.filter(e => e.status === 'OVERDUE');

  const pendingAmt  = pendingList.reduce((s, e) => s + e.amount, 0);
  const overdueAmt  = overdueList.reduce((s, e) => s + e.amount, 0);
  const paidPct     = totalEntries > 0 ? Math.round((paidList.length / totalEntries) * 100) : 0;
  const actionCount = pendingList.length + overdueList.length;
  const hasAction   = actionCount > 0;
  const avgPerEntry = paidList.length > 0 ? totalAmount / paidList.length : 0;

  // Month-over-month
  const byMonth = {};
  paidList.forEach(e => {
    const k = e.date?.slice(0, 7);
    if (k) byMonth[k] = (byMonth[k] || 0) + e.amount;
  });
  const months  = Object.keys(byMonth).sort();
  const lastAmt = months.length >= 1 ? byMonth[months[months.length - 1]] : 0;
  const prevAmt = months.length >= 2 ? byMonth[months[months.length - 2]] : 0;
  const momDiff = prevAmt > 0 ? ((lastAmt - prevAmt) / prevAmt) * 100 : null;
  const momUp   = momDiff !== null && momDiff > 0;

  // Theme colors
  const primary   = theme?.primary   || '#7c3aed';
  const gradient  = theme?.gradient  || 'from-violet-500 to-pink-500';
  const isDark    = theme?.isDark !== false;

  const cardBase = isDark
    ? 'relative overflow-hidden rounded-2xl p-4 border border-white/[0.08] bg-white/[0.04]'
    : 'relative overflow-hidden rounded-2xl p-4 border border-black/[0.06] bg-white shadow-sm';

  const labelCls  = isDark ? 'text-white/40 text-[10px] font-semibold uppercase tracking-widest' : 'text-black/40 text-[10px] font-semibold uppercase tracking-widest';
  const valueCls  = isDark ? 'text-white font-bold' : 'text-gray-900 font-bold';
  const subCls    = isDark ? 'text-white/40 text-[10px]' : 'text-black/40 text-[10px]';
  const trackCls  = isDark ? 'h-0.5 rounded-full bg-white/10 overflow-hidden mt-3' : 'h-0.5 rounded-full bg-black/10 overflow-hidden mt-3';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

      {/* ── Card 1: Total paid — headline ──────────────────────────────────── */}
      <div className={cardBase}>
        {/* Glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle,' + primary + '33 0%,transparent 70%)' }} />

        <p className={labelCls + ' mb-2'}>{type} · Paid</p>

        <p className={valueCls + ' leading-none mb-1'} style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
          {fmtK(totalAmount)}
        </p>

        {momDiff !== null ? (
          <div className={'flex items-center gap-1 text-xs ' + (momUp ? 'text-red-400' : 'text-emerald-400')}>
            {momUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="font-semibold">{momUp ? '+' : ''}{momDiff.toFixed(1)}%</span>
            <span className={subCls + ' ml-0.5'}>vs last month</span>
          </div>
        ) : (
          <p className={subCls}>{paidList.length} entries</p>
        )}

        <div className={trackCls}>
          <div className={'h-full rounded-full bg-gradient-to-r ' + gradient + ' transition-all duration-700'}
            style={{ width: paidPct + '%' }} />
        </div>
        <p className={subCls + ' mt-1'}>{paidPct}% of {totalEntries}</p>
      </div>

      {/* ── Card 2: Action needed / All clear ──────────────────────────────── */}
      <div className={cardBase} style={{
        background: hasAction
          ? isDark ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.04)'
          : isDark ? 'rgba(34,197,94,0.07)'  : 'rgba(34,197,94,0.04)',
        borderColor: hasAction
          ? isDark ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.15)'
          : isDark ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.15)',
      }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-40"
          style={{ background: hasAction
            ? 'radial-gradient(circle,rgba(239,68,68,0.25) 0%,transparent 70%)'
            : 'radial-gradient(circle,rgba(34,197,94,0.25) 0%,transparent 70%)' }} />

        <p className={(hasAction ? 'text-orange-400' : 'text-emerald-400') + ' text-[10px] font-semibold uppercase tracking-widest mb-2'}>
          {hasAction ? 'Needs Attention' : 'All Clear'}
        </p>

        {hasAction ? (
          <>
            <p className={valueCls + ' leading-none mb-2'} style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
              {fmtK(pendingAmt + overdueAmt)}
            </p>
            <div className="space-y-1">
              {pendingList.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className={'text-orange-400 text-xs'}>{pendingList.length} pending</span>
                  </div>
                  <span className={valueCls + ' text-xs'}>{fmt(pendingAmt)}</span>
                </div>
              )}
              {overdueList.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className={'text-red-400 text-xs'}>{overdueList.length} overdue</span>
                  </div>
                  <span className={valueCls + ' text-xs'}>{fmt(overdueAmt)}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-end gap-3">
            <p className="text-emerald-400 font-bold leading-none" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
              {paidList.length}
            </p>
            <div className="mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        )}

        {!hasAction && <p className="text-emerald-400/60 text-xs mt-1">all entries paid</p>}
      </div>

      {/* ── Card 3: Avg per entry OR filtered result ────────────────────────── */}
      <div className={cardBase}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.3) 0%,transparent 70%)' }} />

        {filterDescription && filterDescription !== 'All expenses' ? (
          <>
            <p className={(isDark ? 'text-cyan-400/70' : 'text-cyan-600/70') + ' text-[10px] font-semibold uppercase tracking-widest mb-2'}>Filtered</p>
            <p className={valueCls + ' leading-none mb-1'} style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
              {fmtK(filteredTotal)}
            </p>
            <p className={subCls + ' truncate mb-2'}>{filterDescription}</p>
            <div className={trackCls}>
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700"
                style={{ width: (totalAmount > 0 ? Math.min((filteredTotal / totalAmount) * 100, 100) : 0) + '%' }} />
            </div>
            <p className={subCls + ' mt-1'}>
              {totalAmount > 0 ? Math.round((filteredTotal / totalAmount) * 100) : 0}% of total
            </p>
          </>
        ) : (
          <>
            <p className={labelCls + ' mb-2'}>Avg per Entry</p>
            <p className={valueCls + ' leading-none mb-1'} style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
              {fmtK(avgPerEntry)}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={(isDark ? 'text-emerald-400' : 'text-emerald-600') + ' text-[10px] font-semibold'}>{paidList.length} paid</span>
              {pendingList.length > 0 && (
                <span className={(isDark ? 'text-orange-400' : 'text-orange-500') + ' text-[10px] font-semibold'}>{pendingList.length} pending</span>
              )}
              {overdueList.length > 0 && (
                <span className={(isDark ? 'text-red-400' : 'text-red-500') + ' text-[10px] font-semibold'}>{overdueList.length} overdue</span>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default SummaryCards;