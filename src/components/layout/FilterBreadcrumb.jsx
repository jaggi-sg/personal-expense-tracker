// src/components/layout/FilterBreadcrumb.jsx

import React from 'react';
import { X, Search, Calendar, Tag, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

const Chip = ({ icon: Icon, label, onRemove, color }) => {
  const colorCls = color === 'blue'   ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                 : color === 'green'  ? 'bg-green-500/15 border-green-500/30 text-green-300'
                 : color === 'orange' ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                 : 'bg-purple-500/15 border-purple-500/30 text-purple-300';

  return (
    <div className={'flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full border text-xs font-medium ' + colorCls}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="max-w-[120px] truncate">{label}</span>
      {onRemove && (
        <button onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-0.5 p-0.5 rounded-full">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};

const FilterBreadcrumb = ({
  activeTab,
  totalCount,
  filteredCount,
  searchQuery,       setSearchQuery,
  dateFrom,          setDateFrom,
  dateTo,            setDateTo,
  selectedCategories, toggleCategory,
  sortBy,            setSortBy,
  clearAllFilters,
}) => {
  const chips = [];

  // Search
  if (searchQuery) chips.push({
    key: 'search',
    icon: Search,
    label: '"' + searchQuery + '"',
    color: 'blue',
    onRemove: () => setSearchQuery(''),
  });

  // Date range
  if (dateFrom && dateTo) chips.push({
    key: 'dates',
    icon: Calendar,
    label: dateFrom + ' to ' + dateTo,
    color: 'green',
    onRemove: () => { setDateFrom(''); setDateTo(''); },
  });
  else if (dateFrom) chips.push({
    key: 'dateFrom',
    icon: Calendar,
    label: 'From ' + dateFrom,
    color: 'green',
    onRemove: () => setDateFrom(''),
  });
  else if (dateTo) chips.push({
    key: 'dateTo',
    icon: Calendar,
    label: 'Until ' + dateTo,
    color: 'green',
    onRemove: () => setDateTo(''),
  });

  // Categories
  selectedCategories.forEach(cat => chips.push({
    key: 'cat-' + cat,
    icon: Tag,
    label: cat,
    color: 'purple',
    onRemove: () => toggleCategory(cat),
  }));

  // Sort (only if non-default)
  if (sortBy && sortBy !== 'date-desc') {
    const sortLabels = {
      'date-asc':    'Date asc',
      'amount-desc': 'Highest first',
      'amount-asc':  'Lowest first',
      'payment-desc':'Payment Z-A',
      'payment-asc': 'Payment A-Z',
    };
    chips.push({
      key: 'sort',
      icon: ArrowUpDown,
      label: sortLabels[sortBy] || sortBy,
      color: 'orange',
      onRemove: () => setSortBy('date-desc'),
    });
  }

  const isFiltered = filteredCount < totalCount;
  const hasChips   = chips.length > 0;

  if (!hasChips && !isFiltered) return null;

  const tabLabel = activeTab === 'recurring' ? 'Recurring' : 'Non-Recurring';

  return (
    <div className="flex items-center gap-2 flex-wrap px-1 pb-3 -mt-2 min-h-[28px]">
      {/* Context label */}
      <div className="flex items-center gap-1.5 text-purple-500 text-xs">
        <SlidersHorizontal className="w-3 h-3" />
        <span className="font-medium">{tabLabel}</span>
        <span className="text-purple-600">·</span>
        <span className={isFiltered ? 'text-amber-400 font-semibold' : ''}>
          {isFiltered
            ? filteredCount + ' of ' + totalCount
            : totalCount + ' expense' + (totalCount !== 1 ? 's' : '')}
        </span>
      </div>

      {/* Filter chips */}
      {chips.map(c => (
        <Chip key={c.key} icon={c.icon} label={c.label} color={c.color} onRemove={c.onRemove} />
      ))}

      {/* Clear all */}
      {hasChips && (
        <button onClick={clearAllFilters}
          className="text-purple-600 hover:text-purple-400 text-xs transition-colors flex items-center gap-1">
          <X className="w-2.5 h-2.5" /> Clear all
        </button>
      )}
    </div>
  );
};

export default FilterBreadcrumb;