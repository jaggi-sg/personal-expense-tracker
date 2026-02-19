import React, { useState } from 'react';
import { useExpenseFilters } from '../hooks/useExpenseFilters';
import ExpenseListControls from './ExpenseListControls';
import Pagination from './Pagination';
import ExpenseTable from './ExpenseTable';
import SummaryCards from './SummaryCards';
import AddExpenseForm from './AddExpenseForm';
import SubTransactionManager from './SubTransactionManager';
import TemplateManager from './TemplateManager';
import SaveTemplateModal from './SaveTemplateModal';
import CloneExpenseButton from './CloneExpenseButton';
import { months, getFilterDescription } from '../utils/expenseHelpers';
import { Save } from 'lucide-react';

const NonRecurringExpenses = ({
  expenses,
  nonRecurringCategories,
  formData,
  setFormData,
  handleAddExpense,
  deleteExpense,
  deleteAllExpenses,
  showNewCategoryInput,
  setShowNewCategoryInput,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  showSubTransactions,
  setShowSubTransactions,
  subTransactions,
  addSubTransaction,
  updateSubTransaction,
  removeSubTransaction,
  editingExpense,
  setEditingExpense,
  saveEdit,
  cancelEdit,
  paymentTypes,
  showNewPaymentTypeInput,
  setShowNewPaymentTypeInput,
  newPaymentTypeName,
  setNewPaymentTypeName,
  handleAddPaymentType,
  availableYears,
  templates,
    onLoadTemplate,
    onDeleteTemplate,
    onToggleFavorite,
    onSaveTemplate,
    showSaveTemplateModal,
    setShowSaveTemplateModal,
    onCloneExpense
}) => {
  const [expandedTransactions, setExpandedTransactions] = useState({});

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
  } = useExpenseFilters(expenses, 'Non-Recurring');

  const nonRecurringExpenses = expenses.filter(exp => exp.type === 'Non-Recurring');
  const nonRecurringTotal = nonRecurringExpenses.filter(exp => exp.status === 'PAID').reduce((sum, exp) => sum + exp.amount, 0);
  const filteredTotal = filteredExpenses.filter(exp => exp.status === 'PAID').reduce((sum, exp) => sum + exp.amount, 0);

  const toggleTransactions = (expenseId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [expenseId]: !prev[expenseId]
    }));
  };

  return (
    <>
      <SummaryCards
        totalAmount={nonRecurringTotal}
        totalEntries={nonRecurringExpenses.length}
        filteredTotal={filteredTotal}
        filterDescription={getFilterDescription(filterMonth, filterYear, filterCategory)}
        type="Non-Recurring"
      />

    <TemplateManager
      templates={templates}
      onLoadTemplate={onLoadTemplate}
      onDeleteTemplate={onDeleteTemplate}
      onToggleFavorite={onToggleFavorite}
      type="Non-Recurring"
    />

    {/* Save Template Button - OUTSIDE AddExpenseForm */}
          <div className="mb-4">
            <button
              onClick={onSaveTemplate}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <Save className="w-4 h-4" />
              Save Current Form as Template
            </button>
          </div>

      <AddExpenseForm
        title="Add Non-Recurring Expense"
        formData={formData}
        setFormData={setFormData}
        categories={nonRecurringCategories}
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
        amountDisabled={showSubTransactions}
        subTransactionComponent={
          <SubTransactionManager
            showSubTransactions={showSubTransactions}
            setShowSubTransactions={setShowSubTransactions}
            subTransactions={subTransactions}
            addSubTransaction={addSubTransaction}
            updateSubTransaction={updateSubTransaction}
            removeSubTransaction={removeSubTransaction}
            totalAmount={formData.amount}
          />
        }
      />

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Non-Recurring Expense List</h2>

        <ExpenseListControls
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          availableYears={availableYears}
          categories={nonRecurringCategories}
          months={months}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          hasExpenses={nonRecurringExpenses.length > 0}
          onDeleteAll={() => deleteAllExpenses('Non-Recurring')}
        />

        <ExpenseTable
          expenses={paginatedExpenses}
          editingExpense={editingExpense}
          setEditingExpense={setEditingExpense}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          deleteExpense={deleteExpense}
          categories={nonRecurringCategories}
          paymentTypes={paymentTypes}
          searchQuery={searchQuery}
          hasSubTransactions={true}
          expandedTransactions={expandedTransactions}
          onToggleExpanded={toggleTransactions}
          onClone={onCloneExpense}
        />

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredExpenses.length}
        />
        <SaveTemplateModal
          isOpen={showSaveTemplateModal}
          onClose={() => setShowSaveTemplateModal(false)}
          onSave={onSaveTemplate}
          currentFormData={formData}
        />
      </div>
    </>
  );
};

export default NonRecurringExpenses;