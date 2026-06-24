// src/hooks/useExpenseActions.js

import { useState } from 'react';

export const useExpenseActions = (
  expenses, saveExpenses,
  categories, nonRecurringCategories,
  saveCategories, saveNonRecurringCategories,
  paymentTypes, savePaymentTypes,
  paidByOptions, savePaidByOptions,
  trips, saveTrips,
  activeTab,
) => {
  const [editingExpense, setEditingExpense] = useState(null);

  // ── Category ────────────────────────────────────────────────────────────────
  const handleAddCategory = (name, setName, setShow) => {
    if (!name.trim()) { alert('Please enter a category name'); return; }
    const list = activeTab === 'recurring' ? categories : nonRecurringCategories;
    if (list.includes(name.trim())) { alert('Category already exists'); return; }
    const updated = [...list, name.trim()];
    activeTab === 'recurring' ? saveCategories(updated) : saveNonRecurringCategories(updated);
    setName(''); setShow(false);
  };

  const handleDeleteCategory = (cat) => {
    const list    = activeTab === 'recurring' ? categories : nonRecurringCategories;
    const inUse   = expenses.some(e => e.category === cat && e.type === (activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring'));
    if (inUse) {
      if (!window.confirm(`"${cat}" is used by existing expenses. Delete it anyway?`)) return;
    } else {
      if (!window.confirm(`Delete category "${cat}"?`)) return;
    }
    const updated = list.filter(c => c !== cat);
    activeTab === 'recurring' ? saveCategories(updated) : saveNonRecurringCategories(updated);
  };

  // ── Payment type ─────────────────────────────────────────────────────────────
  const handleAddPaymentType = (name, setName, setShow) => {
    if (!name.trim()) { alert('Please enter a payment type name'); return; }
    if (paymentTypes.includes(name.trim())) { alert('Payment type already exists'); return; }
    savePaymentTypes([...paymentTypes, name.trim()]);
    setName(''); setShow(false);
  };

  // ── Paid By ──────────────────────────────────────────────────────────────────
  const handleAddPaidBy = (name) => {
    if (!name.trim()) return false;
    if (paidByOptions.includes(name.trim())) { alert('Already exists'); return false; }
    savePaidByOptions([...paidByOptions, name.trim()]);
    return true;
  };

  const handleDeletePaidBy = (name) => {
    if (!window.confirm(`Delete "${name}" from Paid By options?`)) return;
    savePaidByOptions(paidByOptions.filter(p => p !== name));
  };

  // ── Expenses ─────────────────────────────────────────────────────────────────
  const handleAddExpense = (formData, subTransactions, resetForm) => {
    if (!formData.category || !formData.description) {
      alert('Please fill in all required fields'); return;
    }
    if (activeTab === 'non-recurring' && !formData.amount) {
      alert('Please enter an amount'); return;
    }

    // ── Duplicate detection ───────────────────────────────────────────────────
    const newAmount = parseFloat(formData.amount) || 0;
    const newDesc   = (formData.description || '').toLowerCase().trim();
    const newDate   = new Date((formData.date || new Date().toISOString().split('T')[0]) + 'T00:00:00Z');
    const sevenDaysAgo = new Date(newDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const duplicate = expenses.find(e => {
      if (Math.abs(e.amount - newAmount) > 0.01) return false;
      if ((e.description || '').toLowerCase().trim() !== newDesc) return false;
      const eDate = new Date(e.date + 'T00:00:00Z');
      return eDate >= sevenDaysAgo && eDate <= newDate;
    });

    if (duplicate) {
      const dupDate = duplicate.date;
      const confirmed = window.confirm(
        'Possible duplicate detected!\n\n' +
        '"' + duplicate.description + '" for $' + duplicate.amount.toFixed(2) +
        ' was already added on ' + dupDate + '.\n\n' +
        'Add anyway?'
      );
      if (!confirmed) return;
    }

    const type = activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring';
    saveExpenses([...expenses, {
      id: Date.now().toString(),
      ...formData,
      type,
      amount: newAmount,
      subTransactions: subTransactions.length > 0 ? subTransactions : undefined,
    }]);
    resetForm(type);
  };

  const deleteExpense = (id) => {
    if (!window.confirm('Delete this expense?')) return;
    saveExpenses(expenses.filter(e => e.id !== id));
    if (editingExpense?.id === id) setEditingExpense(null);
  };

  const saveEdit = () => {
    if (!editingExpense.category || !editingExpense.description || !editingExpense.amount) {
      alert('Please fill in all required fields'); return;
    }
    saveExpenses(expenses.map(e =>
      e.id === editingExpense.id
        ? { ...editingExpense, amount: parseFloat(editingExpense.amount) }
        : e
    ));
    setEditingExpense(null);
  };

  const cancelEdit = () => setEditingExpense(null);

  const deleteAllExpenses = (type) => {
    const count = expenses.filter(e => e.type === type).length;
    if (!window.confirm(`Delete ALL ${type.toLowerCase()} expenses?`)) return;
    if (!window.confirm(`This will permanently delete ${count} expenses. Are you absolutely sure?`)) return;
    saveExpenses(expenses.filter(e => e.type !== type));
  };

  // ── Trips ─────────────────────────────────────────────────────────────────────
  const handleAddTrip = (name) => {
    if (!name.trim()) return false;
    if (trips.includes(name.trim())) { alert('Trip already exists'); return false; }
    saveTrips([...trips, name.trim()].sort());
    return true;
  };

  const handleDeleteTrip = (name) => {
    if (!window.confirm(`Delete trip "${name}"? Expenses tagged with it will keep the tag but the trip won't appear in the list.`)) return;
    saveTrips(trips.filter(t => t !== name));
  };

  return {
    editingExpense, setEditingExpense,
    handleAddCategory, handleDeleteCategory,
    handleAddPaymentType,
    handleAddPaidBy, handleDeletePaidBy,
    handleAddTrip, handleDeleteTrip,
    handleAddExpense,
    deleteExpense, saveEdit, cancelEdit, deleteAllExpenses,
  };
};