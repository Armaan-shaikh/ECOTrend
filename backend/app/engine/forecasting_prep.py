import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

class ForecastingDataPrep:
    """
    Time-Series Resampling & Feature Engineering Pipeline:
    - Resamples raw measurements into uniform daily time steps
    - Imputes short gaps using time-weighted linear interpolation
    - Generates temporal calendar features (sin/cos encoding for day of year & day of week)
    - Generates lag features (t-1, t-7, t-30) and rolling statistics (7D mean, 30D std)
    """

    @staticmethod
    def prepare_daily_series(
        measurements: List[Dict[str, Any]], 
        target_metric: str = "PM2.5"
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        if not measurements:
            return pd.DataFrame(), {}

        df = pd.DataFrame(measurements)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        # Filter valid records (or include suspect if valid records are scarce)
        valid_df = df[df["data_quality"].isin(["VALID", "SUSPECT"])].copy()
        if len(valid_df) < 5:
            valid_df = df.copy()

        # Resample to daily mean
        daily_series = valid_df.set_index("timestamp").resample("D")["value"].mean().reset_index()
        
        # Impute missing dates using linear interpolation (up to 3 consecutive days)
        daily_series["value"] = daily_series["value"].interpolate(method="linear", limit=3).bfill().ffill()

        # Feature Engineering
        daily_series["day_of_year"] = daily_series["timestamp"].dt.dayofyear
        daily_series["day_of_week"] = daily_series["timestamp"].dt.dayofweek

        # Cyclical calendar encodings
        daily_series["sin_day_of_year"] = np.sin(2 * np.pi * daily_series["day_of_year"] / 365.25)
        daily_series["cos_day_of_year"] = np.cos(2 * np.pi * daily_series["day_of_year"] / 365.25)
        daily_series["sin_day_of_week"] = np.sin(2 * np.pi * daily_series["day_of_week"] / 7.0)
        daily_series["cos_day_of_week"] = np.cos(2 * np.pi * daily_series["day_of_week"] / 7.0)

        # Lags & Rolling statistics
        daily_series["lag_1d"] = daily_series["value"].shift(1)
        daily_series["lag_7d"] = daily_series["value"].shift(7)
        daily_series["lag_30d"] = daily_series["value"].shift(30)

        daily_series["rolling_mean_7d"] = daily_series["value"].shift(1).rolling(7, min_periods=1).mean()
        daily_series["rolling_std_30d"] = daily_series["value"].shift(1).rolling(30, min_periods=1).std().fillna(0)

        meta = {
            "total_days": len(daily_series),
            "start_date": daily_series["timestamp"].iloc[0].strftime("%Y-%m-%d") if len(daily_series) > 0 else "",
            "end_date": daily_series["timestamp"].iloc[-1].strftime("%Y-%m-%d") if len(daily_series) > 0 else "",
            "mean": float(daily_series["value"].mean()) if len(daily_series) > 0 else 0.0,
            "std": float(daily_series["value"].std()) if len(daily_series) > 0 else 0.0
        }

        return daily_series, meta
