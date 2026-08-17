'use client';

import React from 'react';
import { BookOpen, Volume2 } from 'lucide-react';

export const NoiseGlossaryPanel: React.FC = () => {
  const definitions = [
    {
      metric: 'NOISE_INCIDENTS',
      title: 'Measured Noise Disturbances (incidents/day)',
      def: 'Geocoded ambient noise disturbance reports recorded in the monitoring area over a 24-hour period. Measured directly from public incident feeds.'
    },
    {
      metric: 'Lden',
      title: 'Day-Evening-Night Level (dBA)',
      def: '24-hour equivalent continuous sound level with a 5 dBA penalty for evening and 10 dBA penalty for night hours. Marked UNAVAILABLE when decibel meter feeds are not present.'
    },
    {
      metric: 'Lnight',
      title: 'Nighttime Sound Level (dBA)',
      def: '8-hour nighttime continuous sound level (23:00–07:00) evaluated by WHO to prevent sleep disturbance. Marked UNAVAILABLE when decibel meter feeds are not present.'
    },
    {
      metric: 'Lday',
      title: 'Daytime Sound Level (dBA)',
      def: '12-hour daytime continuous sound level (07:00–19:00) evaluated by US EPA outdoor residential noise guidelines.'
    }
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h3 className="text-base font-bold text-eco-text">Acoustic Disturbance Scientific Reference Glossary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definitions.map((item) => (
          <div key={item.metric} className="bg-eco-bg border border-eco-border rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-eco-cyan" />
              <h4 className="text-xs font-bold text-eco-text">{item.title}</h4>
            </div>
            <p className="text-xs text-eco-muted leading-relaxed">{item.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
