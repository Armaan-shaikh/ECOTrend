import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any

class OpenMeteoClimateCollector:
    """
    Open-Meteo Historical Climate Archive API Adapter (ECMWF ERA5 Reanalysis):
    Queries live daily temperature, precipitation, wind speed, relative humidity, and derived heat index.
    Explicitly tags all observations as data_type = "REANALYSIS".
    """

    BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

    async def fetch_climate_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str = "2026-08-01",
        end_date: str = "2026-08-07",
        location_id: str = "loc_climate_station"
    ) -> List[Dict[str, Any]]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": [
                "temperature_2m_mean",
                "apparent_temperature_mean",
                "precipitation_sum",
                "wind_speed_10m_max"
            ],
            "timezone": "UTC"
        }

        measurements = []
        now_iso = datetime.now(timezone.utc).isoformat()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(self.BASE_URL, params=params)
                if res.status_code == 200:
                    data = res.json()
                    daily = data.get("daily", {})
                    times = daily.get("time", [])

                    t_means = daily.get("temperature_2m_mean", [])
                    app_temps = daily.get("apparent_temperature_mean", [])
                    precips = daily.get("precipitation_sum", [])
                    winds_kmh = daily.get("wind_speed_10m_max", [])

                    for i, t_str in enumerate(times):
                        iso_ts = f"{t_str}T00:00:00Z"

                        # 1. Air Temperature (T2M)
                        if i < len(t_means) and t_means[i] is not None:
                            measurements.append({
                                "id": f"meas_openmeteo_{location_id}_T2M_{t_str}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "T2M",
                                "value": round(float(t_means[i]), 2),
                                "unit": "°C",
                                "timestamp": iso_ts,
                                "source": "Open-Meteo_ERA5",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.25° Grid Cell",
                                "original_metric": "temperature_2m_mean",
                                "original_unit": "°C",
                                "data_quality": "VALID"
                            })

                        # 2. Apparent Temperature (Heat Index - DERIVED)
                        if i < len(app_temps) and app_temps[i] is not None:
                            measurements.append({
                                "id": f"meas_openmeteo_{location_id}_APPARENT_TEMP_{t_str}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "APPARENT_TEMP",
                                "value": round(float(app_temps[i]), 2),
                                "unit": "°C",
                                "timestamp": iso_ts,
                                "source": "Open-Meteo_ERA5",
                                "data_type": "DERIVED",
                                "spatial_resolution": "0.25° Grid Cell",
                                "original_metric": "apparent_temperature_mean",
                                "original_unit": "°C",
                                "data_quality": "VALID"
                            })

                        # 3. Precipitation (PRECIP)
                        if i < len(precips) and precips[i] is not None:
                            measurements.append({
                                "id": f"meas_openmeteo_{location_id}_PRECIP_{t_str}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "PRECIP",
                                "value": round(max(0.0, float(precips[i])), 2),
                                "unit": "mm",
                                "timestamp": iso_ts,
                                "source": "Open-Meteo_ERA5",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.25° Grid Cell",
                                "original_metric": "precipitation_sum",
                                "original_unit": "mm",
                                "data_quality": "VALID"
                            })

                        # 4. Wind Speed (WS10M) - Convert km/h to m/s (div 3.6)
                        if i < len(winds_kmh) and winds_kmh[i] is not None:
                            ws_ms = float(winds_kmh[i]) / 3.6
                            measurements.append({
                                "id": f"meas_openmeteo_{location_id}_WS10M_{t_str}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "WS10M",
                                "value": round(max(0.0, ws_ms), 2),
                                "unit": "m/s",
                                "timestamp": iso_ts,
                                "source": "Open-Meteo_ERA5",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.25° Grid Cell",
                                "original_metric": "wind_speed_10m_max",
                                "original_unit": "km/h",
                                "data_quality": "VALID"
                            })

        except Exception:
            pass

        return measurements
