from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ComplianceEvaluationItem(BaseModel):
    rule_id: str
    domain: str
    metric: str
    unit: str
    averaging_period: str
    observed_value: Optional[float] = None
    threshold: float
    threshold_direction: str
    is_exceeded: bool
    status: str
    evaluation_severity: str
    reference_name: str
    reference_type: str
    jurisdiction: str
    source_url: str
    provenance: str
    explanation: str

class RiskAssessmentResponse(BaseModel):
    compounding_risk_score: int
    risk_tier: str
    color: str
    recommended_action: str
    total_evaluated_rules: int
    exceeded_rules_count: int
    critical_rules_count: int
    warning_rules_count: int
    methodology_reference: str
    attribution_notice: str
    explanation: str

class ComplianceOverviewResponse(BaseModel):
    location_id: str
    evaluations: List[ComplianceEvaluationItem]
    risk_assessment: RiskAssessmentResponse

class ReportGenerationRequest(BaseModel):
    location_id: str = "loc_us_ny_nyc_manhattan"
    format: str = "json"  # "json" or "markdown"

class EHSReportExportResponse(BaseModel):
    report_title: str
    generated_at: str
    location_id: str
    location_name: str
    executive_summary: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    cepi_overview: Dict[str, Any]
    evaluations_detail: List[ComplianceEvaluationItem]
    markdown_content: Optional[str] = None
