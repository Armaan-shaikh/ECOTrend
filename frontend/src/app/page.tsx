'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { SpatialMap } from '../components/SpatialMap';
import { MetricsOverview } from '../components/MetricsOverview';
import { HistoricalAnalyticsChart } from '../components/HistoricalAnalyticsChart';
import { SeasonalityChart } from '../components/SeasonalityChart';
import { ForecastControls } from '../components/ForecastControls';
import { ForecastChart } from '../components/ForecastChart';
import { EHSGaugeCard } from '../components/EHSGaugeCard';
import { SubScoreCards } from '../components/SubScoreCards';
import { EHSForecastChart } from '../components/EHSForecastChart';
import { EnvironmentalSummaryCard } from '../components/EnvironmentalSummaryCard';
import { KeyFindingsPanel } from '../components/KeyFindingsPanel';
import { ScenarioExplanationCard } from '../components/ScenarioExplanationCard';
import { MetricGlossaryPanel } from '../components/MetricGlossaryPanel';
import { WaterScoreCard } from '../components/WaterScoreCard';
import { WaterSubScoreCards } from '../components/WaterSubScoreCards';
import { WaterGlossaryPanel } from '../components/WaterGlossaryPanel';
import { WaterStandardsModal } from '../components/WaterStandardsModal';
import { DataAuditDrawer } from '../components/DataAuditDrawer';
import { BacktestScorecardDrawer } from '../components/BacktestScorecardDrawer';
import { EHSMethodologyModal } from '../components/EHSMethodologyModal';

import {
  fetchLocationTree,
  fetchHistoricalAnalytics,
  fetchForecastProjections,
  fetchCurrentHealthScore,
  fetchHistoricalHealthScore,
  fetchForecastHealthScore,
  fetchLocationExplanations,
  fetchWaterStations,
  fetchWaterQualityScore,
  fetchHistoricalWaterAnalytics
} from '../lib/api';

import {
  EnvironmentalDomain,
  LocationTreeItem,
  LocationItem,
  HistoricalAnalyticsSummary,
  ForecastProjectionResponse,
  AggregateEHSResponse,
  HistoricalEHSPoint,
  ForecastEHSResponse,
  LocationExplanationResponse,
  WaterQualityScoreResponse
} from '../lib/types';

import { Shield, Layers, Droplet, Wind } from 'lucide-react';

