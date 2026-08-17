from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PriorityFactorsSchema(BaseModel):
    severity_contribution: float
    confidence_contribution: float
    compliance_margin_contribution: float
    persistence_contribution: float
    domain_breadth_contribution: float

class DecisionRecommendationSchema(BaseModel):
    id: str
    location_id: str
    domain: str
    metric: str
    title: str
    priority_tier: str # CRITICAL, HIGH, MEDIUM, LOW
    priority_score: float
    status: str # ACTIVE, ACKNOWLEDGED, RESOLVED, EXPIRED
    severity: str
    confidence: float
    provenance: str = "DECISION_SUPPORT"
    rationale: str
    recommended_actions: List[str]
    created_at: str
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None

class InterventionOptionSchema(BaseModel):
    id: str
    name: str
    domain: str
    target_metric: str
    description: str
    baseline_cepi_score: float
    projected_cepi_score: float
    estimated_cepi_improvement: float
    confidence: float
    assumptions: List[str]
    provenance: str = "DECISION_SUPPORT"
    disclaimer: str

class DecisionOverviewResponse(BaseModel):
    location_id: str
    system_decision_status: str # OPTIMAL, ELEVATED_ATTENTION, ACTION_REQUIRED
    total_active_recommendations: int
    critical_recommendations_count: int
    high_recommendations_count: int
    medium_recommendations_count: int
    recommendations: List[DecisionRecommendationSchema]
    interventions_summary: List[InterventionOptionSchema]
    disclaimer: str

class RecommendationListResponse(BaseModel):
    total_count: int
    recommendations: List[DecisionRecommendationSchema]

class InterventionResponse(BaseModel):
    total_interventions: int
    interventions: List[InterventionOptionSchema]

class DecisionChainStepSchema(BaseModel):
    step: int
    phase: str
    provenance: str
    detail: str

class DecisionAuditResponse(BaseModel):
    recommendation_id: str
    location_id: str
    domain: str
    title: str
    priority_tier: str
    priority_score: float
    decision_chain: List[DecisionChainStepSchema]
    actionable_interventions: List[InterventionOptionSchema]
    legal_disclaimer: str
