import { useState } from 'react';

export const useExpenseForm = (activeTab) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
    category: '',
    description: '',
    type: 'Recurring',
    amount: '',
    notes: '',
    by: '',
    status: 'PAID',
    paymentType: '',
    subCategory: ''
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewPaymentTypeInput, setShowNewPaymentTypeInput] = useState(false);
  const [newPaymentTypeName, setNewPaymentTypeName] = useState('');
  const [showSubTransactions, setShowSubTransactions] = useState(false);
  const [subTransactions, setSubTransactions] = useState([]);

  const resetForm = (type) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
      category: '',
      description: '',
      type: type,
      amount: '',
      notes: '',
      by: '',
      status: 'PAID',
      paymentType: '',
      subCategory: ''
    });
    setSubTransactions([]);
    setShowSubTransactions(false);
  };

  const addSubTransaction = () => {
    setSubTransactions([...subTransactions, {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: ''
    }]);
  };

  const updateSubTransaction = (index, field, value) => {
    const updated = [...subTransactions];
    updated[index][field] = value;
    setSubTransactions(updated);

    const total = updated.reduce((sum, st) => sum + (parseFloat(st.amount) || 0), 0);
    setFormData({ ...formData, amount: total.toFixed(2) });
  };

  const removeSubTransaction = (index) => {
    const updated = subTransactions.filter((_, i) => i !== index);
    setSubTransactions(updated);
    const total = updated.reduce((sum, st) => sum + (parseFloat(st.amount) || 0), 0);
    setFormData({ ...formData, amount: total.toFixed(2) });
  };

  return {
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
  };
};