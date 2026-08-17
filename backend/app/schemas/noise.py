from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class NoiseMetricSubScore(BaseModel):
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

class NoiseQualityScoreResponse(BaseModel):
    overall_noise_score: int
    category: str
    color: str
    health_impact: str
    data_coverage_percent: float
    data_type: str
    source_provenance: str
    explanation: str
    metric_subscores: List[NoiseMetricSubScore]
    contextual_decibel_guidelines: Dict[str, Any]
    methodology: Dict[str, Any]

class NoiseStandardsResponse(BaseModel):
    methodology: Dict[str, Any]
    standards: Dict[str, Any]
    contextual_decibel_guidelines: Dict[str, Any]
    score_categories: List[Dict[str, Any]]
