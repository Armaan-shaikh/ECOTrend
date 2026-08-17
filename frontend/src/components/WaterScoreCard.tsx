'use client';

import React from 'react';
import { Droplet, Info, ShieldCheck, FileText } from 'lucide-react';
import { WaterQualityScoreResponse } from '../lib/types';

interface WaterScoreCardProps {
  waterScore: WaterQualityScoreResponse | null;
  loading: boolean;
  onOpenMethodology: () => void;
}

export const WaterScoreCard: React.FC<WaterScoreCardProps> = ({
  waterScore,
  loading,
  onOpenMethodology,
}) => {
  if (loading || !waterScore) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-64 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Calculating Water Quality Health Score...</div>
      </div>
    );
  }

  const { overall_water_score, category, color, health_impact, data_coverage_percent, primary_water_driver, explanation } = waterScore;

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_water_score / 100) * circumference;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-eco-cyan" />
          <h2 className="text-base font-bold text-eco-text">Water Quality Health Score</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-eco-muted bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
            Coverage: {data_coverage_percent}%
          </span>

          <button
            onClick={onOpenMethodology}
            className="p-1.5 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-muted hover:text-eco-cyan transition"
            title="View Water Methodology & WHO/EPA/USGS Standards"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Circular Gauge (4 Cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-eco-border"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-3xl font-black text-eco-text tracking-tight font-mono">
                {overall_water_score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-eco-muted">
                / 100 Water Score
              </span>
            </div>
          </div>

          <div
            className="mt-3 px-3 py-1 rounded-full text-xs font-bold border"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}
          >
            {category} Water Quality
          </div>
        </div>

        {/* Executive Summary Box (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-3 bg-eco-bg border border-eco-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-eco-cyan uppercase tracking-wider">
            <FileText className="w-4 h-4 text-eco-cyan" />
            Freshwater Quality Summary
          </div>

          <p className="text-sm font-medium text-eco-text leading-relaxed font-sans">
            "{explanation}"
          </p>

          <div className="border-t border-eco-border/60 pt-2.5 mt-1 flex flex-wrap items-center justify-between text-xs text-eco-muted gap-2">
            <span>Primary Driver: <strong className="text-eco-rose">{primary_water_driver}</strong></span>
            <span className="text-[11px] font-mono text-eco-muted">EcoTrend Water Methodology v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
