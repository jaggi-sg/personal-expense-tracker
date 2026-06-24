// src/components/layout/ChartThemePicker.jsx

import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { CHART_THEMES } from '../../hooks/useChartTheme';

const SWATCHES = {
  violet:  ['#7c3aed', '#ec4899', '#06b6d4'],
  emerald: ['#059669', '#0891b2', '#84cc16'],
  amber:   ['#d97706', '#dc2626', '#f59e0b'],
};

const ChartThemePicker = ({ themeKey, setTheme }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-2.5 py-1.5 transition-all"
        title="Chart color theme"
      >
        <Palette className="w-3.5 h-3.5 text-purple-300" />
        <div className="flex gap-0.5">
          {SWATCHES[themeKey].map((c, i) => (
            <span key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-50 p-3 w-48"
          onMouseLeave={() => setOpen(false)}>
          <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-wide mb-2">Chart Theme</p>
          <div className="space-y-1">
            {Object.entries(CHART_THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => { setTheme(key); setOpen(false); }}
                className={'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ' +
                  (themeKey === key ? 'bg-white/10' : 'hover:bg-white/5')}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {SWATCHES[key].map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-medium">{t.name}</p>
                    <p className="text-purple-500 text-[10px]">{t.label}</p>
                  </div>
                </div>
                {themeKey === key && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartThemePicker;