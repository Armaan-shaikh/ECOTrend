import uuid
from sqlalchemy import Column, String, Float, DateTime, Integer, Text, Boolean, Index, func
from app.core.database import Base

class DecisionRecommendationLog(Base):
    __tablename__ = "decision_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String(64), nullable=False, index=True)
    domain = Column(String(32), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    priority_tier = Column(String(32), nullable=False, default="MEDIUM", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    priority_score = Column(Float, nullable=False, default=50.0)
    status = Column(String(32), nullable=False, default="ACTIVE", index=True) # ACTIVE, ACKNOWLEDGED, RESOLVED, EXPIRED
    severity = Column(String(32), nullable=False, default="WARNING")
    confidence = Column(Float, nullable=False, default=0.85)
    provenance = Column(String(64), nullable=False, default="DECISION_SUPPORT")
    rationale = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_decision_loc_status_tier", "location_id", "status", "priority_tier"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "domain": self.domain,
            "title": self.title,
            "priority_tier": self.priority_tier,
            "priority_score": self.priority_score,
            "status": self.status,
            "severity": self.severity,
            "confidence": self.confidence,
            "provenance": self.provenance,
            "rationale": self.rationale,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }
