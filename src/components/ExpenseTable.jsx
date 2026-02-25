// src/components/ExpenseTable.jsx

import React, { useState } from 'react';
import { Trash2, Download, CheckSquare, Square } from 'lucide-react';
import ExpenseRow from './ExpenseRow';
import { exportToJSON, exportToCSV } from '../utils/dataExport';

const ExpenseTable = ({
  expenses,          // current page (paginated)
  allFilteredExpenses = [], // all filtered (for export & bulk) — pass from parent
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
  onBulkDelete,      // (ids: string[]) => void — wired in parent
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const allPageIds  = expenses.map(e => e.id);
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allPageIds])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected expense(s)?`)) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const handleExportFiltered = (format) => {
    const toExport = allFilteredExpenses.length > 0 ? allFilteredExpenses : expenses;
    if (format === 'json') exportToJSON(toExport, 'filtered-expenses');
    else exportToCSV(toExport, 'filtered-expenses');
  };

  const colSpan = 10; // date, month, cat, desc, amt, payType, paidBy, status, actions + checkbox

  return (
    <div className="relative">
      {/* ── Bulk action bar ──────────────────────────────────────────────────── */}
      {someSelected && (
        <div className="flex items-center justify-between bg-blue-500/20 border border-blue-500/40 rounded-lg px-4 py-2 mb-3 gap-3">
          <span className="text-blue-300 text-sm font-semibold">
            {selectedIds.length} expense{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-blue-300 hover:text-white transition-colors px-3 py-1.5 rounded border border-blue-500/30 hover:border-blue-400"
            >
              Clear selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.length} selected
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
          <span className="text-purple-400 text-xs">Export filtered:</span>
          <button
            onClick={() => handleExportFiltered('json')}
            className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 px-2.5 py-1.5 rounded transition-all"
          >
            <Download className="w-3 h-3" /> JSON
          </button>
          <button
            onClick={() => handleExportFiltered('csv')}
            className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 px-2.5 py-1.5 rounded transition-all"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left min-w-max">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
            <tr className="border-b border-white/20">
              {/* Select-all checkbox */}
              <th className="pb-3 pr-2 pl-2 w-8">
                <button onClick={toggleSelectAll} className="text-purple-300 hover:text-white transition-colors" title={allSelected ? 'Deselect all' : 'Select all on page'}>
                  {allSelected
                    ? <CheckSquare className="w-4 h-4 text-blue-400" />
                    : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Date</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Month</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Category</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Description</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Amount</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Payment Type</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Paid By</th>
              <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap text-sm">Status</th>
              <th className="pb-3 text-purple-200 font-semibold whitespace-nowrap text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-12 text-purple-300">
                  {searchQuery
                    ? `No expenses found matching "${searchQuery}"`
                    : 'No expenses found. Add your first expense above!'}
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
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