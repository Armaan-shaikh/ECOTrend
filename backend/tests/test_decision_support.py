import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.adaptive_prioritization import AdaptivePrioritizationEngine
from app.engine.intervention_engine import InterventionEngine
from app.engine.decision_engine import DecisionIntelligenceEngine
from app.engine.decision_explanations import DecisionExplanationsEngine
from app.core.cache import cache_manager

app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

def test_adaptive_prioritization_scoring_tiers():
    # 1. CRITICAL Tier (High severity, high margin, 6 domains)
    p1 = AdaptivePrioritizationEngine.calculate_priority(
        severity="CRITICAL", confidence=0.95, exceedance_margin_pct=80.0, persistence_hours=48.0, affected_domains_count=6
    )
    assert p1["priority_score"] >= 80.0
    assert p1["priority_tier"] == "CRITICAL"
    assert "severity_contribution" in p1["contributing_factors"]

    # 2. HIGH Tier
    p2 = AdaptivePrioritizationEngine.calculate_priority(
        severity="WARNING", confidence=0.85, exceedance_margin_pct=70.0, persistence_hours=48.0, affected_domains_count=5
    )
    assert 65.0 <= p2["priority_score"] < 80.0
    assert p2["priority_tier"] == "HIGH"

    # 3. LOW Tier
    p3 = AdaptivePrioritizationEngine.calculate_priority(
        severity="NORMAL", confidence=0.50, exceedance_margin_pct=0.0, persistence_hours=0.0, affected_domains_count=1
    )
    assert p3["priority_score"] < 45.0
    assert p3["priority_tier"] == "LOW"

def test_decision_intelligence_engine_recommendations():
    domain_scores = {"air": 80.0, "water": 82.0, "soil": 88.0, "climate": 85.0, "emissions": 72.0, "noise": 85.0}
    exceeded_rules = [
        {
            "domain": "air",
            "metric": "PM2.5",
            "observed_value": 25.0,
            "threshold": 15.0,
            "unit": "ug/m3",
            "evaluation_severity": "WARNING",
            "reference_name": "WHO Air Quality Guidelines (2021)",
            "reference_type": "GUIDELINE"
        }
    ]
    forecasted_risks = [
        {
            "domain": "water",
            "metric": "DO",
            "forecast_value": 4.2,
            "threshold": 5.0,
            "unit": "mg/L",
            "severity": "WARNING",
            "reference_name": "EcoTrend Hypoxia Criteria",
            "forecast_timestamp": "2026-08-20T00:00:00Z"
        }
    ]

    recs = DecisionIntelligenceEngine.generate_recommendations_for_location("loc_1", domain_scores, exceeded_rules, forecasted_risks)
    assert len(recs) == 2
    assert recs[0]["provenance"] == "DECISION_SUPPORT"
    assert "evidence_chain" in recs[0]

def test_intervention_engine_cepi_projections():
    baseline_scores = {"air": 80.0, "water": 82.0, "soil": 88.0, "climate": 85.0, "emissions": 72.0, "noise": 85.0}
    intvs = InterventionEngine.evaluate_interventions("loc_1", baseline_scores)

    assert len(intvs) >= 4
    for i in intvs:
        assert i["provenance"] == "DECISION_SUPPORT"
        assert i["estimated_cepi_improvement"] > 0.0
        assert i["projected_cepi_score"] > i["baseline_cepi_score"]

def test_decision_explanations_audit_formatting():
    rec = {
        "id": "rec_101",
        "location_id": "loc_1",
        "domain": "air",
        "title": "PM2.5 Mitigation",
        "priority_tier": "HIGH",
        "priority_score": 75.0,
        "rationale": "PM2.5 exceedance",
        "evidence_chain": {"observed_signal": {"value": 25.0, "unit": "ug/m3"}}
    }
    audit = DecisionExplanationsEngine.format_decision_audit(rec, [])
    assert len(audit["decision_chain"]) == 5
    assert audit["decision_chain"][0]["phase"] == "OBSERVATION"
    assert audit["decision_chain"][4]["phase"] == "RECOMMENDATION_GENERATION"

def test_decision_overview_endpoint():
    res = client.get("/api/v1/decision-support/overview")
    assert res.status_code == 200
    data = res.json()
    assert "system_decision_status" in data
    assert "total_active_recommendations" in data
    assert len(data["recommendations"]) > 0

def test_decision_recommendations_endpoints():
    res = client.get("/api/v1/decision-support/recommendations")
    assert res.status_code == 200
    recs = res.json()["recommendations"]
    assert len(recs) > 0

    rec_id = recs[0]["id"]
    get_res = client.get(f"/api/v1/decision-support/recommendations/{rec_id}")
    assert get_res.status_code == 200

    ack_res = client.post(f"/api/v1/decision-support/recommendations/{rec_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "ACKNOWLEDGED"

    res_res = client.post(f"/api/v1/decision-support/recommendations/{rec_id}/resolve")
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "RESOLVED"

def test_decision_interventions_endpoint():
    res = client.get("/api/v1/decision-support/interventions")
    assert res.status_code == 200
    data = res.json()
    assert data["total_interventions"] >= 4

def test_decision_audit_endpoint():
    res = client.get("/api/v1/decision-support/audit?recommendation_id=rec_comp_air_PM2.5_101")
    assert res.status_code == 200
    data = res.json()
    assert "decision_chain" in data
    assert len(data["decision_chain"]) == 5
