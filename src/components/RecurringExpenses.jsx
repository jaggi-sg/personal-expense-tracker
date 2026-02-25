// src/components/RecurringExpenses.jsx

import React, { useState } from 'react';
import { useExpenseFilters } from '../hooks/useExpenseFilters';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { applyAdvancedFilters } from '../utils/advancedFilterUtils';
import { getFilterDescription } from '../utils/expenseHelpers';
import ExpenseListControls from './ExpenseListControls';
import Pagination from './Pagination';
import ExpenseTable from './ExpenseTable';
import SummaryCards from './SummaryCards';
import AddExpenseSection from './AddExpenseSection';

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
  onClearForm,
  onCloneExpense,
}) => {
  const [searchCriteria, setSearchCriteria] = useState({});
  const { presets, addPreset, deletePreset, toggleFavorite } = useFilterPresets();

  const {
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    selectedCategories, toggleCategory, clearAllFilters,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    currentPage, setCurrentPage,
    filteredExpenses,
    filterMonth, filterYear, filterCategory,
  } = useExpenseFilters(expenses, 'Recurring');

  // Layer advanced criteria on top
  const hasAdvanced = Object.entries(searchCriteria).some(([, v]) => v && v !== '' && v !== 'All');
  const finalFiltered = hasAdvanced ? applyAdvancedFilters(filteredExpenses, searchCriteria) : filteredExpenses;

  const itemsPerPage  = 10;
  const totalPages    = Math.ceil(finalFiltered.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const endIndex      = Math.min(startIndex + itemsPerPage, finalFiltered.length);
  const paginated     = finalFiltered.slice(startIndex, endIndex);

  const recurringList  = expenses.filter(e => e.type === 'Recurring');
  const recurringTotal = recurringList.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
  const filteredTotal  = finalFiltered.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);

  const handleClearAll   = () => { clearAllFilters(); setSearchCriteria({}); };
  const handleBulkDelete = (ids) => ids.forEach(id => deleteExpense(id));
  const handleSavePreset = (name, criteria) => { addPreset(name, criteria); alert(`✅ Preset "${name}" saved!`); };

  return (
    <>
      <SummaryCards
        totalAmount={recurringTotal}
        totalEntries={recurringList.length}
        filteredTotal={filteredTotal}
        filterDescription={getFilterDescription(filterMonth, filterYear, filterCategory)}
        type="Recurring"
        expenses={expenses}
      />

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
        onClearForm={onClearForm}
        expenseType="Recurring"
      />

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Recurring Expense List</h2>

        <ExpenseListControls
          dateFrom={dateFrom}             setDateFrom={setDateFrom}
          dateTo={dateTo}                 setDateTo={setDateTo}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          clearAllFilters={handleClearAll}
          categories={categories}
          paymentTypes={paymentTypes}
          searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
          sortBy={sortBy}                 setSortBy={setSortBy}
          searchCriteria={searchCriteria} onSearchChange={setSearchCriteria}
          presets={presets}
          onLoadPreset={(c) => setSearchCriteria(c)}
          onSavePreset={handleSavePreset}
          onDeletePreset={deletePreset}
          hasExpenses={recurringList.length > 0}
          onDeleteAll={() => deleteAllExpenses('Recurring')}
          filteredCount={finalFiltered.length}
        />

        {finalFiltered.length === 0 && filteredExpenses.length > 0 && hasAdvanced && (
          <div className="text-center py-8 bg-orange-500/10 rounded-lg border border-orange-500/30 mb-4">
            <p className="text-orange-300 font-semibold mb-2">No expenses match your filters</p>
            <button onClick={handleClearAll} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm">
              Clear Filters
            </button>
          </div>
        )}

        <ExpenseTable
          expenses={paginated}
          allFilteredExpenses={finalFiltered}
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
          onBulkDelete={handleBulkDelete}
        />

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={finalFiltered.length}
        />
      </div>
    </>
  );
};

export default RecurringExpenses;