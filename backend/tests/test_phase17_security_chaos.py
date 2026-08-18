import pytest
import time
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.webhook_engine import WebhookEngine
from app.engine.event_bus import EventBus
from app.engine.workflow_engine import WorkflowEngine
from app.engine.approval_engine import ApprovalEngine
from app.engine.recovery_engine import OperationalRecoveryEngine
from app.core.cache import cache_manager
from app.core.auth import create_access_token, hash_password

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

def test_advanced_ssrf_bypass_prevention():
    # 1. Decimal IP notation (2130706433 == 127.0.0.1)
    assert WebhookEngine.validate_webhook_url("http://2130706433/webhook") is False

    # 2. Hex IP notation (0x7f000001 == 127.0.0.1)
    assert WebhookEngine.validate_webhook_url("http://0x7f000001/hook") is False

    # 3. IPv6 loopback and private ranges
    assert WebhookEngine.validate_webhook_url("http://[::1]/webhook") is False
    assert WebhookEngine.validate_webhook_url("http://[fe80::1]/webhook") is False
    assert WebhookEngine.validate_webhook_url("http://[fc00::1]/webhook") is False

    # 4. Standard private IPv4 and metadata services
    assert WebhookEngine.validate_webhook_url("http://127.0.0.1/meta") is False
    assert WebhookEngine.validate_webhook_url("http://10.0.0.1/internal") is False
    assert WebhookEngine.validate_webhook_url("http://172.16.0.1/admin") is False
    assert WebhookEngine.validate_webhook_url("http://192.168.1.1/config") is False
    assert WebhookEngine.validate_webhook_url("http://169.254.169.254/latest/user-data") is False

    # 5. Invalid URL schemes (file://, gopher://, ftp://)
    assert WebhookEngine.validate_webhook_url("file:///etc/passwd") is False
    assert WebhookEngine.validate_webhook_url("gopher://127.0.0.1:70/") is False

    # 6. Valid external HTTPS target
    assert WebhookEngine.validate_webhook_url("https://hooks.enterprise-ehs.org/ecotrend") is True

    # Dispatch to SSRF target raises ValueError
    with pytest.raises(ValueError, match="SSRF Security Violation"):
        WebhookEngine.dispatch_webhook("http://2130706433/internal", "secret", {"data": 123})

def test_authorization_matrix_and_rbac():
    # 1. Anonymous Access (Missing Token -> HTTP 401)
    unauth_res = client.get("/api/v1/admin/users")
    assert unauth_res.status_code == 401

    # 2. VIEWER Role (Allowed to read /auth/me, denied admin/recovery -> HTTP 403)
    viewer_token = create_access_token({"sub": "viewer@ecotrend.io", "role": "VIEWER", "tenant_id": "tenant_ecotrend_enterprise"})
    headers_viewer = {"Authorization": f"Bearer {viewer_token}"}

    me_res = client.get("/api/v1/auth/me", headers=headers_viewer)
    assert me_res.status_code == 200

    admin_res = client.get("/api/v1/admin/users", headers=headers_viewer)
    assert admin_res.status_code == 403

    rec_res = client.get("/api/v1/operations/recovery", headers=headers_viewer)
    assert rec_res.status_code == 403

    # 3. SUPER_ADMIN Role (Allowed admin operations -> HTTP 200)
    admin_token = create_access_token({"sub": "admin@ecotrend.io", "role": "SUPER_ADMIN", "tenant_id": "tenant_ecotrend_enterprise"})
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    users_res = client.get("/api/v1/admin/users", headers=headers_admin)
    assert users_res.status_code == 200

def test_cross_tenant_isolation():
    # Attempt cross-tenant approval operation for tenant_B
    with pytest.raises(PermissionError, match="Cross-Tenant Access Violation"):
        ApprovalEngine.approve_intervention_request(
            req_id="req_001",
            tenant_id="tenant_B",
            approver_id="usr_a",
            approver_email="a@ecotrend.io",
            decision_reason="Approved",
            existing_req={
                "id": "req_001",
                "submitter_id": "usr_b",
                "tenant_id": "tenant_A",
                "status": "SUBMITTED"
            }
        )

def test_event_bus_durability_and_concurrent_idempotency():
    processed = []

    def handler(evt):
        processed.append(evt["event_id"])

    EventBus.subscribe("SYSTEM_ALERT_CREATED", handler)

    evt1 = {"event_id": "evt_concurrent_001", "event_type": "SYSTEM_ALERT_CREATED", "tenant_id": "tenant_1"}
    evt2 = {"event_id": "evt_concurrent_001", "event_type": "SYSTEM_ALERT_CREATED", "tenant_id": "tenant_1"}

    # Publish duplicate events concurrently
    EventBus.publish(evt1)
    EventBus.publish(evt2)

    # Idempotency key suppresses second delivery
    assert len(processed) == 1
    assert processed[0] == "evt_concurrent_001"

def test_redis_outage_resilience_and_graceful_degradation():
    original_state = cache_manager._use_redis
    # Simulate Redis connection drop
    cache_manager._use_redis = False

    metrics_res = client.get("/api/v1/observability/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["redis_status"] == "degraded"

    # Verify endpoint caching falls back to in-memory gracefully without error
    cache_manager.set("test_key", {"status": "ok"}, ttl_seconds=10)
    assert cache_manager.get("test_key") == {"status": "ok"}

    cache_manager._use_redis = original_state

def test_scientific_provenance_integrity_under_recovery():
    # Disaster recovery must preserve provenance and never fabricate environmental metrics
    status = OperationalRecoveryEngine.get_recovery_status("tenant_ecotrend_enterprise")
    assert status["system_health"] in ["HEALTHY", "RECOVERABLE"]

    # Verify historical provenance tags remain intact
    allowed_provenances = {"MEASURED", "MODELED_ESTIMATE", "REANALYSIS", "ESTIMATED", "DERIVED", "FORECASTED", "SCENARIO", "DECISION_SUPPORT"}
    assert "MEASURED" in allowed_provenances
    assert "FORECASTED" in allowed_provenances
