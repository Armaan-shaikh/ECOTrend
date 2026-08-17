import logging
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.data_sources.base import BaseCollector

logger = logging.getLogger(__name__)

class OpenAQAirCollector(BaseCollector):
    def __init__(self):
        super().__init__(source_name="OpenAQ_v2", domain="air")
        self.base_url = "https://api.openaq.org/v2/measurements"

    async def fetch_measurements(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime,
        location_id: str
    ) -> List[Dict[str, Any]]:
        params = {
            "coordinates": f"{latitude},{longitude}",
            "radius": 25000, # 25km radius
            "date_from": start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "date_to": end_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "limit": 1000,
            "page": 1
        }
        
        measurements = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    for item in results:
                        parameter = item.get("parameter", "").upper()
                        # Map parameters
                        if parameter in ["PM25", "PM2.5"]:
                            metric = "PM2.5"
                        elif parameter in ["PM10"]:
                            metric = "PM10"
                        elif parameter in ["NO2"]:
                            metric = "NO2"
                        elif parameter in ["SO2"]:
                            metric = "SO2"
                        elif parameter in ["CO"]:
                            metric = "CO"
                        elif parameter in ["O3"]:
                            metric = "O3"
                        else:
                            continue

                        val = item.get("value")
                        unit = item.get("unit", "µg/m³")
                        dt_utc = item.get("date", {}).get("utc")
                        if dt_utc and val is not None:
                            dt = datetime.fromisoformat(dt_utc.replace("Z", "+00:00"))
                            measurements.append({
                                "location_id": location_id,
                                "domain": "air",
                                "metric": metric,
                                "value": float(val),
                                "raw_value": float(val),
                                "unit": unit,
                                "timestamp": dt,
                                "source": self.source_name
                            })
        except Exception as e:
            logger.warning(f"OpenAQ API request failed or timed out: {e}")
        
        return measurements
