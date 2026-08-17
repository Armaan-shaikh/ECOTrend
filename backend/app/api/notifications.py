from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.api.auth import get_current_user
from app.engine.notification_engine import NotificationEngine

router = APIRouter(prefix="/notifications", tags=["Multi-Channel Notifications"])

@router.get("")
async def list_notifications(
    channel: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    return NotificationEngine.get_notifications(current_user["tenant_id"], channel)

@router.post("/{id}/acknowledge")
async def acknowledge_notification(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    notes = NotificationEngine.get_notifications(current_user["tenant_id"])
    for n in notes:
        if n["id"] == id:
            n["delivery_status"] = "ACKNOWLEDGED"
            return n
    raise HTTPException(status_code=404, detail=f"Notification '{id}' not found")

@router.post("/{id}/resolve")
async def resolve_notification(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    notes = NotificationEngine.get_notifications(current_user["tenant_id"])
    for n in notes:
        if n["id"] == id:
            n["delivery_status"] = "RESOLVED"
            return n
    raise HTTPException(status_code=404, detail=f"Notification '{id}' not found")
