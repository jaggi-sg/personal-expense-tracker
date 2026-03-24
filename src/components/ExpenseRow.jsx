// src/components/ExpenseRow.jsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Edit2, Trash2, Check, X, ChevronDown, ChevronUp, Plus,
  Copy, Globe, SkipForward, CheckSquare, Square, MoreHorizontal,
  CreditCard, User, Receipt, FileText,
} from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { TRAVEL_CURRENCIES } from '../hooks/useCurrencyConverter';
import {
  STATUS_STYLES, STATUS_BORDER, STATUS_CYCLE,
  InlineStatusBadge, FxBadge, ActionMenuWrapper,
} from './ExpenseRowBadges';

// ── Category color ────────────────────────────────────────────────────────────
const CAT_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#059669','#d97706',
  '#dc2626','#db2777','#7c3aed','#4f46e5','#0d9488',
  '#65a30d','#ea580c','#9333ea','#0284c7','#be123c',
];
export const categoryColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
};

// ── Date formatter ────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d   = new Date(dateStr + 'T00:00:00Z');
  const now = new Date();
  const mon = d.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const yr  = d.getUTCFullYear();
  return yr !== now.getFullYear() ? (mon + ' ' + day + ', ' + yr) : (mon + ' ' + day);
};

// ── Amount color by status ────────────────────────────────────────────────────
const amountClass = (status) => ({
  PAID: 'text-green-400', PENDING: 'text-orange-400',
  OVERDUE: 'text-red-400', SKIPPED: 'text-slate-400',
}[status] || 'text-white');

