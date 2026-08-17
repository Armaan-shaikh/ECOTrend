'use client';

import React from 'react';
import { MetricSubScore } from '../lib/types';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface SubScoreCardsProps {
  subscores: MetricSubScore[];
}

export const SubScoreCards: React.FC<SubScoreCardsProps> = ({ subscores }) => {
  if (!subscores || subscores.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-eco-cyan" />
          Pollutant Metric Sub-Score Breakdown
        </h3>
        <span className="text-xs text-eco-muted font-mono">
          WHO 2021 / US EPA Breakpoints
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {subscores.map((sub) => {
          const isAvail = sub.is_available;
          return (
            <div
              key={sub.metric}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                isAvail
                  ? 'bg-eco-card border-eco-border hover:border-eco-cyan/50'
                  : 'bg-eco-bg border-eco-border opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-eco-text">{sub.metric}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    isAvail
                      ? sub.score >= 75
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : sub.score >= 60
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                      : 'bg-eco-bg text-eco-muted'
                  }`}
                >
                  {isAvail ? sub.category : 'N/A'}
                </span>
              </div>

              <div className="my-1">
                <div className="text-xl font-extrabold text-eco-text font-mono">
                  {isAvail ? sub.score : '—'}
                  <span className="text-xs font-normal text-eco-muted"> / 100</span>
                </div>
                <div className="text-[11px] text-eco-muted font-mono">
                  {isAvail ? `${sub.raw_value} ${sub.unit}` : 'Missing'}
                </div>
              </div>

              <div className="border-t border-eco-border/50 pt-2 mt-2 flex items-center justify-between text-[10px] text-eco-muted">
                <span>Weight: {(sub.weight * 100).toFixed(0)}%</span>
                <span>{sub.contribution_pct > 0 ? `${sub.contribution_pct}%` : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
