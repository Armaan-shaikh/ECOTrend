'use client';

import React from 'react';
import { PredictiveOverviewItem, DomainForecastItem } from '../lib/types';
import { TrendingUp, Sparkles, AlertTriangle, ShieldCheck, Sliders, LineChart, Cpu } from 'lucide-react';

interface PredictiveOverviewCardProps {
  predictiveData: PredictiveOverviewItem | null;
  loading: boolean;
  onOpenScenarioModal: () => void;
}

export const PredictiveOverviewCard: React.FC<PredictiveOverviewCardProps> = ({
  predictiveData,
  loading,
  onOpenScenarioModal,
}) => {
  if (loading) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg animate-pulse h-64 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!predictiveData) return null;

  const { overall_predictive_status, forecasted_cepi_score, projected_cepi_trend, active_forecasted_risks_count, domain_forecasts, forecasted_risks } = predictiveData;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-eco-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-eco-text">Predictive Environmental Intelligence & Decision Support</h3>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Phase 12
              </span>
            </div>
            <p className="text-xs text-eco-muted font-medium">Statistical multi-domain forecasting, predictive threshold risks & scenario analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-eco-cyan text-eco-bg font-bold text-xs shadow-md hover:opacity-90 transition active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate What-If Scenario</span>
          </button>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Forecasted CEPI Score:</span>
          <span className="font-mono font-bold text-base text-purple-400">{forecasted_cepi_score} / 100</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Projected Trend:</span>
          <span className="font-mono font-bold text-emerald-400 uppercase">{projected_cepi_trend}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Forecasted Threshold Risks:</span>
          <span className="font-mono font-bold text-amber-400">{active_forecasted_risks_count} Events</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Provenance:</span>
          <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            FORECAST
          </span>
        </div>
      </div>

      {/* Multi-Domain Forecast Cards */}
      <div>
        <h4 className="text-xs font-bold text-eco-muted uppercase tracking-wider mb-3">6-Domain Predictive Projections & Accuracy Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {domain_forecasts.map((f: DomainForecastItem) => {
            const latestPoint = f.projections[f.projections.length - 1];
            return (
              <div key={f.domain} className="bg-eco-bg border border-eco-border/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-eco-text text-xs uppercase">{f.domain} ({f.metric})</span>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                    {f.horizon}
                  </span>
                </div>

                <div className="bg-eco-card p-2.5 rounded-lg border border-eco-border/60 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-eco-muted">Projected Value:</span>
                    <strong className="text-eco-text">{latestPoint ? latestPoint.forecast_value : 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-eco-muted">
                    <span>95% Confidence Interval:</span>
                    <span>[{latestPoint ? latestPoint.lower_ci : 'N/A'}, {latestPoint ? latestPoint.upper_ci : 'N/A'}]</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-eco-muted font-mono pt-1">
                  <span>Model: <strong>{f.model_metadata.model_name.split(' ')[0]}</strong></span>
                  <span>MAE: <strong>{f.model_metadata.accuracy_metrics.mae}</strong> | RMSE: <strong>{f.model_metadata.accuracy_metrics.rmse}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
