import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.engine.forecasting_prep import ForecastingDataPrep
from app.engine.backtest import WalkForwardBacktester
from app.engine.forecast_models import LinearHarmonicModel, HoltWintersModel, SARIMAXModel

class WaterScenarioForecastEngine:
    """
    Metric-Direction-Aware Water Scenario Forecast Engine:
    Reuses Phase 2A forecasting models & walk-forward backtesting, selecting champion models
    independently per water metric, and generating direction-aware scenarios (DO, BOD, COD, TDS, pH, Turbidity, Temp, Conductivity).
    """

    HORIZON_MAP = {
        "6_MONTHS": 182,
        "1_YEAR": 365,
        "3_YEARS": 1095,
        "5_YEARS": 1825
    }

    @staticmethod
    def generate_water_projections(
        daily_series: pd.Series,
        location_id: str,
        metric: str,
        unit: str,
        horizon_key: str = "1_YEAR"
    ) -> Dict[str, Any]:
        horizon_days = WaterScenarioForecastEngine.HORIZON_MAP.get(horizon_key.upper(), 365)

        # Convert pd.Series to DataFrame format expected by WalkForwardBacktester
        df_prep = pd.DataFrame({
            "timestamp": daily_series.index.astype(str),
            "value": daily_series.values
        })

        # 1. Walk-Forward Backtesting to select Champion Model for this Water Metric
        champion_name, champion_item, leaderboard = WalkForwardBacktester.run_backtest(df_prep)

        # 2. Generate Base Forecast using Champion Model
        freq = daily_series.index.inferred_freq or "D"
        last_dt = daily_series.index[-1]
        future_dates = pd.date_range(start=last_dt + pd.Timedelta(days=1), periods=horizon_days, freq="D")
        y_vals = daily_series.values

        if "SARIMA" in champion_name:
            m = SARIMAXModel()
            m.fit(y_vals, daily_series.index)
            base_pred = m.predict(horizon_days, last_dt)
        elif "Holt-Winters" in champion_name:
            m = HoltWintersModel()
            m.fit(y_vals, daily_series.index)
            base_pred = m.predict(horizon_days, last_dt)
        else:
            m = LinearHarmonicModel()
            m.fit(y_vals, daily_series.index)
            base_pred = m.predict(horizon_days, last_dt)

        # Estimate residual std dev for confidence interval bounds
        resids = y_vals - np.mean(y_vals)
        std_base = float(np.std(resids)) if len(resids) > 1 else 1.0

        # 3. Apply Metric-Direction-Aware Scenarios
        projections = []
        for i in range(horizon_days):
            t_date = future_dates[i]
            date_str = t_date.strftime("%Y-%m-%d")
            ts_str = t_date.isoformat()

            base_val = max(0.0, float(base_pred[i])) if metric != "pH" else float(base_pred[i])
            t_ratio = (i + 1) / horizon_days

            # Standard error scaling over horizon
            se = std_base * (1.0 + 0.5 * t_ratio)

            # 80% & 95% Confidence Intervals
            ci_95_lower = max(0.0, base_val - 1.96 * se) if metric != "pH" else base_val - 1.96 * se
            ci_95_upper = base_val + 1.96 * se
            ci_80_lower = max(0.0, base_val - 1.28 * se) if metric != "pH" else base_val - 1.28 * se
            ci_80_upper = base_val + 1.28 * se

            # Directional Rules
            if metric == "DO": # Higher is better
                improv_val = base_val * (1.0 + 0.18 * t_ratio)
                worsen_val = max(0.0, base_val * (1.0 - 0.22 * t_ratio))

            elif metric in ["BOD", "COD", "TDS", "Turbidity", "Conductivity"]: # Lower is better
                improv_val = max(0.0, base_val * (1.0 - 0.25 * t_ratio))
                worsen_val = base_val * (1.0 + 0.35 * t_ratio)

            elif metric == "pH": # Target Range 6.5 - 8.5
                target = 7.2
                improv_val = base_val + (target - base_val) * (0.4 * t_ratio)
                worsen_val = base_val + (1.2 * t_ratio if base_val >= 7.0 else -1.2 * t_ratio)
                improv_val = max(0.0, min(14.0, improv_val))
                worsen_val = max(0.0, min(14.0, worsen_val))

            elif metric == "Temp": # Temperature
                improv_val = base_val - 0.8 * t_ratio
                worsen_val = base_val + 2.5 * t_ratio

            else:
                improv_val = base_val * (1.0 - 0.15 * t_ratio)
                worsen_val = base_val * (1.0 + 0.20 * t_ratio)

            projections.append({
                "timestamp": ts_str,
                "date": date_str,
                "baseline_value": round(base_val, 2),
                "improvement_value": round(improv_val, 2),
                "worsening_value": round(worsen_val, 2),
                "ci_80_lower": round(ci_80_lower, 2),
                "ci_80_upper": round(ci_80_upper, 2),
                "ci_95_lower": round(ci_95_lower, 2),
                "ci_95_upper": round(ci_95_upper, 2)
            })

        return {
            "location_id": location_id,
            "metric": metric,
            "unit": unit,
            "horizon": horizon_key.upper(),
            "horizon_days": horizon_days,
            "champion_model": champion_name,
            "backtest_metrics": champion_item,
            "leaderboard": leaderboard,
            "projections": projections
        }
