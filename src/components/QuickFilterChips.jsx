import React, { useState } from 'react';
import { Search, Filter, X, Save, Star, StarOff, ChevronDown, ChevronUp, Plus } from 'lucide-react';
// ==================== COMPONENT 3: QuickFilterChips ====================
const QuickFilterChips = ({ onQuickFilter, activeFilters }) => {
  const quickFilters = [
    { id: 'paid', label: 'Paid', criteria: { status: 'PAID' }, color: 'green' },
    { id: 'pending', label: 'Pending', criteria: { status: 'PENDING' }, color: 'orange' },
    { id: 'overdue', label: 'Overdue', criteria: { status: 'OVERDUE' }, color: 'red' },
    { id: 'this-month', label: 'This Month', criteria: { quickSearch: new Date().toLocaleString('default', { month: 'long' }) }, color: 'blue' },
    { id: 'high-amount', label: 'Over $500', criteria: { minAmount: '500' }, color: 'purple' },
    { id: 'low-amount', label: 'Under $100', criteria: { maxAmount: '100' }, color: 'teal' },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-200 text-sm font-semibold">Quick Filters:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const isActive = Object.keys(filter.criteria).some(
            key => activeFilters[key] === filter.criteria[key]
          );

          return (
            <button
              key={filter.id}
              onClick={() => onQuickFilter(filter.criteria)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? `bg-${filter.color}-500 text-white`
                  : `bg-white/10 text-${filter.color}-300 hover:bg-white/20`
              }`}
            >
              {filter.label}
              {isActive && <X className="w-3 h-3 inline ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickFilterChips;