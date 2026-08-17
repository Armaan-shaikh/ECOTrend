import logging
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.data_sources.base import BaseCollector

logger = logging.getLogger(__name__)

class OpenMeteoAirCollector(BaseCollector):
    def __init__(self):
        super().__init__(source_name="OpenMeteo_Air", domain="air")
        self.base_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    async def fetch_measurements(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime,
        location_id: str
    ) -> List[Dict[str, Any]]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi",
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "timezone": "UTC"
        }
        
        measurements = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    hourly = data.get("hourly", {})
                    times = hourly.get("time", [])
                    
                    param_map = {
                        "pm2_5": ("PM2.5", "µg/m³"),
                        "pm10": ("PM10", "µg/m³"),
                        "nitrogen_dioxide": ("NO2", "µg/m³"),
                        "sulphur_dioxide": ("SO2", "µg/m³"),
                        "carbon_monoxide": ("CO", "µg/m³"),
                        "ozone": ("O3", "µg/m³"),
                        "us_aqi": ("AQI", "index")
                    }

                    for idx, time_str in enumerate(times):
                        dt = datetime.fromisoformat(time_str).replace(tzinfo=timezone.utc)
                        for key, (metric_name, unit) in param_map.items():
                            values = hourly.get(key, [])
                            if idx < len(values) and values[idx] is not None:
                                val = float(values[idx])
                                measurements.append({
                                    "location_id": location_id,
                                    "domain": "air",
                                    "metric": metric_name,
                                    "value": val,
                                    "raw_value": val,
                                    "unit": unit,
                                    "timestamp": dt,
                                    "source": self.source_name
                                })
        except Exception as e:
            logger.warning(f"Open-Meteo Air API request failed: {e}")

        return measurements
