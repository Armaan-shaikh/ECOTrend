export interface LocationItem {
  id: string;
  name: string;
  level: 'COUNTRY' | 'STATE' | 'CITY' | 'STATION';
  parent_id?: string | null;
  country_code?: string | null;
  latitude: number;
  longitude: number;
  created_at?: string;
  children_count?: number;
}

export interface LocationTreeItem extends LocationItem {
  children: LocationTreeItem[];
}

export interface MeasurementItem {
  id: string;
  location_id: string;
  domain: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  data_quality: 'VALID' | 'SUSPECT' | 'INVALID';
  raw_value?: number | null;
}

export interface DataQualityLogItem {
  id: string;
  location_id?: string | null;
  metric: string;
  timestamp: string;
  rule_triggered: string;
  original_value?: number | null;
  action_taken: string;
  details?: string | null;
  created_at?: string;
}

export interface LinearTrendMetrics {
  slope: number;
  intercept: number;
  r_squared: number;
  p_value: number;
  direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  annualized_change: number;
}

export interface VolatilityMetrics {
  mean: number;
  std_dev: number;
  coefficient_of_variation: number;
  min_value: number;
  max_value: number;
  median_value: number;
}

export interface AnomalyPoint {
  timestamp: string;
  value: number;
  z_score: number;
  reason: string;
}

export interface SeasonalityDecomposition {
  timestamps: string[];
  observed: number[];
  trend: (number | null)[];
  seasonal: (number | null)[];
  residual: (number | null)[];
  has_seasonality: boolean;
}

export interface HistoricalAnalyticsSummary {
  location_id: string;
  location_name: string;
  metric: string;
  unit: string;
  start_time: string;
  end_time: string;
  total_observations: number;
  valid_observations: number;
  invalid_observations: number;
  suspect_observations: number;
  linear_trend: LinearTrendMetrics;
  rate_of_change_percent: number;
  volatility: VolatilityMetrics;
  anomalies: AnomalyPoint[];
  seasonality: SeasonalityDecomposition;
}

export interface BacktestMetrics {
  rmse: number;
  mae: number;
  mape_percent: number;
  r_squared: number;
}

export interface ModelLeaderboardItem {
  model_name: string;
  rmse: number;
  mae: number;
  mape_percent: number;
  r_squared: number;
  is_champion: boolean;
}

export interface ForecastPoint {
  timestamp: string;
  date: string;
  baseline_value: number;
  improvement_value: number;
  worsening_value: number;
  ci_80_lower: number;
  ci_80_upper: number;
  ci_95_lower: number;
  ci_95_upper: number;
}

export interface ForecastProjectionResponse {
  location_id: string;
  metric: string;
  unit: string;
  horizon: '6_MONTHS' | '1_YEAR' | '3_YEARS' | '5_YEARS';
  horizon_days: number;
  champion_model: string;
  backtest_metrics: BacktestMetrics;
  leaderboard: ModelLeaderboardItem[];
  projections: ForecastPoint[];
}

export interface MetricSubScore {
  metric: string;
  raw_value?: number | null;
  unit: string;
  score: number;
  category: string;
  standard: string;
  weight: number;
  is_available: boolean;
  contribution_pct: number;
}

export interface AggregateEHSResponse {
  overall_ehs: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  primary_pollutant_driver: string;
  explanation: string;
  metric_subscores: MetricSubScore[];
  methodology: {
    name: string;
    version: string;
    description: string;
    attribution_notice: string;
    last_updated: string;
  };
}

export interface HistoricalEHSPoint {
  date: string;
  timestamp: string;
  overall_ehs: number;
  category: string;
  color: string;
  data_coverage_percent: number;
  primary_pollutant_driver: string;
}

export interface ForecastEHSPoint {
  date: string;
  timestamp: string;
  baseline_ehs: number;
  baseline_category: string;
  improvement_ehs: number;
  worsening_ehs: number;
  ehs_ci_95_lower: number;
  ehs_ci_95_upper: number;
}

export interface ForecastEHSResponse {
  location_id: string;
  metric: string;
  horizon: string;
  projections: ForecastEHSPoint[];
}

export interface StandardsInfoResponse {
  methodology: {
    name: string;
    version: string;
    description: string;
    attribution_notice: string;
    last_updated: string;
  };
  standards: Record<string, {
    metric: string;
    unit: string;
    who_annual: number;
    who_24h: number;
    epa_good: number;
    epa_moderate: number;
    standard_reference: string;
    weight: number;
    weight_rationale: string;
  }>;
  score_categories: Array<{
    min_score: number;
    max_score: number;
    category: string;
    color: string;
    health_impact: string;
  }>;
}