// ── Detail drawer ─────────────────────────────────────────────────────────────
const DetailDrawer = ({ expense, colSpan }) => {
  const hasFx   = !!(expense.foreignAmount && expense.foreignCurrency);
  const hasSubs = expense.subTransactions?.length > 0;
  const fxInfo  = hasFx ? TRAVEL_CURRENCIES.find(c => c.code === expense.foreignCurrency) : null;
  const rate    = expense.exchangeRate;
  const rateStr = rate ? (rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)) : '';

  return (
    <tr className="bg-white/3 border-b border-white/10">
      <td colSpan={colSpan} className="px-4 pb-3 pt-0">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-4">

          <div className="space-y-2">
            <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-wide">Details</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Receipt className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                <span className="text-white text-xs leading-snug">{expense.description.replace(/\s*\(AUTO-GENERATED\)/i, '')}</span>
              </div>
              {expense.trip && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-500 text-xs shrink-0">Trip:</span>
                  <span className="text-violet-300 text-xs font-medium">{expense.trip}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-purple-200 text-xs">{expense.paymentType || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-purple-200 text-xs">{expense.by || '-'}</span>
              </div>
            </div>
          </div>

          {/* Note / receipt details */}
          {expense.note && (
            <div className="md:col-span-3 bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Note</p>
                {expense.note.startsWith('http') ? (
                  <a href={expense.note} target="_blank" rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs underline break-all">
                    {expense.note}
                  </a>
                ) : (
                  <p className="text-white text-xs leading-relaxed">{expense.note}</p>
                )}
              </div>
            </div>
          )}

          {hasFx ? (
            <div className="space-y-2">
              <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-wide">Foreign Currency</p>
              <div className="bg-violet-500/10 border border-violet-500/25 rounded-lg p-3 space-y-1">
                <p className="text-white font-bold text-base">
                  {fxInfo ? fxInfo.flag : ''} {parseFloat(expense.foreignAmount).toLocaleString()} {expense.foreignCurrency}
                </p>
                <p className="text-violet-300 text-xs">{'1 ' + expense.foreignCurrency + ' = $' + rateStr + ' USD'}</p>
                <p className="text-green-300 text-xs font-semibold">{'= $' + expense.amount.toFixed(2) + ' USD'}</p>
              </div>
            </div>
          ) : <div />}

          {hasSubs && (
            <div className="space-y-2">
              <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-wide">
                {'Sub-Transactions (' + expense.subTransactions.length + ')'}
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {expense.subTransactions.map((st, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded px-2 py-1.5">
                    <div>
                      <span className="text-purple-300 text-xs">{st.date}</span>
                      {st.description && <span className="text-purple-400 text-xs ml-2">{st.description}</span>}
                    </div>
                    <span className="text-white text-xs font-semibold">{'$' + parseFloat(st.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ── Inline edit helpers ───────────────────────────────────────────────────────
const selCls = 'bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400';
const inpCls = 'bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400';

const InlineSelect = ({ value, onChange, children, className }) =>
  <select value={value} onChange={e => onChange(e.target.value)} className={selCls + (className ? ' ' + className : '')}>{children}</select>;

const InlineInput = ({ value, onChange, type, className, ...rest }) =>
  <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} className={inpCls + (className ? ' ' + className : '')} {...rest} />;

// ── Main ──────────────────────────────────────────────────────────────────────
const ExpenseRow = ({
  expense, editingExpense, setEditingExpense, saveEdit, cancelEdit,
  deleteExpense, onStatusChange, categories, paymentTypes,
  isExpanded, onToggleExpanded, hasSubTransactions, onClone, onSkipMonth,
  isSelected, onToggleSelect, showCheckbox, isZebra, onCategoryFilter, trips,
}) => {
  const isEditing = editingExpense && editingExpense.id === expense.id;
  const COL       = showCheckbox ? 8 : 7;
  const dotColor  = categoryColor(expense.category);

  const handleToggleStatus = () => {
    const idx  = STATUS_CYCLE.indexOf(expense.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onStatusChange?.(expense.id, next);
  };
  const handleMarkPaid = () => onStatusChange?.(expense.id, 'PAID');

  // ── EDIT MODE ────────────────────────────────────────────────────────────────
  if (isEditing) {
    const isTravel = editingExpense.category === 'Travel';
    const hasFx    = !!(editingExpense.foreignAmount);
    const amtCls   = inpCls + ' w-24' + (hasFx ? ' !bg-violet-500/15 !border-violet-500/50' : '');

    return (
      <>
        <tr className="border-b border-white/10 bg-white/5 align-top">
          {showCheckbox && <td className="py-2 pr-2 pl-2 w-8" />}
          <td className="py-2 pr-3">
            <InlineInput type="date" value={editingExpense.date} className="w-32"
              onChange={(val) => {
                const d = new Date(val + 'T00:00:00Z');
                setEditingExpense({ ...editingExpense, date: val, month: d.toLocaleString('default', { month: 'long', timeZone: 'UTC' }) });
              }} />
          </td>
          <td className="py-2 pr-3">
            <InlineSelect value={editingExpense.category}
              onChange={(val) => {
                const leaving = editingExpense.category === 'Travel' && val !== 'Travel';
                setEditingExpense({ ...editingExpense, category: val, ...(leaving ? { foreignAmount: null, foreignCurrency: null, exchangeRate: null, foreignAmountUSD: null } : {}) });
              }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </InlineSelect>
          </td>
          <td className="py-2 pr-3">
            <InlineInput value={editingExpense.description} className="w-48"
              onChange={(val) => setEditingExpense({ ...editingExpense, description: val })} />
          </td>
          <td className="py-2 pr-3" style={{ minWidth: isTravel ? '280px' : '110px' }}>
            <InlineInput type="number" step="0.01" value={editingExpense.amount}
              disabled={editingExpense.subTransactions?.length > 0}
              className={amtCls}
              onChange={(val) => setEditingExpense({ ...editingExpense, amount: val })} />
            {hasFx && !isTravel && <FxBadge expense={editingExpense} />}
            {isTravel && <CurrencyInput formData={editingExpense} setFormData={setEditingExpense} date={editingExpense.date} />}
          </td>
          <td className="py-2 pr-3 space-y-1">
            <InlineSelect value={editingExpense.paymentType || ''} className="w-28"
              onChange={(val) => setEditingExpense({ ...editingExpense, paymentType: val })}>
              <option value="">-</option>
              {paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </InlineSelect>
            <InlineInput value={editingExpense.by || ''} placeholder="Paid by" className="w-28 block"
              onChange={(val) => setEditingExpense({ ...editingExpense, by: val })} />
          </td>
          <td className="py-2 pr-3">
            <InlineSelect value={editingExpense.status}
              onChange={(val) => setEditingExpense({ ...editingExpense, status: val })}>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </InlineSelect>
          </td>
          <td className="py-2">
            <div className="flex gap-2">
              <button onClick={saveEdit} className="text-green-400 hover:text-green-300 transition-colors" title="Save">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancelEdit} className="text-red-400 hover:text-red-300 transition-colors" title="Cancel">
                <X className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>

        {isTravel && (
          <tr className="border-b border-white/10 bg-white/3">
            {showCheckbox && <td className="py-2 pl-2 w-8" />}
            <td className="py-2 pr-3 text-purple-400 text-xs font-medium whitespace-nowrap">Trip</td>
            <td colSpan={COL - (showCheckbox ? 2 : 1)} className="py-2 pr-3">
              <div className="flex items-center gap-2">
                <select value={editingExpense.trip || ''} onChange={e => setEditingExpense({ ...editingExpense, trip: e.target.value })}
                  className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-violet-400 min-w-[200px]">
                  <option value="">No trip</option>
                  {(trips || []).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {editingExpense.trip && (
                  <button type="button" onClick={() => setEditingExpense({ ...editingExpense, trip: '' })}
                    className="text-purple-500 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}

        {/* Note edit row */}
        <tr className="border-b border-white/10 bg-white/3">
          {showCheckbox && <td className="py-2 pl-2 w-8" />}
          <td className="py-2 pr-3 text-purple-400 text-xs font-medium whitespace-nowrap">Note</td>
          <td colSpan={COL - (showCheckbox ? 2 : 1)} className="py-2 pr-3">
            <textarea
              value={editingExpense.note || ''}
              onChange={e => setEditingExpense({ ...editingExpense, note: e.target.value })}
              placeholder="Optional note or receipt URL..."
              rows={2}
              className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400 resize-none"
            />
          </td>
        </tr>

        {hasSubTransactions && editingExpense.subTransactions?.length > 0 && (
          <tr className="bg-purple-900/30">
            <td colSpan={COL} className="py-3 px-6">
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold text-sm">Sub-Transactions</h4>
                  <button onClick={() => setEditingExpense({ ...editingExpense, subTransactions: [...editingExpense.subTransactions, { date: new Date().toISOString().split('T')[0], amount: '', description: '' }] })}
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 text-xs flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editingExpense.subTransactions.map((st, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white/10 rounded p-2">
                      <input type="date" value={st.date}
                        onChange={(e) => { const u=[...editingExpense.subTransactions]; u[idx].date=e.target.value; setEditingExpense({...editingExpense,subTransactions:u}); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-32" />
                      <input type="text" placeholder="Description" value={st.description||''}
                        onChange={(e) => { const u=[...editingExpense.subTransactions]; u[idx].description=e.target.value; setEditingExpense({...editingExpense,subTransactions:u}); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs flex-1 placeholder-purple-300" />
                      <input type="number" step="0.01" placeholder="Amount" value={st.amount}
                        onChange={(e) => { const u=[...editingExpense.subTransactions]; u[idx].amount=e.target.value; const tot=u.reduce((s,t)=>s+(parseFloat(t.amount)||0),0); setEditingExpense({...editingExpense,subTransactions:u,amount:tot.toFixed(2)}); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-24" />
                      <button onClick={() => { const u=editingExpense.subTransactions.filter((_,i)=>i!==idx); const tot=u.reduce((s,t)=>s+(parseFloat(t.amount)||0),0); setEditingExpense({...editingExpense,subTransactions:u,amount:tot.toFixed(2)}); }}
                        className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/20 flex justify-between">
                    <p className="text-white font-semibold text-sm">{'Total: $' + (editingExpense.amount||'0.00')}</p>
                    <p className="text-purple-300 text-xs">{editingExpense.subTransactions.length + ' transaction(s)'}</p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  // ── VIEW MODE ─────────────────────────────────────────────────────────────────
  const hasFx       = !!(expense.foreignAmount && expense.foreignCurrency);
  const borderCls   = STATUS_BORDER[expense.status] || STATUS_BORDER.PENDING;
  const selectedCls = isSelected ? 'bg-blue-500/10' : isZebra ? 'bg-white/[0.03]' : '';
  const expandedCls = isExpanded ? 'bg-white/5' : '';
  const rowCls      = 'border-b border-white/10 hover:bg-white/8 transition-colors cursor-pointer ' + borderCls + ' ' + selectedCls + ' ' + expandedCls;

  return (
    <>
      <tr className={rowCls} onClick={() => onToggleExpanded?.(expense.id)}>
        {showCheckbox && (
          <td className="py-2 pr-2 pl-2 w-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => onToggleSelect?.(expense.id)} className="text-purple-300 hover:text-white transition-colors">
              {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
            </button>
          </td>
        )}
        <td className="py-2 pr-3 whitespace-nowrap">
          <span className="text-white text-sm font-medium">{formatDate(expense.date)}</span>
        </td>
        <td className="py-2 pr-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <button onClick={() => onCategoryFilter?.(expense.category)}
              className="w-2 h-2 rounded-full shrink-0 hover:ring-2 ring-white/50 transition-all"
              style={{ background: dotColor }} title={'Filter by ' + expense.category} />
            <span className="text-white text-sm">{expense.category}</span>
          </div>
        </td>
        <td className="py-2 pr-3" style={{ maxWidth: '340px' }}>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm leading-snug">{expense.description.replace(/\s*\(AUTO-GENERATED\)/i, '')}</span>
            {/AUTO-GENERATED/i.test(expense.description) && (
              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">Auto</span>
            )}
            {hasSubTransactions && expense.subTransactions?.length > 0 && (
              <span className="text-purple-400 text-xs bg-purple-500/15 px-1.5 py-0.5 rounded shrink-0">{expense.subTransactions.length} items</span>
            )}
            {isExpanded
              ? <ChevronUp className="w-3 h-3 text-purple-400 shrink-0 ml-auto" />
              : <ChevronDown className="w-3 h-3 text-purple-500 shrink-0 ml-auto opacity-0 group-hover:opacity-100" />}
          </div>
        </td>
        <td className="py-2 pr-3 whitespace-nowrap">
          <span className={'font-semibold text-sm ' + amountClass(expense.status)}>{'$' + expense.amount.toFixed(2)}</span>
          {hasFx && <FxBadge expense={expense} />}
        </td>
        <td className="py-2 pr-3 whitespace-nowrap">
          <span className="text-white text-sm">{expense.paymentType || '-'}</span>
          {expense.by && <div className="text-purple-400 text-[10px]">{expense.by}</div>}
        </td>
        <td className="py-2 pr-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
          <InlineStatusBadge status={expense.status} onToggle={handleToggleStatus} />
        </td>
        <td className="py-2 pr-2" onClick={e => e.stopPropagation()}>
          <ActionMenuWrapper
            expense={expense}
            onEdit={() => setEditingExpense({ ...expense })}
            onDelete={() => deleteExpense(expense.id)}
            onClone={onClone}
            onSkipMonth={onSkipMonth}
            onMarkPaid={handleMarkPaid}
          />
        </td>
      </tr>
      {isExpanded && <DetailDrawer expense={expense} colSpan={COL} />}
    </>
  );
};

export default ExpenseRow;