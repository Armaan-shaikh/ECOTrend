import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Callable, Optional, Set
from app.schemas.events import DomainEventSchema

logger = logging.getLogger("ecotrend.event_bus")

class EventBus:
    """
    Durable In-Memory Domain Event Bus.
    - Idempotent event publishing & handler dispatching.
    - Suppresses duplicate events using idempotency keys (event_id + handler_name).
    - Immutable event logging.
    """

    _subscribers: Dict[str, List[Callable[[Dict[str, Any]], None]]] = {}
    _processed_keys: Set[str] = set()
    _event_log: List[Dict[str, Any]] = []

    @classmethod
    def subscribe(cls, event_type: str, handler: Callable[[Dict[str, Any]], None]):
        if event_type not in cls._subscribers:
            cls._subscribers[event_type] = []
        cls._subscribers[event_type].append(handler)

    @classmethod
    def publish(cls, event: Dict[str, Any]) -> bool:
        event_id = event.get("event_id") or str(uuid.uuid4())
        event_type = event.get("event_type", "UNKNOWN")
        tenant_id = event.get("tenant_id", "tenant_ecotrend_enterprise")

        # Ensure complete event metadata
        full_event = {
            "event_id": event_id,
            "event_type": event_type,
            "tenant_id": tenant_id,
            "source": event.get("source", "system"),
            "resource_type": event.get("resource_type", "resource"),
            "resource_id": event.get("resource_id", "id_001"),
            "timestamp": event.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "correlation_id": event.get("correlation_id") or f"corr_{uuid.uuid4().hex[:8]}",
            "causation_id": event.get("causation_id"),
            "provenance": event.get("provenance", "EVENT_BUS"),
            "schema_version": "1.0",
            "payload": event.get("payload", {})
        }

        cls._event_log.append(full_event)
        logger.info(f"EVENT_PUBLISHED: [{event_type}] ({event_id}) for Tenant: {tenant_id}")

        handlers = cls._subscribers.get(event_type, [])
        for handler in handlers:
            handler_name = getattr(handler, "__name__", "func")
            idempotency_key = f"{event_id}:{handler_name}"

            if idempotency_key in cls._processed_keys:
                logger.debug(f"Event {event_id} already processed by {handler_name}, skipping.")
                continue

            try:
                handler(full_event)
                cls._processed_keys.add(idempotency_key)
            except Exception as e:
                logger.error(f"Error handling event {event_id} in {handler_name}: {e}")

        return True

    @classmethod
    def get_events(cls, tenant_id: Optional[str] = None, event_type: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        evts = cls._event_log
        if tenant_id:
            evts = [e for e in evts if e["tenant_id"] == tenant_id]
        if event_type:
            evts = [e for e in evts if e["event_type"].lower() == event_type.lower()]
        return list(reversed(evts))[:limit]

    @classmethod
    def clear_for_testing(cls):
        cls._event_log = []
        cls._processed_keys = set()
