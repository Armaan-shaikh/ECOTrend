from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel

class LinearTrendMetrics(BaseModel):
    slope: float
    intercept: float
    r_squared: float
    p_value: float
    direction: str  # "IMPROVING", "STABLE", "DEGRADING"
    annualized_change: float

class VolatilityMetrics(BaseModel):
    mean: float
    std_dev: float
    coefficient_of_variation: float  # CV = std / mean
    min_value: float
    max_value: float
    median_value: float

class AnomalyPoint(BaseModel):
    timestamp: str
    value: float
    z_score: float
    reason: str

class SeasonalityDecomposition(BaseModel):
    timestamps: List[str]
    observed: List[float]
    trend: List[Optional[float]]
    seasonal: List[Optional[float]]
    residual: List[Optional[float]]
    has_seasonality: bool

class HistoricalAnalyticsSummary(BaseModel):
    location_id: str
    location_name: str
    metric: str
    unit: str
    start_time: str
    end_time: str
    total_observations: int
    valid_observations: int
    invalid_observations: int
    suspect_observations: int
    linear_trend: LinearTrendMetrics
    rate_of_change_percent: float
    volatility: VolatilityMetrics
    anomalies: List[AnomalyPoint]
    seasonality: SeasonalityDecomposition
