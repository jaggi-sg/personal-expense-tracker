// src/components/expenses/BulkAddModal.jsx
// Generate multiple expense entries for a recurring expense across many months
// e.g. Gym membership for Jan 2024 - Jun 2025 in one go

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Calendar, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const inp = 'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 w-full';
const sel = inp;

function monthsBetween(fromY, fromM, toY, toM) {
  const result = [];
  let y = fromY, m = fromM;
  while (y < toY || (y === toY && m <= toM)) {
    result.push({ year: y, month: m });
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return result;
}

function pad(n) { return String(n).padStart(2, '0'); }

const BulkAddModal = ({ isOpen, onClose, onBulkAdd, categories = [], paymentTypes = [], paidByOptions = [], expenseType = 'Recurring' }) => {
  const now = new Date();

  // Form fields
  const [description,  setDescription]  = useState('');
  const [amount,       setAmount]        = useState('');
  const [category,     setCategory]      = useState(categories[0] || '');
  const [paymentType,  setPaymentType]   = useState('');
  const [paidBy,       setPaidBy]        = useState('');
  const [dayOfMonth,   setDayOfMonth]    = useState('1');
  const [status,       setStatus]        = useState('PAID');
  const [note,         setNote]          = useState('');

  // Date range
  const [fromYear,  setFromYear]  = useState(now.getFullYear() - 1);
  const [fromMonth, setFromMonth] = useState(now.getMonth());
  const [toYear,    setToYear]    = useState(now.getFullYear());
  const [toMonth,   setToMonth]   = useState(now.getMonth());

  // Preview state
  const [showPreview,   setShowPreview]   = useState(false);
  const [deselected,    setDeselected]    = useState(new Set());
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');

  const allMonths = useMemo(() =>
    monthsBetween(fromYear, fromMonth, toYear, toMonth),
  [fromYear, fromMonth, toYear, toMonth]);

  const selectedMonths = allMonths.filter((_, i) => !deselected.has(i));

  const toggleMonth = (i) => setDeselected(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const toggleAll = () => {
    if (deselected.size === 0) {
      setDeselected(new Set(allMonths.map((_, i) => i)));
    } else {
      setDeselected(new Set());
    }
  };

  const validate = () => {
    if (!description.trim()) return 'Description is required';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return 'Valid amount is required';
    if (!category) return 'Category is required';
    if (allMonths.length === 0) return 'End date must be after start date';
    if (selectedMonths.length === 0) return 'At least one month must be selected';
    return '';
  };

  const handlePreview = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setShowPreview(true);
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);

    const day = Math.max(1, Math.min(28, parseInt(dayOfMonth) || 1));
    const expenses = selectedMonths.map(({ year, month }) => {
      const dateStr = year + '-' + pad(month + 1) + '-' + pad(day);
      return {
        id:          Date.now().toString() + '-' + year + '-' + month,
        type:        expenseType,
        description: description.trim(),
        amount:      parseFloat(amount),
        date:        dateStr,
        month:       MONTHS[month],
        category,
        paymentType: paymentType || '',
        by:          paidBy || '',
        status,
        note:        note || '',
      };
    });

    try {
      onBulkAdd(expenses);
      setSaving(false);
      handleClose();
    } catch (err) {
      console.error('BulkAddModal save error:', err);
      setError('Failed to add expenses: ' + err.message);
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDescription(''); setAmount(''); setCategory(categories[0] || '');
    setPaymentType(''); setPaidBy(''); setDayOfMonth('1');
    setStatus('PAID'); setNote(''); setShowPreview(false);
    setDeselected(new Set()); setError('');
    onClose();
  };

  const years = [];
  for (let y = now.getFullYear() - 5; y <= now.getFullYear() + 1; y++) years.push(y);

  const totalAmount = selectedMonths.length * (parseFloat(amount) || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}>
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500/20 p-2 rounded-lg">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Bulk Add Expenses</h2>
              <p className="text-purple-400 text-xs">Generate {expenseType} entries across multiple months</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Expense details */}
          <div className="space-y-3">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Expense Details</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-purple-400 text-xs mb-1 block">Description *</label>
                <input className={inp} placeholder="e.g. Gym Membership, Netflix..." value={description}
                  onChange={e => setDescription(e.target.value)} />
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Amount ($) *</label>
                <input className={inp} type="number" step="0.01" placeholder="0.00" value={amount}
                  onChange={e => setAmount(e.target.value)} />
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Day of month</label>
                <input className={inp} type="number" min="1" max="28" placeholder="1" value={dayOfMonth}
                  onChange={e => setDayOfMonth(e.target.value)} />
                <p className="text-purple-600 text-[10px] mt-0.5">Max 28 to avoid month-end issues</p>
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Category *</label>
                <select className={sel} value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Status</label>
                <select className={sel} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Payment Type</label>
                <select className={sel} value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                  <option value="">— None —</option>
                  {paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-purple-400 text-xs mb-1 block">Paid By</label>
                <select className={sel} value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                  <option value="">— None —</option>
                  {paidByOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-purple-400 text-xs mb-1 block">Note (optional)</label>
                <input className={inp} placeholder="Optional note..." value={note}
                  onChange={e => setNote(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Date Range
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-purple-400 text-xs mb-1.5 block">From</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className={sel} value={fromMonth} onChange={e => setFromMonth(parseInt(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select className={sel} value={fromYear} onChange={e => setFromYear(parseInt(e.target.value))}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-purple-400 text-xs mb-1.5 block">To</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className={sel} value={toMonth} onChange={e => setToMonth(parseInt(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select className={sel} value={toYear} onChange={e => setToYear(parseInt(e.target.value))}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary pill */}
            {allMonths.length > 0 && (
              <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2.5">
                <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-violet-200 text-sm">
                  <span className="font-bold">{selectedMonths.length}</span> of {allMonths.length} months selected
                  {amount && parseFloat(amount) > 0 && (
                    <span className="text-violet-400 ml-2">
                      · Total: <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Month picker preview */}
          {allMonths.length > 0 && (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">
                  Select Months ({selectedMonths.length} selected)
                </p>
                <button onClick={toggleAll}
                  className="text-xs text-purple-400 hover:text-white border border-white/15 px-2.5 py-1 rounded transition-colors">
                  {deselected.size === 0 ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {allMonths.map(({ year, month }, i) => {
                  const selected = !deselected.has(i);
                  return (
                    <button key={i} onClick={() => toggleMonth(i)}
                      className={'flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all '
                        + (selected
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                          : 'bg-white/3 border-white/10 text-purple-600 hover:border-white/20')}>
                      <span>{MONTH_SHORT[month]} {year}</span>
                      {selected && <Check className="w-3 h-3 text-violet-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview table */}
          {showPreview && selectedMonths.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Preview — {selectedMonths.length} entries</p>
              <div className="bg-white/3 rounded-xl overflow-hidden border border-white/10 max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      {['Date', 'Description', 'Amount', 'Status'].map(h => (
                        <th key={h} className="text-left text-purple-400 font-semibold py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMonths.map(({ year, month }) => {
                      const day = Math.max(1, Math.min(28, parseInt(dayOfMonth) || 1));
                      const dateStr = year + '-' + pad(month + 1) + '-' + pad(day);
                      return (
                        <tr key={dateStr} className="border-t border-white/5">
                          <td className="py-2 px-3 text-purple-300">{dateStr}</td>
                          <td className="py-2 px-3 text-white">{description}</td>
                          <td className="py-2 px-3 text-green-400 font-semibold">${parseFloat(amount).toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded '
                              + (status === 'PAID' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300')}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="text-purple-500 text-xs">
            {selectedMonths.length > 0 && amount
              ? selectedMonths.length + ' entries · $' + totalAmount.toFixed(2) + ' total'
              : ''}
          </div>
          <div className="flex gap-2">
            <button onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors">
              Cancel
            </button>
            {!showPreview ? (
              <button onClick={handlePreview}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all flex items-center gap-2">
                <ChevronDown className="w-4 h-4" /> Preview
              </button>
            ) : (
              <button onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all flex items-center gap-2">
                <ChevronUp className="w-4 h-4" /> Hide Preview
              </button>
            )}
            <button onClick={handleSave} disabled={saving || selectedMonths.length === 0}
              className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add {selectedMonths.length} Expense{selectedMonths.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkAddModal;