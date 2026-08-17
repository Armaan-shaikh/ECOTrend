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
  EmissionsQualityScoreResponse
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
                },
                {
                  id: "loc_us_ny_nyc_queens",
                  name: "Queens Industrial Station",
                  level: "STATION",
                  parent_id: "loc_us_ny_nyc",
                  country_code: "US",
                  latitude: 40.7282,
                  longitude: -73.7949,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "loc_in",
      name: "India",
      level: "COUNTRY",
      country_code: "IN",
      latitude: 20.5937,
      longitude: 78.9629,
      children: [
        {
          id: "loc_in_delhi",
          name: "Delhi NCR",
          level: "STATE",
          parent_id: "loc_in",
          country_code: "IN",
          latitude: 28.7041,
          longitude: 77.1025,
          children: [
            {
              id: "loc_in_delhi_newdelhi",
              name: "New Delhi",
              level: "CITY",
              parent_id: "loc_in_delhi",
              country_code: "IN",
              latitude: 28.6139,
              longitude: 77.2090,
              children: [
                {
                  id: "loc_in_delhi_anandvihar",
                  name: "Anand Vihar Station",
                  level: "STATION",
                  parent_id: "loc_in_delhi_newdelhi",
                  country_code: "IN",
                  latitude: 28.6508,
                  longitude: 77.3152,
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
    { id: "loc_us_ny_nyc_manhattan", name: "Manhattan Central Station", level: "STATION", latitude: 40.7831, longitude: -73.9712 },
    { id: "loc_us_ny_nyc_queens", name: "Queens Industrial Station", level: "STATION", latitude: 40.7282, longitude: -73.7949 },
    { id: "loc_in_delhi_anandvihar", name: "Anand Vihar Station", level: "STATION", latitude: 28.6508, longitude: 77.3152 }
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

  const isHighPollution = locationId.includes('anandvihar');
  const baseVal = metric === 'PM2.5' ? (isHighPollution ? 85 : 22) : (metric === 'PM10' ? 45 : 30);

  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const ts = d.toISOString();
    timestamps.push(ts);

    const seasVal = Math.sin((i / 7) * Math.PI * 2) * 5;
    const trVal = baseVal - (count - i) * 0.15;
    const resVal = (Math.random() - 0.5) * 3;
    const obsVal = Math.max(1, trVal + seasVal + resVal);

    observed.push(Number(obsVal.toFixed(2)));
    trend.push(Number(trVal.toFixed(2)));
    seasonal.push(Number(seasVal.toFixed(2)));
    residual.push(Number(resVal.toFixed(2)));
  }

  return {
    location_id: locationId,
    location_name: locationId.replace('loc_', '').replace(/_/g, ' ').toUpperCase(),
    metric,
    unit: "°C",
    start_time: timestamps[0],
    end_time: timestamps[timestamps.length - 1],
    total_observations: timestamps.length,
    valid_observations: timestamps.length - 2,
    invalid_observations: 1,
    suspect_observations: 1,
    linear_trend: {
      slope: -0.15,
      intercept: baseVal,
      r_squared: 0.78,
      p_value: 0.002,
      direction: "IMPROVING",
      annualized_change: -54.75
    },
    rate_of_change_percent: -12.4,
    volatility: {
      mean: Number((baseVal * 0.9).toFixed(2)),
      std_dev: 4.8,
      coefficient_of_variation: 0.18,
      min_value: Number((baseVal * 0.6).toFixed(2)),
      max_value: Number((baseVal * 1.3).toFixed(2)),
      median_value: Number((baseVal * 0.88).toFixed(2))
    },
    anomalies: [],
    seasonality: {
      timestamps,
      observed,
      trend,
      seasonal,
      residual,
      has_seasonality: true
    }
  };
}

function generateFallbackForecast(locationId: string, metric: string, horizon: string): ForecastProjectionResponse {
  const horizonDays = horizon === '6_MONTHS' ? 182 : (horizon === '3_YEARS' ? 1095 : (horizon === '5_YEARS' ? 1825 : 365));
  const isHighPollution = locationId.includes('anandvihar');
  const baseVal = metric === 'PM2.5' ? (isHighPollution ? 85 : 22) : (metric === 'PM10' ? 45 : 30);

  const projections = [];
  const startDt = new Date();
  const stepDays = Math.max(1, Math.floor(horizonDays / 40));

  for (let i = 1; i <= horizonDays; i += stepDays) {
    const d = new Date(startDt.getTime() + i * 86400000);
    const tRatio = i / horizonDays;
    const bVal = baseVal + Math.sin(i / 15) * 4;

    projections.push({
      timestamp: d.toISOString(),
      date: d.toISOString().split('T')[0],
      baseline_value: Number(bVal.toFixed(2)),
      improvement_value: Number((bVal * (1 - 0.22 * tRatio)).toFixed(2)),
      worsening_value: Number((bVal * (1 + 0.28 * tRatio)).toFixed(2)),
      ci_80_lower: Number(Math.max(0, bVal - 3.5 - 2 * tRatio).toFixed(2)),
      ci_80_upper: Number((bVal + 3.5 + 2 * tRatio).toFixed(2)),
      ci_95_lower: Number(Math.max(0, bVal - 6.0 - 3.5 * tRatio).toFixed(2)),
      ci_95_upper: Number((bVal + 6.0 + 3.5 * tRatio).toFixed(2)),
    });
  }

  return {
    location_id: locationId,
    metric,
    unit: "°C",
    horizon: horizon.toUpperCase() as any,
    horizon_days: horizonDays,
    champion_model: 'SARIMA(1,1,1)(1,0,0)[7]',
    backtest_metrics: { rmse: 3.42, mae: 2.51, mape_percent: 11.2, r_squared: 0.84 },
    leaderboard: [
      { model_name: 'SARIMA(1,1,1)(1,0,0)[7]', rmse: 3.42, mae: 2.51, mape_percent: 11.2, r_squared: 0.84, is_champion: true }
    ],
    projections
  };
}

function generateFallbackWaterForecast(locationId: string, metric: string, horizon: string): ForecastProjectionResponse {
  return generateFallbackForecast(locationId, metric, horizon);
}

function generateFallbackWaterForecastScore(locationId: string, metric: string, horizon: string): ForecastWaterScoreResponse {
  return {
    location_id: locationId,
    metric,
    horizon: horizon.toUpperCase(),
    projections: []
  };
}

function generateFallbackCurrentEHS(locationId: string): AggregateEHSResponse {
  return {
    overall_ehs: 78,
    category: "Good",
    color: "#06B6D4",
    health_impact: "Air quality is satisfactory.",
    data_coverage_percent: 100.0,
    primary_pollutant_driver: "PM2.5",
    explanation: "Air Quality Score: 78/100 — Good.",
    metric_subscores: [],
    methodology: { name: "EcoTrend Air Methodology", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" }
  };
}

function generateFallbackHistoricalEHS(days: number): HistoricalEHSPoint[] {
  return [];
}

function generateFallbackForecastEHS(locationId: string, metric: string, horizon: string): ForecastEHSResponse {
  return { location_id: locationId, metric, horizon: horizon.toUpperCase(), projections: [] };
}

function generateFallbackExplanations(locationId: string, metric: string, horizon: string): LocationExplanationResponse {
  return {
    location_name: locationId,
    summary: `Assessment for ${locationId}`,
    current_condition: "Good condition",
    historical_trend: "Stable trend",
    primary_driver: metric,
    forecast_outlook: "Stable outlook",
    scenario_comparison: "Standard baseline",
    data_quality_note: "100% data coverage",
    metric_explanations: [],
    key_findings: [],
    warnings: [],
    methodology_note: ""
  };
}

function generateFallbackWaterScore(locationId: string): WaterQualityScoreResponse {
  return {
    overall_water_score: 82,
    category: "Good",
    color: "#06B6D4",
    health_impact: "Water quality is satisfactory.",
    data_coverage_percent: 100.0,
    primary_water_driver: "DO",
    explanation: "Water Quality Score: 82/100 — Good.",
    metric_subscores: [],
    methodology: { name: "EcoTrend Water Methodology", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" }
  };
}

function generateFallbackWaterAnalytics(locationId: string, metric: string, days: number): HistoricalAnalyticsSummary {
  return generateFallbackAnalytics(locationId, metric, days);
}

function generateFallbackSoilScore(locationId: string): SoilQualityScoreResponse {
  return {
    overall_soil_score: 88,
    category: "Good",
    color: "#06B6D4",
    health_impact: "Soil quality is satisfactory.",
    data_coverage_percent: 100.0,
    primary_soil_driver: "SOC",
    data_type: "MODELED_ESTIMATE",
    source_provenance: "SoilGrids_v2.0",
    explanation: "Soil Quality Score: 88/100 — Good.",
    metric_subscores: [],
    methodology: { name: "EcoTrend Soil Methodology", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" }
  };
}

function generateFallbackClimateScore(locationId: string): ClimateQualityScoreResponse {
  return {
    overall_climate_score: 85,
    category: "Favorable",
    color: "#06B6D4",
    health_impact: "Climate parameters remain favorable.",
    data_coverage_percent: 100.0,
    data_type: "REANALYSIS",
    source_provenance: "Open-Meteo_ERA5",
    explanation: "Climate Index: 85/100 — Favorable.",
    metric_subscores: [
      { metric: "T_ANOMALY", title: "Temperature Anomaly", raw_value: 0.8, unit: "°C", score: 85, category: "Favorable", standard: "WMO Normals", reference_type: "PROJECT_DEFINED_METHODOLOGY", weight: 0.30, is_available: true, contribution_pct: 30.0 },
      { metric: "T2M", title: "Air Temperature", raw_value: 22.4, unit: "°C", score: 100, category: "Optimal", standard: "WMO Normals", reference_type: "AGRONOMIC_GUIDELINE", weight: 0.25, is_available: true, contribution_pct: 25.0 },
      { metric: "PRECIP", title: "Precipitation", raw_value: 12.5, unit: "mm", score: 100, category: "Optimal", standard: "NOAA Climate Extremes", reference_type: "AGRONOMIC_GUIDELINE", weight: 0.20, is_available: true, contribution_pct: 20.0 },
      { metric: "RH2M", title: "Relative Humidity", raw_value: 58.0, unit: "%", score: 100, category: "Optimal", standard: "WMO Normals", reference_type: "AGRONOMIC_GUIDELINE", weight: 0.15, is_available: true, contribution_pct: 15.0 },
      { metric: "WS10M", title: "Wind Speed", raw_value: 4.2, unit: "m/s", score: 100, category: "Optimal", standard: "Beaufort Scale", reference_type: "AGRONOMIC_GUIDELINE", weight: 0.10, is_available: true, contribution_pct: 10.0 }
    ],
    methodology: { name: "EcoTrend Climate Index", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" }
  };
}

function generateFallbackEmissionsScore(locationId: string): EmissionsQualityScoreResponse {
  return {
    overall_emissions_score: 72,
    category: "Elevated Footprint",
    color: "#F59E0B",
    health_impact: "Emissions exceed recommended Paris 1.5°C target.",
    data_coverage_percent: 100.0,
    data_type: "ESTIMATED",
    source_provenance: "WorldBank_UNFCCC",
    explanation: "Emissions Sustainability Index: 72/100 — Elevated Footprint.",
    metric_subscores: [
      { metric: "CO2_PER_CAPITA", title: "Per Capita CO2 Emissions", raw_value: 14.2, unit: "tCO2/capita", score: 55, category: "High Footprint", standard: "IPCC AR6 Paris 1.5C", reference_type: "REGULATORY_LIMIT", weight: 0.40, is_available: true, contribution_pct: 40.0 },
      { metric: "CO2_PPM", title: "Atmospheric CO2 Concentration", raw_value: 420.0, unit: "ppm", score: 65, category: "Elevated Footprint", standard: "NOAA / IPCC AR6", reference_type: "TOXICOLOGICAL_SCREENING", weight: 0.35, is_available: true, contribution_pct: 35.0 },
      { metric: "CO2E_TOTAL", title: "Total GHG Emissions", raw_value: 4800.0, unit: "MtCO2e", score: 45, category: "High Footprint", standard: "UNFCCC Inventories", reference_type: "REGULATORY_LIMIT", weight: 0.25, is_available: true, contribution_pct: 25.0 }
    ],
    methodology: { name: "EcoTrend Emissions Sustainability Index", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" }
  };
}

function getFallbackStandardsInfo(): StandardsInfoResponse {
  return {
    methodology: { name: "EcoTrend Air Methodology", version: "1.0", description: "", attribution_notice: "", last_updated: "2026-08-17" },
    standards: {},
    score_categories: []
  };
}

function getFallbackWaterStandardsInfo(): StandardsInfoResponse {
  return getFallbackStandardsInfo();
}

function getFallbackSoilStandardsInfo(): StandardsInfoResponse {
  return getFallbackStandardsInfo();
}

function getFallbackClimateStandardsInfo(): StandardsInfoResponse {
  return getFallbackStandardsInfo();
}

function getFallbackEmissionsStandardsInfo(): StandardsInfoResponse {
  return getFallbackStandardsInfo();
}
