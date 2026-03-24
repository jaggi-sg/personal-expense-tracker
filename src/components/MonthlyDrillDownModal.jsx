// src/components/MonthlyDrillDownModal.jsx

import React, { useState, useMemo } from 'react';
import { X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const fmt = (n) => '$' + n.toFixed(2);

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

const CategoryBlock = ({ cat, rows, total, maxAmt }) => {
  const [open, setOpen] = useState(false);
  const catTotal = rows.reduce((s, e) => s + e.amount, 0);
  const pct = total > 0 ? ((catTotal / total) * 100).toFixed(0) : 0;
  const barW = maxAmt > 0 ? (catTotal / maxAmt) * 100 : 0;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/8 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white text-sm font-semibold">{cat}</span>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-xs">{rows.length} txn{rows.length !== 1 ? 's' : ''}</span>
              <span className="text-white font-bold text-sm">{fmt(catTotal)}</span>
              <span className="text-purple-500 text-xs w-10 text-right">{pct}%</span>
            </div>
          </div>
          <div className="w-full bg-white/8 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
              style={{ width: barW + '%' }}
            />
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
          : <ChevronDown className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
        }
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-max">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['Date', 'Description', 'Type', 'Amount', 'Via', 'Status'].map(h => (
                  <th key={h} className="text-left text-purple-400 font-semibold py-2 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(e => {
                const isRec = e.type === 'Recurring';
                return (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-purple-300 whitespace-nowrap">{e.date}</td>
                    <td className="py-2 px-3 text-white max-w-xs truncate">{e.description}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={isRec
                        ? 'text-xs px-1.5 py-0.5 rounded border bg-violet-500/15 text-violet-300 border-violet-500/25'
                        : 'text-xs px-1.5 py-0.5 rounded border bg-blue-500/15 text-blue-300 border-blue-500/25'
                      }>
                        {isRec ? 'Rec' : 'Non-Rec'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white font-semibold whitespace-nowrap">{fmt(e.amount)}</td>
                    <td className="py-2 px-3 text-purple-300 whitespace-nowrap">
                      <div className="text-xs">{e.paymentType || '-'}</div>
                      {e.by && <div className="text-purple-500 text-[10px]">{e.by}</div>}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SORT_FNS = {
  'date-asc':    (a, b) => a.date.localeCompare(b.date),
  'date-desc':   (a, b) => b.date.localeCompare(a.date),
  'amount-desc': (a, b) => b.amount - a.amount,
  'amount-asc':  (a, b) => a.amount - b.amount,
};

const MonthlyDrillDownModal = ({ isOpen, onClose, monthLabel, monthIdx, selectedYear, expenses, analysisType }) => {
  const [sortBy, setSortBy] = useState('amount-desc');

  const typeLabel = analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring';

  const monthExpenses = useMemo(() => {
    if (!isOpen || monthIdx === null) return [];
    return expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00Z');
      const yr = d.getUTCFullYear().toString();
      const matchYear = selectedYear === 'All' || yr === selectedYear;
      return d.getUTCMonth() === monthIdx && matchYear && e.type === typeLabel;
    });
  }, [isOpen, monthIdx, selectedYear, expenses, typeLabel]);

  const sorted = useMemo(() => {
    const list = [...monthExpenses];
    const fn = SORT_FNS[sortBy];
    return fn ? list.sort(fn) : list;
  }, [monthExpenses, sortBy]);

  const byCat = useMemo(() => {
    const map = {};
    sorted.forEach(e => {
      if (!map[e.category]) map[e.category] = [];
      map[e.category].push(e);
    });
    return Object.entries(map).sort((a, b) => {
      const aSum = a[1].reduce((s, e) => s + e.amount, 0);
      const bSum = b[1].reduce((s, e) => s + e.amount, 0);
      return bSum - aSum;
    });
  }, [sorted]);

  const paid    = monthExpenses.filter(e => e.status === 'PAID');
  const pending = monthExpenses.filter(e => e.status === 'PENDING');
  const overdue = monthExpenses.filter(e => e.status === 'OVERDUE');
  const total   = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const paidAmt = paid.reduce((s, e) => s + e.amount, 0);
  const pendAmt = pending.reduce((s, e) => s + e.amount, 0);

  const catAmounts = byCat.map(([, rows]) => rows.reduce((s, e) => s + e.amount, 0));
  const maxCatAmt  = catAmounts.length > 0 ? Math.max(...catAmounts) : 1;

  const stats = [
    { label: 'Total',      value: fmt(total),   color: 'border-l-violet-500', sub: monthExpenses.length + ' expenses' },
    { label: 'Paid',       value: fmt(paidAmt), color: 'border-l-green-500',  sub: paid.length + ' paid' },
    { label: 'Pending',    value: fmt(pendAmt), color: 'border-l-orange-500', sub: pending.length + ' pending' },
    { label: 'Categories', value: byCat.length, color: 'border-l-blue-500',   sub: overdue.length + ' overdue' },
  ];

  if (!isOpen) return null;

  const yearLabel = selectedYear !== 'All' ? ' ' + selectedYear : '';
  const catWord   = byCat.length !== 1 ? 'ies' : 'y';
  const expWord   = monthExpenses.length !== 1 ? 's' : '';

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-3xl max-h-screen-90 flex flex-col shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{monthLabel + yearLabel}</h2>
              <p className="text-purple-400 text-xs">
                {monthExpenses.length + ' expense' + expWord}
                {' · ' + typeLabel}
                {' · ' + byCat.length + ' categor' + catWord}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {monthExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-purple-400">{'No ' + typeLabel.toLowerCase() + ' expenses for this month'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {stats.map(s => (
                  <div key={s.label} className={'bg-white/5 border border-white/10 border-l-4 ' + s.color + ' rounded-lg p-3'}>
                    <p className="text-purple-400 text-xs mb-1">{s.label}</p>
                    <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                    <p className="text-purple-500 text-xs mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center justify-between">
                <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Category Breakdown</p>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="amount-desc">Highest first</option>
                  <option value="amount-asc">Lowest first</option>
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                </select>
              </div>

              {/* Category blocks */}
              <div className="space-y-2">
                {byCat.map(([cat, rows]) => (
                  <CategoryBlock key={cat} cat={cat} rows={rows} total={total} maxAmt={maxCatAmt} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/10 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDrillDownModal;