'use client';

import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export const SoilGlossaryPanel: React.FC = () => {
  const definitions = [
    {
      metric: 'SOC',
      title: 'Soil Organic Carbon (SOC)',
      def: 'Soil organic carbon represents carbon stored within organic matter in soil, serving as a primary indicator of soil fertility, microbial activity, and carbon sequestration.'
    },
    {
      metric: 'pH',
      title: 'Soil pH (Acidity / Alkalinity)',
      def: 'Soil pH describes how acidic or alkaline the soil is, governing essential plant nutrient availability and heavy metal solubility.'
    },
    {
      metric: 'Pb',
      title: 'Lead (Pb)',
      def: 'Lead is a bio-accumulative toxic heavy metal that can accumulate in topsoil from industrial emissions, posing neurotoxic risks.'
    },
    {
      metric: 'Cd',
      title: 'Cadmium (Cd)',
      def: 'Cadmium is a toxic heavy metal that can accumulate in agricultural soil and enter crops via root uptake.'
    },
    {
      metric: 'As',
      title: 'Arsenic (As)',
      def: 'Arsenic is a naturally occurring or industrial metalloid contaminant that can persist in soil and enter terrestrial food chains.'
    },
    {
      metric: 'Hg',
      title: 'Mercury (Hg)',
      def: 'Mercury is a toxic heavy metal that persists in soil environments and bio-accumulates in living organisms.'
    },
    {
      metric: 'Cr',
      title: 'Chromium (Cr)',
      def: 'Chromium is a heavy metal associated with industrial tannery and plating effluents that can contaminate soil and groundwater.'
    },
    {
      metric: 'TPH',
      title: 'Total Petroleum Hydrocarbons (TPH)',
      def: 'TPH measures petroleum-related hydrocarbon fuels and oils present in soil from leaks or industrial spills.'
    },
    {
      metric: 'EC',
      title: 'Soil Electrical Conductivity (EC)',
      def: 'Soil electrical conductivity measures salt concentrations in soil water solution; high EC indicates soil salinization.'
    },
    {
      metric: 'Moisture',
      title: 'Soil Moisture Content',
      def: 'Soil moisture measures volumetric water content available to plant roots and soil microorganisms.'
    }
  ];

  return (
    <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-eco-amber" />
        <h3 className="text-base font-bold text-eco-text">Soil & Land Quality Scientific Reference Glossary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definitions.map((item) => (
          <div key={item.metric} className="bg-eco-bg border border-eco-border rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-eco-cyan" />
              <h4 className="text-xs font-bold text-eco-text">{item.title}</h4>
            </div>
            <p className="text-xs text-eco-muted leading-relaxed">{item.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
