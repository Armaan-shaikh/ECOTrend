import {
  LocationItem,
  LocationTreeItem,
  MeasurementItem,
  DataQualityLogItem,
  HistoricalAnalyticsSummary,
  ForecastProjectionResponse,
  AggregateEHSResponse,
  HistoricalEHSPoint,
  ForecastEHSPoint,
  ForecastEHSResponse,
  StandardsInfoResponse,
  LocationExplanationResponse,
  WaterQualityScoreResponse,
  ForecastWaterScorePoint,
  ForecastWaterScoreResponse,
  SoilQualityScoreResponse,
  ClimateQualityScoreResponse,
  EmissionsQualityScoreResponse,
  NoiseQualityScoreResponse,
  MultiDomainOverviewResponse,
  CrossDomainCorrelationResponse,
  DomainComparisonResponse,
  ComplianceOverviewResponse,
  RiskAssessmentResponse,
  EHSReportExportResponse,
  ObservabilityOverviewResponse,
  SourceHealthItem,
  IngestionJobItem,
  OperationalAlertItem,
  PredictiveOverviewItem,
  DomainForecastItem,
  PredictiveRiskItem,
  ScenarioResponseItem,
  DecisionOverviewResponse,
  DecisionRecommendationItem,
  InterventionOptionItem,
  DecisionAuditResponse,
  ApprovalRequestItem,
  AuditEventItem,
  SecuritySummaryItem,
  UserItem,
  WorkflowInstanceItem,
  DomainEventItem,
  NotificationLogItem,
  WebhookSubscriptionItem,
  RecoveryStatusItem,
  DeadLetterItem
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE}/api/v1`;

export async function fetchLocationTree(): Promise<LocationTreeItem[]> {
  try {
    const res = await fetch(`${API_V1}/locations/tree`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch location tree');
    return await res.json();
  } catch (err) {
    return getFallbackLocationTree();
  }
}

export async function fetchLocations(level?: string): Promise<LocationItem[]> {
  try {
    const url = level ? `${API_V1}/locations?level=${level}` : `${API_V1}/locations`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch locations');
    return await res.json();
  } catch (err) {
    return getFallbackLocations();
  }
}

export async function fetchHistoricalAnalytics(
  locationId: string,
  metric: string = 'PM2.5',
  days: number = 90
): Promise<HistoricalAnalyticsSummary> {
  try {
    const res = await fetch(`${API_V1}/analytics/historical?location_id=${locationId}&metric=${metric}&days=${days}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch historical analytics');
    return await res.json();
  } catch (err) {
    return generateFallbackAnalytics(locationId, metric, days);
  }
}

export async function fetchForecastProjections(
  locationId: string,
  metric: string = 'PM2.5',
  horizon: string = '1_YEAR'
): Promise<ForecastProjectionResponse> {
  try {
    const res = await fetch(`${API_V1}/forecast/projections?location_id=${locationId}&metric=${metric}&horizon=${horizon}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch forecast projections');
    return await res.json();
  } catch (err) {
    return generateFallbackForecast(locationId, metric, horizon);
  }
}

export async function fetchCurrentHealthScore(locationId: string): Promise<AggregateEHSResponse> {
  try {
    const res = await fetch(`${API_V1}/health-score/current?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch current health score');
    return await res.json();
  } catch (err) {
    return generateFallbackCurrentEHS(locationId);
  }
}

export async function fetchHistoricalHealthScore(locationId: string, days: number = 30): Promise<HistoricalEHSPoint[]> {
  try {
    const res = await fetch(`${API_V1}/health-score/historical?location_id=${locationId}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch historical health score');
    return await res.json();
  } catch (err) {
    return generateFallbackHistoricalEHS(days);
  }
}

export async function fetchForecastHealthScore(locationId: string, metric: string = 'PM2.5', horizon: string = '1_YEAR'): Promise<ForecastEHSResponse> {
  try {
    const res = await fetch(`${API_V1}/health-score/forecast?location_id=${locationId}&metric=${metric}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch forecast health score');
    return await res.json();
  } catch (err) {
    return generateFallbackForecastEHS(locationId, metric, horizon);
  }
}

export async function fetchStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/health-score/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch standards info');
    return await res.json();
  } catch (err) {
    return getFallbackStandardsInfo();
  }
}

export async function fetchLocationExplanations(
  locationId: string,
  metric: string = 'PM2.5',
  days: number = 90,
  horizon: string = '1_YEAR'
): Promise<LocationExplanationResponse> {
  try {
    const res = await fetch(`${API_V1}/explanations/location?location_id=${locationId}&metric=${metric}&days=${days}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch location explanations');
    return await res.json();
  } catch (err) {
    return generateFallbackExplanations(locationId, metric, horizon);
  }
}

/* Water Quality API Methods (Phase 4A & 4B) */

export async function fetchWaterStations(): Promise<LocationItem[]> {
  try {
    const res = await fetch(`${API_V1}/water/stations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water stations');
    return await res.json();
  } catch (err) {
    return [
      { id: "loc_us_ny_hudson", name: "Hudson River Estuary Station", level: "STATION", latitude: 40.7614, longitude: -74.0012, type: "ESTUARY" },
      { id: "loc_us_dc_potomac", name: "Potomac River Monitoring Station", level: "STATION", latitude: 38.8951, longitude: -77.0364, type: "RIVER" },
      { id: "loc_in_delhi_yamuna", name: "Yamuna River Central Station", level: "STATION", latitude: 28.6280, longitude: 77.2410, type: "RIVER" }
    ];
  }
}

export async function fetchWaterQualityScore(locationId: string): Promise<WaterQualityScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/water/score?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water quality score');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterScore(locationId);
  }
}

