import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any

class NASAPowerCollector:
    """
    NASA POWER Meteorology REST API Adapter:
    Queries live point grid daily meteorology for T2M, RH2M, PRECTOTCORR, WS10M, and ALLSKY_SFC_SW_DWN.
    Explicitly tags all observations as data_type = "REANALYSIS".
    """

    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

    async def fetch_meteorology(
        self,
        latitude: float,
        longitude: float,
        start_date: str = "20240101",
        end_date: str = "20240107",
        location_id: str = "loc_climate_station"
    ) -> List[Dict[str, Any]]:
        params = {
            "parameters": "T2M,RH2M,PRECTOTCORR,WS10M,ALLSKY_SFC_SW_DWN",
            "community": "RE",
            "longitude": longitude,
            "latitude": latitude,
            "start": start_date,
            "end": end_date,
            "format": "JSON"
        }

        measurements = []

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.get(self.BASE_URL, params=params)
                if res.status_code == 200:
                    data = res.json()
                    params_dict = data.get("properties", {}).get("parameter", {})

                    t2m_dict = params_dict.get("T2M", {})
                    rh2m_dict = params_dict.get("RH2M", {})
                    precip_dict = params_dict.get("PRECTOTCORR", {})
                    ws10m_dict = params_dict.get("WS10M", {})
                    sw_dict = params_dict.get("ALLSKY_SFC_SW_DWN", {})

                    for date_key in t2m_dict.keys():
                        # Parse date YYYYMMDD
                        formatted_date = f"{date_key[:4]}-{date_key[4:6]}-{date_key[6:8]}"
                        iso_ts = f"{formatted_date}T00:00:00Z"

                        # T2M
                        if date_key in t2m_dict and t2m_dict[date_key] != -999.0:
                            measurements.append({
                                "id": f"meas_nasa_{location_id}_T2M_{date_key}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "T2M",
                                "value": round(float(t2m_dict[date_key]), 2),
                                "unit": "°C",
                                "timestamp": iso_ts,
                                "source": "NASA_POWER",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.5° Grid Cell",
                                "original_metric": "T2M",
                                "original_unit": "°C",
                                "data_quality": "VALID"
                            })

                        # RH2M
                        if date_key in rh2m_dict and rh2m_dict[date_key] != -999.0:
                            measurements.append({
                                "id": f"meas_nasa_{location_id}_RH2M_{date_key}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "RH2M",
                                "value": round(float(rh2m_dict[date_key]), 2),
                                "unit": "%",
                                "timestamp": iso_ts,
                                "source": "NASA_POWER",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.5° Grid Cell",
                                "original_metric": "RH2M",
                                "original_unit": "%",
                                "data_quality": "VALID"
                            })

                        # PRECTOTCORR
                        if date_key in precip_dict and precip_dict[date_key] != -999.0:
                            measurements.append({
                                "id": f"meas_nasa_{location_id}_PRECIP_{date_key}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "PRECIP",
                                "value": round(max(0.0, float(precip_dict[date_key])), 2),
                                "unit": "mm",
                                "timestamp": iso_ts,
                                "source": "NASA_POWER",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.5° Grid Cell",
                                "original_metric": "PRECTOTCORR",
                                "original_unit": "mm/day",
                                "data_quality": "VALID"
                            })

                        # WS10M
                        if date_key in ws10m_dict and ws10m_dict[date_key] != -999.0:
                            measurements.append({
                                "id": f"meas_nasa_{location_id}_WS10M_{date_key}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "WS10M",
                                "value": round(max(0.0, float(ws10m_dict[date_key])), 2),
                                "unit": "m/s",
                                "timestamp": iso_ts,
                                "source": "NASA_POWER",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.5° Grid Cell",
                                "original_metric": "WS10M",
                                "original_unit": "m/s",
                                "data_quality": "VALID"
                            })

                        # ALLSKY_SFC_SW_DWN (Convert MJ/m2/day or kW-hr/m2/day to W/m2: val * 41.67)
                        if date_key in sw_dict and sw_dict[date_key] != -999.0:
                            sw_wm2 = float(sw_dict[date_key]) * 41.67
                            measurements.append({
                                "id": f"meas_nasa_{location_id}_SW_DWN_{date_key}",
                                "location_id": location_id,
                                "domain": "climate",
                                "metric": "SW_DWN",
                                "value": round(max(0.0, sw_wm2), 2),
                                "unit": "W/m²",
                                "timestamp": iso_ts,
                                "source": "NASA_POWER",
                                "data_type": "REANALYSIS",
                                "spatial_resolution": "0.5° Grid Cell",
                                "original_metric": "ALLSKY_SFC_SW_DWN",
                                "original_unit": "kW-hr/m^2/day",
                                "data_quality": "VALID"
                            })

        except Exception:
            pass

        return measurements
