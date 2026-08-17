'use client';

import React, { useEffect, useState } from 'react';
import { ApprovalRequestItem, AuditEventItem, SecuritySummaryItem, UserItem } from '../lib/types';
import { fetchApprovalRequests, fetchAuditEvents, fetchSecuritySummary, fetchUsersList, approveInterventionRequest, rejectInterventionRequest } from '../lib/api';
import { ShieldCheck, Lock, Users, CheckCircle, XCircle, FileText, Activity, AlertTriangle, Layers, X } from 'lucide-react';

interface GovernanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'audit' | 'users' | 'security'>('approvals');
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [securitySummary, setSecuritySummary] = useState<SecuritySummaryItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, audRes, secRes, usrRes] = await Promise.all([
        fetchApprovalRequests(),
        fetchAuditEvents(),
        fetchSecuritySummary(),
        fetchUsersList()
      ]);
      setApprovals(appRes);
      setAuditEvents(audRes);
      setSecuritySummary(secRes);
      setUsers(usrRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveInterventionRequest(id);
    loadData();
  };

  const handleReject = async (id: string) => {
    await rejectInterventionRequest(id);
    loadData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-eco-text">Enterprise Governance, Security & Multi-Tenancy</h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Phase 14
                </span>
              </div>
              <p className="text-xs text-eco-muted font-medium">RBAC enforcement, intervention approvals & immutable audit trail</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-eco-border bg-eco-bg/30 text-xs font-bold">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'approvals'
                ? 'border-eco-cyan text-eco-cyan bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Intervention Approvals ({approvals.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-eco-cyan text-eco-cyan bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Immutable Audit Trail ({auditEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'users'
                ? 'border-eco-cyan text-eco-cyan bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            User RBAC & Tenants ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'security'
                ? 'border-eco-cyan text-eco-cyan bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Security Posture
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-eco-text">
          {loading ? (
            <div className="py-12 text-center text-eco-muted font-mono animate-pulse">Loading Governance Data...</div>
          ) : activeTab === 'approvals' ? (
            /* Approvals Queue */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Intervention Approval Queue</h4>
              {approvals.length === 0 ? (
                <div className="bg-eco-bg p-6 rounded-xl border border-eco-border text-center text-eco-muted">
                  No pending intervention approval requests.
                </div>
              ) : (
                approvals.map((req: ApprovalRequestItem) => (
                  <div key={req.id} className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-eco-text text-sm">{req.title}</span>
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                          {req.domain}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        req.status === 'SUBMITTED' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                        req.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      }`}>
                        STATUS: {req.status}
                      </span>
                    </div>

                    <p className="text-eco-muted text-xs font-sans">{req.reason}</p>

                    <div className="flex items-center justify-between text-[11px] text-eco-muted font-mono">
                      <span>Submitter ID: {req.submitter_id} | Est. CEPI Delta: +{req.estimated_cepi_improvement} pts</span>
                      {req.status === 'SUBMITTED' && (
                        <div className="flex items-center gap-2 font-sans">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold transition"
                          >
                            Approve Intervention
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-bold transition"
                          >
                            Reject Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'audit' ? (
            /* Immutable Audit Log */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Immutable Enterprise Audit History</h4>
              <div className="space-y-2">
                {auditEvents.map((evt: AuditEventItem) => (
                  <div key={evt.id} className="bg-eco-bg border border-eco-border p-3 rounded-xl flex items-center justify-between font-mono text-[11px]">
                    <div>
                      <span className="text-eco-cyan font-bold">[{evt.action}]</span> <span className="text-eco-text">{evt.actor_email}</span> on <span className="text-purple-400">{evt.resource_type}:{evt.resource_id}</span>
                    </div>
                    <span className="text-eco-muted">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'users' ? (
            /* User RBAC Matrix */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Provisioned Enterprise Users & RBAC Roles</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {users.map((u: UserItem) => (
                  <div key={u.id} className="bg-eco-bg border border-eco-border p-3.5 rounded-xl space-y-1.5">
                    <span className="font-bold text-eco-text text-sm block">{u.full_name}</span>
                    <span className="text-eco-muted font-mono text-xs block">{u.email}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block uppercase">
                      ROLE: {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Security Posture Summary */
            <div className="bg-eco-bg border border-eco-border p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-eco-text text-sm">Security Posture Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-eco-card p-3 rounded-lg border border-eco-border">
                  <span className="text-eco-muted block">Security Posture:</span>
                  <span className="text-emerald-400 font-bold">{securitySummary?.security_posture}</span>
                </div>
                <div className="bg-eco-card p-3 rounded-lg border border-eco-border">
                  <span className="text-eco-muted block">Authorization Engine:</span>
                  <span className="text-emerald-400 font-bold">{securitySummary?.rbac_status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
