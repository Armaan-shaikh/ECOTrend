from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from app.core.database import get_db
from app.models.measurement import EnvironmentalMeasurement, DataQualityLog
from app.schemas.measurement import MeasurementResponse, DataQualityLogResponse

router = APIRouter(prefix="/measurements", tags=["Measurements"])

@router.get("", response_model=List[MeasurementResponse])
def get_measurements(
    location_id: str = Query(..., description="Location ID (e.g. loc_us_ny_nyc_manhattan)"),
    metric: str = Query("PM2.5", description="PM2.5, PM10, NO2, SO2, CO, O3, AQI"),
    days: int = Query(30, ge=1, le=365, description="Historical range in days"),
    quality: Optional[str] = Query(None, description="VALID, SUSPECT, INVALID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve historical measurements for a given location and metric.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    query = db.query(EnvironmentalMeasurement).filter(
        EnvironmentalMeasurement.location_id == location_id,
        EnvironmentalMeasurement.metric == metric,
        EnvironmentalMeasurement.timestamp >= start_date
    )

    if quality:
        query = query.filter(EnvironmentalMeasurement.data_quality == quality.upper())

    measurements = query.order_by(EnvironmentalMeasurement.timestamp.asc()).all()
    return [MeasurementResponse.model_validate(m) for m in measurements]

@router.get("/quality-logs", response_model=List[DataQualityLogResponse])
def get_quality_logs(
    location_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieve data cleaning audit logs (error code filtering, Z-score outliers).
    """
    query = db.query(DataQualityLog)
    if location_id:
        query = query.filter(DataQualityLog.location_id == location_id)
    
    logs = query.order_by(DataQualityLog.timestamp.desc()).limit(limit).all()
    return [DataQualityLogResponse.model_validate(log) for log in logs]
