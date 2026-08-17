import pytest
from app.core.standards_climate import CLIMATE_STANDARDS, get_climate_category
from app.engine.cleaning_climate import ClimateDataCleaningPipeline
from app.engine.health_score_climate import ClimateHealthScoringEngine

def test_climate_standards_weights_sum():
    total_weight = sum(s["weight"] for s in CLIMATE_STANDARDS.values())
    assert abs(total_weight - 1.00) < 0.0001, "Climate domain weights must sum to exactly 1.00"

def test_climate_cleaning_rules():
    # Valid temperature
    t_rec, logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "T2M",
        "value": 22.5,
        "unit": "°C"
    })
    assert t_rec["data_quality"] == "VALID"

    # Extreme temperature -> SUSPECT (heatwave preservation)
    ext_rec, ext_logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "T2M",
        "value": 52.5,
        "unit": "°C"
    })
    assert ext_rec["data_quality"] == "SUSPECT"

    # Out of physical bounds temperature -> INVALID
    inv_rec, inv_logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "T2M",
        "value": -95.0,
        "unit": "°C"
    })
    assert inv_rec["data_quality"] == "INVALID"

    # Relative humidity > 100% -> INVALID
    rh_rec, rh_logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "RH2M",
        "value": 115.0,
        "unit": "%"
    })
    assert rh_rec["data_quality"] == "INVALID"

    # Negative precipitation -> INVALID
    p_rec, p_logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "PRECIP",
        "value": -5.0,
        "unit": "mm"
    })
    assert p_rec["data_quality"] == "INVALID"

def test_climate_subscores_targets():
    # Temperature anomaly 0.2°C -> Score 100
    anom_sub = ClimateHealthScoringEngine.compute_metric_subscore("T_ANOMALY", 0.2, "°C")
    assert anom_sub["score"] == 100

    # Temperature 22.0°C -> Score 100
    t_sub = ClimateHealthScoringEngine.compute_metric_subscore("T2M", 22.0, "°C")
    assert t_sub["score"] == 100

    # Relative Humidity 55.0% -> Score 100
    rh_sub = ClimateHealthScoringEngine.compute_metric_subscore("RH2M", 55.0, "%")
    assert rh_sub["score"] == 100

def test_climate_aggregate_score_provenance():
    measurements = [
        {"metric": "T_ANOMALY", "value": 0.4, "unit": "°C", "data_quality": "VALID", "source": "Open-Meteo_ERA5", "data_type": "REANALYSIS"},
        {"metric": "T2M", "value": 21.0, "unit": "°C", "data_quality": "VALID", "source": "Open-Meteo_ERA5", "data_type": "REANALYSIS"},
        {"metric": "PRECIP", "value": 10.0, "unit": "mm", "data_quality": "VALID", "source": "Open-Meteo_ERA5", "data_type": "REANALYSIS"},
        {"metric": "RH2M", "value": 50.0, "unit": "%", "data_quality": "VALID", "source": "Open-Meteo_ERA5", "data_type": "REANALYSIS"},
        {"metric": "WS10M", "value": 4.0, "unit": "m/s", "data_quality": "VALID", "source": "Open-Meteo_ERA5", "data_type": "REANALYSIS"}
    ]

    res = ClimateHealthScoringEngine.compute_aggregate_climate_score(measurements)

    assert res["overall_climate_score"] >= 90
    assert res["data_type"] == "REANALYSIS"
    assert res["data_coverage_percent"] == 100.0
