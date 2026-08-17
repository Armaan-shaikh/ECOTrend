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

// Water Components (Phase 4A & 4B)
import { WaterScoreCard } from '../components/WaterScoreCard';
import { WaterSubScoreCards } from '../components/WaterSubScoreCards';
import { WaterGlossaryPanel } from '../components/WaterGlossaryPanel';
import { WaterStandardsModal } from '../components/WaterStandardsModal';
import { WaterScoreForecastChart } from '../components/WaterScoreForecastChart';
import { WaterForecastControls } from '../components/WaterForecastControls';

// Soil Components (Phase 5A)
import { SoilScoreCard } from '../components/SoilScoreCard';
import { SoilSubScoreCards } from '../components/SoilSubScoreCards';
import { SoilGlossaryPanel } from '../components/SoilGlossaryPanel';
import { SoilStandardsModal } from '../components/SoilStandardsModal';

// Climate & Emissions Components (Phase 6A)
import { ClimateScoreCard } from '../components/ClimateScoreCard';
import { ClimateSubScoreCards } from '../components/ClimateSubScoreCards';
import { EmissionsScoreCard } from '../components/EmissionsScoreCard';
import { ClimateGlossaryPanel } from '../components/ClimateGlossaryPanel';
import { ClimateStandardsModal } from '../components/ClimateStandardsModal';

// Noise Components (Phase 7)
import { NoiseScoreCard } from '../components/NoiseScoreCard';
import { NoiseSubScoreCards } from '../components/NoiseSubScoreCards';
import { NoiseGlossaryPanel } from '../components/NoiseGlossaryPanel';
import { NoiseStandardsModal } from '../components/NoiseStandardsModal';

// Multi-Domain Intelligence Components (Phase 8)
import { MultiDomainOverviewCard } from '../components/MultiDomainOverviewCard';
import { MultiDomainRadarChart } from '../components/MultiDomainRadarChart';
import { CrossDomainCorrelationMatrix } from '../components/CrossDomainCorrelationMatrix';
import { DomainComparisonTable } from '../components/DomainComparisonTable';

// Compliance & Risk Components (Phase 9)
import { ComplianceAlertsPanel } from '../components/ComplianceAlertsPanel';
import { EnvironmentalRiskMatrix } from '../components/EnvironmentalRiskMatrix';
import { EHSReportExportModal } from '../components/EHSReportExportModal';

// Observability & Operations Components (Phase 11)
import { ObservabilityDashboardCard } from '../components/ObservabilityDashboardCard';
import { OperationalAlertsModal } from '../components/OperationalAlertsModal';

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
  fetchHistoricalWaterAnalytics,
  fetchWaterForecastProjections,
  fetchWaterForecastScore,
  fetchWaterExplanations,
  fetchSoilStations,
  fetchSoilQualityScore,
  fetchHistoricalSoilAnalytics,
  fetchClimateStations,
  fetchClimateQualityScore,
  fetchHistoricalClimateAnalytics,
  fetchEmissionsQualityScore,
  fetchNoiseStations,
  fetchNoiseQualityScore,
  fetchHistoricalNoiseAnalytics,
  fetchMultiDomainOverview,
  fetchCrossDomainCorrelations,
  fetchDomainComparison,
  fetchComplianceAlerts,
  fetchObservabilityOverview,
  fetchOperationalAlerts
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
  WaterQualityScoreResponse,
  ForecastWaterScoreResponse,
  SoilQualityScoreResponse,
  ClimateQualityScoreResponse,
  EmissionsQualityScoreResponse,
  NoiseQualityScoreResponse,
  MultiDomainOverviewResponse,
  CrossDomainCorrelationResponse,
  DomainComparisonResponse,
  ComplianceOverviewResponse,
  ObservabilityOverviewResponse,
  OperationalAlertItem
} from '../lib/types';

import { Shield, Layers, Droplet, Wind, Database, Sun, Volume2, Globe } from 'lucide-react';

