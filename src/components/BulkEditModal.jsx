// src/components/BulkEditModal.jsx

import React, { useState } from 'react';
import { X, Edit3, CheckCircle } from 'lucide-react';

const Field = ({ label, value, onChange, children }) => (
  <div>
    <label className="block text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1.5">{label}</label>
    {children || (
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400" />
    )}
  </div>
);

const sel = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400';

const BulkEditModal = ({ isOpen, onClose, selectedIds, expenses, categories, nonRecurringCategories, paymentTypes, onApply }) => {
  const [status,      setStatus]      = useState('');
  const [category,    setCategory]    = useState('');
  const [paymentType, setPaymentType] = useState('');

  if (!isOpen) return null;

  const selected = expenses.filter(e => selectedIds.includes(e.id));
  const hasRecurring    = selected.some(e => e.type === 'Recurring');
  const hasNonRecurring = selected.some(e => e.type === 'Non-Recurring');

  // Build merged category list relevant to selection
  const relevantCats = [
    ...(hasRecurring    ? categories            : []),
    ...(hasNonRecurring ? nonRecurringCategories : []),
  ];
  const uniqueCats = [...new Set(relevantCats)].sort();

  const changesCount = [status, category, paymentType].filter(Boolean).length;

  const handleApply = () => {
    if (!changesCount) return;
    const changes = {};
    if (status)      changes.status      = status;
    if (category)    changes.category    = category;
    if (paymentType) changes.paymentType = paymentType;
    onApply(selectedIds, changes);
    onClose();
  };

  const handleClose = () => {
    setStatus(''); setCategory(''); setPaymentType('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Edit3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Bulk Edit</h2>
              <p className="text-purple-400 text-xs">
                Editing <span className="text-white font-semibold">{selected.length}</span> expense{selected.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-purple-400 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            Leave any field blank to keep it unchanged. Only filled fields will be updated.
          </p>

          {/* Status */}
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value)} className={sel}>
              <option value="">— keep unchanged —</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </Field>

          {/* Category */}
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className={sel}>
              <option value="">— keep unchanged —</option>
              {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          {/* Payment type */}
          <Field label="Payment Type">
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className={sel}>
              <option value="">— keep unchanged —</option>
              {paymentTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          {/* Preview of affected */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10">
              <p className="text-purple-300 text-xs font-semibold">Affected expenses</p>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {selected.map(e => (
                <div key={e.id} className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{e.description}</p>
                    <p className="text-purple-500 text-xs">{e.date} · {e.category}</p>
                  </div>
                  <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded shrink-0
                    ${e.status === 'PAID' ? 'bg-green-500/20 text-green-300'
                    : e.status === 'OVERDUE' ? 'bg-red-500/20 text-red-300'
                    : 'bg-orange-500/20 text-orange-300'}`}>
                    {status || e.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-purple-400 text-xs">
            {changesCount > 0
              ? <span><span className="text-white font-semibold">{changesCount}</span> field{changesCount !== 1 ? 's' : ''} will change</span>
              : 'No changes selected'}
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleApply} disabled={!changesCount}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-sm transition-all">
              <CheckCircle className="w-4 h-4" />
              Apply to {selected.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;