import pytest
import time
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.engine.event_bus import EventBus
from app.engine.workflow_engine import WorkflowEngine
from app.engine.notification_engine import NotificationEngine
from app.engine.webhook_engine import WebhookEngine
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

def test_event_bus_publishing_and_subscribing():
    received = []

    def handle_ingestion(evt):
        received.append(evt)

    EventBus.subscribe("INGESTION_COMPLETED", handle_ingestion)

    evt = {
        "event_id": "evt_test_001",
        "event_type": "INGESTION_COMPLETED",
        "tenant_id": "tenant_1",
        "source": "OpenAQ Adapter",
        "resource_type": "AirObservation",
        "resource_id": "obs_100",
        "payload": {"domain": "air", "value": 22.5}
    }

    published = EventBus.publish(evt)
    assert published is True
    assert len(received) == 1
    assert received[0]["event_id"] == "evt_test_001"
    assert received[0]["schema_version"] == "1.0"

def test_event_bus_idempotent_handler_suppression():
    call_count = [0]

    def idempotent_handler(evt):
        call_count[0] += 1

    EventBus.subscribe("COMPLIANCE_ALERT_CREATED", idempotent_handler)

    evt = {
        "event_id": "evt_dup_100",
        "event_type": "COMPLIANCE_ALERT_CREATED",
        "tenant_id": "tenant_1",
        "payload": {"rule_id": "rule_air_pm25_24h"}
    }

    # Publish twice with same event_id
    EventBus.publish(evt)
    EventBus.publish(evt)

    # Handler should execute only ONCE due to idempotency key suppression
    assert call_count[0] == 1

def test_workflow_engine_lifecycle_and_retries():
    wf = WorkflowEngine.start_workflow(
        tenant_id="tenant_ecotrend_enterprise",
        workflow_type="COMPLIANCE_RESPONSE_PIPELINE",
        max_retries=2
    )
    assert wf["status"] == "RUNNING"
    wf_id = wf["id"]

    # Retry 1
    ret1 = WorkflowEngine.retry_workflow(wf_id, "tenant_ecotrend_enterprise")
    assert ret1["retry_count"] == 1
    assert ret1["status"] == "RUNNING"

    # Retry 2
    ret2 = WorkflowEngine.retry_workflow(wf_id, "tenant_ecotrend_enterprise")
    assert ret2["retry_count"] == 2
    assert ret2["status"] == "RUNNING"

    # Retry 3 exceeds max_retries=2 -> Moves to DEAD_LETTER
    ret3 = WorkflowEngine.retry_workflow(wf_id, "tenant_ecotrend_enterprise")
    assert ret3["status"] == "DEAD_LETTER"
    assert "Max retries exceeded" in ret3["error_message"]

def test_workflow_engine_cancellation():
    wf = WorkflowEngine.start_workflow(tenant_id="tenant_1", workflow_type="REMEDIATION_WORKFLOW")
    canceled = WorkflowEngine.cancel_workflow(wf["id"], "tenant_1")
    assert canceled["status"] == "CANCELLED"

def test_notification_engine_dispatch():
    notif = NotificationEngine.send_notification(
        tenant_id="tenant_1",
        recipient="admin@ecotrend.io",
        channel="EMAIL",
        title="High Priority Risk Alert",
        message="Forecasted DO drop below threshold.",
        severity="WARNING"
    )
    assert notif["delivery_status"] == "DELIVERED"
    assert notif["channel"] == "EMAIL"

def test_webhook_hmac_signature_and_replay_protection():
    payload = {"event": "COMPLIANCE_ALERT_CREATED", "value": 35.0}
    secret = "whsec_test_secret_key_123"
    current_time = int(time.time())

    sig_header = WebhookEngine.generate_signature(str(payload), secret, current_time)
    assert "t=" in sig_header
    assert "v1=" in sig_header

    # Valid verification
    is_valid = WebhookEngine.verify_signature(str(payload), secret, sig_header)
    assert is_valid is True

    # Invalid secret verification
    is_valid_bad_secret = WebhookEngine.verify_signature(str(payload), "wrong_secret", sig_header)
    assert is_valid_bad_secret is False

    # Replay attack check (stale timestamp > 300s old)
    old_sig_header = WebhookEngine.generate_signature(str(payload), secret, current_time - 400)
    is_valid_replay = WebhookEngine.verify_signature(str(payload), secret, old_sig_header, max_age_seconds=300)
    assert is_valid_replay is False

def test_workflows_and_events_api_endpoints():
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@ecotrend.io", "password": "AdminPass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    wf_res = client.get("/api/v1/workflows", headers=headers)
    assert wf_res.status_code == 200
    assert len(wf_res.json()) >= 1

    evt_res = client.get("/api/v1/events", headers=headers)
    assert evt_res.status_code == 200

    notif_res = client.get("/api/v1/notifications", headers=headers)
    assert notif_res.status_code == 200

    wh_res = client.get("/api/v1/integrations/webhooks", headers=headers)
    assert wh_res.status_code == 200
    assert len(wh_res.json()) >= 1
    # Secret must be masked
    assert wh_res.json()[0]["secret_token"] == "whsec_***_masked"
