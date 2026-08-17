import uuid
from sqlalchemy import Column, String, Float, DateTime, Integer, Text, Boolean, Index, func
from app.core.database import Base

class IngestionJobLog(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(64), nullable=False, index=True)
    domain = Column(String(32), nullable=False, index=True)
    location_id = Column(String(64), nullable=True, index=True)
    status = Column(String(32), nullable=False, default="QUEUED", index=True) # QUEUED, RUNNING, SUCCESS, PARTIAL, FAILED
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    records_fetched = Column(Integer, nullable=False, default=0)
    records_valid = Column(Integer, nullable=False, default=0)
    records_rejected = Column(Integer, nullable=False, default=0)
    error_count = Column(Integer, nullable=False, default=0)
    duration_ms = Column(Float, nullable=True)
    provenance = Column(String(64), nullable=False, default="MEASURED")
    error_details = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_ingestion_source_status_time", "source", "status", "started_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "domain": self.domain,
            "location_id": self.location_id,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "records_fetched": self.records_fetched,
            "records_valid": self.records_valid,
            "records_rejected": self.records_rejected,
            "error_count": self.error_count,
            "duration_ms": self.duration_ms,
            "provenance": self.provenance,
            "error_details": self.error_details
        }


class SourceHealthLog(Base):
    __tablename__ = "source_health"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(64), nullable=False, unique=True, index=True)
    domain = Column(String(32), nullable=False)
    status = Column(String(32), nullable=False, default="HEALTHY", index=True) # HEALTHY, DEGRADED, STALE, FAILED, DISABLED
    last_successful_ingestion = Column(DateTime(timezone=True), nullable=True)
    last_attempted_ingestion = Column(DateTime(timezone=True), nullable=True)
    consecutive_failures = Column(Integer, nullable=False, default=0)
    latency_ms = Column(Float, nullable=True)
    record_volume_24h = Column(Integer, nullable=False, default=0)
    rejection_rate_percent = Column(Float, nullable=False, default=0.0)
    stale_data_duration_hours = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "domain": self.domain,
            "status": self.status,
            "last_successful_ingestion": self.last_successful_ingestion.isoformat() if self.last_successful_ingestion else None,
            "last_attempted_ingestion": self.last_attempted_ingestion.isoformat() if self.last_attempted_ingestion else None,
            "consecutive_failures": self.consecutive_failures,
            "latency_ms": self.latency_ms,
            "record_volume_24h": self.record_volume_24h,
            "rejection_rate_percent": self.rejection_rate_percent,
            "stale_data_duration_hours": self.stale_data_duration_hours,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class OperationalAlertLog(Base):
    __tablename__ = "operational_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(64), nullable=False, index=True)
    domain = Column(String(32), nullable=False, index=True)
    severity = Column(String(32), nullable=False, default="WARNING", index=True) # CRITICAL, WARNING, ADVISORY
    condition = Column(String(128), nullable=False)
    observed_value = Column(String(128), nullable=False)
    expected_condition = Column(String(128), nullable=False)
    status = Column(String(32), nullable=False, default="OPEN", index=True) # OPEN, ACKNOWLEDGED, RESOLVED
    detected_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    provenance_context = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_alert_source_status", "source", "status", "detected_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "domain": self.domain,
            "severity": self.severity,
            "condition": self.condition,
            "observed_value": self.observed_value,
            "expected_condition": self.expected_condition,
            "status": self.status,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "provenance_context": self.provenance_context
        }
