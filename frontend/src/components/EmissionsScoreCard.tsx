'use client';

import React from 'react';
import { EmissionsQualityScoreResponse } from '../lib/types';
import { Flame, ShieldCheck, Database } from 'lucide-react';

interface EmissionsScoreCardProps {
  emissionsScore: EmissionsQualityScoreResponse | null;
  loading: boolean;
}

export const EmissionsScoreCard: React.FC<EmissionsScoreCardProps> = ({
  emissionsScore,
  loading,
}) => {
  if (loading || !emissionsScore) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-56 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Calculating Emissions Sustainability Index...</div>
      </div>
    );
  }

  const {
    overall_emissions_score,
    category,
    color,
    health_impact,
    data_coverage_percent,
    data_type,
    source_provenance,
    metric_subscores,
  } = emissionsScore;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-eco-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-eco-text">Emissions Sustainability Index</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-eco-bg" style={{ backgroundColor: color }}>
                {category}
              </span>
            </div>
            <p className="text-xs text-eco-muted mt-0.5">IPCC AR6 1.5°C Paris Agreement Net-Zero Target Alignment</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-eco-muted">
          <Database className="w-3.5 h-3.5 text-eco-cyan" />
          <span>{data_type} ({source_provenance})</span>
        </div>
      </div>

      {/* Sub-Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metric_subscores.map((sub) => (
          <div key={sub.metric} className="bg-eco-bg border border-eco-border rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-eco-text block">{sub.title}</span>
              <span className="text-[10px] text-eco-muted block mt-0.5">{sub.standard}</span>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-eco-text font-mono">
                {sub.raw_value !== null ? sub.raw_value : '—'}
              </span>
              <span className="text-xs font-bold text-eco-muted">{sub.unit}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold border-t border-eco-border/60 pt-2">
              <span className="text-eco-muted">Score:</span>
              <span className="font-mono text-eco-cyan">{sub.score}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
