import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from app.core.database import get_db
from app.models.location import Location
from app.models.measurement import EnvironmentalMeasurement, DataQualityLog
from app.data_sources.air.openaq import OpenAQAirCollector
from app.data_sources.air.open_meteo import OpenMeteoAirCollector
from app.data_sources.air.mock_seed import SEED_LOCATIONS, MockAirSeedCollector
from app.engine.cleaning import DataCleaningPipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Pipeline"])

@router.post("/seed-database")
async def seed_database(db: Session = Depends(get_db)):
    """
    Seeds database with initial Location Hierarchy (Country -> State -> City -> Station)
    and populates 90 days of historical air quality measurements with isolated collectors and cleaning pipeline.
    """
    # 1. Seed Locations
    inserted_locations = 0
    for loc_data in SEED_LOCATIONS:
        existing = db.query(Location).filter(Location.id == loc_data["id"]).first()
        if not existing:
            new_loc = Location(
                id=loc_data["id"],
                name=loc_data["name"],
                level=loc_data["level"],
                parent_id=loc_data["parent_id"],
                country_code=loc_data["country_code"],
                latitude=loc_data["latitude"],
                longitude=loc_data["longitude"]
            )
            db.add(new_loc)
            inserted_locations += 1
    db.commit()

    # 2. Seed 90 Days of Measurements for all stations
    station_locations = db.query(Location).filter(Location.level == "STATION").all()
    collector = MockAirSeedCollector()

    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=90)

    total_inserted_measurements = 0
    total_logs_created = 0

    for st in station_locations:
        raw_m = await collector.fetch_measurements(
            latitude=st.latitude,
            longitude=st.longitude,
            start_date=start_date,
            end_date=end_date,
            location_id=st.id
        )

        cleaned_m, quality_logs = DataCleaningPipeline.batch_clean_series(raw_m)

        # Batch insert measurements
        db_records = []
        for item in cleaned_m:
            db_records.append(EnvironmentalMeasurement(
                id=str(uuid.uuid4()),
                location_id=item["location_id"],
                domain=item["domain"],
                metric=item["metric"],
                value=item["value"],
                unit=item["unit"],
                timestamp=item["timestamp"],
                source=item["source"],
                data_quality=item["data_quality"],
                raw_value=item.get("raw_value")
            ))

        db.bulk_save_objects(db_records)
        total_inserted_measurements += len(db_records)

        # Save audit logs
        log_records = []
        for log in quality_logs:
            log_records.append(DataQualityLog(
                id=str(uuid.uuid4()),
                location_id=log.get("location_id"),
                metric=log.get("metric"),
                timestamp=log.get("timestamp"),
                rule_triggered=log.get("rule_triggered"),
                original_value=log.get("original_value"),
                action_taken=log.get("action_taken"),
                details=log.get("details")
            ))
        db.bulk_save_objects(log_records)
        total_logs_created += len(log_records)

    db.commit()

    return {
        "status": "SUCCESS",
        "inserted_locations": inserted_locations,
        "inserted_measurements": total_inserted_measurements,
        "quality_audit_logs": total_logs_created
    }

@router.post("/trigger")
async def trigger_ingestion(
    location_id: str = Query(..., description="Location ID to run ingestion for"),
    source: str = Query("OpenMeteo", description="Source provider: OpenMeteo, OpenAQ, Synthetic"),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """
    Trigger an isolated data ingestion run for a specific monitoring station.
    Ingests data, runs cleaning/validation pipeline, and persists to TimescaleDB.
    """
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")

    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    if source.lower() == "openaq":
        collector = OpenAQAirCollector()
    elif source.lower() == "openmeteo":
        collector = OpenMeteoAirCollector()
    else:
        collector = MockAirSeedCollector()

    raw_data = await collector.fetch_measurements(
        latitude=loc.latitude,
        longitude=loc.longitude,
        start_date=start_date,
        end_date=end_date,
        location_id=location_id
    )

    if not raw_data:
        # Fallback to mock collector if external API yields no points
        collector = MockAirSeedCollector()
        raw_data = await collector.fetch_measurements(
            latitude=loc.latitude,
            longitude=loc.longitude,
            start_date=start_date,
            end_date=end_date,
            location_id=location_id
        )

    cleaned_data, logs = DataCleaningPipeline.batch_clean_series(raw_data)

    db_records = []
    for item in cleaned_data:
        db_records.append(EnvironmentalMeasurement(
            id=str(uuid.uuid4()),
            location_id=item["location_id"],
            domain=item["domain"],
            metric=item["metric"],
            value=item["value"],
            unit=item["unit"],
            timestamp=item["timestamp"],
            source=item["source"],
            data_quality=item["data_quality"],
            raw_value=item.get("raw_value")
        ))

    db.bulk_save_objects(db_records)
    
    log_records = []
    for log in logs:
        log_records.append(DataQualityLog(
            id=str(uuid.uuid4()),
            location_id=log.get("location_id"),
            metric=log.get("metric"),
            timestamp=log.get("timestamp"),
            rule_triggered=log.get("rule_triggered"),
            original_value=log.get("original_value"),
            action_taken=log.get("action_taken"),
            details=log.get("details")
        ))
    db.bulk_save_objects(log_records)
    db.commit()

    return {
        "status": "SUCCESS",
        "location_id": location_id,
        "source": collector.source_name,
        "raw_count": len(raw_data),
        "cleaned_count": len(cleaned_data),
        "audit_logs_count": len(logs)
    }
