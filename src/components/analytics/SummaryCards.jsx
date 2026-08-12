// src/components/SummaryCards.jsx

import React from 'react';
import { TrendingUp, DollarSign, Filter, Clock, AlertTriangle } from 'lucide-react';

const SummaryCards = ({
  totalAmount,
  totalEntries,
  filteredTotal,
  filterDescription,
  type = 'Recurring',
  expenses = [],        // full expense list — used to derive pending/overdue
  chartTheme,
}) => {
  const accent = chartTheme?.primary || '#a78bfa';
  const accent2 = chartTheme?.secondary || '#f472b6';
  const isRecurring  = type === 'Recurring';
  const accentColor  = isRecurring ? 'green' : 'blue';

  // full literal class strings so Tailwind never purges them
  const ACCENT = {
    green: { borderL: 'border-l-green-700', glow: 'bg-green-700/10', iconBg: 'bg-green-700/20', iconText: 'text-green-900' },
    blue:  { borderL: 'border-l-blue-700',  glow: 'bg-blue-700/10',  iconBg: 'bg-blue-700/20',  iconText: 'text-blue-900'  },
  }[accentColor];

  // ── Derived pending / overdue from the passed expense list ───────────────
  const typeList     = expenses.filter(e => e.type === type);
  const pendingList  = typeList.filter(e => e.status === 'PENDING');
  const overdueList  = typeList.filter(e => e.status === 'OVERDUE');
  const paidList     = typeList.filter(e => e.status === 'PAID');

  const pendingTotal = pendingList.reduce((s, e) => s + e.amount, 0);
  const overdueTotal = overdueList.reduce((s, e) => s + e.amount, 0);
  const paidPct      = totalEntries > 0 ? Math.round((paidList.length / totalEntries) * 100) : 0;

  // ── Mini status bar widths ────────────────────────────────────────────────
  const paidW    = totalEntries > 0 ? (paidList.length    / totalEntries) * 100 : 0;
  const pendingW = totalEntries > 0 ? (pendingList.length / totalEntries) * 100 : 0;
  const overdueW = totalEntries > 0 ? (overdueList.length / totalEntries) * 100 : 0;

  const hasFiltered = filterDescription && filterDescription !== 'All expenses';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">

      {/* ── Card 1: Total Paid ─────────────────────────────────────────────── */}
    <div className={`relative overflow-hidden bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-slate-300 dark:border-white/20 border-l-4 ${ACCENT.borderL}`}>
      {/* Faint background glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${ACCENT.glow} rounded-full blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-purple-700 dark:text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
            Total {type} (Paid)
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
        <div className={`${ACCENT.iconBg} p-2 rounded-lg`}>
          <TrendingUp className={`w-5 h-5 ${ACCENT.iconText}`} />
        </div>
      </div>

      {/* Paid count */}
      <p className="text-purple-700 dark:text-purple-300 text-xs mt-2">
        <span className={`${ACCENT.iconText} font-semibold`}>{paidList.length}</span> paid
        {' · '}
        <span className="text-slate-800 dark:text-white font-semibold">{paidPct}%</span> of all entries
      </p>

      {/* Status bar */}
      <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 gap-px">
        {paidW    > 0 && <div className="bg-green-400  rounded-l-full" style={{ width: `${paidW}%` }} />}
        {pendingW > 0 && <div className="bg-orange-400"                style={{ width: `${pendingW}%` }} />}
        {overdueW > 0 && <div className="bg-red-400    rounded-r-full" style={{ width: `${overdueW}%` }} />}
      </div>
    </div>

      {/* ── Card 2: Pending & Overdue ──────────────────────────────────────── */}
    <div className="relative overflow-hidden bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-slate-300 dark:border-white/20 border-l-4 border-l-orange-400">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-purple-700 dark:text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
            Pending & Overdue
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
            {pendingList.length + overdueList.length}
            <span className="text-lg font-normal text-purple-500 dark:text-purple-400 ml-1">entries</span>
          </p>
        </div>
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <DollarSign className="w-5 h-5 text-orange-300" />
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {/* Pending row — only when > 0 */}
        {pendingList.length > 0 && (
          <div className="flex items-center justify-between bg-orange-500/10 rounded-lg px-3 py-2 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-600 dark:text-orange-300 text-xs font-medium">Pending</span>
              <span className="bg-orange-500/30 text-orange-700 dark:text-orange-200 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {pendingList.length}
              </span>
            </div>
            <span className="text-slate-800 dark:text-white text-sm font-bold">${pendingTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Overdue row — only when > 0 */}
        {overdueList.length > 0 && (
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-600 dark:text-red-300 text-xs font-medium">Overdue</span>
              <span className="bg-red-500/30 text-red-700 dark:text-red-200 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {overdueList.length}
              </span>
            </div>
            <span className="text-slate-800 dark:text-white text-sm font-bold">${overdueTotal.toFixed(2)}</span>
          </div>
        )}

        {/* All-clear fallback when neither exists */}
        {pendingList.length === 0 && overdueList.length === 0 && (
          <div className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-2 border border-green-500/20">
            <span className="text-green-600 dark:text-green-300 text-xs font-medium">All caught up — nothing pending or overdue</span>
          </div>
        )}
      </div>
    </div>

      {/* ── Card 3: Filtered Total ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 border-l-4" style={{ borderLeftColor: accent }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: `${accent}1a` }} />

        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
              {hasFiltered ? 'Filtered Total (Paid)' : 'All Entries'}
            </p>
            <p className="text-3xl font-bold text-white leading-none">
              {hasFiltered ? `$${filteredTotal.toFixed(2)}` : totalEntries}
              {!hasFiltered && (
                <span className="text-lg font-normal text-purple-400 ml-1">entries</span>
              )}
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: `${accent}33` }}>
            <Filter className="w-5 h-5" style={{ color: accent }} />
          </div>
        </div>

        {hasFiltered ? (
          <>
            <p className="text-purple-400 text-xs mt-2 leading-relaxed">
              <span className="text-purple-200 font-medium">Showing: </span>
              {filterDescription}
            </p>
            {/* Filtered vs total bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-purple-400 mb-1">
                <span>Filtered</span>
                <span>{totalAmount > 0 ? Math.round((filteredTotal / totalAmount) * 100) : 0}% of total</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalAmount > 0 ? Math.min((filteredTotal / totalAmount) * 100, 100) : 0}%`, backgroundImage: `linear-gradient(to right, ${accent}, ${accent2})` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Paid</span>
              <span className="text-white font-semibold">{paidList.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-orange-400">Pending</span>
              <span className="text-white font-semibold">{pendingList.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Overdue</span>
              <span className="text-white font-semibold">{overdueList.length}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SummaryCards;