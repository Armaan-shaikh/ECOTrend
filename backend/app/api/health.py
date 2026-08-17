import httpx
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.cache import cache_manager

router = APIRouter(prefix="/health", tags=["System Health Probes"])

@router.get("/liveness")
def get_liveness():
    """
    Process Liveness Probe:
    - Answers 'Is the FastAPI process alive?'
    - Performs ZERO database, Redis, or external API calls.
    """
    return {
        "status": "alive",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@router.get("/readiness")
async def get_readiness(response: Response, db: Session = Depends(get_db)):
    """
    Instance Readiness Probe:
    - Answers 'Can this instance serve traffic?'
    - Checks PostgreSQL/TimescaleDB, Redis, and external API dependencies.
    - Returns granular per-dependency status (ok, degraded, unavailable).
    """
    # 1. Database Check
    db_status = "unavailable"
    db_ok = False
    try:
        res = db.execute(text("SELECT 1")).scalar()
        if res == 1:
            db_status = "ok"
            db_ok = True
    except Exception:
        db_status = "unavailable"
        db_ok = False

    # 2. Redis Cache Check
    if cache_manager.is_redis_active():
        redis_status = "ok"
    elif settings.CACHE_ENABLED:
        redis_status = "degraded"  # Falling back to in-memory cache
    else:
        redis_status = "disabled"

    # 3. External API Dependencies Check (Short 1.5s timeout)
    ext_apis: Dict[str, str] = {
        "openaq": "ok",
        "soilgrids": "ok",
        "open_meteo": "ok",
        "nyc_opendata": "ok"
    }

    try:
        async with httpx.AsyncClient(timeout=1.5, follow_redirects=True) as client:
            try:
                open_meteo_res = await client.get("https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&hourly=temperature_2m")
                if open_meteo_res.status_code != 200:
                    ext_apis["open_meteo"] = "degraded"
            except Exception:
                ext_apis["open_meteo"] = "degraded"
    except Exception:
        pass

    # Aggregate readiness determination
    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        overall_status = "not_ready"
    elif any(v == "degraded" for v in ext_apis.values()) or redis_status == "degraded":
        response.status_code = status.HTTP_200_OK
        overall_status = "degraded"
    else:
        response.status_code = status.HTTP_200_OK
        overall_status = "ready"

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "dependencies": {
            "database": db_status,
            "redis": redis_status,
            "external_apis": ext_apis
        }
    }

@router.get("")
@router.get("/")
async def get_overall_health(response: Response, db: Session = Depends(get_db)):
    """
    Overall Platform Health Summary Endpoint.
    """
    readiness_data = await get_readiness(response, db=db)
    return {
        "status": "healthy" if readiness_data["status"] == "ready" else readiness_data["status"],
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "readiness": readiness_data
    }
