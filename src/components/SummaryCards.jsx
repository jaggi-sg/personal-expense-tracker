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
}) => {
  const isRecurring  = type === 'Recurring';
  const accentColor  = isRecurring ? 'green' : 'blue';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

      {/* ── Card 1: Total Paid ─────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 border-l-4 border-l-${accentColor}-400`}>
        {/* Faint background glow */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 bg-${accentColor}-500/10 rounded-full blur-2xl pointer-events-none`} />

        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
              Total {type} (Paid)
            </p>
            <p className="text-4xl font-bold text-white leading-none">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <div className={`bg-${accentColor}-500/20 p-2 rounded-lg`}>
            <TrendingUp className={`w-5 h-5 text-${accentColor}-300`} />
          </div>
        </div>

        {/* Paid count */}
        <p className="text-purple-300 text-xs mt-2">
          <span className={`text-${accentColor}-300 font-semibold`}>{paidList.length}</span> paid
          {' · '}
          <span className="text-white font-semibold">{paidPct}%</span> of all entries
        </p>

        {/* Status bar */}
        <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-white/10 gap-px">
          {paidW    > 0 && <div className="bg-green-400  rounded-l-full" style={{ width: `${paidW}%` }} />}
          {pendingW > 0 && <div className="bg-orange-400"                style={{ width: `${pendingW}%` }} />}
          {overdueW > 0 && <div className="bg-red-400    rounded-r-full" style={{ width: `${overdueW}%` }} />}
        </div>
        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Paid
          </span>
          <span className="flex items-center gap-1 text-xs text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1 text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Overdue
          </span>
        </div>
      </div>

      {/* ── Card 2: Pending & Overdue ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 border-l-4 border-l-orange-400">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
              Pending & Overdue
            </p>
            <p className="text-4xl font-bold text-white leading-none">
              {pendingList.length + overdueList.length}
              <span className="text-lg font-normal text-purple-400 ml-1">entries</span>
            </p>
          </div>
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-orange-300" />
          </div>
        </div>

        {/* Pending row */}
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between bg-orange-500/10 rounded-lg px-3 py-2 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300 text-xs font-medium">Pending</span>
              <span className="bg-orange-500/30 text-orange-200 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {pendingList.length}
              </span>
            </div>
            <span className="text-white text-sm font-bold">${pendingTotal.toFixed(2)}</span>
          </div>

          {/* Overdue row */}
          <div className="flex items-center justify-between bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 text-xs font-medium">Overdue</span>
              <span className="bg-red-500/30 text-red-200 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {overdueList.length}
              </span>
            </div>
            <span className="text-white text-sm font-bold">${overdueTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Card 3: Filtered Total ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 border-l-4 border-l-purple-400">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
              {hasFiltered ? 'Filtered Total (Paid)' : 'All Entries'}
            </p>
            <p className="text-4xl font-bold text-white leading-none">
              {hasFiltered ? `$${filteredTotal.toFixed(2)}` : totalEntries}
              {!hasFiltered && (
                <span className="text-lg font-normal text-purple-400 ml-1">entries</span>
              )}
            </p>
          </div>
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Filter className="w-5 h-5 text-purple-300" />
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
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalAmount > 0 ? Math.min((filteredTotal / totalAmount) * 100, 100) : 0}%` }}
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