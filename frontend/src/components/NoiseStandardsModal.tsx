'use client';

import React, { useEffect, useState } from 'react';
import { fetchNoiseStandardsInfo } from '../lib/api';
import { StandardsInfoResponse } from '../lib/types';
import { X, ShieldCheck, Volume2, AlertCircle } from 'lucide-react';

interface NoiseStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoiseStandardsModal: React.FC<NoiseStandardsModalProps> = ({ isOpen, onClose }) => {
  const [noiseInfo, setNoiseInfo] = useState<StandardsInfoResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNoiseStandardsInfo().then(setNoiseInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-eco-text">EcoTrend Acoustic Disturbance Methodology & Standards Reference</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans text-eco-text">
          {/* Attribution Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Project-Defined Methodology & Applicability Warning</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              The 0–100 Acoustic Disturbance Index is a **PROJECT_DEFINED_METHODOLOGY** based on measured daily noise disturbance report counts. Score normalization curves do NOT represent official WHO or EPA regulatory limits.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Contextual dBA sound level limits (WHO/EPA) are displayed below for scientific context ONLY and do NOT apply directly to incident counts.</span>
            </div>
          </div>

          {/* Incident Standards Table */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm">Supported Incident Metrics</h4>
            <div className="overflow-x-auto border border-eco-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-eco-bg border-b border-eco-border text-eco-muted text-[11px]">
                    <th className="p-3">Metric</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Reference Standard</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eco-border text-[11px]">
                  {noiseInfo &&
                    Object.values(noiseInfo.standards).map((s) => (
                      <tr key={s.metric} className="hover:bg-eco-bg/50">
                        <td className="p-3 font-bold text-eco-text">{s.metric}</td>
                        <td className="p-3 font-mono text-eco-muted">{s.unit}</td>
                        <td className="p-3 text-eco-cyan font-semibold">{s.standard_reference}</td>
                        <td className="p-3 font-mono font-bold text-eco-amber">{(s.weight * 100).toFixed(0)}%</td>
                        <td className="p-3 text-eco-muted">{s.weight_rationale}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
