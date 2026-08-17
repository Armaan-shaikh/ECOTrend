import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any

class USGSSoilWQPCollector:
    """
    USGS Water Quality Portal (WQP) Soil & Sediment Collector:
    Queries live open REST endpoints for measured heavy metals (Pb, Cd, As, Hg, Cr) and TPH soil core assays.
    Explicitly tags all observations as data_type = "MEASURED".
    """

    BASE_URL = "https://www.waterqualitydata.us/Result/search"

    CHARACTERISTIC_MAP = {
        "lead": ("Pb", "mg/kg"),
        "cadmium": ("Cd", "mg/kg"),
        "arsenic": ("As", "mg/kg"),
        "mercury": ("Hg", "mg/kg"),
        "chromium": ("Cr", "mg/kg"),
        "total petroleum hydrocarbons": ("TPH", "mg/kg")
    }

    async def fetch_measured_soil_assays(
        self,
        latitude: float,
        longitude: float,
        location_id: str = "loc_soil_sample"
    ) -> List[Dict[str, Any]]:
        params = {
            "bBox": f"{longitude - 0.5},{latitude - 0.5},{longitude + 0.5},{latitude + 0.5}",
            "sampleMedia": ["Soil", "Sediment"],
            "mimeType": "geojson"
        }

        measurements = []
        now_iso = datetime.now(timezone.utc).isoformat()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(self.BASE_URL, params=params)
                if res.status_code == 200:
                    geojson = res.json()
                    features = geojson.get("features", [])

                    for f in features:
                        props = f.get("properties", {})
                        char_name = str(props.get("CharacteristicName", "")).lower()
                        val_raw = props.get("ResultMeasureValue")
                        unit_raw = props.get("ResultMeasure/MeasureUnitCode", "mg/kg")

                        if val_raw is None:
                            continue

                        try:
                            val = float(val_raw)
                        except ValueError:
                            continue

                        # Map characteristic
                        mapped = None
                        for key, (m_code, std_unit) in self.CHARACTERISTIC_MAP.items():
                            if key in char_name:
                                mapped = (m_code, std_unit)
                                break

                        if mapped:
                            metric_code, std_unit = mapped
                            measurements.append({
                                "id": f"meas_usgs_soil_{location_id}_{metric_code}_{int(datetime.now(timezone.utc).timestamp())}",
                                "location_id": location_id,
                                "domain": "soil",
                                "metric": metric_code,
                                "value": round(val, 2),
                                "unit": std_unit,
                                "timestamp": props.get("ActivityStartDate", now_iso),
                                "source": "USGS_WQP_Soil",
                                "data_type": "MEASURED",
                                "spatial_resolution": "Point Assay",
                                "original_metric": props.get("CharacteristicName"),
                                "original_unit": unit_raw,
                                "data_quality": "VALID"
                            })

        except Exception:
            # Network or API offline error handling
            pass

        return measurements
