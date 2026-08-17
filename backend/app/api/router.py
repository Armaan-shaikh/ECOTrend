from fastapi import APIRouter
from app.api.locations import router as locations_router
from app.api.measurements import router as measurements_router
from app.api.analytics import router as analytics_router
from app.api.ingestion import router as ingestion_router
from app.api.forecast import router as forecast_router
from app.api.health_score import router as health_score_router
from app.api.explanations import router as explanations_router
from app.api.water import router as water_router
from app.api.soil import router as soil_router
from app.api.climate import router as climate_router
from app.api.emissions import router as emissions_router
from app.api.noise import router as noise_router
from app.api.multi_domain import router as multi_domain_router
from app.api.compliance import router as compliance_router
from app.api.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(locations_router)
api_router.include_router(measurements_router)
api_router.include_router(analytics_router)
api_router.include_router(ingestion_router)
api_router.include_router(forecast_router)
api_router.include_router(health_score_router)
api_router.include_router(explanations_router)
api_router.include_router(water_router)
api_router.include_router(soil_router)
api_router.include_router(climate_router)
api_router.include_router(emissions_router)
api_router.include_router(noise_router)
api_router.include_router(multi_domain_router)
api_router.include_router(compliance_router)
