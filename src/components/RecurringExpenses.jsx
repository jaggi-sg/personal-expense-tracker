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
  onDeleteCategory,
  paymentTypes,
  showNewPaymentTypeInput,
  setShowNewPaymentTypeInput,
  newPaymentTypeName,
  setNewPaymentTypeName,
  handleAddPaymentType,
  onDeletePaymentType,
  paidByOptions = [],
  onAddPaidBy,
  onDeletePaidBy,
  trips = [],
  onAddTrip,
  onDeleteTrip,
  availableYears,
  templates = [],
  onLoadTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  onSaveTemplate,
  onClearForm,
  onCloneExpense,
  onBulkEdit,
  onSkipMonth,
  onStatusChange,
}) => {
  const [searchCriteria, setSearchCriteria] = useState({});
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [selectedTrip, setSelectedTrip] = useState('');

  const onToggleExpanded = (id) =>
    setExpandedTransactions(prev => ({ ...prev, [id]: !prev[id] }));
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

  // Layer advanced criteria + trip filter on top
  const hasAdvanced = Object.entries(searchCriteria).some(([, v]) => v && v !== '' && v !== 'All');
  const advFiltered = hasAdvanced ? applyAdvancedFilters(filteredExpenses || [], searchCriteria) : (filteredExpenses || []);
  const finalFiltered = selectedTrip
    ? advFiltered.filter(e => e.trip === selectedTrip)
    : advFiltered;

  const itemsPerPage  = 10;
  const totalPages    = Math.ceil(finalFiltered.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const endIndex      = Math.min(startIndex + itemsPerPage, finalFiltered.length);
  const paginated     = finalFiltered.slice(startIndex, endIndex);

  const recurringList  = expenses.filter(e => e.type === 'Recurring');
  const recurringTotal = recurringList.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
  const filteredTotal  = finalFiltered.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);

  const handleClearAll   = () => { clearAllFilters(); setSearchCriteria({}); setSelectedTrip(''); };
  const handleBulkDelete = (ids) => ids.forEach(id => deleteExpense(id));
  const handleSavePreset = (name, criteria) => { addPreset(name, criteria); alert(`✅ Preset "${name}" saved!`); };
  const handleCategoryFilter = (cat) => toggleCategory(cat);
  const handleQuickAdd = (date) => {
    if (!date) return;
    const d = new Date(date + 'T00:00:00Z');
    setFormData(prev => ({
      ...prev,
      date,
      month: d.toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
    }));
    // Scroll to top so the add form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadPreset = (criteria) => {
    // Split preset criteria back into their respective state owners
    if (criteria.dateFrom)    setDateFrom(criteria.dateFrom);
    if (criteria.dateTo)      setDateTo(criteria.dateTo);
    if (criteria.quickSearch) setSearchQuery(criteria.quickSearch);
    if (criteria.categories)  {
      // clear existing, then toggle each saved category on
      clearAllFilters();
      criteria.categories.split(',').forEach(c => c.trim() && toggleCategory(c.trim()));
    }
    // Remaining keys go to advanced criteria
    const { dateFrom: _df, dateTo: _dt, categories: _cats, quickSearch: _qs, ...advanced } = criteria;
    setSearchCriteria(Object.keys(advanced).length ? advanced : {});
  };

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
        onDeleteCategory={onDeleteCategory}
        showNewPaymentTypeInput={showNewPaymentTypeInput}
        setShowNewPaymentTypeInput={setShowNewPaymentTypeInput}
        newPaymentTypeName={newPaymentTypeName}
        setNewPaymentTypeName={setNewPaymentTypeName}
        handleAddPaymentType={handleAddPaymentType}
        onDeletePaymentType={onDeletePaymentType}
        paidByOptions={paidByOptions}
        onAddPaidBy={onAddPaidBy}
        onDeletePaidBy={onDeletePaidBy}
        trips={trips}
        onAddTrip={onAddTrip}
        onDeleteTrip={onDeleteTrip}
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
          onLoadPreset={handleLoadPreset}
          onSavePreset={handleSavePreset}
          onDeletePreset={deletePreset}
          hasExpenses={recurringList.length > 0}
          onDeleteAll={() => deleteAllExpenses('Recurring')}
          filteredCount={finalFiltered.length}
          filteredExpenses={finalFiltered}
          trips={trips}
          selectedTrip={selectedTrip}
          setSelectedTrip={setSelectedTrip}
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
          expandedTransactions={expandedTransactions}
          onToggleExpanded={onToggleExpanded}
          onClone={onCloneExpense}
          onBulkDelete={handleBulkDelete}
          onBulkEdit={onBulkEdit}
          onSkipMonth={onSkipMonth}
          onStatusChange={onStatusChange}
          onCategoryFilter={handleCategoryFilter}
          onQuickAdd={handleQuickAdd}
          trips={trips}
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