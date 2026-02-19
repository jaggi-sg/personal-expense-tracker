// src/components/RecurringExpenses.jsx - FIXED VERSION

import React, { useState } from 'react';
import { useExpenseFilters } from '../hooks/useExpenseFilters';
import ExpenseListControls from './ExpenseListControls';
import Pagination from './Pagination';
import ExpenseTable from './ExpenseTable';
import SummaryCards from './SummaryCards';
import AddExpenseSection from './AddExpenseSection';
import AdvancedFiltersSection from './AdvancedFiltersSection';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { applyAdvancedFilters } from '../utils/advancedFilterUtils';
import { months, getFilterDescription } from '../utils/expenseHelpers';

const RecurringExpenses = ({
  expenses,
  categories,
  formData,
  setFormData,
  handleAddExpense,
  deleteExpense,
  deleteAllExpenses,
  editingExpense,
  setEditingExpense,
  saveEdit,
  cancelEdit,
  showNewCategoryInput,
  setShowNewCategoryInput,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  paymentTypes,
  showNewPaymentTypeInput,
  setShowNewPaymentTypeInput,
  newPaymentTypeName,
  setNewPaymentTypeName,
  handleAddPaymentType,
  availableYears,
  templates = [],
  onLoadTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  onSaveTemplate,
  onCloneExpense
}) => {
  // ========================================
  // STATE - Must be at the top
  // ========================================
  const [searchCriteria, setSearchCriteria] = useState({});

  // Filter presets hook
  const { presets, addPreset, deletePreset, toggleFavorite } = useFilterPresets();

  // ========================================
  // EXISTING FILTERS (Month/Year/Category/Search)
  // ========================================
  const {
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    filteredExpenses,
    paginatedExpenses,
    totalPages,
    startIndex,
    endIndex
  } = useExpenseFilters(expenses, 'Recurring');

  // ========================================
  // APPLY ADVANCED FILTERS (if any exist)
  // ========================================

  // Check if there are any actual filter values
  const hasAdvancedFilters = Object.entries(searchCriteria).some(([key, value]) => {
    return value && value !== '' && value !== 'All';
  });

  console.log('=== RECURRING EXPENSES DEBUG ===');
  console.log('Total expenses:', expenses.length);
  console.log('After useExpenseFilters:', filteredExpenses.length);
  console.log('Has advanced filters:', hasAdvancedFilters);
  console.log('Search criteria:', searchCriteria);

  // Only apply advanced filters if they exist
  const finalFilteredExpenses = hasAdvancedFilters
    ? applyAdvancedFilters(filteredExpenses, searchCriteria)
    : filteredExpenses;

  console.log('After advanced filters:', finalFilteredExpenses.length);
  console.log('================================');

  // ========================================
  // PAGINATION for final filtered results
  // ========================================
  const itemsPerPage = 10;
  const finalTotalPages = Math.ceil(finalFilteredExpenses.length / itemsPerPage);
  const finalStartIndex = (currentPage - 1) * itemsPerPage;
  const finalEndIndex = Math.min(finalStartIndex + itemsPerPage, finalFilteredExpenses.length);
  const finalPaginatedExpenses = finalFilteredExpenses.slice(finalStartIndex, finalEndIndex);

  // ========================================
  // TOTALS
  // ========================================
  const recurringExpenses = expenses.filter(exp => exp.type === 'Recurring');
  const recurringTotal = recurringExpenses.filter(exp => exp.status === 'PAID').reduce((sum, exp) => sum + exp.amount, 0);
  const filteredTotal = finalFilteredExpenses.filter(exp => exp.status === 'PAID').reduce((sum, exp) => sum + exp.amount, 0);

  // ========================================
  // HANDLERS
  // ========================================
  const handleSavePreset = (name, criteria) => {
    addPreset(name, criteria);
    alert(`✅ Filter preset "${name}" saved!`);
  };

  const handleLoadPreset = (criteria) => {
    setSearchCriteria(criteria);
  };

  const handleQuickFilter = (criteria) => {
    setSearchCriteria({ ...searchCriteria, ...criteria });
  };

  const handleClearAll = () => {
    setSearchCriteria({});
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <>
      <SummaryCards
        totalAmount={recurringTotal}
        totalEntries={recurringExpenses.length}
        filteredTotal={filteredTotal}
        filterDescription={getFilterDescription(filterMonth, filterYear, filterCategory)}
        type="Recurring"
      />

      {/* ========================================
          ADD EXPENSE SECTION - ALL IN ONE PLACE
          ======================================== */}
      <AddExpenseSection
        title="Add Recurring Expense"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        paymentTypes={paymentTypes}
        showNewCategoryInput={showNewCategoryInput}
        setShowNewCategoryInput={setShowNewCategoryInput}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleAddCategory={handleAddCategory}
        showNewPaymentTypeInput={showNewPaymentTypeInput}
        setShowNewPaymentTypeInput={setShowNewPaymentTypeInput}
        newPaymentTypeName={newPaymentTypeName}
        setNewPaymentTypeName={setNewPaymentTypeName}
        handleAddPaymentType={handleAddPaymentType}
        handleAddExpense={handleAddExpense}
        showAmountField={true}
        amountRequired={true}
        amountDisabled={false}
        templates={templates}
        onLoadTemplate={onLoadTemplate}
        onDeleteTemplate={onDeleteTemplate}
        onToggleFavorite={onToggleFavorite}
        onSaveTemplate={onSaveTemplate}
        expenseType="Recurring"
      />

      {/* ========================================
          ADVANCED FILTERS SECTION
          ======================================== */}
      <AdvancedFiltersSection
        searchCriteria={searchCriteria}
        onSearchChange={setSearchCriteria}
        onClearAll={handleClearAll}
        categories={categories}
        paymentTypes={paymentTypes}
        presets={presets}
        onLoadPreset={handleLoadPreset}
        onSavePreset={handleSavePreset}
        onDeletePreset={deletePreset}
        onToggleFavorite={toggleFavorite}
        onQuickFilter={handleQuickFilter}
      />

      {/* ========================================
          EXPENSE LIST
          ======================================== */}

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Recurring Expense List</h2>

        {/* KEEP ExpenseListControls for basic filters */}
        <ExpenseListControls
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          availableYears={availableYears}
          categories={categories}
          months={months}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          hasExpenses={recurringExpenses.length > 0}
          onDeleteAll={() => deleteAllExpenses('Recurring')}
        />

        {/* Show message if advanced filters filtered everything out */}
        {finalFilteredExpenses.length === 0 && filteredExpenses.length > 0 && hasAdvancedFilters && (
          <div className="text-center py-8 bg-orange-500/10 rounded-lg border border-orange-500/30 mb-4">
            <p className="text-orange-300 font-semibold text-lg mb-2">
              No expenses match your advanced filters
            </p>
            <p className="text-orange-200 text-sm mb-3">
              {filteredExpenses.length} expenses available before advanced filtering
            </p>
            <button
              onClick={() => setSearchCriteria({})}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Clear Advanced Filters
            </button>
          </div>
        )}

        <ExpenseTable
          expenses={finalPaginatedExpenses}
          editingExpense={editingExpense}
          setEditingExpense={setEditingExpense}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          deleteExpense={deleteExpense}
          categories={categories}
          paymentTypes={paymentTypes}
          searchQuery={searchQuery}
          hasSubTransactions={false}
          onClone={onCloneExpense}
        />

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={finalTotalPages}
          startIndex={finalStartIndex}
          endIndex={finalEndIndex}
          totalItems={finalFilteredExpenses.length}
        />
      </div>
    </>
  );
};

export default RecurringExpenses;