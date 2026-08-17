'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HistoricalAnalyticsSummary } from '../lib/types';
import { Layers, Sparkles } from 'lucide-react';

interface SeasonalityChartProps {
  analytics: HistoricalAnalyticsSummary | null;
  loading: boolean;
}

export const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ analytics, loading }) => {
  if (loading || !analytics) return null;

  const { seasonality, metric, unit } = analytics;
  if (!seasonality || seasonality.observed.length === 0) return null;

  const data = seasonality.timestamps.map((ts, idx) => {
    const dateFormatted = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: dateFormatted,
      observed: seasonality.observed[idx],
      trend: seasonality.trend[idx],
      seasonal: seasonality.seasonal[idx],
      residual: seasonality.residual[idx],
    };
  });

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-eco-purple" />
            <h3 className="text-base font-bold text-eco-text">STL Seasonality & Component Decomposition</h3>
          </div>
          <p className="text-xs text-eco-muted mt-0.5">
            Additive breakdown (Y_t = Trend_t + Seasonal_t + Residual_t)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              seasonality.has_seasonality
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-eco-bg text-eco-muted border-eco-border'
            }`}
          >
            {seasonality.has_seasonality ? 'Seasonality Detected' : 'Weak Seasonality'}
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />

            <Line type="monotone" dataKey="trend" name="Trend Component" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="seasonal" name="Seasonal Cycle" stroke="#06B6D4" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="residual" name="Residual Noise" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
