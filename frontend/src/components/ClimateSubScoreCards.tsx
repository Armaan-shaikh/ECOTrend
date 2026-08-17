'use client';

import React from 'react';
import { MetricSubScore } from '../lib/types';
import { ShieldCheck, Sprout } from 'lucide-react';

interface ClimateSubScoreCardsProps {
  subscores: MetricSubScore[];
}

export const ClimateSubScoreCards: React.FC<ClimateSubScoreCardsProps> = ({ subscores }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {subscores.map((sub) => {
        const isAvail = sub.is_available;
        return (
          <div
            key={sub.metric}
            className={`bg-eco-card border border-eco-border rounded-2xl p-4 flex flex-col justify-between shadow-md transition ${
              !isAvail ? 'opacity-50' : 'hover:border-eco-cyan/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold text-eco-text block">{sub.title || sub.metric}</span>
                <span className="text-[10px] font-semibold text-eco-muted block">{sub.standard}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Sprout className="w-3 h-3" />
                <span>WMO Norms</span>
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-eco-text font-mono">
                  {isAvail && sub.raw_value !== null ? sub.raw_value : '—'}
                </span>
                <span className="text-xs font-bold text-eco-muted">{sub.unit}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-eco-bg rounded-full h-2 mt-2 border border-eco-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    sub.score >= 90
                      ? 'bg-emerald-500'
                      : sub.score >= 75
                      ? 'bg-cyan-500'
                      : sub.score >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${isAvail ? sub.score : 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold border-t border-eco-border/60 pt-2 mt-1">
              <span className="text-eco-muted">Sub-Score:</span>
              <span className="font-mono text-eco-cyan">{isAvail ? `${sub.score}/100` : 'UNAVAILABLE'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
