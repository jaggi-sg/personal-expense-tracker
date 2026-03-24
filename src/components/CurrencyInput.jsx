// src/components/CurrencyInput.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Globe, RefreshCw, CheckCircle, AlertCircle, ChevronDown, X, Database } from 'lucide-react';
import { useCurrencyConverter, TRAVEL_CURRENCIES } from '../hooks/useCurrencyConverter';

// ── Currency selector dropdown ────────────────────────────────────────────────
const CurrencySelector = ({ value, onChange }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();

  const selected = TRAVEL_CURRENCIES.find(c => c.code === value);
  const filtered = TRAVEL_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/15 hover:bg-white/20 border border-white/25 rounded-lg px-3 py-2 text-white text-sm transition-colors min-w-[130px]"
      >
        <span className="text-base">{selected?.flag || 'X'}</span>
        <span className="font-semibold">{value || 'Currency'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-purple-400 ml-auto" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-white text-xs placeholder-purple-500 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/10 transition-colors
                  ${c.code === value ? 'bg-violet-500/20' : ''}`}
              >
                <span className="text-base">{c.flag}</span>
                <div>
                  <span className="text-white text-sm font-semibold">{c.code}</span>
                  <span className="text-purple-400 text-xs ml-2">{c.name}</span>
                </div>
                {c.code === value && <CheckCircle className="w-3.5 h-3.5 text-violet-400 ml-auto" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-purple-500 text-xs text-center py-4">No currencies found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Rate source badge ─────────────────────────────────────────────────────────
const RateBadge = ({ fromCache }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold
    ${fromCache
      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
      : 'bg-green-500/20 text-green-300 border border-green-500/25'}`}>
    <Database className="w-2.5 h-2.5" />
    {fromCache ? 'cached' : 'live'}
  </span>
);