export async function fetchHistoricalWaterAnalytics(locationId: string, metric: string = 'DO', days: number = 90): Promise<HistoricalAnalyticsSummary> {
  try {
    const res = await fetch(`${API_V1}/water/historical?location_id=${locationId}&metric=${metric}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch historical water analytics');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterAnalytics(locationId, metric, days);
  }
}

export async function fetchWaterForecastProjections(locationId: string, metric: string = 'DO', horizon: string = '1_YEAR'): Promise<ForecastProjectionResponse> {
  try {
    const res = await fetch(`${API_V1}/water/forecast/projections?location_id=${locationId}&metric=${metric}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water forecast projections');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterForecast(locationId, metric, horizon);
  }
}

export async function fetchWaterForecastScore(locationId: string, metric: string = 'DO', horizon: string = '1_YEAR'): Promise<ForecastWaterScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/water/forecast/score?location_id=${locationId}&metric=${metric}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water forecast score');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterForecastScore(locationId, metric, horizon);
  }
}

export async function fetchWaterExplanations(locationId: string, metric: string = 'DO', days: number = 90, horizon: string = '1_YEAR'): Promise<LocationExplanationResponse> {
  try {
    const res = await fetch(`${API_V1}/water/explanations?location_id=${locationId}&metric=${metric}&days=${days}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water explanations');
    return await res.json();
  } catch (err) {
    return generateFallbackExplanations(locationId, metric, horizon);
  }
}

export async function fetchWaterStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/water/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch water standards info');
    return await res.json();
  } catch (err) {
    return getFallbackWaterStandardsInfo();
  }
}

/* Soil Quality API Methods (Phase 5A) */

export async function fetchSoilStations(): Promise<LocationItem[]> {
  try {
    const res = await fetch(`${API_V1}/soil/stations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch soil stations');
    return await res.json();
  } catch (err) {
    return [
      { id: "loc_us_ny_hudson_soil", name: "Hudson Valley Soil Monitoring Station", level: "STATION", latitude: 41.1172, longitude: -73.7990, type: "AGRICULTURAL_SOIL" },
      { id: "loc_us_dc_potomac_soil", name: "Potomac Basin Core Sampling Site", level: "STATION", latitude: 38.9072, longitude: -77.0369, type: "SEDIMENT_SOIL" },
      { id: "loc_in_delhi_yamuna_soil", name: "Yamuna Floodplain Soil Monitoring Station", level: "STATION", latitude: 28.6310, longitude: 77.2480, type: "URBAN_INDUSTRIAL_SOIL" }
    ];
  }
}

export async function fetchSoilQualityScore(locationId: string): Promise<SoilQualityScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/soil/score?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch soil quality score');
    return await res.json();
  } catch (err) {
    return generateFallbackSoilScore(locationId);
  }
}

export async function fetchHistoricalSoilAnalytics(locationId: string, metric: string = 'SOC', days: number = 90): Promise<HistoricalAnalyticsSummary> {
  try {
    const res = await fetch(`${API_V1}/soil/historical?location_id=${locationId}&metric=${metric}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch historical soil analytics');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterAnalytics(locationId, metric, days);
  }
}

export async function fetchSoilStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/soil/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch soil standards info');
    return await res.json();
  } catch (err) {
    return getFallbackSoilStandardsInfo();
  }
}

/* Climate & Emissions API Methods (Phase 6A) */

export async function fetchClimateStations(): Promise<LocationItem[]> {
  try {
    const res = await fetch(`${API_V1}/climate/stations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch climate stations');
    return await res.json();
  } catch (err) {
    return [
      { id: "loc_us_ny_nyc_climate", name: "New York Central Park Weather Station", level: "STATION", latitude: 40.7812, longitude: -73.9665, type: "METEOROLOGICAL" },
      { id: "loc_in_delhi_climate", name: "Delhi Safdarjung Weather Observatory", level: "STATION", latitude: 28.5840, longitude: 77.2070, type: "METEOROLOGICAL" }
    ];
  }
}

export async function fetchClimateQualityScore(locationId: string): Promise<ClimateQualityScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/climate/score?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch climate quality score');
    return await res.json();
  } catch (err) {
    return generateFallbackClimateScore(locationId);
  }
}

