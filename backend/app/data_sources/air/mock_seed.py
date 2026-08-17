import random
import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from app.data_sources.base import BaseCollector

# Seed locations matching our spatial hierarchy
SEED_LOCATIONS = [
    {
        "id": "loc_us",
        "name": "United States",
        "level": "COUNTRY",
        "parent_id": None,
        "country_code": "US",
        "latitude": 37.0902,
        "longitude": -95.7129,
    },
    {
        "id": "loc_us_ny",
        "name": "New York State",
        "level": "STATE",
        "parent_id": "loc_us",
        "country_code": "US",
        "latitude": 40.7128,
        "longitude": -74.0060,
    },
    {
        "id": "loc_us_ny_nyc",
        "name": "New York City",
        "level": "CITY",
        "parent_id": "loc_us_ny",
        "country_code": "US",
        "latitude": 40.7128,
        "longitude": -74.0060,
    },
    {
        "id": "loc_us_ny_nyc_manhattan",
        "name": "Manhattan Central Station",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7831,
        "longitude": -73.9712,
    },
    {
        "id": "loc_us_ny_nyc_queens",
        "name": "Queens Industrial Station",
        "level": "STATION",
        "parent_id": "loc_us_ny_nyc",
        "country_code": "US",
        "latitude": 40.7282,
        "longitude": -73.7949,
    },
    {
        "id": "loc_gb",
        "name": "United Kingdom",
        "level": "COUNTRY",
        "parent_id": None,
        "country_code": "GB",
        "latitude": 55.3781,
        "longitude": -3.4360,
    },
    {
        "id": "loc_gb_eng",
        "name": "England",
        "level": "STATE",
        "parent_id": "loc_gb",
        "country_code": "GB",
        "latitude": 52.3555,
        "longitude": -1.1743,
    },
    {
        "id": "loc_gb_eng_london",
        "name": "London",
        "level": "CITY",
        "parent_id": "loc_gb_eng",
        "country_code": "GB",
        "latitude": 51.5074,
        "longitude": -0.1278,
    },
    {
        "id": "loc_gb_eng_london_westminster",
        "name": "Westminster Station",
        "level": "STATION",
        "parent_id": "loc_gb_eng_london",
        "country_code": "GB",
        "latitude": 51.4975,
        "longitude": -0.1357,
    },
    {
        "id": "loc_in",
        "name": "India",
        "level": "COUNTRY",
        "parent_id": None,
        "country_code": "IN",
        "latitude": 20.5937,
        "longitude": 78.9629,
    },
    {
        "id": "loc_in_delhi",
        "name": "Delhi National Capital Region",
        "level": "STATE",
        "parent_id": "loc_in",
        "country_code": "IN",
        "latitude": 28.7041,
        "longitude": 77.1025,
    },
    {
        "id": "loc_in_delhi_newdelhi",
        "name": "New Delhi",
        "level": "CITY",
        "parent_id": "loc_in_delhi",
        "country_code": "IN",
        "latitude": 28.6139,
        "longitude": 77.2090,
    },
    {
        "id": "loc_in_delhi_anandvihar",
        "name": "Anand Vihar Station",
        "level": "STATION",
        "parent_id": "loc_in_delhi_newdelhi",
        "country_code": "IN",
        "latitude": 28.6508,
        "longitude": 77.3152,
    }
]

class MockAirSeedCollector(BaseCollector):
    def __init__(self):
        super().__init__(source_name="Synthetic_Station_Grid", domain="air")

    async def fetch_measurements(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime,
        location_id: str
    ) -> List[Dict[str, Any]]:
        measurements = []
        random.seed(hash(location_id) % 100000)

        # Baseline parameters by metric
        metric_configs = {
            "PM2.5": {"base": 24.0, "unit": "µg/m³", "amplitude": 12.0, "noise": 4.0},
            "PM10": {"base": 48.0, "unit": "µg/m³", "amplitude": 20.0, "noise": 8.0},
            "NO2": {"base": 32.0, "unit": "ppb", "amplitude": 15.0, "noise": 5.0},
            "SO2": {"base": 8.0, "unit": "ppb", "amplitude": 3.0, "noise": 1.5},
            "CO": {"base": 0.8, "unit": "ppm", "amplitude": 0.3, "noise": 0.1},
            "O3": {"base": 42.0, "unit": "ppb", "amplitude": 18.0, "noise": 6.0},
            "AQI": {"base": 65.0, "unit": "index", "amplitude": 25.0, "noise": 10.0},
        }

        # Extra factor for highly polluted locations like Anand Vihar
        location_multiplier = 2.4 if "anandvihar" in location_id else (1.3 if "queens" in location_id else 1.0)

        current_dt = start_date
        step = timedelta(hours=6) # 4 readings per day over historical range

        idx = 0
        while current_dt <= end_date:
            day_of_year = current_dt.timetuple().tm_yday
            hour = current_dt.hour

            # Seasonal sinusoidal wave (Winter peak for PM, Summer peak for O3)
            seasonal_wave = math.sin(2 * math.pi * (day_of_year - 15) / 365.0)
            
            # Diurnal diurnal wave (Morning/evening rush hour peaks)
            diurnal_wave = math.sin(2 * math.pi * (hour - 7) / 24.0)

            for metric, cfg in metric_configs.items():
                base_val = cfg["base"] * location_multiplier
                amp = cfg["amplitude"] * location_multiplier
                
                if metric == "O3":
                    val = base_val + amp * (-seasonal_wave) + cfg["noise"] * random.gauss(0, 1)
                else:
                    val = base_val + amp * (0.6 * seasonal_wave + 0.4 * diurnal_wave) + cfg["noise"] * random.gauss(0, 1)
                
                # Introduce slight long-term improving/degrading trend
                trend_factor = 1.0 - 0.05 * ((current_dt - start_date).days / 365.0) # Slight improvement over time
                val = max(1.0, val * trend_factor)

                # Inject deliberate error codes / outliers for data validation testing (0.5% chance)
                raw_val = val
                if random.random() < 0.005:
                    error_type = random.choice(["ERROR_CODE_9999", "NEGATIVE_SPIKE", "EXTREME_OUTLIER"])
                    if error_type == "ERROR_CODE_9999":
                        val = 9999.0
                    elif error_type == "NEGATIVE_SPIKE":
                        val = -99.0
                    elif error_type == "EXTREME_OUTLIER":
                        val = val * 25.0

                measurements.append({
                    "location_id": location_id,
                    "domain": "air",
                    "metric": metric,
                    "value": round(val, 2),
                    "raw_value": round(raw_val, 2),
                    "unit": cfg["unit"],
                    "timestamp": current_dt,
                    "source": self.source_name
                })
            
            current_dt += step
            idx += 1

        return measurements
