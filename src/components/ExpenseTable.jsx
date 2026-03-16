// src/components/ExpenseTable.jsx

import React, { useState } from 'react';
import { Trash2, Download, CheckSquare, Square, Edit3, SkipForward } from 'lucide-react';
import ExpenseRow from './ExpenseRow';
import { exportToJSON, exportToCSV } from '../utils/dataExport';

const ExpenseTable = ({
  expenses,
  allFilteredExpenses = [],
  editingExpense,
  setEditingExpense,
  saveEdit,
  cancelEdit,
  deleteExpense,
  categories,
  paymentTypes,
  searchQuery,
  onClone,
  hasSubTransactions = false,
  expandedTransactions = {},
  onToggleExpanded = () => {},
  onBulkDelete,   // (ids) => void
  onBulkEdit,     // (ids) => void  ← new
  onSkipMonth,    // (expense) => void  ← new
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const allPageIds   = expenses.map(e => e.id);
  const allSelected  = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
    else             setSelectedIds(prev => [...new Set([...prev, ...allPageIds])]);
  };

  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected expense(s)?`)) return;
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkEdit = () => {
    onBulkEdit?.(selectedIds);
  };

  const handleExportFiltered = (fmt) => {
    const toExport = allFilteredExpenses.length > 0 ? allFilteredExpenses : expenses;
    if (fmt === 'json') exportToJSON(toExport, 'filtered-expenses');
    else                exportToCSV(toExport, 'filtered-expenses');
  };

  return (
    <div className="relative">

      {/* ── Bulk action bar ─────────────────────────────────────────────────── */}
      {someSelected && (
        <div className="flex items-center justify-between bg-blue-500/15 border border-blue-500/35 rounded-lg px-4 py-2.5 mb-3 gap-3 flex-wrap">
          <span className="text-blue-300 text-sm font-semibold">
            {selectedIds.length} expense{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-400 px-3 py-1.5 rounded transition-colors"
            >
              Clear
            </button>
            {onBulkEdit && (
              <button
                onClick={handleBulkEdit}
                className="flex items-center gap-1.5 text-xs bg-blue-500/25 hover:bg-blue-500/40 text-blue-200 border border-blue-500/40 px-3 py-1.5 rounded font-semibold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit {selectedIds.length}
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.length}
            </button>
          </div>
        </div>
      )}

      {/* ── Export filtered row ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-purple-400 text-xs">
          {allFilteredExpenses.length > 0
            ? `${allFilteredExpenses.length} filtered result${allFilteredExpenses.length !== 1 ? 's' : ''}`
            : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} on this page`}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-purple-500 text-xs">Export filtered:</span>
          {['json','csv'].map(fmt => (
            <button key={fmt} onClick={() => handleExportFiltered(fmt)}
              className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/25 px-2.5 py-1.5 rounded transition-all uppercase">
              <Download className="w-3 h-3" /> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left min-w-max">
          <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
            <tr className="border-b border-white/20">
              <th className="pb-3 pr-2 pl-2 w-8">
                <button onClick={toggleSelectAll} className="text-purple-300 hover:text-white transition-colors"
                  title={allSelected ? 'Deselect all' : 'Select all on page'}>
                  {allSelected
                    ? <CheckSquare className="w-4 h-4 text-blue-400" />
                    : <Square className="w-4 h-4" />}
                </button>
              </th>
              {['Date','Month','Category','Description','Amount','Payment Type','Paid By','Status','Actions'].map(h => (
                <th key={h} className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-purple-300">
                  {searchQuery
                    ? `No expenses found matching "${searchQuery}"`
                    : 'No expenses found. Add your first expense above!'}
                </td>
              </tr>
            ) : (
              expenses.map(expense => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  editingExpense={editingExpense}
                  setEditingExpense={setEditingExpense}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                  deleteExpense={deleteExpense}
                  categories={categories}
                  paymentTypes={paymentTypes}
                  hasSubTransactions={hasSubTransactions}
                  isExpanded={expandedTransactions[expense.id]}
                  onToggleExpanded={onToggleExpanded}
                  onClone={onClone}
                  isSelected={selectedIds.includes(expense.id)}
                  onToggleSelect={toggleSelect}
                  showCheckbox={true}
                  onSkipMonth={expense.type === 'Recurring' ? onSkipMonth : undefined}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;