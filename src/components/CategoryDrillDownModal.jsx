// src/components/CategoryDrillDownModal.jsx

import React, { useState, useMemo } from 'react';
import { X, Calendar, Tag, CreditCard, User, Receipt, Plane, ChevronDown, ChevronUp } from 'lucide-react';

const MONTHS_ORDER = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const StatusBadge = ({ status }) => {
  const map = {
    PAID:    'bg-green-500/20 text-green-300 border-green-500/30',
    PENDING: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/30',
    SKIPPED: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${map[status] || map.PENDING}`}>
      {status}
    </span>
  );
};

// ── Transaction table ─────────────────────────────────────────────────────────
const TxTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-white/10">
    <table className="w-full text-sm min-w-max">
      <thead className="bg-white/5 border-b border-white/10">
        <tr>
          {['Date','Description','Type','Amount','Payment','By','Status'].map(h => (
            <th key={h} className="text-left text-purple-300 text-xs font-semibold py-2.5 px-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={7} className="text-center py-6 text-purple-400 text-sm">No transactions</td></tr>
        ) : rows.map(e => (
          <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="py-2 px-3 text-purple-300 text-xs whitespace-nowrap">{e.date}</td>
            <td className="py-2 px-3 text-white max-w-[200px] truncate" title={e.description}>{e.description}</td>
            <td className="py-2 px-3 whitespace-nowrap">
              <span className={`text-xs px-1.5 py-0.5 rounded border ${e.type === 'Recurring' ? 'bg-violet-500/15 text-violet-300 border-violet-500/25' : 'bg-blue-500/15 text-blue-300 border-blue-500/25'}`}>
                {e.type === 'Recurring' ? 'Rec' : 'Non-Rec'}
              </span>
            </td>
            <td className="py-2 px-3 text-white font-semibold whitespace-nowrap">${e.amount.toFixed(2)}</td>
            <td className="py-2 px-3 text-purple-300 text-xs whitespace-nowrap">{e.paymentType || '—'}</td>
            <td className="py-2 px-3 text-purple-300 text-xs whitespace-nowrap">{e.by || '—'}</td>
            <td className="py-2 px-3 whitespace-nowrap"><StatusBadge status={e.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Trip card (collapsible) ───────────────────────────────────────────────────
const TripCard = ({ tripName, rows }) => {
  const [open, setOpen] = useState(true);
  const paid    = rows.filter(e => e.status === 'PAID');
  const paidAmt = paid.reduce((s, e) => s + e.amount, 0);
  const total   = rows.reduce((s, e) => s + e.amount, 0);

  // Date range
  const dates = rows.map(e => e.date).sort();
  const dateRange = dates.length > 0
    ? dates[0] === dates[dates.length - 1]
      ? dates[0]
      : `${dates[0]} – ${dates[dates.length - 1]}`
    : '';

  return (
    <div className="border border-violet-500/25 rounded-xl overflow-hidden">
      {/* Trip header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-violet-500/10 hover:bg-violet-500/15 transition-colors text-left"
      >
        <span className="text-lg shrink-0">✈️</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{tripName || 'Untagged'}</p>
          <p className="text-purple-400 text-xs">{dateRange} · {rows.length} expenses</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-white font-bold text-base">${total.toFixed(2)}</p>
            <p className="text-green-400 text-xs">${paidAmt.toFixed(2)} paid</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
        </div>
      </button>

      {open && (
        <div className="p-3">
          <TxTable rows={rows} />
        </div>
      )}
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const CategoryDrillDownModal = ({ isOpen, onClose, category, expenses, filterYear }) => {
  const [sortBy,     setSortBy]     = useState('date-desc');
  const [filterType, setFilterType] = useState('All');

  const isTravel = category === 'Travel';

  const transactions = useMemo(() => {
    if (!category || !expenses) return [];
    return expenses.filter(e => {
      const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear().toString();
      return e.category === category
        && (filterYear === 'All' || yr === filterYear)
        && (filterType === 'All' || e.type === filterType);
    });
  }, [category, expenses, filterYear, filterType]);

  const sorted = useMemo(() => {
    const list = [...transactions];
    switch (sortBy) {
      case 'date-desc':   return list.sort((a, b) => b.date.localeCompare(a.date));
      case 'date-asc':    return list.sort((a, b) => a.date.localeCompare(b.date));
      case 'amount-desc': return list.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':  return list.sort((a, b) => a.amount - b.amount);
      default:            return list;
    }
  }, [transactions, sortBy]);

  // Group by trip for Travel
  const tripGroups = useMemo(() => {
    if (!isTravel) return null;
    const map = {};
    sorted.forEach(e => {
      const key = e.trip || '';
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    // Sort: named trips alphabetically, untagged last
    return Object.entries(map).sort(([a], [b]) => {
      if (!a) return 1; if (!b) return -1;
      return a.localeCompare(b);
    });
  }, [isTravel, sorted]);

  const paid    = transactions.filter(e => e.status === 'PAID');
  const pending = transactions.filter(e => e.status === 'PENDING');
  const overdue = transactions.filter(e => e.status === 'OVERDUE');
  const totalPaid    = paid.reduce((s, e) => s + e.amount, 0);
  const totalPending = pending.reduce((s, e) => s + e.amount, 0);
  const totalOverdue = overdue.reduce((s, e) => s + e.amount, 0);
  const grandTotal   = transactions.reduce((s, e) => s + e.amount, 0);

  const byMonth = useMemo(() => {
    const map = {};
    paid.forEach(e => { map[e.month] = (map[e.month] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => MONTHS_ORDER.indexOf(a[0]) - MONTHS_ORDER.indexOf(b[0]));
  }, [paid]);
  const maxMonthVal = Math.max(...byMonth.map(([, v]) => v), 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500/20 p-2 rounded-lg">
              {isTravel ? <Plane className="w-4 h-4 text-violet-400" /> : <Tag className="w-4 h-4 text-violet-400" />}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{category}</h2>
              <p className="text-purple-400 text-xs">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                {isTravel && tripGroups && ` · ${tripGroups.filter(([k]) => k).length} trip${tripGroups.filter(([k]) => k).length !== 1 ? 's' : ''}`}
                {filterYear !== 'All' ? ` · ${filterYear}` : ' · all years'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total',   value: grandTotal,   color: 'border-l-violet-500', count: transactions.length },
              { label: 'Paid',    value: totalPaid,    color: 'border-l-green-500',  count: paid.length },
              { label: 'Pending', value: totalPending, color: 'border-l-orange-500', count: pending.length },
              { label: 'Overdue', value: totalOverdue, color: 'border-l-red-500',    count: overdue.length },
            ].map(s => (
              <div key={s.label} className={`bg-white/5 border border-white/10 border-l-4 ${s.color} rounded-lg p-3`}>
                <p className="text-purple-400 text-xs mb-1">{s.label}</p>
                <p className="text-white font-bold text-lg leading-none">${s.value.toFixed(2)}</p>
                <p className="text-purple-500 text-xs mt-1">{s.count} entries</p>
              </div>
            ))}
          </div>

          {/* Monthly chart */}
          {byMonth.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Paid by month
              </p>
              <div className="space-y-1.5">
                {byMonth.map(([month, val]) => (
                  <div key={month} className="flex items-center gap-2">
                    <span className="text-purple-400 text-xs w-9 shrink-0">{month.slice(0,3)}</span>
                    <div className="flex-1 bg-white/8 rounded-full h-5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(val / maxMonthVal) * 100}%`, minWidth: 40 }}>
                        <span className="text-white/80 text-[10px] font-bold">${val.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400">
              <option value="All">All types</option>
              <option value="Recurring">Recurring</option>
              <option value="Non-Recurring">Non-Recurring</option>
            </select>
            {!isTravel && (
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400">
                <option value="date-desc">Date (newest)</option>
                <option value="date-asc">Date (oldest)</option>
                <option value="amount-desc">Amount (high)</option>
                <option value="amount-asc">Amount (low)</option>
              </select>
            )}
            <span className="text-purple-500 text-xs ml-auto">{sorted.length} shown</span>
          </div>

          {/* Travel: grouped by trip / Non-travel: flat table */}
          {isTravel && tripGroups ? (
            <div className="space-y-3">
              {tripGroups.map(([tripName, rows]) => (
                <TripCard key={tripName || '__untagged__'} tripName={tripName} rows={rows} />
              ))}
            </div>
          ) : (
            <TxTable rows={sorted} />
          )}

        </div>

        <div className="px-6 py-3 border-t border-white/10 shrink-0 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDrillDownModal;