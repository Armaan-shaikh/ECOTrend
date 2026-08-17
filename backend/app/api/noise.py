from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.data_sources.noise.nyc_noise_incidents import NYCNoiseIncidentsCollector
from app.engine.cleaning_noise import NoiseDataCleaningPipeline
from app.engine.health_score_noise import NoiseHealthScoringEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.core.standards_noise import (
    NOISE_STANDARDS,
    CONTEXTUAL_ACOUSTIC_DECIBEL_GUIDELINES,
    NOISE_SCORE_CATEGORIES,
    NOISE_METHODOLOGY_METADATA
)
from app.schemas.noise import NoiseQualityScoreResponse, NoiseStandardsResponse

router = APIRouter(prefix="/noise", tags=["Acoustic Disturbance Intelligence"])

NOISE_STATIONS = [
    {
        "id": "loc_us_ny_nyc_manhattan_noise",
        "name": "Manhattan Ambient Noise Monitoring Site",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7831,
        "longitude": -73.9712,
        "type": "URBAN_ACOUSTIC"
    },
    {
        "id": "loc_us_ny_nyc_queens_noise",
        "name": "Queens Industrial Acoustic Site",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7282,
        "longitude": -73.7949,
        "type": "INDUSTRIAL_ACOUSTIC"
    }
]

@router.get("/stations")
async def get_noise_stations(db: Session = Depends(get_db)):
    """
    Get active acoustic noise monitoring stations.
    """
    db_locs = db.query(Location).filter(Location.id.like("%noise%")).all()
    if db_locs:
        return [l.to_dict() for l in db_locs]
    return NOISE_STATIONS

@router.get("/metrics")
async def get_supported_noise_metrics():
    """
    Get list of supported noise metrics.
    """
    return [
        {"metric": k, "title": v["title"], "unit": v["unit"], "weight": v["weight"]}
        for k, v in NOISE_STANDARDS.items()
    ]

@router.get("/current")
async def get_current_noise_measurements(
    location_id: str = Query("loc_us_ny_nyc_manhattan_noise", description="Noise monitoring station ID"),
    db: Session = Depends(get_db)
):
    """
    Get latest validated noise incident measurements.
    """
    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "noise"
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        nyc_collector = NYCNoiseIncidentsCollector()
        found_loc = [l for l in NOISE_STATIONS if l["id"] == location_id]
        lat = found_loc[0]["latitude"] if found_loc else 40.7831
        lon = found_loc[0]["longitude"] if found_loc else -73.9712

        live_m = await nyc_collector.fetch_noise_incidents(latitude=lat, longitude=lon, location_id=location_id)
        cleaned_m, _ = NoiseDataCleaningPipeline.batch_clean_series(live_m)
        measurements = cleaned_m

    latest: dict = {}
    for m in measurements:
        metric = m.get("metric")
        if metric not in latest:
            latest[metric] = m

    return list(latest.values())

@router.get("/historical")
async def get_historical_noise_analytics(
    location_id: str = Query("loc_us_ny_nyc_manhattan_noise", description="Noise monitoring station ID"),
    metric: str = Query("NOISE_INCIDENTS", description="Noise metric"),
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """
    Get historical statistical analytics for noise incident metric.
    """
    measurements = await get_current_noise_measurements(location_id=location_id, db=db)
    filtered = [m for m in measurements if m.get("metric") == metric]

    found_loc = [l for l in NOISE_STATIONS if l["id"] == location_id]
    loc_name = found_loc[0]["name"] if found_loc else location_id
    unit = filtered[0].get("unit", "incidents/day") if filtered else "incidents/day"

    return HistoricalAnalyticsEngine.compute_analytics(
        measurements=filtered,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

@router.get("/score", response_model=NoiseQualityScoreResponse)
async def get_noise_quality_score(
    location_id: str = Query("loc_us_ny_nyc_manhattan_noise", description="Noise monitoring station ID"),
    db: Session = Depends(get_db)
):
    """
    Get 0–100 Acoustic Disturbance Index, sub-score breakdown, data coverage %, and data provenance.
    """
    measurements = await get_current_noise_measurements(location_id=location_id, db=db)
    return NoiseHealthScoringEngine.compute_aggregate_noise_score(measurements)

@router.get("/standards", response_model=NoiseStandardsResponse)
async def get_noise_standards_info():
    """
    Get EcoTrend Acoustic Disturbance Index methodology metadata, WHO/EPA contextual standards, and categories.
    """
    return {
        "methodology": NOISE_METHODOLOGY_METADATA,
        "standards": NOISE_STANDARDS,
        "contextual_decibel_guidelines": CONTEXTUAL_ACOUSTIC_DECIBEL_GUIDELINES,
        "score_categories": NOISE_SCORE_CATEGORIES
    }
