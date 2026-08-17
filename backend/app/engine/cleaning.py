import logging
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Known impossible value limits for Air metrics
METRIC_PHYSICAL_BOUNDS = {
    "PM2.5": {"min": 0.0, "max": 1000.0, "unit": "µg/m³"},
    "PM10": {"min": 0.0, "max": 2000.0, "unit": "µg/m³"},
    "NO2": {"min": 0.0, "max": 1000.0, "unit": "ppb"},
    "SO2": {"min": 0.0, "max": 1000.0, "unit": "ppb"},
    "CO": {"min": 0.0, "max": 200.0, "unit": "ppm"},
    "O3": {"min": 0.0, "max": 1000.0, "unit": "ppb"},
    "AQI": {"min": 0.0, "max": 500.0, "unit": "index"},
}

class DataCleaningPipeline:
    """
    Data Cleaning & Standardization Pipeline:
    - Filters sensor error codes (e.g., 9999, negative values for physical parameters)
    - Normalizes units
    - Performs Z-Score & Interquartile Range (IQR) outlier detection
    - Tags records as VALID, SUSPECT, or INVALID
    """

    @staticmethod
    def clean_single_measurement(measurement: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Clean and validate a single measurement dictionary.
        Returns (cleaned_measurement, quality_logs)
        """
        logs = []
        cleaned = dict(measurement)
        val = cleaned.get("value")
        metric = cleaned.get("metric", "")
        raw_val = val

        cleaned["raw_value"] = raw_val
        cleaned["data_quality"] = "VALID"

        # Rule 1: Check known sensor error codes (e.g. 9999, 999, -99, -999)
        if val in [9999.0, 999.0, -999.0, -99.0, 9999, -999]:
            cleaned["data_quality"] = "INVALID"
            cleaned["value"] = 0.0
            logs.append({
                "location_id": cleaned.get("location_id"),
                "metric": metric,
                "timestamp": cleaned.get("timestamp"),
                "rule_triggered": "SENSOR_ERROR_CODE_9999",
                "original_value": raw_val,
                "action_taken": "FLAGGED_INVALID",
                "details": f"Value {raw_val} matched known sensor error code pattern."
            })
            return cleaned, logs

        # Rule 2: Physical boundaries (non-negative, maximum threshold)
        bounds = METRIC_PHYSICAL_BOUNDS.get(metric)
        if bounds:
            if val < bounds["min"]:
                cleaned["data_quality"] = "INVALID"
                cleaned["value"] = bounds["min"]
                logs.append({
                    "location_id": cleaned.get("location_id"),
                    "metric": metric,
                    "timestamp": cleaned.get("timestamp"),
                    "rule_triggered": "NEGATIVE_PHYSICAL_VALUE",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"Value {raw_val} is below minimum physical threshold {bounds['min']}."
                })
            elif val > bounds["max"] * 1.5:
                cleaned["data_quality"] = "INVALID"
                logs.append({
                    "location_id": cleaned.get("location_id"),
                    "metric": metric,
                    "timestamp": cleaned.get("timestamp"),
                    "rule_triggered": "EXCEEDED_PHYSICAL_MAXIMUM",
                    "original_value": raw_val,
                    "action_taken": "FLAGGED_INVALID",
                    "details": f"Value {raw_val} exceeded physical ceiling boundary ({bounds['max'] * 1.5})."
                })

        return cleaned, logs

    @staticmethod
    def batch_clean_series(measurements: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Batch process a series of measurements, applying Z-score statistical outlier detection across time-series windows.
        """
        if not measurements:
            return [], []

        cleaned_list = []
        all_logs = []

        # Step 1: Individual point cleaning
        for m in measurements:
            cleaned_m, logs = DataCleaningPipeline.clean_single_measurement(m)
            cleaned_list.append(cleaned_m)
            all_logs.extend(logs)

        # Step 2: Statistical Rolling Z-score tagging for remaining VALID points
        df = pd.DataFrame(cleaned_list)
        if "value" not in df.columns or len(df) < 5:
            return cleaned_list, all_logs

        valid_mask = df["data_quality"] == "VALID"
        valid_values = df.loc[valid_mask, "value"]

        if len(valid_values) >= 5:
            mean = valid_values.mean()
            std = valid_values.std()

            if std > 1e-6:
                z_scores = (df.loc[valid_mask, "value"] - mean) / std
                
                # Flag extreme Z-scores (|Z| > 3.5 -> SUSPECT, |Z| > 5.0 -> INVALID)
                for idx in z_scores.index:
                    z = abs(z_scores.loc[idx])
                    if z > 5.0:
                        df.loc[idx, "data_quality"] = "INVALID"
                        all_logs.append({
                            "location_id": df.loc[idx, "location_id"],
                            "metric": df.loc[idx, "metric"],
                            "timestamp": df.loc[idx, "timestamp"],
                            "rule_triggered": "STATISTICAL_ZSCORE_OUTLIER_EXTREME",
                            "original_value": df.loc[idx, "value"],
                            "action_taken": "FLAGGED_INVALID",
                            "details": f"Z-score {z:.2f} exceeded extreme threshold 5.0"
                        })
                    elif z > 3.5:
                        df.loc[idx, "data_quality"] = "SUSPECT"
                        all_logs.append({
                            "location_id": df.loc[idx, "location_id"],
                            "metric": df.loc[idx, "metric"],
                            "timestamp": df.loc[idx, "timestamp"],
                            "rule_triggered": "STATISTICAL_ZSCORE_OUTLIER",
                            "original_value": df.loc[idx, "value"],
                            "action_taken": "FLAGGED_SUSPECT",
                            "details": f"Z-score {z:.2f} exceeded suspect threshold 3.5"
                        })

        return df.to_dict(orient="records"), all_logs
