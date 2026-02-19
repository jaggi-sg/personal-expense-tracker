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
import { useAutoRecurringExpenses } from './hooks/useAutoRecurringExpenses'; // Add this
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

  // Form management
  const {
    formData,
    setFormData,
    showNewCategoryInput,
    setShowNewCategoryInput,
    newCategoryName,
    setNewCategoryName,
    showNewPaymentTypeInput,
    setShowNewPaymentTypeInput,
    newPaymentTypeName,
    setNewPaymentTypeName,
    showSubTransactions,
    setShowSubTransactions,
    subTransactions,
    resetForm,
    addSubTransaction,
    updateSubTransaction,
    removeSubTransaction
  } = useExpenseForm(activeTab);

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

const handleSaveAsTemplate = (templateName) => {
console.log('handleSaveAsTemplate called with:', templateName);
  console.log('Type of templateName:', typeof templateName);
  if (!formData.category || !formData.description) {
    alert('Please fill in at least category and description before saving template');
    return;
  }

  const templateData = {
    ...formData,
    type: activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring'
  };
  console.log('Template data to save:', templateData);

  try {
      addTemplate(templateData, templateName);
      alert(`✅ Template "${templateName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
};

const handleLoadTemplate = (template) => {
  setFormData({
    date: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
    category: template.category,
    description: template.description,
    amount: template.amount.toString(),
    paymentType: template.paymentType,
    by: template.by,
    status: template.status,
    type: template.type
  });
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
  // Auto-generate recurring expenses (Add this)
  useAutoRecurringExpenses(expenses, categories, saveExpenses);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Computed values - AFTER loading check
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
            formData={formData}
            setFormData={setFormData}
            handleAddExpense={() => handleAddExpense(formData, subTransactions, resetForm)}
            deleteExpense={deleteExpense}
            deleteAllExpenses={deleteAllExpenses}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            showNewCategoryInput={showNewCategoryInput}
            setShowNewCategoryInput={setShowNewCategoryInput}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            handleAddCategory={() => handleAddCategory(newCategoryName, setNewCategoryName, setShowNewCategoryInput)}
            paymentTypes={paymentTypes}
            showNewPaymentTypeInput={showNewPaymentTypeInput}
            setShowNewPaymentTypeInput={setShowNewPaymentTypeInput}
            newPaymentTypeName={newPaymentTypeName}
            setNewPaymentTypeName={setNewPaymentTypeName}
            handleAddPaymentType={() => handleAddPaymentType(newPaymentTypeName, setNewPaymentTypeName, setShowNewPaymentTypeInput)}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={()=> setShowSaveTemplateModal(true)}
            showSaveTemplateModal={showSaveTemplateModal}
            setShowSaveTemplateModal={setShowSaveTemplateModal}
            onCloneExpense={handleCloneExpense}
          />
        )}

        {activeTab === 'non-recurring' && (
          <NonRecurringExpenses
            expenses={expenses}
            nonRecurringCategories={nonRecurringCategories}
            formData={formData}
            setFormData={setFormData}
            handleAddExpense={() => handleAddExpense(formData, subTransactions, resetForm)}
            deleteExpense={deleteExpense}
            deleteAllExpenses={deleteAllExpenses}
            showNewCategoryInput={showNewCategoryInput}
            setShowNewCategoryInput={setShowNewCategoryInput}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            handleAddCategory={() => handleAddCategory(newCategoryName, setNewCategoryName, setShowNewCategoryInput)}
            showSubTransactions={showSubTransactions}
            setShowSubTransactions={setShowSubTransactions}
            subTransactions={subTransactions}
            addSubTransaction={addSubTransaction}
            updateSubTransaction={updateSubTransaction}
            removeSubTransaction={removeSubTransaction}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            paymentTypes={paymentTypes}
            showNewPaymentTypeInput={showNewPaymentTypeInput}
            setShowNewPaymentTypeInput={setShowNewPaymentTypeInput}
            newPaymentTypeName={newPaymentTypeName}
            setNewPaymentTypeName={setNewPaymentTypeName}
            handleAddPaymentType={() => handleAddPaymentType(newPaymentTypeName, setNewPaymentTypeName, setShowNewPaymentTypeInput)}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={()=> setShowSaveTemplateModal(true)}
            showSaveTemplateModal={showSaveTemplateModal}
            setShowSaveTemplateModal={setShowSaveTemplateModal}
            onCloneExpense={handleCloneExpense}
          />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics
            expenses={expenses}  // ← Must be here
            categories={categories}  // ← Must be here
            nonRecurringCategories={nonRecurringCategories}  // ← Must be here
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
          onSave={handleSaveAsTemplate}  // ← Should pass handleSaveAsTemplate, not something else
          currentFormData={formData}
        />
      </div>
    </div>
  );
};

export default App;