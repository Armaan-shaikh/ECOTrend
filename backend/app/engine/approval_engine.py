import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.engine.audit_engine import AuditEngine
from app.models.approval import ApprovalRequest

logger = logging.getLogger("ecotrend.approval_engine")

class ApprovalEngine:
    """
    Controlled Intervention Approval Workflow Engine.
    - Lifecycle: DRAFT -> SUBMITTED -> APPROVED / REJECTED -> EXECUTED / CANCELLED.
    - Enforces Separation of Duties: Submitter cannot approve their own request.
    - Guarantees human approval requirement prior to intervention execution.
    - Records immutable audit log events for every transition.
    """

    @staticmethod
    def submit_intervention_request(
        tenant_id: str,
        submitter_id: str,
        submitter_email: str,
        intervention_id: str,
        title: str,
        domain: str,
        estimated_cepi_improvement: float,
        reason: str,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        req_id = str(uuid.uuid4())
        req_dict = {
            "id": req_id,
            "tenant_id": tenant_id,
            "submitter_id": submitter_id,
            "approver_id": None,
            "intervention_id": intervention_id,
            "title": title,
            "domain": domain,
            "status": "SUBMITTED",
            "estimated_cepi_improvement": estimated_cepi_improvement,
            "reason": reason,
            "decision_reason": None,
            "provenance": "APPROVAL_WORKFLOW",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if db:
            db_req = ApprovalRequest(**req_dict)
            db.add(db_req)
            db.commit()

        # Audit Event
        AuditEngine.record_event(
            tenant_id=tenant_id,
            actor_id=submitter_id,
            actor_email=submitter_email,
            action="INTERVENTION_SUBMITTED",
            resource_type="ApprovalRequest",
            resource_id=req_id,
            new_state="SUBMITTED",
            reason=reason,
            db=db
        )

        return req_dict

    @staticmethod
    def approve_intervention_request(
        req_id: str,
        tenant_id: str,
        approver_id: str,
        approver_email: str,
        decision_reason: str,
        db: Optional[Session] = None,
        existing_req: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        req = existing_req or {}

        # Separation of Duties Rule
        if req.get("submitter_id") == approver_id:
            raise ValueError("Separation of Duties Violation: Approver cannot approve their own submission.")

        if req.get("tenant_id") != tenant_id:
            raise PermissionError("Cross-Tenant Access Violation: Cannot approve request belonging to another tenant.")

        if req.get("status") != "SUBMITTED":
            raise ValueError(f"Invalid State Transition: Cannot approve request in status '{req.get('status')}'.")

        prev_state = req.get("status")
        req["status"] = "APPROVED"
        req["approver_id"] = approver_id
        req["decision_reason"] = decision_reason
        req["updated_at"] = datetime.now(timezone.utc).isoformat()

        if db:
            db_req = db.query(ApprovalRequest).filter_by(id=req_id, tenant_id=tenant_id).first()
            if db_req:
                db_req.status = "APPROVED"
                db_req.approver_id = approver_id
                db_req.decision_reason = decision_reason
                db.commit()

        AuditEngine.record_event(
            tenant_id=tenant_id,
            actor_id=approver_id,
            actor_email=approver_email,
            action="INTERVENTION_APPROVED",
            resource_type="ApprovalRequest",
            resource_id=req_id,
            previous_state=prev_state,
            new_state="APPROVED",
            reason=decision_reason,
            db=db
        )

        return req

    @staticmethod
    def reject_intervention_request(
        req_id: str,
        tenant_id: str,
        approver_id: str,
        approver_email: str,
        decision_reason: str,
        db: Optional[Session] = None,
        existing_req: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        req = existing_req or {}

        if req.get("tenant_id") != tenant_id:
            raise PermissionError("Cross-Tenant Access Violation.")

        prev_state = req.get("status")
        req["status"] = "REJECTED"
        req["approver_id"] = approver_id
        req["decision_reason"] = decision_reason
        req["updated_at"] = datetime.now(timezone.utc).isoformat()

        if db:
            db_req = db.query(ApprovalRequest).filter_by(id=req_id, tenant_id=tenant_id).first()
            if db_req:
                db_req.status = "REJECTED"
                db_req.approver_id = approver_id
                db_req.decision_reason = decision_reason
                db.commit()

        AuditEngine.record_event(
            tenant_id=tenant_id,
            actor_id=approver_id,
            actor_email=approver_email,
            action="INTERVENTION_REJECTED",
            resource_type="ApprovalRequest",
            resource_id=req_id,
            previous_state=prev_state,
            new_state="REJECTED",
            reason=decision_reason,
            db=db
        )

        return req
