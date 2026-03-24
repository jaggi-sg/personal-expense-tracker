// src/components/SkipMonthModal.jsx

import React, { useState } from 'react';
import { X, SkipForward } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const SkipMonthModal = ({ isOpen, onClose, expense, onConfirmSkip }) => {
  const now = new Date();
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year,  setYear]  = useState(now.getFullYear().toString());
  const [reason, setReason] = useState('');

  if (!isOpen || !expense) return null;

  // Nearby years
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(String);

  const handleConfirm = () => {
    onConfirmSkip({ expense, month, year, reason });
    onClose();
  };

  const sel = 'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400 w-full';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <SkipForward className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Skip Month</h2>
              <p className="text-purple-400 text-xs">Mark this recurring expense as skipped</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Expense summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-purple-300 text-xs mb-1">Recurring expense</p>
            <p className="text-white font-bold">{expense.description}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-purple-400 text-xs">{expense.category}</span>
              <span className="text-purple-400 text-xs">·</span>
              <span className="text-white text-xs font-semibold">${expense.amount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1.5">Month to skip</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className={sel}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1.5">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className={sel}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Optional reason */}
          <div>
            <label className="block text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1.5">
              Reason <span className="text-purple-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cancelled, on vacation, one-time waiver…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-600 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Info note */}
          <p className="text-purple-500 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            This adds a <span className="text-orange-300 font-semibold">SKIPPED</span> marker for {month} {year}.
            The recurring expense itself is not deleted and will continue as normal in future months.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all">
            <SkipForward className="w-4 h-4" />
            Skip {month} {year}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkipMonthModal;