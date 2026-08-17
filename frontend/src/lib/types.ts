export type EnvironmentalDomain = 'overview' | 'air' | 'water' | 'soil' | 'climate' | 'noise';

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
  type?: string;
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
  title?: string;
  raw_value?: number | null;
  unit: string;
  score: number;
  category: string;
  standard: string;
  reference_type?: string;
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
  reference_types?: Record<string, string>;
  standards: Record<string, {
    metric: string;
    unit: string;
    who_annual?: number;
    who_24h?: number;
    epa_good?: number;
    epa_moderate?: number;
    standard_reference: string;
    reference_type?: string;
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

export interface MetricDefinitionItem {
  metric: string;
  title: string;
  definition: string;
  common_sources: string;
  health_relevance: string;
}

export interface LocationExplanationResponse {
  location_name: string;
  summary: string;
  current_condition: string;
  historical_trend: string;
  primary_driver: string;
  forecast_outlook: string;
  scenario_comparison: string;
  data_quality_note: string;
  metric_explanations: MetricDefinitionItem[];
  key_findings: string[];
  warnings: string[];
  methodology_note: string;
}

export interface WaterQualityScoreResponse {
  overall_water_score: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  primary_water_driver: string;
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

export interface ForecastWaterScorePoint {
  date: string;
  timestamp: string;
  baseline_water_score: number;
  baseline_category: string;
  improvement_water_score: number;
  worsening_water_score: number;
  water_score_ci_95_lower: number;
  water_score_ci_95_upper: number;
}

export interface ForecastWaterScoreResponse {
  location_id: string;
  metric: string;
  horizon: string;
  projections: ForecastWaterScorePoint[];
}

export interface SoilQualityScoreResponse {
  overall_soil_score: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  primary_soil_driver: string;
  data_type: string;
  source_provenance: string;
  explanation: string;
  metric_subscores: MetricSubScore[];
  reference_types?: Record<string, string>;
  methodology: {
    name: string;
    version: string;
    description: string;
    attribution_notice: string;
    last_updated: string;
  };
}

export interface ClimateQualityScoreResponse {
  overall_climate_score: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  data_type: string;
  source_provenance: string;
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

export interface EmissionsQualityScoreResponse {
  overall_emissions_score: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  data_type: string;
  source_provenance: string;
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

export interface NoiseQualityScoreResponse {
  overall_noise_score: number;
  category: string;
  color: string;
  health_impact: string;
  data_coverage_percent: number;
  data_type: string;
  source_provenance: string;
  explanation: string;
  metric_subscores: MetricSubScore[];
  contextual_decibel_guidelines: Record<string, any>;
  methodology: {
    name: string;
    version: string;
    description: string;
    attribution_notice: string;
    last_updated: string;
  };
}

export interface DomainScoreSummary {
  domain: string;
  domain_name: string;
  score: number;
  category: string;
  color: string;
  data_coverage_percent: number;
  data_type: string;
  source_provenance: string;
  is_available: boolean;
}

export interface MultiDomainOverviewResponse {
  cepi_score: number;
  category: string;
  color: string;
  data_coverage_percent: number;
  available_domains_count: number;
  total_domains_count: number;
  available_domains: string[];
  missing_domains: string[];
  weights_used: Record<string, number>;
  explanation: string;
  domain_scores: DomainScoreSummary[];
}

export interface CrossDomainCorrelationItem {
  metric_a: string;
  metric_b: string;
  sample_size: number;
  status: string;
  pearson_r?: number | null;
  spearman_rho?: number | null;
  p_value?: number | null;
  is_statistically_significant: boolean;
  relationship_type?: string | null;
  disclaimer: string;
  explanation: string;
}

export interface CrossDomainCorrelationResponse {
  location_id: string;
  correlations: CrossDomainCorrelationItem[];
  disclaimer: string;
}

export interface DomainComparisonItem {
  location_id: string;
  location_name: string;
  cepi_score: number;
  category: string;
  air_score?: number | null;
  water_score?: number | null;
  soil_score?: number | null;
  climate_score?: number | null;
  emissions_score?: number | null;
  noise_score?: number | null;
}

export interface DomainComparisonResponse {
  locations: DomainComparisonItem[];
}

/* Compliance & EHS Audit Report Types (Phase 9) */

export interface ComplianceEvaluationItem {
  rule_id: string;
  domain: string;
  metric: string;
  unit: string;
  averaging_period: string;
  observed_value?: number | null;
  threshold: number;
  threshold_direction: string;
  is_exceeded: boolean;
  status: string;
  evaluation_severity: string;
  reference_name: string;
  reference_type: string;
  jurisdiction: string;
  source_url: string;
  provenance: string;
  explanation: string;
}

export interface RiskAssessmentResponse {
  compounding_risk_score: number;
  risk_tier: string;
  color: string;
  recommended_action: string;
  total_evaluated_rules: number;
  exceeded_rules_count: number;
  critical_rules_count: number;
  warning_rules_count: number;
  methodology_reference: string;
  attribution_notice: string;
  explanation: string;
}

export interface ComplianceOverviewResponse {
  location_id: string;
  evaluations: ComplianceEvaluationItem[];
  risk_assessment: RiskAssessmentResponse;
}

export interface EHSReportExportResponse {
  report_title: string;
  generated_at: string;
  location_id: string;
  location_name: string;
  executive_summary: Record<string, any>;
  risk_assessment: RiskAssessmentResponse;
  cepi_overview: Record<string, any>;
  evaluations_detail: ComplianceEvaluationItem[];
  markdown_content?: string;
}

export interface IngestionJobItem {
  id: string;
  source: string;
  domain: string;
  location_id?: string | null;
  status: string;
  started_at: string;
  completed_at?: string | null;
  records_fetched: number;
  records_valid: number;
  records_rejected: number;
  error_count: number;
  duration_ms?: number | null;
  provenance: string;
  error_details?: string | null;
}

export interface SourceHealthItem {
  id?: string | null;
  source: string;
  domain: string;
  status: string;
  last_successful_ingestion?: string | null;
  last_attempted_ingestion?: string | null;
  consecutive_failures: number;
  latency_ms?: number | null;
  record_volume_24h: number;
  rejection_rate_percent: number;
  stale_data_duration_hours: number;
  updated_at?: string | null;
}

export interface OperationalAlertItem {
  id: string;
  source: string;
  domain: string;
  severity: string;
  condition: string;
  observed_value: string;
  expected_condition: string;
  status: string;
  detected_at: string;
  resolved_at?: string | null;
  provenance_context?: string | null;
}

export interface ObservabilityMetricsResponse {
  system_status: string;
  database_status: string;
  redis_status: string;
  total_ingestion_jobs_24h: number;
  successful_jobs_24h: number;
  failed_jobs_24h: number;
  active_alerts_count: number;
  healthy_sources_count: number;
  total_sources_count: number;
}

export interface ObservabilityOverviewResponse {
  system_health: string;
  infrastructure_health: Record<string, string>;
  sources_summary: Record<string, number>;
  active_alerts: OperationalAlertItem[];
  recent_jobs: IngestionJobItem[];
  all_sources: SourceHealthItem[];
}

export interface PredictionPointItem {
  timestamp: string;
  forecast_value: number;
  lower_ci: number;
  upper_ci: number;
  horizon_step_days: number;
  provenance: string;
}

export interface AccuracyMetricsItem {
  mae: number;
  rmse: number;
  mape_percent: number;
}

export interface ModelMetadataItem {
  model_name: string;
  accuracy_metrics: AccuracyMetricsItem;
  sample_count: number;
}

export interface DomainForecastItem {
  domain: string;
  metric: string;
  status: string;
  horizon: string;
  horizon_days: number;
  projections: PredictionPointItem[];
  model_metadata: ModelMetadataItem;
  provenance: string;
  data_limitations: string;
}

export interface PredictiveRiskItem {
  domain: string;
  metric: string;
  forecast_value: number;
  forecast_timestamp: string;
  threshold: number;
  threshold_direction: string;
  unit: string;
  severity: string;
  reference_name: string;
  reference_type: string;
  jurisdiction: string;
  event_type: string;
  provenance: string;
  explanation: string;
}

export interface ScenarioImpactItem {
  domain: string;
  baseline_score: number;
  projected_score: number;
  delta: number;
  impact_category: string;
}

export interface ScenarioResponseItem {
  location_id: string;
  status: string;
  provenance: string;
  baseline_cepi_score: number;
  projected_cepi_score: number;
  cepi_delta: number;
  overall_impact: string;
  domain_impacts: ScenarioImpactItem[];
  applied_interventions: Record<string, number>;
  assumptions: string[];
}

export interface PredictiveOverviewItem {
  location_id: string;
  overall_predictive_status: string;
  forecasted_cepi_score: number;
  projected_cepi_trend: string;
  active_forecasted_risks_count: number;
  domain_forecasts: DomainForecastItem[];
  forecasted_risks: PredictiveRiskItem[];
}

export interface DecisionRecommendationItem {
  id: string;
  location_id: string;
  domain: string;
  metric: string;
  title: string;
  priority_tier: string;
  priority_score: number;
  status: string;
  severity: string;
  confidence: number;
  provenance: string;
  rationale: string;
  recommended_actions: string[];
  created_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  evidence_chain?: Record<string, any>;
}

export interface InterventionOptionItem {
  id: string;
  name: string;
  domain: string;
  target_metric: string;
  description: string;
  baseline_cepi_score: number;
  projected_cepi_score: number;
  estimated_cepi_improvement: number;
  confidence: number;
  assumptions: string[];
  provenance: string;
  disclaimer: string;
}

export interface DecisionOverviewResponse {
  location_id: string;
  system_decision_status: string;
  total_active_recommendations: number;
  critical_recommendations_count: number;
  high_recommendations_count: number;
  medium_recommendations_count: number;
  recommendations: DecisionRecommendationItem[];
  interventions_summary: InterventionOptionItem[];
  disclaimer: string;
}

export interface DecisionChainStepItem {
  step: number;
  phase: string;
  provenance: string;
  detail: string;
}

export interface DecisionAuditResponse {
  recommendation_id: string;
  location_id: string;
  domain: string;
  title: string;
  priority_tier: string;
  priority_score: number;
  decision_chain: DecisionChainStepItem[];
  actionable_interventions: InterventionOptionItem[];
  legal_disclaimer: string;
}

export interface UserItem {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditEventItem {
  id: string;
  tenant_id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  previous_state?: string | null;
  new_state?: string | null;
  reason?: string | null;
  correlation_id?: string | null;
  ip_address?: string | null;
  provenance: string;
  timestamp: string;
}

export interface ApprovalRequestItem {
  id: string;
  tenant_id: string;
  submitter_id: string;
  approver_id?: string | null;
  intervention_id: string;
  title: string;
  domain: string;
  status: string;
  estimated_cepi_improvement: number;
  reason: string;
  decision_reason?: string | null;
  provenance: string;
  created_at: string;
  updated_at: string;
}

export interface SecuritySummaryItem {
  active_users_count: number;
  active_tenants_count: number;
  pending_approvals_count: number;
  audit_events_24h_count: number;
  security_posture: string;
  rbac_status: string;
}

export interface GovernanceOverviewItem {
  tenant_id: string;
  security_summary: SecuritySummaryItem;
  pending_approvals: ApprovalRequestItem[];
  recent_audit_events: AuditEventItem[];
  users: UserItem[];
}

export interface WorkflowInstanceItem {
  id: string;
  tenant_id: string;
  workflow_type: string;
  status: string;
  current_step: string;
  retry_count: number;
  max_retries: number;
  correlation_id?: string | null;
  error_message?: string | null;
  provenance: string;
  created_at: string;
  updated_at: string;
}

export interface DomainEventItem {
  event_id: string;
  event_type: string;
  tenant_id: string;
  source: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  correlation_id: string;
  causation_id?: string | null;
  provenance: string;
  schema_version: string;
  payload: Record<string, any>;
}

export interface NotificationLogItem {
  id: string;
  tenant_id: string;
  recipient: string;
  channel: string;
  severity: string;
  title: string;
  message: string;
  delivery_status: string;
  provenance: string;
  created_at: string;
}

export interface WebhookSubscriptionItem {
  id: string;
  tenant_id: string;
  target_url: string;
  events_filter: string;
  is_active: boolean;
  created_at: string;
}




