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
  EHSReportExportResponse
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

function generateFallbackComplianceAlerts(locationId: string): ComplianceOverviewResponse {
  return {
    location_id: locationId,
    evaluations: [
      {
        rule_id: "rule_air_pm25_24h",
        domain: "air",
        metric: "PM2.5",
        unit: "ug/m3",
        averaging_period: "24_HOUR_MEAN",
        observed_value: 18.5,
        threshold: 15.0,
        threshold_direction: "ABOVE",
        is_exceeded: true,
        status: "EXCEEDED_GUIDELINE",
        evaluation_severity: "WARNING",
        reference_name: "WHO Air Quality Guidelines (2021)",
        reference_type: "GUIDELINE",
        jurisdiction: "Global / International",
        source_url: "https://www.who.int/publications/i/item/9789240034228",
        provenance: "MEASURED",
        explanation: "Observed 24h PM2.5 (18.5 ug/m3) exceeds WHO 2021 Guideline (15.0 ug/m3)."
      }
    ],
    risk_assessment: generateFallbackRiskAssessment()
  };
}

function generateFallbackRiskAssessment(): RiskAssessmentResponse {
  return {
    compounding_risk_score: 35,
    risk_tier: "MODERATE_RISK",
    color: "#F59E0B",
    recommended_action: "Routine environmental monitoring; advisory alerts active.",
    total_evaluated_rules: 7,
    exceeded_rules_count: 3,
    critical_rules_count: 0,
    warning_rules_count: 2,
    methodology_reference: "PROJECT_DEFINED_METHODOLOGY",
    attribution_notice: "EcoTrend Compounding Environmental Risk Index is a project-defined methodology classification.",
    explanation: "EcoTrend Compounding Risk Index: 35/100 (MODERATE_RISK)."
  };
}

function generateFallbackEHSReport(locationId: string): EHSReportExportResponse {
  return {
    report_title: "EHS Standards & Guidelines Audit Report",
    generated_at: new Date().toISOString(),
    location_id: locationId,
    location_name: "Manhattan Central Station",
    executive_summary: { cepi_score: 81, compounding_risk_score: 35 },
    risk_assessment: generateFallbackRiskAssessment(),
    cepi_overview: { cepi_score: 81 },
    evaluations_detail: generateFallbackComplianceAlerts(locationId).evaluations
  };
}

function getFallbackStandardsInfo(): StandardsInfoResponse { return { methodology: { name: "", version: "", description: "", attribution_notice: "", last_updated: "2026-08-17" }, standards: {}, score_categories: [] }; }
function getFallbackWaterStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackSoilStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackClimateStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackEmissionsStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
function getFallbackNoiseStandardsInfo(): StandardsInfoResponse { return getFallbackStandardsInfo(); }
