import React, { useState } from 'react';
import { Search, Filter, X, Save, Star, StarOff, ChevronDown, ChevronUp, Plus } from 'lucide-react';

// ==================== COMPONENT 1: AdvancedSearchBar ====================
const AdvancedSearchBar = ({
  searchCriteria,
  onSearchChange,
  onClearAll,
  categories,
  paymentTypes,
  showAdvanced,
  setShowAdvanced
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-4">
      {/* Quick Search Bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
          <input
            type="text"
            placeholder="Search description, category, or amount..."
            value={searchCriteria.quickSearch || ''}
            onChange={(e) => onSearchChange({ ...searchCriteria, quickSearch: e.target.value })}
            className="w-full bg-white/20 border border-white/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-purple-300"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            showAdvanced
              ? 'bg-purple-500 text-white'
              : 'bg-white/20 text-purple-200 hover:bg-white/30'
          }`}
        >
          <Filter className="w-5 h-5" />
          Advanced
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {Object.keys(searchCriteria).some(key => searchCriteria[key] && searchCriteria[key] !== 'All') && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/20">
          {/* Category Filter */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Category</label>
            <select
              value={searchCriteria.category || 'All'}
              onChange={(e) => onSearchChange({ ...searchCriteria, category: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Payment Type Filter */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Payment Type</label>
            <select
              value={searchCriteria.paymentType || 'All'}
              onChange={(e) => onSearchChange({ ...searchCriteria, paymentType: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="All">All Types</option>
              {paymentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Status</label>
            <select
              value={searchCriteria.status || 'All'}
              onChange={(e) => onSearchChange({ ...searchCriteria, status: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="All">All Status</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Amount Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={searchCriteria.minAmount || ''}
                onChange={(e) => onSearchChange({ ...searchCriteria, minAmount: e.target.value })}
                className="w-1/2 bg-white/20 border border-white/30 rounded-lg px-2 py-2 text-white text-sm placeholder-purple-300"
              />
              <input
                type="number"
                placeholder="Max"
                value={searchCriteria.maxAmount || ''}
                onChange={(e) => onSearchChange({ ...searchCriteria, maxAmount: e.target.value })}
                className="w-1/2 bg-white/20 border border-white/30 rounded-lg px-2 py-2 text-white text-sm placeholder-purple-300"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Start Date</label>
            <input
              type="date"
              value={searchCriteria.startDate || ''}
              onChange={(e) => onSearchChange({ ...searchCriteria, startDate: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">End Date</label>
            <input
              type="date"
              value={searchCriteria.endDate || ''}
              onChange={(e) => onSearchChange({ ...searchCriteria, endDate: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="text-purple-200 text-xs font-semibold mb-1 block">Paid By</label>
            <input
              type="text"
              placeholder="e.g., J Wells Fargo"
              value={searchCriteria.paidBy || ''}
              onChange={(e) => onSearchChange({ ...searchCriteria, paidBy: e.target.value })}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;



{/*


// ==================== DEMO APP ====================
const AdvancedSearchDemo = () => {
  const [searchCriteria, setSearchCriteria] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presets, setPresets] = useState([
    {
      id: '1',
      name: 'High Value Pending',
      criteria: { status: 'PENDING', minAmount: '500' },
      isFavorite: true
    },
    {
      id: '2',
      name: 'This Month Paid',
      criteria: { status: 'PAID', quickSearch: new Date().toLocaleString('default', { month: 'long' }) },
      isFavorite: false
    }
  ]);

  const categories = ['Internet', 'Electricity', 'Mortgage', 'Water', 'HOA'];
  const paymentTypes = ['Cash', 'Online', 'InStore'];

  const handleSavePreset = (name, criteria) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      criteria,
      isFavorite: false
    };
    setPresets([...presets, newPreset]);
    alert(`✅ Filter preset "${name}" saved!`);
  };

  const handleLoadPreset = (criteria) => {
    setSearchCriteria(criteria);
    setShowAdvanced(true);
    alert('✅ Filter preset loaded!');
  };

  const handleDeletePreset = (id) => {
    const preset = presets.find(p => p.id === id);
    if (window.confirm(`Delete preset "${preset.name}"?`)) {
      setPresets(presets.filter(p => p.id !== id));
    }
  };

  const handleToggleFavorite = (id) => {
    setPresets(presets.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleQuickFilter = (criteria) => {
    setSearchCriteria({ ...searchCriteria, ...criteria });
  };

  const handleClearAll = () => {
    setSearchCriteria({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Advanced Search & Filters</h1>
          <p className="text-purple-200">Search with multiple criteria, save presets, and use quick filters</p>
        </div>

        <QuickFilterChips
          onQuickFilter={handleQuickFilter}
          activeFilters={searchCriteria}
        />

        <FilterPresets
          presets={presets}
          onLoadPreset={handleLoadPreset}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          onToggleFavorite={handleToggleFavorite}
          currentCriteria={searchCriteria}
        />

        <AdvancedSearchBar
          searchCriteria={searchCriteria}
          onSearchChange={setSearchCriteria}
          onClearAll={handleClearAll}
          categories={categories}
          paymentTypes={paymentTypes}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />

         */}
{/* Active Filters Display */}{/*

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Active Filters</h2>
          {Object.keys(searchCriteria).length === 0 ? (
            <p className="text-purple-300">No filters active. Use search bar or quick filters above.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(searchCriteria).map(([key, value]) => {
                if (value && value !== 'All') {
                  return (
                    <div key={key} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="text-purple-300 text-sm font-semibold">{key}:</span>
                        <span className="text-white ml-2">{value}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newCriteria = { ...searchCriteria };
                          delete newCriteria[key];
                          setSearchCriteria(newCriteria);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchDemo; */}
