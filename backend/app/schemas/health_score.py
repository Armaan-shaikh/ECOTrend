from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class MetricSubScore(BaseModel):
    metric: str
    raw_value: Optional[float] = None
    unit: str
    score: int
    category: str
    standard: str
    weight: float
    is_available: bool
    contribution_pct: float

class AggregateEHSResponse(BaseModel):
    overall_ehs: int
    category: str
    color: str
    health_impact: str
    data_coverage_percent: float
    primary_pollutant_driver: str
    explanation: str
    metric_subscores: List[MetricSubScore]
    methodology: Dict[str, Any]

class HistoricalEHSPoint(BaseModel):
    date: str
    timestamp: str
    overall_ehs: int
    category: str
    color: str
    data_coverage_percent: float
    primary_pollutant_driver: str

class ForecastEHSPoint(BaseModel):
    date: str
    timestamp: str
    baseline_ehs: int
    baseline_category: str
    improvement_ehs: int
    worsening_ehs: int
    ehs_ci_95_lower: int
    ehs_ci_95_upper: int

class ForecastEHSResponse(BaseModel):
    location_id: str
    metric: str
    horizon: str
    projections: List[ForecastEHSPoint]
