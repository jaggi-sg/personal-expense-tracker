// src/hooks/useExpenseData.js

import { useState, useEffect } from 'react';

export const useExpenseData = () => {
  const [expenses,                setExpenses]                = useState([]);
  const [loading,                 setLoading]                 = useState(true);
  const [categories,              setCategories]              = useState([
    'Mortgage', 'Internet', 'Electricity', 'Trash', 'HOA',
    'Water', 'Phone Bill', 'Subscription', 'Rent',
  ]);
  const [nonRecurringCategories,  setNonRecurringCategories]  = useState([
    'Handyman', 'Home Improvement', 'Gas', 'Costco', 'Amazon', 'Travel',
  ]);
  const [paymentTypes,            setPaymentTypes]            = useState(['Cash', 'Online', 'InStore']);
  const [paidByOptions,           setPaidByOptions]           = useState([
    'J VentureX', 'J Amex', 'J WellsFargo',
    'A Amex', 'A Venture',
  ]);
  const [trips,                   setTrips]                   = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('expenses-data');
      if (stored) setExpenses(JSON.parse(stored));

      const storedCats = localStorage.getItem('categories-data');
      if (storedCats) setCategories(JSON.parse(storedCats));

      const storedNonCats = localStorage.getItem('non-recurring-categories-data');
      if (storedNonCats) setNonRecurringCategories(JSON.parse(storedNonCats));

      const storedTypes = localStorage.getItem('payment-types-data');
      if (storedTypes) setPaymentTypes(JSON.parse(storedTypes));

      const storedPaidBy = localStorage.getItem('paid-by-options');
      if (storedPaidBy) setPaidByOptions(JSON.parse(storedPaidBy));

      const storedTrips = localStorage.getItem('trips-data');
      if (storedTrips) setTrips(JSON.parse(storedTrips));
    } catch (e) {
      console.log('No existing data found');
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = (v) => {
    try { localStorage.setItem('expenses-data', JSON.stringify(v)); setExpenses(v); }
    catch (e) { console.error(e); alert('Failed to save expenses.'); }
  };

  const saveCategories = (v) => {
    try { localStorage.setItem('categories-data', JSON.stringify(v)); setCategories(v); }
    catch (e) { console.error(e); }
  };

  const saveNonRecurringCategories = (v) => {
    try { localStorage.setItem('non-recurring-categories-data', JSON.stringify(v)); setNonRecurringCategories(v); }
    catch (e) { console.error(e); }
  };

  const savePaymentTypes = (v) => {
    try { localStorage.setItem('payment-types-data', JSON.stringify(v)); setPaymentTypes(v); }
    catch (e) { console.error(e); }
  };

  const savePaidByOptions = (v) => {
    try { localStorage.setItem('paid-by-options', JSON.stringify(v)); setPaidByOptions(v); }
    catch (e) { console.error(e); }
  };

  const saveTrips = (v) => {
    try { localStorage.setItem('trips-data', JSON.stringify(v)); setTrips(v); }
    catch (e) { console.error(e); }
  };

  return {
    expenses, loading,
    categories, nonRecurringCategories, paymentTypes, paidByOptions, trips,
    saveExpenses, saveCategories, saveNonRecurringCategories,
    savePaymentTypes, savePaidByOptions, saveTrips,
  };
};