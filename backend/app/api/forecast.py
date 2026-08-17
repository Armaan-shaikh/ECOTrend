from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.schemas.forecast import ForecastProjectionResponse
from app.engine.forecasting_prep import ForecastingDataPrep
from app.engine.scenarios import ScenarioForecastEngine
from app.data_sources.air.mock_seed import MockAirSeedCollector
from app.engine.cleaning import DataCleaningPipeline

router = APIRouter(prefix="/forecast", tags=["Forecast & Scenario Engine"])

@router.get("/projections", response_model=ForecastProjectionResponse)
async def get_forecast_projections(
    location_id: str = Query(..., description="Location ID (e.g. loc_us_ny_nyc_manhattan)"),
    metric: str = Query("PM2.5", description="PM2.5, PM10, NO2, SO2, CO, O3, AQI"),
    horizon: str = Query("1_YEAR", description="Selectable horizons: 6_MONTHS, 1_YEAR, 3_YEARS, 5_YEARS"),
    db: Session = Depends(get_db)
):
    """
    Generate multi-horizon scenario forecasts (6 Months, 1 Year, 3 Years, 5 Years).
    Evaluates candidate models via walk-forward backtesting, selects champion model,
    and returns 🔵 Current Baseline, 🟢 Policy Improvement, 🔴 Urban Degradation scenarios,
    along with 80% and 95% confidence intervals.
    """
    # 1. Fetch historical measurements from hypertable
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=180) # Use 180 days of historical training window

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.metric == metric,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.asc()).all()

    measurements = [m.to_dict() for m in query_results]

    # Fallback to inline seed generation if hypertable has no points yet
    if not measurements:
        collector = MockAirSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7831,
            longitude=-73.9712,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        metric_raw = [m for m in raw_m if m["metric"] == metric]
        cleaned_m, _ = DataCleaningPipeline.batch_clean_series(metric_raw)
        measurements = cleaned_m

    unit = measurements[0].get("unit", "µg/m³") if measurements else "µg/m³"

    # 2. Resample time-series
    daily_series, meta = ForecastingDataPrep.prepare_daily_series(measurements, target_metric=metric)

    # 3. Generate Scenario Projections & Backtesting
    projection_data = ScenarioForecastEngine.generate_projections(
        daily_series=daily_series,
        location_id=location_id,
        metric=metric,
        unit=unit,
        horizon_key=horizon
    )

    return projection_data
