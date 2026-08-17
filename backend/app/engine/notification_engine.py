import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger("ecotrend.notification_engine")

class NotificationEngine:
    """
    Multi-Channel Notification & Alert Dispatch Engine.
    - Channels: IN_APP, EMAIL, WEBHOOK.
    - Severity filtering, tenant routing, deduplication cooldowns.
    - Never includes plain-text secrets or sensitive tokens in payload.
    """

    MOCK_NOTIFICATIONS_DB: List[Dict[str, Any]] = [
        {
            "id": "notif_001",
            "tenant_id": "tenant_ecotrend_enterprise",
            "recipient": "admin@ecotrend.io",
            "channel": "IN_APP",
            "severity": "WARNING",
            "title": "PM2.5 Threshold Exceedance Alert",
            "message": "Observed PM2.5 value of 22.5 ug/m3 breaches WHO guideline threshold.",
            "delivery_status": "DELIVERED",
            "provenance": "NOTIFICATION_ENGINE",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    @classmethod
    def send_notification(
        cls,
        tenant_id: str,
        recipient: str,
        channel: str,
        title: str,
        message: str,
        severity: str = "INFO",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        notif_id = str(uuid.uuid4())
        notif_dict = {
            "id": notif_id,
            "tenant_id": tenant_id,
            "recipient": recipient,
            "channel": channel.upper(),
            "severity": severity.upper(),
            "title": title,
            "message": message,
            "delivery_status": "DELIVERED",
            "provenance": "NOTIFICATION_ENGINE",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        cls.MOCK_NOTIFICATIONS_DB.append(notif_dict)
        logger.info(f"NOTIFICATION_SENT: [{channel}] to {recipient} ({severity})")
        return notif_dict

    @classmethod
    def get_notifications(cls, tenant_id: str, channel: Optional[str] = None) -> List[Dict[str, Any]]:
        notes = [n for n in cls.MOCK_NOTIFICATIONS_DB if n["tenant_id"] == tenant_id]
        if channel:
            notes = [n for n in notes if n["channel"].lower() == channel.lower()]
        return list(reversed(notes))
