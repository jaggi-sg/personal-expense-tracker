// src/App.jsx

import React, { useState, useRef, useCallback } from 'react';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import Summary from './components/Summary';
import RecurringExpenses from './components/RecurringExpenses';
import NonRecurringExpenses from './components/NonRecurringExpenses';
import Visualizations from './components/Visualizations';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import BackupReminder from './components/BackupReminder';
import SaveTemplateModal from './components/SaveTemplateModal';
import ImportPreviewModal from './components/ImportPreviewModal';
import BulkEditModal from './components/BulkEditModal';
import SkipMonthModal from './components/SkipMonthModal';
import CategoryDrillDownModal from './components/CategoryDrillDownModal';
import QRScanModal from './components/QRScanModal';
import { useTheme } from './hooks/useTheme';
import { useExpenseTemplates } from './hooks/useExpenseTemplates';
import { useExpenseData } from './hooks/useExpenseData';
import { useExpenseForm } from './hooks/useExpenseForm';
import { useExpenseActions } from './hooks/useExpenseActions';
import { useBackupReminder } from './hooks/useBackupReminder';
import { useAutoRecurringExpenses } from './hooks/useAutoRecurringExpenses';
import { useReceiptSync } from './hooks/useReceiptSync';
import {
  exportToJSON, exportToCSV,
  exportFullBackup,
  parseImportFile, computeImportDiff,
  importFromJSON, importFromCSV,
} from './utils/dataExport';
import { getAvailableYears, getCategorySummary, getYearlyTotal, getPendingAndOverdueExpenses } from './utils/summaryCalculations';

