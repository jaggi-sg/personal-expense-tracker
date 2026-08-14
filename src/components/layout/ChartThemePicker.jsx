// src/components/layout/ChartThemePicker.jsx
// Renamed to "Theme" — applies to all pages via useChartTheme broadcast

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';
import { CHART_THEMES, useChartTheme } from '../../hooks/useChartTheme';

const ChartThemePicker = () => {
  const { themeKey, setTheme, theme } = useChartTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Get swatches from the current theme's pie colors or primary/secondary/accent
  const swatches = (t) => {
    if (t.pie && t.pie.length >= 3) return [t.pie[0], t.pie[1], t.pie[2]];
    return [t.primary || '#7c3aed', t.secondary || '#ec4899', t.accent || '#06b6d4'];
  };

  const current = CHART_THEMES[themeKey] || CHART_THEMES.violet;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 transition-all"
        title="Switch theme"
      >
        <Palette className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        <div className="flex gap-0.5">
          {swatches(current).map((c, i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
          ))}
        </div>
        <span className="text-white/60 text-xs hidden sm:inline">{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-[100] p-3 w-52">
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2 px-1">Theme</p>
          <div className="space-y-0.5 max-h-[calc(100vh-120px)] overflow-y-auto">
            {Object.entries(CHART_THEMES).map(([key, t]) => {
              const sw = swatches(t);
              const isActive = themeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => { setTheme(key); setOpen(false); }}
                  className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ' +
                    (isActive ? 'bg-white/12' : 'hover:bg-white/6')}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-0.5 shrink-0">
                      {sw.map((c, i) => (
                        <span key={i} className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                      ))}
                    </div>
                    <div>
                      <p className={'text-xs font-medium ' + (isActive ? 'text-white' : 'text-white/70')}>{t.name}</p>
                      <p className="text-white/30 text-[10px]">{t.label}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartThemePicker;