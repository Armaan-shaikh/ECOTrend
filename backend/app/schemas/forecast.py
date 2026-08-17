from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class BacktestMetrics(BaseModel):
    rmse: float
    mae: float
    mape_percent: float
    r_squared: float

class ModelLeaderboardItem(BaseModel):
    model_name: str
    rmse: float
    mae: float
    mape_percent: float
    r_squared: float
    is_champion: bool

class ForecastPoint(BaseModel):
    timestamp: str
    date: str
    baseline_value: float
    improvement_value: float
    worsening_value: float
    ci_80_lower: float
    ci_80_upper: float
    ci_95_lower: float
    ci_95_upper: float

class ForecastProjectionResponse(BaseModel):
    location_id: str
    metric: str
    unit: str
    horizon: str = Field(..., description="6_MONTHS, 1_YEAR, 3_YEARS, 5_YEARS")
    horizon_days: int
    champion_model: str
    backtest_metrics: BacktestMetrics
    leaderboard: List[ModelLeaderboardItem] = []
    projections: List[ForecastPoint]
