'use client';

import React from 'react';
import { DomainComparisonItem } from '../lib/types';
import { Trophy } from 'lucide-react';

interface DomainComparisonTableProps {
  locations: DomainComparisonItem[];
}

export const DomainComparisonTable: React.FC<DomainComparisonTableProps> = ({ locations }) => {
  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center gap-2 border-b border-eco-border pb-3">
        <Trophy className="w-5 h-5 text-eco-amber" />
        <h3 className="text-base font-bold text-eco-text">Multi-Station 6-Domain Environmental Comparative Leaderboard</h3>
      </div>

      <div className="overflow-x-auto border border-eco-border rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-eco-bg border-b border-eco-border text-eco-muted text-[11px]">
              <th className="p-3">Station Name</th>
              <th className="p-3 font-mono">CEPI Score</th>
              <th className="p-3">Air EHS</th>
              <th className="p-3">Water</th>
              <th className="p-3">Soil</th>
              <th className="p-3">Climate</th>
              <th className="p-3">Emissions</th>
              <th className="p-3">Acoustic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-eco-border text-[11px]">
            {locations.map((loc) => (
              <tr key={loc.location_id} className="hover:bg-eco-bg/50">
                <td className="p-3 font-bold text-eco-text">{loc.location_name}</td>
                <td className="p-3 font-mono font-bold text-eco-cyan">{loc.cepi_score}/100</td>
                <td className="p-3 font-mono text-eco-text">{loc.air_score ?? 'N/A'}</td>
                <td className="p-3 font-mono text-eco-text">{loc.water_score ?? 'N/A'}</td>
                <td className="p-3 font-mono text-eco-text">{loc.soil_score ?? 'N/A'}</td>
                <td className="p-3 font-mono text-eco-text">{loc.climate_score ?? 'N/A'}</td>
                <td className="p-3 font-mono text-eco-text">{loc.emissions_score ?? 'N/A'}</td>
                <td className="p-3 font-mono text-eco-text">{loc.noise_score ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
