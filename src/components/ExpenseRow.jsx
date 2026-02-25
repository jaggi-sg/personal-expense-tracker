// src/components/ExpenseRow.jsx

import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, ChevronDown, ChevronUp, Plus, Copy, Calendar, CreditCard, User, Tag } from 'lucide-react';

// ── Row background tint by status ─────────────────────────────────────────────
const ROW_STATUS_STYLES = {
  PAID:    'bg-green-500/5  border-l-2 border-l-green-500/60  hover:bg-green-500/10',
  PENDING: 'bg-orange-500/5 border-l-2 border-l-orange-500/60 hover:bg-orange-500/10',
  OVERDUE: 'bg-red-500/8    border-l-2 border-l-red-500/70    hover:bg-red-500/12',
};

const STATUS_BADGE = {
  PAID:    'bg-green-500/20  text-green-300  border border-green-500/40',
  PENDING: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
  OVERDUE: 'bg-red-500/20   text-red-300    border border-red-500/40',
};

const ExpenseRow = ({
  expense,
  editingExpense,
  setEditingExpense,
  saveEdit,
  cancelEdit,
  deleteExpense,
  categories,
  paymentTypes,
  isExpanded,
  onToggleExpanded,
  hasSubTransactions = false,
  onClone,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isEditing = editingExpense && editingExpense.id === expense.id;
  const rowStyle = ROW_STATUS_STYLES[expense.status] || ROW_STATUS_STYLES.PAID;

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <>
        <tr className="border-b border-white/10 bg-blue-500/10 border-l-2 border-l-blue-400">
          {showCheckbox && <td className="py-3 pr-2 pl-2" />}
          <td className="py-3 pr-4 whitespace-nowrap">
            <input
              type="date"
              value={editingExpense.date}
              onChange={(e) => {
                const date = new Date(e.target.value + 'T00:00:00Z');
                setEditingExpense({
                  ...editingExpense,
                  date: e.target.value,
                  month: date.toLocaleString('default', { month: 'long', timeZone: 'UTC' })
                });
              }}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm w-32"
            />
          </td>
          <td className="py-3 pr-4 text-white whitespace-nowrap">{editingExpense.month}</td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <select
              value={editingExpense.category}
              onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <input
              type="text"
              value={editingExpense.description}
              onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm w-32"
            />
          </td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <input
              type="number"
              step="0.01"
              value={editingExpense.amount}
              onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm w-24"
              disabled={editingExpense.subTransactions && editingExpense.subTransactions.length > 0}
            />
          </td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <select
              value={editingExpense.paymentType || ''}
              onChange={(e) => setEditingExpense({ ...editingExpense, paymentType: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
            >
              <option value="">-</option>
              {paymentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <input
              type="text"
              value={editingExpense.by}
              onChange={(e) => setEditingExpense({ ...editingExpense, by: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm w-24"
            />
          </td>
          <td className="py-3 pr-4 whitespace-nowrap">
            <select
              value={editingExpense.status}
              onChange={(e) => setEditingExpense({ ...editingExpense, status: e.target.value })}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
            >
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </td>
          <td className="py-3 whitespace-nowrap">
            <div className="flex gap-2">
              <button onClick={saveEdit} className="text-green-400 hover:text-green-300" title="Save">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={cancelEdit} className="text-red-400 hover:text-red-300" title="Cancel">
                <X className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
        {hasSubTransactions && editingExpense.subTransactions && editingExpense.subTransactions.length > 0 && (
          <tr className="bg-purple-900/30">
            <td colSpan={showCheckbox ? 10 : 9} className="py-3 px-6">
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold text-sm">Edit Sub-Transactions:</h4>
                  <button
                    onClick={() => {
                      const newSubs = [...editingExpense.subTransactions, { date: new Date().toISOString().split('T')[0], amount: '', description: '' }];
                      setEditingExpense({ ...editingExpense, subTransactions: newSubs });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Transaction
                  </button>
                </div>
                <div className="space-y-2">
                  {editingExpense.subTransactions.map((st, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white/10 rounded p-2">
                      <input type="date" value={st.date}
                        onChange={(e) => { const u = [...editingExpense.subTransactions]; u[idx].date = e.target.value; setEditingExpense({ ...editingExpense, subTransactions: u }); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-32" />
                      <input type="text" placeholder="Description" value={st.description || ''}
                        onChange={(e) => { const u = [...editingExpense.subTransactions]; u[idx].description = e.target.value; setEditingExpense({ ...editingExpense, subTransactions: u }); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs flex-1 placeholder-purple-300" />
                      <input type="number" step="0.01" placeholder="Amount" value={st.amount}
                        onChange={(e) => { const u = [...editingExpense.subTransactions]; u[idx].amount = e.target.value; const total = u.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0); setEditingExpense({ ...editingExpense, subTransactions: u, amount: total.toFixed(2) }); }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-24" />
                      <button onClick={() => { const u = editingExpense.subTransactions.filter((_, i) => i !== idx); const total = u.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0); setEditingExpense({ ...editingExpense, subTransactions: u, amount: total.toFixed(2) }); }} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                    <p className="text-white font-semibold text-sm">Total: ${editingExpense.amount || '0.00'}</p>
                    <p className="text-purple-300 text-xs">{editingExpense.subTransactions.length} transaction(s)</p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  const isAutoGenerated = expense.description?.includes('AUTO-GENERATED');
  const cleanDescription = expense.description?.replace('(AUTO-GENERATED)', '').trim();

  return (
    <>
      {/* ── Main row ── */}
      <tr
        className={`border-b border-white/10 transition-all cursor-pointer ${rowStyle} ${isSelected ? 'ring-1 ring-inset ring-blue-400/50' : ''}`}
        onClick={() => setShowDetails(v => !v)}
      >
        {/* Checkbox */}
        {showCheckbox && (
          <td className="py-3 pl-2 pr-2 whitespace-nowrap" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(expense.id)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
          </td>
        )}

        <td className="py-3 pr-4 text-white whitespace-nowrap text-sm">{expense.date}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap text-sm">{expense.month}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap text-sm">{expense.category}</td>

        {/* Description — with AUTO-GENERATED badge + sub-transaction toggle */}
        <td className="py-3 pr-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white">{cleanDescription}</span>
            {isAutoGenerated && (
              <span className="text-xs bg-purple-500/30 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-medium">AUTO</span>
            )}
            {hasSubTransactions && expense.subTransactions && expense.subTransactions.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpanded(expense.id); }}
                className="text-purple-300 hover:text-purple-200 flex items-center gap-1 text-xs bg-purple-500/20 px-2 py-0.5 rounded"
              >
                {expense.subTransactions.length} items
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </td>

        <td className="py-3 pr-4 text-white font-semibold whitespace-nowrap text-sm">${expense.amount.toFixed(2)}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap text-sm">{expense.paymentType || '-'}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap text-sm">{expense.by || '-'}</td>

        {/* Status badge */}
        <td className="py-3 pr-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_BADGE[expense.status] || STATUS_BADGE.PAID}`}>
            {expense.status}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowDetails(v => !v)}
              className="text-purple-300 hover:text-purple-100 transition-colors"
              title="Expand details"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {onClone && (
              <button onClick={() => onClone(expense)} className="text-green-400 hover:text-green-300 transition-colors" title="Clone">
                <Copy className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setEditingExpense({ ...expense })} className="text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => deleteExpense(expense.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* ── Expand: details panel ── */}
      {showDetails && (
        <tr className={`border-b border-white/10 ${rowStyle}`}>
          <td colSpan={showCheckbox ? 10 : 9} className="px-6 pb-4 pt-1">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-purple-400 text-xs">Date</p>
                  <p className="text-white text-sm font-medium">{expense.date}</p>
                  <p className="text-purple-300 text-xs">{expense.month}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-purple-400 text-xs">Category</p>
                  <p className="text-white text-sm font-medium">{expense.category}</p>
                  <p className="text-purple-300 text-xs">{expense.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-purple-400 text-xs">Payment</p>
                  <p className="text-white text-sm font-medium">{expense.paymentType || '—'}</p>
                  <p className="text-purple-300 text-xs">{expense.by || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-purple-400 text-xs">Amount & Status</p>
                  <p className="text-white text-sm font-bold">${expense.amount.toFixed(2)}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${STATUS_BADGE[expense.status]}`}>{expense.status}</span>
                </div>
              </div>
              {expense.description && (
                <div className="col-span-2 md:col-span-4 pt-2 border-t border-white/10">
                  <p className="text-purple-400 text-xs mb-1">Description</p>
                  <p className="text-white text-sm">{expense.description}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* ── Expand: sub-transactions ── */}
      {hasSubTransactions && isExpanded && expense.subTransactions && expense.subTransactions.length > 0 && (
        <tr className="bg-purple-900/20">
          <td colSpan={showCheckbox ? 10 : 9} className="py-3 px-6">
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-white font-semibold mb-3 text-sm">Sub-Transactions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {expense.subTransactions.map((st, idx) => (
                  <div key={idx} className="bg-white/10 rounded p-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm">{st.date}</span>
                      <span className="text-white font-semibold text-sm">${parseFloat(st.amount).toFixed(2)}</span>
                    </div>
                    {st.description && <span className="text-purple-300 text-xs">{st.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ExpenseRow;