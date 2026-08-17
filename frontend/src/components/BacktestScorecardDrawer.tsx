'use client';

import React from 'react';
import { X, Award, CheckCircle2, BarChart2, ShieldCheck } from 'lucide-react';
import { ForecastProjectionResponse } from '../lib/types';

interface BacktestScorecardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: ForecastProjectionResponse | null;
}

export const BacktestScorecardDrawer: React.FC<BacktestScorecardDrawerProps> = ({
  isOpen,
  onClose,
  forecast,
}) => {
  if (!isOpen || !forecast) return null;

  const { champion_model, backtest_metrics, leaderboard, metric, unit } = forecast;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity flex justify-end">
      <div className="w-full max-w-lg bg-eco-card border-l border-eco-border h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-eco-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-eco-amber" />
            <div>
              <h2 className="text-base font-bold text-eco-text">Model Backtest Scorecard</h2>
              <p className="text-xs text-eco-muted">Walk-forward out-of-sample error evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-muted hover:text-eco-text transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Champion Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-eco-bg border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-eco-amber uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Automated Champion Selection
          </div>
          <div className="text-lg font-extrabold text-eco-text mb-2 font-mono">
            {champion_model}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-amber-500/20 pt-2 font-mono">
            <div>
              <span className="text-eco-muted block text-[10px]">RMSE</span>
              <span className="font-bold text-eco-text">{backtest_metrics.rmse}</span>
            </div>
            <div>
              <span className="text-eco-muted block text-[10px]">MAE</span>
              <span className="font-bold text-eco-text">{backtest_metrics.mae}</span>
            </div>
            <div>
              <span className="text-eco-muted block text-[10px]">MAPE</span>
              <span className="font-bold text-emerald-400">{backtest_metrics.mape_percent}%</span>
            </div>
          </div>
        </div>

        {/* Model Competition Leaderboard */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-eco-muted flex items-center gap-1.5 mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-eco-cyan" />
            Model Benchmark Competition
          </h3>

          {(leaderboard || []).map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col gap-2 transition ${
                item.is_champion
                  ? 'bg-eco-hover border-eco-cyan shadow-md shadow-cyan-500/10'
                  : 'bg-eco-bg border-eco-border opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-eco-text">{item.model_name}</span>
                {item.is_champion && (
                  <span className="text-[10px] font-bold bg-eco-cyan/10 text-eco-cyan border border-eco-cyan/30 px-2 py-0.5 rounded-full">
                    CHAMPION
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono border-t border-white/5 pt-2">
                <div>
                  <span className="text-eco-muted block text-[10px]">RMSE</span>
                  <span className="font-semibold text-eco-text">{item.rmse}</span>
                </div>
                <div>
                  <span className="text-eco-muted block text-[10px]">MAE</span>
                  <span className="font-semibold text-eco-text">{item.mae}</span>
                </div>
                <div>
                  <span className="text-eco-muted block text-[10px]">MAPE</span>
                  <span className="font-semibold text-eco-text">{item.mape_percent}%</span>
                </div>
                <div>
                  <span className="text-eco-muted block text-[10px]">R²</span>
                  <span className="font-semibold text-eco-cyan">{item.r_squared}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-eco-border pt-4 mt-4 text-xs text-eco-muted flex items-center justify-between">
          <span>Walk-Forward Cross-Validation</span>
          <span className="text-eco-text font-mono">Air Quality Engine</span>
        </div>
      </div>
    </div>
  );
};
