from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class LocationBase(BaseModel):
    id: str
    name: str
    level: str = Field(..., description="COUNTRY, STATE, CITY, STATION")
    parent_id: Optional[str] = None
    country_code: Optional[str] = None
    latitude: float
    longitude: float

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    created_at: Optional[datetime] = None
    children_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class LocationTreeItem(LocationResponse):
    children: List['LocationTreeItem'] = []

LocationTreeItem.model_rebuild()
