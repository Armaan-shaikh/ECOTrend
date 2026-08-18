'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { IndiaCitySearchLanding } from '../components/IndiaCitySearchLanding';
import { IndianCity } from '../lib/indianCities';

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

// Predictive Intelligence Components (Phase 12)
import { PredictiveOverviewCard } from '../components/PredictiveOverviewCard';
import { ScenarioAnalysisModal } from '../components/ScenarioAnalysisModal';

// Decision Automation Components (Phase 13)
import { DecisionSupportDashboard } from '../components/DecisionSupportDashboard';
import { DecisionEvidencePanel } from '../components/DecisionEvidencePanel';

import { ReliabilityDashboard } from '../components/ReliabilityDashboard';
import { WorkflowOperationsDashboard } from '../components/WorkflowOperationsDashboard';
import { GovernanceDashboard } from '../components/GovernanceDashboard';
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
  fetchOperationalAlerts,
  fetchPredictiveOverview,
  fetchDecisionOverview,
  acknowledgeDecisionRecommendation,
  resolveDecisionRecommendation
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
  SoilQualityScoreResponse,
  ClimateQualityScoreResponse,
  EmissionsQualityScoreResponse,
  NoiseQualityScoreResponse,
  MultiDomainOverviewResponse,
  CrossDomainCorrelationResponse,
  DomainComparisonResponse,
  ComplianceOverviewResponse,
  ObservabilityOverviewResponse,
  PredictiveOverviewItem,
  DecisionOverviewResponse
} from '../lib/types';

