'use client';

import React from 'react';
import { ShieldCheck, Info, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { AggregateEHSResponse } from '../lib/types';

interface EHSGaugeCardProps {
  ehsData: AggregateEHSResponse | null;
  loading: boolean;
  onOpenMethodology: () => void;
}

export const EHSGaugeCard: React.FC<EHSGaugeCardProps> = ({
  ehsData,
  loading,
  onOpenMethodology,
}) => {
  if (loading || !ehsData) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 h-64 flex items-center justify-center animate-pulse">
        <div className="text-eco-muted text-sm font-semibold">Calculating Environmental Health Score...</div>
      </div>
    );
  }

  const { overall_ehs, category, color, health_impact, data_coverage_percent, primary_pollutant_driver, explanation } = ehsData;

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_ehs / 100) * circumference;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-eco-accent" />
          <h2 className="text-base font-bold text-eco-text">Environmental Health Score (EHS)</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-eco-muted bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
            Coverage: {data_coverage_percent}%
          </span>

          <button
            onClick={onOpenMethodology}
            className="p-1.5 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-muted hover:text-eco-cyan transition"
            title="View Scoring Methodology & WHO/EPA References"
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
                {overall_ehs}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-eco-muted">
                / 100 EHS
              </span>
            </div>
          </div>

          <div
            className="mt-3 px-3 py-1 rounded-full text-xs font-bold border"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}
          >
            {category} Air Quality
          </div>
        </div>

        {/* Deterministic Summary Explanation Box (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-3 bg-eco-bg border border-eco-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-eco-cyan uppercase tracking-wider">
            <FileText className="w-4 h-4 text-eco-cyan" />
            Deterministic Executive Summary (No LLM)
          </div>

          <p className="text-sm font-medium text-eco-text leading-relaxed font-sans">
            "{explanation}"
          </p>

          <div className="border-t border-eco-border/60 pt-2.5 mt-1 flex flex-wrap items-center justify-between text-xs text-eco-muted gap-2">
            <span>Primary Driver: <strong className="text-eco-rose">{primary_pollutant_driver}</strong></span>
            <span className="text-[11px] font-mono text-eco-muted">EcoTrend Methodology v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
