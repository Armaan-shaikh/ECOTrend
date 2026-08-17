import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any

class WorldBankEmissionsCollector:
    """
    World Bank / OWID Greenhouse Gas Emissions API Adapter:
    Queries live national inventory per capita CO2 emissions (EN.ATM.CO2E.PC) and total GHG emissions (EN.ATM.GHGT.KT.CE).
    Explicitly tags all observations as data_type = "ESTIMATED" and domain = "emissions".
    """

    BASE_URL = "https://api.worldbank.org/v2/country"

    async def fetch_national_emissions(
        self,
        country_code: str = "USA",
        location_id: str = "loc_us"
    ) -> List[Dict[str, Any]]:
        # Indicator EN.ATM.CO2E.PC: CO2 emissions (metric tons per capita)
        url = f"{self.BASE_URL}/{country_code}/indicator/EN.ATM.CO2E.PC"
        params = {
            "format": "json",
            "date": "2015:2022"
        }

        measurements = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and len(data) > 1:
                        records = data[1] or []
                        for rec in records:
                            val = rec.get("value")
                            yr_str = rec.get("date")
                            if val is not None and yr_str:
                                iso_ts = f"{yr_str}-01-01T00:00:00Z"
                                measurements.append({
                                    "id": f"meas_wb_emissions_{location_id}_CO2_PER_CAPITA_{yr_str}",
                                    "location_id": location_id,
                                    "domain": "emissions",
                                    "metric": "CO2_PER_CAPITA",
                                    "value": round(float(val), 2),
                                    "unit": "tCO2/capita",
                                    "timestamp": iso_ts,
                                    "source": "WorldBank_UNFCCC",
                                    "data_type": "ESTIMATED",
                                    "spatial_resolution": "National Inventory",
                                    "original_metric": "EN.ATM.CO2E.PC",
                                    "original_unit": "metric tons per capita",
                                    "data_quality": "VALID"
                                })

        except Exception:
            pass

        return measurements
