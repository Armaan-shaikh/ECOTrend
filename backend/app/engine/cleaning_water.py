import math
from typing import List, Dict, Any, Tuple

class WaterDataCleaningPipeline:
    """
    Water-Specific Validation & Data Cleaning Engine:
    Validates physical plausible ranges for pH, DO, BOD, COD, TDS, Turbidity, Temp, and Conductivity.
    Tags measurements as VALID, SUSPECT, or INVALID and logs rule triggers.
    """

    @staticmethod
    def validate_measurement(meas: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        metric = meas.get("metric", "")
        raw_val = meas.get("value")
        unit = meas.get("unit", "")
        location_id = meas.get("location_id")
        ts = meas.get("timestamp")

        logs = []
        cleaned = dict(meas)
        cleaned["raw_value"] = raw_val

        # Null / NaN check
        if raw_val is None or math.isnan(raw_val):
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "location_id": location_id,
                "metric": metric,
                "timestamp": ts,
                "rule_triggered": "NULL_OR_NAN_VALUE",
                "original_value": raw_val,
                "action_taken": "FLAGGED_INVALID",
                "details": "Water measurement value is missing or NaN."
            })
            return cleaned, logs

        # Metric-specific physical validation rules
        if metric == "pH":
            if raw_val < 0.0 or raw_val > 14.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": "PHYSICAL_IMPOSSIBLE_PH",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"pH value {raw_val} is outside physical bounds [0, 14]."
                })
            elif raw_val < 4.0 or raw_val > 10.5:
                cleaned["data_quality"] = "SUSPECT"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": "EXTREME_ACIDITY_OR_ALKALINITY",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_SUSPECT",
                    "details": f"pH value {raw_val} exhibits extreme non-neutral reading."
                })

        elif metric == "DO":
            if raw_val < 0.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": "NEGATIVE_DISSOLVED_OXYGEN",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"Dissolved oxygen cannot be negative ({raw_val} mg/L)."
                })
            elif raw_val > 20.0:
                cleaned["data_quality"] = "SUSPECT"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": "SUPER_SATURATED_DISSOLVED_OXYGEN",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_SUSPECT",
                    "details": f"DO value {raw_val} mg/L exceeds supersaturation bounds."
                })

        elif metric in ["BOD", "COD", "TDS", "Turbidity", "Conductivity"]:
            if raw_val < 0.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": f"NEGATIVE_{metric.upper()}",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"{metric} concentration cannot be negative ({raw_val} {unit})."
                })

            # Extreme suspect limits
            suspect_limits = {"BOD": 100.0, "COD": 500.0, "TDS": 5000.0, "Turbidity": 1000.0, "Conductivity": 10000.0}
            if metric in suspect_limits and raw_val > suspect_limits[metric]:
                cleaned["data_quality"] = "SUSPECT"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": f"EXTREME_HIGH_{metric.upper()}",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_SUSPECT",
                    "details": f"{metric} value {raw_val} {unit} exceeds typical environmental limits."
                })

        elif metric == "Temp":
            if raw_val < -5.0 or raw_val > 60.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "location_id": location_id,
                    "metric": metric,
                    "timestamp": ts,
                    "rule_triggered": "IMPOSSIBLE_WATER_TEMPERATURE",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"Water temperature {raw_val} °C is outside physical sensor range."
                })

        return cleaned, logs

    @staticmethod
    def batch_clean_series(raw_measurements: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        cleaned_list = []
        all_logs = []
        for m in raw_measurements:
            c, l = WaterDataCleaningPipeline.validate_measurement(m)
            cleaned_list.append(c)
            all_logs.extend(l)
        return cleaned_list, all_logs
