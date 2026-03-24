// src/hooks/useExpenseFilters.js

import { useState, useEffect, useMemo } from 'react';
import { parseSmartSearch, applySmartSearch } from '../utils/smartSearch';

export const useExpenseFilters = (expenses, type) => {
  const [dateFrom, setDateFrom]                     = useState('');
  const [dateTo, setDateTo]                         = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery]               = useState('');
  const [sortBy, setSortBy]                         = useState('date-desc');
  const [currentPage, setCurrentPage]               = useState(1);
  const itemsPerPage = 10;

  const parsedSearch = useMemo(() => parseSmartSearch(searchQuery), [searchQuery]);

  const filteredExpenses = useMemo(() => {
    let list = expenses.filter(exp => exp.type === type);
    if (dateFrom) list = list.filter(e => new Date(e.date + 'T00:00:00Z') >= new Date(dateFrom + 'T00:00:00Z'));
    if (dateTo)   list = list.filter(e => new Date(e.date + 'T00:00:00Z') <= new Date(dateTo   + 'T00:00:00Z'));
    if (selectedCategories.length > 0) list = list.filter(e => selectedCategories.includes(e.category));
    if (parsedSearch) list = applySmartSearch(list, parsedSearch);
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':     return new Date(a.date) - new Date(b.date);
        case 'amount-desc':  return b.amount - a.amount;
        case 'amount-asc':   return a.amount - b.amount;
        case 'payment-desc': return (b.paymentType || '').localeCompare(a.paymentType || '');
        case 'payment-asc':  return (a.paymentType || '').localeCompare(b.paymentType || '');
        default:             return new Date(b.date) - new Date(a.date);
      }
    });
  }, [expenses, type, dateFrom, dateTo, selectedCategories, parsedSearch, sortBy]);

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
    setDateFrom(''); setDateTo(''); setSelectedCategories([]); setSearchQuery('');
  };

  const filterMonth    = 'All';
  const filterYear     = 'All';
  const filterCategory = selectedCategories.length === 1 ? selectedCategories[0] : 'All';

  return {
    dateFrom, setDateFrom, dateTo, setDateTo,
    selectedCategories, setSelectedCategories, toggleCategory,
    clearAllFilters,
    searchQuery, setSearchQuery, parsedSearch,
    sortBy, setSortBy,
    currentPage, setCurrentPage,
    filteredExpenses, paginatedExpenses,
    totalPages, startIndex, endIndex, itemsPerPage,
    filterMonth, filterYear, filterCategory,
    setFilterMonth: () => {}, setFilterYear: () => {}, setFilterCategory: () => {},
  };
};