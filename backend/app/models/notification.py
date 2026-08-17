import uuid
from sqlalchemy import Column, String, Boolean, Text, DateTime, Index, func
from app.core.database import Base

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    recipient = Column(String(128), nullable=False)
    channel = Column(String(32), nullable=False) # IN_APP, EMAIL, WEBHOOK
    severity = Column(String(32), nullable=False, default="INFO")
    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    delivery_status = Column(String(32), nullable=False, default="DELIVERED", index=True) # DELIVERED, PENDING, FAILED
    provenance = Column(String(64), nullable=False, default="NOTIFICATION_ENGINE")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_notif_tenant_status", "tenant_id", "delivery_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "recipient": self.recipient,
            "channel": self.channel,
            "severity": self.severity,
            "title": self.title,
            "message": self.message,
            "delivery_status": self.delivery_status,
            "provenance": self.provenance,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    target_url = Column(String(256), nullable=False)
    secret_token = Column(String(128), nullable=False) # Hashed/encrypted secret
    events_filter = Column(Text, nullable=False, default="*") # JSON list or wildcard
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "target_url": self.target_url,
            "events_filter": self.events_filter,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
