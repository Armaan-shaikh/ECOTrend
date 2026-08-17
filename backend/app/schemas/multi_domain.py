from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DomainScoreSummary(BaseModel):
    domain: str
    domain_name: str
    score: int
    category: str
    color: str
    data_coverage_percent: float
    data_type: str
    source_provenance: str
    is_available: bool

class MultiDomainOverviewResponse(BaseModel):
    cepi_score: int
    category: str
    color: str
    data_coverage_percent: float
    available_domains_count: int
    total_domains_count: int
    available_domains: List[str]
    missing_domains: List[str]
    weights_used: Dict[str, float]
    explanation: str
    domain_scores: List[DomainScoreSummary]

class CrossDomainCorrelationItem(BaseModel):
    metric_a: str
    metric_b: str
    sample_size: int
    status: str
    pearson_r: Optional[float] = None
    spearman_rho: Optional[float] = None
    p_value: Optional[float] = None
    is_statistically_significant: bool
    relationship_type: Optional[str] = None
    disclaimer: str
    explanation: str

class CrossDomainCorrelationResponse(BaseModel):
    location_id: str
    correlations: List[CrossDomainCorrelationItem]
    disclaimer: str

class DomainComparisonItem(BaseModel):
    location_id: str
    location_name: str
    cepi_score: int
    category: str
    air_score: Optional[int] = None
    water_score: Optional[int] = None
    soil_score: Optional[int] = None
    climate_score: Optional[int] = None
    emissions_score: Optional[int] = None
    noise_score: Optional[int] = None

class DomainComparisonResponse(BaseModel):
    locations: List[DomainComparisonItem]
