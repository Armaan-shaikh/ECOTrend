from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SoilMetricSubScore(BaseModel):
    metric: str
    title: str
    raw_value: Optional[float] = None
    unit: str
    score: int
    category: str
    standard: str
    reference_type: str
    weight: float
    is_available: bool
    contribution_pct: float

class SoilQualityScoreResponse(BaseModel):
    overall_soil_score: int
    category: str
    color: str
    health_impact: str
    data_coverage_percent: float
    primary_soil_driver: str
    data_type: str
    source_provenance: str
    explanation: str
    metric_subscores: List[SoilMetricSubScore]
    reference_types: Dict[str, str]
    methodology: Dict[str, Any]

class SoilStandardsResponse(BaseModel):
    methodology: Dict[str, Any]
    reference_types: Dict[str, str]
    standards: Dict[str, Any]
    score_categories: List[Dict[str, Any]]
