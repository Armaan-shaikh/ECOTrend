import uuid
from sqlalchemy import Column, String, Float, Text, DateTime, Index, func
from app.core.database import Base

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    submitter_id = Column(String(36), nullable=False, index=True)
    approver_id = Column(String(36), nullable=True, index=True)
    intervention_id = Column(String(64), nullable=False)
    title = Column(String(128), nullable=False)
    domain = Column(String(32), nullable=False)
    status = Column(String(32), nullable=False, default="SUBMITTED", index=True) # DRAFT, SUBMITTED, APPROVED, REJECTED, EXECUTED, CANCELLED
    estimated_cepi_improvement = Column(Float, nullable=False, default=0.0)
    reason = Column(Text, nullable=False)
    decision_reason = Column(Text, nullable=True)
    provenance = Column(String(64), nullable=False, default="APPROVAL_WORKFLOW")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_approval_tenant_status", "tenant_id", "status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "submitter_id": self.submitter_id,
            "approver_id": self.approver_id,
            "intervention_id": self.intervention_id,
            "title": self.title,
            "domain": self.domain,
            "status": self.status,
            "estimated_cepi_improvement": self.estimated_cepi_improvement,
            "reason": self.reason,
            "decision_reason": self.decision_reason,
            "provenance": self.provenance,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
