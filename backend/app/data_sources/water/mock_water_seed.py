import math
import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

WATER_SEED_LOCATIONS = [
    {
        "id": "loc_us_ny_hudson",
        "name": "Hudson River Estuary Station",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7614,
        "longitude": -74.0012,
        "type": "ESTUARY"
    },
    {
        "id": "loc_us_dc_potomac",
        "name": "Potomac River Monitoring Station",
        "level": "STATION",
        "parent_id": "loc_us",
        "country_code": "US",
        "latitude": 38.8951,
        "longitude": -77.0364,
        "type": "RIVER"
    },
    {
        "id": "loc_in_delhi_yamuna",
        "name": "Yamuna River Central Station",
        "level": "STATION",
        "parent_id": "loc_in_delhi_newdelhi",
        "country_code": "IN",
        "latitude": 28.6280,
        "longitude": 77.2410,
        "type": "RIVER"
    }
]

class MockWaterSeedCollector:
    """
    Synthetic Water Seed Collector:
    Generates physics-aligned historical water quality observations for DO, BOD, COD, TDS, pH, Turbidity, Temp, and Conductivity.
    """

    async def fetch_measurements(
        self,
        latitude: float,
        longitude: float,
        start_date: datetime,
        end_date: datetime,
        location_id: str = "loc_us_ny_hudson"
    ) -> List[Dict[str, Any]]:
        measurements = []
        days_span = (end_date - start_date).days
        is_polluted = "yamuna" in location_id.lower()

        # Baseline parameters
        base_do = 3.2 if is_polluted else 7.8
        base_bod = 18.5 if is_polluted else 2.1
        base_cod = 52.0 if is_polluted else 8.4
        base_tds = 780.0 if is_polluted else 240.0
        base_ph = 7.9 if is_polluted else 7.2
        base_turb = 38.0 if is_polluted else 2.4
        base_temp = 24.5 if is_polluted else 16.2
        base_cond = 1250.0 if is_polluted else 380.0

        metrics_cfg = [
            ("DO", "mg/L", base_do, 0.8),
            ("BOD", "mg/L", base_bod, 1.2),
            ("COD", "mg/L", base_cod, 3.5),
            ("TDS", "mg/L", base_tds, 15.0),
            ("pH", "dimensionless", base_ph, 0.15),
            ("Turbidity", "NTU", base_turb, 1.8),
            ("Temp", "°C", base_temp, 0.6),
            ("Conductivity", "µS/cm", base_cond, 25.0),
        ]

        curr = start_date
        step_hours = 24

        while curr <= end_date:
            day_idx = (curr - start_date).days
            day_fraction = day_idx / max(1, days_span)

            for metric, unit, b_val, noise_sd in metrics_cfg:
                # Add slight trend & seasonal oscillation
                seasonal = math.sin((day_idx / 7.0) * math.pi * 2) * (b_val * 0.05)
                drift = (day_fraction - 0.5) * (b_val * 0.04)
                noise = random.gauss(0, noise_sd)

                val = b_val + seasonal + drift + noise

                # Boundary clamping
                if metric == "pH":
                    val = max(0.0, min(14.0, val))
                elif metric in ["DO", "BOD", "COD", "TDS", "Turbidity", "Conductivity"]:
                    val = max(0.0, val)

                measurements.append({
                    "id": f"meas_water_{location_id}_{metric}_{curr.strftime('%Y%m%d%H%M')}",
                    "location_id": location_id,
                    "domain": "water",
                    "metric": metric,
                    "value": round(val, 2),
                    "unit": unit,
                    "timestamp": curr.isoformat(),
                    "source": "MockWaterSeedCollector",
                    "data_quality": "VALID"
                })

            curr += timedelta(hours=step_hours)

        return measurements
