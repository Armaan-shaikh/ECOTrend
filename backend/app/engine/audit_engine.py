import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

logger = logging.getLogger("ecotrend.audit_engine")

class AuditEngine:
    """
    Immutable Enterprise Audit Engine.
    - Append-only audit log recording.
    - Captures actor, tenant, action, resource, timestamp, and state diffs.
    - Normal users/admin UI cannot mutate or delete audit logs.
    """

    @staticmethod
    def record_event(
        tenant_id: str,
        actor_id: str,
        actor_email: str,
        action: str,
        resource_type: str,
        resource_id: str,
        previous_state: Optional[str] = None,
        new_state: Optional[str] = None,
        reason: Optional[str] = None,
        correlation_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        event_dict = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "actor_id": actor_id,
            "actor_email": actor_email,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "previous_state": previous_state,
            "new_state": new_state,
            "reason": reason,
            "correlation_id": correlation_id,
            "ip_address": ip_address,
            "provenance": "AUDIT_TRAIL",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        if db:
            try:
                db_event = AuditEvent(
                    id=event_dict["id"],
                    tenant_id=tenant_id,
                    actor_id=actor_id,
                    actor_email=actor_email,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    previous_state=previous_state,
                    new_state=new_state,
                    reason=reason,
                    correlation_id=correlation_id,
                    ip_address=ip_address,
                    provenance="AUDIT_TRAIL"
                )
                db.add(db_event)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to persist AuditEvent to DB: {e}")

        logger.info(f"AUDIT_EVENT: [{action}] by {actor_email} on {resource_type}:{resource_id} (Tenant: {tenant_id})")
        return event_dict
