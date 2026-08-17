import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class SoilGridsCollector:
    """
    SoilGrids REST API v2.0 Adapter (ISRIC - World Soil Information):
    Queries global 250m resolution spatial grid predictions for SOC (Soil Organic Carbon) and pH.
    Explicitly tags all observations as data_type = "MODELED_ESTIMATE".
    """

    BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"

    async def fetch_soil_properties(
        self,
        latitude: float,
        longitude: float,
        location_id: str = "loc_soil_sample"
    ) -> List[Dict[str, Any]]:
        params = {
            "lat": latitude,
            "lon": longitude,
            "property": ["soc", "phh2o"],
            "depth": ["0-5cm", "5-15cm"],
            "value": "mean"
        }

        measurements = []
        now_iso = datetime.now(timezone.utc).isoformat()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(self.BASE_URL, params=params)
                if res.status_code == 200:
                    data = res.json()
                    layers = data.get("properties", {}).get("layers", [])

                    for layer in layers:
                        prop_name = layer.get("name")
                        unit_code = layer.get("unit_measure", {}).get("target_units", "")
                        depths = layer.get("depths", [])

                        if not depths:
                            continue

                        # Extract mean value at topsoil (0-5cm)
                        top_depth = depths[0]
                        mean_val = top_depth.get("values", {}).get("mean")

                        if mean_val is None:
                            continue

                        if prop_name == "soc":
                            # SoilGrids soc mean is in dg/kg or g/kg (e.g. 240 dg/kg = 24.0 g/kg = 2.4%)
                            # Unit normalization to %: val / 100 if dg/kg, or val / 10 if g/kg
                            soc_pct = round(mean_val / 100.0 if "dg/kg" in unit_code else mean_val / 10.0, 2)
                            measurements.append({
                                "id": f"meas_soilgrids_{location_id}_SOC_{int(datetime.now(timezone.utc).timestamp())}",
                                "location_id": location_id,
                                "domain": "soil",
                                "metric": "SOC",
                                "value": soc_pct,
                                "unit": "%",
                                "timestamp": now_iso,
                                "source": "SoilGrids_v2.0",
                                "data_type": "MODELED_ESTIMATE",
                                "spatial_resolution": "250m Grid Cell",
                                "original_metric": "soc",
                                "original_unit": unit_code or "dg/kg",
                                "data_quality": "VALID"
                            })

                        elif prop_name == "phh2o":
                            # SoilGrids phh2o mean is pH * 10 (e.g. 68 = pH 6.8)
                            ph_val = round(mean_val / 10.0, 2)
                            measurements.append({
                                "id": f"meas_soilgrids_{location_id}_pH_{int(datetime.now(timezone.utc).timestamp())}",
                                "location_id": location_id,
                                "domain": "soil",
                                "metric": "pH",
                                "value": ph_val,
                                "unit": "dimensionless",
                                "timestamp": now_iso,
                                "source": "SoilGrids_v2.0",
                                "data_type": "MODELED_ESTIMATE",
                                "spatial_resolution": "250m Grid Cell",
                                "original_metric": "phh2o",
                                "original_unit": "pH*10",
                                "data_quality": "VALID"
                            })

        except Exception:
            # Network or API offline error handling
            pass

        return measurements
