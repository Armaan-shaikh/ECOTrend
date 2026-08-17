import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from scipy import stats
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX

class LinearHarmonicModel:
    """Model 1: Linear Drift + Harmonic Seasonal Extrapolation."""
    name = "Linear Harmonic Extrapolation"

    def __init__(self):
        self.slope = 0.0
        self.intercept = 0.0
        self.sin_coef = 0.0
        self.cos_coef = 0.0
        self.last_day_idx = 0

    def fit(self, y: np.ndarray, dates: pd.DatetimeIndex):
        n = len(y)
        self.last_day_idx = n - 1
        x = np.arange(n)
        doy = dates.dayofyear.values
        sin_doy = np.sin(2 * np.pi * doy / 365.25)
        cos_doy = np.cos(2 * np.pi * doy / 365.25)

        # Build design matrix: [1, x, sin_doy, cos_doy]
        X = np.column_stack([np.ones(n), x, sin_doy, cos_doy])
        try:
            coeffs, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
            self.intercept, self.slope, self.sin_coef, self.cos_coef = coeffs
        except Exception:
            self.intercept = float(np.mean(y))
            self.slope = 0.0

    def predict(self, horizon_days: int, start_date: pd.Timestamp) -> np.ndarray:
        future_dates = pd.date_range(start=start_date, periods=horizon_days + 1, freq="D")[1:]
        x_future = np.arange(self.last_day_idx + 1, self.last_day_idx + 1 + horizon_days)
        doy_future = future_dates.dayofyear.values
        sin_f = np.sin(2 * np.pi * doy_future / 365.25)
        cos_f = np.cos(2 * np.pi * doy_future / 365.25)

        preds = self.intercept + self.slope * x_future + self.sin_coef * sin_f + self.cos_coef * cos_f
        return np.maximum(0.5, preds)


class HoltWintersModel:
    """Model 2: Holt-Winters Exponential Smoothing."""
    name = "Holt-Winters Exponential Smoothing"

    def __init__(self):
        self.model_fit = None
        self.fallback_mean = 0.0

    def fit(self, y: np.ndarray, dates: pd.DatetimeIndex):
        self.fallback_mean = float(np.mean(y))
        try:
            seasonal_periods = 7 if len(y) >= 14 else 2
            hw = ExponentialSmoothing(
                y, 
                trend="add", 
                seasonal="add", 
                seasonal_periods=seasonal_periods,
                initialization_method="estimated"
            )
            self.model_fit = hw.fit()
        except Exception:
            self.model_fit = None

    def predict(self, horizon_days: int, start_date: pd.Timestamp) -> np.ndarray:
        if self.model_fit is not None:
            try:
                preds = self.model_fit.forecast(horizon_days)
                return np.maximum(0.5, preds)
            except Exception:
                pass
        return np.full(horizon_days, self.fallback_mean)


class SARIMAXModel:
    """Model 3: SARIMA State Space Model."""
    name = "SARIMA(1,1,1)(1,0,0)[7]"

    def __init__(self):
        self.model_fit = None
        self.fallback_mean = 0.0

    def fit(self, y: np.ndarray, dates: pd.DatetimeIndex):
        self.fallback_mean = float(np.mean(y))
        try:
            sarima = SARIMAX(
                y, 
                order=(1, 1, 1), 
                seasonal_order=(1, 0, 0, 7),
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            self.model_fit = sarima.fit(disp=False)
        except Exception:
            self.model_fit = None

    def predict(self, horizon_days: int, start_date: pd.Timestamp) -> np.ndarray:
        if self.model_fit is not None:
            try:
                preds = self.model_fit.forecast(horizon_days)
                return np.maximum(0.5, preds)
            except Exception:
                pass
        return np.full(horizon_days, self.fallback_mean)
