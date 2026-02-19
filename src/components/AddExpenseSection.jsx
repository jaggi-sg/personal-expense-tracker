// src/components/AddExpenseSection.jsx

import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Save, FileText } from 'lucide-react';
import AddExpenseForm from './AddExpenseForm';
import TemplateQuickLoad from './TemplateQuickLoad';

const AddExpenseSection = ({
  title,
  formData,
  setFormData,
  categories,
  paymentTypes,
  showNewCategoryInput,
  setShowNewCategoryInput,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  showNewPaymentTypeInput,
  setShowNewPaymentTypeInput,
  newPaymentTypeName,
  setNewPaymentTypeName,
  handleAddPaymentType,
  handleAddExpense,
  showAmountField = true,
  amountRequired = false,
  amountDisabled = false,
  subTransactionComponent = null,
  // Template props
  templates = [],
  onLoadTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  onSaveTemplate,
  expenseType = 'Recurring'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if form has any data
  const hasFormData = formData.category || formData.description || formData.amount;

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-semibold transition-all ${
          hasFormData
            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
            : isExpanded
            ? 'bg-green-500 text-white'
            : 'bg-white/10 text-purple-200 hover:bg-white/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <Plus className="w-6 h-6" />
          <span className="text-lg">{title}</span>
          {hasFormData && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              Draft ready
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
          {/* Quick Template Actions */}
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Template Actions</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSaveTemplate}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
            </div>
          </div>

          {/* Quick Load Templates */}
          {templates && templates.length > 0 && onLoadTemplate && (
            <TemplateQuickLoad
              templates={templates}
              onLoadTemplate={onLoadTemplate}
              onDeleteTemplate={onDeleteTemplate}
              onToggleFavorite={onToggleFavorite}
              expenseType={expenseType}
            />
          )}

          {/* Main Expense Form */}
          <AddExpenseForm
            title="" // No title needed here since it's in the toggle button
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
            showAmountField={showAmountField}
            amountRequired={amountRequired}
            amountDisabled={amountDisabled}
            subTransactionComponent={subTransactionComponent}
          />
        </div>
      )}
    </div>
  );
};

export default AddExpenseSection;