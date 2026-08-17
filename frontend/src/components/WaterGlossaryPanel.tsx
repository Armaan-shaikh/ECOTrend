'use client';

import React from 'react';
import { BookOpen, Droplet } from 'lucide-react';

const WATER_GLOSSARY_ITEMS = [
  {
    metric: "DO",
    title: "Dissolved Oxygen (DO)",
    unit: "mg/L",
    definition: "Dissolved oxygen is the amount of free oxygen gas present in water, vital for fish, plants, and aerobic aquatic organisms.",
    sources: "Atmospheric re-aeration, aquatic plant photosynthesis, river turbulence.",
    impact: "Low DO (< 4.0 mg/L) causes fish kills and severe hypoxia."
  },
  {
    metric: "BOD",
    title: "Biochemical Oxygen Demand (BOD)",
    unit: "mg/L",
    definition: "BOD measures the amount of dissolved oxygen consumed by microorganisms to break down organic matter in water.",
    sources: "Domestic sewage, agricultural runoff, industrial organic waste.",
    impact: "High BOD (> 5.0 mg/L) indicates heavy organic pollution consuming oxygen reserves."
  },
  {
    metric: "COD",
    title: "Chemical Oxygen Demand (COD)",
    unit: "mg/L",
    definition: "COD measures the total amount of oxygen required to chemically oxidize organic and non-biodegradable inorganic pollutants.",
    sources: "Industrial chemical wastewater, textile dyes, paper pulp effluents.",
    impact: "Elevated COD (> 20 mg/L) signals non-biodegradable chemical toxicity."
  },
  {
    metric: "TDS",
    title: "Total Dissolved Solids (TDS)",
    unit: "mg/L",
    definition: "TDS represents the total concentration of dissolved minerals, salts, metals, and cations/anions in water.",
    sources: "Mineral weathering, agricultural fertilizers, road salt runoff.",
    impact: "High TDS (> 500 mg/L) imparts salty taste and accelerates pipe scaling."
  },
  {
    metric: "pH",
    title: "pH (Acidity / Alkalinity)",
    unit: "dimensionless",
    definition: "pH measures the hydrogen ion concentration, indicating whether water is acidic (pH < 7) or alkaline (pH > 7).",
    sources: "Acid rain, mine drainage, limestone geological strata.",
    impact: "Extreme pH (< 6.5 or > 8.5) increases toxic heavy metal solubility."
  },
  {
    metric: "Turbidity",
    title: "Turbidity",
    unit: "NTU",
    definition: "Turbidity measures the cloudiness or haziness of water caused by suspended sediment particles.",
    sources: "Soil erosion, construction runoff, algae blooms.",
    impact: "High turbidity (> 5 NTU) shelters pathogenic bacteria from chlorine disinfection."
  },
  {
    metric: "Conductivity",
    title: "Electrical Conductivity",
    unit: "µS/cm",
    definition: "Conductivity measures water's capacity to pass an electric current, directly proportional to dissolved ionic salts.",
    sources: "Dissolved minerals, saline intrusion, agricultural runoff.",
    impact: "Indicates overall ionic strength and mineral salinity."
  },
  {
    metric: "Temp",
    title: "Water Temperature",
    unit: "°C",
    definition: "Measures thermal kinetic energy in the water body influencing chemical reaction rates and gas solubility.",
    sources: "Power plant cooling discharge, ambient air heat, deforestation shade loss.",
    impact: "Warm water decreases oxygen solubility while accelerating microbial decay."
  }
];

export const WaterGlossaryPanel: React.FC = () => {
  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-eco-cyan" />
          <h3 className="text-base font-bold text-eco-text">What Do Water Quality Parameters Mean?</h3>
        </div>
        <span className="text-xs text-eco-muted font-mono bg-eco-bg px-2.5 py-1 rounded-full border border-eco-border">
          Freshwater Science Glossary
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {WATER_GLOSSARY_ITEMS.map((item) => (
          <div key={item.metric} className="p-4 rounded-xl bg-eco-bg border border-eco-border flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between font-bold text-eco-text mb-1">
                <span className="text-eco-cyan">{item.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-eco-card border border-eco-border text-eco-muted">
                  {item.unit}
                </span>
              </div>
              <p className="text-eco-text leading-relaxed font-sans">{item.definition}</p>
            </div>

            <div className="border-t border-eco-border/50 pt-2 space-y-1 text-[11px]">
              <div>
                <strong className="text-eco-muted">Primary Sources:</strong> <span className="text-eco-text">{item.sources}</span>
              </div>
              <div>
                <strong className="text-eco-muted">Ecological Impact:</strong> <span className="text-eco-amber">{item.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
