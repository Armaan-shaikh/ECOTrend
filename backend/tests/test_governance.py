import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.router import api_router
from app.core.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.core.permissions import has_permission, verify_permission
from app.engine.approval_engine import ApprovalEngine
from app.engine.audit_engine import AuditEngine
from app.core.cache import cache_manager

app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

def test_password_hashing_and_verification():
    raw_pass = "EnterprisePass2026!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_creation_and_decoding():
    token = create_access_token({"sub": "admin@ecotrend.io", "tenant_id": "tenant_1", "role": "SUPER_ADMIN"})
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "admin@ecotrend.io"
    assert decoded["tenant_id"] == "tenant_1"
    assert decoded["role"] == "SUPER_ADMIN"

def test_rbac_permissions_matrix():
    assert has_permission("SUPER_ADMIN", "MANAGE_USERS") is True
    assert has_permission("SUPER_ADMIN", "APPROVE_INTERVENTIONS") is True
    assert has_permission("OPERATOR", "MANAGE_USERS") is False
    assert has_permission("VIEWER", "APPROVE_INTERVENTIONS") is False

def test_approval_engine_separation_of_duties():
    req = ApprovalEngine.submit_intervention_request(
        tenant_id="tenant_ecotrend_enterprise",
        submitter_id="usr_operator_002",
        submitter_email="operator@ecotrend.io",
        intervention_id="int_air_traffic",
        title="Traffic Optimization",
        domain="air",
        estimated_cepi_improvement=3.5,
        reason="PM2.5 exceedance"
    )
    assert req["status"] == "SUBMITTED"

    # Submitter cannot approve their own submission
    with pytest.raises(ValueError, match="Separation of Duties Violation"):
        ApprovalEngine.approve_intervention_request(
            req_id=req["id"],
            tenant_id="tenant_ecotrend_enterprise",
            approver_id="usr_operator_002", # Same as submitter!
            approver_email="operator@ecotrend.io",
            decision_reason="Self-approval attempt",
            existing_req=req
        )

    # Different approver succeeds
    approved_req = ApprovalEngine.approve_intervention_request(
        req_id=req["id"],
        tenant_id="tenant_ecotrend_enterprise",
        approver_id="usr_admin_001", # Authorized different approver
        approver_email="admin@ecotrend.io",
        decision_reason="Approved after inspection",
        existing_req=req
    )
    assert approved_req["status"] == "APPROVED"
    assert approved_req["approver_id"] == "usr_admin_001"

def test_tenant_isolation_cross_tenant_attack_prevention():
    req = {
        "id": "app_req_tenant_a",
        "tenant_id": "tenant_a",
        "submitter_id": "usr_a",
        "status": "SUBMITTED"
    }

    # Tenant B approver attempting to approve Tenant A request
    with pytest.raises(PermissionError, match="Cross-Tenant Access Violation"):
        ApprovalEngine.approve_intervention_request(
            req_id="app_req_tenant_a",
            tenant_id="tenant_b", # Tenant B attempting cross-tenant edit!
            approver_id="usr_b",
            approver_email="b@ecotrend.io",
            decision_reason="Cross-tenant attack",
            existing_req=req
        )

def test_immutable_audit_engine():
    event = AuditEngine.record_event(
        tenant_id="tenant_1",
        actor_id="usr_1",
        actor_email="admin@ecotrend.io",
        action="USER_CREATED",
        resource_type="User",
        resource_id="usr_99",
        new_state="ACTIVE"
    )
    assert event["provenance"] == "AUDIT_TRAIL"
    assert event["action"] == "USER_CREATED"

def test_auth_login_and_me_endpoints():
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@ecotrend.io", "password": "AdminPass123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@ecotrend.io"

def test_admin_governance_endpoints():
    users_res = client.get("/api/v1/admin/users")
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 3

    audit_res = client.get("/api/v1/admin/audit")
    assert audit_res.status_code == 200

    sec_res = client.get("/api/v1/admin/security/summary")
    assert sec_res.status_code == 200
    assert sec_res.json()["rbac_status"] == "DENY_BY_DEFAULT_ENFORCED"

def test_approvals_endpoints():
    approvals_res = client.get("/api/v1/approvals")
    assert approvals_res.status_code == 200
    assert len(approvals_res.json()) >= 1
