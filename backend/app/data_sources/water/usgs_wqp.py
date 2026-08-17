import httpx
from datetime import datetime
from typing import List, Dict, Any

class USGSWaterQualityCollector:
    """
    USGS Water Quality Portal (WQP) & NWIS Collector:
    Fetches real-time and historical open government water quality measurements
    for DO, pH, Temp, Conductivity, Turbidity, TDS, BOD, COD.
    """

    BASE_URL = "https://waterservices.usgs.gov/nwis/iv/"

    # Mapping USGS parameter codes to EcoTrend standard metric names
    USGS_PARAMETER_MAP = {
        "00300": {"metric": "DO", "unit": "mg/L"},          # Dissolved oxygen
        "00400": {"metric": "pH", "unit": "dimensionless"}, # pH
        "00010": {"metric": "Temp", "unit": "°C"},          # Temperature
        "00095": {"metric": "Conductivity", "unit": "µS/cm"},# Specific conductance
        "63680": {"metric": "Turbidity", "unit": "NTU"},     # Turbidity
        "70300": {"metric": "TDS", "unit": "mg/L"},         # Total dissolved solids
        "00310": {"metric": "BOD", "unit": "mg/L"},         # Biochemical oxygen demand
        "00340": {"metric": "COD", "unit": "mg/L"},         # Chemical oxygen demand
    }

    def __init__(self, timeout_seconds: float = 10.0):
        self.timeout = timeout_seconds

    async def fetch_measurements(
        self,
        site_id: str = "01646500", # Potomac River at Wash D.C.
        start_date: datetime = None,
        end_date: datetime = None,
        location_id: str = "loc_water_potomac"
    ) -> List[Dict[str, Any]]:
        """
        Fetches water quality measurements from USGS NWIS REST API.
        """
        params = {
            "format": "json",
            "sites": site_id,
            "parameterCd": ",".join(self.USGS_PARAMETER_MAP.keys()),
            "siteStatus": "all"
        }

        measurements = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    time_series = data.get("value", {}).get("timeSeries", [])

                    for ts in time_series:
                        variable_code = ts.get("variable", {}).get("variableCode", [{}])[0].get("value")
                        if variable_code in self.USGS_PARAMETER_MAP:
                            metric_info = self.USGS_PARAMETER_MAP[variable_code]
                            values = ts.get("values", [{}])[0].get("value", [])

                            for v in values:
                                try:
                                    raw_val = float(v.get("value"))
                                    timestamp_str = v.get("dateTime")
                                    measurements.append({
                                        "location_id": location_id,
                                        "domain": "water",
                                        "metric": metric_info["metric"],
                                        "value": raw_val,
                                        "unit": metric_info["unit"],
                                        "timestamp": timestamp_str,
                                        "source": "USGS_NWIS_WQP",
                                        "data_quality": "VALID"
                                    })
                                except (ValueError, TypeError):
                                    continue
        except Exception:
            # Fallback handled via mock seed collector if network fails
            pass

        return measurements
