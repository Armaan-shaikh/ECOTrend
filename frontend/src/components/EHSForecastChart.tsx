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
} from 'recharts';
import { ForecastEHSResponse, HistoricalEHSPoint } from '../lib/types';
import { ShieldCheck, TrendingUp } from 'lucide-react';

interface EHSForecastChartProps {
  forecastEHS: ForecastEHSResponse | null;
  historicalEHS: HistoricalEHSPoint[];
  loading: boolean;
}

export const EHSForecastChart: React.FC<EHSForecastChartProps> = ({
  forecastEHS,
  historicalEHS,
  loading,
}) => {
  if (loading || !forecastEHS) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-80 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Generating forecast-linked EHS scores...</div>
      </div>
    );
  }

  const { projections, horizon } = forecastEHS;
  const horizonLabel = horizon.replace('_', ' ');

  // Combine historical EHS points + projected EHS points
  const histData = historicalEHS.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    historical_ehs: h.overall_ehs,
  }));

  const futData = projections.map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    baseline_ehs: p.baseline_ehs,
    improvement_ehs: p.improvement_ehs,
    worsening_ehs: p.worsening_ehs,
    ehs_ci_range: [p.ehs_ci_95_lower, p.ehs_ci_95_upper],
  }));

  const chartData = [...histData, ...futData];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-eco-accent" />
            <h3 className="text-base font-bold text-eco-text">Forecast-Linked Air Health Score Projections ({horizonLabel})</h3>
          </div>
          <p className="text-xs text-eco-muted mt-0.5">
            Converts Phase 2A scenario forecasts into projected 0–100 Environmental Health Scores
          </p>
        </div>

        <span className="text-xs font-semibold text-eco-cyan bg-eco-cyan/10 px-2.5 py-1 rounded-full border border-eco-cyan/20">
          EcoTrend Scoring v1.0
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="ehsCiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={[0, 100]} />
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

            <Line type="monotone" dataKey="historical_ehs" name="Historical EHS (0–100)" stroke="#9CA3AF" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="ehs_ci_range" name="95% EHS CI Ribbon" fill="url(#ehsCiGradient)" stroke="transparent" />
            <Line type="monotone" dataKey="baseline_ehs" name="🔵 Current Baseline EHS" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="improvement_ehs" name="🟢 Policy Improvement EHS" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="worsening_ehs" name="🔴 Urban Degradation EHS" stroke="#F43F5E" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
