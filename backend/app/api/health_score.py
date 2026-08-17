from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.measurement import EnvironmentalMeasurement
from app.schemas.health_score import (
    AggregateEHSResponse, 
    HistoricalEHSPoint, 
    ForecastEHSResponse
)
from app.engine.health_score import EHSScoringEngine
from app.engine.forecasting_prep import ForecastingDataPrep
from app.engine.scenarios import ScenarioForecastEngine
from app.core.standards import AIR_QUALITY_STANDARDS, SCORE_CATEGORIES, METHODOLOGY_METADATA
from app.data_sources.air.mock_seed import MockAirSeedCollector
from app.engine.cleaning import DataCleaningPipeline

router = APIRouter(prefix="/health-score", tags=["Environmental Health Score (EHS)"])

@router.get("/current", response_model=AggregateEHSResponse)
async def get_current_health_score(
    location_id: str = Query(..., description="Location ID (e.g. loc_us_ny_nyc_manhattan)"),
    db: Session = Depends(get_db)
):
    """
    Compute current Environmental Health Score (EHS 0–100) and metric sub-scores.
    Evaluates PM2.5, PM10, NO2, SO2, CO, O3, AQI against WHO 2021 / EPA limits,
    reports data coverage %, and generates a deterministic explanation.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=7)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        collector = MockAirSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7831,
            longitude=-73.9712,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        cleaned_m, _ = DataCleaningPipeline.batch_clean_series(raw_m)
        measurements = cleaned_m

    return EHSScoringEngine.compute_aggregate_ehs(measurements)

@router.get("/historical", response_model=List[HistoricalEHSPoint])
async def get_historical_health_score(
    location_id: str = Query(..., description="Location ID"),
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """
    Compute daily historical EHS time series over specified date range.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.asc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        collector = MockAirSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7831,
            longitude=-73.9712,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        cleaned_m, _ = DataCleaningPipeline.batch_clean_series(raw_m)
        measurements = cleaned_m

    return EHSScoringEngine.compute_historical_ehs_series(measurements)

@router.get("/forecast", response_model=ForecastEHSResponse)
async def get_forecast_health_score(
    location_id: str = Query(..., description="Location ID"),
    metric: str = Query("PM2.5", description="Target metric: PM2.5, PM10, NO2, SO2, CO, O3"),
    horizon: str = Query("1_YEAR", description="Selectable horizons: 6_MONTHS, 1_YEAR, 3_YEARS, 5_YEARS"),
    db: Session = Depends(get_db)
):
    """
    Converts Phase 2A scenario forecasts into projected EHS scores (Baseline, Improvement, Worsening) with CI bounds.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=180)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.metric == metric,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.asc()).all()

    measurements = [m.to_dict() for m in query_results]

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

    daily_series, _ = ForecastingDataPrep.prepare_daily_series(measurements, target_metric=metric)
    forecast_data = ScenarioForecastEngine.generate_projections(
        daily_series=daily_series,
        location_id=location_id,
        metric=metric,
        unit=unit,
        horizon_key=horizon
    )

    ehs_projections = EHSScoringEngine.convert_forecast_to_ehs(forecast_data)

    return {
        "location_id": location_id,
        "metric": metric,
        "horizon": horizon.upper(),
        "projections": ehs_projections
    }

@router.get("/standards")
def get_scoring_standards_info():
    """
    Retrieve EcoTrend Air Health Scoring Methodology v1.0 documentation,
    reference guidelines (WHO 2021 / US EPA), configurable weights, and epidemiological rationale.
    """
    return {
        "methodology": METHODOLOGY_METADATA,
        "standards": AIR_QUALITY_STANDARDS,
        "score_categories": SCORE_CATEGORIES
    }
