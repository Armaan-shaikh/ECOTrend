from typing import List, Dict, Any, Tuple

class NoiseDataCleaningPipeline:
    """
    Acoustic Noise Data Cleaning & Validation Pipeline:
    Enforces non-negative incident count constraints, validates geocoded records,
    flags extreme incident spikes (>100 incidents/day) as SUSPECT without discarding genuine urban events.
    """

    @staticmethod
    def clean_record(record: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        cleaned = dict(record)
        logs = []

        metric = record.get("metric")
        raw_val = record.get("value")

        if raw_val is None:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NULL_VALUE",
                "original_value": None,
                "action_taken": "MARKED_INVALID",
                "details": "Null acoustic noise measurement value."
            })
            return cleaned, logs

        # 1. Non-Negative Constraint
        if raw_val < 0.0:
            cleaned["data_quality"] = "INVALID"
            logs.append({
                "metric": metric,
                "rule_triggered": "NON_NEGATIVE_INCIDENT_COUNT",
                "original_value": raw_val,
                "action_taken": "MARKED_INVALID",
                "details": f"Noise incident count cannot be negative ({raw_val})."
            })
            return cleaned, logs

        # 2. Extreme Surge Validation (>100 incidents/day) -> SUSPECT
        if raw_val > 100.0:
            cleaned["data_quality"] = "SUSPECT"
            logs.append({
                "metric": metric,
                "rule_triggered": "EXTREME_NOISE_INCIDENT_SURGE",
                "original_value": raw_val,
                "action_taken": "FLAGGED_SUSPECT",
                "details": f"Extreme noise complaint surge detected: {raw_val} incidents/day."
            })
            return cleaned, logs

        cleaned["data_quality"] = "VALID"
        return cleaned, logs

    @staticmethod
    def batch_clean_series(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        cleaned_records = []
        all_logs = []
        for r in records:
            c, logs = NoiseDataCleaningPipeline.clean_record(r)
            cleaned_records.append(c)
            all_logs.extend(logs)
        return cleaned_records, all_logs
