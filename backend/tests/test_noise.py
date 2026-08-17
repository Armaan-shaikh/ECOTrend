import pytest
from app.core.standards_noise import NOISE_STANDARDS, get_noise_category
from app.engine.cleaning_noise import NoiseDataCleaningPipeline
from app.engine.health_score_noise import NoiseHealthScoringEngine

def test_noise_standards_weights_sum():
    total_weight = sum(s["weight"] for s in NOISE_STANDARDS.values())
    assert abs(total_weight - 1.00) < 0.0001, "Noise domain weight must sum to 1.00"

def test_noise_cleaning_rules():
    # Valid noise incident count
    v_rec, logs = NoiseDataCleaningPipeline.clean_record({
        "metric": "NOISE_INCIDENTS",
        "value": 3.0,
        "unit": "incidents/day"
    })
    assert v_rec["data_quality"] == "VALID"

    # Negative incident count -> INVALID
    neg_rec, neg_logs = NoiseDataCleaningPipeline.clean_record({
        "metric": "NOISE_INCIDENTS",
        "value": -2.0,
        "unit": "incidents/day"
    })
    assert neg_rec["data_quality"] == "INVALID"

    # Extreme surge (>100 incidents/day) -> SUSPECT
    ext_rec, ext_logs = NoiseDataCleaningPipeline.clean_record({
        "metric": "NOISE_INCIDENTS",
        "value": 150.0,
        "unit": "incidents/day"
    })
    assert ext_rec["data_quality"] == "SUSPECT"

def test_noise_subscore_deterministic():
    # 0 incidents/day -> Score 100
    s0 = NoiseHealthScoringEngine.compute_metric_subscore("NOISE_INCIDENTS", 0.0, "incidents/day")
    assert s0["score"] == 100

    # 2 incidents/day -> Score 85
    s2 = NoiseHealthScoringEngine.compute_metric_subscore("NOISE_INCIDENTS", 2.0, "incidents/day")
    assert s2["score"] == 85

    # 5 incidents/day -> Score 65
    s5 = NoiseHealthScoringEngine.compute_metric_subscore("NOISE_INCIDENTS", 5.0, "incidents/day")
    assert s5["score"] == 65

def test_no_fabricated_dba_values():
    measurements = [
        {"metric": "NOISE_INCIDENTS", "value": 2.0, "unit": "incidents/day", "data_quality": "VALID", "source": "NYC_OpenData_311", "data_type": "MEASURED"}
    ]

    res = NoiseHealthScoringEngine.compute_aggregate_noise_score(measurements)

    assert res["overall_noise_score"] == 85
    assert res["data_type"] == "MEASURED"
    assert res["data_coverage_percent"] == 100.0

    # Verify dBA metrics are explicitly UNAVAILABLE and not fabricated
    subscores = {sub["metric"]: sub for sub in res["metric_subscores"]}
    assert "Lden" in subscores
    assert subscores["Lden"]["is_available"] is False
    assert subscores["Lden"]["raw_value"] is None
    assert subscores["Lden"]["category"] == "UNAVAILABLE"
