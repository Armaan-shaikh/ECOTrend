import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class EnvironmentalMeasurement(Base):
    __tablename__ = "environmental_measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String(64), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    domain = Column(String(32), nullable=False, default="air")
    metric = Column(String(32), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    timestamp = Column(DateTime(timezone=True), primary_key=True, nullable=False, index=True)
    source = Column(String(64), nullable=False)
    data_quality = Column(String(32), nullable=False, default="VALID", index=True)
    raw_value = Column(Float, nullable=True)

    __table_args__ = (
        Index("idx_meas_domain_loc_time", "domain", "location_id", "timestamp"),
        Index("idx_meas_domain_metric_time", "domain", "metric", "timestamp"),
    )

    location = relationship("Location", back_populates="measurements")

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "domain": self.domain,
            "metric": self.metric,
            "value": self.value,
            "unit": self.unit,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "source": self.source,
            "data_quality": self.data_quality,
            "raw_value": self.raw_value,
        }

class DataQualityLog(Base):
    __tablename__ = "data_quality_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String(64), ForeignKey("locations.id"), nullable=True)
    metric = Column(String(32), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    rule_triggered = Column(String(128), nullable=False)
    original_value = Column(Float, nullable=True)
    action_taken = Column(String(64), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "metric": self.metric,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "rule_triggered": self.rule_triggered,
            "original_value": self.original_value,
            "action_taken": self.action_taken,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
