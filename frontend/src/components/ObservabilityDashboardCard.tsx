'use client';

import React from 'react';
import { ObservabilityOverviewResponse, SourceHealthItem, IngestionJobItem } from '../lib/types';
import { Activity, Server, Database, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, Cpu } from 'lucide-react';

interface ObservabilityDashboardCardProps {
  overview: ObservabilityOverviewResponse | null;
  loading: boolean;
  onOpenAlertsModal: () => void;
}

export const ObservabilityDashboardCard: React.FC<ObservabilityDashboardCardProps> = ({
  overview,
  loading,
  onOpenAlertsModal,
}) => {
  if (loading) {
    return (
      <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg animate-pulse h-64 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-eco-cyan animate-spin" />
      </div>
    );
  }

  if (!overview) return null;

  const { system_health, infrastructure_health, sources_summary, active_alerts, recent_jobs, all_sources } = overview;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-6">
      {/* Top Header & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-eco-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-eco-text">Platform Observability & Operational Reliability</h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Phase 11
              </span>
            </div>
            <p className="text-xs text-eco-muted font-medium">Real-time system health, source reliability & ingestion job tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAlertsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-eco-bg hover:bg-eco-hover border border-eco-border text-xs font-bold text-amber-400 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Active Alerts ({active_alerts.length})</span>
          </button>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
              system_health === 'HEALTHY'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            }`}
          >
            SYSTEM: {system_health}
          </span>
        </div>
      </div>

      {/* Infrastructure Readiness & Sources Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-eco-cyan" />
            <span className="text-eco-muted font-bold">TimescaleDB:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 uppercase">{infrastructure_health.database || 'OK'}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="text-eco-muted font-bold">Redis Cache:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 uppercase">{infrastructure_health.redis || 'OK'}</span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Healthy Data Sources:</span>
          <span className="font-mono font-bold text-eco-text">
            {sources_summary.healthy} / {sources_summary.total}
          </span>
        </div>

        <div className="bg-eco-bg p-3.5 rounded-xl border border-eco-border flex items-center justify-between">
          <span className="text-eco-muted font-bold">Active Incidents:</span>
          <span className="font-mono font-bold text-amber-400">{active_alerts.length} Alerts</span>
        </div>
      </div>

      {/* 6-Domain Source Health Matrix */}
      <div>
        <h4 className="text-xs font-bold text-eco-muted uppercase tracking-wider mb-3">Environmental Data Sources Reliability Matrix</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {all_sources.map((src) => (
            <div key={src.source} className="bg-eco-bg border border-eco-border/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-eco-text text-xs">{src.source} ({src.domain.toUpperCase()})</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    src.status === 'HEALTHY'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}
                >
                  {src.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-eco-muted">
                <div>Vol (24h): <strong className="text-eco-text">{src.record_volume_24h}</strong></div>
                <div>Reject: <strong className="text-eco-text">{src.rejection_rate_percent}%</strong></div>
                <div>Latency: <strong className="text-eco-text">{src.latency_ms ? `${src.latency_ms}ms` : 'N/A'}</strong></div>
                <div>Stale: <strong className="text-eco-text">{src.stale_data_duration_hours}h</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
