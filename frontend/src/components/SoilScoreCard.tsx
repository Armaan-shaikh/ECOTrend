'use client';

import React from 'react';
import { SoilQualityScoreResponse } from '../lib/types';
import { Layers, ShieldCheck, Database, FileText } from 'lucide-react';

interface SoilScoreCardProps {
  soilScore: SoilQualityScoreResponse | null;
  loading: boolean;
  onOpenMethodology: () => void;
}

export const SoilScoreCard: React.FC<SoilScoreCardProps> = ({
  soilScore,
  loading,
  onOpenMethodology,
}) => {
  if (loading || !soilScore) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-56 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Calculating Soil Quality Health Score...</div>
      </div>
    );
  }

  const {
    overall_soil_score,
    category,
    color,
    health_impact,
    data_coverage_percent,
    primary_soil_driver,
    data_type,
    source_provenance,
    explanation,
  } = soilScore;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_soil_score / 100) * circumference;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Glow Accent */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Left Column: Score Gauge & Category */}
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1E2D40"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-eco-text font-mono">{overall_soil_score}</span>
            <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-eco-text">Soil Quality Health Score</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-eco-bg"
              style={{ backgroundColor: color }}
            >
              {category}
            </span>

            {/* Data Provenance Badge */}
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Database className="w-3 h-3" />
              <span>{data_type}</span>
            </span>
          </div>

          <p className="text-xs text-eco-muted max-w-md line-clamp-2">{health_impact}</p>
        </div>
      </div>

      {/* Right Column: Key Driver, Data Coverage, and Provenance */}
      <div className="flex flex-col items-start md:items-end justify-between gap-3 w-full md:w-auto border-t md:border-t-0 border-eco-border pt-4 md:pt-0">
        <div className="text-left md:text-right">
          <div className="text-[11px] font-bold text-eco-muted uppercase tracking-wider">Primary Driver</div>
          <div className="text-sm font-extrabold text-eco-amber">{primary_soil_driver}</div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-[11px] font-bold text-eco-muted uppercase tracking-wider">Data Coverage & Source</div>
          <div className="text-xs font-mono font-bold text-eco-text">
            {data_coverage_percent}% · <span className="text-eco-muted">{source_provenance}</span>
          </div>
        </div>

        <button
          onClick={onOpenMethodology}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-cyan text-xs font-semibold transition shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>EcoTrend Soil Methodology v1.0</span>
        </button>
      </div>
    </div>
  );
};
