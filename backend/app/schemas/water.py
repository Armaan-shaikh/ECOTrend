from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class WaterMetricSubScoreSchema(BaseModel):
    metric: str
    raw_value: Optional[float] = None
    unit: str
    score: int
    category: str
    standard: str
    weight: float
    is_available: bool
    contribution_pct: float

class WaterQualityScoreResponse(BaseModel):
    overall_water_score: int
    category: str
    color: str
    health_impact: str
    data_coverage_percent: float
    primary_water_driver: str
    explanation: str
    metric_subscores: List[WaterMetricSubScoreSchema]
    methodology: Dict[str, Any]

class WaterStandardsResponse(BaseModel):
    methodology: Dict[str, Any]
    standards: Dict[str, Any]
    score_categories: List[Dict[str, Any]]
