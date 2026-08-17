from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.data_sources.water.mock_water_seed import WATER_SEED_LOCATIONS, MockWaterSeedCollector
from app.data_sources.water.usgs_wqp import USGSWaterQualityCollector
from app.engine.cleaning_water import WaterDataCleaningPipeline
from app.engine.health_score_water import WaterHealthScoringEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.core.standards_water import WATER_QUALITY_STANDARDS, WATER_SCORE_CATEGORIES, WATER_METHODOLOGY_METADATA
from app.schemas.water import WaterQualityScoreResponse, WaterStandardsResponse

router = APIRouter(prefix="/water", tags=["Water Quality Intelligence"])

@router.get("/stations")
async def get_water_stations(db: Session = Depends(get_db)):
    """
    Get all active water quality monitoring stations.
    """
    db_locs = db.query(Location).filter(Location.id.like("%water%")).all()
    if db_locs:
        return [l.to_dict() for l in db_locs]
    return WATER_SEED_LOCATIONS

@router.get("/metrics")
async def get_supported_water_metrics():
    """
    Get list of supported water quality metrics and standard units.
    """
    return [
        {"metric": k, "title": v["title"], "unit": v["unit"], "weight": v["weight"]}
        for k, v in WATER_QUALITY_STANDARDS.items()
    ]

@router.get("/current")
async def get_current_water_measurements(
    location_id: str = Query("loc_us_ny_hudson", description="Water monitoring station ID"),
    db: Session = Depends(get_db)
):
    """
    Get latest validated water quality measurements for a location.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=7)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "water",
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        collector = MockWaterSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7614,
            longitude=-74.0012,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        cleaned_m, _ = WaterDataCleaningPipeline.batch_clean_series(raw_m)
        measurements = cleaned_m

    # Get latest per metric
    latest: dict = {}
    for m in measurements:
        metric = m.get("metric")
        if metric not in latest:
            latest[metric] = m

    return list(latest.values())

@router.get("/historical")
async def get_historical_water_analytics(
    location_id: str = Query("loc_us_ny_hudson", description="Water station ID"),
    metric: str = Query("DO", description="Water metric (DO, BOD, COD, TDS, pH, Turbidity, Temp, Conductivity)"),
    days: int = Query(90, ge=7, le=365, description="Historical window in days"),
    db: Session = Depends(get_db)
):
    """
    Get historical statistical analytics for a water metric.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "water",
        EnvironmentalMeasurement.metric == metric,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.asc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        collector = MockWaterSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7614,
            longitude=-74.0012,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        cleaned_m, _ = WaterDataCleaningPipeline.batch_clean_series(raw_m)
        measurements = [m for m in cleaned_m if m.get("metric") == metric]

    found_loc = [l for l in WATER_SEED_LOCATIONS if l["id"] == location_id]
    loc_name = found_loc[0]["name"] if found_loc else location_id
    unit = measurements[0].get("unit", "mg/L") if measurements else "mg/L"

    summary = HistoricalAnalyticsEngine.compute_analytics(
        measurements=measurements,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

    return summary

@router.get("/score", response_model=WaterQualityScoreResponse)
async def get_water_quality_score(
    location_id: str = Query("loc_us_ny_hudson", description="Water station ID"),
    db: Session = Depends(get_db)
):
    """
    Get 0–100 Water Quality Health Score, sub-score breakdown, and data coverage % (EcoTrend Water Methodology v1.0).
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "water",
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        collector = MockWaterSeedCollector()
        raw_m = await collector.fetch_measurements(
            latitude=40.7614,
            longitude=-74.0012,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        cleaned_m, _ = WaterDataCleaningPipeline.batch_clean_series(raw_m)
        measurements = cleaned_m

    return WaterHealthScoringEngine.compute_aggregate_water_score(measurements)

@router.get("/standards", response_model=WaterStandardsResponse)
async def get_water_standards_info():
    """
    Get EcoTrend Water Methodology v1.0 reference standards, WHO/EPA limits, and weight rationale.
    """
    return {
        "methodology": WATER_METHODOLOGY_METADATA,
        "standards": WATER_QUALITY_STANDARDS,
        "score_categories": WATER_SCORE_CATEGORIES
    }