export default function DashboardPage() {
  const [domain, setDomain] = useState<EnvironmentalDomain>('air');

  // Air Domain Selection State
  const [tree, setTree] = useState<LocationTreeItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc_us_ny_nyc_manhattan');
  const [selectedMetric, setSelectedMetric] = useState<string>('PM2.5');
  const [selectedDays, setSelectedDays] = useState<number>(90);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('1_YEAR');

  // Water Domain Selection State
  const [waterStations, setWaterStations] = useState<LocationItem[]>([]);
  const [selectedWaterStationId, setSelectedWaterStationId] = useState<string>('loc_us_ny_hudson');
  const [selectedWaterMetric, setSelectedWaterMetric] = useState<string>('DO');

  // Data States
  const [analytics, setAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastProjectionResponse | null>(null);
  const [ehsData, setEhsData] = useState<AggregateEHSResponse | null>(null);
  const [historicalEHS, setHistoricalEHS] = useState<HistoricalEHSPoint[]>([]);
  const [forecastEHS, setForecastEHS] = useState<ForecastEHSResponse | null>(null);
  const [explanations, setExplanations] = useState<LocationExplanationResponse | null>(null);

  // Water Data States
  const [waterScore, setWaterScore] = useState<WaterQualityScoreResponse | null>(null);
  const [waterAnalytics, setWaterAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);

  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true);
  const [loadingEHS, setLoadingEHS] = useState<boolean>(true);
  const [loadingExplanations, setLoadingExplanations] = useState<boolean>(true);
  const [loadingWater, setLoadingWater] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Scenario Toggles
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showImprovement, setShowImprovement] = useState<boolean>(true);
  const [showWorsening, setShowWorsening] = useState<boolean>(true);
  const [showCI, setShowCI] = useState<boolean>(true);

  // Drawers & Modals
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isWaterStandardsOpen, setIsWaterStandardsOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTree();
    loadWaterStations();
  }, []);

  useEffect(() => {
    if (domain === 'air') {
      loadAnalytics();
      loadForecast();
      loadEHS();
      loadExplanations();
    } else {
      loadWaterData();
    }
  }, [domain, selectedLocationId, selectedMetric, selectedDays, selectedHorizon, selectedWaterStationId, selectedWaterMetric]);

  const loadTree = async () => {
    const data = await fetchLocationTree();
    setTree(data);
  };

  const loadWaterStations = async () => {
    const st = await fetchWaterStations();
    setWaterStations(st);
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchHistoricalAnalytics(selectedLocationId, selectedMetric, selectedDays);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadForecast = async () => {
    setLoadingForecast(true);
    try {
      const data = await fetchForecastProjections(selectedLocationId, selectedMetric, selectedHorizon);
      setForecast(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const loadEHS = async () => {
    setLoadingEHS(true);
    try {
      const [currentRes, histRes, foreRes] = await Promise.all([
        fetchCurrentHealthScore(selectedLocationId),
        fetchHistoricalHealthScore(selectedLocationId, selectedDays),
        fetchForecastHealthScore(selectedLocationId, selectedMetric, selectedHorizon)
      ]);
      setEhsData(currentRes);
      setHistoricalEHS(histRes);
      setForecastEHS(foreRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEHS(false);
    }
  };

  const loadExplanations = async () => {
    setLoadingExplanations(true);
    try {
      const data = await fetchLocationExplanations(selectedLocationId, selectedMetric, selectedDays, selectedHorizon);
      setExplanations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExplanations(false);
    }
  };

  const loadWaterData = async () => {
    setLoadingWater(true);
    try {
      const [scoreRes, analyticsRes] = await Promise.all([
        fetchWaterQualityScore(selectedWaterStationId),
        fetchHistoricalWaterAnalytics(selectedWaterStationId, selectedWaterMetric, selectedDays)
      ]);
      setWaterScore(scoreRes);
      setWaterAnalytics(analyticsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWater(false);
    }
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    if (domain === 'air') {
      await Promise.all([loadAnalytics(), loadForecast(), loadEHS(), loadExplanations()]);
    } else {
      await loadWaterData();
    }
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col font-sans">
      {/* Top Navigation Bar with Domain Switcher */}
      <Header
        domain={domain}
        onSelectDomain={setDomain}
        onRefresh={handleRefreshPipeline}
        onOpenAudit={() => setIsAuditOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {domain === 'air' ? (
          /* AIR QUALITY DOMAIN DASHBOARD */
          <>
            {/* 1. Spatial Hierarchy & Control Toolbar */}
            <LocationSelector
              tree={tree}
              selectedLocationId={selectedLocationId}
              selectedMetric={selectedMetric}
              selectedDays={selectedDays}
              onSelectLocation={setSelectedLocationId}
              onSelectMetric={setSelectedMetric}
              onSelectDays={setSelectedDays}
            />

            {/* 2. Deterministic Environmental Report Banner */}
            <EnvironmentalSummaryCard
              explanations={explanations}
              loading={loadingExplanations}
            />

            {/* 3. Prioritized Key Findings & Warnings */}
            <KeyFindingsPanel
              explanations={explanations}
              loading={loadingExplanations}
            />

            {/* 4. Environmental Health Score Gauge */}
            <EHSGaugeCard
              ehsData={ehsData}
              loading={loadingEHS}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />

            {/* 5. Pollutant Sub-Score Breakdown Cards */}
            {ehsData && <SubScoreCards subscores={ehsData.metric_subscores} />}

            {/* 6. Key Metrics Overview */}
            <MetricsOverview analytics={analytics} loading={loadingAnalytics} />

            {/* 7. Forecast Controls */}
            <ForecastControls
              selectedHorizon={selectedHorizon}
              showBaseline={showBaseline}
              showImprovement={showImprovement}
              showWorsening={showWorsening}
              showCI={showCI}
              championModel={forecast?.champion_model || 'Model Competition'}
              onSelectHorizon={setSelectedHorizon}
              onToggleBaseline={() => setShowBaseline(!showBaseline)}
              onToggleImprovement={() => setShowImprovement(!showImprovement)}
              onToggleWorsening={() => setShowWorsening(!showWorsening)}
              onToggleCI={() => setShowCI(!showCI)}
              onOpenScorecard={() => setIsScorecardOpen(true)}
            />

            {/* 8. Forecast-Linked EHS Projections Chart */}
            <EHSForecastChart
              forecastEHS={forecastEHS}
              historicalEHS={historicalEHS}
              loading={loadingEHS}
            />

            {/* 9. Forecast Chart */}
            <ForecastChart
              forecast={forecast}
              historical={analytics}
              loading={loadingForecast}
              showBaseline={showBaseline}
              showImprovement={showImprovement}
              showWorsening={showWorsening}
              showCI={showCI}
            />

            {/* 10. Scenario Explanation */}
            <ScenarioExplanationCard />

            {/* 11. Spatial Map & Historical Time-Series */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 h-[420px] lg:h-auto">
                <SpatialMap
                  tree={tree}
                  selectedLocationId={selectedLocationId}
                  onSelectStation={setSelectedLocationId}
                />
              </div>
              <div className="lg:col-span-7">
                <HistoricalAnalyticsChart analytics={analytics} loading={loadingAnalytics} />
              </div>
            </div>

            {/* 12. Seasonality */}
            <SeasonalityChart analytics={analytics} loading={loadingAnalytics} />

            {/* 13. Metric Glossary */}
            {explanations && <MetricGlossaryPanel metrics={explanations.metric_explanations} />}
          </>
        ) : (
          /* WATER QUALITY DOMAIN DASHBOARD (Phase 4A) */
          <>
            {/* 1. Water Toolbar Selector */}
            <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-eco-text">Freshwater Station Selector</h2>
                  <p className="text-xs text-eco-muted">Phase 4A · Water Quality Intelligence Pipeline</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                {/* Water Station Selector */}
                <select
                  value={selectedWaterStationId}
                  onChange={(e) => setSelectedWaterStationId(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-cyan font-sans"
                >
                  {waterStations.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>

                {/* Water Metric Selector */}
                <select
                  value={selectedWaterMetric}
                  onChange={(e) => setSelectedWaterMetric(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-cyan font-mono"
                >
                  {['DO', 'BOD', 'COD', 'TDS', 'pH', 'Turbidity', 'Temp', 'Conductivity'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* Days Window Selector */}
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-cyan font-mono"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                </select>
              </div>
            </div>

            {/* 2. Water Quality Health Score Banner */}
            <WaterScoreCard
              waterScore={waterScore}
              loading={loadingWater}
              onOpenMethodology={() => setIsWaterStandardsOpen(true)}
            />

            {/* 3. Water Metric Sub-Score Cards */}
            {waterScore && <WaterSubScoreCards subscores={waterScore.metric_subscores} />}

            {/* 4. Water Key Metrics Summary Overview */}
            <MetricsOverview analytics={waterAnalytics} loading={loadingWater} />

            {/* 5. Historical Water Analytics Time-Series Chart */}
            <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
              <HistoricalAnalyticsChart analytics={waterAnalytics} loading={loadingWater} />
            </div>

            {/* 6. Plain-Language Water Scientific Glossary */}
            <WaterGlossaryPanel />
          </>
        )}

        {/* Footer Info */}
        <footer className="border-t border-eco-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-eco-muted gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              EcoTrend Phase 4A · <strong className="text-eco-text">Water Quality Intelligence Pipeline (WHO & EPA Standards)</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-eco-muted font-mono text-[11px]">
            <span>PostgreSQL 16 + PostGIS + TimescaleDB</span>
            <span>·</span>
            <span>FastAPI + Next.js 14</span>
          </div>
        </footer>
      </main>

      {/* Drawers & Modals */}
      <DataAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        selectedLocationId={domain === 'air' ? selectedLocationId : selectedWaterStationId}
      />

      <BacktestScorecardDrawer
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        forecast={forecast}
      />

      <EHSMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <WaterStandardsModal
        isOpen={isWaterStandardsOpen}
        onClose={() => setIsWaterStandardsOpen(false)}
      />
    </div>
  );
}
