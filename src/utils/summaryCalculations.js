export const getAvailableYears = (expenses) => {
  const years = new Set();
  expenses.forEach(exp => {
    const year = new Date(exp.date + 'T00:00:00Z').getUTCFullYear();
    years.add(year);
  });
  return Array.from(years).sort((a, b) => b - a);
};

export const getCategorySummary = (expenses, categories, filterYear, type) => {
  const summary = {};
  categories.forEach(cat => {
    summary[cat] = expenses
      .filter(exp => {
        const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
        const yearMatch = filterYear === 'All' || expYear === filterYear;
        return exp.category === cat && yearMatch && exp.type === type && exp.status === 'PAID';
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  });
  return summary;
};

export const getYearlyTotal = (expenses, filterYear, type) => {
  return expenses
    .filter(exp => {
      const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
      const yearMatch = filterYear === 'All' || expYear === filterYear;
      return exp.type === type && yearMatch && exp.status === 'PAID';
    })
    .reduce((sum, exp) => sum + exp.amount, 0);
};

export const getPendingAndOverdueExpenses = (expenses) => {
  const today = new Date();
  const currentMonth = today.getUTCMonth();
  const currentYear = today.getUTCFullYear();

  return expenses
    .filter(exp => (exp.status === 'PENDING' || exp.status === 'OVERDUE'))
    .map(exp => {
      const expenseDate = new Date(exp.date + 'T00:00:00Z');
      const expenseMonth = expenseDate.getUTCMonth();
      const expenseYear = expenseDate.getUTCFullYear();
      const isCurrentMonth = expenseMonth === currentMonth && expenseYear === currentYear;

      const daysDiff = Math.floor((today - expenseDate) / (1000 * 60 * 60 * 24));

      return {
        ...exp,
        isCurrentMonth,
        daysDiff,
        monthYear: `${exp.month}-${expenseYear}`
      };
    });
};