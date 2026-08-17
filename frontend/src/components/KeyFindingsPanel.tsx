'use client';

import React from 'react';
import { Award, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { LocationExplanationResponse } from '../lib/types';

interface KeyFindingsPanelProps {
  explanations: LocationExplanationResponse | null;
  loading: boolean;
}

export const KeyFindingsPanel: React.FC<KeyFindingsPanelProps> = ({ explanations, loading }) => {
  if (loading || !explanations) return null;

  const { key_findings, warnings, data_quality_note } = explanations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {/* Key Findings List (7 Cols) */}
      <div className="md:col-span-7 bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
        <div className="flex items-center gap-2 border-b border-eco-border pb-3">
          <Award className="w-5 h-5 text-eco-amber" />
          <h3 className="text-base font-bold text-eco-text">Prioritized Environmental Insights</h3>
        </div>

        <div className="space-y-2.5 flex-1">
          {key_findings.map((finding, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-eco-bg border border-eco-border flex items-start gap-2.5 text-xs text-eco-text">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{finding}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-eco-muted border-t border-eco-border/50 pt-2.5 flex items-center justify-between">
          <span>{data_quality_note}</span>
          <span className="font-mono text-[11px]">Ranked by analytical priority</span>
        </div>
      </div>

      {/* Warnings & Anomaly Caveats (5 Cols) */}
      <div className="md:col-span-5 bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
        <div className="flex items-center gap-2 border-b border-eco-border pb-3">
          <AlertTriangle className="w-5 h-5 text-eco-rose" />
          <h3 className="text-base font-bold text-eco-text">Anomaly & Quality Warnings</h3>
        </div>

        <div className="space-y-2.5 flex-1">
          {warnings.length === 0 ? (
            <div className="p-4 rounded-xl bg-eco-bg border border-eco-border text-xs text-eco-muted flex items-center gap-2">
              <Info className="w-4 h-4 text-eco-cyan" />
              <span>No statistical anomaly spikes or coverage warnings flagged for this location.</span>
            </div>
          ) : (
            warnings.map((warn, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{warn}</span>
              </div>
            ))
          )}
        </div>

        <div className="text-[11px] text-eco-muted border-t border-eco-border/50 pt-2.5">
          Anomalies are flagged via rolling Z-score limits (|Z| &gt; 2.5).
        </div>
      </div>
    </div>
  );
};
