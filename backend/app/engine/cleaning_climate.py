from typing import List, Dict, Any, Tuple
from app.core.standards_climate import CLIMATE_STANDARDS
from app.core.standards_emissions import EMISSIONS_STANDARDS

class ClimateDataCleaningPipeline:
    """
    Climate & Emissions Data Cleaning & Outlier Validation Pipeline:
    Enforces physical temperature bounds, humidity [0, 100%], non-negative precipitation & wind speed,
    flags SUSPECT extreme heatwaves/freezes without deleting legitimate weather events.
    """

    @staticmethod
    def clean_record(record: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        cleaned = dict(record)
        logs = []

        metric = record.get("metric")
        raw_val = record.get("value")
        domain = record.get("domain", "climate")

        if raw_val is None:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NULL_VALUE",
                "original_value": None,
                "action_taken": "MARKED_INVALID",
                "details": "Null climate/emissions measurement value."
            })
            return cleaned, logs

        # 1. Temperature Validation
        if metric in ["T2M", "APPARENT_TEMP", "T_ANOMALY"]:
            if metric != "T_ANOMALY" and (raw_val < -80.0 or raw_val > 65.0):
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "metric": metric,
                    "rule_triggered": "TEMPERATURE_PHYSICAL_BOUND",
                    "original_value": raw_val,
                    "action_taken": "MARKED_INVALID",
                    "details": f"Temperature value {raw_val}°C is outside physical bounds [-80°C, 65°C]."
                })
                return cleaned, logs

            if metric != "T_ANOMALY" and (raw_val < -40.0 or raw_val > 50.0):
                cleaned["data_quality"] = "SUSPECT"
                logs.append({
                    "metric": metric,
                    "rule_triggered": "EXTREME_TEMPERATURE_ANOMALY",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_SUSPECT",
                    "details": f"Extreme temperature event detected: {raw_val}°C."
                })
                return cleaned, logs

        # 2. Relative Humidity Validation [0, 100%]
        if metric == "RH2M":
            if raw_val < 0.0 or raw_val > 100.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "metric": metric,
                    "rule_triggered": "HUMIDITY_RANGE_BOUND",
                    "original_value": raw_val,
                    "action_taken": "MARKED_INVALID",
                    "details": f"Relative humidity must be between 0% and 100% ({raw_val}%)."
                })
                return cleaned, logs

        # 3. Non-Negative Constraints (Precipitation, Wind Speed, Solar, Emissions)
        if metric in ["PRECIP", "WS10M", "SW_DWN", "CO2_PER_CAPITA", "CO2_PPM", "CO2E_TOTAL"] and raw_val < 0.0:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NON_NEGATIVE_PHYSICAL_BOUND",
                "original_value": raw_val,
                "action_taken": "MARKED_INVALID",
                "details": f"{metric} cannot be negative ({raw_val})."
            })
            return cleaned, logs

        cleaned["data_quality"] = "VALID"
        return cleaned, logs

    @staticmethod
    def batch_clean_series(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        cleaned_records = []
        all_logs = []
        for r in records:
            c, logs = ClimateDataCleaningPipeline.clean_record(r)
            cleaned_records.append(c)
            all_logs.extend(logs)
        return cleaned_records, all_logs
