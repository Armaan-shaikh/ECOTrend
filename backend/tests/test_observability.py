import asyncio
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.ingestion_orchestrator import IngestionOrchestrator
from app.engine.observability_engine import ObservabilityEngine
from app.models.observability import IngestionJobLog, SourceHealthLog, OperationalAlertLog
from app.core.cache import cache_manager

app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

def test_ingestion_lock_concurrency():
    source = "OpenAQ"
    loc = "loc_us_ny_nyc_manhattan"

    assert IngestionOrchestrator.acquire_ingestion_lock(source, loc, lock_ttl_seconds=60) is True
    assert IngestionOrchestrator.acquire_ingestion_lock(source, loc, lock_ttl_seconds=60) is False

    IngestionOrchestrator.release_ingestion_lock(source, loc)
    assert IngestionOrchestrator.acquire_ingestion_lock(source, loc, lock_ttl_seconds=60) is True

def test_ingestion_job_successful_execution():
    async def _test():
        async def mock_fetch():
            return [
                {"location_id": "loc_1", "domain": "air", "metric": "PM2.5", "value": 12.0, "unit": "ug/m3", "timestamp": "2026-08-17T12:00:00Z", "source": "OpenAQ", "data_quality": "VALID"}
            ]

        job_res = await IngestionOrchestrator.execute_job(
            source="OpenAQ",
            domain="air",
            location_id="loc_1",
            fetch_func=mock_fetch,
            max_retries=2
        )

        assert job_res["status"] == "SUCCESS"
        assert job_res["records_fetched"] == 1
        assert job_res["records_valid"] == 1
        assert job_res["error_count"] == 0
        assert job_res["duration_ms"] is not None
        assert job_res["duration_ms"] >= 0.0

    asyncio.run(_test())

def test_ingestion_job_bounded_retry_failure():
    async def _test():
        attempts = 0

        async def failing_fetch():
            nonlocal attempts
            attempts += 1
            raise ValueError("External API timeout")

        job_res = await IngestionOrchestrator.execute_job(
            source="FailingProvider",
            domain="air",
            location_id="loc_1",
            fetch_func=failing_fetch,
            max_retries=3,
            backoff_base_sec=0.01
        )

        assert attempts == 3
        assert job_res["status"] == "FAILED"
        assert "Exhausted 3 retries" in job_res["error_details"]

    asyncio.run(_test())

def test_source_health_evaluation():
    now = datetime.now(timezone.utc)

    # 1. HEALTHY Source
    h1 = ObservabilityEngine.evaluate_source_health(
        source="OpenAQ", domain="air", last_success=now, last_attempt=now, consecutive_failures=0, rejection_rate=0.5
    )
    assert h1["status"] == "HEALTHY"

    # 2. DEGRADED Source
    h2 = ObservabilityEngine.evaluate_source_health(
        source="OpenAQ", domain="air", last_success=now, last_attempt=now, consecutive_failures=1, rejection_rate=20.0
    )
    assert h2["status"] == "DEGRADED"

    # 3. STALE Source (>24h since success)
    old_success = now - timedelta(hours=30)
    h3 = ObservabilityEngine.evaluate_source_health(
        source="OpenAQ", domain="air", last_success=old_success, last_attempt=now, consecutive_failures=0, rejection_rate=0.0
    )
    assert h3["status"] == "STALE"

    # 4. FAILED Source (3+ consecutive errors)
    h4 = ObservabilityEngine.evaluate_source_health(
        source="OpenAQ", domain="air", last_success=old_success, last_attempt=now, consecutive_failures=3, rejection_rate=0.0
    )
    assert h4["status"] == "FAILED"

def test_operational_alert_creation_and_cooldown():
    a1 = ObservabilityEngine.create_operational_alert(
        source="OpenAQ",
        domain="air",
        severity="WARNING",
        condition="HIGH_REJECTION_RATE",
        observed_value="18%",
        expected_condition="< 5%",
        cooldown_minutes=30
    )
    assert a1 is not None
    assert a1["status"] == "OPEN"

    a2 = ObservabilityEngine.create_operational_alert(
        source="OpenAQ",
        domain="air",
        severity="WARNING",
        condition="HIGH_REJECTION_RATE",
        observed_value="18%",
        expected_condition="< 5%",
        cooldown_minutes=30
    )
    assert a2 is None

def test_observability_overview_endpoint():
    res = client.get("/api/v1/observability/overview")
    assert res.status_code == 200
    data = res.json()
    assert "system_health" in data
    assert "infrastructure_health" in data
    assert "all_sources" in data
    assert len(data["all_sources"]) >= 6

def test_observability_sources_endpoint():
    res = client.get("/api/v1/observability/sources")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 6

def test_observability_jobs_endpoint():
    res = client.get("/api/v1/observability/jobs")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_observability_alerts_and_action_endpoints():
    res = client.get("/api/v1/observability/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0

    alert_id = alerts[0]["id"]

    ack_res = client.post(f"/api/v1/observability/alerts/{alert_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "ACKNOWLEDGED"

    res_res = client.post(f"/api/v1/observability/alerts/{alert_id}/resolve")
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "RESOLVED"
    assert res_res.json()["resolved_at"] is not None

def test_observability_metrics_endpoint():
    res = client.get("/api/v1/observability/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "system_status" in data
    assert "database_status" in data
    assert "healthy_sources_count" in data
