from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionPointSchema(BaseModel):
    timestamp: str
    forecast_value: float
    lower_ci: float
    upper_ci: float
    horizon_step_days: int
    provenance: str = "FORECAST"

class AccuracyMetricsSchema(BaseModel):
    mae: float
    rmse: float
    mape_percent: float

class ModelMetadataSchema(BaseModel):
    model_name: str
    accuracy_metrics: AccuracyMetricsSchema
    sample_count: int

class DomainForecastResponse(BaseModel):
    domain: str
    metric: str
    status: str # VALID_FORECAST, INSUFFICIENT_DATA
    horizon: str # 24H, 7D, 30D, 1_YEAR
    horizon_days: int
    projections: List[PredictionPointSchema]
    model_metadata: ModelMetadataSchema
    provenance: str = "FORECAST"
    data_limitations: str

class PredictiveRiskItemSchema(BaseModel):
    domain: str
    metric: str
    forecast_value: float
    forecast_timestamp: str
    threshold: float
    threshold_direction: str
    unit: str
    severity: str # CRITICAL, WARNING
    reference_name: str
    reference_type: str
    jurisdiction: str
    event_type: str = "FORECASTED_COMPLIANCE_RISK"
    provenance: str = "FORECAST"
    explanation: str

class ScenarioRequestSchema(BaseModel):
    location_id: str
    interventions: Dict[str, float]

class ScenarioImpactItemSchema(BaseModel):
    domain: str
    baseline_score: float
    projected_score: float
    delta: float
    impact_category: str

class ScenarioResponseSchema(BaseModel):
    location_id: str
    status: str
    provenance: str = "SCENARIO"
    baseline_cepi_score: float
    projected_cepi_score: float
    cepi_delta: float
    overall_impact: str
    domain_impacts: List[ScenarioImpactItemSchema]
    applied_interventions: Dict[str, float]
    assumptions: List[str]

class PredictiveOverviewResponse(BaseModel):
    location_id: str
    overall_predictive_status: str
    forecasted_cepi_score: float
    projected_cepi_trend: str
    active_forecasted_risks_count: int
    domain_forecasts: List[DomainForecastResponse]
    forecasted_risks: List[PredictiveRiskItemSchema]