export default function DashboardPage() {
  const [domain, setDomain] = useState<EnvironmentalDomain>('overview');

  // Indian City Search & Selection State
  const [selectedIndianCity, setSelectedIndianCity] = useState<IndianCity | null>(null);
  const [loadingCityName, setLoadingCityName] = useState<string | null>(null);

  // Air Quality Domain States
  const [tree, setTree] = useState<LocationTreeItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc_us_ny_nyc_manhattan');
  const [selectedMetric, setSelectedMetric] = useState<string>('PM2.5');
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [analytics, setAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Forecasting States
  const [selectedHorizon, setSelectedHorizon] = useState<string>('1_YEAR');
  const [forecast, setForecast] = useState<ForecastProjectionResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);

  // EHS Health Score States
  const [ehsData, setEhsData] = useState<AggregateEHSResponse | null>(null);
  const [loadingEHS, setLoadingEHS] = useState<boolean>(false);
  const [historicalEHS, setHistoricalEHS] = useState<HistoricalEHSPoint[]>([]);
  const [forecastEHS, setForecastEHS] = useState<ForecastEHSResponse | null>(null);
  const [explanations, setExplanations] = useState<LocationExplanationResponse | null>(null);
  const [loadingExplanations, setLoadingExplanations] = useState<boolean>(false);

  // Water Quality Domain States
  const [waterStations, setWaterStations] = useState<LocationItem[]>([]);
  const [selectedWaterStationId, setSelectedWaterStationId] = useState<string>('wat_st_001');
  const [selectedWaterMetric, setSelectedWaterMetric] = useState<string>('DO');
  const [selectedWaterDays, setSelectedWaterDays] = useState<number>(30);
  const [waterScore, setWaterScore] = useState<WaterQualityScoreResponse | null>(null);
  const [waterAnalytics, setWaterAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [loadingWater, setLoadingWater] = useState<boolean>(false);
  const [selectedWaterHorizon, setSelectedWaterHorizon] = useState<string>('1_YEAR');
  const [waterForecast, setWaterForecast] = useState<ForecastProjectionResponse | null>(null);
  const [waterScoreForecast, setWaterScoreForecast] = useState<any | null>(null);
  const [waterExplanations, setWaterExplanations] = useState<LocationExplanationResponse | null>(null);

  // Soil Quality Domain States
  const [soilStations, setSoilStations] = useState<LocationItem[]>([]);
  const [selectedSoilStationId, setSelectedSoilStationId] = useState<string>('soil_st_001');
  const [selectedSoilMetric, setSelectedSoilMetric] = useState<string>("Pb_lead");
  const [selectedSoilDays, setSelectedSoilDays] = useState<number>(30);
  const [soilScore, setSoilScore] = useState<SoilQualityScoreResponse | null>(null);
  const [soilAnalytics, setSoilAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [loadingSoil, setLoadingSoil] = useState<boolean>(false);

  // Climate & Emissions Domain States
  const [climateStations, setClimateStations] = useState<LocationItem[]>([]);
  const [selectedClimateStationId, setSelectedClimateStationId] = useState<string>('cli_st_001');
  const [selectedClimateMetric, setSelectedClimateMetric] = useState<string>('temp_anomaly_c');
  const [selectedClimateDays, setSelectedClimateDays] = useState<number>(30);
  const [climateScore, setClimateScore] = useState<ClimateQualityScoreResponse | null>(null);
  const [climateAnalytics, setClimateAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [emissionsScore, setEmissionsScore] = useState<EmissionsQualityScoreResponse | null>(null);
  const [loadingClimate, setLoadingClimate] = useState<boolean>(false);

  // Noise Quality Domain States
  const [noiseStations, setNoiseStations] = useState<LocationItem[]>([]);
  const [selectedNoiseStationId, setSelectedNoiseStationId] = useState<string>('noise_st_001');
  const [selectedNoiseMetric, setSelectedNoiseMetric] = useState<string>('laeq_db');
  const [selectedNoiseDays, setSelectedNoiseDays] = useState<number>(30);
  const [noiseScore, setNoiseScore] = useState<NoiseQualityScoreResponse | null>(null);
  const [noiseAnalytics, setNoiseAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [loadingNoise, setLoadingNoise] = useState<boolean>(false);

  // Multi-Domain Intelligence States (Phase 8)
  const [multiOverview, setMultiOverview] = useState<MultiDomainOverviewResponse | null>(null);
  const [crossCorrelations, setCrossCorrelations] = useState<CrossDomainCorrelationResponse | null>(null);
  const [domainComparison, setDomainComparison] = useState<DomainComparisonResponse | null>(null);
  const [loadingMultiDomain, setLoadingMultiDomain] = useState<boolean>(false);

  // Compliance & Risk States (Phase 9)
  const [complianceData, setComplianceData] = useState<ComplianceOverviewResponse | null>(null);
  const [loadingCompliance, setLoadingCompliance] = useState<boolean>(false);

  // Observability & Operations States (Phase 11)
  const [obsOverview, setObsOverview] = useState<ObservabilityOverviewResponse | null>(null);
  const [loadingObs, setLoadingObs] = useState<boolean>(false);

  // Predictive Intelligence States (Phase 12)
  const [predictiveData, setPredictiveData] = useState<PredictiveOverviewItem | null>(null);
  const [loadingPredictive, setLoadingPredictive] = useState<boolean>(false);

  // Decision Automation States (Phase 13)
  const [decisionData, setDecisionData] = useState<DecisionOverviewResponse | null>(null);
  const [loadingDecision, setLoadingDecision] = useState<boolean>(false);
  const [selectedAuditRecId, setSelectedAuditRecId] = useState<string | null>(null);

  // Refresh & Pipeline Sync State
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Forecast Toggles
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
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isDecisionAuditModalOpen, setIsDecisionAuditModalOpen] = useState<boolean>(false);
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState<boolean>(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTree();
    loadWaterStations();
    loadSoilStations();
    loadClimateStations();
    loadNoiseStations();
  }, []);

  useEffect(() => {
    if (selectedIndianCity) {
      loadComplianceData();
      loadObservabilityData();
      loadPredictiveData();
      loadDecisionData();

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
    }
  }, [domain, selectedIndianCity, selectedLocationId, selectedMetric, selectedDays, selectedHorizon, selectedWaterStationId, selectedWaterMetric, selectedWaterDays, selectedWaterHorizon, selectedSoilStationId, selectedSoilMetric, selectedSoilDays, selectedClimateStationId, selectedClimateMetric, selectedClimateDays, selectedNoiseStationId, selectedNoiseMetric, selectedNoiseDays]);

  const handleCitySelect = (city: IndianCity) => {
    setLoadingCityName(city.name);
    setTimeout(() => {
      setSelectedIndianCity(city);
      setLoadingCityName(null);
    }, 650);
  };

  const handleBackToSearch = () => {
    setSelectedIndianCity(null);
    setLoadingCityName(null);
  };

  const loadTree = async () => {
    try {
      const data = await fetchLocationTree();
      setTree(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchHistoricalAnalytics(selectedLocationId, selectedMetric, selectedDays);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadForecast = async () => {
    setLoadingForecast(true);
    try {
      const data = await fetchForecastProjections(selectedLocationId, selectedMetric, String(selectedHorizon));
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const loadEHS = async () => {
    setLoadingEHS(true);
    try {
      const [curr, hist, fc] = await Promise.all([
        fetchCurrentHealthScore(selectedLocationId),
        fetchHistoricalHealthScore(selectedLocationId, selectedDays),
        fetchForecastHealthScore(selectedLocationId, String(selectedHorizon)),
      ]);
      setEhsData(curr);
      setHistoricalEHS(hist);
      setForecastEHS(fc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEHS(false);
    }
  };

  const loadExplanations = async () => {
    setLoadingExplanations(true);
    try {
      const data = await fetchLocationExplanations(selectedLocationId);
      setExplanations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanations(false);
    }
  };

  const loadWaterStations = async () => {
    try {
      const data = await fetchWaterStations();
      setWaterStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWaterData = async () => {
    setLoadingWater(true);
    try {
      const [sc, an] = await Promise.all([
        fetchWaterQualityScore(selectedWaterStationId),
        fetchHistoricalWaterAnalytics(selectedWaterStationId, selectedWaterMetric, selectedWaterDays),
      ]);
      setWaterScore(sc);
      setWaterAnalytics(an);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWater(false);
    }
  };

  const loadWaterForecastData = async () => {
    try {
      const [fcProj, fcSc, exp] = await Promise.all([
        fetchWaterForecastProjections(selectedWaterStationId, selectedWaterMetric, String(selectedWaterHorizon)),
        fetchWaterForecastScore(selectedWaterStationId, String(selectedWaterHorizon)),
        fetchWaterExplanations(selectedWaterStationId),
      ]);
      setWaterForecast(fcProj);
      setWaterScoreForecast(fcSc);
      setWaterExplanations(exp);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSoilStations = async () => {
    try {
      const data = await fetchSoilStations();
      setSoilStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSoilData = async () => {
    setLoadingSoil(true);
    try {
      const [sc, an] = await Promise.all([
        fetchSoilQualityScore(selectedSoilStationId),
        fetchHistoricalSoilAnalytics(selectedSoilStationId, selectedSoilMetric, selectedSoilDays),
      ]);
      setSoilScore(sc);
      setSoilAnalytics(an);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSoil(false);
    }
  };

  const loadClimateStations = async () => {
    try {
      const data = await fetchClimateStations();
      setClimateStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClimateData = async () => {
    setLoadingClimate(true);
    try {
      const [sc, an, emSc] = await Promise.all([
        fetchClimateQualityScore(selectedClimateStationId),
        fetchHistoricalClimateAnalytics(selectedClimateStationId, selectedClimateMetric, selectedClimateDays),
        fetchEmissionsQualityScore(selectedClimateStationId),
      ]);
      setClimateScore(sc);
      setClimateAnalytics(an);
      setEmissionsScore(emSc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClimate(false);
    }
  };

  const loadNoiseStations = async () => {
    try {
      const data = await fetchNoiseStations();
      setNoiseStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNoiseData = async () => {
    setLoadingNoise(true);
    try {
      const [sc, an] = await Promise.all([
        fetchNoiseQualityScore(selectedNoiseStationId),
        fetchHistoricalNoiseAnalytics(selectedNoiseStationId, selectedNoiseMetric, selectedNoiseDays),
      ]);
      setNoiseScore(sc);
      setNoiseAnalytics(an);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNoise(false);
    }
  };

  const loadMultiDomainData = async () => {
    setLoadingMultiDomain(true);
    try {
      const [ov, corr, comp] = await Promise.all([
        fetchMultiDomainOverview(selectedLocationId),
        fetchCrossDomainCorrelations(selectedLocationId),
        fetchDomainComparison(),
      ]);
      setMultiOverview(ov);
      setCrossCorrelations(corr);
      setDomainComparison(comp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMultiDomain(false);
    }
  };

  const loadComplianceData = async () => {
    setLoadingCompliance(true);
    try {
      const data = await fetchComplianceAlerts(selectedLocationId);
      setComplianceData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompliance(false);
    }
  };

  const loadObservabilityData = async () => {
    setLoadingObs(true);
    try {
      const data = await fetchObservabilityOverview();
      setObsOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingObs(false);
    }
  };

  const loadPredictiveData = async () => {
    setLoadingPredictive(true);
    try {
      const data = await fetchPredictiveOverview(selectedLocationId);
      setPredictiveData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPredictive(false);
    }
  };

  const loadDecisionData = async () => {
    setLoadingDecision(true);
    try {
      const data = await fetchDecisionOverview(selectedLocationId);
      setDecisionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDecision(false);
    }
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadComplianceData(),
        loadObservabilityData(),
        loadPredictiveData(),
        loadDecisionData(),
      ]);
      if (domain === 'overview') await loadMultiDomainData();
      else if (domain === 'air') await loadEHS();
      else if (domain === 'water') await loadWaterData();
      else if (domain === 'soil') await loadSoilData();
      else if (domain === 'climate') await loadClimateData();
      else await loadNoiseData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcknowledgeRec = async (id: string) => {
    await acknowledgeDecisionRecommendation(id);
    loadDecisionData();
  };

  const handleResolveRec = async (id: string) => {
    await resolveDecisionRecommendation(id);
    loadDecisionData();
  };

  const handleOpenDecisionAudit = (id: string) => {
    setSelectedAuditRecId(id);
    setIsDecisionAuditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        domain={domain}
        onSelectDomain={setDomain}
        onRefresh={handleRefreshPipeline}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenObservabilityModal={() => setIsAlertsModalOpen(true)}
        onOpenPredictiveModal={() => setIsScenarioModalOpen(true)}
        onOpenDecisionModal={() => handleOpenDecisionAudit('rec_comp_air_PM2.5_101')}
        onOpenGovernanceModal={() => setIsGovernanceModalOpen(true)}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
        onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
        onBackToSearch={handleBackToSearch}
        selectedCityName={selectedIndianCity?.name}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* LANDING PAGE / CITY SEARCH vs ANALYTICAL DASHBOARD */}
        {!selectedIndianCity || loadingCityName ? (
          <IndiaCitySearchLanding
            onSelectCity={handleCitySelect}
            selectedCity={selectedIndianCity}
            loadingCityName={loadingCityName}
          />
        ) : (
          /* TARGETED CITY ANALYTICAL DASHBOARD */
          <>
            {/* Targeted City Header Banner */}
            <div className="bg-eco-card border border-eco-border rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-eco-text">{selectedIndianCity.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {selectedIndianCity.state} ({selectedIndianCity.region})
                  </span>
                </div>
                <p className="text-xs text-eco-muted font-medium mt-1">
                  Basin: <span className="font-mono text-eco-cyan">{selectedIndianCity.majorBasin}</span> | Population: <span className="font-mono text-eco-text">{selectedIndianCity.population}</span> | Telemetry: OpenAQ v3 & CAAQMS CPCB
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 rounded-lg bg-eco-bg border border-eco-border text-eco-muted">
                  Lat: {selectedIndianCity.latitude.toFixed(2)}° | Lon: {selectedIndianCity.longitude.toFixed(2)}°
                </span>
                <button
                  onClick={handleBackToSearch}
                  className="px-3 py-1 rounded-lg bg-eco-cyan/10 hover:bg-eco-cyan/20 border border-eco-cyan/30 text-eco-cyan font-bold transition"
                >
                  Change City
                </button>
              </div>
            </div>

            {/* Phase 13: Advanced Environmental Decision Automation & Adaptive Intelligence Dashboard */}
            <DecisionSupportDashboard
              decisionData={decisionData}
              loading={loadingDecision}
              onAcknowledge={handleAcknowledgeRec}
              onResolve={handleResolveRec}
              onOpenAudit={handleOpenDecisionAudit}
              onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
            />

            {/* Phase 12: Predictive Environmental Intelligence & Decision Support Card */}
            <PredictiveOverviewCard
              predictiveData={predictiveData}
              loading={loadingPredictive}
              onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
            />

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

                <ForecastChart
                  forecast={forecast}
                  historical={analytics}
                  showBaseline={showBaseline}
                  showImprovement={showImprovement}
                  showWorsening={showWorsening}
                  showCI={showCI}
                  loading={loadingForecast}
                />

                <EHSForecastChart forecastEHS={forecastEHS} historicalEHS={historicalEHS} loading={loadingEHS} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8">
                    <HistoricalAnalyticsChart analytics={analytics} loading={loadingAnalytics} />
                  </div>
                  <div className="lg:col-span-4">
                    <SeasonalityChart analytics={analytics} loading={loadingAnalytics} />
                  </div>
                </div>

                <ScenarioExplanationCard />
                <MetricGlossaryPanel metrics={explanations?.metric_explanations || []} />
              </>
            ) : domain === 'water' ? (
              /* WATER QUALITY DOMAIN DASHBOARD */
              <>
                <WaterScoreCard
                  waterScore={waterScore}
                  loading={loadingWater}
                  onOpenMethodology={() => setIsWaterStandardsOpen(true)}
                />

                {waterScore && <WaterSubScoreCards subscores={waterScore.metric_subscores} />}

                <WaterForecastControls
                  selectedHorizon={selectedWaterHorizon}
                  showBaseline={showBaseline}
                  showImprovement={showImprovement}
                  showWorsening={showWorsening}
                  showCI={showCI}
                  championModel={waterForecast?.champion_model || 'SARIMAX Competition'}
                  onSelectHorizon={setSelectedWaterHorizon}
                  onToggleBaseline={() => setShowBaseline(!showBaseline)}
                  onToggleImprovement={() => setShowImprovement(!showImprovement)}
                  onToggleWorsening={() => setShowWorsening(!showWorsening)}
                  onToggleCI={() => setShowCI(!showCI)}
                  onOpenScorecard={() => setIsScorecardOpen(true)}
                />

                <WaterScoreForecastChart forecastScore={waterScoreForecast} loading={loadingWater} />
                <WaterGlossaryPanel />
              </>
            ) : domain === 'soil' ? (
              /* SOIL QUALITY DOMAIN DASHBOARD */
              <>
                <SoilScoreCard
                  soilScore={soilScore}
                  loading={loadingSoil}
                  onOpenMethodology={() => setIsSoilStandardsOpen(true)}
                />

                {soilScore && <SoilSubScoreCards subscores={soilScore.metric_subscores} />}
                <SoilGlossaryPanel />
              </>
            ) : domain === 'climate' ? (
              /* CLIMATE & EMISSIONS DOMAIN DASHBOARD */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6">
                    <ClimateScoreCard
                      climateScore={climateScore}
                      loading={loadingClimate}
                      onOpenMethodology={() => setIsClimateStandardsOpen(true)}
                    />
                  </div>
                  <div className="lg:col-span-6">
                    <EmissionsScoreCard emissionsScore={emissionsScore} loading={loadingClimate} />
                  </div>
                </div>

                {climateScore && <ClimateSubScoreCards subscores={climateScore.metric_subscores} />}
                <ClimateGlossaryPanel />
              </>
            ) : (
              /* NOISE POLLUTION DOMAIN DASHBOARD */
              <>
                <NoiseScoreCard
                  noiseScore={noiseScore}
                  loading={loadingNoise}
                  onOpenMethodology={() => setIsNoiseStandardsOpen(true)}
                />

                {noiseScore && <NoiseSubScoreCards subscores={noiseScore.metric_subscores} />}
                <NoiseGlossaryPanel />
              </>
            )}
          </>
        )}
      </main>

      <DataAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        selectedLocationId={selectedLocationId}
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
        alerts={obsOverview?.active_alerts || []}
        onRefreshAlerts={loadObservabilityData}
      />

      <ScenarioAnalysisModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        locationId={selectedLocationId}
      />

      <DecisionEvidencePanel
        isOpen={isDecisionAuditModalOpen}
        onClose={() => setIsDecisionAuditModalOpen(false)}
        recommendationId={selectedAuditRecId}
      />

      <GovernanceDashboard
        isOpen={isGovernanceModalOpen}
        onClose={() => setIsGovernanceModalOpen(false)}
      />

      <WorkflowOperationsDashboard
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      <ReliabilityDashboard
        isOpen={isReliabilityModalOpen}
        onClose={() => setIsReliabilityModalOpen(false)}
      />
    </div>
  );
}
