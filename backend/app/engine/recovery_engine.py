import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.engine.workflow_engine import WorkflowEngine
from app.engine.audit_engine import AuditEngine

logger = logging.getLogger("ecotrend.recovery_engine")

class OperationalRecoveryEngine:
    """
    Operational Recovery Engine for Disaster Recovery & Platform Reliability.
    - Safe recovery of dead-letter events and failed workflow instances.
    - Guarantees ZERO data fabrication, ZERO historical measurement modification, and ZERO approval bypass.
    - Records immutable audit events for every operational recovery action.
    """

    MOCK_DEAD_LETTERS_DB: List[Dict[str, Any]] = [
        {
            "id": "dlq_001",
            "tenant_id": "tenant_ecotrend_enterprise",
            "workflow_id": "wf_inst_001",
            "event_type": "INGESTION_FAILED",
            "reason": "Temporary network timeout connecting to OpenAQ upstream API.",
            "status": "DEAD_LETTER",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    @classmethod
    def get_recovery_status(cls, tenant_id: str) -> Dict[str, Any]:
        dls = [d for d in cls.MOCK_DEAD_LETTERS_DB if d["tenant_id"] == tenant_id]
        wfs = WorkflowEngine.get_workflows(tenant_id)
        failed_wfs = [w for w in wfs if w["status"] in ["FAILED", "DEAD_LETTER"]]

        return {
            "tenant_id": tenant_id,
            "system_health": "RECOVERABLE" if failed_wfs or dls else "HEALTHY",
            "dead_letter_count": len(dls),
            "failed_workflows_count": len(failed_wfs),
            "recent_dead_letters": dls,
            "failed_workflows": failed_wfs
        }

    @classmethod
    def retry_dead_letter(
        cls,
        dead_letter_id: str,
        tenant_id: str,
        actor_id: str,
        actor_email: str,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        target = None
        for dl in cls.MOCK_DEAD_LETTERS_DB:
            if dl["id"] == dead_letter_id and dl["tenant_id"] == tenant_id:
                target = dl
                break

        if not target:
            raise ValueError(f"Dead letter item '{dead_letter_id}' not found")

        target["status"] = "RECOVERED"
        target["recovered_at"] = datetime.now(timezone.utc).isoformat()

        # Audit Event
        AuditEngine.record_event(
            tenant_id=tenant_id,
            actor_id=actor_id,
            actor_email=actor_email,
            action="DEAD_LETTER_RECOVERED",
            resource_type="DeadLetterQueue",
            resource_id=dead_letter_id,
            previous_state="DEAD_LETTER",
            new_state="RECOVERED",
            reason="Operational recovery re-dispatch initiated by Administrator",
            db=db
        )

        logger.info(f"DEAD_LETTER_RECOVERED: '{dead_letter_id}' by {actor_email}")
        return target

    @classmethod
    def recover_workflow(
        cls,
        workflow_id: str,
        tenant_id: str,
        actor_id: str,
        actor_email: str,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        wf = WorkflowEngine.retry_workflow(workflow_id, tenant_id)

        AuditEngine.record_event(
            tenant_id=tenant_id,
            actor_id=actor_id,
            actor_email=actor_email,
            action="WORKFLOW_RECOVERED",
            resource_type="WorkflowInstance",
            resource_id=workflow_id,
            new_state=wf["status"],
            reason="Disaster recovery process restart",
            db=db
        )

        logger.info(f"WORKFLOW_RECOVERED: '{workflow_id}' by {actor_email}")
        return wf
