from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.compliance_rules import COMPLIANCE_RULES
from app.engine.compliance_engine import ComplianceEvaluationEngine
from app.engine.report_generator import EHSReportGenerator
from app.engine.multi_domain import MultiDomainEngine
from app.schemas.compliance import (
    ComplianceOverviewResponse,
    RiskAssessmentResponse,
    ReportGenerationRequest,
    EHSReportExportResponse
)

router = APIRouter(prefix="/compliance", tags=["Standards & Guidelines Compliance"])

@router.get("/alerts", response_model=ComplianceOverviewResponse)
async def get_compliance_alerts(
    location_id: str = Query("loc_us_ny_nyc_manhattan", description="Location ID"),
    db: Session = Depends(get_db)
):
    """
    Evaluate multi-domain observations against verified standards and guidelines.
    Returns evaluated rules, statuses, and EcoTrend Compounding Risk Index.
    """
    # Sample current observations across 6 domains for evaluation
    sample_obs = {
        "rule_air_pm25_24h": 18.5,        # Exceeds 15.0 -> WARNING
        "rule_air_pm25_annual": 12.2,     # Exceeds 5.0 -> ADVISORY
        "rule_water_do_hypoxia": 5.2,     # Compliant (>4.0)
        "rule_soil_pb_screening": 120.0,  # Compliant (<200.0)
        "rule_climate_warming_limit": 1.2,# Compliant (<1.5)
        "rule_emissions_footprint": 5.1,  # Exceeds 4.7 -> ADVISORY
        "rule_noise_incident_surge": 12.0 # Exceeds 10.0 -> WARNING
    }

    evaluations = []
    for r_id, val in sample_obs.items():
        ev = ComplianceEvaluationEngine.evaluate_observation(r_id, val, location_id=location_id)
        evaluations.append(ev)

    risk_res = ComplianceEvaluationEngine.calculate_compounding_risk_index(evaluations)

    return {
        "location_id": location_id,
        "evaluations": evaluations,
        "risk_assessment": risk_res
    }

@router.get("/risk-assessment", response_model=RiskAssessmentResponse)
async def get_risk_assessment(
    location_id: str = Query("loc_us_ny_nyc_manhattan", description="Location ID"),
    db: Session = Depends(get_db)
):
    """
    Get EcoTrend Compounding Environmental Risk Index (0-100) and risk tier classification.
    """
    alerts_data = await get_compliance_alerts(location_id=location_id, db=db)
    return alerts_data["risk_assessment"]

@router.post("/reports/generate", response_model=EHSReportExportResponse)
async def generate_ehs_report(
    req: ReportGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate an EHS Standards & Guidelines Audit Report package in JSON or Markdown format.
    """
    alerts_data = await get_compliance_alerts(location_id=req.location_id, db=db)
    evaluations = alerts_data["evaluations"]
    risk_summary = alerts_data["risk_assessment"]

    # Sample CEPI summary
    cepi_summary = {
        "cepi_score": 81,
        "category": "Good"
    }

    report_json = EHSReportGenerator.generate_json_report(
        location_id=req.location_id,
        location_name="Manhattan Central Station",
        evaluations=evaluations,
        risk_summary=risk_summary,
        cepi_summary=cepi_summary
    )

    if req.format == "markdown":
        md_text = EHSReportGenerator.generate_markdown_report(
            location_id=req.location_id,
            location_name="Manhattan Central Station",
            evaluations=evaluations,
            risk_summary=risk_summary,
            cepi_summary=cepi_summary
        )
        report_json["markdown_content"] = md_text

    return report_json
