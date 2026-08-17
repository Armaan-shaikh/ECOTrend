import pytest
import pandas as pd
from app.engine.scenarios_water import WaterScenarioForecastEngine
from app.engine.health_score_water import WaterHealthScoringEngine

def test_water_metric_direction_scenarios():
    # Generate daily test series for Dissolved Oxygen (DO)
    dates = pd.date_range("2026-01-01", periods=60, freq="D")
    vals = [7.5 + (i % 5) * 0.1 for i in range(60)]
    series = pd.Series(vals, index=dates)

    # 1. Test DO (Higher is Better)
    do_res = WaterScenarioForecastEngine.generate_water_projections(series, "loc_test", "DO", "mg/L", "1_YEAR")
    do_last = do_res["projections"][-1]
    assert do_last["improvement_value"] >= do_last["baseline_value"]
    assert do_last["baseline_value"] >= do_last["worsening_value"]

    # 2. Test BOD (Lower is Better)
    bod_vals = [3.0 + (i % 3) * 0.2 for i in range(60)]
    bod_series = pd.Series(bod_vals, index=dates)
    bod_res = WaterScenarioForecastEngine.generate_water_projections(bod_series, "loc_test", "BOD", "mg/L", "1_YEAR")
    bod_last = bod_res["projections"][-1]
    assert bod_last["improvement_value"] <= bod_last["baseline_value"]
    assert bod_last["baseline_value"] <= bod_last["worsening_value"]

    # 3. Test pH (Target Range 6.5-8.5, neutral 7.2)
    ph_vals = [8.2 + (i % 2) * 0.1 for i in range(60)]
    ph_series = pd.Series(ph_vals, index=dates)
    ph_res = WaterScenarioForecastEngine.generate_water_projections(ph_series, "loc_test", "pH", "dimensionless", "1_YEAR")
    ph_last = ph_res["projections"][-1]
    # Improvement should converge closer to neutral 7.2 than baseline
    assert abs(ph_last["improvement_value"] - 7.2) < abs(ph_last["baseline_value"] - 7.2)

def test_water_forecast_score_conversion():
    forecast_mock = {
        "metric": "DO",
        "unit": "mg/L",
        "projections": [
            {
                "date": "2026-09-01",
                "timestamp": "2026-09-01T00:00:00Z",
                "baseline_value": 7.5,
                "improvement_value": 8.5, # Higher DO -> Higher Water Score
                "worsening_value": 4.5,   # Lower DO -> Lower Water Score
                "ci_95_lower": 3.5,
                "ci_95_upper": 9.5
            }
        ]
    }

    score_projections = WaterHealthScoringEngine.convert_forecast_to_water_score(forecast_mock)
    p = score_projections[0]

    assert p["improvement_water_score"] >= p["baseline_water_score"]
    assert p["baseline_water_score"] >= p["worsening_water_score"]
