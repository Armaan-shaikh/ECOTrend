'use client';

import React, { useState, useMemo } from 'react';
import { IndianCity, INDIAN_CITIES_DATA, INDIAN_STATES } from '../lib/indianCities';
import { Search, MapPin, Building2, Wind, Droplets, Layers, ShieldAlert, Sparkles, ChevronRight, Activity, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface IndiaCitySearchLandingProps {
  onSelectCity: (city: IndianCity) => void;
  selectedCity: IndianCity | null;
  loadingCityName: string | null;
}

export const IndiaCitySearchLanding: React.FC<IndiaCitySearchLandingProps> = ({
  onSelectCity,
  selectedCity,
  loadingCityName,
}) => {
  const [activeTab, setActiveTab] = useState<'city' | 'state'>('city');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All Regions');

  // Filtered Cities for Tab A (Search by City)
  const filteredCitiesByQuery = useMemo(() => {
    return INDIAN_CITIES_DATA.filter((city) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        city.name.toLowerCase().includes(q) ||
        city.state.toLowerCase().includes(q) ||
        city.region.toLowerCase().includes(q);

      const matchesRegion =
        selectedRegionFilter === 'All Regions' || city.region === selectedRegionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegionFilter]);

  // Filtered Cities for Tab B (Search by State)
  const filteredCitiesByState = useMemo(() => {
    if (selectedState === 'All States') return INDIAN_CITIES_DATA;
    return INDIAN_CITIES_DATA.filter((c) => c.state === selectedState);
  }, [selectedState]);

  // Helper for AQI color badge
  const getAqiBadge = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (aqi <= 100) return { label: 'Moderate', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (aqi <= 200) return { label: 'Unhealthy', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { label: 'Severe', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  // If loading a specific city's telemetry
  if (loadingCityName) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fadeIn">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-eco-cyan to-purple-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
            <Activity className="w-10 h-10 text-eco-bg stroke-[2.5] animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-eco-text">
            Fetching free telemetry for <span className="text-eco-cyan font-mono">{loadingCityName}</span>...
          </h2>
          <p className="text-xs text-eco-muted font-medium">
            Accessing open-source CPCB CAAQMS, OpenAQ v3 API endpoints, river basin DO meters, and regional climate telemetry...
          </p>
        </div>

        {/* Telemetry Extraction Steps Indicator */}
        <div className="w-full max-w-md bg-eco-card border border-eco-border rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> OpenAQ Air Quality Telemetry
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">LIVE</span>
          </div>
          <div className="flex items-center justify-between text-eco-cyan">
            <span className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5" /> River Basin Dissolved Oxygen (DO)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-eco-cyan/10 border border-eco-cyan/20">EXTRACTED</span>
          </div>
          <div className="flex items-center justify-between text-purple-400">
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Soil Contamination & Heavy Metal Index
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">ANALYZED</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-eco-card via-eco-bg to-eco-card border border-eco-border p-8 sm:p-12 overflow-hidden shadow-2xl text-center flex flex-col items-center">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-eco-cyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Prominent Scope Warning Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-6 shadow-sm">
          <span>📍 Service Scope: Exclusive to India (59 Major Metropolitan Cities Covered)</span>
        </div>

        {/* Headline & Description */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-eco-text max-w-3xl leading-tight">
          Environmental Intelligence Dashboard
        </h1>

        <p className="text-lg sm:text-xl font-bold text-eco-cyan mt-2 mb-3">
          Search for the city you care about.
        </p>

        <p className="text-xs sm:text-sm text-eco-muted max-w-2xl font-medium leading-relaxed mb-8">
          This AI agent scrapes live regional environmental telemetry (Air Quality, River Basin DO, Soil Health, Noise, and Climate Drift) to generate a detailed Environmental Health Score (EHS) and analytical brief.
        </p>

        {/* Search Mode Navigation Tabs */}
        <div className="w-full max-w-3xl bg-eco-card/90 backdrop-blur-md border border-eco-border rounded-2xl p-2 sm:p-3 shadow-xl">
          <div className="flex items-center justify-center gap-2 p-1 bg-eco-bg rounded-xl mb-4 border border-eco-border">
            <button
              onClick={() => setActiveTab('city')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'city'
                  ? 'bg-eco-cyan text-eco-bg shadow-md'
                  : 'text-eco-muted hover:text-eco-text'
              }`}
            >
              <Search className="w-4 h-4" />
              Tab A: Search by City
            </button>

            <button
              onClick={() => setActiveTab('state')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'state'
                  ? 'bg-eco-cyan text-eco-bg shadow-md'
                  : 'text-eco-muted hover:text-eco-text'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Tab B: Search by State
            </button>
          </div>

          {/* TAB A: SEARCH BY CITY */}
          {activeTab === 'city' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-eco-muted" />
                <input
                  type="text"
                  placeholder="Type city name (e.g. New Delhi, Mumbai, Bengaluru, Kolkata, Pune, Chennai...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-eco-bg border border-eco-border rounded-xl text-sm text-eco-text placeholder-eco-muted focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-xs text-eco-muted hover:text-eco-text px-2 py-1 bg-eco-card rounded border border-eco-border"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Region Filter Buttons */}
              <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                {['All Regions', 'North', 'South', 'West', 'East & Central'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegionFilter(r)}
                    className={`px-3 py-1 rounded-lg border font-medium transition ${
                      selectedRegionFilter === r
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                        : 'bg-eco-bg border-eco-border text-eco-muted hover:text-eco-text'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB B: SEARCH BY STATE */}
          {activeTab === 'state' && (
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold text-eco-muted uppercase tracking-wider block">
                Select Indian State / Union Territory:
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 bg-eco-bg border border-eco-border rounded-xl text-sm text-eco-text focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan transition cursor-pointer font-medium"
              >
                <option value="All States">All States ({INDIAN_STATES.length} States / UTs Covered)</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st} ({INDIAN_CITIES_DATA.filter((c) => c.state === st).length} Cities)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* CITIES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-eco-text">
              {activeTab === 'city' ? 'Matching Cities' : `Cities in ${selectedState}`}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan text-xs font-mono font-bold">
              {activeTab === 'city' ? filteredCitiesByQuery.length : filteredCitiesByState.length} Cities Found
            </span>
          </div>

          <span className="text-xs text-eco-muted font-medium hidden sm:inline">
            Zero-Cost Open Telemetry (OpenAQ v3 & CPCB Portals)
          </span>
        </div>

        {(activeTab === 'city' ? filteredCitiesByQuery : filteredCitiesByState).length === 0 ? (
          <div className="bg-eco-card border border-eco-border rounded-2xl p-12 text-center text-eco-muted space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-eco-muted/50" />
            <p className="text-sm font-bold text-eco-text">No Indian cities matched your search filter.</p>
            <p className="text-xs">Try searching for major metropolitan centers like Delhi, Mumbai, Bengaluru, Chennai, Kolkata, or Hyderabad.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(activeTab === 'city' ? filteredCitiesByQuery : filteredCitiesByState).map((city) => {
              const badge = getAqiBadge(city.baseAqi);
              return (
                <button
                  key={city.id}
                  onClick={() => onSelectCity(city)}
                  className="group bg-eco-card hover:bg-eco-hover border border-eco-border hover:border-eco-cyan/50 rounded-2xl p-4 text-left transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-eco-cyan/5 flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-eco-text group-hover:text-eco-cyan transition text-base leading-tight">
                        {city.name}
                      </h4>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${badge.bg} whitespace-nowrap`}>
                        AQI {city.baseAqi}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-eco-muted font-medium">
                      <MapPin className="w-3.5 h-3.5 text-eco-cyan" />
                      <span>{city.state}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-eco-bg border border-eco-border text-eco-muted font-mono">
                        {city.region}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-eco-border/60 flex items-center justify-between text-[11px] font-mono text-eco-muted">
                    <span>Basin: {city.majorBasin.split(' ')[0]}</span>
                    <span className="text-eco-cyan group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                      Analyze <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
