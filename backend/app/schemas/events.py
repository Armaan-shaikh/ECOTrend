from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class DomainEventSchema(BaseModel):
    event_id: str
    event_type: str
    tenant_id: str
    source: str
    resource_type: str
    resource_id: str
    timestamp: str
    correlation_id: str
    causation_id: Optional[str] = None
    provenance: str = "EVENT_BUS"
    schema_version: str = "1.0"
    payload: Dict[str, Any]
