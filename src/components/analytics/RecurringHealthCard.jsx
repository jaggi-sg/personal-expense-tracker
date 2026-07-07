// src/components/analytics/RecurringHealthCard.jsx

import React, { useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Zap, User, ChevronDown, ChevronUp, CheckCheck } from 'lucide-react';

const fmt = (n) => '$' + parseFloat(n).toFixed(2);

const STATUS_CLS = {
  PAID:    'bg-green-500/15 text-green-300 border-green-500/25',
  PENDING: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  OVERDUE: 'bg-red-500/15 text-red-300 border-red-500/25',
  SKIPPED: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

const RecurringHealthCard = ({ expenses, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);

  const now      = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const { thisMonthRecurring, unpaid, paid, manual, healthPct } = useMemo(() => {
    const recurring = expenses.filter(e => {
      if (e.type !== 'Recurring') return false;
      const d = new Date(e.date + 'T00:00:00Z');
      return d.getUTCMonth() === thisMonth && d.getUTCFullYear() === thisYear;
    });

    const unpaid = recurring.filter(e => e.status === 'PENDING' || e.status === 'OVERDUE');
    const paid   = recurring.filter(e => e.status === 'PAID');
    const manual = recurring.filter(e => !/AUTO-GENERATED/i.test(e.description || ''));
    const healthPct = recurring.length > 0
      ? Math.round((paid.length / recurring.length) * 100)
      : 100;

    return { thisMonthRecurring: recurring, unpaid, paid, manual, healthPct };
  }, [expenses, thisMonth, thisYear]);

  const handlePayAll = () => {
    if (!onStatusChange) return;
    if (!window.confirm('Mark all ' + unpaid.length + ' unpaid recurring expenses as PAID?')) return;
    unpaid.forEach(e => onStatusChange(e.id, 'PAID'));
  };

  const monthLabel = now.toLocaleString('default', { month: 'long' }) + ' ' + thisYear;

  const ringColor = healthPct >= 80 ? '#34d399' : healthPct >= 50 ? '#fb923c' : '#f87171';
  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - healthPct / 100);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/15 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-none">Recurring Health</h3>
            <p className="text-purple-400 text-xs mt-0.5">{monthLabel}</p>
          </div>
        </div>

        {/* Health ring */}
        <div className="relative w-14 h-14">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
            <circle cx="28" cy="28" r="20" fill="none"
              stroke={ringColor} strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{healthPct}%</span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Total',   value: thisMonthRecurring.length, color: 'text-white' },
          { label: 'Paid',    value: paid.length,   color: 'text-green-400' },
          { label: 'Unpaid',  value: unpaid.length,  color: unpaid.length > 0 ? 'text-red-400' : 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
            <p className={'font-bold text-lg leading-none ' + s.color}>{s.value}</p>
            <p className="text-purple-500 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Unpaid list + Pay All */}
      {unpaid.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button onClick={() => setExpanded(o => !o)}
              className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {unpaid.length} unpaid expense{unpaid.length !== 1 ? 's' : ''}
            </button>
            <button onClick={handlePayAll}
              className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
              <CheckCheck className="w-3.5 h-3.5" /> Pay All
            </button>
          </div>

          {expanded && (
            <div className="space-y-1.5 mt-1">
              {unpaid.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/AUTO-GENERATED/i.test(e.description || '')
                      ? <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                      : <User className="w-3 h-3 text-blue-400 shrink-0" />}
                    <span className="text-white text-xs truncate">
                      {e.description.replace(/\s*\(AUTO-GENERATED\)/i, '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white text-xs font-semibold">{fmt(e.amount)}</span>
                    <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded border ' + (STATUS_CLS[e.status] || STATUS_CLS.PENDING)}>
                      {e.status}
                    </span>
                    <button onClick={() => onStatusChange?.(e.id, 'PAID')}
                      className="text-green-400 hover:text-green-300 transition-colors" title="Mark as paid">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {unpaid.length === 0 && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>All recurring expenses paid this month</span>
        </div>
      )}
    </div>
  );
};

export default RecurringHealthCard;