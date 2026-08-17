from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.data_sources.soil.soilgrids import SoilGridsCollector
from app.data_sources.soil.usgs_wqp_soil import USGSSoilWQPCollector
from app.engine.cleaning_soil import SoilDataCleaningPipeline
from app.engine.health_score_soil import SoilHealthScoringEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.core.standards_soil import (
    SOIL_QUALITY_STANDARDS,
    SOIL_SCORE_CATEGORIES,
    SOIL_METHODOLOGY_METADATA,
    REFERENCE_TYPES
)
from app.schemas.soil import SoilQualityScoreResponse, SoilStandardsResponse

router = APIRouter(prefix="/soil", tags=["Soil Quality Intelligence"])

SOIL_SAMPLING_STATIONS = [
    {
        "id": "loc_us_ny_hudson_soil",
        "name": "Hudson Valley Soil Monitoring Station",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 41.1172,
        "longitude": -73.7990,
        "type": "AGRICULTURAL_SOIL"
    },
    {
        "id": "loc_us_dc_potomac_soil",
        "name": "Potomac Basin Core Sampling Site",
        "level": "STATION",
        "parent_id": "loc_us",
        "country_code": "US",
        "latitude": 38.9072,
        "longitude": -77.0369,
        "type": "SEDIMENT_SOIL"
    },
    {
        "id": "loc_in_delhi_yamuna_soil",
        "name": "Yamuna Floodplain Soil Monitoring Station",
        "level": "STATION",
        "parent_id": "loc_in_delhi_newdelhi",
        "country_code": "IN",
        "latitude": 28.6310,
        "longitude": 77.2480,
        "type": "URBAN_INDUSTRIAL_SOIL"
    }
]

@router.get("/stations")
async def get_soil_stations(db: Session = Depends(get_db)):
    """
    Get all active soil sampling monitoring stations.
    """
    db_locs = db.query(Location).filter(Location.id.like("%soil%")).all()
    if db_locs:
        return [l.to_dict() for l in db_locs]
    return SOIL_SAMPLING_STATIONS

@router.get("/metrics")
async def get_supported_soil_metrics():
    """
    Get list of supported soil quality metrics, standard units, and reference types.
    """
    return [
        {
            "metric": k,
            "title": v["title"],
            "unit": v["unit"],
            "weight": v["weight"],
            "reference_type": v["reference_type"],
            "standard_reference": v["standard_reference"]
        }
        for k, v in SOIL_QUALITY_STANDARDS.items()
    ]

@router.get("/current")
async def get_current_soil_measurements(
    location_id: str = Query("loc_us_ny_hudson_soil", description="Soil station ID"),
    db: Session = Depends(get_db)
):
    """
    Get latest validated soil quality measurements for a location.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=90)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "soil",
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        sg_collector = SoilGridsCollector()
        wqp_collector = USGSSoilWQPCollector()

        # Query live SoilGrids & USGS WQP APIs concurrently
        sg_data = await sg_collector.fetch_soil_properties(41.1172, -73.7990, location_id=location_id)
        wqp_data = await wqp_collector.fetch_measured_soil_assays(41.1172, -73.7990, location_id=location_id)

        raw_m = sg_data + wqp_data
        cleaned_m, _ = SoilDataCleaningPipeline.batch_clean_series(raw_m)
        measurements = cleaned_m

    # Get latest per metric
    latest: dict = {}
    for m in measurements:
        metric = m.get("metric")
        if metric not in latest:
            latest[metric] = m

    return list(latest.values())

@router.get("/historical")
async def get_historical_soil_analytics(
    location_id: str = Query("loc_us_ny_hudson_soil", description="Soil station ID"),
    metric: str = Query("SOC", description="Soil metric"),
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """
    Get historical/multi-sample analytics for a soil metric.
    """
    measurements = await get_current_soil_measurements(location_id=location_id, db=db)
    filtered = [m for m in measurements if m.get("metric") == metric]

    found_loc = [l for l in SOIL_SAMPLING_STATIONS if l["id"] == location_id]
    loc_name = found_loc[0]["name"] if found_loc else location_id
    unit = filtered[0].get("unit", "%") if filtered else "%"

    return HistoricalAnalyticsEngine.compute_analytics(
        measurements=filtered,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

@router.get("/score", response_model=SoilQualityScoreResponse)
async def get_soil_quality_score(
    location_id: str = Query("loc_us_ny_hudson_soil", description="Soil station ID"),
    db: Session = Depends(get_db)
):
    """
    Get 0–100 Soil Quality Score, sub-score breakdown, data coverage %, and data provenance (MEASURED vs MODELED_ESTIMATE).
    """
    measurements = await get_current_soil_measurements(location_id=location_id, db=db)
    return SoilHealthScoringEngine.compute_aggregate_soil_score(measurements)

@router.get("/standards", response_model=SoilStandardsResponse)
async def get_soil_standards_info():
    """
    Get EcoTrend Soil Methodology v1.0 reference standards, reference types, and EPA/EU/FAO thresholds.
    """
    return {
        "methodology": SOIL_METHODOLOGY_METADATA,
        "reference_types": REFERENCE_TYPES,
        "standards": SOIL_QUALITY_STANDARDS,
        "score_categories": SOIL_SCORE_CATEGORIES
    }

@router.get("/spatial")
async def get_soil_spatial_points():
    """
    Get GeoJSON feature collection of active soil sampling points for spatial map display.
    """
    features = []
    for st in SOIL_SAMPLING_STATIONS:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [st["longitude"], st["latitude"]]
            },
            "properties": {
                "id": st["id"],
                "name": st["name"],
                "type": st["type"],
                "country_code": st["country_code"]
            }
        })
    return {"type": "FeatureCollection", "features": features}