// ── Main CurrencyInput panel ──────────────────────────────────────────────────
const CurrencyInput = ({ formData, setFormData, date }) => {
  const { convert, getCachedRate, loading, error } = useCurrencyConverter();

  const [foreignAmt, setForeignAmt] = useState(formData.foreignAmount    ? String(formData.foreignAmount) : '');
  const [currency,   setCurrency]   = useState(formData.foreignCurrency  || 'MXN');
  const [rate,       setRate]       = useState(formData.exchangeRate      || null);
  const [usdResult,  setUsdResult]  = useState(formData.foreignAmountUSD || null);
  const [fromCache,  setFromCache]  = useState(false);
  const [enabled,    setEnabled]    = useState(!!(formData.foreignAmount));

  // Restore FX state when editing an existing expense
  useEffect(() => {
    if (formData.foreignAmount) {
      setForeignAmt(String(formData.foreignAmount));
      setCurrency(formData.foreignCurrency || 'MXN');
      setRate(formData.exchangeRate || null);
      setUsdResult(formData.foreignAmountUSD || null);
      setEnabled(true);
    }
  }, []);

  // When date or currency changes, silently load from cache
  useEffect(() => {
    if (!enabled || !date || !currency) return;
    const cached = getCachedRate(date, currency);
    if (cached) {
      setRate(cached);
      setFromCache(true);
      if (foreignAmt && parseFloat(foreignAmt) > 0) {
        const usd = parseFloat((parseFloat(foreignAmt) * cached).toFixed(2));
        setUsdResult(usd);
        pushToForm(foreignAmt, currency, cached, usd);
      }
    }
  }, [date, currency, enabled]);

  const pushToForm = (amt, cur, r, usd) => {
    setFormData(prev => ({
      ...prev,
      foreignAmount:    parseFloat(amt) || 0,
      foreignCurrency:  cur,
      exchangeRate:     r,
      foreignAmountUSD: usd,
      amount:           usd ? String(usd) : prev.amount,
    }));
  };

  const handleFetchRate = async () => {
    if (!foreignAmt || parseFloat(foreignAmt) <= 0) return;
    const result = await convert(parseFloat(foreignAmt), currency, date);
    if (result) {
      setRate(result.rate);
      setUsdResult(result.usd);
      setFromCache(false);
      pushToForm(foreignAmt, currency, result.rate, result.usd);
    }
  };

  const handleAmtChange = (val) => {
    setForeignAmt(val);
    if (rate && parseFloat(val) > 0) {
      const usd = parseFloat((parseFloat(val) * rate).toFixed(2));
      setUsdResult(usd);
      pushToForm(val, currency, rate, usd);
    } else {
      setUsdResult(null);
      setFormData(prev => ({
        ...prev,
        foreignAmount:    parseFloat(val) || 0,
        foreignAmountUSD: null,
      }));
    }
  };

  const handleCurrencyChange = (cur) => {
    setCurrency(cur);
    setRate(null);
    setUsdResult(null);
    setFromCache(false);
    setFormData(prev => ({
      ...prev,
      foreignCurrency:  cur,
      exchangeRate:     null,
      foreignAmountUSD: null,
    }));
  };

  const handleClear = () => {
    setForeignAmt('');
    setRate(null);
    setUsdResult(null);
    setEnabled(false);
    setFormData(prev => ({
      ...prev,
      foreignAmount:    null,
      foreignCurrency:  null,
      exchangeRate:     null,
      foreignAmountUSD: null,
    }));
  };

  const currencyInfo = TRAVEL_CURRENCIES.find(c => c.code === currency);

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-200 border border-dashed border-purple-500/40 hover:border-purple-400/60 rounded-lg px-3 py-2 transition-all mt-1 w-full"
      >
        <Globe className="w-3.5 h-3.5" />
        Add foreign currency amount
      </button>
    );
  }

  return (
    <div className="mt-2 bg-violet-500/8 border border-violet-500/25 rounded-xl p-4 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-violet-400" />
          <span className="text-violet-200 text-xs font-semibold uppercase tracking-wide">
            Foreign Currency · Travel
          </span>
        </div>
        <button type="button" onClick={handleClear}
          className="text-purple-500 hover:text-purple-300 transition-colors" title="Remove">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Currency picker + amount + button */}
      <div className="flex items-start gap-2 flex-wrap">
        <CurrencySelector value={currency} onChange={handleCurrencyChange} />

        <div className="flex-1 min-w-[120px]">
          <input
            type="number"
            step="0.01"
            placeholder={`Amount in ${currency}`}
            value={foreignAmt}
            onChange={e => handleAmtChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-600 focus:outline-none focus:border-violet-400"
          />
        </div>

        <button
          type="button"
          onClick={handleFetchRate}
          disabled={loading || !foreignAmt || parseFloat(foreignAmt) <= 0}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching…' : rate ? 'Refresh' : 'Convert'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error} — check connection or enter USD manually
        </div>
      )}

      {/* Conversion result */}
      {rate && usdResult !== null && (
        <div className="bg-white/8 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-xs mb-0.5">Converted to USD</p>
              <p className="text-white font-bold text-2xl leading-none">${usdResult.toFixed(2)}</p>
            </div>
            <div className="text-right space-y-1">
              <RateBadge fromCache={fromCache} />
              <p className="text-purple-500 text-xs">{date || 'selected date'}</p>
            </div>
          </div>

          {/* Rate line */}
          <div className="flex items-center gap-1.5 text-xs text-purple-400 border-t border-white/8 pt-2 flex-wrap">
            <span>{currencyInfo?.flag} 1 {currency} = <span className="text-white font-semibold">${rate.toFixed(6)} USD</span></span>
            <span className="text-purple-600 mx-1">·</span>
            <span className="text-white">{foreignAmt} {currency} = <span className="text-green-300 font-bold">${usdResult.toFixed(2)}</span></span>
          </div>

          <p className="text-violet-400 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            USD amount auto-filled in the Amount field above
          </p>
        </div>
      )}

      {/* Nudge to convert */}
      {foreignAmt && parseFloat(foreignAmt) > 0 && !rate && !loading && !error && (
        <p className="text-purple-500 text-xs">
          Hit <span className="text-violet-300 font-semibold">Convert</span> to fetch the {date} exchange rate
        </p>
      )}
    </div>
  );
};

export default CurrencyInput;