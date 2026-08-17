'use client';

import React from 'react';
import { BookOpen, Activity, Info } from 'lucide-react';
import { MetricDefinitionItem } from '../lib/types';

interface MetricGlossaryPanelProps {
  metrics: MetricDefinitionItem[];
}

export const MetricGlossaryPanel: React.FC<MetricGlossaryPanelProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-eco-cyan" />
          <h3 className="text-base font-bold text-eco-text">What Do These Scientific Metrics Mean?</h3>
        </div>
        <span className="text-xs text-eco-muted font-mono bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
          Non-Technical Glossary
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {metrics.map((item) => (
          <div key={item.metric} className="p-4 rounded-xl bg-eco-bg border border-eco-border flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between font-bold text-eco-text mb-1">
                <span className="text-eco-cyan">{item.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-eco-card border border-eco-border text-eco-muted">
                  {item.metric}
                </span>
              </div>
              <p className="text-eco-text leading-relaxed font-sans">{item.definition}</p>
            </div>

            <div className="border-t border-eco-border/50 pt-2 space-y-1 text-[11px]">
              <div>
                <strong className="text-eco-muted">Sources:</strong> <span className="text-eco-text">{item.common_sources}</span>
              </div>
              <div>
                <strong className="text-eco-muted">Health Impact:</strong> <span className="text-eco-amber">{item.health_relevance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
