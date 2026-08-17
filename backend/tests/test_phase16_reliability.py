import pytest
import time
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.webhook_engine import WebhookEngine
from app.engine.recovery_engine import OperationalRecoveryEngine
from app.engine.workflow_engine import WorkflowEngine
from app.engine.event_bus import EventBus
from app.core.cache import cache_manager

app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_and_events():
    cache_manager.clear()
    EventBus.clear_for_testing()
    yield
    cache_manager.clear()
    EventBus.clear_for_testing()

def test_webhook_ssrf_protection_validation():
    # 1. Blocked Loopback / Localhost Addresses
    assert WebhookEngine.validate_webhook_url("http://localhost/webhook") is False
    assert WebhookEngine.validate_webhook_url("http://127.0.0.1:8000/hook") is False
    assert WebhookEngine.validate_webhook_url("http://169.254.169.254/latest/meta-data") is False

    # 2. Blocked Private IP Ranges (RFC 1918)
    assert WebhookEngine.validate_webhook_url("http://10.0.0.1/notify") is False
    assert WebhookEngine.validate_webhook_url("http://172.16.0.5/api") is False
    assert WebhookEngine.validate_webhook_url("http://192.168.1.1/event") is False

    # 3. Allowed Production HTTPS Endpoints
    assert WebhookEngine.validate_webhook_url("https://hooks.enterprise-ehs.org/ecotrend") is True
    assert WebhookEngine.validate_webhook_url("https://api.incident-response.com/webhook") is True

    # 4. Dispatch to SSRF target raises ValueError
    with pytest.raises(ValueError, match="SSRF Security Violation"):
        WebhookEngine.dispatch_webhook("http://127.0.0.1:8000/internal", "secret", {"test": True})

def test_operational_recovery_dead_letter_dispatch():
    status = OperationalRecoveryEngine.get_recovery_status("tenant_ecotrend_enterprise")
    assert status["system_health"] in ["HEALTHY", "RECOVERABLE"]
    assert len(status["recent_dead_letters"]) >= 1

    dl_id = status["recent_dead_letters"][0]["id"]
    recovered = OperationalRecoveryEngine.retry_dead_letter(
        dead_letter_id=dl_id,
        tenant_id="tenant_ecotrend_enterprise",
        actor_id="usr_admin_001",
        actor_email="admin@ecotrend.io"
    )

    assert recovered["status"] == "RECOVERED"
    assert "recovered_at" in recovered

def test_workflow_recovery_and_restart():
    wf = WorkflowEngine.start_workflow(
        tenant_id="tenant_ecotrend_enterprise",
        workflow_type="DISASTER_RECOVERY_TEST_WF"
    )
    wf_id = wf["id"]

    recovered_wf = OperationalRecoveryEngine.recover_workflow(
        workflow_id=wf_id,
        tenant_id="tenant_ecotrend_enterprise",
        actor_id="usr_admin_001",
        actor_email="admin@ecotrend.io"
    )
    assert recovered_wf["retry_count"] == 1
    assert recovered_wf["status"] == "RUNNING"

def test_operational_recovery_rest_endpoints():
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@ecotrend.io", "password": "AdminPass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rec_res = client.get("/api/v1/operations/recovery", headers=headers)
    assert rec_res.status_code == 200
    assert "dead_letter_count" in rec_res.json()

    dl_res = client.get("/api/v1/operations/dead-letters", headers=headers)
    assert dl_res.status_code == 200
    assert len(dl_res.json()) >= 1

    dl_id = dl_res.json()[0]["id"]
    retry_res = client.post(f"/api/v1/operations/dead-letters/{dl_id}/retry", headers=headers)
    assert retry_res.status_code == 200
    assert retry_res.json()["status"] == "RECOVERED"

def test_observability_reliability_metrics():
    metrics_res = client.get("/api/v1/observability/metrics")
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    assert "event_processing_latency_ms" in data
    assert "dead_letter_count" in data
    assert "duplicate_suppression_count" in data
    assert "webhook_success_rate_percent" in data

def test_failure_injection_redis_outage_degraded_fallback():
    # Simulate Redis connection failure
    original_use_redis = cache_manager._use_redis
    cache_manager._use_redis = False
    metrics_res = client.get("/api/v1/observability/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["redis_status"] == "degraded"
    cache_manager._use_redis = original_use_redis
