from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class MeasurementBase(BaseModel):
    location_id: str
    domain: str = "air"
    metric: str = Field(..., description="PM2.5, PM10, NO2, SO2, CO, O3, AQI")
    value: float
    unit: str = "µg/m³"
    timestamp: datetime
    source: str
    data_quality: str = Field(default="VALID", description="VALID, SUSPECT, INVALID")
    raw_value: Optional[float] = None

class MeasurementCreate(MeasurementBase):
    id: Optional[str] = None

class MeasurementResponse(MeasurementBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class DataQualityLogResponse(BaseModel):
    id: str
    location_id: Optional[str] = None
    metric: str
    timestamp: datetime
    rule_triggered: str
    original_value: Optional[float] = None
    action_taken: str
    details: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
