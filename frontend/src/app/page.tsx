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
  fetchLocationExplanations
} from '../lib/api';

import {
  LocationTreeItem,
  HistoricalAnalyticsSummary,
  ForecastProjectionResponse,
  AggregateEHSResponse,
  HistoricalEHSPoint,
  ForecastEHSResponse,
  LocationExplanationResponse
} from '../lib/types';

import { Shield, Layers, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [tree, setTree] = useState<LocationTreeItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc_us_ny_nyc_manhattan');
  const [selectedMetric, setSelectedMetric] = useState<string>('PM2.5');
  const [selectedDays, setSelectedDays] = useState<number>(90);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('1_YEAR');

  // Analytics, Forecast, EHS, and Explanations state
  const [analytics, setAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastProjectionResponse | null>(null);
  const [ehsData, setEhsData] = useState<AggregateEHSResponse | null>(null);
  const [historicalEHS, setHistoricalEHS] = useState<HistoricalEHSPoint[]>([]);
  const [forecastEHS, setForecastEHS] = useState<ForecastEHSResponse | null>(null);
  const [explanations, setExplanations] = useState<LocationExplanationResponse | null>(null);

  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true);
  const [loadingEHS, setLoadingEHS] = useState<boolean>(true);
  const [loadingExplanations, setLoadingExplanations] = useState<boolean>(true);
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

  useEffect(() => {
    loadTree();
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadForecast();
    loadEHS();
    loadExplanations();
  }, [selectedLocationId, selectedMetric, selectedDays, selectedHorizon]);

  const loadTree = async () => {
    const data = await fetchLocationTree();
    setTree(data);
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

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    await Promise.all([loadAnalytics(), loadForecast(), loadEHS(), loadExplanations()]);
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onRefresh={handleRefreshPipeline}
        onOpenAudit={() => setIsAuditOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
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

        {/* 2. Deterministic Environmental Report Banner (Phase 3B) */}
        <EnvironmentalSummaryCard
          explanations={explanations}
          loading={loadingExplanations}
        />

        {/* 3. Prioritized Key Findings & Warnings (Phase 3B) */}
        <KeyFindingsPanel
          explanations={explanations}
          loading={loadingExplanations}
        />

        {/* 4. Environmental Health Score (EHS 0–100) Gauge (Phase 3A) */}
        <EHSGaugeCard
          ehsData={ehsData}
          loading={loadingEHS}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
        />

        {/* 5. Pollutant Sub-Score Breakdown Cards */}
        {ehsData && <SubScoreCards subscores={ehsData.metric_subscores} />}

        {/* 6. Key Metrics & Stat Summary Grid */}
        <MetricsOverview analytics={analytics} loading={loadingAnalytics} />

        {/* 7. Forecast & Scenario Projection Controls */}
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

        {/* 9. Multi-Scenario Forecast Chart (Concentrations) */}
        <ForecastChart
          forecast={forecast}
          historical={analytics}
          loading={loadingForecast}
          showBaseline={showBaseline}
          showImprovement={showImprovement}
          showWorsening={showWorsening}
          showCI={showCI}
        />

        {/* 10. Forecast Scenario Definitions & Caveats (Phase 3B) */}
        <ScenarioExplanationCard />

        {/* 11. Main Dashboard Grid: Spatial Map & Historical Time-Series */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Spatial Station Map (5 Cols) */}
          <div className="lg:col-span-5 h-[420px] lg:h-auto">
            <SpatialMap
              tree={tree}
              selectedLocationId={selectedLocationId}
              onSelectStation={setSelectedLocationId}
            />
          </div>

          {/* Historical Time-Series Chart (7 Cols) */}
          <div className="lg:col-span-7">
            <HistoricalAnalyticsChart analytics={analytics} loading={loadingAnalytics} />
          </div>
        </div>

        {/* 12. Seasonality Component Decomposition */}
        <SeasonalityChart analytics={analytics} loading={loadingAnalytics} />

        {/* 13. Plain-English Scientific Metric Glossary (Phase 3B) */}
        {explanations && <MetricGlossaryPanel metrics={explanations.metric_explanations} />}

        {/* 14. Footer Info */}
        <footer className="border-t border-eco-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-eco-muted gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              EcoTrend Phase 3B · <strong className="text-eco-text">Deterministic Explanation & Insight Engine (No LLM)</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-eco-muted font-mono text-[11px]">
            <span>PostgreSQL 16 + PostGIS + TimescaleDB</span>
            <span>·</span>
            <span>FastAPI + Next.js 14</span>
          </div>
        </footer>
      </main>

      {/* Slide-over Audit Inspector */}
      <DataAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        selectedLocationId={selectedLocationId}
      />

      {/* Model Backtest Scorecard Drawer */}
      <BacktestScorecardDrawer
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        forecast={forecast}
      />

      {/* EHS Methodology & Standards Reference Modal */}
      <EHSMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
