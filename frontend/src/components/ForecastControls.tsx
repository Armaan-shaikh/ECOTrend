'use client';

import React from 'react';
import { Calendar, Eye, ShieldAlert, Award } from 'lucide-react';

interface ForecastControlsProps {
  selectedHorizon: string; // '6_MONTHS' | '1_YEAR' | '3_YEARS' | '5_YEARS'
  showBaseline: boolean;
  showImprovement: boolean;
  showWorsening: boolean;
  showCI: boolean;
  championModel: string;
  onSelectHorizon: (horizon: string) => void;
  onToggleBaseline: () => void;
  onToggleImprovement: () => void;
  onToggleWorsening: () => void;
  onToggleCI: () => void;
  onOpenScorecard: () => void;
}

export const ForecastControls: React.FC<ForecastControlsProps> = ({
  selectedHorizon,
  showBaseline,
  showImprovement,
  showWorsening,
  showCI,
  championModel,
  onSelectHorizon,
  onToggleBaseline,
  onToggleImprovement,
  onToggleWorsening,
  onToggleCI,
  onOpenScorecard,
}) => {
  const horizons = [
    { id: '6_MONTHS', label: '6 Months' },
    { id: '1_YEAR', label: '1 Year' },
    { id: '3_YEARS', label: '3 Years' },
    { id: '5_YEARS', label: '5 Years' },
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Horizon Selector Buttons */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-eco-muted flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-eco-cyan" />
          Select Projection Horizon
        </label>
        <div className="flex flex-wrap gap-1.5 bg-eco-bg p-1 rounded-xl border border-eco-border">
          {horizons.map((h) => {
            const isSelected = selectedHorizon === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onSelectHorizon(h.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-eco-cyan text-eco-bg shadow-md shadow-cyan-500/20'
                    : 'text-eco-muted hover:text-eco-text hover:bg-eco-card'
                }`}
              >
                {h.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Toggles */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-eco-muted flex items-center gap-1.5 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-eco-accent" />
          Probabilistic Scenarios
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleBaseline}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              showBaseline
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-eco-bg text-eco-muted border-eco-border opacity-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            🔵 Current Baseline
          </button>

          <button
            onClick={onToggleImprovement}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              showImprovement
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-eco-bg text-eco-muted border-eco-border opacity-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            🟢 Policy Improvement
          </button>

          <button
            onClick={onToggleWorsening}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              showWorsening
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-eco-bg text-eco-muted border-eco-border opacity-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            🔴 Urban Degradation
          </button>

          <button
            onClick={onToggleCI}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showCI
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-eco-bg text-eco-muted border-eco-border'
            }`}
          >
            CI Bands (80%/95%)
          </button>
        </div>
      </div>

      {/* Model Scorecard Trigger */}
      <button
        onClick={onOpenScorecard}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-eco-hover hover:bg-eco-border border border-eco-border text-xs font-bold text-eco-cyan transition duration-200"
      >
        <Award className="w-4 h-4 text-eco-amber" />
        <span>Backtest Scorecard</span>
      </button>
    </div>
  );
};
