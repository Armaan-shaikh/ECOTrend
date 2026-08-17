import pytest
from app.engine.cleaning_water import WaterDataCleaningPipeline
from app.engine.health_score_water import WaterHealthScoringEngine
from app.core.standards_water import WATER_QUALITY_STANDARDS, get_water_category

def test_water_cleaning_physical_bounds():
    # Test invalid pH (< 0 or > 14)
    invalid_ph, logs = WaterDataCleaningPipeline.validate_measurement({
        "metric": "pH", "value": -1.5, "unit": "dimensionless", "location_id": "loc_test", "timestamp": "2026-08-17T00:00:00Z"
    })
    assert invalid_ph["data_quality"] == "INVALID"
    assert len(logs) == 1

    # Test suspect extreme pH (e.g. 3.5)
    suspect_ph, logs = WaterDataCleaningPipeline.validate_measurement({
        "metric": "pH", "value": 3.5, "unit": "dimensionless", "location_id": "loc_test", "timestamp": "2026-08-17T00:00:00Z"
    })
    assert suspect_ph["data_quality"] == "SUSPECT"

    # Test negative BOD (impossible physical value)
    invalid_bod, logs = WaterDataCleaningPipeline.validate_measurement({
        "metric": "BOD", "value": -5.0, "unit": "mg/L", "location_id": "loc_test", "timestamp": "2026-08-17T00:00:00Z"
    })
    assert invalid_bod["data_quality"] == "INVALID"

def test_water_subscore_calculations():
    # Test optimal Dissolved Oxygen (7.8 mg/L) -> Should yield 100 (Pristine)
    sub_do = WaterHealthScoringEngine.compute_metric_subscore("DO", 7.8, "mg/L")
    assert sub_do["score"] == 100
    assert sub_do["category"] == "Pristine"

    # Test moderate BOD (5.0 mg/L) -> Should yield 75 (Good)
    sub_bod = WaterHealthScoringEngine.compute_metric_subscore("BOD", 5.0, "mg/L")
    assert sub_bod["score"] == 75
    assert sub_bod["category"] == "Good"

    # Test extreme high COD (100.0 mg/L) -> Should decay toward 0
    sub_cod = WaterHealthScoringEngine.compute_metric_subscore("COD", 100.0, "mg/L")
    assert sub_cod["score"] == 0
    assert sub_cod["category"] == "Critical"

def test_water_aggregate_score_and_coverage():
    measurements = [
        {"metric": "DO", "value": 7.5, "unit": "mg/L", "data_quality": "VALID"},
        {"metric": "BOD", "value": 2.0, "unit": "mg/L", "data_quality": "VALID"},
        {"metric": "TDS", "value": 250.0, "unit": "mg/L", "data_quality": "VALID"},
        {"metric": "pH", "value": 7.2, "unit": "dimensionless", "data_quality": "VALID"}
    ]

    res = WaterHealthScoringEngine.compute_aggregate_water_score(measurements)
    assert res["overall_water_score"] >= 90
    assert res["category"] == "Pristine"
    assert res["data_coverage_percent"] == 75.0 # (0.25+0.20+0.15+0.15)/1.0 * 100%
    assert len(res["metric_subscores"]) == 8 # All 8 supported metrics present in schema

    # Verify missing metric BOD is handled gracefully
    tds_sub = [m for m in res["metric_subscores"] if m["metric"] == "COD"][0]
    assert tds_sub["is_available"] == False

def test_water_category_classification():
    cat = get_water_category(82)
    assert cat["category"] == "Good"
    assert cat["color"] == "#06B6D4"
