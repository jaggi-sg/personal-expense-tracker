import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, PieChart, Target, Activity } from 'lucide-react';

const AdvancedAnalytics = ({ expenses = [], categories = [], nonRecurringCategories = [] }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [analysisType, setAnalysisType] = useState('recurring'); // 'recurring' or 'non-recurring'

  // Debug logging
  console.log('AdvancedAnalytics - Total expenses:', expenses.length);
  console.log('AdvancedAnalytics - Categories:', categories.length);
  console.log('AdvancedAnalytics - Analysis Type:', analysisType);

  // Early return if no data
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">📊 Advanced Analytics</h2>
        <p className="text-purple-200 text-lg mb-6">No expense data available yet.</p>
        <p className="text-purple-300">Add some expenses to see analytics and insights!</p>
      </div>
    );
  }

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set();
    expenses.forEach(exp => {
      const year = new Date(exp.date + 'T00:00:00Z').getUTCFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  // Filter expenses based on type
  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter(exp => {
      const typeMatch = analysisType === 'recurring'
        ? exp.type === 'Recurring'
        : exp.type === 'Non-Recurring';
      const isPaid = exp.status === 'PAID';
      return typeMatch && isPaid;
    });

    console.log('Filtered expenses count:', filtered.length);
    console.log('Analysis type:', analysisType);

    return filtered;
  }, [expenses, analysisType]);

  // Show message if no data for selected type
  if (filteredExpenses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📊 Advanced Analytics</h1>
              <p className="text-purple-200">Deep insights into your spending patterns and trends</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
            >
              <option value="recurring">Recurring Expenses</option>
              <option value="non-recurring">Non-Recurring Expenses</option>
            </select>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No {analysisType} PAID expenses found</h2>
          <p className="text-purple-200 text-lg mb-4">
            You have {expenses.filter(e => e.type === (analysisType === 'recurring' ? 'Recurring' : 'Non-Recurring')).length} {analysisType} expenses total,
            but only PAID expenses are included in analytics.
          </p>
          <p className="text-purple-300">
            Try switching to {analysisType === 'recurring' ? 'Non-Recurring' : 'Recurring'} expenses or add some PAID {analysisType} expenses to see analytics.
          </p>
        </div>
      </div>
    );
  }

  // Year-over-Year Comparison
  const yearOverYearData = useMemo(() => {
    const yearlyData = {};

    filteredExpenses.forEach(exp => {
      const year = new Date(exp.date + 'T00:00:00Z').getUTCFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = { total: 0, count: 0, byMonth: {} };
      }
      yearlyData[year].total += exp.amount;
      yearlyData[year].count += 1;

      const month = new Date(exp.date + 'T00:00:00Z').getUTCMonth();
      if (!yearlyData[year].byMonth[month]) {
        yearlyData[year].byMonth[month] = 0;
      }
      yearlyData[year].byMonth[month] += exp.amount;
    });

    return yearlyData;
  }, [filteredExpenses]);

  // Calculate YoY growth
  const yoyGrowth = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    const growthData = [];

    for (let i = 1; i < years.length; i++) {
      const currentYear = years[i];
      const previousYear = years[i - 1];
      const current = yearOverYearData[currentYear].total;
      const previous = yearOverYearData[previousYear].total;
      const growth = ((current - previous) / previous) * 100;

      growthData.push({
        year: currentYear,
        growth: growth,
        current: current,
        previous: previous
      });
    }

    return growthData;
  }, [yearOverYearData]);

  // Category-wise spending patterns
  const categoryPatterns = useMemo(() => {
    const patterns = {};
    const currentCategories = analysisType === 'recurring' ? categories : nonRecurringCategories;

    filteredExpenses.forEach(exp => {
      if (!patterns[exp.category]) {
        patterns[exp.category] = {
          total: 0,
          count: 0,
          byYear: {},
          byMonth: {},
          trend: []
        };
      }

      patterns[exp.category].total += exp.amount;
      patterns[exp.category].count += 1;

      const year = new Date(exp.date + 'T00:00:00Z').getUTCFullYear();
      const month = new Date(exp.date + 'T00:00:00Z').getUTCMonth();

      if (!patterns[exp.category].byYear[year]) {
        patterns[exp.category].byYear[year] = 0;
      }
      patterns[exp.category].byYear[year] += exp.amount;

      const monthKey = `${year}-${month}`;
      if (!patterns[exp.category].byMonth[monthKey]) {
        patterns[exp.category].byMonth[monthKey] = 0;
      }
      patterns[exp.category].byMonth[monthKey] += exp.amount;
    });

    // Calculate averages and trends
    Object.keys(patterns).forEach(cat => {
      const yearCount = Object.keys(patterns[cat].byYear).length;
      patterns[cat].yearlyAverage = yearCount > 0 ? patterns[cat].total / yearCount : 0;
      patterns[cat].monthlyAverage = patterns[cat].count > 0 ? patterns[cat].total / patterns[cat].count : 0;

      // Calculate trend (last 6 months)
      const monthKeys = Object.keys(patterns[cat].byMonth).sort();
      const last6Months = monthKeys.slice(-6);
      const trendValues = last6Months.map(key => patterns[cat].byMonth[key]);

      if (trendValues.length >= 2) {
        const firstHalf = trendValues.slice(0, Math.floor(trendValues.length / 2));
        const secondHalf = trendValues.slice(Math.floor(trendValues.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        patterns[cat].trendDirection = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
        patterns[cat].trendPercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
      } else {
        patterns[cat].trendDirection = 'stable';
        patterns[cat].trendPercent = 0;
      }
    });

    return patterns;
  }, [filteredExpenses, categories, nonRecurringCategories, analysisType]);

  // Monthly totals (not averages - showing actual spending per month)
  const monthlyTotals = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));

    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date + 'T00:00:00Z').getUTCMonth();
      monthlyData[month].total += exp.amount;
      monthlyData[month].count += 1;
    });

    return months.map((name, idx) => ({
      month: name,
      total: monthlyData[idx].total,
      count: monthlyData[idx].count
    }));
  }, [filteredExpenses]);

  // Spending forecast (simple linear regression)
  const forecast = useMemo(() => {
    const years = Object.keys(yearOverYearData).sort();
    if (years.length < 2) return null;

    const dataPoints = years.map((year, idx) => ({
      x: idx,
      y: yearOverYearData[year].total
    }));

    // Calculate linear regression
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextYear = parseInt(years[years.length - 1]) + 1;
    const forecastValue = slope * n + intercept;

    return {
      nextYear,
      predicted: forecastValue,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }, [yearOverYearData]);

  // Top spending categories - get all, not just top 5
  const topCategories = useMemo(() => {
    return Object.entries(categoryPatterns)
      .sort((a, b) => b[1].total - a[1].total);
  }, [categoryPatterns]);

  // Pagination for categories
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 5;
  const totalCategoryPages = Math.ceil(topCategories.length / categoriesPerPage);
  const paginatedCategories = topCategories.slice(
    (categoryPage - 1) * categoriesPerPage,
    categoryPage * categoriesPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Advanced Analytics</h1>
            <p className="text-purple-200">Deep insights into your spending patterns and trends</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
          >
            <option value="recurring">Recurring Expenses</option>
            <option value="non-recurring">Non-Recurring Expenses</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
          >
            <option value="All">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          Year-over-Year Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(yearOverYearData).sort((a, b) => b[0] - a[0]).map(([year, data]) => (
            <div key={year} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-purple-200 text-sm mb-1">{year}</div>
              <div className="text-3xl font-bold text-white mb-2">
                ${data.total.toFixed(2)}
              </div>
              <div className="text-sm text-purple-300">
                {data.count} transactions
              </div>
            </div>
          ))}
        </div>

        {yoyGrowth.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Growth Analysis</h3>
            {yoyGrowth.map((item) => (
              <div key={item.year} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{item.year} vs {parseInt(item.year) - 1}</div>
                  <div className="text-sm text-purple-300">
                    ${item.current.toFixed(2)} vs ${item.previous.toFixed(2)}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  item.growth > 0 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                }`}>
                  {item.growth > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">{Math.abs(item.growth).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spending Forecast */}
      {forecast && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Spending Forecast
          </h2>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-purple-200 text-sm mb-1">Predicted {analysisType} spending for {forecast.nextYear}</div>
                <div className="text-4xl font-bold text-white">
                  ${forecast.predicted.toFixed(2)}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                forecast.trend === 'increasing'
                  ? 'bg-red-500/20 text-red-300'
                  : forecast.trend === 'decreasing'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                <Activity className="w-8 h-8" />
              </div>
            </div>
            <p className="text-purple-200 text-sm">
              Based on historical data, your {analysisType} expenses are trending{' '}
              <span className="font-semibold text-white">{forecast.trend}</span>
            </p>
          </div>
        </div>
      )}

      {/* Category-wise Spending Patterns - IMPROVED VIEW */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-green-400" />
            Category Spending Patterns
          </h2>
          <div className="text-purple-200 text-sm">
            {topCategories.length} {topCategories.length === 1 ? 'category' : 'categories'} tracked
          </div>
        </div>

        {/* Summary Bar Chart */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 text-sm">Total Spending by Category</h3>
          <div className="space-y-2">
            {topCategories.map(([category, data]) => {
              const maxTotal = topCategories[0][1].total;
              const widthPercent = (data.total / maxTotal) * 100;

              return (
                <div key={category} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-200 text-sm">${data.total.toFixed(2)}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                        data.trendDirection === 'up'
                          ? 'bg-red-500/20 text-red-300'
                          : data.trendDirection === 'down'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {data.trendDirection === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : data.trendDirection === 'down' ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        <span className="font-semibold">
                          {data.trendDirection === 'stable' ? 'Stable' : `${Math.abs(data.trendPercent).toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Breakdown - Compact Table View */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Detailed Breakdown</h3>
            {totalCategoryPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCategoryPage(prev => Math.max(1, prev - 1))}
                  disabled={categoryPage === 1}
                  className={`px-3 py-1 rounded text-xs transition-all ${
                    categoryPage === 1 ? 'bg-white/5 text-purple-400' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  ‹
                </button>
                <span className="text-purple-300 text-xs">
                  {categoryPage} / {totalCategoryPages}
                </span>
                <button
                  onClick={() => setCategoryPage(prev => Math.min(totalCategoryPages, prev + 1))}
                  disabled={categoryPage === totalCategoryPages}
                  className={`px-3 py-1 rounded text-xs transition-all ${
                    categoryPage === totalCategoryPages ? 'bg-white/5 text-purple-400' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-purple-200 font-semibold pb-2 pr-4">Category</th>
                  <th className="text-right text-purple-200 font-semibold pb-2 pr-4">Total</th>
                  <th className="text-right text-purple-200 font-semibold pb-2 pr-4">Count</th>
                  <th className="text-right text-purple-200 font-semibold pb-2 pr-4">Yearly Avg</th>
                  <th className="text-right text-purple-200 font-semibold pb-2 pr-4">Per Trans</th>
                  <th className="text-right text-purple-200 font-semibold pb-2 pr-4">% Total</th>
                  <th className="text-center text-purple-200 font-semibold pb-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map(([category, data]) => (
                  <tr key={category} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 pr-4 text-white font-medium">{category}</td>
                    <td className="py-2 pr-4 text-white text-right font-semibold">${data.total.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-purple-300 text-right">{data.count}</td>
                    <td className="py-2 pr-4 text-white text-right">${data.yearlyAverage.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-white text-right">${data.monthlyAverage.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-purple-300 text-right">
                      {((data.total / topCategories.reduce((sum, [, d]) => sum + d.total, 0)) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        data.trendDirection === 'up'
                          ? 'bg-red-500/20 text-red-300'
                          : data.trendDirection === 'down'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {data.trendDirection === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : data.trendDirection === 'down' ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        <span className="font-semibold">
                          {data.trendDirection === 'stable' ? '-' : `${Math.abs(data.trendPercent).toFixed(1)}%`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Spending Totals - Bar Chart Visualization */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-400" />
          Monthly Spending Totals
        </h2>
        <p className="text-purple-300 text-sm mb-6">Total spending per month (not averages)</p>

        {/* Horizontal Bar Chart */}
        <div className="space-y-2 mb-6">
          {monthlyTotals.map((data) => {
            const maxTotal = Math.max(...monthlyTotals.map(m => m.total));
            const widthPercent = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;

            return (
              <div key={data.month} className="group">
                <div className="flex items-center gap-3">
                  {/* Month Label */}
                  <div className="w-12 text-purple-200 text-sm font-semibold">
                    {data.month}
                  </div>

                  {/* Bar Container */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-8 overflow-hidden relative">
                      {/* Animated Bar */}
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 group-hover:from-purple-400 group-hover:to-pink-400 flex items-center justify-end pr-3"
                        style={{ width: `${widthPercent}%`, minWidth: data.total > 0 ? '60px' : '0' }}
                      >
                        {data.total > 0 && (
                          <span className="text-white text-sm font-bold whitespace-nowrap">
                            ${data.total.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Count */}
                    <div className="w-24 text-right">
                      <span className="text-purple-300 text-xs">
                        {data.count} txn{data.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div className="text-blue-300 text-xs font-semibold">Total Spending</div>
            </div>
            <div className="text-white font-bold text-2xl">
              ${monthlyTotals.reduce((sum, m) => sum + m.total, 0).toFixed(2)}
            </div>
            <div className="text-blue-200 text-xs mt-1">across all months</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              <div className="text-green-300 text-xs font-semibold">Lowest Month</div>
            </div>
            <div className="text-white font-bold text-2xl">
              {monthlyTotals.reduce((min, m) => m.total < min.total || min.total === 0 ? m : min).month}
            </div>
            <div className="text-green-200 text-xs mt-1">
              ${monthlyTotals.reduce((min, m) => m.total < min.total || min.total === 0 ? m : min).total.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <div className="text-red-300 text-xs font-semibold">Highest Month</div>
            </div>
            <div className="text-white font-bold text-2xl">
              {monthlyTotals.reduce((max, m) => m.total > max.total ? m : max).month}
            </div>
            <div className="text-red-200 text-xs mt-1">
              ${monthlyTotals.reduce((max, m) => m.total > max.total ? m : max).total.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <div className="text-purple-300 text-xs font-semibold">Monthly Average</div>
            </div>
            <div className="text-white font-bold text-2xl">
              ${(monthlyTotals.reduce((sum, m) => sum + m.total, 0) / 12).toFixed(2)}
            </div>
            <div className="text-purple-200 text-xs mt-1">per month</div>
          </div>
        </div>
      </div>

      {/* Quick Insights - REMOVED (Redundant) */}
    </div>
  );
};

export default AdvancedAnalytics;