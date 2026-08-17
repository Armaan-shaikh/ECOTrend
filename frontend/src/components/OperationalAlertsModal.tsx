'use client';

import React, { useState } from 'react';
import { OperationalAlertItem } from '../lib/types';
import { acknowledgeOperationalAlert, resolveOperationalAlert } from '../lib/api';
import { X, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface OperationalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: OperationalAlertItem[];
  onRefreshAlerts: () => void;
}

export const OperationalAlertsModal: React.FC<OperationalAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onRefreshAlerts,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAcknowledge = async (id: string) => {
    setUpdatingId(id);
    try {
      await acknowledgeOperationalAlert(id);
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setUpdatingId(id);
    try {
      await resolveOperationalAlert(id);
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-eco-text">Operational & Data Source Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-eco-text">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-eco-muted">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <p>All data sources & operational services operating normally. No active alerts.</p>
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-eco-text">{alt.source} ({alt.domain.toUpperCase()})</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      {alt.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-eco-muted">{alt.detected_at}</span>
                </div>

                <div className="bg-eco-card p-3 rounded-lg border border-eco-border/60 font-mono text-[11px] space-y-1">
                  <div><span className="text-eco-muted">Condition:</span> <strong className="text-eco-text">{alt.condition}</strong></div>
                  <div><span className="text-eco-muted">Observed:</span> <span className="text-amber-400 font-bold">{alt.observed_value}</span></div>
                  <div><span className="text-eco-muted">Expected:</span> <span className="text-emerald-400">{alt.expected_condition}</span></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-eco-muted font-mono">STATUS: {alt.status}</span>

                  <div className="flex items-center gap-2">
                    {alt.status === 'OPEN' && (
                      <button
                        onClick={() => handleAcknowledge(alt.id)}
                        disabled={updatingId === alt.id}
                        className="px-3 py-1 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-cyan font-bold transition disabled:opacity-50"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(alt.id)}
                        disabled={updatingId === alt.id}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 transition disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
