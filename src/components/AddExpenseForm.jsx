// src/components/AddExpenseForm.jsx - FIXED VERSION

import React from 'react';
import { Plus, Save } from 'lucide-react';

const AddExpenseForm = ({
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
  subTransactionComponent = null
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-white/10">
              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-20">Date *</td>
              <td className="py-3 pr-4 align-top" style={{width: '180px'}}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const date = new Date(e.target.value + 'T00:00:00Z');
                    setFormData({
                      ...formData,
                      date: e.target.value,
                      month: date.toLocaleString('default', { month: 'long', timeZone: 'UTC' })
                    });
                  }}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-24">Category *</td>
              <td className="py-3 pr-4 align-top" style={{width: '200px'}}>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowNewCategoryInput(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__add_new__">+ Add New</option>
                </select>
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-24">Description {!amountRequired && '*'}</td>
              <td className="py-3 align-top">
                <input
                  type="text"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
                  required={!amountRequired}
                />
              </td>
            </tr>

            {showNewCategoryInput && (
              <tr className="border-b border-white/10 bg-white/5">
                <td colSpan="6" className="py-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-purple-200 text-sm font-medium whitespace-nowrap">New Category:</span>
                    <input
                      type="text"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            <tr className="border-b border-white/10">
              {showAmountField && (
                <>
                  <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-20">Amount {amountRequired && '*'}</td>
                  <td className="py-3 pr-4 align-top" style={{width: '180px'}}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
                      disabled={amountDisabled}
                      required={amountRequired}
                    />
                  </td>
                </>
              )}

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-28">Payment Type</td>
              <td className="py-3 pr-4 align-top" style={{width: '200px'}}>
                <select
                  value={formData.paymentType}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowNewPaymentTypeInput(true);
                    } else {
                      setFormData({ ...formData, paymentType: e.target.value });
                    }
                  }}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Select Type</option>
                  {paymentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="__add_new__">+ Add New</option>
                </select>
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-20">Paid By</td>
              <td className="py-3 align-top">
                <input
                  type="text"
                  placeholder="e.g., J Wells Fargo"
                  value={formData.by}
                  onChange={(e) => setFormData({ ...formData, by: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
                />
              </td>
            </tr>

            {showNewPaymentTypeInput && (
              <tr className="border-b border-white/10 bg-white/5">
                <td colSpan="6" className="py-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-purple-200 text-sm font-medium whitespace-nowrap">New Payment Type:</span>
                    <input
                      type="text"
                      placeholder="Enter payment type"
                      value={newPaymentTypeName}
                      onChange={(e) => setNewPaymentTypeName(e.target.value)}
                      className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
                    />
                    <button
                      onClick={handleAddPaymentType}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPaymentTypeInput(false);
                        setNewPaymentTypeName('');
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            <tr>
              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-16">Status</td>
              <td className="py-3 pr-4 align-top" style={{width: '180px'}}>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </td>

              <td colSpan="4" className="py-3 align-top">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleAddExpense}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg px-6 py-2 transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </button>
                  </div>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sub-transaction section below the table - only render if component is provided */}
      {subTransactionComponent && (
        <div className="mt-4">
          {subTransactionComponent}
        </div>
      )}
    </div>
  );
};

export default AddExpenseForm;