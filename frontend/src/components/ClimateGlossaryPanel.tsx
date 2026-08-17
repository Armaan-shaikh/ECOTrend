'use client';

import React from 'react';
import { BookOpen, Sun } from 'lucide-react';

export const ClimateGlossaryPanel: React.FC = () => {
  const definitions = [
    {
      metric: 'T2M',
      title: 'Air Temperature (2m)',
      def: 'Average air temperature describes how warm or cool the air is at 2 meters above ground level over the selected period.'
    },
    {
      metric: 'T_ANOMALY',
      title: 'Temperature Anomaly',
      def: 'An anomaly shows how much warmer or cooler the period was compared with the chosen 30-year historical baseline mean.'
    },
    {
      metric: 'RH2M',
      title: 'Relative Humidity',
      def: 'Relative humidity describes how much water vapor is in the air compared with the maximum amount the air could hold at that temperature.'
    },
    {
      metric: 'PRECIP',
      title: 'Precipitation',
      def: 'Total accumulated rainfall and liquid-equivalent snowfall over the observation window.'
    },
    {
      metric: 'WS10M',
      title: 'Wind Speed (10m)',
      def: 'Average or maximum wind speed measured at 10 meters above ground level.'
    },
    {
      metric: 'CO2_PPM',
      title: 'Atmospheric CO2 Concentration',
      def: 'Global atmospheric carbon dioxide concentration expressed in parts per million (ppm) relative to pre-industrial (280 ppm) baseline.'
    },
    {
      metric: 'CO2_PER_CAPITA',
      title: 'Per Capita CO2 Emissions',
      def: 'Per capita carbon dioxide emissions express an individual national footprint in metric tons of CO2 per person per year.'
    },
    {
      metric: 'CO2E_TOTAL',
      title: 'Total CO2-Equivalent Emissions',
      def: 'CO2-equivalent expresses the combined global warming effect of different greenhouse gases using carbon dioxide as a common reference.'
    }
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-bold text-eco-text">Climate & Greenhouse Gas Scientific Reference Glossary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definitions.map((item) => (
          <div key={item.metric} className="bg-eco-bg border border-eco-border rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-eco-cyan" />
              <h4 className="text-xs font-bold text-eco-text">{item.title}</h4>
            </div>
            <p className="text-xs text-eco-muted leading-relaxed">{item.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
