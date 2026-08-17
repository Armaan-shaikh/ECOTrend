'use client';

import React, { useEffect, useState } from 'react';
import { LocationTreeItem, LocationItem } from '../lib/types';
import { MapPin, Globe, Compass, ExternalLink } from 'lucide-react';

interface SpatialMapProps {
  tree: LocationTreeItem[];
  selectedLocationId: string;
  onSelectStation: (id: string) => void;
}

export const SpatialMap: React.FC<SpatialMapProps> = ({
  tree,
  selectedLocationId,
  onSelectStation,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const activeStation = stations.find((st) => st.id === selectedLocationId) || stations[0];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-eco-cyan" />
          <h2 className="text-base font-bold text-eco-text">Spatial Station Network</h2>
        </div>
        <span className="text-xs font-semibold text-eco-muted bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
          PostGIS EPSG:4326
        </span>
      </div>

      {/* Station List & Spatial Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {stations.map((st) => {
          const isSelected = st.id === selectedLocationId;
          const isPolluted = st.id.includes('anandvihar');
          return (
            <div
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-eco-hover border-eco-cyan shadow-md shadow-cyan-500/10'
                  : 'bg-eco-bg border-eco-border hover:border-eco-muted/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-eco-text block line-clamp-1">{st.name}</span>
                  <span className="text-[11px] font-mono text-eco-muted">
                    {st.latitude.toFixed(4)}°N, {st.longitude.toFixed(4)}°W
                  </span>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPolluted ? 'bg-eco-rose animate-pulse' : 'bg-eco-accent'
                  }`}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-eco-muted">{st.country_code || 'GLOBAL'}</span>
                <span className={isSelected ? 'text-eco-cyan' : 'text-eco-muted'}>
                  {isSelected ? 'ACTIVE STATION' : 'SELECT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spatial Location Info Summary */}
      {activeStation && (
        <div className="mt-auto bg-eco-bg border border-eco-border rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-eco-cyan" />
            <span className="text-eco-muted">Active Spatial Target:</span>
            <span className="font-bold text-eco-text">{activeStation.name}</span>
          </div>
          <span className="font-mono text-eco-cyan bg-eco-cyan/10 px-2 py-0.5 rounded border border-eco-cyan/20">
            {activeStation.latitude.toFixed(4)}, {activeStation.longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};
