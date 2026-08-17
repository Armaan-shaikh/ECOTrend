'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ForecastProjectionResponse, HistoricalAnalyticsSummary } from '../lib/types';
import { TrendingUp, Award, Zap } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastProjectionResponse | null;
  historical: HistoricalAnalyticsSummary | null;
  loading: boolean;
  showBaseline: boolean;
  showImprovement: boolean;
  showWorsening: boolean;
  showCI: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecast,
  historical,
  loading,
  showBaseline,
  showImprovement,
  showWorsening,
  showCI,
}) => {
  if (loading || !forecast) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-96 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Running walk-forward backtest & projections...</div>
      </div>
    );
  }

  const { projections, champion_model, metric, unit, horizon } = forecast;

  // Build combined dataset: historical points + future forecast points
  const historicalData = (historical?.seasonality.timestamps || []).map((ts, idx) => ({
    date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    observed: historical?.seasonality.observed[idx],
    isForecast: false,
  }));

  const futureData = projections.map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    baseline: p.baseline_value,
    improvement: p.improvement_value,
    worsening: p.worsening_value,
    ci_lower: p.ci_95_lower,
    ci_range: [p.ci_95_lower, p.ci_95_upper],
    isForecast: true,
  }));

  const chartData = [...historicalData, ...futureData];
  const horizonLabel = horizon.replace('_', ' ');

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-eco-cyan" />
            <h2 className="text-lg font-bold text-eco-text">Multi-Scenario Forecast Projections ({horizonLabel})</h2>
          </div>
          <p className="text-xs text-eco-muted mt-0.5">
            Probabilistic forward projections for <span className="text-eco-cyan font-bold">{metric}</span> ({unit})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-eco-bg border border-eco-border px-3 py-1.5 rounded-xl text-xs font-mono">
          <Award className="w-4 h-4 text-eco-amber" />
          <span className="text-eco-muted">Champion Model:</span>
          <span className="text-eco-text font-bold">{champion_model}</span>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121E2D',
                borderColor: '#1E2D40',
                borderRadius: '12px',
                color: '#F3F4F6',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

            {/* Historical Observed Series */}
            <Line
              type="monotone"
              dataKey="observed"
              name={`Historical Observed (${unit})`}
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={false}
            />

            {/* Confidence Interval Ribbon */}
            {showCI && (
              <Area
                type="monotone"
                dataKey="ci_range"
                name="95% Confidence Interval Ribbon"
                fill="url(#ciGradient)"
                stroke="transparent"
              />
            )}

            {/* 🔵 Current Baseline Line */}
            {showBaseline && (
              <Line
                type="monotone"
                dataKey="baseline"
                name="🔵 Current Baseline Scenario"
                stroke="#3B82F6"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* 🟢 Policy Improvement Line */}
            {showImprovement && (
              <Line
                type="monotone"
                dataKey="improvement"
                name="🟢 Policy Improvement Scenario"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
              />
            )}

            {/* 🔴 Urban Degradation Line */}
            {showWorsening && (
              <Line
                type="monotone"
                dataKey="worsening"
                name="🔴 Urban Degradation Scenario"
                stroke="#F43F5E"
                strokeWidth={2.5}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
