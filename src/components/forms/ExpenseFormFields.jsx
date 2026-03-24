import React from 'react';
import { Check, X } from 'lucide-react';

const ExpenseFormFields = ({
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
  showAmountField = true,
  amountRequired = false,
  amountDisabled = false
}) => {
  return (
    <>
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
        className="bg-white/20 border-2 border-orange-400 rounded-lg px-4 py-2 text-white"
        required
      />

      <select
        value={formData.category}
        onChange={(e) => {
          if (e.target.value === '__add_new__') {
            setShowNewCategoryInput(true);
          } else {
            setFormData({ ...formData, category: e.target.value });
          }
        }}
        className="bg-white/20 border-2 border-orange-400 rounded-lg px-4 py-2 text-white"
        required
      >
        <option value="">Select Category *</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
        <option value="__add_new__">+ Add New Category</option>
      </select>

      {showNewCategoryInput && (
        <div className="col-span-full flex gap-2">
          <input
            type="text"
            placeholder="Enter new category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-purple-200"
          />
          <button
            onClick={handleAddCategory}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={() => {
              setShowNewCategoryInput(false);
              setNewCategoryName('');
            }}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder={amountRequired ? "Description *" : "Description"}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className={`bg-white/20 ${amountRequired ? 'border-2 border-orange-400' : 'border border-white/30'} rounded-lg px-4 py-2 text-white placeholder-purple-200`}
        required={!amountRequired}
      />

      {showAmountField && (
        <input
          type="number"
          step="0.01"
          placeholder={amountRequired ? "Amount *" : "Amount"}
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className={`bg-white/20 ${amountRequired ? 'border-2 border-orange-400' : 'border border-white/30'} rounded-lg px-4 py-2 text-white placeholder-purple-200`}
          disabled={amountDisabled}
          required={amountRequired}
        />
      )}

      <select
        value={formData.paymentType}
        onChange={(e) => {
          if (e.target.value === '__add_new__') {
            setShowNewPaymentTypeInput(true);
          } else {
            setFormData({ ...formData, paymentType: e.target.value });
          }
        }}
        className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
      >
        <option value="">Payment Type</option>
        {paymentTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
        <option value="__add_new__">+ Add New Payment Type</option>
      </select>

      {showNewPaymentTypeInput && (
        <div className="col-span-full flex gap-2">
          <input
            type="text"
            placeholder="Enter new payment type name"
            value={newPaymentTypeName}
            onChange={(e) => setNewPaymentTypeName(e.target.value)}
            className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-purple-200"
          />
          <button
            onClick={handleAddPaymentType}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={() => {
              setShowNewPaymentTypeInput(false);
              setNewPaymentTypeName('');
            }}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Paid By (e.g., J Wells Fargo)"
        value={formData.by}
        onChange={(e) => setFormData({ ...formData, by: e.target.value })}
        className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-purple-200"
      />

      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
      >
        <option value="PAID">PAID</option>
        <option value="PENDING">PENDING</option>
        <option value="OVERDUE">OVERDUE</option>
      </select>
    </>
  );
};

export default ExpenseFormFields;