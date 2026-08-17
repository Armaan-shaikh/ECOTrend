from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.cache import cache_manager, cached_endpoint
from app.engine.decision_engine import DecisionIntelligenceEngine
from app.engine.intervention_engine import InterventionEngine
from app.engine.decision_explanations import DecisionExplanationsEngine
from app.schemas.decision_support import (
    DecisionOverviewResponse,
    RecommendationListResponse,
    DecisionRecommendationSchema,
    InterventionResponse,
    InterventionOptionSchema,
    DecisionAuditResponse
)

router = APIRouter(prefix="/decision-support", tags=["Decision Automation & Adaptive Intelligence"])

# In-Memory Store for active recommendations during API calls
MOCK_RECOMMENDATIONS = [
    {
        "id": "rec_comp_air_PM2.5_101",
        "location_id": "loc_us_ny_nyc_manhattan",
        "domain": "air",
        "metric": "PM2.5",
        "title": "Mitigate PM2.5 Exceedance Breach (WHO Air Quality Guidelines 2021)",
        "priority_tier": "HIGH",
        "priority_score": 76.5,
        "status": "ACTIVE",
        "severity": "WARNING",
        "confidence": 0.95,
        "provenance": "DECISION_SUPPORT",
        "rationale": "Observed PM2.5 value of 22.5 ug/m3 breaches WHO 24-hour guideline threshold of 15.0 ug/m3.",
        "evidence_chain": {
            "observed_signal": {"value": 22.5, "unit": "ug/m3", "provenance": "MEASURED"},
            "compliance_rule": {"threshold": 15.0, "reference": "WHO Air Quality Guidelines (2021)", "reference_type": "GUIDELINE"},
            "priority_breakdown": {"severity_contribution": 21.0, "confidence_contribution": 19.0, "compliance_margin_contribution": 12.5, "persistence_contribution": 15.0, "domain_breadth_contribution": 9.0}
        },
        "recommended_actions": [
            "Activate targeted urban low-emission transit corridor controls.",
            "Notify regional EHS officer regarding WHO guideline threshold exceedance."
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "rec_pred_water_DO_102",
        "location_id": "loc_us_ny_nyc_manhattan",
        "domain": "water",
        "metric": "DO",
        "title": "Early Warning: Projected Dissolved Oxygen Hypoxia Risk on 2026-08-20",
        "priority_tier": "HIGH",
        "priority_score": 72.0,
        "status": "ACTIVE",
        "severity": "WARNING",
        "confidence": 0.85,
        "provenance": "DECISION_SUPPORT",
        "rationale": "Projected Dissolved Oxygen value of 4.2 mg/L expected to drop below EcoTrend Hypoxia criteria of 5.0 mg/L.",
        "evidence_chain": {
            "forecast_signal": {"projected_value": 4.2, "timestamp": "2026-08-20T00:00:00Z", "provenance": "FORECAST"},
            "compliance_rule": {"threshold": 5.0, "reference": "EcoTrend Hypoxia Criteria"},
            "priority_breakdown": {"severity_contribution": 21.0, "confidence_contribution": 17.0, "compliance_margin_contribution": 15.0, "persistence_contribution": 10.0, "domain_breadth_contribution": 9.0}
        },
        "recommended_actions": [
            "Deploy micro-bubble mechanical aeration units in Hudson estuary sector.",
            "Run what-if scenario simulations to evaluate aeration impact."
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

@router.get("/overview", response_model=DecisionOverviewResponse)
@cached_endpoint(prefix="ecotrend:dec_overview", ttl_seconds=30)
async def get_decision_overview(
    location_id: str = Query("loc_us_ny_nyc_manhattan"),
    db: Session = Depends(get_db)
):
    """
    Get high-level environmental decision overview, prioritized active recommendations, and intervention options.
    """
    baseline_scores = {"air": 80.0, "water": 82.0, "soil": 88.0, "climate": 85.0, "emissions": 72.0, "noise": 85.0}
    interventions = InterventionEngine.evaluate_interventions(location_id, baseline_scores)

    active_recs = [DecisionRecommendationSchema(**r) for r in MOCK_RECOMMENDATIONS if r["status"] == "ACTIVE"]

    return {
        "location_id": location_id,
        "system_decision_status": "ACTION_REQUIRED" if any(r.priority_tier in ["CRITICAL", "HIGH"] for r in active_recs) else "OPTIMAL",
        "total_active_recommendations": len(active_recs),
        "critical_recommendations_count": sum(1 for r in active_recs if r.priority_tier == "CRITICAL"),
        "high_recommendations_count": sum(1 for r in active_recs if r.priority_tier == "HIGH"),
        "medium_recommendations_count": sum(1 for r in active_recs if r.priority_tier == "MEDIUM"),
        "recommendations": active_recs,
        "interventions_summary": [InterventionOptionSchema(**i) for i in interventions],
        "disclaimer": "Decision Support recommendations provide automated intelligence to assist human EHS managers and do not substitute for official statutory compliance orders."
    }

@router.get("/recommendations", response_model=RecommendationListResponse)
@cached_endpoint(prefix="ecotrend:dec_recs", ttl_seconds=30)
async def get_recommendations(
    domain: str = Query(None),
    status: str = Query("ACTIVE"),
    db: Session = Depends(get_db)
):
    """
    Get list of prioritized environmental recommendations.
    """
    recs = MOCK_RECOMMENDATIONS
    if domain:
        recs = [r for r in recs if r["domain"].lower() == domain.lower()]
    if status:
        recs = [r for r in recs if r["status"].lower() == status.lower()]

    formatted = [DecisionRecommendationSchema(**r) for r in recs]
    return {
        "total_count": len(formatted),
        "recommendations": formatted
    }

@router.get("/recommendations/{id}", response_model=DecisionRecommendationSchema)
async def get_recommendation_by_id(id: str = Path(...), db: Session = Depends(get_db)):
    """
    Get single decision recommendation details.
    """
    for r in MOCK_RECOMMENDATIONS:
        if r["id"] == id:
            return DecisionRecommendationSchema(**r)
    raise HTTPException(status_code=404, detail=f"Recommendation '{id}' not found")

@router.post("/recommendations/{id}/acknowledge", response_model=DecisionRecommendationSchema)
async def acknowledge_recommendation(id: str = Path(...), db: Session = Depends(get_db)):
    """
    Acknowledge an active environmental recommendation.
    """
    for r in MOCK_RECOMMENDATIONS:
        if r["id"] == id:
            r["status"] = "ACKNOWLEDGED"
            r["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
            return DecisionRecommendationSchema(**r)
    raise HTTPException(status_code=404, detail=f"Recommendation '{id}' not found")

@router.post("/recommendations/{id}/resolve", response_model=DecisionRecommendationSchema)
async def resolve_recommendation(id: str = Path(...), db: Session = Depends(get_db)):
    """
    Resolve an active environmental recommendation.
    """
    for r in MOCK_RECOMMENDATIONS:
        if r["id"] == id:
            r["status"] = "RESOLVED"
            r["resolved_at"] = datetime.now(timezone.utc).isoformat()
            return DecisionRecommendationSchema(**r)
    raise HTTPException(status_code=404, detail=f"Recommendation '{id}' not found")

@router.get("/interventions", response_model=InterventionResponse)
@cached_endpoint(prefix="ecotrend:dec_interventions", ttl_seconds=60)
async def get_interventions(
    location_id: str = Query("loc_us_ny_nyc_manhattan"),
    db: Session = Depends(get_db)
):
    """
    Get available intervention options with projected CEPI score improvements.
    """
    baseline_scores = {"air": 80.0, "water": 82.0, "soil": 88.0, "climate": 85.0, "emissions": 72.0, "noise": 85.0}
    interventions = InterventionEngine.evaluate_interventions(location_id, baseline_scores)
    formatted = [InterventionOptionSchema(**i) for i in interventions]
    return {
        "total_interventions": len(formatted),
        "interventions": formatted
    }

@router.get("/audit", response_model=DecisionAuditResponse)
@cached_endpoint(prefix="ecotrend:dec_audit", ttl_seconds=60)
async def get_decision_audit(
    recommendation_id: str = Query("rec_comp_air_PM2.5_101"),
    db: Session = Depends(get_db)
):
    """
    Get complete step-by-step decision audit chain for a recommendation.
    """
    target_rec = MOCK_RECOMMENDATIONS[0]
    for r in MOCK_RECOMMENDATIONS:
        if r["id"] == recommendation_id:
            target_rec = r
            break

    baseline_scores = {"air": 80.0, "water": 82.0, "soil": 88.0, "climate": 85.0, "emissions": 72.0, "noise": 85.0}
    interventions = [InterventionOptionSchema(**i) for i in InterventionEngine.evaluate_interventions(target_rec["location_id"], baseline_scores)]

    audit = DecisionExplanationsEngine.format_decision_audit(target_rec, interventions)
    return DecisionAuditResponse(**audit)
