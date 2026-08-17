from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class IngestionJobResponse(BaseModel):
    id: str
    source: str
    domain: str
    location_id: Optional[str] = None
    status: str # QUEUED, RUNNING, SUCCESS, PARTIAL, FAILED
    started_at: str
    completed_at: Optional[str] = None
    records_fetched: int = 0
    records_valid: int = 0
    records_rejected: int = 0
    error_count: int = 0
    duration_ms: Optional[float] = None
    provenance: str = "MEASURED"
    error_details: Optional[str] = None

class SourceHealthResponse(BaseModel):
    id: Optional[str] = None
    source: str
    domain: str
    status: str # HEALTHY, DEGRADED, STALE, FAILED, DISABLED
    last_successful_ingestion: Optional[str] = None
    last_attempted_ingestion: Optional[str] = None
    consecutive_failures: int = 0
    latency_ms: Optional[float] = None
    record_volume_24h: int = 0
    rejection_rate_percent: float = 0.0
    stale_data_duration_hours: float = 0.0
    updated_at: Optional[str] = None

class OperationalAlertResponse(BaseModel):
    id: str
    source: str
    domain: str
    severity: str # CRITICAL, WARNING, ADVISORY
    condition: str
    observed_value: str
    expected_condition: str
    status: str # OPEN, ACKNOWLEDGED, RESOLVED
    detected_at: str
    resolved_at: Optional[str] = None
    provenance_context: Optional[str] = None

class ObservabilityMetricsResponse(BaseModel):
    system_status: str
    database_status: str
    redis_status: str
    total_ingestion_jobs_24h: int
    successful_jobs_24h: int
    failed_jobs_24h: int
    active_alerts_count: int
    healthy_sources_count: int
    total_sources_count: int

class ObservabilityOverviewResponse(BaseModel):
    system_health: str
    infrastructure_health: Dict[str, str]
    sources_summary: Dict[str, int]
    active_alerts: List[OperationalAlertResponse]
    recent_jobs: List[IngestionJobResponse]
    all_sources: List[SourceHealthResponse]
