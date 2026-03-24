// src/components/ExpenseTable.jsx

import React, { useState } from 'react';
import { Trash2, Download, CheckSquare, Square, Edit3, Plus, AlertTriangle, ChevronDown, ChevronUp, CheckCheck } from 'lucide-react';
import ExpenseRow, { categoryColor } from './ExpenseRow';
import { exportToJSON, exportToCSV } from '../utils/dataExport';

// ── Pending / Overdue banner ──────────────────────────────────────────────────
const OverdueBanner = ({ expenses, onStatusChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const overdue  = expenses.filter(e => e.status === 'OVERDUE');
  const pending  = expenses.filter(e => e.status === 'PENDING');
  const all      = [...overdue, ...pending];
  if (all.length === 0) return null;

  const overdueAmt  = overdue.reduce((s, e) => s + e.amount, 0);
  const pendingAmt  = pending.reduce((s, e) => s + e.amount, 0);
  const totalAmt    = overdueAmt + pendingAmt;

  const markAllPaid = () => {
    if (!window.confirm(`Mark all ${all.length} pending/overdue expense(s) as PAID?`)) return;
    all.forEach(e => onStatusChange?.(e.id, 'PAID'));
  };

  return (
    <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-0.5">
          {overdue.length > 0 && (
            <span className="text-xs">
              <span className="text-red-400 font-semibold">{overdue.length} overdue</span>
              <span className="text-amber-600 ml-1">· ${overdueAmt.toFixed(2)}</span>
            </span>
          )}
          {pending.length > 0 && (
            <span className="text-xs">
              <span className="text-orange-400 font-semibold">{pending.length} pending</span>
              <span className="text-amber-600 ml-1">· ${pendingAmt.toFixed(2)}</span>
            </span>
          )}
          <span className="text-amber-300 text-xs font-bold">= ${totalAmt.toFixed(2)} owed</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={markAllPaid}
            className="flex items-center gap-1.5 text-xs bg-green-500/20 hover:bg-green-500/35 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-lg font-semibold transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all paid
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-amber-500 hover:text-amber-300 transition-colors p-0.5"
            title={collapsed ? 'Show details' : 'Collapse'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Detail list */}
      {!collapsed && (
        <div className="border-t border-amber-500/20 px-4 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
          {all.map(e => (
            <div key={e.id} className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5 gap-2">
              <div className="min-w-0">
                <span className="text-white text-xs font-medium truncate block">{e.description}</span>
                <span className="text-amber-700 text-[10px]">{e.date}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold ${e.status === 'OVERDUE' ? 'text-red-400' : 'text-orange-400'}`}>
                  ${e.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onStatusChange?.(e.id, 'PAID')}
                  className="text-[10px] text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-400/60 px-1.5 py-0.5 rounded transition-all font-semibold"
                >
                  Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Month group divider with sparkline ────────────────────────────────────────
const MonthDivider = ({ label, items, colSpan, onQuickAdd }) => {
  const paid    = items.filter(e => e.status === 'PAID');
  const pending = items.filter(e => e.status === 'PENDING' || e.status === 'OVERDUE');
  const paidAmt = paid.reduce((s, e) => s + e.amount, 0);
  const pendAmt = pending.reduce((s, e) => s + e.amount, 0);
  const totalAmt = paidAmt + pendAmt;
  const paidPct = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;
  const pendPct = totalAmt > 0 ? (pendAmt / totalAmt) * 100 : 0;

  return (
    <tr className="sticky top-[41px] z-10">
      <td colSpan={colSpan} className="py-0">
        <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-900/90 backdrop-blur-sm border-b border-t border-white/10">
          <div className="flex-1 h-px bg-white/10" />

          {/* Label + counts */}
          <span className="text-purple-300 text-xs font-semibold whitespace-nowrap tracking-wide">{label}</span>
          <span className="text-purple-500 text-xs whitespace-nowrap">{items.length} expense{items.length !== 1 ? 's' : ''}</span>

          {/* Paid amount */}
          <span className="text-green-400 text-xs font-semibold whitespace-nowrap">${paidAmt.toFixed(2)}</span>

          {/* Sparkline bar — paid/pending split */}
          {totalAmt > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden flex">
                <div className="h-full bg-green-500/70 rounded-l-full transition-all"
                  style={{ width: `${paidPct}%` }} />
                {pendPct > 0 && (
                  <div className="h-full bg-orange-500/70 rounded-r-full transition-all"
                    style={{ width: `${pendPct}%` }} />
                )}
              </div>
              {pendAmt > 0 && (
                <span className="text-orange-400 text-[10px] font-medium whitespace-nowrap">+${pendAmt.toFixed(0)}</span>
              )}
            </div>
          )}

          <div className="flex-1 h-px bg-white/10" />

          {/* Quick-add button */}
          {onQuickAdd && (
            <button
              onClick={() => onQuickAdd(items[0]?.date)}
              className="text-purple-500 hover:text-purple-200 hover:bg-white/10 rounded p-0.5 transition-all"
              title={`Quick add for ${label}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ── Category legend (dots are clickable filter shortcuts) ─────────────────────
const CategoryLegend = ({ expenses, onCategoryFilter }) => {
  const cats = [...new Set(expenses.map(e => e.category))].sort();
  if (cats.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-2 pt-3 pb-1 border-t border-white/10">
      {cats.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryFilter?.(cat)}
          className="flex items-center gap-1.5 group hover:opacity-80 transition-opacity"
          title={`Filter by ${cat}`}
        >
          <span className="w-2 h-2 rounded-full shrink-0 ring-0 group-hover:ring-2 ring-white/30 transition-all"
            style={{ background: categoryColor(cat) }} />
          <span className="text-purple-400 group-hover:text-purple-200 text-xs transition-colors">{cat}</span>
        </button>
      ))}
      <span className="text-purple-600 text-xs self-center">· click to filter</span>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
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
  onBulkDelete,
  onBulkEdit,
  onSkipMonth,
  onStatusChange,
  onCategoryFilter,
  onQuickAdd,
  trips = [],
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
  const handleBulkEdit  = () => onBulkEdit?.(selectedIds);
  const handleExport    = (fmt) => {
    const src = allFilteredExpenses.length > 0 ? allFilteredExpenses : expenses;
    fmt === 'json' ? exportToJSON(src, 'filtered-expenses') : exportToCSV(src, 'filtered-expenses');
  };

  // ── Group by month ────────────────────────────────────────────────────────
  const groups = [];
  let lastKey = null;
  expenses.forEach(exp => {
    const d   = new Date(exp.date + 'T00:00:00Z');
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const lbl = d.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    if (key !== lastKey) { groups.push({ key, label: lbl, items: [] }); lastKey = key; }
    groups[groups.length - 1].items.push(exp);
  });

  // Row index tracker for zebra striping (resets per group)
  const COL = 8;

  return (
    <div className="relative">

      {/* ── Overdue / Pending banner ─────────────────────────────────────────── */}
      <OverdueBanner expenses={allFilteredExpenses.length > 0 ? allFilteredExpenses : expenses} onStatusChange={onStatusChange} />

      {/* ── Bulk action bar ──────────────────────────────────────────────────── */}
      {someSelected && (
        <div className="flex items-center justify-between bg-blue-500/15 border border-blue-500/35 rounded-lg px-4 py-2.5 mb-3 gap-3 flex-wrap">
          <span className="text-blue-300 text-sm font-semibold">{selectedIds.length} selected</span>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedIds([])}
              className="text-xs text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-400 px-3 py-1.5 rounded transition-colors">
              Clear
            </button>
            {onBulkEdit && (
              <button onClick={handleBulkEdit}
                className="flex items-center gap-1.5 text-xs bg-blue-500/25 hover:bg-blue-500/40 text-blue-200 border border-blue-500/40 px-3 py-1.5 rounded font-semibold transition-all">
                <Edit3 className="w-3.5 h-3.5" /> Edit {selectedIds.length}
              </button>
            )}
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-semibold transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.length}
            </button>
          </div>
        </div>
      )}

      {/* ── Export row ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-purple-400 text-xs">
          {allFilteredExpenses.length > 0
            ? `${allFilteredExpenses.length} filtered result${allFilteredExpenses.length !== 1 ? 's' : ''}`
            : `${expenses.length} on this page`}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-purple-500 text-xs">Export:</span>
          {['json', 'csv'].map(fmt => (
            <button key={fmt} onClick={() => handleExport(fmt)}
              className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/25 px-2.5 py-1.5 rounded transition-all uppercase">
              <Download className="w-3 h-3" /> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left min-w-max">
          <thead className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm">
            <tr className="border-b border-white/20">
              <th className="pb-2 pr-2 pl-2 w-8">
                <button onClick={toggleSelectAll}
                  className="text-purple-300 hover:text-white transition-colors"
                  title={allSelected ? 'Deselect all' : 'Select all on page'}>
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              {['Date', 'Category', 'Description', 'Amount', 'Via', 'Status', ''].map((h, i) => (
                <th key={i} className="pb-2 pr-4 text-purple-200 font-semibold whitespace-nowrap text-xs last:pr-2 last:w-8">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={COL} className="text-center py-12 text-purple-300">
                  {searchQuery
                    ? `No expenses found matching "${searchQuery}"`
                    : 'No expenses found. Add your first expense above!'}
                </td>
              </tr>
            ) : (
              groups.map(group => {
                let zebraIdx = 0;
                const groupPaid    = group.items.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
                const groupPending = group.items.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
                const groupTotal   = group.items.reduce((s, e) => s + e.amount, 0);
                return (
                  <React.Fragment key={group.key}>
                    <MonthDivider
                      label={group.label}
                      items={group.items}
                      colSpan={COL}
                      onQuickAdd={onQuickAdd}
                    />
                    {group.items.map(expense => {
                      const isZebra = zebraIdx++ % 2 === 1;
                      return (
                        <ExpenseRow
                          key={expense.id}
                          expense={expense}
                          editingExpense={editingExpense}
                          setEditingExpense={setEditingExpense}
                          saveEdit={saveEdit}
                          cancelEdit={cancelEdit}
                          deleteExpense={deleteExpense}
                          onStatusChange={onStatusChange}
                          onCategoryFilter={onCategoryFilter}
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
                          isZebra={isZebra}
                          trips={trips}
                        />
                      );
                    })}
                    {/* Monthly subtotal footer row */}
                    <tr className="border-b-2 border-white/20 bg-white/5 text-xs sticky bottom-0">
                      <td className="py-1.5 pl-2" />
                      <td colSpan={3} className="py-1.5 px-3 text-purple-400 font-semibold">
                        {group.label + ' — ' + group.items.length + ' expense' + (group.items.length !== 1 ? 's' : '')}
                      </td>
                      <td className="py-1.5 px-3 text-right whitespace-nowrap">
                        <span className="text-green-400 font-bold">${groupPaid.toFixed(2)}</span>
                        {groupPending > 0 && (
                          <span className="text-orange-400 font-semibold ml-2">{'+$' + groupPending.toFixed(2) + ' pending'}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-purple-300 text-right whitespace-nowrap font-bold">
                        {'$' + groupTotal.toFixed(2)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* Category legend */}
        {expenses.length > 0 && (
          <CategoryLegend expenses={expenses} onCategoryFilter={onCategoryFilter} />
        )}
      </div>
    </div>
  );
};

export default ExpenseTable;