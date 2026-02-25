// src/hooks/useExpenseFilters.js

import { useState, useEffect } from 'react';

export const useExpenseFilters = (expenses, type) => {
  const [dateFrom, setDateFrom]                     = useState('');
  const [dateTo, setDateTo]                         = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery]               = useState('');
  const [sortBy, setSortBy]                         = useState('date-desc');
  const [currentPage, setCurrentPage]               = useState(1);
  const itemsPerPage = 10;

  const filteredExpenses = expenses
    .filter(exp => exp.type === type)
    .filter(exp => {
      // Date range
      if (dateFrom && new Date(exp.date + 'T00:00:00Z') < new Date(dateFrom + 'T00:00:00Z')) return false;
      if (dateTo   && new Date(exp.date + 'T00:00:00Z') > new Date(dateTo   + 'T00:00:00Z')) return false;
      // Multi-select categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(exp.category)) return false;
      // Text search
      if (searchQuery && !exp.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':     return new Date(a.date) - new Date(b.date);
        case 'amount-desc':  return b.amount - a.amount;
        case 'amount-asc':   return a.amount - b.amount;
        case 'payment-desc': return (b.paymentType || '').localeCompare(a.paymentType || '');
        case 'payment-asc':  return (a.paymentType || '').localeCompare(b.paymentType || '');
        default:             return new Date(b.date) - new Date(a.date);
      }
    });

  const totalPages        = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex        = (currentPage - 1) * itemsPerPage;
  const endIndex          = Math.min(startIndex + itemsPerPage, filteredExpenses.length);
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [dateFrom, dateTo, selectedCategories, searchQuery, sortBy]);

  const toggleCategory = (cat) =>
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCategories([]);
    setSearchQuery('');
  };

  // ── Legacy aliases so existing callers (getFilterDescription, SummaryCards) still compile ──
  const filterMonth    = 'All';
  const filterYear     = 'All';
  const filterCategory = selectedCategories.length === 1 ? selectedCategories[0] : 'All';

  return {
    // New
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    selectedCategories, setSelectedCategories, toggleCategory,
    clearAllFilters,
    // Existing (unchanged shape)
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    currentPage, setCurrentPage,
    filteredExpenses,
    paginatedExpenses,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    // Legacy no-ops / aliases
    filterMonth, filterYear, filterCategory,
    setFilterMonth:    () => {},
    setFilterYear:     () => {},
    setFilterCategory: () => {},
  };
};