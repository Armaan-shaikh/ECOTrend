'use client';

import React, { useEffect, useState } from 'react';
import { X, BookOpen, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { StandardsInfoResponse } from '../lib/types';
import { fetchStandardsInfo } from '../lib/api';

interface EHSMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EHSMethodologyModal: React.FC<EHSMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<StandardsInfoResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    const info = await fetchStandardsInfo();
    setData(info);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity flex justify-end">
      <div className="w-full max-w-xl bg-eco-card border-l border-eco-border h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-eco-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-eco-cyan" />
            <div>
              <h2 className="text-base font-bold text-eco-text">Scoring Methodology & Reference Standards</h2>
              <p className="text-xs text-eco-muted">EcoTrend Air Health Scoring Methodology v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-muted hover:text-eco-text transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Official Disclaimer Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Methodology & Attribution Notice
            </div>
            <p className="text-eco-text leading-relaxed">
              Official reference thresholds are sourced directly from official <strong>WHO 2021 Air Quality Guidelines</strong> and <strong>US EPA AQI Breakpoints</strong>.
            </p>
            <p className="text-eco-muted">
              The 0–100 normalization curves, domain weighting scheme, and aggregate EHS algorithms constitute <strong>EcoTrend's project-defined methodology</strong> and do not represent an official single-number index published by WHO or US EPA.
            </p>
          </div>

          {/* Metric Standards & Weight Rationale Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-eco-muted mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-eco-cyan" />
              Pollutant Thresholds & Weight Rationale
            </h3>

            <div className="space-y-2.5">
              {data &&
                Object.values(data.standards).map((st) => (
                  <div key={st.metric} className="p-3.5 rounded-xl bg-eco-bg border border-eco-border text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-eco-text">{st.metric} ({st.unit})</span>
                      <span className="text-eco-cyan bg-eco-cyan/10 px-2 py-0.5 rounded font-mono">
                        Weight: {(st.weight * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-eco-muted font-mono bg-eco-card p-2 rounded">
                      <span>WHO Annual: {st.who_annual} {st.unit}</span>
                      <span>WHO 24h: {st.who_24h} {st.unit}</span>
                      <span>EPA Good: {st.epa_good} {st.unit}</span>
                      <span>EPA Mod: {st.epa_moderate} {st.unit}</span>
                    </div>

                    <p className="text-[11px] text-eco-muted italic leading-normal">
                      "{st.weight_rationale}"
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Score Category Boundaries */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-eco-muted mb-2">
              Score Category Boundaries
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {data &&
                data.score_categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3 rounded-xl border flex flex-col gap-1 text-xs"
                    style={{ backgroundColor: `${cat.color}10`, borderColor: `${cat.color}30` }}
                  >
                    <div className="flex items-center justify-between font-bold" style={{ color: cat.color }}>
                      <span>{cat.category}</span>
                      <span className="font-mono text-[11px]">{cat.min_score}–{cat.max_score}</span>
                    </div>
                    <p className="text-[11px] text-eco-muted leading-tight">{cat.health_impact}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="border-t border-eco-border pt-4 mt-4 text-xs text-eco-muted flex items-center justify-between">
          <span>EcoTrend Methodology v1.0</span>
          <span className="text-eco-text font-mono">Air Quality EHS</span>
        </div>
      </div>
    </div>
  );
};
