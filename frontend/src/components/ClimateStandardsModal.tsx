'use client';

import React, { useEffect, useState } from 'react';
import { fetchClimateStandardsInfo, fetchEmissionsStandardsInfo } from '../lib/api';
import { StandardsInfoResponse } from '../lib/types';
import { X, ShieldCheck, FileText, Sun, Flame } from 'lucide-react';

interface ClimateStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClimateStandardsModal: React.FC<ClimateStandardsModalProps> = ({ isOpen, onClose }) => {
  const [climateInfo, setClimateInfo] = useState<StandardsInfoResponse | null>(null);
  const [emissionsInfo, setEmissionsInfo] = useState<StandardsInfoResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchClimateStandardsInfo().then(setClimateInfo);
      fetchEmissionsStandardsInfo().then(setEmissionsInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-eco-text">EcoTrend Climate & Emissions Methodology & Standards Reference</h3>
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
              <span>Official Reference Standards vs EcoTrend Methodology</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              Official reference thresholds are sourced from **WMO Climatological Normals Guidelines (WMO-No. 1203)**, **NOAA Climate Extremes Index**, and **IPCC AR6 1.5°C Paris Agreement Net-Zero Pathways**. The 0–100 sub-score curves and weighting scheme represent EcoTrend&apos;s project-defined scoring methodology and do not constitute an official WMO or IPCC index.
            </p>
          </div>

          {/* Climate Standards Table */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Supported Climate Metrics & WMO/NOAA Standards</span>
            </h4>
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
                  {climateInfo &&
                    Object.values(climateInfo.standards).map((s) => (
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

          {/* Emissions Standards Table */}
          <div>
            <h4 className="font-bold text-eco-cyan mb-2 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Supported Greenhouse Gas Metrics & IPCC Paris 1.5°C Targets</span>
            </h4>
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
                  {emissionsInfo &&
                    Object.values(emissionsInfo.standards).map((s) => (
                      <tr key={s.metric} className="hover:bg-eco-bg/50">
                        <td className="p-3 font-bold text-eco-text">{s.metric}</td>
                        <td className="p-3 font-mono text-eco-muted">{s.unit}</td>
                        <td className="p-3 text-rose-400 font-semibold">{s.standard_reference}</td>
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
