'use client';

import React from 'react';
import { Layers, Info, ShieldCheck } from 'lucide-react';

export const ScenarioExplanationCard: React.FC = () => {
  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-eco-purple" />
          <h3 className="text-base font-bold text-eco-text">What Do The Forecast Scenarios Mean?</h3>
        </div>
        <span className="text-xs text-eco-muted font-mono bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
          Non-Certainty Modeling
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* 🔵 Baseline */}
        <div className="p-4 rounded-xl bg-eco-bg border border-blue-500/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            🔵 Current Baseline Projection
          </div>
          <p className="text-eco-text leading-relaxed">
            Extrapolates observed historical statistical trends and seasonal cycles into future horizons using champion algorithms (SARIMA / Holt-Winters).
          </p>
          <p className="text-eco-muted italic text-[11px] border-t border-blue-500/20 pt-2">
            "Assumes historical emission rates and weather patterns continue without major policy intervention."
          </p>
        </div>

        {/* 🟢 Policy Improvement */}
        <div className="p-4 rounded-xl bg-eco-bg border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            🟢 Policy Improvement Scenario
          </div>
          <p className="text-eco-text leading-relaxed">
            Models clean energy transitions, industrial emission controls, and vehicle electrification (progressive mitigation curve over horizon).
          </p>
          <p className="text-eco-muted italic text-[11px] border-t border-emerald-500/20 pt-2">
            "Modeled policy scenario for planning; should not be interpreted as a guaranteed outcome."
          </p>
        </div>

        {/* 🔴 Urban Degradation */}
        <div className="p-4 rounded-xl bg-eco-bg border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            🔴 Urban Degradation Scenario
          </div>
          <p className="text-eco-text leading-relaxed">
            Models accelerated urban expansion, increased traffic congestion, and industrial escalation (progressive degradation curve over horizon).
          </p>
          <p className="text-eco-muted italic text-[11px] border-t border-rose-500/20 pt-2">
            "Modeled degradation scenario for risk assessment; not a prediction that deterioration will necessarily occur."
          </p>
        </div>
      </div>
    </div>
  );
};
