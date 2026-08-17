import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.core.permissions import verify_permission
from app.api.auth import get_current_user
from app.engine.audit_engine import AuditEngine

router = APIRouter(prefix="/integrations/webhooks", tags=["Enterprise Webhook Integrations"])

class WebhookCreateSchema(BaseModel):
    target_url: str
    secret_token: str
    events_filter: str = "*"

MOCK_WEBHOOKS_DB: List[Dict[str, Any]] = [
    {
        "id": "wh_sub_001",
        "tenant_id": "tenant_ecotrend_enterprise",
        "target_url": "https://hooks.enterprise-ehs.internal/ecotrend",
        "secret_token": "whsec_prod_secret_2026",
        "events_filter": "*",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

@router.get("")
async def list_webhooks(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")
    subs = [w for w in MOCK_WEBHOOKS_DB if w["tenant_id"] == current_user["tenant_id"]]
    # Mask secrets
    masked = []
    for s in subs:
        c = s.copy()
        c["secret_token"] = "whsec_***_masked"
        masked.append(c)
    return masked

@router.post("")
async def create_webhook(
    payload: WebhookCreateSchema,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")

    wh_id = str(uuid.uuid4())
    sub_dict = {
        "id": wh_id,
        "tenant_id": current_user["tenant_id"],
        "target_url": payload.target_url,
        "secret_token": payload.secret_token,
        "events_filter": payload.events_filter,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    MOCK_WEBHOOKS_DB.append(sub_dict)

    # Immutable Audit Event
    AuditEngine.record_event(
        tenant_id=current_user["tenant_id"],
        actor_id=current_user["id"],
        actor_email=current_user["email"],
        action="WEBHOOK_CREATED",
        resource_type="WebhookSubscription",
        resource_id=wh_id,
        new_state=payload.target_url,
        db=db
    )

    resp = sub_dict.copy()
    resp["secret_token"] = "whsec_***_masked"
    return resp

@router.delete("/{id}")
async def delete_webhook(
    id: str = Path(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_permission(current_user["role"], "MANAGE_TENANTS")

    for i, w in enumerate(MOCK_WEBHOOKS_DB):
        if w["id"] == id and w["tenant_id"] == current_user["tenant_id"]:
            MOCK_WEBHOOKS_DB.pop(i)
            AuditEngine.record_event(
                tenant_id=current_user["tenant_id"],
                actor_id=current_user["id"],
                actor_email=current_user["email"],
                action="WEBHOOK_DELETED",
                resource_type="WebhookSubscription",
                resource_id=id,
                db=db
            )
            return {"message": f"Webhook '{id}' deleted successfully."}
    raise HTTPException(status_code=404, detail="Webhook subscription not found")
