from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.schemas.explanation import LocationExplanationResponse
from app.engine.explanations.insight_engine import EnvironmentalInsightEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.engine.forecasting_prep import ForecastingDataPrep
from app.engine.scenarios import ScenarioForecastEngine
from app.engine.health_score import EHSScoringEngine
from app.data_sources.air.mock_seed import SEED_LOCATIONS, MockAirSeedCollector
from app.engine.cleaning import DataCleaningPipeline

router = APIRouter(prefix="/explanations", tags=["Deterministic Explanations & Insights"])

@router.get("/location", response_model=LocationExplanationResponse)
async def get_location_explanation(
    location_id: str = Query(..., description="Location ID (e.g. loc_us_ny_nyc_manhattan)"),
    metric: str = Query("PM2.5", description="Target metric: PM2.5, PM10, NO2, SO2, CO, O3"),
    days: int = Query(90, ge=7, le=365, description="Historical analysis window in days"),
    horizon: str = Query("1_YEAR", description="Forecast horizon: 6_MONTHS, 1_YEAR, 3_YEARS, 5_YEARS"),
    db: Session = Depends(get_db)
):
    """
    Generate a 100% deterministic, plain-language environmental report for a location (No LLM).
    Synthesizes Phase 1 historical trends, Phase 2A forecast projections, Phase 3A EHS score,
    and data quality logs into structured human-readable insights.
    """
    # 1. Location Details
    loc = db.query(Location).filter(Location.id == location_id).first()
    if loc:
        loc_name = loc.name
    else:
        found = [item for item in SEED_LOCATIONS if item["id"] == location_id]
        loc_name = found[0]["name"] if found else location_id

    # 2. Fetch Measurements
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

    unit = measurements[0].get("unit", "µg/m³") if measurements else "µg/m³"

    # 3. Compute Phase 1 Historical Analytics
    metric_measurements = [m for m in measurements if m.get("metric") == metric]
    analytics = HistoricalAnalyticsEngine.compute_analytics(
        measurements=metric_measurements or measurements,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

    # 4. Compute Phase 2A Scenario Forecast
    daily_series, _ = ForecastingDataPrep.prepare_daily_series(metric_measurements or measurements, target_metric=metric)
    forecast = ScenarioForecastEngine.generate_projections(
        daily_series=daily_series,
        location_id=location_id,
        metric=metric,
        unit=unit,
        horizon_key=horizon
    )

    # 5. Compute Phase 3A Aggregate EHS
    ehs_data = EHSScoringEngine.compute_aggregate_ehs(measurements)

    # 6. Generate Deterministic Location Report
    report = EnvironmentalInsightEngine.generate_location_report(
        location_name=loc_name,
        analytics=analytics,
        forecast=forecast,
        ehs_data=ehs_data
    )

    return report
