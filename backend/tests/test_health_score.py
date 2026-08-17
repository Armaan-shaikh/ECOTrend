import pytest
from app.engine.health_score import EHSScoringEngine
from app.core.standards import get_category_for_score, AIR_QUALITY_STANDARDS

def test_pm25_piecewise_subscore():
    # Test at exact WHO annual target (5.0 µg/m³) -> Should yield 90
    sub_annual = EHSScoringEngine.compute_metric_subscore("PM2.5", 5.0, "µg/m³")
    assert sub_annual["score"] == 90
    assert sub_annual["category"] == "Excellent"

    # Test at exact WHO 24h limit (15.0 µg/m³) -> Should yield 75
    sub_24h = EHSScoringEngine.compute_metric_subscore("PM2.5", 15.0, "µg/m³")
    assert sub_24h["score"] == 75
    assert sub_24h["category"] == "Good"

    # Test extreme high concentration (150 µg/m³) -> Decay toward 0
    sub_extreme = EHSScoringEngine.compute_metric_subscore("PM2.5", 150.0, "µg/m³")
    assert sub_extreme["score"] < 40
    assert sub_extreme["category"] in ["Very Poor", "Critical"]

def test_data_coverage_and_missing_metrics():
    # Only 2 metrics available out of 6
    measurements = [
        {"metric": "PM2.5", "value": 10.0, "unit": "µg/m³"},
        {"metric": "PM10", "value": 25.0, "unit": "µg/m³"}
    ]

    result = EHSScoringEngine.compute_aggregate_ehs(measurements)
    assert result["data_coverage_percent"] == 55.0 # (0.35 + 0.20) / 1.0 * 100%
    assert result["overall_ehs"] > 0
    assert len(result["metric_subscores"]) >= 6

    # Verify missing metrics are flagged is_available: False
    no2_sub = [m for m in result["metric_subscores"] if m["metric"] == "NO2"][0]
    assert no2_sub["is_available"] == False

def test_forecast_to_ehs_conversion_monotonicity():
    forecast_mock = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "projections": [
            {
                "date": "2026-09-01",
                "timestamp": "2026-09-01T00:00:00Z",
                "baseline_value": 30.0,
                "improvement_value": 20.0, # Lower pollutant
                "worsening_value": 45.0,   # Higher pollutant
                "ci_95_lower": 15.0,
                "ci_95_upper": 55.0
            }
        ]
    }

    ehs_projections = EHSScoringEngine.convert_forecast_to_ehs(forecast_mock)
    p = ehs_projections[0]

    # Lower pollutant concentration MUST yield higher EHS score
    assert p["improvement_ehs"] >= p["baseline_ehs"]
    assert p["baseline_ehs"] >= p["worsening_ehs"]
    assert p["ehs_ci_95_upper"] >= p["ehs_ci_95_lower"]

def test_deterministic_explanation_builder():
    text = EHSScoringEngine.build_deterministic_explanation(
        overall_score=62,
        category="Moderate",
        primary_driver={"metric": "PM2.5", "raw_value": 28.5, "unit": "µg/m³"},
        coverage_pct=100.0
    )

    assert "Air Quality Score: 62/100 — Moderate." in text
    assert "PM2.5 (28.5 µg/m³)" in text
    assert "Data coverage is 100.0%" in text
