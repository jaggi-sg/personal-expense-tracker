// src/hooks/useChartTheme.js
// Manages chart color palette preference
// Uses a custom window event so ALL instances sync when theme changes

import { useState, useCallback, useEffect } from 'react';

export const CHART_THEMES = {
  violet: {
    name: 'Violet', label: 'Default', primary: '#7c3aed', secondary: '#ec4899', accent: '#06b6d4',
    recurring: { border: '#f472b6', bg: 'rgba(244,114,182,0.08)', bar: 'rgba(124,58,237,0.75)' },
    nonRecurring: { border: '#34d399', bg: 'rgba(52,211,153,0.08)', bar: 'rgba(16,185,129,0.75)' },
    pie: ['rgba(124,58,237,0.85)','rgba(236,72,153,0.85)','rgba(6,182,212,0.85)','rgba(245,158,11,0.85)','rgba(239,68,68,0.85)','rgba(16,185,129,0.85)','rgba(99,102,241,0.85)','rgba(249,115,22,0.85)','rgba(20,184,166,0.85)','rgba(168,85,247,0.85)'],
    gradient: 'from-violet-500 to-pink-500', ringColor: '#7c3aed', bgMid: '#581c87', bgMidLight: '#ddd6fe',
  },
  emerald: {
    name: 'Emerald', label: 'Money', primary: '#059669', secondary: '#0891b2', accent: '#84cc16',
    recurring: { border: '#34d399', bg: 'rgba(52,211,153,0.08)', bar: 'rgba(5,150,105,0.75)' },
    nonRecurring: { border: '#67e8f9', bg: 'rgba(103,232,249,0.08)', bar: 'rgba(8,145,178,0.75)' },
    pie: ['rgba(5,150,105,0.85)','rgba(8,145,178,0.85)','rgba(132,204,22,0.85)','rgba(16,185,129,0.85)','rgba(6,182,212,0.85)','rgba(34,197,94,0.85)','rgba(20,184,166,0.85)','rgba(14,165,233,0.85)','rgba(101,163,13,0.85)','rgba(52,211,153,0.85)'],
    gradient: 'from-emerald-500 to-cyan-500', ringColor: '#059669', bgMid: '#064e3b', bgMidLight: '#a7f3d0',
  },
  amber: {
    name: 'Amber', label: 'Warm', primary: '#d97706', secondary: '#dc2626', accent: '#f59e0b',
    recurring: { border: '#fbbf24', bg: 'rgba(251,191,36,0.08)', bar: 'rgba(217,119,6,0.75)' },
    nonRecurring: { border: '#f87171', bg: 'rgba(248,113,113,0.08)', bar: 'rgba(220,38,38,0.75)' },
    pie: ['rgba(217,119,6,0.85)','rgba(220,38,38,0.85)','rgba(245,158,11,0.85)','rgba(251,191,36,0.85)','rgba(239,68,68,0.85)','rgba(249,115,22,0.85)','rgba(234,179,8,0.85)','rgba(185,28,28,0.85)','rgba(253,224,71,0.85)','rgba(252,165,165,0.85)'],
    gradient: 'from-amber-500 to-red-500', ringColor: '#d97706', bgMid: '#78350f', bgMidLight: '#fde68a',
  },
  ocean: {
    name: 'Ocean', label: 'Cool', primary: '#0284c7', secondary: '#0d9488', accent: '#06b6d4',
    recurring: { border: '#38bdf8', bg: 'rgba(56,189,248,0.08)', bar: 'rgba(2,132,199,0.75)' },
    nonRecurring: { border: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', bar: 'rgba(13,148,136,0.75)' },
    pie: ['rgba(2,132,199,0.85)','rgba(13,148,136,0.85)','rgba(6,182,212,0.85)','rgba(56,189,248,0.85)','rgba(45,212,191,0.85)','rgba(14,165,233,0.85)','rgba(20,184,166,0.85)','rgba(59,130,246,0.85)','rgba(103,232,249,0.85)','rgba(37,99,235,0.85)'],
    gradient: 'from-sky-500 to-teal-500', ringColor: '#0284c7', bgMid: '#0c4a6e', bgMidLight: '#bae6fd',
  },
  rose: {
    name: 'Rose', label: 'Bloom', primary: '#e11d48', secondary: '#db2777', accent: '#f43f5e',
    recurring: { border: '#fb7185', bg: 'rgba(251,113,133,0.08)', bar: 'rgba(225,29,72,0.75)' },
    nonRecurring: { border: '#f9a8d4', bg: 'rgba(249,168,212,0.08)', bar: 'rgba(219,39,119,0.75)' },
    pie: ['rgba(225,29,72,0.85)','rgba(219,39,119,0.85)','rgba(244,63,94,0.85)','rgba(251,113,133,0.85)','rgba(249,168,212,0.85)','rgba(236,72,153,0.85)','rgba(190,24,93,0.85)','rgba(244,114,182,0.85)','rgba(159,18,57,0.85)','rgba(251,207,232,0.85)'],
    gradient: 'from-rose-500 to-pink-500', ringColor: '#e11d48', bgMid: '#881337', bgMidLight: '#fecdd3',
  },
  slate: {
    name: 'Slate', label: 'Mono', primary: '#475569', secondary: '#64748b', accent: '#94a3b8',
    recurring: { border: '#94a3b8', bg: 'rgba(148,163,184,0.08)', bar: 'rgba(71,85,105,0.75)' },
    nonRecurring: { border: '#cbd5e1', bg: 'rgba(203,213,225,0.08)', bar: 'rgba(100,116,139,0.75)' },
    pie: ['rgba(71,85,105,0.85)','rgba(100,116,139,0.85)','rgba(148,163,184,0.85)','rgba(203,213,225,0.85)','rgba(51,65,85,0.85)','rgba(30,41,59,0.85)','rgba(120,113,108,0.85)','rgba(168,162,158,0.85)','rgba(87,83,78,0.85)','rgba(214,211,209,0.85)'],
    gradient: 'from-slate-500 to-slate-700', ringColor: '#475569', bgMid: '#1e293b', bgMidLight: '#e2e8f0',
  },
  sunset: {
    name: 'Sunset', label: 'Dusk', primary: '#ea580c', secondary: '#9333ea', accent: '#f59e0b',
    recurring: { border: '#fb923c', bg: 'rgba(251,146,60,0.08)', bar: 'rgba(234,88,12,0.75)' },
    nonRecurring: { border: '#c084fc', bg: 'rgba(192,132,252,0.08)', bar: 'rgba(147,51,234,0.75)' },
    pie: ['rgba(234,88,12,0.85)','rgba(147,51,234,0.85)','rgba(245,158,11,0.85)','rgba(251,146,60,0.85)','rgba(192,132,252,0.85)','rgba(249,115,22,0.85)','rgba(168,85,247,0.85)','rgba(253,186,116,0.85)','rgba(126,34,206,0.85)','rgba(217,70,239,0.85)'],
    gradient: 'from-orange-500 to-purple-600', ringColor: '#ea580c', bgMid: '#7c2d12', bgMidLight: '#fed7aa',
  },
  midnight: {
    name: 'Midnight', label: 'Night', primary: '#1e3a8a', secondary: '#312e81', accent: '#38bdf8',
    recurring: { border: '#60a5fa', bg: 'rgba(96,165,250,0.08)', bar: 'rgba(30,58,138,0.75)' },
    nonRecurring: { border: '#818cf8', bg: 'rgba(129,140,248,0.08)', bar: 'rgba(49,46,129,0.75)' },
    pie: ['rgba(30,58,138,0.85)','rgba(49,46,129,0.85)','rgba(56,189,248,0.85)','rgba(96,165,250,0.85)','rgba(129,140,248,0.85)','rgba(14,165,233,0.85)','rgba(59,130,246,0.85)','rgba(99,102,241,0.85)','rgba(37,99,235,0.85)','rgba(147,197,253,0.85)'],
    gradient: 'from-blue-800 to-indigo-900', ringColor: '#1e3a8a', bgMid: '#172554', bgMidLight: '#bfdbfe',
  },
  forest: {
    name: 'Forest', label: 'Nature', primary: '#166534', secondary: '#15803d', accent: '#84cc16',
    recurring: { border: '#4ade80', bg: 'rgba(74,222,128,0.08)', bar: 'rgba(22,101,52,0.75)' },
    nonRecurring: { border: '#bef264', bg: 'rgba(190,242,100,0.08)', bar: 'rgba(21,128,61,0.75)' },
    pie: ['rgba(22,101,52,0.85)','rgba(21,128,61,0.85)','rgba(132,204,22,0.85)','rgba(74,222,128,0.85)','rgba(190,242,100,0.85)','rgba(34,197,94,0.85)','rgba(101,163,13,0.85)','rgba(163,230,53,0.85)','rgba(134,239,172,0.85)','rgba(77,124,15,0.85)'],
    gradient: 'from-green-700 to-lime-500', ringColor: '#166534', bgMid: '#14532d', bgMidLight: '#bbf7d0',
  },
  royal: {
    name: 'Royal', label: 'Luxury', primary: '#1d4ed8', secondary: '#ca8a04', accent: '#facc15',
    recurring: { border: '#60a5fa', bg: 'rgba(96,165,250,0.08)', bar: 'rgba(29,78,216,0.75)' },
    nonRecurring: { border: '#fde047', bg: 'rgba(253,224,71,0.08)', bar: 'rgba(202,138,4,0.75)' },
    pie: ['rgba(29,78,216,0.85)','rgba(202,138,4,0.85)','rgba(250,204,21,0.85)','rgba(96,165,250,0.85)','rgba(253,224,71,0.85)','rgba(59,130,246,0.85)','rgba(234,179,8,0.85)','rgba(37,99,235,0.85)','rgba(245,158,11,0.85)','rgba(191,219,254,0.85)'],
    gradient: 'from-blue-700 to-yellow-500', ringColor: '#1d4ed8', bgMid: '#1e3a8a', bgMidLight: '#dbeafe',
  },
  neon: {
    name: 'Neon', label: 'Cyber', primary: '#2563eb', secondary: '#22c55e', accent: '#ec4899',
    recurring: { border: '#38bdf8', bg: 'rgba(56,189,248,0.08)', bar: 'rgba(37,99,235,0.75)' },
    nonRecurring: { border: '#4ade80', bg: 'rgba(74,222,128,0.08)', bar: 'rgba(34,197,94,0.75)' },
    pie: ['rgba(37,99,235,0.85)','rgba(34,197,94,0.85)','rgba(236,72,153,0.85)','rgba(168,85,247,0.85)','rgba(6,182,212,0.85)','rgba(132,204,22,0.85)','rgba(14,165,233,0.85)','rgba(99,102,241,0.85)','rgba(244,63,94,0.85)','rgba(253,224,71,0.85)'],
    gradient: 'from-blue-600 via-fuchsia-500 to-lime-400', ringColor: '#2563eb', bgMid: '#172554', bgMidLight: '#bfdbfe',
  },
  arctic: {
    name: 'Arctic', label: 'Ice', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#1d4ed8',
    recurring: { border: '#7dd3fc', bg: 'rgba(125,211,252,0.08)', bar: 'rgba(14,165,233,0.75)' },
    nonRecurring: { border: '#bae6fd', bg: 'rgba(186,230,253,0.08)', bar: 'rgba(56,189,248,0.75)' },
    pie: ['rgba(14,165,233,0.85)','rgba(56,189,248,0.85)','rgba(29,78,216,0.85)','rgba(125,211,252,0.85)','rgba(186,230,253,0.85)','rgba(59,130,246,0.85)','rgba(96,165,250,0.85)','rgba(147,197,253,0.85)','rgba(224,242,254,0.85)','rgba(2,132,199,0.85)'],
    gradient: 'from-sky-400 to-blue-700', ringColor: '#0ea5e9', bgMid: '#0c4a6e', bgMidLight: '#e0f2fe',
  },
  galaxy: {
    name: 'Galaxy', label: 'Space', primary: '#312e81', secondary: '#4338ca', accent: '#06b6d4',
    recurring: { border: '#818cf8', bg: 'rgba(129,140,248,0.08)', bar: 'rgba(49,46,129,0.75)' },
    nonRecurring: { border: '#22d3ee', bg: 'rgba(34,211,238,0.08)', bar: 'rgba(67,56,202,0.75)' },
    pie: ['rgba(49,46,129,0.85)','rgba(67,56,202,0.85)','rgba(99,102,241,0.85)','rgba(6,182,212,0.85)','rgba(168,85,247,0.85)','rgba(129,140,248,0.85)','rgba(34,211,238,0.85)','rgba(59,130,246,0.85)','rgba(192,132,252,0.85)','rgba(147,197,253,0.85)'],
    gradient: 'from-indigo-900 via-purple-700 to-cyan-500', ringColor: '#312e81', bgMid: '#1e1b4b', bgMidLight: '#ddd6fe',
  },
  ruby: {
    name: 'Ruby', label: 'Bold', primary: '#991b1b', secondary: '#dc2626', accent: '#ef4444',
    recurring: { border: '#f87171', bg: 'rgba(248,113,113,0.08)', bar: 'rgba(153,27,27,0.75)' },
    nonRecurring: { border: '#fca5a5', bg: 'rgba(252,165,165,0.08)', bar: 'rgba(220,38,38,0.75)' },
    pie: ['rgba(153,27,27,0.85)','rgba(220,38,38,0.85)','rgba(239,68,68,0.85)','rgba(248,113,113,0.85)','rgba(252,165,165,0.85)','rgba(185,28,28,0.85)','rgba(244,63,94,0.85)','rgba(127,29,29,0.85)','rgba(254,202,202,0.85)','rgba(239,68,68,0.65)'],
    gradient: 'from-red-800 to-rose-500', ringColor: '#991b1b', bgMid: '#7f1d1d', bgMidLight: '#fecaca',
  },
};

const STORAGE_KEY  = 'chart-theme';
const EVENT_NAME   = 'chart-theme-change';

// Apply theme CSS variables to :root so the whole page responds
function applyThemeToCss(t) {
  if (!t) return;
  const root = document.documentElement;
  const toRgb = (hex) => {
    const h = (hex || '#000000').replace('#','');
    return parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) + ',' + parseInt(h.slice(4,6),16);
  };

  // Darken a hex color by mixing with black for light mode text
  const darken = (hex, amount) => {
    const h = (hex || '#000000').replace('#','');
    const r = Math.max(0, parseInt(h.slice(0,2),16) - amount);
    const g = Math.max(0, parseInt(h.slice(2,4),16) - amount);
    const b = Math.max(0, parseInt(h.slice(4,6),16) - amount);
    return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
  };

  const primary   = t.primary   || '#7c3aed';
  const secondary = t.secondary || '#ec4899';
  const bgMid     = t.bgMid     || '#1e1b4b';
  const bgLight   = t.bgMidLight|| '#ddd6fe';

  root.style.setProperty('--theme-primary',        primary);
  root.style.setProperty('--theme-secondary',      secondary);
  root.style.setProperty('--theme-accent',         t.accent    || '#06b6d4');
  root.style.setProperty('--theme-ring',           t.ringColor || primary);
  root.style.setProperty('--theme-bg-mid',         bgMid);
  root.style.setProperty('--theme-bg-light',       bgLight);
  root.style.setProperty('--theme-primary-rgb',    toRgb(primary));
  root.style.setProperty('--theme-secondary-rgb',  toRgb(secondary));
  root.style.setProperty('--theme-bg-mid-rgb',     toRgb(bgMid));

  // Light mode specific — very dark text derived from primary, visible borders
  const lightText    = darken(primary, 80);   // very dark shade of primary
  const lightSubtext = darken(primary, 50);   // dark shade for subtitles
  const lightBorder  = bgLight;              // use the light bg-mid as border tint
  root.style.setProperty('--theme-light-text',    lightText);
  root.style.setProperty('--theme-light-subtext', lightSubtext);
  root.style.setProperty('--theme-light-border',  lightBorder);
  root.style.setProperty('--theme-light-card',    '#ffffff');
  root.style.setProperty('--theme-bg-light-rgb',  toRgb(bgLight));
}

export function useChartTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'violet'; } catch { return 'violet'; }
  });

  // Apply CSS variables on first mount
  useEffect(() => {
    const t = CHART_THEMES[themeKey] || CHART_THEMES.violet;
    applyThemeToCss(t);
  }, []);

  // Listen for theme changes from ANY other instance on the page
  useEffect(() => {
    const handler = (e) => setThemeKey(e.detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const theme = CHART_THEMES[themeKey] || CHART_THEMES.violet;

  const setTheme = useCallback((key) => {
    setThemeKey(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
    const t = CHART_THEMES[key] || CHART_THEMES.violet;
    applyThemeToCss(t);
    // Broadcast to all other useChartTheme instances so they re-render
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: key }));
  }, []);

  return { theme, themeKey, setTheme, themes: CHART_THEMES };
}