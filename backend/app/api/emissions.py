from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.data_sources.climate.world_bank_emissions import WorldBankEmissionsCollector
from app.engine.cleaning_climate import ClimateDataCleaningPipeline
from app.engine.health_score_emissions import EmissionsHealthScoringEngine
from app.engine.analysis import HistoricalAnalyticsEngine
from app.core.standards_emissions import EMISSIONS_STANDARDS, EMISSIONS_SCORE_CATEGORIES, EMISSIONS_METHODOLOGY_METADATA
from app.schemas.emissions import EmissionsQualityScoreResponse, EmissionsStandardsResponse

router = APIRouter(prefix="/emissions", tags=["Emissions Intelligence"])

@router.get("/metrics")
async def get_supported_emissions_metrics():
    """
    Get list of supported emissions metrics.
    """
    return [
        {"metric": k, "title": v["title"], "unit": v["unit"], "weight": v["weight"]}
        for k, v in EMISSIONS_STANDARDS.items()
    ]

@router.get("/current")
async def get_current_emissions_measurements(
    location_id: str = Query("loc_us", description="Location or country ID"),
    db: Session = Depends(get_db)
):
    """
    Get latest validated national emissions measurements.
    """
    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.domain == "emissions"
    ).order_by(EnvironmentalMeasurement.timestamp.desc()).all()

    measurements = [m.to_dict() for m in query_results]

    if not measurements:
        wb_collector = WorldBankEmissionsCollector()
        wb_data = await wb_collector.fetch_national_emissions("USA", location_id=location_id)
        cleaned_m, _ = ClimateDataCleaningPipeline.batch_clean_series(wb_data)
        measurements = cleaned_m

    latest: dict = {}
    for m in measurements:
        metric = m.get("metric")
        if metric not in latest:
            latest[metric] = m

    return list(latest.values())

@router.get("/score", response_model=EmissionsQualityScoreResponse)
async def get_emissions_quality_score(
    location_id: str = Query("loc_us", description="Location or country ID"),
    db: Session = Depends(get_db)
):
    """
    Get 0–100 Emissions Sustainability Index, sub-score breakdown, data coverage %, and data provenance.
    """
    measurements = await get_current_emissions_measurements(location_id=location_id, db=db)
    return EmissionsHealthScoringEngine.compute_aggregate_emissions_score(measurements)

@router.get("/standards", response_model=EmissionsStandardsResponse)
async def get_emissions_standards_info():
    """
    Get EcoTrend Emissions Sustainability Index methodology metadata and IPCC Paris 1.5°C targets.
    """
    return {
        "methodology": EMISSIONS_METHODOLOGY_METADATA,
        "standards": EMISSIONS_STANDARDS,
        "score_categories": EMISSIONS_SCORE_CATEGORIES
    }
