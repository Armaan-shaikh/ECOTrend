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
import { ForecastWaterScoreResponse } from '../lib/types';
import { Droplet } from 'lucide-react';

interface WaterScoreForecastChartProps {
  forecastScore: ForecastWaterScoreResponse | null;
  loading: boolean;
}

export const WaterScoreForecastChart: React.FC<WaterScoreForecastChartProps> = ({
  forecastScore,
  loading,
}) => {
  if (loading || !forecastScore) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-80 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Generating forecast-linked Water Quality Scores...</div>
      </div>
    );
  }

  const { projections, horizon } = forecastScore;
  const horizonLabel = horizon.replace('_', ' ');

  const chartData = projections.map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    baseline_water_score: p.baseline_water_score,
    improvement_water_score: p.improvement_water_score,
    worsening_water_score: p.worsening_water_score,
    water_ci_range: [p.water_score_ci_95_lower, p.water_score_ci_95_upper],
  }));

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-eco-cyan" />
            <h3 className="text-base font-bold text-eco-text">Forecast-Linked Water Quality Score Projections ({horizonLabel})</h3>
          </div>
          <p className="text-xs text-eco-muted mt-0.5">
            Converts metric concentration scenario projections into 0–100 Water Quality Scores
          </p>
        </div>

        <span className="text-xs font-semibold text-eco-cyan bg-eco-cyan/10 px-2.5 py-1 rounded-full border border-eco-cyan/20">
          EcoTrend Water Methodology v1.0
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="waterScoreCiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
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

            <Area type="monotone" dataKey="water_ci_range" name="95% Water Score CI Ribbon" fill="url(#waterScoreCiGradient)" stroke="transparent" />
            <Line type="monotone" dataKey="baseline_water_score" name="🔵 Baseline Water Score" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="improvement_water_score" name="🟢 Policy Improvement Water Score" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="worsening_water_score" name="🔴 Urban Degradation Water Score" stroke="#F43F5E" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
