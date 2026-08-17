import uuid
from sqlalchemy import Column, String, Text, DateTime, Index, func
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    actor_id = Column(String(36), nullable=False, index=True)
    actor_email = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False, index=True)
    resource_type = Column(String(64), nullable=False, index=True)
    resource_id = Column(String(128), nullable=False)
    previous_state = Column(Text, nullable=True)
    new_state = Column(Text, nullable=True)
    correlation_id = Column(String(64), nullable=True)
    ip_address = Column(String(45), nullable=True)
    reason = Column(Text, nullable=True)
    provenance = Column(String(64), nullable=False, default="AUDIT_TRAIL")
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    __table_args__ = (
        Index("idx_audit_tenant_action_time", "tenant_id", "action", "timestamp"),
        Index("idx_audit_resource", "resource_type", "resource_id"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "actor_id": self.actor_id,
            "actor_email": self.actor_email,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "previous_state": self.previous_state,
            "new_state": self.new_state,
            "correlation_id": self.correlation_id,
            "ip_address": self.ip_address,
            "reason": self.reason,
            "provenance": self.provenance,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
