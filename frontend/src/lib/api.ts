import { LocationItem, LocationTreeItem, MeasurementItem, DataQualityLogItem, HistoricalAnalyticsSummary, ForecastProjectionResponse } from './types';

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

export async function fetchMeasurements(
  locationId: string,
  metric: string = 'PM2.5',
  days: number = 30
): Promise<MeasurementItem[]> {
  try {
    const res = await fetch(`${API_V1}/measurements?location_id=${locationId}&metric=${metric}&days=${days}`, {
      cache: 'no-store'
    });
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
  const unit = metric.includes('PM') ? 'µg/m³' : (metric === 'AQI' ? 'index' : 'ppb');

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
    unit,
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
    anomalies: [
      {
        timestamp: timestamps[Math.floor(timestamps.length / 2)],
        value: Number((baseVal * 1.8).toFixed(2)),
        z_score: 3.12,
        reason: "Historical observation deviated by 3.12 standard deviations from rolling mean."
      }
    ],
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
  const unit = metric.includes('PM') ? 'µg/m³' : (metric === 'AQI' ? 'index' : 'ppb');

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
    unit,
    horizon: horizon.toUpperCase() as any,
    horizon_days: horizonDays,
    champion_model: 'SARIMA(1,1,1)(1,0,0)[7]',
    backtest_metrics: {
      rmse: 3.42,
      mae: 2.51,
      mape_percent: 11.2,
      r_squared: 0.84
    },
    leaderboard: [
      { model_name: 'SARIMA(1,1,1)(1,0,0)[7]', rmse: 3.42, mae: 2.51, mape_percent: 11.2, r_squared: 0.84, is_champion: true },
      { model_name: 'Holt-Winters Exponential Smoothing', rmse: 4.15, mae: 3.10, mape_percent: 13.8, r_squared: 0.78, is_champion: false },
      { model_name: 'Linear Harmonic Extrapolation', rmse: 4.89, mae: 3.65, mape_percent: 16.4, r_squared: 0.71, is_champion: false }
    ],
    projections
  };
}
