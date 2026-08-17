'use client';

import React, { useEffect, useState } from 'react';
import { RecoveryStatusItem, DeadLetterItem, WorkflowInstanceItem } from '../lib/types';
import { fetchRecoveryOverview, retryDeadLetter, recoverWorkflowInstance } from '../lib/api';
import { ShieldCheck, Activity, AlertTriangle, RefreshCw, CheckCircle, XCircle, ShieldAlert, Cpu, X } from 'lucide-react';

interface ReliabilityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReliabilityDashboard: React.FC<ReliabilityDashboardProps> = ({ isOpen, onClose }) => {
  const [recoveryData, setRecoveryData] = useState<RecoveryStatusItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRecoveryOverview();
      setRecoveryData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryDLQ = async (id: string) => {
    await retryDeadLetter(id);
    loadData();
  };

  const handleRecoverWF = async (id: string) => {
    await recoverWorkflowInstance(id);
    loadData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-eco-text">Enterprise Reliability, Disaster Recovery & Security</h3>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Phase 16
                </span>
              </div>
              <p className="text-xs text-eco-muted font-medium">Dead-letter queue recovery, process restart survival & SSRF protection</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-eco-text">
          {loading || !recoveryData ? (
            <div className="py-12 text-center text-eco-muted font-mono animate-pulse">Loading Reliability Data...</div>
          ) : (
            <>
              {/* Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-eco-bg p-4 rounded-xl border border-eco-border flex items-center justify-between">
                  <span className="text-eco-muted font-bold">System Health:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {recoveryData.system_health}
                  </span>
                </div>

                <div className="bg-eco-bg p-4 rounded-xl border border-eco-border flex items-center justify-between">
                  <span className="text-eco-muted font-bold">Dead Letter Events:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{recoveryData.dead_letter_count}</span>
                </div>

                <div className="bg-eco-bg p-4 rounded-xl border border-eco-border flex items-center justify-between">
                  <span className="text-eco-muted font-bold">Failed Workflows:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">{recoveryData.failed_workflows_count}</span>
                </div>
              </div>

              {/* Dead-Letter Queue Management */}
              <div className="space-y-3">
                <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Dead-Letter Queue (DLQ) Operational Recovery</h4>
                {recoveryData.recent_dead_letters.length === 0 ? (
                  <div className="bg-eco-bg p-6 rounded-xl border border-eco-border text-center text-eco-muted">
                    Zero dead-letter events. Platform operating with 100% processing success.
                  </div>
                ) : (
                  recoveryData.recent_dead_letters.map((dl: DeadLetterItem) => (
                    <div key={dl.id} className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-eco-text text-sm font-mono">Event Type: {dl.event_type}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          dl.status === 'RECOVERED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {dl.status}
                        </span>
                      </div>

                      <p className="text-eco-muted text-xs font-sans">{dl.reason}</p>

                      <div className="flex justify-between items-center pt-1 text-[11px] font-mono text-eco-muted">
                        <span>Workflow ID: {dl.workflow_id}</span>
                        {dl.status !== 'RECOVERED' && (
                          <button
                            onClick={() => handleRetryDLQ(dl.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold font-sans transition"
                          >
                            Re-Dispatch Event
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Disaster Recovery Rules Banner */}
              <div className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-2 text-eco-muted">
                <h4 className="font-bold text-eco-text text-xs uppercase tracking-wider">Disaster Recovery & Integrity Rules</h4>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
                  <li>Recovery actions re-dispatch failed tasks without fabricating environmental measurements.</li>
                  <li>Historical environmental observations and immutable audit trails remain unmodifiable.</li>
                  <li>Outbound webhooks enforce SSRF security checks to block loopback / private IP targeting.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
