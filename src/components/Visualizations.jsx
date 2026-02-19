import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Visualizations = ({
  expenses,
  filterYear,
  setFilterYear,
  availableYears
}) => {
  const mixedChartRef = useRef(null);
  const recurringDoughnutRef = useRef(null);
  const nonRecurringDoughnutRef = useRef(null);
  const mixedChartInstance = useRef(null);
  const recurringDoughnutInstance = useRef(null);
  const nonRecurringDoughnutInstance = useRef(null);

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#E7E9ED'
  ];

  useEffect(() => {
    // Destroy existing charts
    if (mixedChartInstance.current) {
      mixedChartInstance.current.destroy();
    }
    if (recurringDoughnutInstance.current) {
      recurringDoughnutInstance.current.destroy();
    }
    if (nonRecurringDoughnutInstance.current) {
      nonRecurringDoughnutInstance.current.destroy();
    }

    // Filter expenses by year
    const filteredExpenses = expenses.filter(exp => {
      const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
      return filterYear === 'All' || expYear === filterYear;
    });

    const recurringExpenses = filteredExpenses.filter(exp => exp.type === 'Recurring' && exp.status === 'PAID');
    const nonRecurringExpenses = filteredExpenses.filter(exp => exp.type === 'Non-Recurring' && exp.status === 'PAID');

    // Prepare monthly data
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyRecurring = months.map(month =>
      recurringExpenses.filter(exp => exp.month === month).reduce((sum, exp) => sum + exp.amount, 0)
    );
    const monthlyNonRecurring = months.map(month =>
      nonRecurringExpenses.filter(exp => exp.month === month).reduce((sum, exp) => sum + exp.amount, 0)
    );

    // Prepare category data for Recurring
    const recurringCategories = {};
    recurringExpenses.forEach(exp => {
      recurringCategories[exp.category] = (recurringCategories[exp.category] || 0) + exp.amount;
    });
    const recurringCategoryData = Object.entries(recurringCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Prepare category data for Non-Recurring
    const nonRecurringCategories = {};
    nonRecurringExpenses.forEach(exp => {
      nonRecurringCategories[exp.category] = (nonRecurringCategories[exp.category] || 0) + exp.amount;
    });
    const nonRecurringCategoryData = Object.entries(nonRecurringCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Mixed Chart
    if (mixedChartRef.current) {
      mixedChartInstance.current = new Chart(mixedChartRef.current, {
        type: 'bar',
        data: {
          labels: months.map(m => m.substring(0, 3)),
          datasets: [{
            type: 'line',
            label: 'Total Trend',
            data: monthlyRecurring.map((r, i) => r + monthlyNonRecurring[i]),
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: false,
            yAxisID: 'y'
          }, {
            type: 'bar',
            label: 'Recurring',
            data: monthlyRecurring,
            backgroundColor: '#667eea',
            yAxisID: 'y'
          }, {
            type: 'bar',
            label: 'Non-Recurring',
            data: monthlyNonRecurring,
            backgroundColor: '#f093fb',
            yAxisID: 'y'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#fff',
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                },
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              ticks: {
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });
    }

    // Recurring Doughnut Chart
    if (recurringDoughnutRef.current && recurringCategoryData.length > 0) {
      recurringDoughnutInstance.current = new Chart(recurringDoughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: recurringCategoryData.map(([category]) => category),
          datasets: [{
            data: recurringCategoryData.map(([, amount]) => amount),
            backgroundColor: colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return context.label + ': $' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
                }
              }
            }
          }
        }
      });
    }

    // Non-Recurring Doughnut Chart
    if (nonRecurringDoughnutRef.current && nonRecurringCategoryData.length > 0) {
      nonRecurringDoughnutInstance.current = new Chart(nonRecurringDoughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: nonRecurringCategoryData.map(([category]) => category),
          datasets: [{
            data: nonRecurringCategoryData.map(([, amount]) => amount),
            backgroundColor: colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return context.label + ': $' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (mixedChartInstance.current) mixedChartInstance.current.destroy();
      if (recurringDoughnutInstance.current) recurringDoughnutInstance.current.destroy();
      if (nonRecurringDoughnutInstance.current) nonRecurringDoughnutInstance.current.destroy();
    };
  }, [expenses, filterYear]);

  // Calculate totals and category data for tables
  const filteredExpenses = expenses.filter(exp => {
    const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
    return filterYear === 'All' || expYear === filterYear;
  });

  const recurringExpensesFiltered = filteredExpenses.filter(exp => exp.type === 'Recurring' && exp.status === 'PAID');
  const nonRecurringExpensesFiltered = filteredExpenses.filter(exp => exp.type === 'Non-Recurring' && exp.status === 'PAID');

  const recurringTotal = recurringExpensesFiltered.reduce((sum, exp) => sum + exp.amount, 0);
  const nonRecurringTotal = nonRecurringExpensesFiltered.reduce((sum, exp) => sum + exp.amount, 0);
  const grandTotal = recurringTotal + nonRecurringTotal;

  // Prepare category data for tables
  const recurringCategoriesData = {};
  recurringExpensesFiltered.forEach(exp => {
    recurringCategoriesData[exp.category] = (recurringCategoriesData[exp.category] || 0) + exp.amount;
  });
  const recurringCategoryTable = Object.entries(recurringCategoriesData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const nonRecurringCategoriesData = {};
  nonRecurringExpensesFiltered.forEach(exp => {
    nonRecurringCategoriesData[exp.category] = (nonRecurringCategoriesData[exp.category] || 0) + exp.amount;
  });
  const nonRecurringCategoryTable = Object.entries(nonRecurringCategoriesData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const recurringCategories = new Set(recurringExpensesFiltered.map(exp => exp.category)).size;
  const nonRecurringCategories = new Set(nonRecurringExpensesFiltered.map(exp => exp.category)).size;

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-white">Expense Visualizations</h2>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
          >
            <option value="All">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mixed Chart Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          🎯 Monthly Expense Trends
        </h2>
        <p className="text-purple-200 text-sm mb-6 text-center">
          Combined view showing monthly breakdown and total trend line
        </p>
        <div style={{ position: 'relative', height: '400px' }}>
          <canvas ref={mixedChartRef}></canvas>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-white">${recurringTotal.toFixed(2)}</div>
            <div className="text-sm text-purple-100 mt-1">Total Recurring</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-white">${nonRecurringTotal.toFixed(2)}</div>
            <div className="text-sm text-blue-100 mt-1">Total Non-Recurring</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-white">${grandTotal.toFixed(2)}</div>
            <div className="text-sm text-green-100 mt-1">Grand Total</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-white">{recurringCategories + nonRecurringCategories}</div>
            <div className="text-sm text-orange-100 mt-1">Total Categories</div>
          </div>
        </div>
      </div>

      {/* Doughnut Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Doughnut */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            🍩 Recurring Expenses Breakdown
          </h2>
          <p className="text-purple-200 text-sm mb-4 text-center">
            Distribution by category (Top 10)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ position: 'relative', height: '300px' }}>
              <canvas ref={recurringDoughnutRef}></canvas>
            </div>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/10">
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 px-2 text-purple-200 font-semibold"></th>
                    <th className="text-left py-2 px-2 text-purple-200 font-semibold">Category</th>
                    <th className="text-right py-2 px-2 text-purple-200 font-semibold">Amount</th>
                    <th className="text-right py-2 px-2 text-purple-200 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringCategoryTable.map(([category, amount], index) => {
                    const percentage = ((amount / recurringTotal) * 100).toFixed(1);
                    return (
                      <tr key={category} className="border-b border-white/10">
                        <td className="py-2 px-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                        </td>
                        <td className="py-2 px-2 text-white">{category}</td>
                        <td className="py-2 px-2 text-white text-right font-semibold">${amount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-purple-200 text-right">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center pt-4 border-t border-white/20">
            <div className="text-2xl font-bold text-white">${recurringTotal.toFixed(2)}</div>
            <div className="text-sm text-purple-200">Total Recurring</div>
          </div>
        </div>

        {/* Non-Recurring Doughnut */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            🍩 Non-Recurring Expenses Breakdown
          </h2>
          <p className="text-purple-200 text-sm mb-4 text-center">
            Distribution by category (Top 10)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ position: 'relative', height: '300px' }}>
              <canvas ref={nonRecurringDoughnutRef}></canvas>
            </div>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/10">
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 px-2 text-purple-200 font-semibold"></th>
                    <th className="text-left py-2 px-2 text-purple-200 font-semibold">Category</th>
                    <th className="text-right py-2 px-2 text-purple-200 font-semibold">Amount</th>
                    <th className="text-right py-2 px-2 text-purple-200 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {nonRecurringCategoryTable.map(([category, amount], index) => {
                    const percentage = ((amount / nonRecurringTotal) * 100).toFixed(1);
                    return (
                      <tr key={category} className="border-b border-white/10">
                        <td className="py-2 px-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                        </td>
                        <td className="py-2 px-2 text-white">{category}</td>
                        <td className="py-2 px-2 text-white text-right font-semibold">${amount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-purple-200 text-right">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center pt-4 border-t border-white/20">
            <div className="text-2xl font-bold text-white">${nonRecurringTotal.toFixed(2)}</div>
            <div className="text-sm text-purple-200">Total Non-Recurring</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;