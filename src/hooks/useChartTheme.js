// src/hooks/useChartTheme.js
// Manages chart color palette preference with 3 themes

import { useState, useCallback } from 'react';

export const CHART_THEMES = {
  violet: {
    name: 'Violet',
    label: 'Default',
    primary:   '#7c3aed',
    secondary: '#ec4899',
    accent:    '#06b6d4',
    // Chart.js colors
    recurring:    { border: '#f472b6', bg: 'rgba(244,114,182,0.08)',  bar: 'rgba(124,58,237,0.75)'  },
    nonRecurring: { border: '#34d399', bg: 'rgba(52,211,153,0.08)',   bar: 'rgba(16,185,129,0.75)'  },
    pie: [
      'rgba(124,58,237,0.85)', 'rgba(236,72,153,0.85)', 'rgba(6,182,212,0.85)',
      'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)',  'rgba(16,185,129,0.85)',
      'rgba(99,102,241,0.85)', 'rgba(249,115,22,0.85)', 'rgba(20,184,166,0.85)',
      'rgba(168,85,247,0.85)',
    ],
    gradient: 'from-violet-500 to-pink-500',
    ringColor: '#7c3aed',
  },
  emerald: {
    name: 'Emerald',
    label: 'Money',
    primary:   '#059669',
    secondary: '#0891b2',
    accent:    '#84cc16',
    recurring:    { border: '#34d399', bg: 'rgba(52,211,153,0.08)',  bar: 'rgba(5,150,105,0.75)'   },
    nonRecurring: { border: '#67e8f9', bg: 'rgba(103,232,249,0.08)', bar: 'rgba(8,145,178,0.75)'   },
    pie: [
      'rgba(5,150,105,0.85)',  'rgba(8,145,178,0.85)',  'rgba(132,204,22,0.85)',
      'rgba(16,185,129,0.85)', 'rgba(6,182,212,0.85)',  'rgba(34,197,94,0.85)',
      'rgba(20,184,166,0.85)', 'rgba(14,165,233,0.85)', 'rgba(101,163,13,0.85)',
      'rgba(52,211,153,0.85)',
    ],
    gradient: 'from-emerald-500 to-cyan-500',
    ringColor: '#059669',
  },
  amber: {
    name: 'Amber',
    label: 'Warm',
    primary:   '#d97706',
    secondary: '#dc2626',
    accent:    '#f59e0b',
    recurring:    { border: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  bar: 'rgba(217,119,6,0.75)'   },
    nonRecurring: { border: '#f87171', bg: 'rgba(248,113,113,0.08)', bar: 'rgba(220,38,38,0.75)'   },
    pie: [
      'rgba(217,119,6,0.85)',  'rgba(220,38,38,0.85)',  'rgba(245,158,11,0.85)',
      'rgba(251,191,36,0.85)', 'rgba(239,68,68,0.85)',  'rgba(249,115,22,0.85)',
      'rgba(234,179,8,0.85)',  'rgba(185,28,28,0.85)',  'rgba(253,224,71,0.85)',
      'rgba(252,165,165,0.85)',
    ],
    gradient: 'from-amber-500 to-red-500',
    ringColor: '#d97706',
  },
};

const STORAGE_KEY = 'chart-theme';

export function useChartTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'violet'; } catch { return 'violet'; }
  });

  const theme = CHART_THEMES[themeKey] || CHART_THEMES.violet;

  const setTheme = useCallback((key) => {
    setThemeKey(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, []);

  return { theme, themeKey, setTheme, themes: CHART_THEMES };
}