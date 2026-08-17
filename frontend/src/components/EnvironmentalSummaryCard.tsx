'use client';

import React from 'react';
import { FileText, Compass, TrendingUp, ShieldCheck, Layers } from 'lucide-react';
import { LocationExplanationResponse } from '../lib/types';

interface EnvironmentalSummaryCardProps {
  explanations: LocationExplanationResponse | null;
  loading: boolean;
}

export const EnvironmentalSummaryCard: React.FC<EnvironmentalSummaryCardProps> = ({
  explanations,
  loading,
}) => {
  if (loading || !explanations) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-64 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Generating environmental summary report...</div>
      </div>
    );
  }

  const { location_name, summary, current_condition, historical_trend, forecast_outlook, methodology_note } = explanations;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-eco-border/60 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-eco-cyan" />
          <h2 className="text-lg font-bold text-eco-text">Environmental Assessment Report ({location_name})</h2>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Deterministic Engine (No LLM)
        </span>
      </div>

      {/* Executive Summary Paragraph */}
      <div className="bg-eco-bg border border-eco-border rounded-xl p-4 text-sm font-medium text-eco-text leading-relaxed font-sans shadow-inner">
        "{summary}"
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Current Condition */}
        <div className="bg-eco-bg p-4 rounded-xl border border-eco-border space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-eco-cyan flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Current Condition
          </span>
          <p className="text-xs text-eco-muted leading-relaxed font-sans">
            {current_condition}
          </p>
        </div>

        {/* Historical Trend */}
        <div className="bg-eco-bg p-4 rounded-xl border border-eco-border space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-eco-accent flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Historical Analytics Trend
          </span>
          <p className="text-xs text-eco-muted leading-relaxed font-sans">
            {historical_trend}
          </p>
        </div>

        {/* Forecast Outlook */}
        <div className="bg-eco-bg p-4 rounded-xl border border-eco-border space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-eco-blue flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Multi-Horizon Forecast Outlook
          </span>
          <p className="text-xs text-eco-muted leading-relaxed font-sans">
            {forecast_outlook}
          </p>
        </div>
      </div>

      <div className="text-[11px] text-eco-muted border-t border-eco-border/40 pt-3 italic">
        {methodology_note}
      </div>
    </div>
  );
};
