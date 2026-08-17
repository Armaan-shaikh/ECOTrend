'use client';

import React from 'react';
import { DecisionOverviewResponse, DecisionRecommendationItem, InterventionOptionItem } from '../lib/types';
import { Brain, ShieldAlert, CheckCircle, Sliders, ArrowRight, Info, AlertTriangle, Layers } from 'lucide-react';

interface DecisionSupportDashboardProps {
  decisionData: DecisionOverviewResponse | null;
  loading: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onOpenAudit: (id: string) => void;
  onOpenScenarioModal: () => void;
}

export const DecisionSupportDashboard: React.FC<DecisionSupportDashboardProps> = ({
  decisionData,
  loading,
  onAcknowledge,
  onResolve,
  onOpenAudit,
  onOpenScenarioModal,
}) => {
  if (loading) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg animate-pulse h-64 flex items-center justify-center">
        <Brain className="w-6 h-6 text-eco-cyan animate-spin" />
      </div>
    );
  }

  if (!decisionData) return null;

  const { system_decision_status, total_active_recommendations, critical_recommendations_count, high_recommendations_count, recommendations, interventions_summary } = decisionData;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-eco-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-eco-text">Advanced Decision Automation & Adaptive Intelligence</h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Phase 13
              </span>
            </div>
            <p className="text-xs text-eco-muted font-medium">Prioritized recommendations, adaptive scoring & explainable intervention options</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-eco-bg hover:bg-eco-hover border border-eco-border text-xs font-bold text-purple-400 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Interventions</span>
          </button>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
              system_decision_status === 'OPTIMAL'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            }`}
          >
            STATUS: {system_decision_status}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Active Recommendations:</span>
          <span className="font-mono font-bold text-eco-text text-sm">{total_active_recommendations}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Critical Priorities:</span>
          <span className="font-mono font-bold text-rose-400 text-sm">{critical_recommendations_count}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">High Priorities:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">{high_recommendations_count}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Provenance:</span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            DECISION_SUPPORT
          </span>
        </div>
      </div>

      {/* Prioritized Recommendations Matrix */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-eco-muted uppercase tracking-wider">Prioritized Environmental Recommendations</h4>

        {recommendations.length === 0 ? (
          <div className="bg-eco-bg p-6 rounded-xl border border-eco-border text-center text-eco-muted text-xs">
            No active environmental recommendations. All domains operating within optimal threshold parameters.
          </div>
        ) : (
          recommendations.map((rec: DecisionRecommendationItem) => (
            <div
              key={rec.id}
              className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-3 shadow-sm hover:border-eco-cyan/40 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-eco-text text-sm">{rec.title}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-eco-card text-eco-cyan border border-eco-border uppercase">
                    {rec.domain}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      rec.priority_tier === 'CRITICAL'
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        : rec.priority_tier === 'HIGH'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    PRIORITY: {rec.priority_score} ({rec.priority_tier})
                  </span>
                </div>
              </div>

              <p className="text-xs text-eco-muted font-sans leading-relaxed">{rec.rationale}</p>

              <div className="bg-eco-card p-3 rounded-lg border border-eco-border/60 text-xs space-y-1.5">
                <span className="font-bold text-eco-text text-[11px] uppercase tracking-wider block">Recommended Actions:</span>
                <ul className="list-disc list-inside space-y-1 text-eco-muted">
                  {rec.recommended_actions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onOpenAudit(rec.id)}
                  className="text-xs text-eco-cyan font-bold hover:underline flex items-center gap-1"
                >
                  <span>View 5-Step Decision Audit Chain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {rec.status === 'ACTIVE' && (
                    <button
                      onClick={() => onAcknowledge(rec.id)}
                      className="px-3 py-1 rounded-lg bg-eco-card hover:bg-eco-hover border border-eco-border text-xs font-bold text-eco-cyan transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {rec.status !== 'RESOLVED' && (
                    <button
                      onClick={() => onResolve(rec.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-400 transition"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actionable Interventions Summary */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-eco-muted uppercase tracking-wider">Evaluated Actionable Intervention Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interventions_summary.map((intv: InterventionOptionItem) => (
            <div key={intv.id} className="bg-eco-bg border border-eco-border p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-eco-text text-xs">{intv.name}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{intv.estimated_cepi_improvement} CEPI pts
                </span>
              </div>
              <p className="text-[11px] text-eco-muted">{intv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
