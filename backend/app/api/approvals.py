from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.api.auth import get_current_user
from app.engine.approval_engine import ApprovalEngine
from app.schemas.governance import (
    ApprovalRequestSchema,
    ApprovalSubmitSchema,
    ApprovalDecisionSchema
)

router = APIRouter(prefix="/approvals", tags=["Controlled Decision & Intervention Approvals"])

MOCK_APPROVALS_DB: List[Dict[str, Any]] = [
    {
        "id": "app_req_001",
        "tenant_id": "tenant_ecotrend_enterprise",
        "submitter_id": "usr_operator_002",
        "approver_id": None,
        "intervention_id": "int_air_traffic",
        "title": "Urban Traffic Low-Emission Zone Deployment",
        "domain": "air",
        "status": "SUBMITTED",
        "estimated_cepi_improvement": 3.5,
        "reason": "PM2.5 threshold breach observed in Hudson sector; request traffic signal optimization.",
        "decision_reason": None,
        "provenance": "APPROVAL_WORKFLOW",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

@router.get("", response_model=List[ApprovalRequestSchema])
async def list_approvals(
    status: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    user_tenant = current_user["tenant_id"]

    res = [r for r in MOCK_APPROVALS_DB if r["tenant_id"] == user_tenant]
    if status:
        res = [r for r in res if r["status"].lower() == status.lower()]
    return [ApprovalRequestSchema(**r) for r in res]

@router.get("/{id}", response_model=ApprovalRequestSchema)
async def get_approval_by_id(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    user_tenant = current_user["tenant_id"]

    for r in MOCK_APPROVALS_DB:
        if r["id"] == id:
            if r["tenant_id"] != user_tenant:
                raise HTTPException(status_code=403, detail="Cross-tenant access prohibited")
            return ApprovalRequestSchema(**r)
    raise HTTPException(status_code=404, detail="Approval request not found")

@router.post("", response_model=ApprovalRequestSchema)
async def create_approval_request(
    payload: ApprovalSubmitSchema,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_RECOMMENDATIONS")

    req_dict = ApprovalEngine.submit_intervention_request(
        tenant_id=current_user["tenant_id"],
        submitter_id=current_user["id"],
        submitter_email=current_user["email"],
        intervention_id=payload.intervention_id,
        title=payload.title,
        domain=payload.domain,
        estimated_cepi_improvement=payload.estimated_cepi_improvement,
        reason=payload.reason,
        db=db
    )
    MOCK_APPROVALS_DB.append(req_dict)
    return ApprovalRequestSchema(**req_dict)

@router.post("/{id}/approve", response_model=ApprovalRequestSchema)
async def approve_request(
    id: str = Path(...),
    payload: ApprovalDecisionSchema = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "APPROVE_INTERVENTIONS")

    target_req = None
    for r in MOCK_APPROVALS_DB:
        if r["id"] == id:
            target_req = r
            break

    if not target_req:
        raise HTTPException(status_code=404, detail="Approval request not found")

    try:
        updated = ApprovalEngine.approve_intervention_request(
            req_id=id,
            tenant_id=current_user["tenant_id"],
            approver_id=current_user["id"],
            approver_email=current_user["email"],
            decision_reason=payload.decision_reason if payload else "Approved by authorized EHS Manager",
            db=db,
            existing_req=target_req
        )
        return ApprovalRequestSchema(**updated)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/{id}/reject", response_model=ApprovalRequestSchema)
async def reject_request(
    id: str = Path(...),
    payload: ApprovalDecisionSchema = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "APPROVE_INTERVENTIONS")

    target_req = None
    for r in MOCK_APPROVALS_DB:
        if r["id"] == id:
            target_req = r
            break

    if not target_req:
        raise HTTPException(status_code=404, detail="Approval request not found")

    try:
        updated = ApprovalEngine.reject_intervention_request(
            req_id=id,
            tenant_id=current_user["tenant_id"],
            approver_id=current_user["id"],
            approver_email=current_user["email"],
            decision_reason=payload.decision_reason if payload else "Rejected by authorized EHS Manager",
            db=db,
            existing_req=target_req
        )
        return ApprovalRequestSchema(**updated)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
