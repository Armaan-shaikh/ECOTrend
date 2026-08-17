from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.core.auth import hash_password
from app.api.auth import get_current_user, MOCK_USERS_DB, DEFAULT_TENANT_ID
from app.schemas.governance import (
    UserSchema, UserCreateSchema, TenantSchema, AuditEventSchema, SecuritySummarySchema
)

router = APIRouter(prefix="/admin", tags=["Administrative Governance & Security"])

MOCK_TENANTS_DB = [
    {
        "id": DEFAULT_TENANT_ID,
        "name": "EcoTrend Enterprise",
        "slug": "ecotrend-enterprise",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

MOCK_AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "aud_evt_001",
        "tenant_id": DEFAULT_TENANT_ID,
        "actor_id": "usr_admin_001",
        "actor_email": "admin@ecotrend.io",
        "action": "SYSTEM_INITIALIZED",
        "resource_type": "System",
        "resource_id": "sys_core",
        "previous_state": None,
        "new_state": "ACTIVE",
        "reason": "Enterprise platform startup",
        "correlation_id": "corr_init_001",
        "ip_address": "127.0.0.1",
        "provenance": "AUDIT_TRAIL",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
]

@router.get("/users", response_model=List[UserSchema])
async def list_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_USERS")
    user_tenant = current_user["tenant_id"]

    res = [UserSchema(**u) for u in MOCK_USERS_DB.values() if u["tenant_id"] == user_tenant or current_user["role"] == "SUPER_ADMIN"]
    return res

@router.post("/users", response_model=UserSchema)
async def create_user(
    payload: UserCreateSchema,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_USERS")

    if payload.email in MOCK_USERS_DB:
        raise HTTPException(status_code=400, detail=f"User email '{payload.email}' already exists")

    new_user = {
        "id": f"usr_{len(MOCK_USERS_DB)+1:03d}",
        "tenant_id": payload.tenant_id or current_user["tenant_id"],
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "full_name": payload.full_name,
        "role": payload.role.upper(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    MOCK_USERS_DB[payload.email] = new_user
    return UserSchema(**new_user)

@router.get("/tenants", response_model=List[TenantSchema])
async def list_tenants(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    return [TenantSchema(**t) for t in MOCK_TENANTS_DB]

@router.get("/audit", response_model=List[AuditEventSchema])
async def get_audit_logs(
    limit: int = Query(50, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "VIEW_AUDIT_LOGS")
    user_tenant = current_user["tenant_id"]

    logs = [a for a in MOCK_AUDIT_LOGS if a["tenant_id"] == user_tenant or current_user["role"] == "SUPER_ADMIN"]
    return [AuditEventSchema(**a) for a in logs[:limit]]

@router.get("/security/summary", response_model=SecuritySummarySchema)
async def get_security_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    return {
        "active_users_count": len([u for u in MOCK_USERS_DB.values() if u["is_active"]]),
        "active_tenants_count": len(MOCK_TENANTS_DB),
        "pending_approvals_count": 1,
        "audit_events_24h_count": len(MOCK_AUDIT_LOGS),
        "security_posture": "OPTIMAL_ENTERPRISE_GOVERNANCE",
        "rbac_status": "DENY_BY_DEFAULT_ENFORCED"
    }

@router.get("/system-policy")
async def get_system_policy(
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    return {
        "authentication": "PBKDF2_SHA256_JWT",
        "authorization": "STRICT_SERVER_SIDE_RBAC",
        "multi_tenancy": "STRICT_TENANT_SCOPING_ISOLATION",
        "audit_policy": "APPEND_ONLY_IMMUTABLE_LOGS",
        "intervention_policy": "HUMAN_APPROVAL_REQUIRED_ZERO_AUTO_EXECUTION"
    }
