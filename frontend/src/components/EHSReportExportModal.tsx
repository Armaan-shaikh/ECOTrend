'use client';

import React, { useState } from 'react';
import { generateEHSReport } from '../lib/api';
import { EHSReportExportResponse } from '../lib/types';
import { X, FileText, Download, CheckCircle, Copy } from 'lucide-react';

interface EHSReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
}

export const EHSReportExportModal: React.FC<EHSReportExportModalProps> = ({
  isOpen,
  onClose,
  locationId,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<EHSReportExportResponse | null>(null);
  const [format, setFormat] = useState<'json' | 'markdown'>('markdown');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await generateEHSReport(locationId, format);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (reportData?.markdown_content) {
      navigator.clipboard.writeText(reportData.markdown_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-eco-card border border-eco-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-eco-border flex items-center justify-between bg-eco-bg/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-eco-cyan" />
            <h3 className="text-base font-bold text-eco-text">Generate EHS Standards & Guidelines Audit Report</h3>
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
          <div className="flex items-center justify-between bg-eco-bg p-4 rounded-xl border border-eco-border">
            <div>
              <span className="font-bold text-eco-text block">Export Audit Format</span>
              <span className="text-eco-muted text-[11px]">Select structured JSON payload or formatted Markdown report</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormat('markdown')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  format === 'markdown' ? 'bg-eco-cyan text-eco-bg' : 'bg-eco-card text-eco-muted border border-eco-border'
                }`}
              >
                Markdown (.md)
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  format === 'json' ? 'bg-eco-cyan text-eco-bg' : 'bg-eco-card text-eco-muted border border-eco-border'
                }`}
              >
                JSON Payload
              </button>
            </div>
          </div>

          {!reportData ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <FileText className="w-12 h-12 text-eco-muted/50" />
              <p className="text-eco-muted text-xs">Ready to compile 6-domain EHS Standards & Guidelines Audit Package.</p>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-eco-accent hover:bg-emerald-600 text-eco-bg font-bold text-xs transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Compiling Report...' : 'Compile Audit Report'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-eco-cyan text-sm">EHS Standards & Guidelines Audit Package Compiled</span>
                {format === 'markdown' && (
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-eco-bg hover:bg-eco-hover border border-eco-border text-eco-cyan text-xs font-bold transition"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
                  </button>
                )}
              </div>

              {format === 'markdown' && reportData.markdown_content ? (
                <pre className="bg-eco-bg p-4 rounded-xl border border-eco-border font-mono text-[11px] leading-relaxed overflow-x-auto text-eco-text max-h-96">
                  {reportData.markdown_content}
                </pre>
              ) : (
                <pre className="bg-eco-bg p-4 rounded-xl border border-eco-border font-mono text-[11px] leading-relaxed overflow-x-auto text-eco-text max-h-96">
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
