import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from app.engine.forecasting_prep import ForecastingDataPrep
from app.engine.backtest import WalkForwardBacktester
from app.engine.scenarios import ScenarioForecastEngine

def test_forecasting_data_prep_daily_resampling():
    measurements = []
    now = datetime.now(timezone.utc)
    for i in range(30):
        dt = now - timedelta(days=30 - i)
        measurements.append({
            "location_id": "loc_test",
            "domain": "air",
            "metric": "PM2.5",
            "value": 20.0 + (i * 0.5),
            "unit": "µg/m³",
            "timestamp": dt.isoformat(),
            "source": "Test",
            "data_quality": "VALID"
        })

    daily_df, meta = ForecastingDataPrep.prepare_daily_series(measurements, target_metric="PM2.5")
    assert len(daily_df) > 0
    assert "sin_day_of_year" in daily_df.columns
    assert "lag_1d" in daily_df.columns

def test_walk_forward_backtest_champion_selection():
    measurements = []
    now = datetime.now(timezone.utc)
    for i in range(60):
        dt = now - timedelta(days=60 - i)
        measurements.append({
            "location_id": "loc_test",
            "domain": "air",
            "metric": "PM2.5",
            "value": 25.0 + math_sin_val(i),
            "unit": "µg/m³",
            "timestamp": dt.isoformat(),
            "source": "Test",
            "data_quality": "VALID"
        })

    daily_df, _ = ForecastingDataPrep.prepare_daily_series(measurements)
    champion_name, metrics, leaderboard = WalkForwardBacktester.run_backtest(daily_df, test_window_days=10)
    
    assert champion_name is not None
    assert "rmse" in metrics
    assert "mae" in metrics
    assert len(leaderboard) > 0

def test_scenario_horizons_length():
    measurements = []
    now = datetime.now(timezone.utc)
    for i in range(40):
        dt = now - timedelta(days=40 - i)
        measurements.append({
            "location_id": "loc_test",
            "domain": "air",
            "metric": "PM2.5",
            "value": 30.0,
            "unit": "µg/m³",
            "timestamp": dt.isoformat(),
            "source": "Test",
            "data_quality": "VALID"
        })

    daily_df, _ = ForecastingDataPrep.prepare_daily_series(measurements)
    
    for h_key, h_days in [("6_MONTHS", 182), ("1_YEAR", 365), ("3_YEARS", 1095), ("5_YEARS", 1825)]:
        result = ScenarioForecastEngine.generate_projections(
            daily_series=daily_df,
            location_id="loc_test",
            metric="PM2.5",
            unit="µg/m³",
            horizon_key=h_key
        )
        assert result["horizon_days"] == h_days
        assert len(result["projections"]) == h_days

def math_sin_val(i):
    import math
    return math.sin(i / 5.0) * 3.0
