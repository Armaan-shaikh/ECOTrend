import pytest
from app.core.standards_emissions import EMISSIONS_STANDARDS, get_emissions_category
from app.engine.cleaning_climate import ClimateDataCleaningPipeline
from app.engine.health_score_emissions import EmissionsHealthScoringEngine

def test_emissions_standards_weights_sum():
    total_weight = sum(s["weight"] for s in EMISSIONS_STANDARDS.values())
    assert abs(total_weight - 1.00) < 0.0001, "Emissions domain weights must sum to exactly 1.00"

def test_emissions_cleaning_rules():
    # Valid emissions
    val_rec, logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "CO2_PER_CAPITA",
        "value": 4.5,
        "unit": "tCO2/capita"
    })
    assert val_rec["data_quality"] == "VALID"

    # Negative emissions -> INVALID
    neg_rec, neg_logs = ClimateDataCleaningPipeline.clean_record({
        "metric": "CO2_PER_CAPITA",
        "value": -2.0,
        "unit": "tCO2/capita"
    })
    assert neg_rec["data_quality"] == "INVALID"

def test_emissions_subscores_targets():
    # Per capita <= 2.0 tCO2 -> Score 100
    co2_sub = EmissionsHealthScoringEngine.compute_metric_subscore("CO2_PER_CAPITA", 1.8, "tCO2/capita")
    assert co2_sub["score"] == 100

    # Atmospheric CO2 <= 280 ppm -> Score 100
    ppm_sub = EmissionsHealthScoringEngine.compute_metric_subscore("CO2_PPM", 275.0, "ppm")
    assert ppm_sub["score"] == 100

def test_emissions_aggregate_score_provenance():
    measurements = [
        {"metric": "CO2_PER_CAPITA", "value": 1.8, "unit": "tCO2/capita", "data_quality": "VALID", "source": "WorldBank_UNFCCC", "data_type": "ESTIMATED"},
        {"metric": "CO2_PPM", "value": 340.0, "unit": "ppm", "data_quality": "VALID", "source": "WorldBank_UNFCCC", "data_type": "ESTIMATED"},
        {"metric": "CO2E_TOTAL", "value": 8.0, "unit": "MtCO2e", "data_quality": "VALID", "source": "WorldBank_UNFCCC", "data_type": "ESTIMATED"}
    ]

    res = EmissionsHealthScoringEngine.compute_aggregate_emissions_score(measurements)

    assert res["overall_emissions_score"] >= 90
    assert res["data_type"] == "ESTIMATED"
    assert res["data_coverage_percent"] == 100.0
