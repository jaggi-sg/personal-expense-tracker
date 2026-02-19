import { useState, useEffect } from 'react';

export const useExpenseFilters = (expenses, type) => {
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(exp => exp.type === type)
    .filter(exp => {
      const monthMatch = filterMonth === 'All' || exp.month === filterMonth;
      const yearMatch = filterYear === 'All' || new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString() === filterYear;
      const categoryMatch = filterCategory === 'All' || exp.category === filterCategory;
      const searchMatch = searchQuery === '' || exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return monthMatch && yearMatch && categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'payment-desc':
          return (b.paymentType || '').localeCompare(a.paymentType || '');
        case 'payment-asc':
          return (a.paymentType || '').localeCompare(b.paymentType || '');
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterYear, filterCategory, searchQuery, sortBy]);

  return {
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    filteredExpenses,
    paginatedExpenses,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage
  };
};