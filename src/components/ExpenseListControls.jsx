import React from 'react';
import { Search, Trash2 } from 'lucide-react';

const ExpenseListControls = ({
  // Filter props
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterCategory,
  setFilterCategory,
  availableYears,
  categories,
  months,
  // Search and sort props
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  // Delete props
  hasExpenses,
  onDeleteAll
}) => {
  return (
    <div className="mb-6">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-sm min-w-[140px]"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-sm min-w-[120px]"
        >
          <option value="All">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-sm min-w-[160px]"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Search and Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-purple-300 text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-sm min-w-[180px]"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="payment-asc">Payment Type (A-Z)</option>
            <option value="payment-desc">Payment Type (Z-A)</option>
          </select>
        </div>

        {hasExpenses && (
          <button
            onClick={onDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseListControls;