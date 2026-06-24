// src/components/analytics/AnomalyBanner.jsx

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { detectAnomalies } from '../../utils/anomalyDetection';

const fmt = (n) => '$' + n.toFixed(0);

const AnomalyBanner = ({ expenses }) => {
  const [expanded, setExpanded]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const anomalies = detectAnomalies(expenses, 2.0, 2);

  if (anomalies.length === 0 || dismissed) return null;

  const top = anomalies[0];

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-amber-300 font-semibold text-sm">
                {anomalies.length === 1
                  ? 'Unusual spend in ' + top.category
                  : anomalies.length + ' categories with unusual spend this month'}
              </p>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-wide">
                Anomaly
              </span>
            </div>

            {/* Single anomaly — show inline */}
            {anomalies.length === 1 && (
              <p className="text-amber-400/80 text-xs mt-0.5">
                {fmt(top.currentSpend)} this month vs avg {fmt(top.historicalAvg)} — {top.pctAbove}% above normal
              </p>
            )}

            {/* Multiple — show toggle */}
            {anomalies.length > 1 && (
              <div className="mt-2">
                <button onClick={() => setExpanded(o => !o)}
                  className="flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors">
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {expanded ? 'Hide details' : 'Show details'}
                </button>

                {expanded && (
                  <div className="mt-2 space-y-1.5">
                    {anomalies.map(a => (
                      <div key={a.category} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-white text-xs font-semibold">{a.category}</span>
                          <span className="text-amber-400/70 text-xs ml-2">
                            avg {fmt(a.historicalAvg)}/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-bold">{fmt(a.currentSpend)}</span>
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            +{a.pctAbove}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-300 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnomalyBanner;