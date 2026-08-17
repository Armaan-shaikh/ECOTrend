from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.cache import cache_manager, cached_endpoint
from app.engine.observability_engine import ObservabilityEngine
from app.schemas.observability import (
    ObservabilityOverviewResponse,
    SourceHealthResponse,
    IngestionJobResponse,
    OperationalAlertResponse,
    ObservabilityMetricsResponse
)

router = APIRouter(prefix="/observability", tags=["System Observability & Reliability"])

# In-Memory fallback store for operational logs during local dev / test
MOCK_SOURCES = [
    {
        "id": "src_1",
        "source": "OpenAQ",
        "domain": "air",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 142.5,
        "record_volume_24h": 1440,
        "rejection_rate_percent": 0.5,
        "stale_data_duration_hours": 0.2
    },
    {
        "id": "src_2",
        "source": "USGS_WQP",
        "domain": "water",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 210.0,
        "record_volume_24h": 720,
        "rejection_rate_percent": 1.2,
        "stale_data_duration_hours": 0.5
    },
    {
        "id": "src_3",
        "source": "SoilGrids",
        "domain": "soil",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 315.0,
        "record_volume_24h": 240,
        "rejection_rate_percent": 0.0,
        "stale_data_duration_hours": 1.1
    },
    {
        "id": "src_4",
        "source": "Open-Meteo",
        "domain": "climate",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 95.0,
        "record_volume_24h": 2880,
        "rejection_rate_percent": 0.1,
        "stale_data_duration_hours": 0.1
    },
    {
        "id": "src_5",
        "source": "WorldBank_Emissions",
        "domain": "emissions",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 180.0,
        "record_volume_24h": 120,
        "rejection_rate_percent": 0.0,
        "stale_data_duration_hours": 2.0
    },
    {
        "id": "src_6",
        "source": "NYC_OpenData_311",
        "domain": "noise",
        "status": "HEALTHY",
        "last_successful_ingestion": datetime.now(timezone.utc).isoformat(),
        "last_attempted_ingestion": datetime.now(timezone.utc).isoformat(),
        "consecutive_failures": 0,
        "latency_ms": 165.0,
        "record_volume_24h": 500,
        "rejection_rate_percent": 2.1,
        "stale_data_duration_hours": 0.4
    }
]

MOCK_JOBS = [
    {
        "id": "job_101",
        "source": "OpenAQ",
        "domain": "air",
        "location_id": "loc_us_ny_nyc_manhattan",
        "status": "SUCCESS",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "records_fetched": 100,
        "records_valid": 98,
        "records_rejected": 2,
        "error_count": 0,
        "duration_ms": 145.2,
        "provenance": "MEASURED"
    },
    {
        "id": "job_102",
        "source": "USGS_WQP",
        "domain": "water",
        "location_id": "loc_us_ny_hudson",
        "status": "SUCCESS",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "records_fetched": 50,
        "records_valid": 50,
        "records_rejected": 0,
        "error_count": 0,
        "duration_ms": 210.5,
        "provenance": "MEASURED"
    }
]

MOCK_ALERTS = [
    {
        "id": "alt_1",
        "source": "OpenAQ",
        "domain": "air",
        "severity": "WARNING",
        "condition": "ELEVATED_REJECTION_RATE",
        "observed_value": "2.0% rejection rate",
        "expected_condition": "< 1.0% rejection rate",
        "status": "OPEN",
        "detected_at": datetime.now(timezone.utc).isoformat(),
        "provenance_context": "Data Quality Pipeline audit alert"
    }
]

@router.get("/overview", response_model=ObservabilityOverviewResponse)
@cached_endpoint(prefix="ecotrend:obs_overview", ttl_seconds=30)
async def get_observability_overview(db: Session = Depends(get_db)):
    """
    Get high-level system, infrastructure, source health, and recent job logs overview.
    """
    healthy_count = sum(1 for s in MOCK_SOURCES if s["status"] == "HEALTHY")

    return {
        "system_health": "HEALTHY" if healthy_count == len(MOCK_SOURCES) else "DEGRADED",
        "infrastructure_health": {
            "database": "ok",
            "redis": "ok" if cache_manager.is_redis_active() else "degraded",
            "api_gateway": "ok"
        },
        "sources_summary": {
            "total": len(MOCK_SOURCES),
            "healthy": healthy_count,
            "degraded": sum(1 for s in MOCK_SOURCES if s["status"] == "DEGRADED"),
            "failed": sum(1 for s in MOCK_SOURCES if s["status"] == "FAILED")
        },
        "active_alerts": [OperationalAlertResponse(**a) for a in MOCK_ALERTS if a["status"] == "OPEN"],
        "recent_jobs": [IngestionJobResponse(**j) for j in MOCK_JOBS[:10]],
        "all_sources": [SourceHealthResponse(**s) for s in MOCK_SOURCES]
    }

@router.get("/sources", response_model=List[SourceHealthResponse])
@cached_endpoint(prefix="ecotrend:obs_sources", ttl_seconds=30)
async def get_source_health_matrix(db: Session = Depends(get_db)):
    """
    Get detailed health, latency, rejection rates, and freshness for all 6 domain data sources.
    """
    return [SourceHealthResponse(**s) for s in MOCK_SOURCES]

@router.get("/jobs", response_model=List[IngestionJobResponse])
@cached_endpoint(prefix="ecotrend:obs_jobs", ttl_seconds=30)
async def get_ingestion_jobs(
    limit: int = Query(50, ge=1, le=100),
    source: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get list of recent ingestion job execution records.
    """
    jobs = MOCK_JOBS
    if source:
        jobs = [j for j in jobs if j["source"].lower() == source.lower()]
    if status:
        jobs = [j for j in jobs if j["status"].lower() == status.lower()]
    return [IngestionJobResponse(**j) for j in jobs[:limit]]

@router.get("/alerts", response_model=List[OperationalAlertResponse])

async def get_operational_alerts(
    status: str = Query(None, description="OPEN, ACKNOWLEDGED, RESOLVED"),
    db: Session = Depends(get_db)
):
    """
    Get operational alerts history and active alerts.
    """
    alerts = MOCK_ALERTS
    if status:
        alerts = [a for a in alerts if a["status"].lower() == status.lower()]
    return [OperationalAlertResponse(**a) for a in alerts]

@router.post("/alerts/{alert_id}/acknowledge", response_model=OperationalAlertResponse)
async def acknowledge_alert(alert_id: str = Path(...), db: Session = Depends(get_db)):
    """
    Acknowledge an open operational alert.
    """
    for a in MOCK_ALERTS:
        if a["id"] == alert_id:
            a["status"] = "ACKNOWLEDGED"
            return OperationalAlertResponse(**a)
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

@router.post("/alerts/{alert_id}/resolve", response_model=OperationalAlertResponse)
async def resolve_alert(alert_id: str = Path(...), db: Session = Depends(get_db)):
    """
    Resolve an operational alert.
    """
    for a in MOCK_ALERTS:
        if a["id"] == alert_id:
            a["status"] = "RESOLVED"
            a["resolved_at"] = datetime.now(timezone.utc).isoformat()
            return OperationalAlertResponse(**a)
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

@router.get("/metrics", response_model=ObservabilityMetricsResponse)
@cached_endpoint(prefix="ecotrend:obs_metrics", ttl_seconds=15)
async def get_observability_metrics(db: Session = Depends(get_db)):
    """
    Get structured JSON operational metrics (system status, job success rates, source counts, active alert counts).
    """
    return {
        "system_status": "HEALTHY",
        "database_status": "ok",
        "redis_status": "ok" if cache_manager.is_redis_active() else "degraded",
        "total_ingestion_jobs_24h": len(MOCK_JOBS),
        "successful_jobs_24h": sum(1 for j in MOCK_JOBS if j["status"] == "SUCCESS"),
        "failed_jobs_24h": sum(1 for j in MOCK_JOBS if j["status"] == "FAILED"),
        "active_alerts_count": sum(1 for a in MOCK_ALERTS if a["status"] == "OPEN"),
        "healthy_sources_count": sum(1 for s in MOCK_SOURCES if s["status"] == "HEALTHY"),
        "total_sources_count": len(MOCK_SOURCES)
    }
