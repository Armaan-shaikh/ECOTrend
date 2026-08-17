from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EmissionsMetricSubScore(BaseModel):
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

class EmissionsQualityScoreResponse(BaseModel):
    overall_emissions_score: int
    category: str
    color: str
    health_impact: str
    data_coverage_percent: float
    data_type: str
    source_provenance: str
    explanation: str
    metric_subscores: List[EmissionsMetricSubScore]
    methodology: Dict[str, Any]

class EmissionsStandardsResponse(BaseModel):
    methodology: Dict[str, Any]
    standards: Dict[str, Any]
    score_categories: List[Dict[str, Any]]
