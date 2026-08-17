'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { DataQualityLogItem } from '../lib/types';
import { fetchQualityLogs } from '../lib/api';

interface DataAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocationId: string;
}

export const DataAuditDrawer: React.FC<DataAuditDrawerProps> = ({
  isOpen,
  onClose,
  selectedLocationId,
}) => {
  const [logs, setLogs] = useState<DataQualityLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, selectedLocationId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchQualityLogs(selectedLocationId);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity flex justify-end">
      <div className="w-full max-w-lg bg-eco-card border-l border-eco-border h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-eco-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-eco-amber" />
            <div>
              <h2 className="text-base font-bold text-eco-text">Data Quality Audit Inspector</h2>
              <p className="text-xs text-eco-muted">Pipeline cleaning & anomaly flags</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-muted hover:text-eco-text transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Entries */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-eco-muted text-xs gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-eco-cyan" />
              <span>Fetching audit records...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-eco-bg border border-eco-border rounded-xl p-8 text-center flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <span className="text-sm font-bold text-eco-text">No Cleaning Rejections Triggered</span>
              <p className="text-xs text-eco-muted">
                All historical measurement points passed unit bounds and Z-score validation checks cleanly.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isInvalid = log.action_taken === 'FLAGGED_INVALID';
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    isInvalid
                      ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                      {log.rule_triggered}
                    </span>
                    <span className="text-[11px] text-eco-muted font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-eco-text">
                    {log.details || `Original reading: ${log.original_value}`}
                  </div>

                  <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-2 mt-1">
                    <span className="text-eco-muted">Metric: {log.metric}</span>
                    <span
                      className={`font-semibold ${
                        isInvalid ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {log.action_taken}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-eco-border pt-4 mt-4 flex items-center justify-between text-xs text-eco-muted">
          <span>Cleaning Engine v1.0</span>
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 text-eco-cyan font-semibold hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Logs
          </button>
        </div>
      </div>
    </div>
  );
};
