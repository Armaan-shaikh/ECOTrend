from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.api.auth import get_current_user
from app.engine.recovery_engine import OperationalRecoveryEngine

router = APIRouter(prefix="/operations", tags=["Enterprise Reliability & Operational Recovery"])

@router.get("/recovery")
async def get_recovery_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    return OperationalRecoveryEngine.get_recovery_status(current_user["tenant_id"])

@router.get("/dead-letters")
async def list_dead_letters(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    status_dict = OperationalRecoveryEngine.get_recovery_status(current_user["tenant_id"])
    return status_dict["recent_dead_letters"]

@router.post("/dead-letters/{id}/retry")
async def retry_dead_letter(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    try:
        res = OperationalRecoveryEngine.retry_dead_letter(
            dead_letter_id=id,
            tenant_id=current_user["tenant_id"],
            actor_id=current_user["id"],
            actor_email=current_user["email"],
            db=db
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/workflows/{id}/recover")
async def recover_workflow(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    try:
        res = OperationalRecoveryEngine.recover_workflow(
            workflow_id=id,
            tenant_id=current_user["tenant_id"],
            actor_id=current_user["id"],
            actor_email=current_user["email"],
            db=db
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
