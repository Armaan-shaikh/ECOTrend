from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement
from app.schemas.analytics import HistoricalAnalyticsSummary
from app.engine.analysis import HistoricalAnalyticsEngine
from app.data_sources.air.mock_seed import SEED_LOCATIONS, MockAirSeedCollector
from app.engine.cleaning import DataCleaningPipeline

router = APIRouter(prefix="/analytics", tags=["Historical Analytics"])

@router.get("/historical", response_model=HistoricalAnalyticsSummary)
async def get_historical_analytics(
    location_id: str = Query(..., description="Location ID (e.g. loc_us_ny_nyc_manhattan)"),
    metric: str = Query("PM2.5", description="PM2.5, PM10, NO2, SO2, CO, O3, AQI"),
    days: int = Query(90, ge=7, le=365, description="Historical analysis window in days"),
    db: Session = Depends(get_db)
):
    """
    Compute deterministic historical statistical metrics for a location and metric over a time window.
    Calculates linear trend, slope, trend direction, rate of change %, rolling volatility,
    STL additive seasonality components, and historical anomaly tags.
    """
    # 1. Fetch Location Name
    loc = db.query(Location).filter(Location.id == location_id).first()
    if loc:
        loc_name = loc.name
    else:
        # Search seed list
        found = [item for item in SEED_LOCATIONS if item["id"] == location_id]
        loc_name = found[0]["name"] if found else location_id

    # 2. Query database measurements
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    query_results = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.metric == metric,
        EnvironmentalMeasurement.timestamp >= start_date
    ).order_by(EnvironmentalMeasurement.timestamp.asc()).all()

    measurements = [m.to_dict() for m in query_results]

    # If database has no stored measurements for this location/metric, run inline generator for dynamic response
    if not measurements:
        collector = MockAirSeedCollector()
        raw_measurements = await collector.fetch_measurements(
            latitude=40.7831,
            longitude=-73.9712,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )
        # Filter for requested metric
        metric_raw = [m for m in raw_measurements if m["metric"] == metric]
        cleaned_m, _ = DataCleaningPipeline.batch_clean_series(metric_raw)
        measurements = cleaned_m

    unit = measurements[0].get("unit", "µg/m³") if measurements else "µg/m³"

    # 3. Pass to Historical Analytics Engine
    analytics_result = HistoricalAnalyticsEngine.compute_analytics(
        measurements=measurements,
        location_id=location_id,
        location_name=loc_name,
        metric=metric,
        unit=unit
    )

    return analytics_result
