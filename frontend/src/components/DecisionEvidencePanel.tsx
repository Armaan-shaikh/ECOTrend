'use client';

import React, { useEffect, useState } from 'react';
import { DecisionAuditResponse, DecisionChainStepItem } from '../lib/types';
import { fetchDecisionAudit } from '../lib/api';
import { X, ShieldCheck, ArrowRight, CheckCircle, Info, FileText } from 'lucide-react';

interface DecisionEvidencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  recommendationId: string | null;
}

export const DecisionEvidencePanel: React.FC<DecisionEvidencePanelProps> = ({
  isOpen,
  onClose,
  recommendationId,
}) => {
  const [auditData, setAuditData] = useState<DecisionAuditResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && recommendationId) {
      loadAudit();
    }
  }, [isOpen, recommendationId]);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await fetchDecisionAudit(recommendationId || 'rec_comp_air_PM2.5_101');
      setAuditData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-eco-text">5-Step Decision Audit Trace & Provenance</h3>
              <p className="text-xs text-eco-muted font-medium">Transparent evidence chain from sensor observation to recommendation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-eco-text font-sans">
          {loading || !auditData ? (
            <div className="py-12 text-center text-eco-muted animate-pulse font-mono">
              Loading Decision Audit Chain...
            </div>
          ) : (
            <>
              {/* Title & Priority Badge */}
              <div className="bg-eco-bg p-4 rounded-xl border border-eco-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-bold text-eco-text text-sm">{auditData.title}</h4>
                  <p className="text-[11px] text-eco-muted font-mono">Domain: {auditData.domain.toUpperCase()} | Location: {auditData.location_id}</p>
                </div>
                <span className="font-mono font-bold text-eco-cyan bg-eco-card px-3 py-1 rounded-lg border border-eco-border">
                  PRIORITY SCORE: {auditData.priority_score} ({auditData.priority_tier})
                </span>
              </div>

              {/* 5-Step Chain Visualizer */}
              <div className="space-y-3">
                <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">5-Step Evidence Chain Pipeline</h4>

                <div className="space-y-2">
                  {auditData.decision_chain.map((step: DecisionChainStepItem) => (
                    <div key={step.step} className="bg-eco-bg border border-eco-border p-3.5 rounded-xl flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-eco-cyan/20 border border-eco-cyan/40 text-eco-cyan flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {step.step}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-eco-text text-xs uppercase">{step.phase}</span>
                          <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {step.provenance}
                          </span>
                        </div>
                        <p className="text-eco-muted text-xs font-mono">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-eco-card border border-eco-border p-3.5 rounded-xl text-[11px] text-eco-muted flex items-start gap-2">
                <Info className="w-4 h-4 text-eco-cyan shrink-0 mt-0.5" />
                <p>{auditData.legal_disclaimer}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
