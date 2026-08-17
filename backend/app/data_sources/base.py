from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class BaseCollector(ABC):
    """
    Abstract Base Class for isolated data collectors.
    Every external source MUST implement its own isolated collector module to prevent cascade failures.
    """
    def __init__(self, source_name: str, domain: str):
        self.source_name = source_name
        self.domain = domain

    @abstractmethod
    async def fetch_measurements(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime,
        location_id: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch raw measurement dictionaries from external API or seed source.
        Must return list of dicts with keys: location_id, domain, metric, value, unit, timestamp, source, raw_value
        """
        pass
