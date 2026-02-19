import { useState } from 'react';

export const useExpenseActions = (
  expenses,
  saveExpenses,
  categories,
  nonRecurringCategories,
  saveCategories,
  saveNonRecurringCategories,
  paymentTypes,
  savePaymentTypes,
  activeTab
) => {
  const [editingExpense, setEditingExpense] = useState(null);

  const handleAddCategory = (newCategoryName, setNewCategoryName, setShowNewCategoryInput) => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    const targetCategories = activeTab === 'recurring' ? categories : nonRecurringCategories;
    if (targetCategories.includes(newCategoryName.trim())) {
      alert('Category already exists');
      return;
    }
    const updatedCategories = [...targetCategories, newCategoryName.trim()];
    if (activeTab === 'recurring') {
      saveCategories(updatedCategories);
    } else {
      saveNonRecurringCategories(updatedCategories);
    }
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const handleAddPaymentType = (newPaymentTypeName, setNewPaymentTypeName, setShowNewPaymentTypeInput) => {
    if (!newPaymentTypeName.trim()) {
      alert('Please enter a payment type name');
      return;
    }
    if (paymentTypes.includes(newPaymentTypeName.trim())) {
      alert('Payment type already exists');
      return;
    }
    const updatedTypes = [...paymentTypes, newPaymentTypeName.trim()];
    savePaymentTypes(updatedTypes);
    setNewPaymentTypeName('');
    setShowNewPaymentTypeInput(false);
  };

  const handleAddExpense = (formData, subTransactions, resetForm) => {
    if (!formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (activeTab === 'non-recurring' && !formData.amount) {
      alert('Please enter an amount');
      return;
    }

    const expenseType = activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring';

    const newExpense = {
      id: Date.now().toString(),
      ...formData,
      type: expenseType,
      amount: parseFloat(formData.amount) || 0,
      subTransactions: subTransactions.length > 0 ? subTransactions : undefined
    };
    saveExpenses([...expenses, newExpense]);
    resetForm(expenseType);
  };

  const deleteExpense = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (confirmed) {
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      saveExpenses(updatedExpenses);
      if (editingExpense && editingExpense.id === id) {
        setEditingExpense(null);
      }
    }
  };

  const saveEdit = () => {
    if (!editingExpense.category || !editingExpense.description || !editingExpense.amount) {
      alert('Please fill in all required fields');
      return;
    }
    const updatedExpenses = expenses.map(exp =>
      exp.id === editingExpense.id ? { ...editingExpense, amount: parseFloat(editingExpense.amount) } : exp
    );
    saveExpenses(updatedExpenses);
    setEditingExpense(null);
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  const deleteAllExpenses = (type) => {
    const expensesToDelete = expenses.filter(exp => exp.type === type);
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${type.toLowerCase()} expenses? This action cannot be undone!`);
    if (confirmed) {
      const doubleConfirm = window.confirm(`This will permanently delete ${expensesToDelete.length} ${type.toLowerCase()} expenses. Are you absolutely sure?`);
      if (doubleConfirm) {
        const updatedExpenses = expenses.filter(exp => exp.type !== type);
        saveExpenses(updatedExpenses);
      }
    }
  };

  return {
    editingExpense,
    setEditingExpense,
    handleAddCategory,
    handleAddPaymentType,
    handleAddExpense,
    deleteExpense,
    saveEdit,
    cancelEdit,
    deleteAllExpenses
  };
};