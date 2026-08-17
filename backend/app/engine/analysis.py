import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.tsa.seasonal import seasonal_decompose
from typing import List, Dict, Any, Optional
from datetime import datetime

class HistoricalAnalyticsEngine:
    """
    Deterministic Historical Analytics Engine:
    Computes linear metrics, rate of change, rolling volatility indices,
    seasonality decomposition, and historic anomaly tags from historical observations.
    """

    @staticmethod
    def compute_analytics(
        measurements: List[Dict[str, Any]],
        location_id: str,
        location_name: str,
        metric: str,
        unit: str
    ) -> Dict[str, Any]:
        if not measurements:
            return HistoricalAnalyticsEngine._empty_analytics_response(
                location_id, location_name, metric, unit
            )

        df = pd.DataFrame(measurements)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        total_obs = len(df)
        valid_df = df[df["data_quality"] == "VALID"].copy()
        invalid_obs = int((df["data_quality"] == "INVALID").sum())
        suspect_obs = int((df["data_quality"] == "SUSPECT").sum())
        valid_obs = len(valid_df)

        if valid_obs < 3:
            # Fall back to using all available data if valid count is too low
            valid_df = df.copy()

        values = valid_df["value"].values
        timestamps = valid_df["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ").tolist()

        # 1. Linear Trend & Slope
        start_time_str = timestamps[0] if timestamps else ""
        end_time_str = timestamps[-1] if timestamps else ""

        # Time delta in fractional days from start
        time_deltas_days = (valid_df["timestamp"] - valid_df["timestamp"].iloc[0]).dt.total_seconds() / 86400.0
        x = time_deltas_days.values
        y = values

        if len(x) >= 2 and np.std(x) > 0:
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            r_squared = r_value ** 2
        else:
            slope, intercept, r_squared, p_value = 0.0, float(np.mean(y)), 0.0, 1.0

        # Determine trend direction (For pollutants, slope < -0.01 is IMPROVING, > 0.01 is DEGRADING)
        if slope < -0.01:
            direction = "IMPROVING"
        elif slope > 0.01:
            direction = "DEGRADING"
        else:
            direction = "STABLE"

        annualized_change = slope * 365.25

        # 2. Rate of Change %
        first_val = values[0] if len(values) > 0 else 1.0
        last_val = values[-1] if len(values) > 0 else 1.0
        if abs(first_val) > 1e-6:
            rate_of_change_pct = ((last_val - first_val) / abs(first_val)) * 100.0
        else:
            rate_of_change_pct = 0.0

        # 3. Volatility Index
        mean_val = float(np.mean(y))
        std_val = float(np.std(y))
        cv = (std_val / mean_val) if abs(mean_val) > 1e-6 else 0.0
        min_val = float(np.min(y))
        max_val = float(np.max(y))
        median_val = float(np.median(y))

        volatility_metrics = {
            "mean": round(mean_val, 2),
            "std_dev": round(std_val, 2),
            "coefficient_of_variation": round(cv, 4),
            "min_value": round(min_val, 2),
            "max_value": round(max_val, 2),
            "median_value": round(median_val, 2)
        }

        # 4. Anomaly Detection (|Z| > 2.5)
        anomalies = []
        if std_val > 1e-6:
            z_scores = (y - mean_val) / std_val
            for idx, z in enumerate(z_scores):
                if abs(z) > 2.5:
                    anomalies.append({
                        "timestamp": timestamps[idx],
                        "value": round(float(y[idx]), 2),
                        "z_score": round(float(z), 2),
                        "reason": f"Historical observation deviated by {abs(z):.2f} standard deviations from mean."
                    })

        # 5. Seasonality Decomposition (Additive)
        seasonality_data = HistoricalAnalyticsEngine._decompose_seasonality(valid_df, timestamps)

        return {
            "location_id": location_id,
            "location_name": location_name,
            "metric": metric,
            "unit": unit,
            "start_time": start_time_str,
            "end_time": end_time_str,
            "total_observations": total_obs,
            "valid_observations": valid_obs,
            "invalid_observations": invalid_obs,
            "suspect_observations": suspect_obs,
            "linear_trend": {
                "slope": round(float(slope), 4),
                "intercept": round(float(intercept), 4),
                "r_squared": round(float(r_squared), 4),
                "p_value": round(float(p_value), 4),
                "direction": direction,
                "annualized_change": round(float(annualized_change), 2)
            },
            "rate_of_change_percent": round(float(rate_of_change_pct), 2),
            "volatility": volatility_metrics,
            "anomalies": anomalies,
            "seasonality": seasonality_data
        }

    @staticmethod
    def _decompose_seasonality(df: pd.DataFrame, timestamps: List[str]) -> Dict[str, Any]:
        """
        Computes additive seasonal decomposition if enough observations exist.
        """
        values = df["value"].values
        n = len(values)

        if n < 14:
            # Not enough sample points for robust seasonal decomposition
            return {
                "timestamps": timestamps,
                "observed": [round(float(v), 2) for v in values],
                "trend": [None] * n,
                "seasonal": [None] * n,
                "residual": [None] * n,
                "has_seasonality": False
            }

        try:
            # Estimate frequency period (e.g. 4 samples per day -> period 4 or 7 days -> period 28)
            period = 4 if n >= 28 else (2 if n >= 14 else 2)
            res = seasonal_decompose(values, model="additive", period=period, extrapolate_trend="freq")
            
            trend_list = [round(float(v), 2) if not np.isnan(v) else None for v in res.trend]
            seasonal_list = [round(float(v), 2) if not np.isnan(v) else None for v in res.seasonal]
            residual_list = [round(float(v), 2) if not np.isnan(v) else None for v in res.resid]

            # Assess strength of seasonality: Var(seasonal) / Var(observed)
            var_obs = np.var(values)
            var_seas = np.var(res.seasonal)
            has_seas = bool(var_obs > 1e-6 and (var_seas / var_obs) > 0.15)

            return {
                "timestamps": timestamps,
                "observed": [round(float(v), 2) for v in values],
                "trend": trend_list,
                "seasonal": seasonal_list,
                "residual": residual_list,
                "has_seasonality": has_seas
            }
        except Exception:
            return {
                "timestamps": timestamps,
                "observed": [round(float(v), 2) for v in values],
                "trend": [None] * n,
                "seasonal": [None] * n,
                "residual": [None] * n,
                "has_seasonality": False
            }

    @staticmethod
    def _empty_analytics_response(location_id: str, location_name: str, metric: str, unit: str) -> Dict[str, Any]:
        return {
            "location_id": location_id,
            "location_name": location_name,
            "metric": metric,
            "unit": unit,
            "start_time": "",
            "end_time": "",
            "total_observations": 0,
            "valid_observations": 0,
            "invalid_observations": 0,
            "suspect_observations": 0,
            "linear_trend": {
                "slope": 0.0,
                "intercept": 0.0,
                "r_squared": 0.0,
                "p_value": 1.0,
                "direction": "STABLE",
                "annualized_change": 0.0
            },
            "rate_of_change_percent": 0.0,
            "volatility": {
                "mean": 0.0,
                "std_dev": 0.0,
                "coefficient_of_variation": 0.0,
                "min_value": 0.0,
                "max_value": 0.0,
                "median_value": 0.0
            },
            "anomalies": [],
            "seasonality": {
                "timestamps": [],
                "observed": [],
                "trend": [],
                "seasonal": [],
                "residual": [],
                "has_seasonality": False
            }
        }
