from typing import List, Dict, Any, Tuple
from app.core.standards_soil import SOIL_QUALITY_STANDARDS

class SoilDataCleaningPipeline:
    """
    Soil Data Cleaning & Outlier Validation Pipeline:
    Enforces non-negative physical bounds, pH range [0, 14], flags SUSPECT/INVALID records,
    and logs quality rules without deleting extreme measurements.
    """

    @staticmethod
    def clean_record(record: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        cleaned = dict(record)
        logs = []

        metric = record.get("metric")
        raw_val = record.get("value")
        std = SOIL_QUALITY_STANDARDS.get(metric)

        if raw_val is None:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NULL_VALUE",
                "original_value": None,
                "action_taken": "MARKED_INVALID",
                "details": "Null soil measurement value."
            })
            return cleaned, logs

        # 1. Non-negative Physical Bounds
        if metric != "pH" and raw_val < 0.0:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NEGATIVE_VALUE_BOUND",
                "original_value": raw_val,
                "action_taken": "MARKED_INVALID",
                "details": f"{metric} concentration cannot be negative ({raw_val})."
            })
            return cleaned, logs

        # 2. pH Physical Range Validation [0, 14]
        if metric == "pH":
            if raw_val < 0.0 or raw_val > 14.0:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "metric": metric,
                    "rule_triggered": "PH_RANGE_OUT_OF_BOUNDS",
                    "original_value": raw_val,
                    "action_taken": "MARKED_INVALID",
                    "details": f"Soil pH must be between 0.0 and 14.0 ({raw_val})."
                })
                return cleaned, logs

        # 3. Extreme Contamination Tagging (SUSPECT)
        if std:
            crit = std.get("critical_max")
            if crit and raw_val > crit:
                cleaned["data_quality"] = "SUSPECT"
                logs.append({
                    "metric": metric,
                    "rule_triggered": "EXTREME_CONTAMINATION_THRESHOLD",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_SUSPECT",
                    "details": f"{metric} value of {raw_val} {std['unit']} exceeds critical threshold of {crit} {std['unit']}."
                })
                return cleaned, logs

        cleaned["data_quality"] = "VALID"
        return cleaned, logs

    @staticmethod
    def batch_clean_series(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        cleaned_records = []
        all_logs = []
        for r in records:
            c, logs = SoilDataCleaningPipeline.clean_record(r)
            cleaned_records.append(c)
            all_logs.extend(logs)
        return cleaned_records, all_logs