export default function DashboardPage() {
  const [domain, setDomain] = useState<EnvironmentalDomain>('overview');

  // Air Domain State
  const [tree, setTree] = useState<LocationTreeItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc_us_ny_nyc_manhattan');
  const [selectedMetric, setSelectedMetric] = useState<string>('PM2.5');
  const [selectedDays, setSelectedDays] = useState<number>(90);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('1_YEAR');

  // Water Domain State
  const [waterStations, setWaterStations] = useState<LocationItem[]>([]);
  const [selectedWaterStationId, setSelectedWaterStationId] = useState<string>('loc_us_ny_hudson');
  const [selectedWaterMetric, setSelectedWaterMetric] = useState<string>('DO');

  // Soil Domain State
  const [soilStations, setSoilStations] = useState<LocationItem[]>([]);
  const [selectedSoilStationId, setSelectedSoilStationId] = useState<string>('loc_us_ny_hudson_soil');
  const [selectedSoilMetric, setSelectedSoilMetric] = useState<string>('SOC');

  // Climate Domain State
  const [climateStations, setClimateStations] = useState<LocationItem[]>([]);
  const [selectedClimateStationId, setSelectedClimateStationId] = useState<string>('loc_us_ny_nyc_climate');
  const [selectedClimateMetric, setSelectedClimateMetric] = useState<string>('T2M');

  // Noise Domain State
  const [noiseStations, setNoiseStations] = useState<LocationItem[]>([]);
  const [selectedNoiseStationId, setSelectedNoiseStationId] = useState<string>('loc_us_ny_nyc_manhattan_noise');
  const [selectedNoiseMetric, setSelectedNoiseMetric] = useState<string>('NOISE_INCIDENTS');

  // Data States
  const [analytics, setAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastProjectionResponse | null>(null);
  const [ehsData, setEhsData] = useState<AggregateEHSResponse | null>(null);
  const [historicalEHS, setHistoricalEHS] = useState<HistoricalEHSPoint[]>([]);
  const [forecastEHS, setForecastEHS] = useState<ForecastEHSResponse | null>(null);
  const [explanations, setExplanations] = useState<LocationExplanationResponse | null>(null);

  const [waterScore, setWaterScore] = useState<WaterQualityScoreResponse | null>(null);
  const [waterAnalytics, setWaterAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [waterForecast, setWaterForecast] = useState<ForecastProjectionResponse | null>(null);
  const [waterForecastScore, setWaterForecastScore] = useState<ForecastWaterScoreResponse | null>(null);
  const [waterExplanations, setWaterExplanations] = useState<LocationExplanationResponse | null>(null);

  const [soilScore, setSoilScore] = useState<SoilQualityScoreResponse | null>(null);
  const [soilAnalytics, setSoilAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);

  const [climateScore, setClimateScore] = useState<ClimateQualityScoreResponse | null>(null);
  const [emissionsScore, setEmissionsScore] = useState<EmissionsQualityScoreResponse | null>(null);
  const [climateAnalytics, setClimateAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);

  const [noiseScore, setNoiseScore] = useState<NoiseQualityScoreResponse | null>(null);
  const [noiseAnalytics, setNoiseAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);

  // Multi-Domain Unified Data States (Phase 8)
  const [multiOverview, setMultiOverview] = useState<MultiDomainOverviewResponse | null>(null);
  const [crossCorrelations, setCrossCorrelations] = useState<CrossDomainCorrelationResponse | null>(null);
  const [domainComparison, setDomainComparison] = useState<DomainComparisonResponse | null>(null);

  // Compliance & Risk Data State (Phase 9)
  const [complianceData, setComplianceData] = useState<ComplianceOverviewResponse | null>(null);

  // Observability & Reliability Data State (Phase 11)
  const [obsOverview, setObsOverview] = useState<ObservabilityOverviewResponse | null>(null);
  const [operationalAlerts, setOperationalAlerts] = useState<OperationalAlertItem[]>([]);

  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true);
  const [loadingEHS, setLoadingEHS] = useState<boolean>(true);
  const [loadingExplanations, setLoadingExplanations] = useState<boolean>(true);
  const [loadingWater, setLoadingWater] = useState<boolean>(true);
  const [loadingWaterForecast, setLoadingWaterForecast] = useState<boolean>(true);
  const [loadingSoil, setLoadingSoil] = useState<boolean>(true);
  const [loadingClimate, setLoadingClimate] = useState<boolean>(true);
  const [loadingNoise, setLoadingNoise] = useState<boolean>(true);
  const [loadingMultiDomain, setLoadingMultiDomain] = useState<boolean>(true);
  const [loadingObs, setLoadingObs] = useState<boolean>(true);
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
  const [isSoilStandardsOpen, setIsSoilStandardsOpen] = useState<boolean>(false);
  const [isClimateStandardsOpen, setIsClimateStandardsOpen] = useState<boolean>(false);
  const [isNoiseStandardsOpen, setIsNoiseStandardsOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTree();
    loadWaterStations();
    loadSoilStations();
    loadClimateStations();
    loadNoiseStations();
  }, []);

  useEffect(() => {
    loadComplianceData();
    loadObservabilityData();

    if (domain === 'overview') {
      loadMultiDomainData();
    } else if (domain === 'air') {
      loadAnalytics();
      loadForecast();
      loadEHS();
      loadExplanations();
    } else if (domain === 'water') {
      loadWaterData();
      loadWaterForecastData();
    } else if (domain === 'soil') {
      loadSoilData();
    } else if (domain === 'climate') {
      loadClimateData();
    } else {
      loadNoiseData();
    }
  }, [domain, selectedLocationId, selectedMetric, selectedDays, selectedHorizon, selectedWaterStationId, selectedWaterMetric, selectedSoilStationId, selectedSoilMetric, selectedClimateStationId, selectedClimateMetric, selectedNoiseStationId, selectedNoiseMetric]);

  const loadTree = async () => {
    const data = await fetchLocationTree();
    setTree(data);
  };

  const loadWaterStations = async () => {
    const st = await fetchWaterStations();
    setWaterStations(st);
  };

  const loadSoilStations = async () => {
    const st = await fetchSoilStations();
    setSoilStations(st);
  };

  const loadClimateStations = async () => {
    const st = await fetchClimateStations();
    setClimateStations(st);
  };

  const loadNoiseStations = async () => {
    const st = await fetchNoiseStations();
    setNoiseStations(st);
  };

  const loadComplianceData = async () => {
    try {
      const data = await fetchComplianceAlerts(selectedLocationId);
      setComplianceData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadObservabilityData = async () => {
    setLoadingObs(true);
    try {
      const [ovRes, altRes] = await Promise.all([
        fetchObservabilityOverview(),
        fetchOperationalAlerts()
      ]);
      setObsOverview(ovRes);
      setOperationalAlerts(altRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingObs(false);
    }
  };

  const loadMultiDomainData = async () => {
    setLoadingMultiDomain(true);
    try {
      const [ovRes, corrRes, compRes] = await Promise.all([
        fetchMultiDomainOverview(selectedLocationId),
        fetchCrossDomainCorrelations(selectedLocationId),
        fetchDomainComparison()
      ]);
      setMultiOverview(ovRes);
      setCrossCorrelations(corrRes);
      setDomainComparison(compRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMultiDomain(false);
    }
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

  const loadWaterForecastData = async () => {
    setLoadingWaterForecast(true);
    try {
      const [foreRes, scoreRes, expRes] = await Promise.all([
        fetchWaterForecastProjections(selectedWaterStationId, selectedWaterMetric, selectedHorizon),
        fetchWaterForecastScore(selectedWaterStationId, selectedWaterMetric, selectedHorizon),
        fetchWaterExplanations(selectedWaterStationId, selectedWaterMetric, selectedDays, selectedHorizon)
      ]);
      setWaterForecast(foreRes);
      setWaterForecastScore(scoreRes);
      setWaterExplanations(expRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWaterForecast(false);
    }
  };

  const loadSoilData = async () => {
    setLoadingSoil(true);
    try {
      const [scoreRes, analyticsRes] = await Promise.all([
        fetchSoilQualityScore(selectedSoilStationId),
        fetchHistoricalSoilAnalytics(selectedSoilStationId, selectedSoilMetric, selectedDays)
      ]);
      setSoilScore(scoreRes);
      setSoilAnalytics(analyticsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSoil(false);
    }
  };

  const loadClimateData = async () => {
    setLoadingClimate(true);
    try {
      const [cScore, eScore, analyticsRes] = await Promise.all([
        fetchClimateQualityScore(selectedClimateStationId),
        fetchEmissionsQualityScore("loc_us"),
        fetchHistoricalClimateAnalytics(selectedClimateStationId, selectedClimateMetric, selectedDays)
      ]);
      setClimateScore(cScore);
      setEmissionsScore(eScore);
      setClimateAnalytics(analyticsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClimate(false);
    }
  };

  const loadNoiseData = async () => {
    setLoadingNoise(true);
    try {
      const [scoreRes, analyticsRes] = await Promise.all([
        fetchNoiseQualityScore(selectedNoiseStationId),
        fetchHistoricalNoiseAnalytics(selectedNoiseStationId, selectedNoiseMetric, selectedDays)
      ]);
      setNoiseScore(scoreRes);
      setNoiseAnalytics(analyticsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNoise(false);
    }
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    await Promise.all([loadComplianceData(), loadObservabilityData()]);

    if (domain === 'overview') {
      await loadMultiDomainData();
    } else if (domain === 'air') {
      await Promise.all([loadAnalytics(), loadForecast(), loadEHS(), loadExplanations()]);
    } else if (domain === 'water') {
      await Promise.all([loadWaterData(), loadWaterForecastData()]);
    } else if (domain === 'soil') {
      await loadSoilData();
    } else if (domain === 'climate') {
      await loadClimateData();
    } else {
      await loadNoiseData();
    }
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col font-sans">
      {/* Top Navigation Bar with Domain Switcher & Ops Controls */}
      <Header
        domain={domain}
        onSelectDomain={setDomain}
        onRefresh={handleRefreshPipeline}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenObservabilityModal={() => setIsAlertsModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Phase 11: Real-time Platform Observability & Source Reliability Card */}
        <ObservabilityDashboardCard
          overview={obsOverview}
          loading={loadingObs}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        />

        {/* Phase 9: Environmental Risk Matrix */}
        {complianceData && (
          <EnvironmentalRiskMatrix riskAssessment={complianceData.risk_assessment} />
        )}

        {domain === 'overview' ? (
          /* UNIFIED 6-DOMAIN MULTI-INTELLIGENCE OVERVIEW (Phase 8 & 9) */
          <>
            <MultiDomainOverviewCard overview={multiOverview} loading={loadingMultiDomain} />

            {complianceData && (
              <ComplianceAlertsPanel evaluations={complianceData.evaluations} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6">
                {multiOverview && <MultiDomainRadarChart domainScores={multiOverview.domain_scores} />}
              </div>
              <div className="lg:col-span-6">
                {domainComparison && <DomainComparisonTable locations={domainComparison.locations} />}
              </div>
            </div>

            {crossCorrelations && (
              <CrossDomainCorrelationMatrix
                correlations={crossCorrelations.correlations}
                disclaimer={crossCorrelations.disclaimer}
              />
            )}
          </>
        ) : domain === 'air' ? (
          /* AIR QUALITY DOMAIN DASHBOARD */
          <>
            <LocationSelector
              tree={tree}
              selectedLocationId={selectedLocationId}
              selectedMetric={selectedMetric}
              selectedDays={selectedDays}
              onSelectLocation={setSelectedLocationId}
              onSelectMetric={setSelectedMetric}
              onSelectDays={setSelectedDays}
            />

            <EnvironmentalSummaryCard explanations={explanations} loading={loadingExplanations} />
            <KeyFindingsPanel explanations={explanations} loading={loadingExplanations} />
            <EHSGaugeCard ehsData={ehsData} loading={loadingEHS} onOpenMethodology={() => setIsMethodologyOpen(true)} />
            {ehsData && <SubScoreCards subscores={ehsData.metric_subscores} />}
            <MetricsOverview analytics={analytics} loading={loadingAnalytics} />

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

            <EHSForecastChart forecastEHS={forecastEHS} historicalEHS={historicalEHS} loading={loadingEHS} />

            <ForecastChart
              forecast={forecast}
              historical={analytics}
              loading={loadingForecast}
              showBaseline={showBaseline}
              showImprovement={showImprovement}
              showWorsening={showWorsening}
              showCI={showCI}
            />

            <ScenarioExplanationCard />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 h-[420px] lg:h-auto">
                <SpatialMap tree={tree} selectedLocationId={selectedLocationId} onSelectStation={setSelectedLocationId} />
              </div>
              <div className="lg:col-span-7">
                <HistoricalAnalyticsChart analytics={analytics} loading={loadingAnalytics} />
              </div>
            </div>

            <SeasonalityChart analytics={analytics} loading={loadingAnalytics} />
            {explanations && <MetricGlossaryPanel metrics={explanations.metric_explanations} />}
          </>
        ) : domain === 'water' ? (
          /* WATER QUALITY DOMAIN DASHBOARD */
          <>
            <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-eco-text">Freshwater Station Selector</h2>
                  <p className="text-xs text-eco-muted">Phase 4B · Water Quality Analytics Engine</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <select
                  value={selectedWaterStationId}
                  onChange={(e) => setSelectedWaterStationId(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-cyan font-sans"
                >
                  {waterStations.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>

                <select
                  value={selectedWaterMetric}
                  onChange={(e) => setSelectedWaterMetric(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-cyan font-mono"
                >
                  {['DO', 'BOD', 'COD', 'TDS', 'pH', 'Turbidity', 'Temp', 'Conductivity'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <EnvironmentalSummaryCard explanations={waterExplanations} loading={loadingWaterForecast} />
            <KeyFindingsPanel explanations={waterExplanations} loading={loadingWaterForecast} />
            <WaterScoreCard waterScore={waterScore} loading={loadingWater} onOpenMethodology={() => setIsWaterStandardsOpen(true)} />
            {waterScore && <WaterSubScoreCards subscores={waterScore.metric_subscores} />}
            <MetricsOverview analytics={waterAnalytics} loading={loadingWater} />

            <WaterForecastControls
              selectedHorizon={selectedHorizon}
              showBaseline={showBaseline}
              showImprovement={showImprovement}
              showWorsening={showWorsening}
              showCI={showCI}
              championModel={waterForecast?.champion_model || 'Model Competition'}
              onSelectHorizon={setSelectedHorizon}
              onToggleBaseline={() => setShowBaseline(!showBaseline)}
              onToggleImprovement={() => setShowImprovement(!showImprovement)}
              onToggleWorsening={() => setShowWorsening(!showWorsening)}
              onToggleCI={() => setShowCI(!showCI)}
              onOpenScorecard={() => setIsScorecardOpen(true)}
            />

            <WaterScoreForecastChart forecastScore={waterForecastScore} loading={loadingWaterForecast} />

            <ForecastChart
              forecast={waterForecast}
              historical={waterAnalytics}
              loading={loadingWaterForecast}
              showBaseline={showBaseline}
              showImprovement={showImprovement}
              showWorsening={showWorsening}
              showCI={showCI}
            />

            <ScenarioExplanationCard />

            <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
              <HistoricalAnalyticsChart analytics={waterAnalytics} loading={loadingWater} />
            </div>

            <WaterGlossaryPanel />
          </>
        ) : domain === 'soil' ? (
          /* SOIL QUALITY DOMAIN DASHBOARD */
          <>
            <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-eco-amber/10 border border-eco-amber/20 text-eco-amber">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-eco-text">Soil Sampling Site Selector</h2>
                  <p className="text-xs text-eco-muted">Phase 5A · Soil & Land Quality Pipeline</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <select
                  value={selectedSoilStationId}
                  onChange={(e) => setSelectedSoilStationId(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-amber font-sans"
                >
                  {soilStations.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>

                <select
                  value={selectedSoilMetric}
                  onChange={(e) => setSelectedSoilMetric(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-eco-amber font-mono"
                >
                  {['SOC', 'pH', 'Pb', 'Cd', 'As', 'Hg', 'Cr', 'TPH', 'EC', 'Moisture'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <SoilScoreCard soilScore={soilScore} loading={loadingSoil} onOpenMethodology={() => setIsSoilStandardsOpen(true)} />
            {soilScore && <SoilSubScoreCards subscores={soilScore.metric_subscores} />}
            <MetricsOverview analytics={soilAnalytics} loading={loadingSoil} />

            <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
              <HistoricalAnalyticsChart analytics={soilAnalytics} loading={loadingSoil} />
            </div>

            <SoilGlossaryPanel />
          </>
        ) : domain === 'climate' ? (
          /* CLIMATE & EMISSIONS DOMAIN DASHBOARD */
          <>
            <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-eco-text">Weather Observatory & Climate Selector</h2>
                  <p className="text-xs text-eco-muted">Phase 6A · Climate & Emissions Intelligence Pipeline</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <select
                  value={selectedClimateStationId}
                  onChange={(e) => setSelectedClimateStationId(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 font-sans"
                >
                  {climateStations.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>

                <select
                  value={selectedClimateMetric}
                  onChange={(e) => setSelectedClimateMetric(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                >
                  {['T2M', 'T_ANOMALY', 'PRECIP', 'RH2M', 'WS10M'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <ClimateScoreCard climateScore={climateScore} loading={loadingClimate} onOpenMethodology={() => setIsClimateStandardsOpen(true)} />
            {climateScore && <ClimateSubScoreCards subscores={climateScore.metric_subscores} />}
            <EmissionsScoreCard emissionsScore={emissionsScore} loading={loadingClimate} />
            <MetricsOverview analytics={climateAnalytics} loading={loadingClimate} />

            <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
              <HistoricalAnalyticsChart analytics={climateAnalytics} loading={loadingClimate} />
            </div>

            <ClimateGlossaryPanel />
          </>
        ) : (
          /* NOISE & ACOUSTIC DISTURBANCE DOMAIN DASHBOARD */
          <>
            <div className="bg-eco-card border border-eco-border rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-eco-text">Acoustic Monitoring Site Selector</h2>
                  <p className="text-xs text-eco-muted">Phase 7 · Acoustic Disturbance Intelligence Pipeline</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <select
                  value={selectedNoiseStationId}
                  onChange={(e) => setSelectedNoiseStationId(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 font-sans"
                >
                  {noiseStations.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>

                <select
                  value={selectedNoiseMetric}
                  onChange={(e) => setSelectedNoiseMetric(e.target.value)}
                  className="bg-eco-bg border border-eco-border text-eco-text rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 font-mono"
                >
                  {['NOISE_INCIDENTS'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <NoiseScoreCard noiseScore={noiseScore} loading={loadingNoise} onOpenMethodology={() => setIsNoiseStandardsOpen(true)} />
            {noiseScore && <NoiseSubScoreCards subscores={noiseScore.metric_subscores} />}
            <MetricsOverview analytics={noiseAnalytics} loading={loadingNoise} />

            <div className="bg-eco-card border border-eco-border rounded-2xl p-6 shadow-lg">
              <HistoricalAnalyticsChart analytics={noiseAnalytics} loading={loadingNoise} />
            </div>

            <NoiseGlossaryPanel />
          </>
        )}

        {/* Footer Info */}
        <footer className="border-t border-eco-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-eco-muted gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              EcoTrend Phase 11 · <strong className="text-eco-text">Observability & Data Operations Platform</strong>
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
        selectedLocationId={selectedLocationId}
      />

      <BacktestScorecardDrawer
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        forecast={domain === 'air' ? forecast : waterForecast}
      />

      <EHSMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <WaterStandardsModal
        isOpen={isWaterStandardsOpen}
        onClose={() => setIsWaterStandardsOpen(false)}
      />

      <SoilStandardsModal
        isOpen={isSoilStandardsOpen}
        onClose={() => setIsSoilStandardsOpen(false)}
      />

      <ClimateStandardsModal
        isOpen={isClimateStandardsOpen}
        onClose={() => setIsClimateStandardsOpen(false)}
      />

      <NoiseStandardsModal
        isOpen={isNoiseStandardsOpen}
        onClose={() => setIsNoiseStandardsOpen(false)}
      />

      <EHSReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locationId={selectedLocationId}
      />

      <OperationalAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={operationalAlerts}
        onRefreshAlerts={loadObservabilityData}
      />
    </div>
  );
}
