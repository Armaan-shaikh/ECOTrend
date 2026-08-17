'use client';

import React from 'react';
import { MapPin, Filter, Calendar, Layers } from 'lucide-react';
import { LocationTreeItem, LocationItem } from '../lib/types';

interface LocationSelectorProps {
  tree: LocationTreeItem[];
  selectedLocationId: string;
  selectedMetric: string;
  selectedDays: number;
  onSelectLocation: (locationId: string) => void;
  onSelectMetric: (metric: string) => void;
  onSelectDays: (days: number) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  tree,
  selectedLocationId,
  selectedMetric,
  selectedDays,
  onSelectLocation,
  onSelectMetric,
  onSelectDays,
}) => {
  // Flatten stations from tree
  const flattenStations = (items: LocationTreeItem[]): LocationItem[] => {
    let result: LocationItem[] = [];
    for (const item of items) {
      if (item.level === 'STATION') {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenStations(item.children));
      }
    }
    return result;
  };

  const stations = flattenStations(tree);

  const airMetrics = [
    { id: 'PM2.5', label: 'PM2.5', unit: 'µg/m³' },
    { id: 'PM10', label: 'PM10', unit: 'µg/m³' },
    { id: 'NO2', label: 'NO₂', unit: 'ppb' },
    { id: 'SO2', label: 'SO₂', unit: 'ppb' },
    { id: 'CO', label: 'CO', unit: 'ppm' },
    { id: 'O3', label: 'O₃', unit: 'ppb' },
    { id: 'AQI', label: 'AQI', unit: 'index' },
  ];

  const timeRanges = [
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' },
    { days: 365, label: '1 Year' },
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
      {/* Location Dropdown */}
      <div className="flex-1 flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-eco-muted flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-eco-cyan" />
          Monitoring Station (Country → State → City → Station)
        </label>
        <select
          value={selectedLocationId}
          onChange={(e) => onSelectLocation(e.target.value)}
          className="w-full bg-eco-bg border border-eco-border rounded-xl px-4 py-2.5 text-sm font-semibold text-eco-text focus:outline-none focus:border-eco-cyan transition-all cursor-pointer"
        >
          {stations.map((st) => (
            <option key={st.id} value={st.id} className="bg-eco-card text-eco-text">
              📍 {st.name} ({st.country_code || 'GLOBAL'})
            </option>
          ))}
        </select>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-eco-muted flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-eco-accent" />
          Air Metric
        </label>
        <div className="flex flex-wrap gap-1.5 bg-eco-bg p-1 rounded-xl border border-eco-border">
          {airMetrics.map((m) => {
            const isSelected = selectedMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-eco-accent text-eco-bg shadow-md shadow-emerald-500/20'
                    : 'text-eco-muted hover:text-eco-text hover:bg-eco-card'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Window Range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-eco-muted flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-eco-blue" />
          Analysis Window
        </label>
        <div className="flex gap-1.5 bg-eco-bg p-1 rounded-xl border border-eco-border">
          {timeRanges.map((r) => {
            const isSelected = selectedDays === r.days;
            return (
              <button
                key={r.days}
                onClick={() => onSelectDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-eco-blue text-white shadow-md shadow-blue-500/20'
                    : 'text-eco-muted hover:text-eco-text hover:bg-eco-card'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
