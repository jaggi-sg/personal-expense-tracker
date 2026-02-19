// src/components/ExpenseRow.jsx - FIXED VERSION

import React from 'react';
import { Edit2, Trash2, Check, X, ChevronDown, ChevronUp, Plus, Copy } from 'lucide-react';

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
  onClone // ← Make sure this prop is here
}) => {
  const isEditing = editingExpense && editingExpense.id === expense.id;

  if (isEditing) {
    return (
      <>
        <tr className="border-b border-white/10 hover:bg-white/5">
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              {paymentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
              <button
                onClick={saveEdit}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={cancelEdit}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
        {hasSubTransactions && editingExpense.subTransactions && editingExpense.subTransactions.length > 0 && (
          <tr className="bg-purple-900/30">
            <td colSpan="9" className="py-3 px-6">
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold text-sm">Edit Sub-Transactions:</h4>
                  <button
                    onClick={() => {
                      const newSubTransactions = [...editingExpense.subTransactions, { date: new Date().toISOString().split('T')[0], amount: '', description: '' }];
                      setEditingExpense({ ...editingExpense, subTransactions: newSubTransactions });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Transaction
                  </button>
                </div>
                <div className="space-y-2">
                  {editingExpense.subTransactions.map((st, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white/10 rounded p-2">
                      <input
                        type="date"
                        value={st.date}
                        onChange={(e) => {
                          const updated = [...editingExpense.subTransactions];
                          updated[idx].date = e.target.value;
                          setEditingExpense({ ...editingExpense, subTransactions: updated });
                        }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-32"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={st.description || ''}
                        onChange={(e) => {
                          const updated = [...editingExpense.subTransactions];
                          updated[idx].description = e.target.value;
                          setEditingExpense({ ...editingExpense, subTransactions: updated });
                        }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs flex-1 placeholder-purple-300"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={st.amount}
                        onChange={(e) => {
                          const updated = [...editingExpense.subTransactions];
                          updated[idx].amount = e.target.value;
                          const total = updated.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                          setEditingExpense({ ...editingExpense, subTransactions: updated, amount: total.toFixed(2) });
                        }}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs w-24"
                      />
                      <button
                        onClick={() => {
                          const updated = editingExpense.subTransactions.filter((_, i) => i !== idx);
                          const total = updated.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                          setEditingExpense({ ...editingExpense, subTransactions: updated, amount: total.toFixed(2) });
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
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

  return (
    <>
      <tr className="border-b border-white/10 hover:bg-white/5">
        <td className="py-3 pr-4 text-white whitespace-nowrap">{expense.date}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap">{expense.month}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap">{expense.category}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap">
          <div className="flex items-center gap-2">
            {expense.description}
            {hasSubTransactions && expense.subTransactions && expense.subTransactions.length > 0 && (
              <button
                onClick={() => onToggleExpanded(expense.id)}
                className="text-purple-300 hover:text-purple-200 flex items-center gap-1 text-xs bg-purple-500/20 px-2 py-1 rounded"
              >
                ({expense.subTransactions.length} items)
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </td>
        <td className="py-3 pr-4 text-white font-semibold whitespace-nowrap">${expense.amount.toFixed(2)}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap">{expense.paymentType || '-'}</td>
        <td className="py-3 pr-4 text-white whitespace-nowrap">{expense.by}</td>
        <td className="py-3 pr-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            expense.status === 'PAID' ? 'bg-green-500 text-white' :
            expense.status === 'PENDING' ? 'bg-orange-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {expense.status}
          </span>
        </td>
        <td className="py-3 whitespace-nowrap">
          <div className="flex gap-2">
            {/* Clone button - only show if handler exists */}
            {onClone && (
              <button
                onClick={() => onClone(expense)}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="Clone/Duplicate"
              >
                <Copy className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setEditingExpense({ ...expense })}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
      {hasSubTransactions && isExpanded && expense.subTransactions && expense.subTransactions.length > 0 && (
        <tr className="bg-purple-900/20">
          <td colSpan="9" className="py-3 px-6">
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-white font-semibold mb-3 text-sm">Sub-Transactions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {expense.subTransactions.map((st, idx) => (
                  <div key={idx} className="bg-white/10 rounded p-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm">{st.date}</span>
                      <span className="text-white font-semibold text-sm">${parseFloat(st.amount).toFixed(2)}</span>
                    </div>
                    {st.description && (
                      <span className="text-purple-300 text-xs">{st.description}</span>
                    )}
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