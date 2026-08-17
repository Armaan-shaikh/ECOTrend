import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.predictive_engine import PredictiveCoreEngine
from app.engine.predictive_risk import PredictiveRiskEngine
from app.engine.predictive_scenarios import ScenarioDecisionEngine
from app.core.cache import cache_manager

app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

def test_predictive_engine_insufficient_data_handling():
    # Less than 5 historical observations
    few_points = [
        {"timestamp": "2026-08-17T10:00:00Z", "value": 15.0},
        {"timestamp": "2026-08-17T11:00:00Z", "value": 16.0}
    ]

    res = PredictiveCoreEngine.generate_domain_forecast("air", "PM2.5", few_points, horizon="7D")
    assert res["status"] == "INSUFFICIENT_DATA"
    assert len(res["projections"]) == 0
    assert "Minimum 5 historical observations required" in res["data_limitations"]

def test_predictive_engine_valid_multi_domain_forecast():
    now = datetime.now(timezone.utc)
    pts = [{"timestamp": (now - timedelta(days=i)).isoformat(), "value": 20.0 + i * 0.5} for i in range(10, 0, -1)]

    res = PredictiveCoreEngine.generate_domain_forecast("air", "PM2.5", pts, horizon="7D")
    assert res["status"] == "VALID_FORECAST"
    assert res["domain"] == "air"
    assert res["metric"] == "PM2.5"
    assert len(res["projections"]) == 7
    assert res["provenance"] == "FORECAST"
    assert "mae" in res["model_metadata"]["accuracy_metrics"]
    assert "rmse" in res["model_metadata"]["accuracy_metrics"]
    assert "mape_percent" in res["model_metadata"]["accuracy_metrics"]

def test_predictive_risk_detection():
    now = datetime.now(timezone.utc)
    # High PM2.5 projections to trigger WHO 24h exceedance (15 ug/m3)
    forecast_data = {
        "domain": "air",
        "metric": "PM2.5",
        "status": "VALID_FORECAST",
        "projections": [
            {"timestamp": now.isoformat(), "forecast_value": 35.0} # Exceeds 15 ug/m3
        ]
    }

    risks = PredictiveRiskEngine.evaluate_forecasted_risks(forecast_data, trigger_alerts=False)
    assert len(risks) > 0
    assert risks[0]["event_type"] == "FORECASTED_COMPLIANCE_RISK"
    assert risks[0]["provenance"] == "FORECAST"
    assert risks[0]["forecast_value"] == 35.0
    assert "breach" in risks[0]["explanation"]

def test_scenario_decision_engine_calculation():
    baseline_scores = {
        "air": 80.0, "water": 82.0, "soil": 88.0,
        "climate": 85.0, "emissions": 72.0, "noise": 85.0
    }
    interventions = {
        "air_score_change": 10.0,
        "emissions_score_change": 15.0
    }

    res = ScenarioDecisionEngine.simulate_intervention_scenario("loc_1", baseline_scores, interventions)
    assert res["status"] == "SUCCESS"
    assert res["provenance"] == "SCENARIO"
    assert res["projected_cepi_score"] > res["baseline_cepi_score"]
    assert res["cepi_delta"] > 0.0
    assert res["overall_impact"] == "POSITIVE"

def test_predictions_overview_endpoint():
    res = client.get("/api/v1/predictions/overview")
    assert res.status_code == 200
    data = res.json()
    assert "overall_predictive_status" in data
    assert "forecasted_cepi_score" in data
    assert len(data["domain_forecasts"]) >= 6

def test_predictions_domain_endpoint():
    res = client.get("/api/v1/predictions/air?metric=PM2.5&horizon=7D")
    assert res.status_code == 200
    data = res.json()
    assert data["domain"] == "air"
    assert data["metric"] == "PM2.5"
    assert len(data["projections"]) == 7

def test_predictions_risks_list_endpoint():
    res = client.get("/api/v1/predictions/risks/list")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_predictions_accuracy_metrics_endpoint():
    res = client.get("/api/v1/predictions/accuracy/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "algorithms" in data
    assert "overall_champion" in data

def test_predictions_scenario_simulation_endpoint():
    payload = {
        "location_id": "loc_us_ny_nyc_manhattan",
        "interventions": {
            "air_score_change": 10.0,
            "noise_score_change": 15.0
        }
    }
    res = client.post("/api/v1/predictions/scenario", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["provenance"] == "SCENARIO"
    assert data["cepi_delta"] > 0.0
