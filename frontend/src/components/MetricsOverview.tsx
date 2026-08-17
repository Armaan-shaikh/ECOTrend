'use client';

import React from 'react';
import { TrendingDown, TrendingUp, Minus, Activity, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { HistoricalAnalyticsSummary } from '../lib/types';

interface MetricsOverviewProps {
  analytics: HistoricalAnalyticsSummary | null;
  loading: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-eco-card rounded-2xl border border-eco-border" />
        ))}
      </div>
    );
  }

  const { linear_trend, rate_of_change_percent, volatility, valid_observations, invalid_observations, suspect_observations, total_observations } = analytics;

  const isImproving = linear_trend.direction === 'IMPROVING';
  const isDegrading = linear_trend.direction === 'DEGRADING';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Linear Trend Card */}
      <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-eco-cyan/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-eco-cyan" />
            Linear Trend
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 border ${
              isImproving
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isDegrading
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isImproving ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : isDegrading ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {linear_trend.direction}
          </span>
        </div>
        <div className="text-2xl font-black text-eco-text tracking-tight mb-1 font-mono">
          {linear_trend.slope > 0 ? `+${linear_trend.slope}` : linear_trend.slope}{' '}
          <span className="text-xs font-normal text-eco-muted">{analytics.unit}/day</span>
        </div>
        <div className="text-xs text-eco-muted flex items-center justify-between border-t border-eco-border/50 pt-2.5 mt-2">
          <span>R² = {linear_trend.r_squared}</span>
          <span className="font-semibold">{linear_trend.annualized_change > 0 ? `+${linear_trend.annualized_change}` : linear_trend.annualized_change} {analytics.unit}/yr</span>
        </div>
      </div>

      {/* 2. Rate of Change Card */}
      <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-eco-accent/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-eco-accent" />
            Rate of Change
          </span>
          <span className="text-xs font-semibold text-eco-muted">Historical Window</span>
        </div>
        <div
          className={`text-2xl font-black tracking-tight mb-1 font-mono ${
            rate_of_change_percent <= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {rate_of_change_percent > 0 ? `+${rate_of_change_percent}%` : `${rate_of_change_percent}%`}
        </div>
        <div className="text-xs text-eco-muted border-t border-eco-border/50 pt-2.5 mt-2 flex items-center justify-between">
          <span>Baseline Start vs Present</span>
          <span className="text-eco-text font-semibold">{analytics.metric}</span>
        </div>
      </div>

      {/* 3. Volatility Index Card */}
      <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-eco-blue/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-eco-blue" />
            Rolling Volatility (CV)
          </span>
          <span className="text-xs font-mono font-semibold text-eco-blue bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {volatility.coefficient_of_variation}
          </span>
        </div>
        <div className="text-2xl font-black text-eco-text tracking-tight mb-1 font-mono">
          ±{volatility.std_dev}{' '}
          <span className="text-xs font-normal text-eco-muted">{analytics.unit}</span>
        </div>
        <div className="text-xs text-eco-muted border-t border-eco-border/50 pt-2.5 mt-2 flex items-center justify-between">
          <span>Min: {volatility.min_value}</span>
          <span>Max: {volatility.max_value}</span>
        </div>
      </div>

      {/* 4. Data Quality Audit Card */}
      <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-eco-amber/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-eco-amber" />
            Data Quality Audit
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {((valid_observations / (total_observations || 1)) * 100).toFixed(0)}% Valid
          </span>
        </div>
        <div className="text-2xl font-black text-eco-text tracking-tight mb-1 font-mono">
          {valid_observations}{' '}
          <span className="text-xs font-normal text-eco-muted">/ {total_observations} Points</span>
        </div>
        <div className="text-xs text-eco-muted border-t border-eco-border/50 pt-2.5 mt-2 flex items-center justify-between">
          <span className="text-rose-400 font-medium">{invalid_observations} Error Flags</span>
          <span className="text-amber-400 font-medium">{suspect_observations} Outliers</span>
        </div>
      </div>
    </div>
  );
};
