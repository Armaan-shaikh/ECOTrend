import time
import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from app.core.cache import cache_manager

logger = logging.getLogger("ecotrend.observability_engine")

class ObservabilityEngine:
    """
    Core Reliability, Health Monitoring, and Operational Alert Engine.
    - Evaluates data source health states independently of environmental scores.
    - Computes data freshness thresholds.
    - Manages operational alert lifecycles (OPEN -> ACKNOWLEDGED -> RESOLVED).
    - Prevents alert notification spam via deduplication cooldown logic.
    """

    @staticmethod
    def evaluate_source_health(
        source: str,
        domain: str,
        last_success: Optional[datetime],
        last_attempt: Optional[datetime],
        consecutive_failures: int,
        rejection_rate: float,
        stale_threshold_hours: float = 24.0
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        stale_hours = 0.0

        if last_success:
            # Calculate hours since last successful ingestion
            delta = now - (last_success if last_success.tzinfo else last_success.replace(tzinfo=timezone.utc))
            stale_hours = delta.total_seconds() / 3600.0

        if consecutive_failures >= 3:
            health_status = "FAILED"
        elif stale_hours > stale_threshold_hours:
            health_status = "STALE"
        elif consecutive_failures > 0 or rejection_rate > 15.0:
            health_status = "DEGRADED"
        else:
            health_status = "HEALTHY"

        return {
            "source": source,
            "domain": domain,
            "status": health_status,
            "last_successful_ingestion": last_success.isoformat() if last_success else None,
            "last_attempted_ingestion": last_attempt.isoformat() if last_attempt else None,
            "consecutive_failures": consecutive_failures,
            "rejection_rate_percent": round(rejection_rate, 2),
            "stale_data_duration_hours": round(stale_hours, 1)
        }

    @staticmethod
    def create_operational_alert(
        source: str,
        domain: str,
        severity: str,
        condition: str,
        observed_value: str,
        expected_condition: str,
        provenance_context: Optional[str] = None,
        cooldown_minutes: int = 30
    ) -> Optional[Dict[str, Any]]:
        cooldown_key = f"ecotrend:alert_cooldown:{source}:{condition}"
        if cache_manager.get(cooldown_key) is not None:
            # Alert is suppressed due to active cooldown window
            return None

        # Set cooldown window
        cache_manager.set(cooldown_key, {"created_at": time.time()}, ttl_seconds=cooldown_minutes * 60)

        alert_id = str(uuid.uuid4())
        return {
            "id": alert_id,
            "source": source,
            "domain": domain,
            "severity": severity,
            "condition": condition,
            "observed_value": str(observed_value),
            "expected_condition": expected_condition,
            "status": "OPEN",
            "detected_at": datetime.now(timezone.utc).isoformat(),
            "resolved_at": None,
            "provenance_context": provenance_context or f"Operational Alert for {source} ({domain})"
        }
