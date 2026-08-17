'use client';

import React from 'react';
import { Calendar, Eye, Award } from 'lucide-react';

interface WaterForecastControlsProps {
  selectedHorizon: string;
  showBaseline: boolean;
  showImprovement: boolean;
  showWorsening: boolean;
  showCI: boolean;
  championModel: string;
  onSelectHorizon: (h: string) => void;
  onToggleBaseline: () => void;
  onToggleImprovement: () => void;
  onToggleWorsening: () => void;
  onToggleCI: () => void;
  onOpenScorecard: () => void;
}

export const WaterForecastControls: React.FC<WaterForecastControlsProps> = ({
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
    { key: '6_MONTHS', label: '6 Months' },
    { key: '1_YEAR', label: '1 Year' },
    { key: '3_YEARS', label: '3 Years' },
    { key: '5_YEARS', label: '5 Years' },
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
      {/* Forecast Horizon Selector Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-eco-muted mr-1">
          <Calendar className="w-4 h-4 text-eco-cyan" />
          <span>Forecast Horizon:</span>
        </div>
        <div className="flex items-center bg-eco-bg p-1 rounded-xl border border-eco-border">
          {horizons.map((h) => (
            <button
              key={h.key}
              onClick={() => onSelectHorizon(h.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedHorizon === h.key
                  ? 'bg-eco-cyan text-eco-bg shadow-sm'
                  : 'text-eco-muted hover:text-eco-text'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={onToggleBaseline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
            showBaseline
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-eco-bg text-eco-muted border-eco-border opacity-60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>🔵 Baseline</span>
        </button>

        <button
          onClick={onToggleImprovement}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
            showImprovement
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-eco-bg text-eco-muted border-eco-border opacity-60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>🟢 Improvement</span>
        </button>

        <button
          onClick={onToggleWorsening}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
            showWorsening
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-eco-bg text-eco-muted border-eco-border opacity-60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>🔴 Worsening</span>
        </button>

        <button
          onClick={onToggleCI}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
            showCI
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              : 'bg-eco-bg text-eco-muted border-eco-border opacity-60'
          }`}
        >
          95% CI
        </button>

        <button
          onClick={onOpenScorecard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-cyan text-xs font-semibold transition"
          title="View Model Backtesting Leaderboard & Performance"
        >
          <Award className="w-3.5 h-3.5 text-eco-amber" />
          <span>Champion: {championModel}</span>
        </button>
      </div>
    </div>
  );
};
