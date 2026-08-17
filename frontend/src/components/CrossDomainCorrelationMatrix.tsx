'use client';

import React from 'react';
import { CrossDomainCorrelationItem } from '../lib/types';
import { Network, AlertCircle, CheckCircle } from 'lucide-react';

interface CrossDomainCorrelationMatrixProps {
  correlations: CrossDomainCorrelationItem[];
  disclaimer: string;
}

export const CrossDomainCorrelationMatrix: React.FC<CrossDomainCorrelationMatrixProps> = ({
  correlations,
  disclaimer,
}) => {
  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-eco-cyan" />
          <h3 className="text-base font-bold text-eco-text">Cross-Domain Statistical Correlation Matrix</h3>
        </div>
        <div className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Dual Pearson (r) & Spearman (ρ) · n ≥ 10 Threshold
        </div>
      </div>

      {/* Causation Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-200 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span><strong>Scientific Causation Warning:</strong> {disclaimer}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlations.map((c, idx) => (
          <div key={idx} className="bg-eco-bg border border-eco-border rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-eco-text">
                {c.metric_a} <span className="text-eco-muted">↔</span> {c.metric_b}
              </span>
              {c.is_statistically_significant ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  <span>p &lt; 0.05</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-eco-muted bg-eco-card px-2 py-0.5 rounded-full border border-eco-border">
                  p ≥ 0.05
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-eco-card p-2.5 rounded-lg border border-eco-border text-center">
              <div>
                <span className="text-[10px] font-bold text-eco-muted block uppercase">Sample Size</span>
                <span className="text-sm font-mono font-bold text-eco-text">n={c.sample_size}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-eco-muted block uppercase">Pearson r</span>
                <span className="text-sm font-mono font-bold text-eco-cyan">{c.pearson_r !== null ? c.pearson_r : '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-eco-muted block uppercase">Spearman ρ</span>
                <span className="text-sm font-mono font-bold text-eco-amber">{c.spearman_rho !== null ? c.spearman_rho : '—'}</span>
              </div>
            </div>

            <p className="text-xs text-eco-muted leading-relaxed">{c.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
