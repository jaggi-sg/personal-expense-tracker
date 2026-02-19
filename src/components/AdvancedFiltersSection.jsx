// src/components/AdvancedFiltersSection.jsx

import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import AdvancedSearchBar from './AdvancedSearchBar';
import FilterPresets from './FilterPresets';
import QuickFilterChips from './QuickFilterChips';

const AdvancedFiltersSection = ({
  searchCriteria,
  onSearchChange,
  onClearAll,
  categories,
  paymentTypes,
  presets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  onToggleFavorite,
  onQuickFilter
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Check if there are active filters
  const hasActiveFilters = Object.entries(searchCriteria).some(([key, value]) => {
    return value && value !== '' && value !== 'All';
  });

  const activeFilterCount = Object.entries(searchCriteria).filter(([key, value]) => {
    return value && value !== '' && value !== 'All';
  }).length;

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-semibold transition-all ${
          hasActiveFilters
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
            : isExpanded
            ? 'bg-purple-500 text-white'
            : 'bg-white/10 text-purple-200 hover:bg-white/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-6 h-6" />
          <span className="text-lg">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-blue-300 text-sm font-semibold">Active Filters:</span>
                  {Object.entries(searchCriteria).map(([key, value]) => {
                    if (value && value !== 'All' && value !== '') {
                      return (
                        <span key={key} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          {key}: {value}
                          <button
                            onClick={() => {
                              const newCriteria = { ...searchCriteria };
                              delete newCriteria[key];
                              onSearchChange(newCriteria);
                            }}
                            className="hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Filter Chips */}
          <div>
            <QuickFilterChips
              onQuickFilter={onQuickFilter}
              activeFilters={searchCriteria}
            />
          </div>

          {/* Filter Presets */}
          <div>
            <FilterPresets
              presets={presets}
              onLoadPreset={onLoadPreset}
              onSavePreset={onSavePreset}
              onDeletePreset={onDeletePreset}
              onToggleFavorite={onToggleFavorite}
              currentCriteria={searchCriteria}
            />
          </div>

          {/* Advanced Search Bar */}
          <div>
            <AdvancedSearchBar
              searchCriteria={searchCriteria}
              onSearchChange={onSearchChange}
              onClearAll={onClearAll}
              categories={categories}
              paymentTypes={paymentTypes}
              showAdvanced={showAdvancedSearch}
              setShowAdvanced={setShowAdvancedSearch}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltersSection;