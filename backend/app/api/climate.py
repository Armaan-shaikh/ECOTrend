from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.data_sources.climate.open_meteo import OpenMeteoClimateCollector
from app.data_sources.climate.nasa_power import NASAPowerCollector
from app.engine.cleaning_climate import ClimateDataCleaningPipeline
from app.engine.health_score_climate import ClimateHealthScoringEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.core.standards_climate import CLIMATE_STANDARDS, CLIMATE_SCORE_CATEGORIES, CLIMATE_METHODOLOGY_METADATA
from app.schemas.climate import ClimateQualityScoreResponse, ClimateStandardsResponse

router = APIRouter(prefix="/climate", tags=["Climate Intelligence"])

CLIMATE_STATIONS = [
    {
        "id": "loc_us_ny_nyc_climate",
        "name": "New York Central Park Weather Station",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7812,
        "longitude": -73.9665,
        "type": "METEOROLOGICAL"
    },
    {
        "id": "loc_in_delhi_climate",
        "name": "Delhi Safdarjung Weather Observatory",
        "level": "STATION",
        "parent_id": "loc_in_delhi_newdelhi",
        "country_code": "IN",
        "latitude": 28.5840,
        "longitude": 77.2070,
        "type": "METEOROLOGICAL"
    }
]

@router.get("/stations")
async def get_climate_stations(db: Session = Depends(get_db)):
    """
    Get active climate monitoring stations.
    """
    db_locs = db.query(Location).filter(Location.id.like("%climate%")).all()
    if db_locs:
        return [l.to_dict() for l in db_locs]
    return CLIMATE_STATIONS

@router.get("/metrics")
async def get_supported_climate_metrics():
    """
    Get list of supported climate metrics.
    """
    return [
        {"metric": k, "title": v["title"], "unit": v["unit"], "weight": v["weight"]}
        for k, v in CLIMATE_STANDARDS.items()
    ]

@router.get("/current")
async def get_current_climate_measurements(
    location_id: str = Query("loc_us_ny_nyc_climate", description="Climate station ID"),
    db: Session = Depends(get_db)
):
    """
    Get latest validated climate measurements for a location.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=14)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "climate",
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        om_collector = OpenMeteoClimateCollector()
        nasa_collector = NASAPowerCollector()

        # Fetch live data from Open-Meteo & NASA POWER
        start_str = (end_date - timedelta(days=7)).strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")

        om_data = await om_collector.fetch_climate_data(40.7812, -73.9665, start_date=start_str, end_date=end_str, location_id=location_id)
        cleaned_m, _ = ClimateDataCleaningPipeline.batch_clean_series(om_data)
        measurements = cleaned_m

    # Latest per metric
    latest: dict = {}
    for m in measurements:
        metric = m.get("metric")
        if metric not in latest:
            latest[metric] = m

    return list(latest.values())

@router.get("/historical")
async def get_historical_climate_analytics(
    location_id: str = Query("loc_us_ny_nyc_climate", description="Climate station ID"),
    metric: str = Query("T2M", description="Climate metric"),
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """
    Get historical statistical analytics for a climate metric.
    """
    measurements = await get_current_climate_measurements(location_id=location_id, db=db)
    filtered = [m for m in measurements if m.get("metric") == metric]

    found_loc = [l for l in CLIMATE_STATIONS if l["id"] == location_id]
    loc_name = found_loc[0]["name"] if found_loc else location_id
    unit = filtered[0].get("unit", "°C") if filtered else "°C"

    return HistoricalAnalyticsEngine.compute_analytics(
        measurements=filtered,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

@router.get("/score", response_model=ClimateQualityScoreResponse)
async def get_climate_quality_score(
    location_id: str = Query("loc_us_ny_nyc_climate", description="Climate station ID"),
    db: Session = Depends(get_db)
):
    """
    Get 0–100 Climate Index, sub-score breakdown, data coverage %, and data provenance.
    """
    measurements = await get_current_climate_measurements(location_id=location_id, db=db)
    return ClimateHealthScoringEngine.compute_aggregate_climate_score(measurements)

@router.get("/standards", response_model=ClimateStandardsResponse)
async def get_climate_standards_info():
    """
    Get EcoTrend Climate Index Methodology metadata and WMO/NOAA reference thresholds.
    """
    return {
        "methodology": CLIMATE_METHODOLOGY_METADATA,
        "standards": CLIMATE_STANDARDS,
        "score_categories": CLIMATE_SCORE_CATEGORIES
    }
