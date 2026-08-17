import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any

class NYCNoiseIncidentsCollector:
    """
    NYC OpenData Ambient Noise Incidents REST API Adapter:
    Queries live geocoded 311 ambient noise disturbance complaints (erm2-nwe9).
    Calculates measured daily noise incident counts for target spatial coordinates.
    Explicitly tags all observations as data_type = "MEASURED" and domain = "noise".
    """

    BASE_URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"

    async def fetch_noise_incidents(
        self,
        latitude: float = 40.7831,
        longitude: float = -73.9712,
        radius_km: float = 2.0,
        days: int = 14,
        location_id: str = "loc_us_ny_nyc_manhattan_noise"
    ) -> List[Dict[str, Any]]:
        # Fetch complaints containing Noise
        params = {
            "$limit": 500,
            "$where": "complaint_type LIKE '%Noise%' AND latitude IS NOT NULL AND longitude IS NOT NULL",
            "$order": "created_date DESC"
        }

        measurements = []
        counts_by_date: Dict[str, int] = {}

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                res = await client.get(self.BASE_URL, params=params)
                if res.status_code == 200:
                    records = res.json()
                    for rec in records:
                        try:
                            rec_lat = float(rec.get("latitude", 0.0))
                            rec_lon = float(rec.get("longitude", 0.0))
                            c_date = rec.get("created_date", "")

                            if rec_lat != 0.0 and rec_lon != 0.0 and c_date:
                                # Distance check approximate (bounding box ~0.05 deg ~ 5km)
                                if abs(rec_lat - latitude) <= 0.05 and abs(rec_lon - longitude) <= 0.05:
                                    date_str = c_date.split("T")[0]
                                    counts_by_date[date_str] = counts_by_date.get(date_str, 0) + 1
                        except (ValueError, TypeError):
                            continue

                    # Create daily NOISE_INCIDENTS measurements
                    for d_str, count in sorted(counts_by_date.items(), reverse=True):
                        iso_ts = f"{d_str}T00:00:00Z"
                        measurements.append({
                            "id": f"meas_nyc_noise_{location_id}_{d_str}",
                            "location_id": location_id,
                            "domain": "noise",
                            "metric": "NOISE_INCIDENTS",
                            "value": float(count),
                            "unit": "incidents/day",
                            "timestamp": iso_ts,
                            "source": "NYC_OpenData_311",
                            "data_type": "MEASURED",
                            "spatial_resolution": "Point Geocoded Incident",
                            "original_metric": "311_Noise_Complaint_Count",
                            "original_unit": "complaints",
                            "data_quality": "VALID"
                        })

        except Exception:
            pass

        return measurements
