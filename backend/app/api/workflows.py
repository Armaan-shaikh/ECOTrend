from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.api.auth import get_current_user
from app.engine.workflow_engine import WorkflowEngine
from app.engine.event_bus import EventBus
from app.schemas.events import DomainEventSchema

router = APIRouter(tags=["Workflows & Event Operations"])

@router.get("/workflows")
async def list_workflows(
    status: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    return WorkflowEngine.get_workflows(current_user["tenant_id"], status)

@router.get("/workflows/{id}")
async def get_workflow(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    wfs = WorkflowEngine.get_workflows(current_user["tenant_id"])
    for w in wfs:
        if w["id"] == id:
            return w
    raise HTTPException(status_code=404, detail=f"Workflow '{id}' not found")

@router.post("/workflows/{id}/retry")
async def retry_workflow(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "MANAGE_RECOMMENDATIONS")
    try:
        return WorkflowEngine.retry_workflow(id, current_user["tenant_id"])
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/workflows/{id}/cancel")
async def cancel_workflow(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "MANAGE_RECOMMENDATIONS")
    try:
        return WorkflowEngine.cancel_workflow(id, current_user["tenant_id"])
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/events")
async def list_events(
    event_type: str = Query(None),
    limit: int = Query(50, le=100),
    current_user: dict = Depends(get_current_user)
):
    verify_permission(current_user["role"], "READ_COMPLIANCE")
    evts = EventBus.get_events(current_user["tenant_id"], event_type, limit)
    return evts