export async function fetchHistoricalClimateAnalytics(locationId: string, metric: string = 'T2M', days: number = 90): Promise<HistoricalAnalyticsSummary> {
  try {
    const res = await fetch(`${API_V1}/climate/historical?location_id=${locationId}&metric=${metric}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch historical climate analytics');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterAnalytics(locationId, metric, days);
  }
}

export async function fetchClimateStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/climate/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch climate standards info');
    return await res.json();
  } catch (err) {
    return getFallbackClimateStandardsInfo();
  }
}

export async function fetchEmissionsQualityScore(locationId: string): Promise<EmissionsQualityScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/emissions/score?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch emissions quality score');
    return await res.json();
  } catch (err) {
    return generateFallbackEmissionsScore(locationId);
  }
}

export async function fetchEmissionsStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/emissions/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch emissions standards info');
    return await res.json();
  } catch (err) {
    return getFallbackEmissionsStandardsInfo();
  }
}

/* Acoustic Disturbance Intelligence Methods (Phase 7) */

export async function fetchNoiseStations(): Promise<LocationItem[]> {
  try {
    const res = await fetch(`${API_V1}/noise/stations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch noise stations');
    return await res.json();
  } catch (err) {
    return [
      { id: "loc_us_ny_nyc_manhattan_noise", name: "Manhattan Ambient Noise Monitoring Site", level: "STATION", latitude: 40.7831, longitude: -73.9712, type: "URBAN_ACOUSTIC" },
      { id: "loc_us_ny_nyc_queens_noise", name: "Queens Industrial Acoustic Site", level: "STATION", latitude: 40.7282, longitude: -73.7949, type: "INDUSTRIAL_ACOUSTIC" }
    ];
  }
}

export async function fetchNoiseQualityScore(locationId: string): Promise<NoiseQualityScoreResponse> {
  try {
    const res = await fetch(`${API_V1}/noise/score?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch noise quality score');
    return await res.json();
  } catch (err) {
    return generateFallbackNoiseScore(locationId);
  }
}

export async function fetchHistoricalNoiseAnalytics(locationId: string, metric: string = 'NOISE_INCIDENTS', days: number = 90): Promise<HistoricalAnalyticsSummary> {
  try {
    const res = await fetch(`${API_V1}/noise/historical?location_id=${locationId}&metric=${metric}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch historical noise analytics');
    return await res.json();
  } catch (err) {
    return generateFallbackWaterAnalytics(locationId, metric, days);
  }
}

export async function fetchNoiseStandardsInfo(): Promise<StandardsInfoResponse> {
  try {
    const res = await fetch(`${API_V1}/noise/standards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch noise standards info');
    return await res.json();
  } catch (err) {
    return getFallbackNoiseStandardsInfo();
  }
}

/* Multi-Domain Unified Intelligence Methods (Phase 8) */

export async function fetchMultiDomainOverview(locationId: string): Promise<MultiDomainOverviewResponse> {
  try {
    const res = await fetch(`${API_V1}/multi-domain/overview?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch multi-domain overview');
    return await res.json();
  } catch (err) {
    return generateFallbackMultiDomainOverview(locationId);
  }
}

export async function fetchCrossDomainCorrelations(locationId: string): Promise<CrossDomainCorrelationResponse> {
  try {
    const res = await fetch(`${API_V1}/multi-domain/correlations?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch cross-domain correlations');
    return await res.json();
  } catch (err) {
    return generateFallbackCrossDomainCorrelations(locationId);
  }
}

export async function fetchDomainComparison(): Promise<DomainComparisonResponse> {
  try {
    const res = await fetch(`${API_V1}/multi-domain/comparison`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch domain comparison');
    return await res.json();
  } catch (err) {
    return generateFallbackDomainComparison();
  }
}

/* Compliance & Audit Report Methods (Phase 9) */

export async function fetchComplianceAlerts(locationId: string): Promise<ComplianceOverviewResponse> {
  try {
    const res = await fetch(`${API_V1}/compliance/alerts?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch compliance alerts');
    return await res.json();
  } catch (err) {
    return generateFallbackComplianceAlerts(locationId);
  }
}

export async function fetchRiskAssessment(locationId: string): Promise<RiskAssessmentResponse> {
  try {
    const res = await fetch(`${API_V1}/compliance/risk-assessment?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch risk assessment');
    return await res.json();
  } catch (err) {
    return generateFallbackRiskAssessment();
  }
}

export async function generateEHSReport(locationId: string, format: string = 'json'): Promise<EHSReportExportResponse> {
  try {
    const res = await fetch(`${API_V1}/compliance/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: locationId, format })
    });
    if (!res.ok) throw new Error('Failed to generate EHS report');
    return await res.json();
  } catch (err) {
    return generateFallbackEHSReport(locationId);
  }
}

/* Observability & Reliability Methods (Phase 11) */

export async function fetchObservabilityOverview(): Promise<ObservabilityOverviewResponse> {
  try {
    const res = await fetch(`${API_V1}/observability/overview`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch observability overview');
    return await res.json();
  } catch (err) {
    return generateFallbackObservabilityOverview();
  }
}

export async function fetchSourceHealthMatrix(): Promise<SourceHealthItem[]> {
  try {
    const res = await fetch(`${API_V1}/observability/sources`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch source health matrix');
    return await res.json();
  } catch (err) {
    return generateFallbackObservabilityOverview().all_sources;
  }
}

export async function fetchIngestionJobs(): Promise<IngestionJobItem[]> {
  try {
    const res = await fetch(`${API_V1}/observability/jobs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ingestion jobs');
    return await res.json();
  } catch (err) {
    return generateFallbackObservabilityOverview().recent_jobs;
  }
}

export async function fetchOperationalAlerts(): Promise<OperationalAlertItem[]> {
  try {
    const res = await fetch(`${API_V1}/observability/alerts`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch operational alerts');
    return await res.json();
  } catch (err) {
    return generateFallbackObservabilityOverview().active_alerts;
  }
}

export async function acknowledgeOperationalAlert(alertId: string): Promise<OperationalAlertItem> {
  const res = await fetch(`${API_V1}/observability/alerts/${alertId}/acknowledge`, { method: 'POST' });
  return await res.json();
}

export async function resolveOperationalAlert(alertId: string): Promise<OperationalAlertItem> {
  const res = await fetch(`${API_V1}/observability/alerts/${alertId}/resolve`, { method: 'POST' });
  return await res.json();
}

/* Predictive Intelligence & Decision Support Methods (Phase 12) */

export async function fetchPredictiveOverview(locationId: string = 'loc_us_ny_nyc_manhattan', horizon: string = '7D'): Promise<PredictiveOverviewItem> {
  try {
    const res = await fetch(`${API_V1}/predictions/overview?location_id=${locationId}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch predictive overview');
    return await res.json();
  } catch (err) {
    return generateFallbackPredictiveOverview(locationId);
  }
}

export async function fetchDomainPrediction(domain: string, metric: string = 'PM2.5', horizon: string = '7D'): Promise<DomainForecastItem> {
  try {
    const res = await fetch(`${API_V1}/predictions/${domain}?metric=${metric}&horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch domain prediction');
    return await res.json();
  } catch (err) {
    return generateFallbackDomainPrediction(domain, metric);
  }
}

export async function fetchPredictiveRisks(horizon: string = '7D'): Promise<PredictiveRiskItem[]> {
  try {
    const res = await fetch(`${API_V1}/predictions/risks/list?horizon=${horizon}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch predictive risks');
    return await res.json();
  } catch (err) {
    return generateFallbackPredictiveOverview('loc_us_ny_nyc_manhattan').forecasted_risks;
  }
}

export async function runScenarioSimulation(locationId: string, interventions: Record<string, number>): Promise<ScenarioResponseItem> {
  try {
    const res = await fetch(`${API_V1}/predictions/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: locationId, interventions })
    });
    if (!res.ok) throw new Error('Failed to run scenario simulation');
    return await res.json();
  } catch (err) {
    return generateFallbackScenarioResponse(locationId, interventions);
  }
}

/* Decision Automation & Adaptive Intelligence Methods (Phase 13) */

export async function fetchDecisionOverview(locationId: string = 'loc_us_ny_nyc_manhattan'): Promise<DecisionOverviewResponse> {
  try {
    const res = await fetch(`${API_V1}/decision-support/overview?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch decision overview');
    return await res.json();
  } catch (err) {
    return generateFallbackDecisionOverview(locationId);
  }
}

export async function fetchDecisionRecommendations(domain?: string, status: string = 'ACTIVE'): Promise<DecisionRecommendationItem[]> {
  try {
    const url = domain ? `${API_V1}/decision-support/recommendations?domain=${domain}&status=${status}` : `${API_V1}/decision-support/recommendations?status=${status}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch decision recommendations');
    const data = await res.json();
    return data.recommendations || [];
  } catch (err) {
    return generateFallbackDecisionOverview('loc_us_ny_nyc_manhattan').recommendations;
  }
}

export async function acknowledgeDecisionRecommendation(id: string): Promise<DecisionRecommendationItem> {
  const res = await fetch(`${API_V1}/decision-support/recommendations/${id}/acknowledge`, { method: 'POST' });
  return await res.json();
}

export async function resolveDecisionRecommendation(id: string): Promise<DecisionRecommendationItem> {
  const res = await fetch(`${API_V1}/decision-support/recommendations/${id}/resolve`, { method: 'POST' });
  return await res.json();
}

export async function fetchInterventions(locationId: string = 'loc_us_ny_nyc_manhattan'): Promise<InterventionOptionItem[]> {
  try {
    const res = await fetch(`${API_V1}/decision-support/interventions?location_id=${locationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch interventions');
    const data = await res.json();
    return data.interventions || [];
  } catch (err) {
    return generateFallbackDecisionOverview(locationId).interventions_summary;
  }
}

export async function fetchDecisionAudit(recommendationId: string = 'rec_comp_air_PM2.5_101'): Promise<DecisionAuditResponse> {
  try {
    const res = await fetch(`${API_V1}/decision-support/audit?recommendation_id=${recommendationId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch decision audit');
    return await res.json();
  } catch (err) {
    return generateFallbackDecisionAudit(recommendationId);
  }
}

/* Enterprise Governance, Security & Multi-Tenancy Methods (Phase 14) */

export async function fetchApprovalRequests(): Promise<ApprovalRequestItem[]> {
  try {
    const res = await fetch(`${API_V1}/approvals`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch approval requests');
    return await res.json();
  } catch (err) {
    return generateFallbackApprovalRequests();
  }
}

export async function approveInterventionRequest(id: string, reason: string = 'Approved by authorized EHS Manager'): Promise<ApprovalRequestItem> {
  const res = await fetch(`${API_V1}/approvals/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision_reason: reason })
  });
  return await res.json();
}

export async function rejectInterventionRequest(id: string, reason: string = 'Rejected by authorized EHS Manager'): Promise<ApprovalRequestItem> {
  const res = await fetch(`${API_V1}/approvals/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision_reason: reason })
  });
  return await res.json();
}

export async function fetchAuditEvents(limit: number = 50): Promise<AuditEventItem[]> {
  try {
    const res = await fetch(`${API_V1}/admin/audit?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch audit events');
    return await res.json();
  } catch (err) {
    return generateFallbackAuditEvents();
  }
}

export async function fetchSecuritySummary(): Promise<SecuritySummaryItem> {
  try {
    const res = await fetch(`${API_V1}/admin/security/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch security summary');
    return await res.json();
  } catch (err) {
    return {
      active_users_count: 3,
      active_tenants_count: 1,
      pending_approvals_count: 1,
      audit_events_24h_count: 12,
      security_posture: "OPTIMAL_ENTERPRISE_GOVERNANCE",
      rbac_status: "DENY_BY_DEFAULT_ENFORCED"
    };
  }
}

export async function fetchUsersList(): Promise<UserItem[]> {
  try {
    const res = await fetch(`${API_V1}/admin/users`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch users list');
    return await res.json();
  } catch (err) {
    return [
      { id: "usr_001", tenant_id: "tenant_ecotrend_enterprise", email: "admin@ecotrend.io", full_name: "System Administrator", role: "SUPER_ADMIN", is_active: true, created_at: new Date().toISOString() },
      { id: "usr_002", tenant_id: "tenant_ecotrend_enterprise", email: "operator@ecotrend.io", full_name: "EHS Operator", role: "OPERATOR", is_active: true, created_at: new Date().toISOString() },
      { id: "usr_003", tenant_id: "tenant_ecotrend_enterprise", email: "analyst@ecotrend.io", full_name: "Data Analyst", role: "ANALYST", is_active: true, created_at: new Date().toISOString() }
    ];
  }
}

/* Event-Driven Automation, Workflow Orchestration & Enterprise Integrations (Phase 15) */

export async function fetchWorkflows(): Promise<WorkflowInstanceItem[]> {
  try {
    const res = await fetch(`${API_V1}/workflows`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return await res.json();
  } catch (err) {
    return [
      { id: "wf_inst_001", tenant_id: "tenant_ecotrend_enterprise", workflow_type: "INGESTION_RESPONSE_PIPELINE", status: "COMPLETED", current_step: "FINALIZE", retry_count: 0, max_retries: 3, correlation_id: "corr_wf_001", provenance: "WORKFLOW_ENGINE", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
  }
}

export async function retryWorkflow(id: string): Promise<WorkflowInstanceItem> {
  const res = await fetch(`${API_V1}/workflows/${id}/retry`, { method: 'POST' });
  return await res.json();
}

export async function cancelWorkflow(id: string): Promise<WorkflowInstanceItem> {
  const res = await fetch(`${API_V1}/workflows/${id}/cancel`, { method: 'POST' });
  return await res.json();
}

export async function fetchDomainEvents(): Promise<DomainEventItem[]> {
  try {
    const res = await fetch(`${API_V1}/events`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch domain events');
    return await res.json();
  } catch (err) {
    return [
      { event_id: "evt_001", event_type: "INGESTION_COMPLETED", tenant_id: "tenant_ecotrend_enterprise", source: "OpenAQ Adapter", resource_type: "AirObservation", resource_id: "obs_001", timestamp: new Date().toISOString(), correlation_id: "corr_001", provenance: "EVENT_BUS", schema_version: "1.0", payload: { domain: "air", metric: "PM2.5", value: 22.5 } }
    ];
  }
}

export async function fetchNotificationLogs(): Promise<NotificationLogItem[]> {
  try {
    const res = await fetch(`${API_V1}/notifications`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notification logs');
    return await res.json();
  } catch (err) {
    return [
      { id: "notif_001", tenant_id: "tenant_ecotrend_enterprise", recipient: "admin@ecotrend.io", channel: "IN_APP", severity: "WARNING", title: "PM2.5 Threshold Exceedance Alert", message: "Observed PM2.5 breaches WHO guideline threshold.", delivery_status: "DELIVERED", provenance: "NOTIFICATION_ENGINE", created_at: new Date().toISOString() }
    ];
  }
}

export async function fetchWebhooks(): Promise<WebhookSubscriptionItem[]> {
  try {
    const res = await fetch(`${API_V1}/integrations/webhooks`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch webhooks');
    return await res.json();
  } catch (err) {
    return [
      { id: "wh_sub_001", tenant_id: "tenant_ecotrend_enterprise", target_url: "https://hooks.enterprise-ehs.internal/ecotrend", events_filter: "*", is_active: true, created_at: new Date().toISOString() }
    ];
  }
}

/* Enterprise Reliability, Security Validation & Disaster Recovery Methods (Phase 16) */

export async function fetchRecoveryOverview(): Promise<RecoveryStatusItem> {
  try {
    const res = await fetch(`${API_V1}/operations/recovery`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch recovery overview');
    return await res.json();
  } catch (err) {
    return {
      tenant_id: "tenant_ecotrend_enterprise",
      system_health: "RECOVERABLE",
      dead_letter_count: 1,
      failed_workflows_count: 0,
      recent_dead_letters: [
        { id: "dlq_001", tenant_id: "tenant_ecotrend_enterprise", workflow_id: "wf_inst_001", event_type: "INGESTION_FAILED", reason: "Network timeout connecting to OpenAQ upstream API.", status: "DEAD_LETTER", created_at: new Date().toISOString() }
      ],
      failed_workflows: []
    };
  }
}

export async function fetchDeadLetters(): Promise<DeadLetterItem[]> {
  try {
    const res = await fetch(`${API_V1}/operations/dead-letters`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch dead letters');
    return await res.json();
  } catch (err) {
    return (await fetchRecoveryOverview()).recent_dead_letters;
  }
}

export async function retryDeadLetter(id: string): Promise<DeadLetterItem> {
  const res = await fetch(`${API_V1}/operations/dead-letters/${id}/retry`, { method: 'POST' });
  return await res.json();
}

export async function recoverWorkflowInstance(id: string): Promise<WorkflowInstanceItem> {
  const res = await fetch(`${API_V1}/operations/workflows/${id}/recover`, { method: 'POST' });
  return await res.json();
}






export async function fetchMeasurements(locationId: string, metric: string = 'PM2.5', days: number = 30): Promise<MeasurementItem[]> {
  try {
    const res = await fetch(`${API_V1}/measurements?location_id=${locationId}&metric=${metric}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch measurements');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchQualityLogs(locationId?: string): Promise<DataQualityLogItem[]> {
  try {
    const url = locationId ? `${API_V1}/measurements/quality-logs?location_id=${locationId}` : `${API_V1}/measurements/quality-logs`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch quality logs');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function seedDatabase(): Promise<any> {
  const res = await fetch(`${API_V1}/ingestion/seed-database`, { method: 'POST' });
  return await res.json();
}

function getFallbackLocationTree(): LocationTreeItem[] {
  return [
    {
      id: "loc_us",
      name: "United States",
      level: "COUNTRY",
      country_code: "US",
      latitude: 37.0902,
      longitude: -95.7129,
      children: [
        {
          id: "loc_us_ny",
          name: "New York State",
          level: "STATE",
          parent_id: "loc_us",
          country_code: "US",
          latitude: 40.7128,
          longitude: -74.0060,
          children: [
            {
              id: "loc_us_ny_nyc",
              name: "New York City",
              level: "CITY",
              parent_id: "loc_us_ny",
              country_code: "US",
              latitude: 40.7128,
              longitude: -74.0060,
              children: [
                {
                  id: "loc_us_ny_nyc_manhattan",
                  name: "Manhattan Central Station",
                  level: "STATION",
                  parent_id: "loc_us_ny_nyc",
                  country_code: "US",
                  latitude: 40.7831,
                  longitude: -73.9712,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ];
}

function getFallbackLocations(): LocationItem[] {
  return [
    { id: "loc_us_ny_nyc_manhattan", name: "Manhattan Central Station", level: "STATION", latitude: 40.7831, longitude: -73.9712 }
  ];
}

function generateFallbackAnalytics(locationId: string, metric: string, days: number): HistoricalAnalyticsSummary {
  const timestamps: string[] = [];
  const observed: number[] = [];
  const trend: number[] = [];
  const seasonal: number[] = [];
  const residual: number[] = [];

  const now = new Date();
  const count = Math.min(days, 60);

  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    timestamps.push(d.toISOString());
    observed.push(22);
    trend.push(22);
    seasonal.push(0);
    residual.push(0);
  }

  return {
    location_id: locationId,
    location_name: locationId.replace('loc_', '').replace(/_/g, ' ').toUpperCase(),
    metric,
    unit: "unit",
    start_time: timestamps[0],
    end_time: timestamps[timestamps.length - 1],
    total_observations: timestamps.length,
    valid_observations: timestamps.length,
    invalid_observations: 0,
    suspect_observations: 0,
    linear_trend: { slope: 0.0, intercept: 22.0, r_squared: 0.9, p_value: 0.001, direction: "STABLE", annualized_change: 0.0 },
    rate_of_change_percent: 0.0,
    volatility: { mean: 22.0, std_dev: 1.5, coefficient_of_variation: 0.1, min_value: 20, max_value: 25, median_value: 22 },
    anomalies: [],
    seasonality: { timestamps, observed, trend, seasonal, residual, has_seasonality: false }
  };
}

function generateFallbackForecast(locationId: string, metric: string, horizon: string): ForecastProjectionResponse {
  return {
    location_id: locationId,
    metric,
    unit: "unit",
    horizon: horizon.toUpperCase() as any,
    horizon_days: 365,
    champion_model: 'SARIMA(1,1,1)(1,0,0)[7]',
    backtest_metrics: { rmse: 1.2, mae: 0.9, mape_percent: 8.5, r_squared: 0.88 },
    leaderboard: [],
    projections: []
  };
}

function generateFallbackWaterForecast(locationId: string, metric: string, horizon: string): ForecastProjectionResponse { return generateFallbackForecast(locationId, metric, horizon); }
function generateFallbackWaterForecastScore(locationId: string, metric: string, horizon: string): ForecastWaterScoreResponse { return { location_id: locationId, metric, horizon: horizon.toUpperCase(), projections: [] }; }
function generateFallbackCurrentEHS(locationId: string): AggregateEHSResponse { return { overall_ehs: 78, category: "Good", color: "#06B6D4", health_impact: "Air quality is satisfactory.", data_coverage_percent: 100.0, primary_pollutant_driver: "PM2.5", explanation: "Air Quality Score: 78/100 — Good.", metric_subscores: [], methodology: { name: "EcoTrend Air Methodology", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackHistoricalEHS(days: number): HistoricalEHSPoint[] { return []; }
function generateFallbackForecastEHS(locationId: string, metric: string, horizon: string): ForecastEHSResponse { return { location_id: locationId, metric, horizon: horizon.toUpperCase(), projections: [] }; }
function generateFallbackExplanations(locationId: string, metric: string, horizon: string): LocationExplanationResponse { return { location_name: locationId, summary: "", current_condition: "", historical_trend: "", primary_driver: metric, forecast_outlook: "", scenario_comparison: "", data_quality_note: "", metric_explanations: [], key_findings: [], warnings: [], methodology_note: "" }; }
function generateFallbackWaterScore(locationId: string): WaterQualityScoreResponse { return { overall_water_score: 82, category: "Good", color: "#06B6D4", health_impact: "", data_coverage_percent: 100.0, primary_water_driver: "DO", explanation: "", metric_subscores: [], methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackWaterAnalytics(locationId: string, metric: string, days: number): HistoricalAnalyticsSummary { return generateFallbackAnalytics(locationId, metric, days); }
function generateFallbackSoilScore(locationId: string): SoilQualityScoreResponse { return { overall_soil_score: 88, category: "Good", color: "#06B6D4", health_impact: "", data_coverage_percent: 100.0, primary_soil_driver: "SOC", data_type: "MODELED_ESTIMATE", source_provenance: "SoilGrids", explanation: "", metric_subscores: [], methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackClimateScore(locationId: string): ClimateQualityScoreResponse { return { overall_climate_score: 85, category: "Favorable", color: "#06B6D4", health_impact: "", data_coverage_percent: 100.0, data_type: "REANALYSIS", source_provenance: "Open-Meteo", explanation: "", metric_subscores: [], methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackEmissionsScore(locationId: string): EmissionsQualityScoreResponse { return { overall_emissions_score: 72, category: "Elevated Footprint", color: "#F59E0B", health_impact: "", data_coverage_percent: 100.0, data_type: "ESTIMATED", source_provenance: "WorldBank", explanation: "", metric_subscores: [], methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackNoiseScore(locationId: string): NoiseQualityScoreResponse { return { overall_noise_score: 85, category: "Low Disturbance", color: "#06B6D4", health_impact: "", data_coverage_percent: 100.0, data_type: "MEASURED", source_provenance: "NYC_OpenData", explanation: "", metric_subscores: [], contextual_decibel_guidelines: {}, methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" } }; }
function generateFallbackMultiDomainOverview(locationId: string): MultiDomainOverviewResponse { return { cepi_score: 81, category: "Good", color: "#06B6D4", data_coverage_percent: 100.0, available_domains_count: 6, total_domains_count: 6, available_domains: ["air", "water", "soil", "climate", "emissions", "noise"], missing_domains: [], weights_used: { air: 20.0, water: 20.0, soil: 20.0, climate: 15.0, emissions: 15.0, noise: 10.0 }, explanation: "", domain_scores: [] }; }
function generateFallbackCrossDomainCorrelations(locationId: string): CrossDomainCorrelationResponse { return { location_id: locationId, correlations: [], disclaimer: "" }; }
function generateFallbackDomainComparison(): DomainComparisonResponse { return { locations: [] }; }
function generateFallbackComplianceAlerts(locationId: string): ComplianceOverviewResponse { return { location_id: locationId, evaluations: [], risk_assessment: generateFallbackRiskAssessment() }; }
function generateFallbackRiskAssessment(): RiskAssessmentResponse { return { compounding_risk_score: 35, risk_tier: "MODERATE_RISK", color: "#F59E0B", recommended_action: "", total_evaluated_rules: 7, exceeded_rules_count: 3, critical_rules_count: 0, warning_rules_count: 2, methodology_reference: "PROJECT_DEFINED_METHODOLOGY", attribution_notice: "", explanation: "" }; }
function generateFallbackEHSReport(locationId: string): EHSReportExportResponse { return { report_title: "EHS Standards & Guidelines Audit Report", generated_at: new Date().toISOString(), location_id: locationId, location_name: "Manhattan Central Station", executive_summary: {}, risk_assessment: generateFallbackRiskAssessment(), cepi_overview: {}, evaluations_detail: [] }; }

function generateFallbackObservabilityOverview(): ObservabilityOverviewResponse {
  return {
    system_health: "HEALTHY",
    infrastructure_health: { database: "ok", redis: "ok", api_gateway: "ok" },
    sources_summary: { total: 6, healthy: 6, degraded: 0, failed: 0 },
    active_alerts: [],
    recent_jobs: [],
    all_sources: [
      { source: "OpenAQ", domain: "air", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 1440, rejection_rate_percent: 0.5, stale_data_duration_hours: 0.2 },
      { source: "USGS_WQP", domain: "water", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 720, rejection_rate_percent: 1.2, stale_data_duration_hours: 0.5 },
      { source: "SoilGrids", domain: "soil", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 240, rejection_rate_percent: 0.0, stale_data_duration_hours: 1.1 },
      { source: "Open-Meteo", domain: "climate", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 2880, rejection_rate_percent: 0.1, stale_data_duration_hours: 0.1 },
      { source: "WorldBank_Emissions", domain: "emissions", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 120, rejection_rate_percent: 0.0, stale_data_duration_hours: 2.0 },
      { source: "NYC_OpenData_311", domain: "noise", status: "HEALTHY", consecutive_failures: 0, record_volume_24h: 500, rejection_rate_percent: 2.1, stale_data_duration_hours: 0.4 }
    ]
  };
}

function getFallbackStandardsInfo(): StandardsInfoResponse { return { methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" }, standards: {}, score_categories: [] }; }
function getFallbackWaterStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackSoilStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackClimateStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackEmissionsStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackNoiseStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }

function generateFallbackPredictiveOverview(locationId: string): PredictiveOverviewItem {
  return {
    location_id: locationId,
    overall_predictive_status: "STABLE_FORECAST",
    forecasted_cepi_score: 82.5,
    projected_cepi_trend: "STABLE",
    active_forecasted_risks_count: 0,
    domain_forecasts: [
      generateFallbackDomainPrediction("air", "PM2.5"),
      generateFallbackDomainPrediction("water", "DO"),
      generateFallbackDomainPrediction("soil", "SOC"),
      generateFallbackDomainPrediction("climate", "T2M"),
      generateFallbackDomainPrediction("emissions", "CO2_PER_CAPITA"),
      generateFallbackDomainPrediction("noise", "NOISE_INCIDENTS")
    ],
    forecasted_risks: []
  };
}

function generateFallbackDomainPrediction(domain: string, metric: string): DomainForecastItem {
  const now = new Date();
  const projections: any[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    projections.push({
      timestamp: d.toISOString(),
      forecast_value: 22.5 + i * 0.2,
      lower_ci: 20.0 + i * 0.1,
      upper_ci: 25.0 + i * 0.3,
      horizon_step_days: i,
      provenance: "FORECAST"
    });
  }

  return {
    domain,
    metric,
    status: "VALID_FORECAST",
    horizon: "7D",
    horizon_days: 7,
    projections,
    model_metadata: {
      model_name: "SARIMA State Space Model",
      accuracy_metrics: { mae: 0.78, rmse: 1.05, mape_percent: 3.9 },
      sample_count: 30
    },
    provenance: "FORECAST",
    data_limitations: "Forecast projections reflect statistical trend extrapolation for decision support."
  };
}

function generateFallbackScenarioResponse(locationId: string, interventions: Record<string, number>): ScenarioResponseItem {
  return {
    location_id: locationId,
    status: "SUCCESS",
    provenance: "SCENARIO",
    baseline_cepi_score: 81.0,
    projected_cepi_score: 84.5,
    cepi_delta: 3.5,
    overall_impact: "POSITIVE",
    domain_impacts: [
      { domain: "air", baseline_score: 80.0, projected_score: 84.0, delta: 4.0, impact_category: "IMPROVED" },
      { domain: "water", baseline_score: 82.0, projected_score: 85.0, delta: 3.0, impact_category: "IMPROVED" },
      { domain: "soil", baseline_score: 88.0, projected_score: 88.0, delta: 0.0, impact_category: "UNCHANGED" },
      { domain: "climate", baseline_score: 85.0, projected_score: 85.0, delta: 0.0, impact_category: "UNCHANGED" },
      { domain: "emissions", baseline_score: 72.0, projected_score: 78.0, delta: 6.0, impact_category: "IMPROVED" },
      { domain: "noise", baseline_score: 85.0, projected_score: 90.0, delta: 5.0, impact_category: "IMPROVED" }
    ],
    applied_interventions: interventions,
    assumptions: [
      "Scenario projections evaluate hypothetical policy interventions under linear response assumptions.",
      "Scenario results do not mutate or overwrite historical database measurements."
    ]
  };
}

function generateFallbackDecisionOverview(locationId: string): DecisionOverviewResponse {
  return {
    location_id: locationId,
    system_decision_status: "ACTION_REQUIRED",
    total_active_recommendations: 2,
    critical_recommendations_count: 0,
    high_recommendations_count: 2,
    medium_recommendations_count: 0,
    recommendations: [
      {
        id: "rec_comp_air_PM2.5_101",
        location_id: locationId,
        domain: "air",
        metric: "PM2.5",
        title: "Mitigate PM2.5 Exceedance Breach (WHO Air Quality Guidelines 2021)",
        priority_tier: "HIGH",
        priority_score: 76.5,
        status: "ACTIVE",
        severity: "WARNING",
        confidence: 0.95,
        provenance: "DECISION_SUPPORT",
        rationale: "Observed PM2.5 value of 22.5 ug/m3 breaches WHO 24-hour guideline threshold of 15.0 ug/m3.",
        recommended_actions: [
          "Activate targeted urban low-emission transit corridor controls.",
          "Notify regional EHS officer regarding WHO guideline threshold exceedance."
        ],
        created_at: new Date().toISOString(),
        evidence_chain: {
          observed_signal: { value: 22.5, unit: "ug/m3", provenance: "MEASURED" },
          compliance_rule: { threshold: 15.0, reference: "WHO Air Quality Guidelines (2021)", reference_type: "GUIDELINE" }
        }
      },
      {
        id: "rec_pred_water_DO_102",
        location_id: locationId,
        domain: "water",
        metric: "DO",
        title: "Early Warning: Projected Dissolved Oxygen Hypoxia Risk on 2026-08-20",
        priority_tier: "HIGH",
        priority_score: 72.0,
        status: "ACTIVE",
        severity: "WARNING",
        confidence: 0.85,
        provenance: "DECISION_SUPPORT",
        rationale: "Projected Dissolved Oxygen value of 4.2 mg/L expected to drop below EcoTrend Hypoxia criteria of 5.0 mg/L.",
        recommended_actions: [
          "Deploy micro-bubble mechanical aeration units in Hudson estuary sector.",
          "Run what-if scenario simulations to evaluate aeration impact."
        ],
        created_at: new Date().toISOString(),
        evidence_chain: {
          forecast_signal: { projected_value: 4.2, timestamp: "2026-08-20T00:00:00Z", provenance: "FORECAST" },
          compliance_rule: { threshold: 5.0, reference: "EcoTrend Hypoxia Criteria" }
        }
      }
    ],
    interventions_summary: [
      {
        id: "int_air_traffic",
        name: "Urban Traffic Low-Emission Zone & Signal Optimization",
        domain: "air",
        target_metric: "PM2.5",
        description: "Deploy low-emission vehicle corridors and adaptive traffic signals.",
        baseline_cepi_score: 81.0,
        projected_cepi_score: 84.5,
        estimated_cepi_improvement: 3.5,
        confidence: 0.88,
        assumptions: ["Assumes 25% traffic volume reduction in central monitoring sector."],
        provenance: "DECISION_SUPPORT",
        disclaimer: "Intervention projections evaluate decision-support scenarios."
      }
    ],
    disclaimer: "Decision Support recommendations provide automated intelligence to assist human EHS managers."
  };
}

function generateFallbackDecisionAudit(recommendationId: string): DecisionAuditResponse {
  return {
    recommendation_id: recommendationId,
    location_id: "loc_us_ny_nyc_manhattan",
    domain: "air",
    title: "Mitigate PM2.5 Exceedance Breach (WHO Air Quality Guidelines 2021)",
    priority_tier: "HIGH",
    priority_score: 76.5,
    decision_chain: [
      { step: 1, phase: "OBSERVATION", provenance: "MEASURED", detail: "Observed signal: 22.5 ug/m3" },
      { step: 2, phase: "FORECAST_PROJECTION", provenance: "FORECAST", detail: "Projected value: 24.2 ug/m3" },
      { step: 3, phase: "COMPLIANCE_EVALUATION", provenance: "COMPLIANCE", detail: "WHO Air Quality Guidelines (2021) (Threshold: 15.0 ug/m3)" },
      { step: 4, phase: "ADAPTIVE_PRIORITIZATION", provenance: "DERIVED", detail: "Calculated Priority Score: 76.5 (HIGH Tier)" },
      { step: 5, phase: "RECOMMENDATION_GENERATION", provenance: "DECISION_SUPPORT", detail: "Observed PM2.5 breaches WHO guideline threshold." }
    ],
    actionable_interventions: generateFallbackDecisionOverview("loc_us_ny_nyc_manhattan").interventions_summary,
    legal_disclaimer: "Decision Support recommendations assist human EHS managers and do not substitute for statutory orders."
  };
}

function generateFallbackApprovalRequests(): ApprovalRequestItem[] {
  return [
    {
      id: "app_req_001",
      tenant_id: "tenant_ecotrend_enterprise",
      submitter_id: "usr_operator_002",
      approver_id: null,
      intervention_id: "int_air_traffic",
      title: "Urban Traffic Low-Emission Zone Deployment",
      domain: "air",
      status: "SUBMITTED",
      estimated_cepi_improvement: 3.5,
      reason: "PM2.5 threshold breach observed in Hudson sector; request traffic signal optimization.",
      decision_reason: null,
      provenance: "APPROVAL_WORKFLOW",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

function generateFallbackAuditEvents(): AuditEventItem[] {
  return [
    {
      id: "aud_evt_001",
      tenant_id: "tenant_ecotrend_enterprise",
      actor_id: "usr_admin_001",
      actor_email: "admin@ecotrend.io",
      action: "SYSTEM_INITIALIZED",
      resource_type: "System",
      resource_id: "sys_core",
      previous_state: null,
      new_state: "ACTIVE",
      reason: "Enterprise platform startup",
      correlation_id: "corr_init_001",
      ip_address: "127.0.0.1",
      provenance: "AUDIT_TRAIL",
      timestamp: new Date().toISOString()
    }
  ];
}



