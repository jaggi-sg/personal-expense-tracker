import React, { useState } from 'react';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import Summary from './components/Summary';
import RecurringExpenses from './components/RecurringExpenses';
import NonRecurringExpenses from './components/NonRecurringExpenses';
import Visualizations from './components/Visualizations';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import BackupReminder from './components/BackupReminder';
import SaveTemplateModal from './components/SaveTemplateModal';
import { useExpenseTemplates } from './hooks/useExpenseTemplates';
import { useExpenseData } from './hooks/useExpenseData';
import { useExpenseForm } from './hooks/useExpenseForm';
import { useExpenseActions } from './hooks/useExpenseActions';
import { useBackupReminder } from './hooks/useBackupReminder';
import { useAutoRecurringExpenses } from './hooks/useAutoRecurringExpenses';
import { exportToJSON, exportToCSV, importFromJSON, importFromCSV } from './utils/dataExport';
import { getAvailableYears, getCategorySummary, getYearlyTotal, getPendingAndOverdueExpenses } from './utils/summaryCalculations';

const App = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filterYear, setFilterYear] = useState('All');

  // Data management
  const {
    expenses,
    loading,
    categories,
    nonRecurringCategories,
    paymentTypes,
    saveExpenses,
    saveCategories,
    saveNonRecurringCategories,
    savePaymentTypes
  } = useExpenseData();

  // ─── Separate form state per tab ───────────────────────────────────────────
  const {
    formData: recurringFormData,
    setFormData: setRecurringFormData,
    showNewCategoryInput: recurringShowNewCategoryInput,
    setShowNewCategoryInput: recurringSetShowNewCategoryInput,
    newCategoryName: recurringNewCategoryName,
    setNewCategoryName: recurringSetNewCategoryName,
    showNewPaymentTypeInput: recurringShowNewPaymentTypeInput,
    setShowNewPaymentTypeInput: recurringSetShowNewPaymentTypeInput,
    newPaymentTypeName: recurringNewPaymentTypeName,
    setNewPaymentTypeName: recurringSetNewPaymentTypeName,
    showSubTransactions: recurringShowSubTransactions,
    setShowSubTransactions: recurringSetShowSubTransactions,
    subTransactions: recurringSubTransactions,
    resetForm: resetRecurringForm,
    addSubTransaction: recurringAddSubTransaction,
    updateSubTransaction: recurringUpdateSubTransaction,
    removeSubTransaction: recurringRemoveSubTransaction,
  } = useExpenseForm('recurring');

  const {
    formData: nonRecurringFormData,
    setFormData: setNonRecurringFormData,
    showNewCategoryInput: nonRecurringShowNewCategoryInput,
    setShowNewCategoryInput: nonRecurringSetShowNewCategoryInput,
    newCategoryName: nonRecurringNewCategoryName,
    setNewCategoryName: nonRecurringSetNewCategoryName,
    showNewPaymentTypeInput: nonRecurringShowNewPaymentTypeInput,
    setShowNewPaymentTypeInput: nonRecurringSetShowNewPaymentTypeInput,
    newPaymentTypeName: nonRecurringNewPaymentTypeName,
    setNewPaymentTypeName: nonRecurringSetNewPaymentTypeName,
    showSubTransactions: nonRecurringShowSubTransactions,
    setShowSubTransactions: nonRecurringSetShowSubTransactions,
    subTransactions: nonRecurringSubTransactions,
    resetForm: resetNonRecurringForm,
    addSubTransaction: nonRecurringAddSubTransaction,
    updateSubTransaction: nonRecurringUpdateSubTransaction,
    removeSubTransaction: nonRecurringRemoveSubTransaction,
  } = useExpenseForm('non-recurring');
  // ───────────────────────────────────────────────────────────────────────────

  // Expense actions
  const {
    editingExpense,
    setEditingExpense,
    handleAddCategory,
    handleAddPaymentType,
    handleAddExpense,
    deleteExpense,
    saveEdit,
    cancelEdit,
    deleteAllExpenses
  } = useExpenseActions(
    expenses,
    saveExpenses,
    categories,
    nonRecurringCategories,
    saveCategories,
    saveNonRecurringCategories,
    paymentTypes,
    savePaymentTypes,
    activeTab
  );

  // Backup reminder
  const {
    showBackupReminder,
    handleBackupNow,
    dismissBackupReminder
  } = useBackupReminder(
    () => exportToJSON(expenses),
    () => exportToCSV(expenses)
  );

  // Template management
  const {
    templates,
    addTemplate,
    deleteTemplate,
    toggleFavorite
  } = useExpenseTemplates();

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Which tab's formData is currently being used for saving a template
  const activeFormData = activeTab === 'recurring' ? recurringFormData : nonRecurringFormData;

  const handleSaveAsTemplate = (templateName) => {
    if (!activeFormData.category || !activeFormData.description) {
      alert('Please fill in at least category and description before saving template');
      return;
    }
    const templateData = {
      ...activeFormData,
      type: activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring'
    };
    try {
      addTemplate(templateData, templateName);
      alert(`✅ Template "${templateName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleLoadTemplate = (template) => {
    const loaded = {
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
      category: template.category,
      description: template.description,
      amount: template.amount.toString(),
      paymentType: template.paymentType,
      by: template.by,
      status: template.status,
      type: template.type
    };
    if (activeTab === 'recurring') {
      setRecurringFormData(loaded);
    } else {
      setNonRecurringFormData(loaded);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      deleteTemplate(templateId);
    }
  };

  const handleCloneExpense = (expense) => {
    const clonedExpense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' })
    };
    saveExpenses([...expenses, clonedExpense]);
    alert('✅ Expense cloned successfully with today\'s date!');
  };

  // Auto-generate recurring expenses
  useAutoRecurringExpenses(expenses, categories, saveExpenses);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const availableYears = getAvailableYears(expenses);
  const notifications = getPendingAndOverdueExpenses(expenses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {showBackupReminder && (
          <BackupReminder
            onBackupNow={handleBackupNow}
            onDismiss={dismissBackupReminder}
          />
        )}

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
        />

        {activeTab === 'summary' && (
          <Summary
            expenses={expenses}
            categories={categories}
            nonRecurringCategories={nonRecurringCategories}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            availableYears={availableYears}
            getCategorySummary={(type) => getCategorySummary(expenses, type === 'Recurring' ? categories : nonRecurringCategories, filterYear, type)}
            getYearlyTotal={(type) => getYearlyTotal(expenses, filterYear, type)}
            getPendingAndOverdueExpenses={() => getPendingAndOverdueExpenses(expenses)}
            exportToJSON={() => exportToJSON(expenses)}
            exportToCSV={() => exportToCSV(expenses)}
            importFromJSON={(e) => importFromJSON(e, expenses, saveExpenses)}
            importFromCSV={(e) => importFromCSV(e, expenses, saveExpenses)}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringExpenses
            expenses={expenses}
            categories={categories}
            formData={recurringFormData}
            setFormData={setRecurringFormData}
            handleAddExpense={() => handleAddExpense(recurringFormData, recurringSubTransactions, resetRecurringForm)}
            deleteExpense={deleteExpense}
            deleteAllExpenses={deleteAllExpenses}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            showNewCategoryInput={recurringShowNewCategoryInput}
            setShowNewCategoryInput={recurringSetShowNewCategoryInput}
            newCategoryName={recurringNewCategoryName}
            setNewCategoryName={recurringSetNewCategoryName}
            handleAddCategory={() => handleAddCategory(recurringNewCategoryName, recurringSetNewCategoryName, recurringSetShowNewCategoryInput)}
            paymentTypes={paymentTypes}
            showNewPaymentTypeInput={recurringShowNewPaymentTypeInput}
            setShowNewPaymentTypeInput={recurringSetShowNewPaymentTypeInput}
            newPaymentTypeName={recurringNewPaymentTypeName}
            setNewPaymentTypeName={recurringSetNewPaymentTypeName}
            handleAddPaymentType={() => handleAddPaymentType(recurringNewPaymentTypeName, recurringSetNewPaymentTypeName, recurringSetShowNewPaymentTypeInput)}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={() => setShowSaveTemplateModal(true)}
            onClearForm={() => resetRecurringForm('Recurring')}
            onCloneExpense={handleCloneExpense}
          />
        )}

        {activeTab === 'non-recurring' && (
          <NonRecurringExpenses
            expenses={expenses}
            nonRecurringCategories={nonRecurringCategories}
            formData={nonRecurringFormData}
            setFormData={setNonRecurringFormData}
            handleAddExpense={() => handleAddExpense(nonRecurringFormData, nonRecurringSubTransactions, resetNonRecurringForm)}
            deleteExpense={deleteExpense}
            deleteAllExpenses={deleteAllExpenses}
            showNewCategoryInput={nonRecurringShowNewCategoryInput}
            setShowNewCategoryInput={nonRecurringSetShowNewCategoryInput}
            newCategoryName={nonRecurringNewCategoryName}
            setNewCategoryName={nonRecurringSetNewCategoryName}
            handleAddCategory={() => handleAddCategory(nonRecurringNewCategoryName, nonRecurringSetNewCategoryName, nonRecurringSetShowNewCategoryInput)}
            showSubTransactions={nonRecurringShowSubTransactions}
            setShowSubTransactions={nonRecurringSetShowSubTransactions}
            subTransactions={nonRecurringSubTransactions}
            addSubTransaction={nonRecurringAddSubTransaction}
            updateSubTransaction={nonRecurringUpdateSubTransaction}
            removeSubTransaction={nonRecurringRemoveSubTransaction}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            paymentTypes={paymentTypes}
            showNewPaymentTypeInput={nonRecurringShowNewPaymentTypeInput}
            setShowNewPaymentTypeInput={nonRecurringSetShowNewPaymentTypeInput}
            newPaymentTypeName={nonRecurringNewPaymentTypeName}
            setNewPaymentTypeName={nonRecurringSetNewPaymentTypeName}
            handleAddPaymentType={() => handleAddPaymentType(nonRecurringNewPaymentTypeName, nonRecurringSetNewPaymentTypeName, nonRecurringSetShowNewPaymentTypeInput)}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={() => setShowSaveTemplateModal(true)}
            onClearForm={() => resetNonRecurringForm('Non-Recurring')}
            onCloneExpense={handleCloneExpense}
          />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics
            expenses={expenses}
            categories={categories}
            nonRecurringCategories={nonRecurringCategories}
          />
        )}

        {activeTab === 'visualizations' && (
          <Visualizations
            expenses={expenses}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            availableYears={availableYears}
          />
        )}

        <SaveTemplateModal
          isOpen={showSaveTemplateModal}
          onClose={() => setShowSaveTemplateModal(false)}
          onSave={handleSaveAsTemplate}
          currentFormData={activeFormData}
        />
      </div>
    </div>
  );
};

export default App;