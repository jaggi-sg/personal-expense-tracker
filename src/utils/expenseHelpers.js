export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getFilterDescription = (filterMonth, filterYear, filterCategory) => {
  const parts = [];

  if (filterMonth !== 'All' && filterYear !== 'All') {
    parts.push(`${filterMonth}-${filterYear}`);
  } else if (filterMonth !== 'All') {
    parts.push(`${filterMonth} Month`);
  }

  if (filterCategory !== 'All') {
    parts.push(filterCategory);
  }

  if (parts.length === 0) return 'All expenses';

  return parts.join(' ') + ' expenses';
};

export const calculateTotal = (expenses, filterFunc = null) => {
  const filtered = filterFunc ? expenses.filter(filterFunc) : expenses;
  return filtered.reduce((sum, exp) => sum + exp.amount, 0);
};

export const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

export const getExpensesByType = (expenses, type) => {
  return expenses.filter(exp => exp.type === type);
};

export const getPaidExpenses = (expenses) => {
  return expenses.filter(exp => exp.status === 'PAID');
};