// src/utils/advancedFilterUtils.js

/**
 * Apply advanced filters to expenses array
 * @param {Array} expenses - Array of expense objects
 * @param {Object} criteria - Search criteria object
 * @returns {Array} - Filtered expenses
 */
export const applyAdvancedFilters = (expenses, criteria) => {
  if (!expenses || expenses.length === 0) return [];
  if (!criteria || Object.keys(criteria).length === 0) return expenses;

  const hasActiveFilters = Object.entries(criteria).some(([key, value]) => {
    return value && value !== '' && value !== 'All';
  });

  if (!hasActiveFilters) return expenses;

  const filtered = expenses.filter(expense => {

    // Quick Search (searches description, category, amount, AND month)
    if (criteria.quickSearch && criteria.quickSearch !== '') {
      const searchTerm = criteria.quickSearch.toLowerCase();
      const matchesDescription = expense.description?.toLowerCase().includes(searchTerm);
      const matchesCategory = expense.category?.toLowerCase().includes(searchTerm);
      const matchesAmount = expense.amount?.toString().includes(searchTerm);
      const matchesMonth = expense.month?.toLowerCase().includes(searchTerm);

      if (!matchesDescription && !matchesCategory && !matchesAmount && !matchesMonth) {
        return false;
      }
    }

    // Dedicated Month Filter (used by "This Month" quick filter chip)
    if (criteria.month && criteria.month !== 'All' && criteria.month !== '') {
      if (expense.month?.toLowerCase() !== criteria.month.toLowerCase()) return false;
    }

    // Category Filter
    if (criteria.category && criteria.category !== 'All') {
      if (expense.category !== criteria.category) return false;
    }

    // Payment Type Filter
    if (criteria.paymentType && criteria.paymentType !== 'All') {
      if (expense.paymentType !== criteria.paymentType) return false;
    }

    // Status Filter
    if (criteria.status && criteria.status !== 'All') {
      if (expense.status !== criteria.status) return false;
    }

    // Amount Range Filter
    if (criteria.minAmount && criteria.minAmount !== '') {
      const minAmount = parseFloat(criteria.minAmount);
      if (!isNaN(minAmount) && expense.amount < minAmount) return false;
    }

    if (criteria.maxAmount && criteria.maxAmount !== '') {
      const maxAmount = parseFloat(criteria.maxAmount);
      if (!isNaN(maxAmount) && expense.amount > maxAmount) return false;
    }

    // Date Range Filter
    if (criteria.startDate && criteria.startDate !== '') {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(criteria.startDate);
      if (expenseDate < startDate) return false;
    }

    if (criteria.endDate && criteria.endDate !== '') {
      const expenseDate = new Date(expense.date);
      const endDate = new Date(criteria.endDate);
      if (expenseDate > endDate) return false;
    }

    // Paid By Filter
    if (criteria.paidBy && criteria.paidBy !== '') {
      const searchTerm = criteria.paidBy.toLowerCase();
      if (!expense.by?.toLowerCase().includes(searchTerm)) return false;
    }

    return true;
  });

  return filtered;
};

/**
 * Get count of active filters
 */
export const getActiveFilterCount = (criteria) => {
  if (!criteria) return 0;
  return Object.keys(criteria).filter(key => {
    const value = criteria[key];
    return value && value !== '' && value !== 'All';
  }).length;
};

/**
 * Clear all filters
 */
export const clearAllFilters = () => ({});

/**
 * Get filter summary text
 */
export const getFilterSummary = (criteria) => {
  const activeFilters = [];

  if (criteria.quickSearch) activeFilters.push(`Search: "${criteria.quickSearch}"`);
  if (criteria.month && criteria.month !== 'All') activeFilters.push(`Month: ${criteria.month}`);
  if (criteria.category && criteria.category !== 'All') activeFilters.push(`Category: ${criteria.category}`);
  if (criteria.status && criteria.status !== 'All') activeFilters.push(`Status: ${criteria.status}`);
  if (criteria.paymentType && criteria.paymentType !== 'All') activeFilters.push(`Payment: ${criteria.paymentType}`);
  if (criteria.minAmount || criteria.maxAmount) {
    const min = criteria.minAmount || '0';
    const max = criteria.maxAmount || '∞';
    activeFilters.push(`Amount: $${min} - $${max}`);
  }
  if (criteria.startDate || criteria.endDate) {
    const start = criteria.startDate || 'Any';
    const end = criteria.endDate || 'Any';
    activeFilters.push(`Date: ${start} to ${end}`);
  }
  if (criteria.paidBy) activeFilters.push(`Paid By: ${criteria.paidBy}`);

  return activeFilters.length > 0 ? activeFilters.join(' • ') : 'No active filters';
};