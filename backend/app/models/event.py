import uuid
from sqlalchemy import Column, String, Text, DateTime, Index, func
from app.core.database import Base

class DomainEventLog(Base):
    __tablename__ = "domain_event_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(64), nullable=False, unique=True, index=True)
    event_type = Column(String(64), nullable=False, index=True)
    tenant_id = Column(String(36), nullable=False, index=True)
    source = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(128), nullable=False)
    correlation_id = Column(String(64), nullable=True, index=True)
    causation_id = Column(String(64), nullable=True)
    payload_json = Column(Text, nullable=False)
    provenance = Column(String(64), nullable=False, default="EVENT_BUS")
    schema_version = Column(String(16), nullable=False, default="1.0")
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    __table_args__ = (
        Index("idx_event_tenant_type_time", "tenant_id", "event_type", "timestamp"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "event_type": self.event_type,
            "tenant_id": self.tenant_id,
            "source": self.source,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "correlation_id": self.correlation_id,
            "causation_id": self.causation_id,
            "provenance": self.provenance,
            "schema_version": self.schema_version,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
