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
    bgMid: '#581c87',
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
    bgMid: '#064e3b',
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
    bgMid: '#78350f',
  },
  ocean: {
    name: 'Ocean',
    label: 'Cool',
    primary:   '#0284c7',
    secondary: '#0d9488',
    accent:    '#06b6d4',
    recurring:    { border: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  bar: 'rgba(2,132,199,0.75)'   },
    nonRecurring: { border: '#2dd4bf', bg: 'rgba(45,212,191,0.08)',  bar: 'rgba(13,148,136,0.75)'  },
    pie: [
      'rgba(2,132,199,0.85)',  'rgba(13,148,136,0.85)', 'rgba(6,182,212,0.85)',
      'rgba(56,189,248,0.85)', 'rgba(45,212,191,0.85)', 'rgba(14,165,233,0.85)',
      'rgba(20,184,166,0.85)', 'rgba(59,130,246,0.85)', 'rgba(103,232,249,0.85)',
      'rgba(37,99,235,0.85)',
    ],
    gradient: 'from-sky-500 to-teal-500',
    ringColor: '#0284c7',
    bgMid: '#0c4a6e',
  },
  rose: {
    name: 'Rose',
    label: 'Bloom',
    primary:   '#e11d48',
    secondary: '#db2777',
    accent:    '#f43f5e',
    recurring:    { border: '#fb7185', bg: 'rgba(251,113,133,0.08)', bar: 'rgba(225,29,72,0.75)'   },
    nonRecurring: { border: '#f9a8d4', bg: 'rgba(249,168,212,0.08)', bar: 'rgba(219,39,119,0.75)'  },
    pie: [
      'rgba(225,29,72,0.85)',  'rgba(219,39,119,0.85)', 'rgba(244,63,94,0.85)',
      'rgba(251,113,133,0.85)','rgba(249,168,212,0.85)','rgba(236,72,153,0.85)',
      'rgba(190,24,93,0.85)',  'rgba(244,114,182,0.85)','rgba(159,18,57,0.85)',
      'rgba(251,207,232,0.85)',
    ],
    gradient: 'from-rose-500 to-pink-500',
    ringColor: '#e11d48',
    bgMid: '#881337',
  },
  slate: {
    name: 'Slate',
    label: 'Mono',
    primary:   '#475569',
    secondary: '#64748b',
    accent:    '#94a3b8',
    recurring:    { border: '#94a3b8', bg: 'rgba(148,163,184,0.08)', bar: 'rgba(71,85,105,0.75)'   },
    nonRecurring: { border: '#cbd5e1', bg: 'rgba(203,213,225,0.08)', bar: 'rgba(100,116,139,0.75)' },
    pie: [
      'rgba(71,85,105,0.85)',  'rgba(100,116,139,0.85)','rgba(148,163,184,0.85)',
      'rgba(203,213,225,0.85)','rgba(51,65,85,0.85)',   'rgba(30,41,59,0.85)',
      'rgba(120,113,108,0.85)','rgba(168,162,158,0.85)','rgba(87,83,78,0.85)',
      'rgba(214,211,209,0.85)',
    ],
    gradient: 'from-slate-500 to-slate-700',
    ringColor: '#475569',
    bgMid: '#1e293b',
  },
  sunset: {
    name: 'Sunset',
    label: 'Dusk',
    primary:   '#ea580c',
    secondary: '#9333ea',
    accent:    '#f59e0b',
    recurring:    { border: '#fb923c', bg: 'rgba(251,146,60,0.08)',  bar: 'rgba(234,88,12,0.75)'   },
    nonRecurring: { border: '#c084fc', bg: 'rgba(192,132,252,0.08)', bar: 'rgba(147,51,234,0.75)'  },
    pie: [
      'rgba(234,88,12,0.85)',  'rgba(147,51,234,0.85)', 'rgba(245,158,11,0.85)',
      'rgba(251,146,60,0.85)', 'rgba(192,132,252,0.85)','rgba(249,115,22,0.85)',
      'rgba(168,85,247,0.85)', 'rgba(253,186,116,0.85)','rgba(126,34,206,0.85)',
      'rgba(217,70,239,0.85)',
    ],
    gradient: 'from-orange-500 to-purple-600',
    ringColor: '#ea580c',
    bgMid: '#7c2d12',
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