const App = () => {
  const [activeTab,   setActiveTab]   = useState('summary');
  const [filterYear,  setFilterYear]  = useState('All');
  const [showQR,      setShowQR]      = useState(false);

  // ── Theme ────────────────────────────────────────────────────────────────────
  const { isDark, toggleTheme } = useTheme();

  // ── Category drill-down ──────────────────────────────────────────────────────
  const [drillCategory, setDrillCategory] = useState(null);
  const [drillYear,     setDrillYear]     = useState('All');
  const [showDrillDown, setShowDrillDown] = useState(false);

  const handleCategoryClick = (category, year = 'All') => {
    setDrillCategory(category);
    setDrillYear(year);
    setShowDrillDown(true);
  };

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    expenses, loading,
    categories, nonRecurringCategories, paymentTypes, paidByOptions, trips,
    saveExpenses, saveCategories, saveNonRecurringCategories,
    savePaymentTypes, savePaidByOptions, saveTrips,
  } = useExpenseData();

  // ── Forms (separate state per tab) ──────────────────────────────────────────
  const {
    formData: recurringFormData, setFormData: setRecurringFormData,
    showNewCategoryInput: recurringShowNewCategoryInput, setShowNewCategoryInput: recurringSetShowNewCategoryInput,
    newCategoryName: recurringNewCategoryName, setNewCategoryName: recurringSetNewCategoryName,
    showNewPaymentTypeInput: recurringShowNewPaymentTypeInput, setShowNewPaymentTypeInput: recurringSetShowNewPaymentTypeInput,
    newPaymentTypeName: recurringNewPaymentTypeName, setNewPaymentTypeName: recurringSetNewPaymentTypeName,
    showSubTransactions: recurringShowSubTransactions, setShowSubTransactions: recurringSetShowSubTransactions,
    subTransactions: recurringSubTransactions,
    resetForm: resetRecurringForm,
    addSubTransaction: recurringAddSubTransaction,
    updateSubTransaction: recurringUpdateSubTransaction,
    removeSubTransaction: recurringRemoveSubTransaction,
  } = useExpenseForm('recurring');

  const {
    formData: nonRecurringFormData, setFormData: setNonRecurringFormData,
    showNewCategoryInput: nonRecurringShowNewCategoryInput, setShowNewCategoryInput: nonRecurringSetShowNewCategoryInput,
    newCategoryName: nonRecurringNewCategoryName, setNewCategoryName: nonRecurringSetNewCategoryName,
    showNewPaymentTypeInput: nonRecurringShowNewPaymentTypeInput, setShowNewPaymentTypeInput: nonRecurringSetShowNewPaymentTypeInput,
    newPaymentTypeName: nonRecurringNewPaymentTypeName, setNewPaymentTypeName: nonRecurringSetNewPaymentTypeName,
    showSubTransactions: nonRecurringShowSubTransactions, setShowSubTransactions: nonRecurringSetShowSubTransactions,
    subTransactions: nonRecurringSubTransactions,
    resetForm: resetNonRecurringForm,
    addSubTransaction: nonRecurringAddSubTransaction,
    updateSubTransaction: nonRecurringUpdateSubTransaction,
    removeSubTransaction: nonRecurringRemoveSubTransaction,
  } = useExpenseForm('non-recurring');

  const activeFormData = activeTab === 'recurring' ? recurringFormData : nonRecurringFormData;

  // ── Receipt sync from mobile scanner ─────────────────────────────────────────
  // ── Receipt sync from mobile scanner ─────────────────────────────────────────
  const [receiptSyncToast, setReceiptSyncToast] = useState(false);

  const handleReceiptSync = useCallback((data) => {
    console.log('[App] handleReceiptSync called with:', data);
    setNonRecurringFormData(prev => ({ ...prev, ...data }));
    setActiveTab('non-recurring');
    setReceiptSyncToast(true);
    setTimeout(() => setReceiptSyncToast(false), 4000);
  }, [setNonRecurringFormData, setActiveTab]);

  useReceiptSync(handleReceiptSync);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const {
    editingExpense, setEditingExpense,
    handleAddCategory, handleDeleteCategory,
    handleAddPaymentType,
    handleAddPaidBy, handleDeletePaidBy,
    handleAddTrip, handleDeleteTrip,
    handleAddExpense, deleteExpense, saveEdit, cancelEdit, deleteAllExpenses,
  } = useExpenseActions(
    expenses, saveExpenses,
    categories, nonRecurringCategories,
    saveCategories, saveNonRecurringCategories,
    paymentTypes, savePaymentTypes,
    paidByOptions, savePaidByOptions,
    trips, saveTrips,
    activeTab,
  );

  // ── Backup reminder ──────────────────────────────────────────────────────────
  const { showBackupReminder, handleBackupNow, dismissBackupReminder } = useBackupReminder(
    () => exportToJSON(expenses),
    () => exportToCSV(expenses),
  );

  // ── Templates ────────────────────────────────────────────────────────────────
  const { templates, addTemplate, deleteTemplate, toggleFavorite } = useExpenseTemplates();
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  const handleSaveAsTemplate = (templateName) => {
    if (!activeFormData.category || !activeFormData.description) {
      alert('Please fill in at least category and description before saving template');
      return;
    }
    addTemplate({ ...activeFormData, type: activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring' }, templateName);
    alert(`✅ Template "${templateName}" saved successfully!`);
  };

  const handleLoadTemplate = (template) => {
    const loaded = {
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
      category: template.category, description: template.description,
      amount: template.amount.toString(), paymentType: template.paymentType,
      by: template.by, status: template.status, type: template.type,
    };
    activeTab === 'recurring' ? setRecurringFormData(loaded) : setNonRecurringFormData(loaded);
  };

  const handleDeleteTemplate = (templateId) => {
    const t = templates.find(t => t.id === templateId);
    if (window.confirm(`Delete template "${t?.name}"?`)) deleteTemplate(templateId);
  };

  const handleCloneExpense = (expense) => {
    saveExpenses([...expenses, {
      ...expense,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
    }]);
    alert('✅ Expense cloned with today\'s date!');
  };

  // ── Inline status change ─────────────────────────────────────────────────────
  const handleStatusChange = (id, newStatus) => {
    saveExpenses(expenses.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  // ── Bulk edit ────────────────────────────────────────────────────────────────
  const [bulkEditIds,       setBulkEditIds]       = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const handleOpenBulkEdit = (ids) => {
    setBulkEditIds(ids);
    setShowBulkEditModal(true);
  };

  const handleApplyBulkEdit = (ids, changes) => {
    const updated = expenses.map(e =>
      ids.includes(e.id) ? { ...e, ...changes } : e
    );
    saveExpenses(updated);
    alert(`✅ Updated ${ids.length} expense${ids.length !== 1 ? 's' : ''}`);
  };

  // ── Skip month ────────────────────────────────────────────────────────────────
  const [skipTarget,        setSkipTarget]        = useState(null);
  const [showSkipModal,     setShowSkipModal]     = useState(false);

  const handleOpenSkipMonth = (expense) => {
    setSkipTarget(expense);
    setShowSkipModal(true);
  };

  const handleConfirmSkip = ({ expense, month, year, reason }) => {
    // Add a SKIPPED marker expense — same data, status = 'SKIPPED', description annotated
    const skipped = {
      ...expense,
      id:          `${expense.id}-skip-${month}-${year}`,
      date:        `${year}-${String(['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month) + 1).padStart(2,'0')}-01`,
      month,
      status:      'SKIPPED',
      description: `${expense.description} [SKIPPED${reason ? ': ' + reason : ''}]`,
      amount:      0,
    };
    saveExpenses([...expenses, skipped]);
    alert(`✅ ${expense.description} marked as skipped for ${month} ${year}`);
  };

  // ── Import preview ────────────────────────────────────────────────────────────
  const [importDiff,         setImportDiff]         = useState(null);
  const [importMeta,         setImportMeta]         = useState(null);
  const [showImportPreview,  setShowImportPreview]  = useState(false);
  const importFileRef = useRef(null);

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = await parseImportFile(file);
      const diff   = computeImportDiff(parsed.expenses, expenses);
      setImportMeta(parsed);
      setImportDiff(diff);
      setShowImportPreview(true);
    } catch (err) {
      alert('Error reading file: ' + err.message);
    }
    e.target.value = '';
  };

  const handleConfirmImport = ({ expenses: toImport, mergeCategories, mergePaymentTypes, newCats, newNonCats, newPay }) => {
    // Merge expenses — updates replace existing by ID, new ones are appended
    const existingIds = new Set(expenses.map(e => e.id));
    const updates     = toImport.filter(e => existingIds.has(e.id));
    const brandNew    = toImport.filter(e => !existingIds.has(e.id));
    const merged      = expenses.map(e => {
      const upd = updates.find(u => u.id === e.id);
      return upd ? { ...e, ...upd } : e;
    });
    saveExpenses([...merged, ...brandNew]);

    // Merge lookup lists if requested
    if (mergeCategories) {
      if (newCats.length)    saveCategories([...categories, ...newCats]);
      if (newNonCats.length) saveNonRecurringCategories([...nonRecurringCategories, ...newNonCats]);
    }
    if (mergePaymentTypes && newPay.length) {
      savePaymentTypes([...paymentTypes, ...newPay]);
    }

    setShowImportPreview(false);
    alert(`✅ Imported ${toImport.length} expense${toImport.length !== 1 ? 's' : ''} successfully!`);
  };

  // ── Full backup export ────────────────────────────────────────────────────────
  const handleFullBackupExport = () => {
    exportFullBackup({ expenses, categories, nonRecurringCategories, paymentTypes });
  };

  // ── Auto-generate recurring ──────────────────────────────────────────────────
  useAutoRecurringExpenses(expenses, categories, saveExpenses);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  const availableYears  = getAvailableYears(expenses);
  const notifications   = getPendingAndOverdueExpenses(expenses);

  // Shared extra props for both expense tabs
  const sharedTableProps = {
    onBulkEdit:     handleOpenBulkEdit,
    onSkipMonth:    handleOpenSkipMonth,
    onStatusChange: handleStatusChange,
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-violet-100 to-purple-100'}`}>
      <div className="max-w-7xl mx-auto">
        <Header isDark={isDark} toggleTheme={toggleTheme} onOpenQR={() => setShowQR(true)} />

        {showBackupReminder && (
          <BackupReminder onBackupNow={handleBackupNow} onDismiss={dismissBackupReminder} />
        )}

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} />

        {/* ── Summary ─────────────────────────────────────────────────────── */}
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
            exportFullBackup={handleFullBackupExport}
            onImportClick={() => importFileRef.current?.click()}
            importFromJSON={(e) => importFromJSON(e, expenses, saveExpenses)}
            importFromCSV={(e) => importFromCSV(e, expenses, saveExpenses)}
          />
        )}

        {/* ── Recurring ───────────────────────────────────────────────────── */}
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
            onDeleteCategory={handleDeleteCategory}
            paymentTypes={paymentTypes}
            showNewPaymentTypeInput={recurringShowNewPaymentTypeInput}
            setShowNewPaymentTypeInput={recurringSetShowNewPaymentTypeInput}
            newPaymentTypeName={recurringNewPaymentTypeName}
            setNewPaymentTypeName={recurringSetNewPaymentTypeName}
            handleAddPaymentType={() => handleAddPaymentType(recurringNewPaymentTypeName, recurringSetNewPaymentTypeName, recurringSetShowNewPaymentTypeInput)}
            onDeletePaymentType={(t) => savePaymentTypes(paymentTypes.filter(p => p !== t))}
            paidByOptions={paidByOptions}
            onAddPaidBy={handleAddPaidBy}
            onDeletePaidBy={handleDeletePaidBy}
            trips={trips}
            onAddTrip={handleAddTrip}
            onDeleteTrip={handleDeleteTrip}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={() => setShowSaveTemplateModal(true)}
            onClearForm={() => resetRecurringForm('Recurring')}
            onCloneExpense={handleCloneExpense}
            {...sharedTableProps}
          />
        )}


        {/* ── Non-Recurring ───────────────────────────────────────────────────── */}
        {activeTab === 'non-recurring' && (
          <NonRecurringExpenses
            expenses={expenses}
            nonRecurringCategories={nonRecurringCategories}
            formData={nonRecurringFormData}
            setFormData={setNonRecurringFormData}
            handleAddExpense={() => handleAddExpense(nonRecurringFormData, nonRecurringSubTransactions, resetNonRecurringForm)}
            onScanAddExpense={(data) => {
              const expense = {
                id: Date.now().toString(),
                type: 'Non-Recurring',
                description: data.description || '',
                amount: parseFloat(data.amount) || 0,
                date: data.date || new Date().toISOString().split('T')[0],
                month: data.month || '',
                category: data.category || '',
                paymentType: data.paymentType || '',
                by: data.by || '',
                note: data.note || '',
                status: data.status || 'PAID',
              };
              saveExpenses([...expenses, expense]);
            }}
            deleteExpense={deleteExpense}
            deleteAllExpenses={deleteAllExpenses}
            showNewCategoryInput={nonRecurringShowNewCategoryInput}
            setShowNewCategoryInput={nonRecurringSetShowNewCategoryInput}
            newCategoryName={nonRecurringNewCategoryName}
            setNewCategoryName={nonRecurringSetNewCategoryName}
            handleAddCategory={() => handleAddCategory(nonRecurringNewCategoryName, nonRecurringSetNewCategoryName, nonRecurringSetShowNewCategoryInput)}
            onDeleteCategory={handleDeleteCategory}
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
            onDeletePaymentType={(t) => savePaymentTypes(paymentTypes.filter(p => p !== t))}
            paidByOptions={paidByOptions}
            onAddPaidBy={handleAddPaidBy}
            onDeletePaidBy={handleDeletePaidBy}
            trips={trips}
            onAddTrip={handleAddTrip}
            onDeleteTrip={handleDeleteTrip}
            availableYears={availableYears}
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
            onSaveTemplate={() => setShowSaveTemplateModal(true)}
            onClearForm={() => resetNonRecurringForm('Non-Recurring')}
            onCloneExpense={handleCloneExpense}
            {...sharedTableProps}
          />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics expenses={expenses} categories={categories} nonRecurringCategories={nonRecurringCategories} onCategoryClick={handleCategoryClick} />
        )}

        {activeTab === 'visualizations' && (
          <Visualizations expenses={expenses} filterYear={filterYear} setFilterYear={setFilterYear} availableYears={availableYears} onCategoryClick={handleCategoryClick} />
        )}

        {/* ── Modals ──────────────────────────────────────────────────────── */}
        <SaveTemplateModal
          isOpen={showSaveTemplateModal}
          onClose={() => setShowSaveTemplateModal(false)}
          onSave={handleSaveAsTemplate}
          currentFormData={activeFormData}
        />

        <BulkEditModal
          isOpen={showBulkEditModal}
          onClose={() => setShowBulkEditModal(false)}
          selectedIds={bulkEditIds}
          expenses={expenses}
          categories={categories}
          nonRecurringCategories={nonRecurringCategories}
          paymentTypes={paymentTypes}
          onApply={handleApplyBulkEdit}
        />

        <SkipMonthModal
          isOpen={showSkipModal}
          onClose={() => setShowSkipModal(false)}
          expense={skipTarget}
          onConfirmSkip={handleConfirmSkip}
        />

        <ImportPreviewModal
          isOpen={showImportPreview}
          onClose={() => setShowImportPreview(false)}
          diff={importDiff}
          importMeta={importMeta}
          existingCategories={categories}
          existingNonRecurringCategories={nonRecurringCategories}
          existingPaymentTypes={paymentTypes}
          onConfirm={handleConfirmImport}
        />

        {/* Hidden file input for preview-based import */}
        <input
          ref={importFileRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={handleImportFileChange}
        />

        <CategoryDrillDownModal
          isOpen={showDrillDown}
          onClose={() => setShowDrillDown(false)}
          category={drillCategory}
          expenses={expenses}
          filterYear={drillYear}
        />

        {/* QR code modal for mobile scanning */}
        {showQR && <QRScanModal onClose={() => setShowQR(false)} />}

        {/* Receipt sync toast notification */}
        {receiptSyncToast && (
          <div className="fixed bottom-6 left-1/2 z-50 pointer-events-none"
            style={{ transform: 'translateX(-50%)' }}>
            <div className="bg-emerald-500 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
              <span>Receipt synced from phone</span>
              <span>Check the Non-Recurring form</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;