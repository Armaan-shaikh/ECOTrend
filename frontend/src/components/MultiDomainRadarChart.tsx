'use client';

import React from 'react';
import { DomainScoreSummary } from '../lib/types';
import { Layers } from 'lucide-react';

interface MultiDomainRadarChartProps {
  domainScores: DomainScoreSummary[];
}

export const MultiDomainRadarChart: React.FC<MultiDomainRadarChartProps> = ({ domainScores }) => {
  // 6 Axis Radar Chart: Air, Water, Soil, Climate, Emissions, Acoustic
  const axes = [
    { key: 'air', label: 'Air Quality' },
    { key: 'water', label: 'Water Quality' },
    { key: 'soil', label: 'Soil Quality' },
    { key: 'climate', label: 'Climate Index' },
    { key: 'emissions', label: 'Emissions Index' },
    { key: 'noise', label: 'Acoustic Index' }
  ];

  const scoreMap: Record<string, number> = {};
  domainScores.forEach((d) => {
    scoreMap[d.domain] = d.is_available ? d.score : 0;
  });

  const center = 150;
  const radius = 100;
  const numAxes = axes.length;

  // Calculate polygon points for radar
  const getCoordinates = (index: number, scoreValue: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (scoreValue / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Polygon path points for actual data
  const dataPoints = axes.map((axis, i) => getCoordinates(i, scoreMap[axis.key] || 0));
  const polygonPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid level polygons (20, 40, 60, 80, 100)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 self-start">
        <Layers className="w-5 h-5 text-eco-cyan" />
        <h3 className="text-base font-bold text-eco-text">6-Domain Environmental Pentagon Radar Profile</h3>
      </div>

      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          {/* Background Grid Hexagons */}
          {gridLevels.map((lvl) => {
            const gridPts = axes.map((_, i) => getCoordinates(i, lvl)).map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <polygon
                key={lvl}
                points={gridPts}
                fill="none"
                stroke="#1E2D40"
                strokeWidth="1"
                strokeDasharray={lvl === 100 ? 'none' : '2,2'}
              />
            );
          })}

          {/* Axis Lines */}
          {axes.map((_, i) => {
            const p = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke="#1E2D40"
                strokeWidth="1"
              />
            );
          })}

          {/* Actual Data Radar Polygon */}
          <polygon
            points={polygonPointsString}
            fill="rgba(6, 182, 212, 0.25)"
            stroke="#06B6D4"
            strokeWidth="2.5"
          />

          {/* Data Points */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#06B6D4"
              stroke="#0B132B"
              strokeWidth="1.5"
            />
          ))}

          {/* Axis Labels */}
          {axes.map((axis, i) => {
            const labelPos = getCoordinates(i, 118);
            const scoreVal = scoreMap[axis.key];
            return (
              <text
                key={axis.key}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-bold fill-eco-text"
              >
                {axis.label} ({scoreVal || 0})
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
