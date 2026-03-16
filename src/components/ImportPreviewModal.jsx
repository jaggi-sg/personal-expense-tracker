// src/components/ImportPreviewModal.jsx

import React, { useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, RefreshCw, Tag, CreditCard } from 'lucide-react';

const Section = ({ color, icon: Icon, title, count, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (!count) return null;
  return (
    <div className={`border border-${color}-500/30 rounded-xl overflow-hidden mb-3`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-${color}-500/10 hover:bg-${color}-500/15 transition-colors`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${color}-400`} />
          <span className={`text-${color}-200 font-semibold text-sm`}>{title}</span>
          <span className={`bg-${color}-500/30 text-${color}-200 text-xs px-2 py-0.5 rounded-full font-bold`}>{count}</span>
        </div>
        <span className="text-purple-400 text-xs">{open ? 'hide ▲' : 'show ▼'}</span>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
};

const MiniTable = ({ items }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-white/10">
          {['Date','Description','Category','Amount','Type','Status'].map(h => (
            <th key={h} className="text-left text-purple-400 font-semibold py-1.5 pr-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.slice(0, 20).map((e, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            <td className="py-1.5 pr-3 text-purple-300 whitespace-nowrap">{e.date}</td>
            <td className="py-1.5 pr-3 text-white max-w-[160px] truncate">{e.description}</td>
            <td className="py-1.5 pr-3 text-purple-300 whitespace-nowrap">{e.category}</td>
            <td className="py-1.5 pr-3 text-white font-semibold whitespace-nowrap">${e.amount?.toFixed(2)}</td>
            <td className="py-1.5 pr-3 text-purple-300 whitespace-nowrap">{e.type}</td>
            <td className="py-1.5 pr-3">
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold
                ${e.status === 'PAID' ? 'bg-green-500/20 text-green-300'
                : e.status === 'OVERDUE' ? 'bg-red-500/20 text-red-300'
                : 'bg-orange-500/20 text-orange-300'}`}>
                {e.status}
              </span>
            </td>
          </tr>
        ))}
        {items.length > 20 && (
          <tr><td colSpan={6} className="py-2 text-purple-500 text-center text-xs">+ {items.length - 20} more not shown</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const ImportPreviewModal = ({
  isOpen,
  onClose,
  diff,              // { brandNew, duplicates, updates }
  importMeta,        // { type, categories, nonRecurringCategories, paymentTypes }
  existingCategories,
  existingNonRecurringCategories,
  existingPaymentTypes,
  onConfirm,         // (options) => void
}) => {
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [includeUpdates,    setIncludeUpdates]    = useState(true);
  const [mergeCategories,   setMergeCategories]   = useState(true);
  const [mergePaymentTypes, setMergePaymentTypes] = useState(true);

  if (!isOpen || !diff) return null;

  const { brandNew = [], duplicates = [], updates = [] } = diff;
  const isFull = importMeta?.type === 'full';

  // New lookup items not already in existing lists
  const newCats    = (importMeta?.categories || []).filter(c => !existingCategories.includes(c));
  const newNonCats = (importMeta?.nonRecurringCategories || []).filter(c => !existingNonRecurringCategories.includes(c));
  const newPay     = (importMeta?.paymentTypes || []).filter(p => !existingPaymentTypes.includes(p));

  const totalToImport =
    brandNew.length +
    (includeDuplicates ? duplicates.length : 0) +
    (includeUpdates    ? updates.length    : 0);

  const handleConfirm = () => {
    onConfirm({
      expenses:              [...brandNew,
        ...(includeDuplicates ? duplicates : []),
        ...(includeUpdates    ? updates    : [])],
      mergeCategories,
      mergePaymentTypes,
      newCats,
      newNonCats,
      newPay,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Upload className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Import Preview</h2>
              <p className="text-purple-400 text-xs">Review changes before applying</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'New',       count: brandNew.length,   color: 'green'  },
              { label: 'Duplicate', count: duplicates.length, color: 'orange' },
              { label: 'Update',    count: updates.length,    color: 'blue'   },
            ].map(s => (
              <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/25 rounded-xl p-3 text-center`}>
                <p className={`text-${s.color}-300 text-2xl font-bold`}>{s.count}</p>
                <p className={`text-${s.color}-400 text-xs mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Diff sections */}
          <Section color="green" icon={CheckCircle} title="New expenses" count={brandNew.length} defaultOpen={true}>
            <MiniTable items={brandNew} />
          </Section>

          <Section color="orange" icon={AlertTriangle} title="Possible duplicates (same date + description + amount)" count={duplicates.length}>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={includeDuplicates} onChange={e => setIncludeDuplicates(e.target.checked)}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-orange-200 text-sm">Include duplicates in import</span>
            </label>
            <MiniTable items={duplicates} />
          </Section>

          <Section color="blue" icon={RefreshCw} title="Updates (same ID, different data)" count={updates.length}>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={includeUpdates} onChange={e => setIncludeUpdates(e.target.checked)}
                className="w-4 h-4 accent-blue-500" />
              <span className="text-blue-200 text-sm">Apply updates to existing expenses</span>
            </label>
            <MiniTable items={updates} />
          </Section>

          {/* Lookup lists (full backup only) */}
          {isFull && (newCats.length > 0 || newNonCats.length > 0 || newPay.length > 0) && (
            <div className="border border-purple-500/30 rounded-xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200 font-semibold text-sm">Lookup Lists</span>
              </div>

              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={mergeCategories} onChange={e => setMergeCategories(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-purple-200 text-sm">
                  Merge categories
                  {newCats.length > 0 && <span className="text-purple-400 ml-1">({newCats.length} new recurring: {newCats.join(', ')})</span>}
                  {newNonCats.length > 0 && <span className="text-purple-400 ml-1">({newNonCats.length} new non-recurring: {newNonCats.join(', ')})</span>}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={mergePaymentTypes} onChange={e => setMergePaymentTypes(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-purple-200 text-sm">
                  Merge payment types
                  {newPay.length > 0 && <span className="text-purple-400 ml-1">({newPay.length} new: {newPay.join(', ')})</span>}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-purple-400 text-sm">
            <span className="text-white font-semibold">{totalToImport}</span> expenses will be imported
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 text-purple-300 hover:text-white text-sm transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={totalToImport === 0}
              className="px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white font-semibold text-sm transition-all"
            >
              Import {totalToImport} expenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;