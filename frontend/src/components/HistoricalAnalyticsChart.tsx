'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { HistoricalAnalyticsSummary } from '../lib/types';
import { LineChart, AlertCircle } from 'lucide-react';

interface HistoricalAnalyticsChartProps {
  analytics: HistoricalAnalyticsSummary | null;
  loading: boolean;
}

export const HistoricalAnalyticsChart: React.FC<HistoricalAnalyticsChartProps> = ({
  analytics,
  loading,
}) => {
  if (loading || !analytics) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-96 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Computing historical analysis...</div>
      </div>
    );
  }

  const { seasonality, linear_trend, anomalies, metric, unit } = analytics;

  // Build chart dataset
  const data = seasonality.timestamps.map((ts, idx) => {
    const obs = seasonality.observed[idx];
    // Trendline calculation: intercept + slope * day_index
    const trendlineVal = Number((linear_trend.intercept + linear_trend.slope * idx).toFixed(2));
    const dateFormatted = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      timestamp: ts,
      date: dateFormatted,
      observed: obs,
      trendline: trendlineVal,
    };
  });

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-eco-accent" />
            <h2 className="text-lg font-bold text-eco-text">Historical Time-Series Analytics</h2>
          </div>
          <p className="text-xs text-eco-muted mt-0.5">
            Observational measurements for <span className="text-eco-cyan font-bold">{analytics.location_name}</span> ({metric} in {unit})
          </p>
        </div>

        {anomalies.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{anomalies.length} Anomaly Flags Detected</span>
          </div>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorObserved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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

            {/* Historical Observations Line */}
            <Line
              type="monotone"
              dataKey="observed"
              name={`Observed ${metric} (${unit})`}
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#10B981' }}
              activeDot={{ r: 6, fill: '#10B981' }}
            />

            {/* Linear Regression Trend Line */}
            <Line
              type="linear"
              dataKey="trendline"
              name={`Linear Regression Slope (${linear_trend.direction})`}
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Highlight Anomaly Dots */}
            {anomalies.map((anom, idx) => {
              const matchedPoint = data.find((d) => d.timestamp === anom.timestamp);
              if (!matchedPoint) return null;
              return (
                <ReferenceDot
                  key={idx}
                  x={matchedPoint.date}
                  y={anom.value}
                  r={7}
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
