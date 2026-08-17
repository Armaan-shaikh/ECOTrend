import time
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable
from app.core.cache import cache_manager

logger = logging.getLogger("ecotrend.ingestion_orchestrator")

class IngestionOrchestrator:
    """
    Centralized Ingestion Job Orchestrator & Reliability Engine.
    - Manages QUEUED -> RUNNING -> SUCCESS / PARTIAL / FAILED lifecycle.
    - Prevents concurrent ingestion runs via Redis lock keys.
    - Executes bounded exponential backoff retries.
    - Tracks record counts, duration, rejection rates, and provenance.
    """

    @staticmethod
    def acquire_ingestion_lock(source: str, location_id: str, lock_ttl_seconds: int = 60) -> bool:
        lock_key = f"ecotrend:lock:ingestion:{source}:{location_id}"
        if cache_manager.get(lock_key) is not None:
            return False # Lock is active
        cache_manager.set(lock_key, {"locked_at": time.time()}, ttl_seconds=lock_ttl_seconds)
        return True

    @staticmethod
    def release_ingestion_lock(source: str, location_id: str) -> None:
        lock_key = f"ecotrend:lock:ingestion:{source}:{location_id}"
        cache_manager.delete(lock_key)

    @staticmethod
    async def execute_job(
        source: str,
        domain: str,
        location_id: str,
        fetch_func: Callable,
        clean_func: Optional[Callable] = None,
        max_retries: int = 3,
        backoff_base_sec: float = 0.1
    ) -> Dict[str, Any]:
        job_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)

        # 1. Acquire Concurrency Lock
        if not IngestionOrchestrator.acquire_ingestion_lock(source, location_id):
            return {
                "id": job_id,
                "source": source,
                "domain": domain,
                "location_id": location_id,
                "status": "FAILED",
                "started_at": started_at.isoformat(),
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "records_fetched": 0,
                "records_valid": 0,
                "records_rejected": 0,
                "error_count": 1,
                "duration_ms": 0.0,
                "provenance": "MEASURED",
                "error_details": f"Ingestion lock active for source '{source}' at location '{location_id}'."
            }

        status = "RUNNING"
        raw_data = []
        cleaned_data = []
        quality_logs = []
        error_details = None
        attempt = 0
        success = False
        start_time = time.time()

        try:
            # 2. Bounded Exponential Backoff Retry Loop
            while attempt < max_retries and not success:
                attempt += 1
                try:
                    raw_data = await fetch_func()
                    success = True
                except Exception as e:
                    logger.warning(f"Ingestion attempt {attempt}/{max_retries} for '{source}' failed: {e}")
                    if attempt < max_retries:
                        sleep_time = backoff_base_sec * (2 ** (attempt - 1))
                        time.sleep(sleep_time)
                    else:
                        error_details = f"Exhausted {max_retries} retries. Last error: {str(e)}"

            duration_ms = (time.time() - start_time) * 1000.0

            if not success:
                status = "FAILED"
                completed_at = datetime.now(timezone.utc)
                return {
                    "id": job_id,
                    "source": source,
                    "domain": domain,
                    "location_id": location_id,
                    "status": status,
                    "started_at": started_at.isoformat(),
                    "completed_at": completed_at.isoformat(),
                    "records_fetched": 0,
                    "records_valid": 0,
                    "records_rejected": 0,
                    "error_count": attempt,
                    "duration_ms": round(duration_ms, 2),
                    "provenance": "MEASURED",
                    "error_details": error_details
                }

            # 3. Clean & Validate Data if clean_func provided
            if clean_func and raw_data:
                cleaned_data, quality_logs = clean_func(raw_data)
            else:
                cleaned_data = raw_data
                quality_logs = []

            records_fetched = len(raw_data)
            records_valid = len(cleaned_data)
            records_rejected = max(0, records_fetched - records_valid)

            if records_rejected > 0:
                status = "PARTIAL"
            else:
                status = "SUCCESS"

            completed_at = datetime.now(timezone.utc)
            return {
                "id": job_id,
                "source": source,
                "domain": domain,
                "location_id": location_id,
                "status": status,
                "started_at": started_at.isoformat(),
                "completed_at": completed_at.isoformat(),
                "records_fetched": records_fetched,
                "records_valid": records_valid,
                "records_rejected": records_rejected,
                "error_count": max(0, attempt - 1),
                "duration_ms": round(duration_ms, 2),
                "provenance": "MEASURED",
                "error_details": None,
                "cleaned_data": cleaned_data,
                "quality_logs": quality_logs
            }

        finally:
            IngestionOrchestrator.release_ingestion_lock(source, location_id)
