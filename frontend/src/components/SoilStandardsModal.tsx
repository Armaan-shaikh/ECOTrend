'use client';

import React, { useEffect, useState } from 'react';
import { fetchSoilStandardsInfo } from '../lib/api';
import { StandardsInfoResponse } from '../lib/types';
import { X, ShieldCheck, FileText, Scale, Sprout } from 'lucide-react';

interface SoilStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoilStandardsModal: React.FC<SoilStandardsModalProps> = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState<StandardsInfoResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSoilStandardsInfo().then(setInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-eco-amber" />
            <h3 className="text-base font-bold text-eco-text">EcoTrend Soil Quality Methodology & Standards Reference</h3>
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
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300">
            <h4 className="font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Official Reference Thresholds vs EcoTrend Methodology</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              Official reference thresholds are sourced from **US EPA Ecological Soil Screening Levels (Eco-SSL)**, **EU Sewage Sludge Directive (86/278/EEC)**, and **FAO-ISRIC World Soil Guidelines**. The 0–100 sub-score curves and weighting scheme represent EcoTrend&apos;s project-defined scoring methodology and do not constitute an official EPA/FAO index.
            </p>
          </div>

          {/* Reference Types */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm">Reference Categories & Frameworks</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Toxicological Screening</span>
                </div>
                <p className="text-[11px] text-eco-muted">US EPA Eco-SSL conservative screening limits protective of soil flora and fauna.</p>
              </div>

              <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Scale className="w-4 h-4" />
                  <span>Regulatory Limit</span>
                </div>
                <p className="text-[11px] text-eco-muted">EU Directive 86/278/EEC & EPA UST regulatory cleanup thresholds.</p>
              </div>

              <div className="bg-eco-bg p-3 rounded-xl border border-eco-border">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Sprout className="w-4 h-4" />
                  <span>Agronomic Guideline</span>
                </div>
                <p className="text-[11px] text-eco-muted">FAO-ISRIC benchmarks for soil organic carbon, pH, and electrical conductivity.</p>
              </div>
            </div>
          </div>

          {/* Standards Table */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm">Supported Soil Metrics & Reference Standards</h4>
            <div className="overflow-x-auto border border-eco-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-eco-bg border-b border-eco-border text-eco-muted text-[11px]">
                    <th className="p-3">Metric</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Reference Source</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eco-border text-[11px]">
                  {info &&
                    Object.values(info.standards).map((s) => (
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

          {/* Score Categories */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm">Soil Quality Score Classifications (0–100)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {info &&
                info.score_categories.map((c) => (
                  <div key={c.category} className="bg-eco-bg p-3 rounded-xl border border-eco-border flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <div>
                      <div className="font-bold text-eco-text text-xs">{c.category} ({c.min_score}–{c.max_score})</div>
                      <div className="text-[10px] text-eco-muted line-clamp-1">{c.health_impact}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
