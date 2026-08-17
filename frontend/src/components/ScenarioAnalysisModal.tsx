'use client';

import React, { useState } from 'react';
import { ScenarioResponseItem } from '../lib/types';
import { runScenarioSimulation } from '../lib/api';
import { X, Sliders, Sparkles, TrendingUp, CheckCircle, Info } from 'lucide-react';

interface ScenarioAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
}

export const ScenarioAnalysisModal: React.FC<ScenarioAnalysisModalProps> = ({
  isOpen,
  onClose,
  locationId,
}) => {
  const [airChange, setAirChange] = useState<number>(10);
  const [waterChange, setWaterChange] = useState<number>(8);
  const [soilChange, setSoilChange] = useState<number>(0);
  const [climateChange, setClimateChange] = useState<number>(5);
  const [emissionsChange, setEmissionsChange] = useState<number>(12);
  const [noiseChange, setNoiseChange] = useState<number>(15);

  const [simulationResult, setSimulationResult] = useState<ScenarioResponseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const interventions = {
        air_score_change: airChange,
        water_score_change: waterChange,
        soil_score_change: soilChange,
        climate_score_change: climateChange,
        emissions_score_change: emissionsChange,
        noise_score_change: noiseChange
      };

      const res = await runScenarioSimulation(locationId, interventions);
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-eco-text">What-If Scenario Decision Support Simulator</h3>
              <p className="text-xs text-eco-muted font-medium">Model hypothetical policy & engineering interventions</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-eco-text">
          {/* Sliders Grid */}
          <div className="space-y-4">
            <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Set Hypothetical Domain Interventions (Score Shift)</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-eco-bg p-4 rounded-xl border border-eco-border font-mono">
              <div>
                <label className="flex justify-between mb-1">
                  <span>Air Quality (+pts):</span>
                  <strong className="text-eco-cyan">+{airChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={airChange}
                  onChange={(e) => setAirChange(Number(e.target.value))}
                  className="w-full accent-eco-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>Water Quality (+pts):</span>
                  <strong className="text-eco-cyan">+{waterChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={waterChange}
                  onChange={(e) => setWaterChange(Number(e.target.value))}
                  className="w-full accent-eco-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>Soil Quality (+pts):</span>
                  <strong className="text-eco-amber">+{soilChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={soilChange}
                  onChange={(e) => setSoilChange(Number(e.target.value))}
                  className="w-full accent-eco-amber"
                />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>Climate Resilience (+pts):</span>
                  <strong className="text-purple-400">+{climateChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={climateChange}
                  onChange={(e) => setClimateChange(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>Emissions Reduction (+pts):</span>
                  <strong className="text-emerald-400">+{emissionsChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={emissionsChange}
                  onChange={(e) => setEmissionsChange(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>Acoustic Disturbance (+pts):</span>
                  <strong className="text-purple-400">+{noiseChange}</strong>
                </label>
                <input
                  type="range" min="0" max="30" value={noiseChange}
                  onChange={(e) => setNoiseChange(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-eco-cyan to-emerald-500 text-eco-bg font-bold text-xs shadow-lg hover:opacity-95 transition disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? 'Running Scenario Calculations...' : 'Execute What-If Simulation'}
            </button>
          </div>

          {/* Simulation Output */}
          {simulationResult && (
            <div className="bg-eco-bg border border-purple-500/30 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-eco-border pb-3">
                <div>
                  <h4 className="font-bold text-eco-text text-sm">Scenario Impact Results</h4>
                  <p className="text-[11px] text-eco-muted">Multi-Domain Composite Environmental Performance Index (CEPI)</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  PROVENANCE: {simulationResult.provenance}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="bg-eco-card p-3 rounded-xl border border-eco-border">
                  <div className="text-eco-muted text-[10px]">Baseline CEPI</div>
                  <strong className="text-eco-text text-base">{simulationResult.baseline_cepi_score}</strong>
                </div>

                <div className="bg-eco-card p-3 rounded-xl border border-eco-border">
                  <div className="text-eco-muted text-[10px]">Projected CEPI</div>
                  <strong className="text-emerald-400 text-base">{simulationResult.projected_cepi_score}</strong>
                </div>

                <div className="bg-eco-card p-3 rounded-xl border border-eco-border">
                  <div className="text-eco-muted text-[10px]">CEPI Delta</div>
                  <strong className="text-purple-400 text-base">+{simulationResult.cepi_delta} pts</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-eco-muted text-[11px]">Domain-by-Domain Impact Breakdown</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono">
                  {simulationResult.domain_impacts.map((d) => (
                    <div key={d.domain} className="bg-eco-card p-2 rounded-lg border border-eco-border/60 flex justify-between">
                      <span className="uppercase text-eco-muted">{d.domain}:</span>
                      <strong className="text-emerald-400">+{d.delta} pts</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-[11px] text-purple-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Data Protection Guarantee:</strong> What-if scenario projections evaluate hypothetical intervention response curves for decision support and do not alter or overwrite historical database measurements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
