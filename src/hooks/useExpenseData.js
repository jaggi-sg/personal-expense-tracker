import { useState, useEffect } from 'react';

export const useExpenseData = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    'Mortgage', 'Internet', 'Electricity', 'Trash', 'HOA',
    'Water', 'Phone Bill', 'Subscription', 'Rent'
  ]);
  const [nonRecurringCategories, setNonRecurringCategories] = useState([
    'Handyman', 'Home Improvement', 'Gas', 'Costco', 'Amazon'
  ]);
  const [paymentTypes, setPaymentTypes] = useState(['Cash', 'Online', 'InStore']);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    try {
      const stored = localStorage.getItem('expenses-data');
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
      const storedCategories = localStorage.getItem('categories-data');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
      const storedNonRecurringCategories = localStorage.getItem('non-recurring-categories-data');
      if (storedNonRecurringCategories) {
        setNonRecurringCategories(JSON.parse(storedNonRecurringCategories));
      }
      const storedPaymentTypes = localStorage.getItem('payment-types-data');
      if (storedPaymentTypes) {
        setPaymentTypes(JSON.parse(storedPaymentTypes));
      }
    } catch (error) {
      console.log('No existing data found');
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = (newExpenses) => {
    try {
      localStorage.setItem('expenses-data', JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Failed to save expenses:', error);
      alert('Failed to save expenses. Please try again.');
    }
  };

  const saveCategories = (newCategories) => {
    try {
      localStorage.setItem('categories-data', JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  };

  const saveNonRecurringCategories = (newCategories) => {
    try {
      localStorage.setItem('non-recurring-categories-data', JSON.stringify(newCategories));
      setNonRecurringCategories(newCategories);
    } catch (error) {
      console.error('Failed to save non-recurring categories:', error);
    }
  };

  const savePaymentTypes = (newTypes) => {
    try {
      localStorage.setItem('payment-types-data', JSON.stringify(newTypes));
      setPaymentTypes(newTypes);
    } catch (error) {
      console.error('Failed to save payment types:', error);
    }
  };

  return {
    expenses,
    loading,
    categories,
    nonRecurringCategories,
    paymentTypes,
    saveExpenses,
    saveCategories,
    saveNonRecurringCategories,
    savePaymentTypes
  };
};