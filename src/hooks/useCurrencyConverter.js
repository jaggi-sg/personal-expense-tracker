// src/hooks/useCurrencyConverter.js

import { useState, useCallback } from 'react';

const CACHE_KEY = 'fx-rate-cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Popular travel currencies with flags and names
export const TRAVEL_CURRENCIES = [
  { code: 'MXN', flag: '🇲🇽', name: 'Mexican Peso' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'THB', flag: '🇹🇭', name: 'Thai Baht' },
  { code: 'PHP', flag: '🇵🇭', name: 'Philippine Peso' },
  { code: 'KRW', flag: '🇰🇷', name: 'South Korean Won' },
  { code: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'BRL', flag: '🇧🇷', name: 'Brazilian Real' },
  { code: 'ARS', flag: '🇦🇷', name: 'Argentine Peso' },
  { code: 'COP', flag: '🇨🇴', name: 'Colombian Peso' },
  { code: 'PEN', flag: '🇵🇪', name: 'Peruvian Sol' },
  { code: 'CLP', flag: '🇨🇱', name: 'Chilean Peso' },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'HKD', flag: '🇭🇰', name: 'Hong Kong Dollar' },
  { code: 'IDR', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  { code: 'VND', flag: '🇻🇳', name: 'Vietnamese Dong' },
  { code: 'ILS', flag: '🇮🇱', name: 'Israeli Shekel' },
  { code: 'TRY', flag: '🇹🇷', name: 'Turkish Lira' },
  { code: 'ZAR', flag: '🇿🇦', name: 'South African Rand' },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'MAD', flag: '🇲🇦', name: 'Moroccan Dirham' },
  { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'SEK', flag: '🇸🇪', name: 'Swedish Krona' },
  { code: 'NOK', flag: '🇳🇴', name: 'Norwegian Krone' },
  { code: 'DKK', flag: '🇩🇰', name: 'Danish Krone' },
  { code: 'NZD', flag: '🇳🇿', name: 'New Zealand Dollar' },
];

// ── Cache helpers ─────────────────────────────────────────────────────────────
const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

const cacheKey = (date, currency) => `${date}:${currency}`;

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useCurrencyConverter = () => {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Returns rate: 1 foreignCurrency = X USD
  // Uses Frankfurter API — historical rates, free, no API key
  const fetchRate = useCallback(async (date, currency) => {
    if (!date || !currency) return null;

    // Check cache first
    const cache   = loadCache();
    const key     = cacheKey(date, currency);
    const cached  = cache[key];

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.rate;
    }

    setLoading(true);
    setError(null);

    try {
      // Frankfurter returns rates relative to base currency on a specific date
      // We want: how many USD = 1 {currency}
      // GET /YYYY-MM-DD?from=CURRENCY&to=USD
      const today     = new Date().toISOString().split('T')[0];
      const fetchDate = date > today ? today : date; // can't fetch future dates

      const res  = await fetch(
        `https://api.frankfurter.app/${fetchDate}?from=${currency}&to=USD`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const rate = data?.rates?.USD;

      if (!rate) throw new Error('Rate not found in response');

      // Save to cache
      const updated = loadCache();
      updated[key]  = { rate, fetchedAt: Date.now(), source: 'frankfurter' };
      saveCache(updated);

      setLoading(false);
      return rate;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  // Convert foreign amount to USD
  const convert = useCallback(async (amount, currency, date) => {
    const rate = await fetchRate(date, currency);
    if (rate === null) return null;
    return {
      usd:  parseFloat((amount * rate).toFixed(2)),
      rate: rate,
    };
  }, [fetchRate]);

  // Read a cached rate without fetching
  const getCachedRate = useCallback((date, currency) => {
    const cache  = loadCache();
    const cached = cache[cacheKey(date, currency)];
    return cached ? cached.rate : null;
  }, []);

  // List all cached rates (for the cache viewer)
  const listCachedRates = useCallback(() => {
    const cache = loadCache();
    return Object.entries(cache)
      .map(([k, v]) => {
        const [date, currency] = k.split(':');
        return { date, currency, rate: v.rate, fetchedAt: v.fetchedAt };
      })
      .sort((a, b) => b.fetchedAt - a.fetchedAt);
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  return { convert, fetchRate, getCachedRate, listCachedRates, clearCache, loading, error };
};