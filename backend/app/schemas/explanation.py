from typing import List, Dict, Optional
from pydantic import BaseModel

class MetricDefinitionSchema(BaseModel):
    metric: str
    title: str
    definition: str
    common_sources: str
    health_relevance: str

class LocationExplanationResponse(BaseModel):
    location_name: str
    summary: str
    current_condition: str
    historical_trend: str
    primary_driver: str
    forecast_outlook: str
    scenario_comparison: str
    data_quality_note: str
    metric_explanations: List[MetricDefinitionSchema]
    key_findings: List[str]
    warnings: List[str]
    methodology_note: str
