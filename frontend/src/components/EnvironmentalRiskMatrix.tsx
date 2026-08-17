'use client';

import React from 'react';
import { RiskAssessmentResponse } from '../lib/types';
import { Flame, ShieldCheck, AlertCircle } from 'lucide-react';

interface EnvironmentalRiskMatrixProps {
  riskAssessment: RiskAssessmentResponse | null;
}

export const EnvironmentalRiskMatrix: React.FC<EnvironmentalRiskMatrixProps> = ({ riskAssessment }) => {
  if (!riskAssessment) return null;

  const {
    compounding_risk_score,
    risk_tier,
    color,
    recommended_action,
    exceeded_rules_count,
    total_evaluated_rules,
    critical_rules_count,
    warning_rules_count,
    attribution_notice,
  } = riskAssessment;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg relative overflow-hidden space-y-4">
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-eco-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-eco-text">EcoTrend Compounding Environmental Risk Index</h3>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                PROJECT_DEFINED_METHODOLOGY
              </span>
            </div>
            <p className="text-xs text-eco-muted">{attribution_notice}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-3xl font-black font-mono text-eco-text">{compounding_risk_score}</span>
            <span className="text-xs text-eco-muted font-bold block uppercase">/ 100 Risk</span>
          </div>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-eco-bg" style={{ backgroundColor: color }}>
            {risk_tier}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
        <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
          <span className="text-eco-muted font-bold block mb-1">Standards Exceeded</span>
          <span className="text-lg font-mono font-bold text-eco-text">
            {exceeded_rules_count} / {total_evaluated_rules} Rules
          </span>
        </div>

        <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
          <span className="text-eco-muted font-bold block mb-1">Severity Breakdown</span>
          <span className="text-xs font-mono font-bold text-rose-400">
            {critical_rules_count} Critical · {warning_rules_count} Warning
          </span>
        </div>

        <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
          <span className="text-eco-muted font-bold block mb-1">Recommended Action</span>
          <span className="text-xs text-eco-text line-clamp-2">{recommended_action}</span>
        </div>
      </div>
    </div>
  );
};
