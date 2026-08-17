'use client';

import React from 'react';
import { ComplianceEvaluationItem } from '../lib/types';
import { AlertTriangle, CheckCircle, Info, ExternalLink, ShieldAlert } from 'lucide-react';

interface ComplianceAlertsPanelProps {
  evaluations: ComplianceEvaluationItem[];
}

export const ComplianceAlertsPanel: React.FC<ComplianceAlertsPanelProps> = ({ evaluations }) => {
  const exceededCount = evaluations.filter((e) => e.is_exceeded).length;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-eco-text">Environmental Standards & Guidelines Evaluation</h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            {evaluations.length - exceededCount}/{evaluations.length} Compliant
          </span>
          {exceededCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
              {exceededCount} Exceeded
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {evaluations.map((ev) => {
          const isExceeded = ev.is_exceeded;
          const sev = ev.evaluation_severity;

          return (
            <div
              key={ev.rule_id}
              className={`border rounded-xl p-3.5 flex flex-col justify-between space-y-2 transition ${
                !isExceeded
                  ? 'bg-eco-bg/40 border-eco-border'
                  : sev === 'CRITICAL'
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : sev === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-eco-cyan/10 border-eco-cyan/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-eco-text block">
                    {ev.domain.toUpperCase()} · {ev.metric}
                  </span>
                  <span className="text-[10px] text-eco-muted block font-mono">{ev.averaging_period}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    !isExceeded
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : sev === 'CRITICAL'
                      ? 'text-rose-400 bg-rose-500/20 border-rose-500/40'
                      : 'text-amber-400 bg-amber-500/20 border-amber-500/40'
                  }`}
                >
                  {isExceeded ? ev.evaluation_severity : 'COMPLIANT'}
                </span>
              </div>

              <div className="bg-eco-card p-2 rounded-lg border border-eco-border/60 text-xs">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-eco-muted">Observed:</span>
                  <span className="font-bold text-eco-text">{ev.observed_value !== null ? `${ev.observed_value} ${ev.unit}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-baseline font-mono text-[11px] text-eco-muted mt-0.5">
                  <span>Threshold:</span>
                  <span>{ev.threshold} {ev.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-eco-muted pt-1">
                <span className="truncate max-w-[180px]">{ev.reference_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-eco-bg border border-eco-border font-mono font-bold">
                  {ev.reference_type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
