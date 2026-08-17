import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, Index, func
from app.core.database import Base

class WorkflowInstanceLog(Base):
    __tablename__ = "workflow_instances"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    workflow_type = Column(String(64), nullable=False, index=True) # INGESTION_PIPELINE, COMPLIANCE_EVALUATION, PREDICTIVE_ANALYSIS
    status = Column(String(32), nullable=False, default="PENDING", index=True) # PENDING, RUNNING, COMPLETED, FAILED, DEAD_LETTER, CANCELLED
    current_step = Column(String(64), nullable=False, default="INIT")
    retry_count = Column(Integer, nullable=False, default=0)
    max_retries = Column(Integer, nullable=False, default=3)
    correlation_id = Column(String(64), nullable=True, index=True)
    error_message = Column(Text, nullable=True)
    provenance = Column(String(64), nullable=False, default="WORKFLOW_ENGINE")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_wf_tenant_status_type", "tenant_id", "status", "workflow_type"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "workflow_type": self.workflow_type,
            "status": self.status,
            "current_step": self.current_step,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "correlation_id": self.correlation_id,
            "error_message": self.error_message,
            "provenance": self.provenance,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
