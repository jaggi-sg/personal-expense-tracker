// src/components/ExpenseListControls.jsx
// Replaces both ExpenseListControls + AdvancedFiltersSection in a single collapsible bar

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Trash2, X, SlidersHorizontal, ArrowUpDown, ChevronDown,
  ChevronUp, Filter, Calendar, Tag, Check, Star, Save, Zap
} from 'lucide-react';

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  'bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-2 text-white text-sm ' +
  'transition-all focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 placeholder-purple-400';

// ── Active filter pill ────────────────────────────────────────────────────────
const Pill = ({ label, onRemove, color = 'purple' }) => (
  <span className={`inline-flex items-center gap-1 bg-${color}-500/20 border border-${color}-500/30 text-${color}-200 text-xs px-2 py-1 rounded-full`}>
    {label}
    {onRemove && (
      <button onClick={onRemove} className={`text-${color}-400 hover:text-white ml-0.5`}>
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

// ── Category multi-select dropdown ────────────────────────────────────────────
const CategoryMultiSelect = ({ categories, selected, onToggle, onClear }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const label =
    selected.length === 0 ? 'All Categories' :
    selected.length === 1 ? selected[0] :
    `${selected.length} categories`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`${inp} flex items-center gap-2 min-w-[155px] justify-between ${selected.length > 0 ? 'border-purple-400/60 bg-purple-500/15' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-purple-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-52 bg-slate-800/98 backdrop-blur border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-purple-300 text-xs font-semibold">Filter by category</span>
            {selected.length > 0 && (
              <button onClick={onClear} className="text-xs text-purple-400 hover:text-white transition-colors">Clear</button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {categories.map(cat => {
              const active = selected.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onToggle(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors
                    ${active ? 'bg-purple-500/20 text-purple-200' : 'text-white hover:bg-white/10'}`}
                >
                  <span>{cat}</span>
                  {active && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-white/10 text-xs text-purple-400">
              {selected.length} of {categories.length} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Quick date presets ────────────────────────────────────────────────────────
const makeQuickFilters = () => {
  const now  = new Date();
  const y    = now.getFullYear();
  const m    = now.getMonth();
  const pad  = (n) => String(n).padStart(2, '0');
  const lastDay = (yr, mo) => new Date(yr, mo + 1, 0).getDate();

  return [
    {
      id: 'this-month', label: 'This Month',
      from: `${y}-${pad(m + 1)}-01`,
      to:   `${y}-${pad(m + 1)}-${lastDay(y, m)}`,
    },
    {
      id: 'last-month', label: 'Last Month',
      from: `${m === 0 ? y - 1 : y}-${pad(m === 0 ? 12 : m)}-01`,
      to:   `${m === 0 ? y - 1 : y}-${pad(m === 0 ? 12 : m)}-${lastDay(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1)}`,
    },
    {
      id: 'last-3m', label: 'Last 3 Months',
      from: (() => { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d.toISOString().split('T')[0]; })(),
      to:   now.toISOString().split('T')[0],
    },
    {
      id: 'this-year', label: 'This Year',
      from: `${y}-01-01`,
      to:   `${y}-12-31`,
    },
  ];
};

// ── Main component ────────────────────────────────────────────────────────────
const ExpenseListControls = ({
  // New filter props (from useExpenseFilters)
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  selectedCategories = [], toggleCategory,
  clearAllFilters,
  // Shared
  categories = [],
  paymentTypes = [],
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  // Advanced criteria (status / amount range / etc from parent state)
  searchCriteria = {}, onSearchChange,
  // Presets
  presets = [], onLoadPreset, onSavePreset, onDeletePreset,
  // Counts & actions
  filteredCount = 0,
  hasExpenses, onDeleteAll,
}) => {
  const [expanded, setExpanded]         = useState(false);
  const [activeQuick, setActiveQuick]   = useState(null);
  const [savePresetName, setSaveName]   = useState('');
  const [showSaveInput, setShowSave]    = useState(false);

  const QUICK = makeQuickFilters();

  // Count active filters for the badge
  const basicCount =
    (dateFrom || dateTo ? 1 : 0) +
    selectedCategories.length +
    (searchQuery ? 1 : 0);
  const advCount = Object.entries(searchCriteria).filter(([, v]) => v && v !== '' && v !== 'All').length;
  const totalActive = basicCount + advCount;
  const hasAny = totalActive > 0;

  const applyQuick = (qf) => {
    if (activeQuick === qf.id) {
      setDateFrom(''); setDateTo(''); setActiveQuick(null);
    } else {
      setDateFrom(qf.from); setDateTo(qf.to); setActiveQuick(qf.id);
    }
  };

  const handleClearAll = () => {
    clearAllFilters?.();
    onSearchChange?.({});
    setActiveQuick(null);
  };

  const handleSavePreset = () => {
    if (!savePresetName.trim()) return;
    const combined = {
      ...searchCriteria,
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo   ? { dateTo }   : {}),
      ...(selectedCategories.length ? { categories: selectedCategories.join(',') } : {}),
      ...(searchQuery ? { quickSearch: searchQuery } : {}),
    };
    onSavePreset?.(savePresetName.trim(), combined);
    setSaveName(''); setShowSave(false);
  };

  return (
    <div className="mb-5">

      {/* ── Always-visible top row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-2">

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`${inp} pl-8 pr-8 w-full`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${hasAny
              ? 'bg-purple-500/25 border-purple-500/50 text-purple-200'
              : expanded
              ? 'bg-white/15 border-white/30 text-white'
              : 'bg-white/10 border-white/20 text-purple-300 hover:bg-white/15 hover:text-white'}`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {totalActive > 0 && (
            <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold leading-none">
              {totalActive}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${inp} pl-8`}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
            <option value="payment-asc">Payment A→Z</option>
            <option value="payment-desc">Payment Z→A</option>
          </select>
        </div>

        {/* Result count */}
        <span className="text-purple-500 text-xs hidden md:block whitespace-nowrap">
          {filteredCount} result{filteredCount !== 1 ? 's' : ''}
        </span>

        {/* Clear all */}
        {hasAny && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-purple-300 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}

        {/* Delete all — far right */}
        {hasExpenses && (
          <button
            onClick={onDeleteAll}
            className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete All
          </button>
        )}
      </div>

      {/* ── Collapsible filter panel ───────────────────────────────────────── */}
      {expanded && (
        <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-4 mb-3">

          {/* Row 1: Date range + category multi-select + status + amount */}
          <div className="flex flex-wrap gap-3 items-center">

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setActiveQuick(null); }}
                className={`${inp} w-36`}
              />
              <span className="text-purple-500 text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setActiveQuick(null); }}
                className={`${inp} w-36`}
              />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); setActiveQuick(null); }} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-white/15 hidden sm:block" />

            {/* Category multi-select */}
            <CategoryMultiSelect
              categories={categories}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onClear={() => selectedCategories.forEach(c => toggleCategory(c))}
            />

            {onSearchChange && (
              <>
                <div className="h-6 w-px bg-white/15 hidden sm:block" />

                {/* Status */}
                <select
                  value={searchCriteria.status || ''}
                  onChange={e => onSearchChange({ ...searchCriteria, status: e.target.value })}
                  className={inp}
                >
                  <option value="">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                {/* Amount range */}
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-500 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={searchCriteria.minAmount || ''}
                    onChange={e => onSearchChange({ ...searchCriteria, minAmount: e.target.value })}
                    className={`${inp} w-20`}
                  />
                  <span className="text-purple-500 text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={searchCriteria.maxAmount || ''}
                    onChange={e => onSearchChange({ ...searchCriteria, maxAmount: e.target.value })}
                    className={`${inp} w-20`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Row 2: Quick date chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-purple-500 text-xs flex items-center gap-1 shrink-0">
              <Zap className="w-3 h-3" /> Quick:
            </span>
            {QUICK.map(qf => (
              <button
                key={qf.id}
                onClick={() => applyQuick(qf)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                  ${activeQuick === qf.id
                    ? 'bg-blue-500 border-blue-400 text-white'
                    : 'bg-white/8 border-white/20 text-purple-300 hover:bg-white/15 hover:text-white'}`}
              >
                {qf.label}
                {activeQuick === qf.id && <X className="w-3 h-3 inline ml-1.5 -mt-0.5" />}
              </button>
            ))}
          </div>

          {/* Row 3: Presets */}
          <div className="flex flex-wrap gap-2 items-center border-t border-white/10 pt-3">
            <span className="text-purple-500 text-xs flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3" /> Presets:
            </span>
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => onLoadPreset?.(p.criteria)}
                className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-purple-200 px-2.5 py-1.5 rounded-lg transition-all"
              >
                {p.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                {p.name}
                <button
                  onClick={e => { e.stopPropagation(); onDeletePreset?.(p.id); }}
                  className="text-purple-500 hover:text-red-400 ml-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
            {/* Save current as preset */}
            {onSavePreset && !showSaveInput && (
              <button
                onClick={() => setShowSave(true)}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-white border border-dashed border-purple-500/40 hover:border-purple-400 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Save className="w-3 h-3" /> Save current
              </button>
            )}
            {showSaveInput && (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  placeholder="Preset name..."
                  value={savePresetName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSavePreset(); if (e.key === 'Escape') setShowSave(false); }}
                  className={`${inp} text-xs py-1.5 w-36`}
                />
                <button onClick={handleSavePreset} className="text-green-400 hover:text-green-300 transition-colors"><Check className="w-4 h-4" /></button>
                <button onClick={() => setShowSave(false)} className="text-red-400 hover:text-red-300 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active filter pills (always visible when anything active) ─────── */}
      {hasAny && (
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-purple-500 text-xs flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Active:
          </span>
          {(dateFrom || dateTo) && (
            <Pill
              label={`${dateFrom || '…'} → ${dateTo || '…'}`}
              onRemove={() => { setDateFrom(''); setDateTo(''); setActiveQuick(null); }}
              color="blue"
            />
          )}
          {selectedCategories.map(cat => (
            <Pill key={cat} label={cat} onRemove={() => toggleCategory(cat)} />
          ))}
          {searchQuery && (
            <Pill label={`"${searchQuery}"`} onRemove={() => setSearchQuery('')} />
          )}
          {Object.entries(searchCriteria).map(([key, value]) =>
            value && value !== '' && value !== 'All' ? (
              <Pill
                key={key}
                label={`${key}: ${value}`}
                onRemove={() => { const n = { ...searchCriteria }; delete n[key]; onSearchChange?.(n); }}
                color="pink"
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseListControls;