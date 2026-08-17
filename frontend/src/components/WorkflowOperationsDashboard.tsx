'use client';

import React, { useEffect, useState } from 'react';
import { WorkflowInstanceItem, DomainEventItem, NotificationLogItem, WebhookSubscriptionItem } from '../lib/types';
import { fetchWorkflows, fetchDomainEvents, fetchNotificationLogs, fetchWebhooks, retryWorkflow, cancelWorkflow } from '../lib/api';
import { Zap, Activity, Bell, Link2, RefreshCw, XCircle, CheckCircle, AlertTriangle, Cpu, X, Play, ShieldCheck } from 'lucide-react';

interface WorkflowOperationsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowOperationsDashboard: React.FC<WorkflowOperationsDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'events' | 'notifications' | 'webhooks'>('workflows');
  const [workflows, setWorkflows] = useState<WorkflowInstanceItem[]>([]);
  const [events, setEvents] = useState<DomainEventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationLogItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wfRes, evtRes, notifRes, whRes] = await Promise.all([
        fetchWorkflows(),
        fetchDomainEvents(),
        fetchNotificationLogs(),
        fetchWebhooks()
      ]);
      setWorkflows(wfRes);
      setEvents(evtRes);
      setNotifications(notifRes);
      setWebhooks(whRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    await retryWorkflow(id);
    loadData();
  };

  const handleCancel = async (id: string) => {
    await cancelWorkflow(id);
    loadData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-eco-text">Event-Driven Automation, Workflows & Enterprise Integrations</h3>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Phase 15
                </span>
              </div>
              <p className="text-xs text-eco-muted font-medium">Durable workflow orchestration, domain event pipeline & HMAC webhook signatures</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-eco-muted hover:text-eco-text hover:bg-eco-hover transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-eco-border bg-eco-bg/30 text-xs font-bold">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'workflows'
                ? 'border-purple-400 text-purple-400 bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Active Workflows ({workflows.length})
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'events'
                ? 'border-purple-400 text-purple-400 bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Domain Event Bus ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'notifications'
                ? 'border-purple-400 text-purple-400 bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Notifications ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'webhooks'
                ? 'border-purple-400 text-purple-400 bg-eco-card'
                : 'border-transparent text-eco-muted hover:text-eco-text'
            }`}
          >
            Webhook Integrations ({webhooks.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-eco-text">
          {loading ? (
            <div className="py-12 text-center text-eco-muted font-mono animate-pulse">Loading Automation Data...</div>
          ) : activeTab === 'workflows' ? (
            /* Workflows List */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Durable Workflow Instances</h4>
              <div className="space-y-3">
                {workflows.map((wf: WorkflowInstanceItem) => (
                  <div key={wf.id} className="bg-eco-bg border border-eco-border p-4 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-eco-text text-sm font-mono">{wf.workflow_type}</span>
                        <span className="text-[10px] font-mono text-eco-muted">ID: {wf.id}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        wf.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                        wf.status === 'RUNNING' ? 'text-eco-cyan bg-eco-cyan/10 border-eco-cyan/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      }`}>
                        STATUS: {wf.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-eco-muted font-mono pt-1">
                      <span>Step: {wf.current_step} | Retries: {wf.retry_count}/{wf.max_retries}</span>
                      <div className="flex items-center gap-2 font-sans">
                        {wf.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(wf.id)}
                            className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-bold transition"
                          >
                            Retry Workflow
                          </button>
                        )}
                        {wf.status === 'RUNNING' && (
                          <button
                            onClick={() => handleCancel(wf.id)}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-bold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'events' ? (
            /* Domain Events Stream */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Domain Event Stream</h4>
              <div className="space-y-2">
                {events.map((evt: DomainEventItem) => (
                  <div key={evt.event_id} className="bg-eco-bg border border-eco-border p-3 rounded-xl flex items-center justify-between font-mono text-[11px]">
                    <div>
                      <span className="text-purple-400 font-bold">[{evt.event_type}]</span> <span className="text-eco-muted">Source:</span> <span className="text-eco-text">{evt.source}</span>
                    </div>
                    <span className="text-eco-muted">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            /* Notification Logs */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Multi-Channel Notification Log</h4>
              <div className="space-y-2">
                {notifications.map((n: NotificationLogItem) => (
                  <div key={n.id} className="bg-eco-bg border border-eco-border p-3.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-eco-text text-xs">{n.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                        [{n.channel}] {n.delivery_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-eco-muted">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Webhooks */
            <div className="space-y-3">
              <h4 className="font-bold text-eco-muted uppercase tracking-wider text-[11px]">Outbound HMAC Enterprise Webhooks</h4>
              <div className="space-y-2">
                {webhooks.map((wh: WebhookSubscriptionItem) => (
                  <div key={wh.id} className="bg-eco-bg border border-eco-border p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-eco-text text-xs font-mono block">{wh.target_url}</span>
                      <span className="text-[10px] text-eco-muted font-mono">Events Filter: {wh.events_filter}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      HMAC-SHA256 ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
