from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional

class LoginRequestSchema(BaseModel):
    email: str
    password: str

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserSchema(BaseModel):
    id: str
    tenant_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str

class UserCreateSchema(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "VIEWER"
    tenant_id: Optional[str] = None

class TenantSchema(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool
    created_at: str

class TenantCreateSchema(BaseModel):
    name: str
    slug: str

class AuditEventSchema(BaseModel):
    id: str
    tenant_id: str
    actor_id: str
    actor_email: str
    action: str
    resource_type: str
    resource_id: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    reason: Optional[str] = None
    correlation_id: Optional[str] = None
    ip_address: Optional[str] = None
    provenance: str = "AUDIT_TRAIL"
    timestamp: str

class ApprovalRequestSchema(BaseModel):
    id: str
    tenant_id: str
    submitter_id: str
    approver_id: Optional[str] = None
    intervention_id: str
    title: str
    domain: str
    status: str
    estimated_cepi_improvement: float
    reason: str
    decision_reason: Optional[str] = None
    provenance: str = "APPROVAL_WORKFLOW"
    created_at: str
    updated_at: str

class ApprovalSubmitSchema(BaseModel):
    intervention_id: str
    title: str
    domain: str
    estimated_cepi_improvement: float
    reason: str

class ApprovalDecisionSchema(BaseModel):
    decision_reason: str

class SecuritySummarySchema(BaseModel):
    active_users_count: int
    active_tenants_count: int
    pending_approvals_count: int
    audit_events_24h_count: int
    security_posture: str
    rbac_status: str

class GovernanceOverviewResponse(BaseModel):
    tenant_id: str
    security_summary: SecuritySummarySchema
    pending_approvals: List[ApprovalRequestSchema]
    recent_audit_events: List[AuditEventSchema]
    users: List[UserSchema]
