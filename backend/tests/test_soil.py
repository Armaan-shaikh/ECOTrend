import pytest
from app.core.standards_soil import SOIL_QUALITY_STANDARDS, get_soil_category
from app.engine.cleaning_soil import SoilDataCleaningPipeline
from app.engine.health_score_soil import SoilHealthScoringEngine

def test_soil_standards_weights_sum():
    total_weight = sum(s["weight"] for s in SOIL_QUALITY_STANDARDS.values())
    assert abs(total_weight - 1.00) < 0.0001, "Soil domain weights must sum to exactly 1.00"

def test_soil_cleaning_bounds():
    # Valid non-negative concentration
    val_rec, logs = SoilDataCleaningPipeline.clean_record({
        "metric": "SOC",
        "value": 2.4,
        "unit": "%"
    })
    assert val_rec["data_quality"] == "VALID"

    # Negative concentration -> INVALID
    neg_rec, neg_logs = SoilDataCleaningPipeline.clean_record({
        "metric": "Pb",
        "value": -12.5,
        "unit": "mg/kg"
    })
    assert neg_rec["data_quality"] == "INVALID"

    # Out-of-bounds pH -> INVALID
    ph_rec, ph_logs = SoilDataCleaningPipeline.clean_record({
        "metric": "pH",
        "value": 15.2,
        "unit": "dimensionless"
    })
    assert ph_rec["data_quality"] == "INVALID"

    # Extreme contamination -> SUSPECT
    ext_rec, ext_logs = SoilDataCleaningPipeline.clean_record({
        "metric": "Pb",
        "value": 1200.0,
        "unit": "mg/kg"
    })
    assert ext_rec["data_quality"] == "SUSPECT"

def test_soil_subscores_targets():
    # SOC target >= 2.0% -> Score 100
    soc_sub = SoilHealthScoringEngine.compute_metric_subscore("SOC", 2.5, "%")
    assert soc_sub["score"] == 100

    # pH target 6.0-7.8 -> Score 100
    ph_sub = SoilHealthScoringEngine.compute_metric_subscore("pH", 7.0, "dimensionless")
    assert ph_sub["score"] == 100

    # Lead Pb target <= 50.0 mg/kg -> Score >= 90 (Pristine category)
    pb_sub = SoilHealthScoringEngine.compute_metric_subscore("Pb", 25.0, "mg/kg")
    assert pb_sub["score"] >= 90

    # Cadmium Cd target <= 1.0 mg/kg -> Score >= 90 (Pristine category)
    cd_sub = SoilHealthScoringEngine.compute_metric_subscore("Cd", 0.5, "mg/kg")
    assert cd_sub["score"] >= 90

def test_soil_aggregate_score_provenance():
    measurements = [
        {"metric": "SOC", "value": 2.4, "unit": "%", "data_quality": "VALID", "source": "SoilGrids_v2.0", "data_type": "MODELED_ESTIMATE"},
        {"metric": "pH", "value": 6.8, "unit": "dimensionless", "data_quality": "VALID", "source": "SoilGrids_v2.0", "data_type": "MODELED_ESTIMATE"},
        {"metric": "Pb", "value": 22.0, "unit": "mg/kg", "data_quality": "VALID", "source": "USGS_WQP_Soil", "data_type": "MEASURED"},
        {"metric": "Cd", "value": 0.4, "unit": "mg/kg", "data_quality": "VALID", "source": "USGS_WQP_Soil", "data_type": "MEASURED"}
    ]

    res = SoilHealthScoringEngine.compute_aggregate_soil_score(measurements)

    assert res["overall_soil_score"] >= 85
    assert "MEASURED" in res["data_type"]
    assert "MODELED_ESTIMATE" in res["data_type"]
    assert res["data_coverage_percent"] > 0
