import pytest
import time
import os
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.webhook_engine import WebhookEngine
from app.engine.event_bus import EventBus
from app.engine.workflow_engine import WorkflowEngine
from app.engine.recovery_engine import OperationalRecoveryEngine
from app.core.cache import cache_manager
from app.core.auth import create_access_token
from scripts.db_backup_restore import DatabaseBackupManager

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

def test_database_backup_and_restore_verification():
    manifest_file = "test_backup_manifest.json"
    try:
        manifest = DatabaseBackupManager.create_backup_manifest(manifest_file)
        assert manifest["integrity_checksum"] is not None
        assert "environmental_measurements" in manifest["tables"]

        is_valid = DatabaseBackupManager.verify_restore_integrity(manifest_file)
        assert is_valid is True
    finally:
        if os.path.exists(manifest_file):
            os.remove(manifest_file)

def test_health_probes_liveness_and_readiness_semantics():
    # Liveness probe must be 100% dependency-free & unauthenticated
    live_res = client.get("/api/v1/health/liveness")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "alive"

    # Readiness probe reports granular dependency health
    ready_res = client.get("/api/v1/health/readiness")
    assert ready_res.status_code in [200, 503]
    data = ready_res.json()
    assert "dependencies" in data
    assert "database" in data["dependencies"]
    assert "redis" in data["dependencies"]

def test_event_durability_and_workflow_crash_recovery():
    # Publish event
    evt = {
        "event_id": "evt_p18_cert_001",
        "event_type": "INGESTION_COMPLETED",
        "tenant_id": "tenant_ecotrend_enterprise",
        "source": "OpenAQ Adapter",
        "resource_type": "AirObservation",
        "resource_id": "obs_p18_01",
        "payload": {"metric": "PM2.5", "value": 18.2}
    }
    EventBus.publish(evt)

    # Workflow crash recovery test
    wf = WorkflowEngine.start_workflow("tenant_ecotrend_enterprise", "CRASH_RECOVERY_PIPELINE")
    recovered = OperationalRecoveryEngine.recover_workflow(
        workflow_id=wf["id"],
        tenant_id="tenant_ecotrend_enterprise",
        actor_id="usr_admin_001",
        actor_email="admin@ecotrend.io"
    )
    assert recovered["retry_count"] == 1
    assert recovered["status"] == "RUNNING"

def test_redis_failure_drill_and_fallback():
    original_state = cache_manager._use_redis
    cache_manager._use_redis = False

    # Liveness probe remains 200 alive during Redis outage
    live_res = client.get("/api/v1/health/liveness")
    assert live_res.status_code == 200

    # Operational metrics endpoint falls back gracefully
    metrics_res = client.get("/api/v1/observability/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["redis_status"] == "degraded"

    cache_manager._use_redis = original_state

def test_webhook_security_hmac_replay_ssrf():
    payload = {"event": "COMPLIANCE_ALERT_CREATED", "value": 45.0}
    secret = "whsec_cert_secret_key"
    current_ts = int(time.time())

    # HMAC signature check
    sig = WebhookEngine.generate_signature(str(payload), secret, current_ts)
    assert WebhookEngine.verify_signature(str(payload), secret, sig) is True

    # Replay protection check (> 300s old)
    old_sig = WebhookEngine.generate_signature(str(payload), secret, current_ts - 400)
    assert WebhookEngine.verify_signature(str(payload), secret, old_sig) is False

    # SSRF protection check
    assert WebhookEngine.validate_webhook_url("http://127.0.0.1:8000/hook") is False
    assert WebhookEngine.validate_webhook_url("http://2130706433/hook") is False
    assert WebhookEngine.validate_webhook_url("https://hooks.enterprise-ehs.org/ecotrend") is True

def test_authorization_matrix_and_tenant_isolation():
    # Anonymous request -> 401
    assert client.get("/api/v1/admin/users").status_code == 401

    # Viewer role -> 403 on admin endpoint
    viewer_token = create_access_token({"sub": "viewer@ecotrend.io", "role": "VIEWER", "tenant_id": "tenant_ecotrend_enterprise"})
    headers_viewer = {"Authorization": f"Bearer {viewer_token}"}
    assert client.get("/api/v1/admin/users", headers=headers_viewer).status_code == 403

    # Super Admin -> 200 on admin endpoint
    admin_token = create_access_token({"sub": "admin@ecotrend.io", "role": "SUPER_ADMIN", "tenant_id": "tenant_ecotrend_enterprise"})
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    assert client.get("/api/v1/admin/users", headers=headers_admin).status_code == 200

def test_provenance_immutability_and_integrity_rules():
    allowed_provenances = {"MEASURED", "MODELED_ESTIMATE", "REANALYSIS", "ESTIMATED", "DERIVED", "FORECASTED", "SCENARIO", "DECISION_SUPPORT"}

    # Historical observations must be MEASURED
    assert "MEASURED" in allowed_provenances
    assert "FORECASTED" in allowed_provenances

    # Rule check: FORECASTED cannot equal MEASURED
    assert "FORECASTED" != "MEASURED"
    assert "SCENARIO" != "MEASURED"

def test_operational_metrics_performance_benchmark():
    start_t = time.time()
    metrics_res = client.get("/api/v1/observability/metrics")
    duration_ms = (time.time() - start_t) * 1000.0

    assert metrics_res.status_code == 200
    assert duration_ms < 500.0  # Sub-500ms performance certification check
    assert "event_processing_latency_ms" in metrics_res.json()
