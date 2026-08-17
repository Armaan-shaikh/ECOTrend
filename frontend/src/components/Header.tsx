'use client';

import React from 'react';
import { Activity, ShieldCheck, Database, RefreshCw, Wind, Droplet, Layers, Sun, Volume2 } from 'lucide-react';
import { EnvironmentalDomain } from '../lib/types';

interface HeaderProps {
  domain: EnvironmentalDomain;
  onSelectDomain: (domain: EnvironmentalDomain) => void;
  onRefresh: () => void;
  onOpenAudit: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  domain,
  onSelectDomain,
  onRefresh,
  onOpenAudit,
  isRefreshing,
}) => {
  return (
    <header className="bg-eco-card border-b border-eco-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-accent via-eco-cyan to-eco-blue flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-eco-bg stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-eco-text">EcoTrend</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 7 · Multi-Domain
              </span>
            </div>
            <p className="text-xs text-eco-muted font-medium">
              Environmental Intelligence & Multi-Domain Platform
            </p>
          </div>
        </div>

        {/* Domain Switcher Buttons */}
        <div className="flex items-center bg-eco-bg p-1 rounded-xl border border-eco-border overflow-x-auto">
          <button
            onClick={() => onSelectDomain('air')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              domain === 'air'
                ? 'bg-eco-cyan text-eco-bg shadow-sm'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Air Quality
          </button>

          <button
            onClick={() => onSelectDomain('water')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              domain === 'water'
                ? 'bg-eco-cyan text-eco-bg shadow-sm'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            Water Quality
          </button>

          <button
            onClick={() => onSelectDomain('soil')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              domain === 'soil'
                ? 'bg-eco-cyan text-eco-bg shadow-sm'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Soil Quality
          </button>

          <button
            onClick={() => onSelectDomain('climate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              domain === 'climate'
                ? 'bg-eco-cyan text-eco-bg shadow-sm'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Climate & Emissions
          </button>

          <button
            onClick={() => onSelectDomain('noise')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              domain === 'noise'
                ? 'bg-eco-cyan text-eco-bg shadow-sm'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Noise Quality
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-eco-bg border border-eco-border text-xs text-eco-muted font-mono">
          <Database className="w-3.5 h-3.5 text-eco-cyan" />
          <span>PostgreSQL / TimescaleDB</span>
        </div>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-xs font-medium text-eco-text transition-all duration-200 hover:border-eco-cyan/50"
        >
          <ShieldCheck className="w-4 h-4 text-eco-amber" />
          <span>Data Quality Logs</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-accent hover:bg-emerald-600 text-eco-bg font-semibold text-xs transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Pipeline</span>
        </button>
      </div>
    </header>
  );
};
